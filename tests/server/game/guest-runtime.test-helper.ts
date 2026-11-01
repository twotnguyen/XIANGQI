import type { AddressInfo } from "node:net";
import type { Pool } from "pg";
import type { RoomSnapshot, CommandAcknowledgement } from "@xiangqi/shared";
import { randomUUID } from "node:crypto";
import { expect } from "vitest";
import { io, type Socket } from "socket.io-client";
import { createApp, drainRealtime } from "@server/app.js";
import { createRoomRuntime } from "@server/game/game.runtime.js";
import { AuthProvidersModule } from "@server/account/auth/registration.module.js";
import { GuestModule } from "@server/account/guest/guest.module.js";
import { createFriendRuntime } from "@server/account/friend/friend.module.js";
import { createHistoryRuntime } from "@server/game/history/history.module.js";
import { createProfileRuntime } from "@server/account/profile/profile.module.js";
import {
  apply,
  env,
  member,
  pool,
  registration,
  waitFor,
} from "./game.runtime.test-helper.js";

export { pool, waitFor };

export interface MemberFixture {
  id: string;
  token: string;
  appSession: string;
}

export interface GuestFixture {
  cap: string;
  userId: string;
  name: string;
}

export interface GuestBoot {
  base: string;
  newMember(): Promise<MemberFixture>;
  open(auth: Record<string, unknown>): Socket;
  close(): Promise<void>;
}

// Migrations after the shared reset() baseline (1-9, 17, 31, 2, 3), in name order. Required
// by room chat/AI reservations, friends/media/viewers, FK/index and privacy grants.
const extraMigrations = [
  "20261011000010_room_chat",
  "20261011000011_ai_reservations",
  "20261011000012_ai_presence",
  "20261011000013_side_swap",
  "20261011000014_friendships",
  "20261011000015_media_share",
  "20261011000016_room_viewers",
  "20261011000017_rls_hardening",
  "20261019000019_principal_foreign_keys",
  "20261019000020_caller_indexes",
  "20261019000021_principal_fk_indexes",
  "20261019053133_idle_in_transaction_timeout",
  "20261019060000_guest_privacy_receipt_redaction",
  "20261029000001_username_account_email",
  "20261030000001_password_recovery",
  "20261101000001_friend_presence_invites",
  "20261102000001_username_management",
  "20261102000004_direct_messages",
  "20261102000005_account_theme",
  "20261103000001_username_otp_delivery",
  "20261103000002_yc1_account_rules",
  "20261103000003_password_reset_grant",
  "20261103000009_yc7_chat_quota",
  "20261103000010_media_generation",
  "20261103000011_yc9_ranked",
];

// Real production boot: Postgres-backed room/guest runtime, Nest HTTP app and
// Socket.IO gateway. Only the provider token verifier is synthetic.
export async function bootGuestRuntime(): Promise<GuestBoot> {
  // reset() does not drop these schemas; migrations 11 and 14 create them unguarded.
  // The idle-timeout migration rejects an already-configured role, so clear it first.
  await pool.query(
    "DROP SCHEMA IF EXISTS xiangqi_social CASCADE; DROP SCHEMA IF EXISTS xiangqi_ai CASCADE; ALTER ROLE postgres RESET idle_in_transaction_session_timeout",
  );
  for (const name of extraMigrations)
    await apply(`supabase/migrations/${name}.sql`);
  const r = registration();
  const runtime = await createRoomRuntime(env, r.context);
  if (!runtime) throw new Error("Missing guest runtime");
  try {
    const modules = {
      ...env,
      FRIENDS_ENABLED: "true",
      PROFILE_ENABLED: "true",
      HISTORY_ENABLED: "true",
    };
    const friends = await createFriendRuntime(
      modules,
      r.context,
      runtime.friendInvites,
    );
    const history = await createHistoryRuntime(modules, r.context);
    const profile = await createProfileRuntime(modules, r.context);
    if (!friends || !history || !profile)
      throw new Error("Missing member runtime");
    const app = await createApp(
      ["http://localhost:5173"],
      [
        AuthProvidersModule.forRoot({ google: false, guest: true }),
        GuestModule.forRoot(runtime.guests, false),
        runtime.module,
        friends.module,
        history.module,
        profile.module,
      ],
      null,
      runtime.realtime,
      runtime.publicFeed,
    );
    try {
      await app.listen(0, "127.0.0.1");
      await runtime.start();
      const base = `http://127.0.0.1:${(app.getHttpServer().address() as AddressInfo).port}`;
      const sockets: Socket[] = [];
      return {
        base,
        newMember: () => member(r),
        open(auth) {
          const socket = io(base, {
            transports: ["websocket"],
            reconnection: false,
            autoConnect: false,
            extraHeaders: { Origin: "http://localhost:5173" },
            auth,
          });
          sockets.push(socket);
          return socket;
        },
        async close() {
          for (const socket of sockets) socket.disconnect();
          await runtime.stop();
          await drainRealtime(app);
          await runtime.close();
          await app.close();
        },
      };
    } catch (error) {
      // Failed boot after app creation: release the app, then the runtime lock.
      await drainRealtime(app).catch(() => undefined);
      await app.close().catch(() => undefined);
      throw error;
    }
  } catch (error) {
    await runtime.stop().catch(() => undefined);
    await runtime.close().catch(() => undefined);
    throw error;
  }
}

export function memberHeaders(m: MemberFixture) {
  return {
    "Content-Type": "application/json",
    Authorization: "Bearer " + m.token,
    "X-Xiangqi-Session": m.appSession,
  };
}

export function guestHeaders(cap: string) {
  return {
    "Content-Type": "application/json",
    Authorization: "Guest " + cap,
  };
}

export function memberCall(
  boot: GuestBoot,
  m: MemberFixture,
  method: "GET" | "POST",
  path: string,
  body?: object,
) {
  return fetch(boot.base + path, {
    method,
    headers: memberHeaders(m),
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

export function guestCall(
  boot: GuestBoot,
  cap: string,
  method: "GET" | "POST",
  path: string,
  body?: object,
) {
  return fetch(boot.base + path, {
    method,
    headers: guestHeaders(cap),
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

interface GuestSessionBody {
  capability: string;
  userId: string;
}

function isGuestSessionBody(value: unknown): value is GuestSessionBody {
  return (
    typeof value === "object" &&
    value !== null &&
    "capability" in value &&
    typeof value.capability === "string" &&
    "userId" in value &&
    typeof value.userId === "string"
  );
}

// Creates a guest through the public account endpoint, then reads the
// capability back through the HttpOnly-cookie session endpoint.
export async function createGuest(
  boot: GuestBoot,
  name: string,
): Promise<GuestFixture> {
  const created = await fetch(boot.base + "/account/guest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ displayName: name }),
  });
  expect(created.status).toBe(200);
  const match = /xiangqi_guest=([^;]+)/.exec(
    created.headers.get("set-cookie") ?? "",
  );
  if (!match) throw new Error("Missing guest cookie");
  const session = await fetch(boot.base + "/account/guest/session", {
    headers: { Cookie: `xiangqi_guest=${match[1]}` },
  });
  expect(session.status).toBe(200);
  const body: unknown = await session.json();
  if (!isGuestSessionBody(body)) throw new Error("Malformed guest session");
  return { cap: body.capability, userId: body.userId, name };
}

export async function connect(socket: Socket): Promise<void> {
  const { promise, resolve, reject } = Promise.withResolvers<void>();
  socket.once("connect", () => resolve());
  socket.once("connect_error", reject);
  socket.connect();
  await promise;
}

export async function ackOk<T>(
  socket: Socket,
  event: string,
  input: object,
): Promise<T> {
  const { promise, resolve, reject } = Promise.withResolvers<T>();
  socket
    .timeout(5000)
    .emit(event, input, (error: Error | null, ack: unknown) => {
      if (error) return reject(error);
      if (
        typeof ack === "object" &&
        ack !== null &&
        "status" in ack &&
        ack.status === "ok" &&
        "value" in ack
      )
        return resolve(ack.value as T);
      reject(new Error("Socket ack rejected"));
    });
  return promise;
}

// Tracks the latest authoritative room snapshot delivered to a socket.
export function observe(socket: Socket): () => RoomSnapshot | undefined {
  let latest: RoomSnapshot | undefined;
  socket.on("room.snapshot", (value: RoomSnapshot) => (latest = value));
  return () => latest;
}

export function command(
  socket: Socket,
  roomId: string,
  version: number,
  action: object,
): Promise<CommandAcknowledgement> {
  const { promise, resolve } = Promise.withResolvers<CommandAcknowledgement>();
  socket.emit(
    "room.command",
    { commandId: randomUUID(), roomId, expectedVersion: version, action },
    resolve,
  );
  return promise;
}

// Moves a guest's active session into a DB-controlled expired state. The
// schema CHECK requires expires_at = created_at + 12h; no trigger is bypassed.
export async function expireGuest(guestId: string): Promise<void> {
  await pool.query(
    "WITH t AS(SELECT clock_timestamp() at) UPDATE xiangqi_auth.guest_sessions SET created_at=at-interval '13 hours',expires_at=at-interval '1 hour' FROM t WHERE guest_id=$1 AND ended_at IS NULL",
    [guestId],
  );
}

// Counts rows whose serialized content still contains a private guest name
// across every room/chat/realtime/profile table a guest can touch.
export async function privateNameLeaks(
  name: string,
  db: Pool = pool,
): Promise<number> {
  const tables = [
    "public.profiles",
    "public.rooms",
    "public.room_members",
    "public.matches",
    "public.match_events",
    "public.match_moves",
    "xiangqi_chat.messages",
    "xiangqi_chat.receipts",
    "xiangqi_chat.outbox",
    "xiangqi_realtime.receipts",
    "xiangqi_room.outbox",
    "xiangqi_room.entry_receipts",
  ];
  let leaks = 0;
  for (const table of tables) {
    const row = (
      await db.query<{ n: number }>(
        `SELECT count(*)::int n FROM ${table} t WHERE to_jsonb(t)::text LIKE '%' || $1 || '%'`,
        [name],
      )
    ).rows[0];
    leaks += row?.n ?? 0;
  }
  return leaks;
}

export interface SeatRow {
  role: string;
  side: string | null;
}

export async function seatOf(
  roomId: string,
  userId: string,
): Promise<SeatRow | undefined> {
  return (
    await pool.query<SeatRow>(
      "SELECT role,side FROM public.room_members WHERE room_id=$1 AND user_id=$2",
      [roomId, userId],
    )
  ).rows[0];
}

export interface MatchRow {
  status: string;
  winner: string | null;
}

export async function matchOf(roomId: string): Promise<MatchRow | undefined> {
  return (
    await pool.query<MatchRow>(
      "SELECT m.status,m.outcome->>'winner' AS winner FROM public.matches m WHERE m.room_id=$1 ORDER BY m.created_at DESC LIMIT 1",
      [roomId],
    )
  ).rows[0];
}
