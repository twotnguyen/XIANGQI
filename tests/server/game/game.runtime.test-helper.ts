import type { RoomControlProof } from "@xiangqi/shared";
import { applySql } from "../fixtures/apply-sql.test-helper.js";
import { Pool } from "pg";
import { randomUUID } from "node:crypto";
import { vi } from "vitest";
import type { createRegistrationRuntime } from "@server/account/auth/registration.module.js";
import { SessionService } from "@server/account/login/session.service.js";
import {
  createLoginPool,
  PostgresLoginStore,
} from "@server/account/login/postgres-login-store.js";
import { createRoomWiring } from "@server/game/room/room-wiring.js";
import { RoomHttpService } from "@server/game/room/room-http.service.js";
import { PostgresMemberRoomAuthorizer } from "@server/game/room/member-room-auth.js";
import { RoomSessionAuthorizer } from "@server/game/room/room-session.js";
import { GuestRoomAuthorizer } from "@server/game/room/guest-room-auth.js";
import { GuestService } from "@server/account/guest/guest.service.js";
import { GuestStore } from "@server/account/guest/guest.store.js";
import { ClockService } from "@server/game/clock/clock.service.js";
export const databaseUrl = process.env.ROOM_RUNTIME_TEST_DATABASE_URL;
if (databaseUrl) {
  const u = new URL(databaseUrl);
  if (
    u.hostname !== "127.0.0.1" ||
    u.port !== "55452" ||
    u.pathname !== "/xiangqi_room_runtime_test" ||
    u.search ||
    u.hash
  )
    throw new Error(
      "Room runtime tests require dedicated synthetic 127.0.0.1:55452/xiangqi_room_runtime_test",
    );
}
export const pool = new Pool({ connectionString: databaseUrl });
export const loginPool = createLoginPool({ connectionString: databaseUrl });
const env = { ROOMS_ENABLED: "true", AUTH_LOGIN_ENABLED: "true" };
type Registration = NonNullable<
  Awaited<ReturnType<typeof createRegistrationRuntime>>
>;
function registration() {
  const users = new Map<
    string,
    { id: string; email: string; email_confirmed_at: string }
  >();
  const auth = {
    signInPassword: vi.fn(),
    verifyAccessToken: vi.fn(async (token: string) => {
      const user = users.get(token);
      if (!user) throw new Error("synthetic invalid bearer");
      return { userId: user.id, email: user.email };
    }),
  };
  const sessions = new SessionService(new PostgresLoginStore(loginPool), auth);
  return {
    users,
    auth,
    sessions,
    context: { pool, sessions, auth } as unknown as Registration,
  };
}
async function member(
  r: ReturnType<typeof registration>,
  usernameOnly = false,
) {
  const id = randomUUID(),
    email = usernameOnly
      ? `${id}@username.xiangqi.invalid`
      : `synthetic-${id}@example.invalid`,
    at = new Date();
  await pool.query(
    "INSERT INTO auth.users(id,email,email_confirmed_at) VALUES($1,$2,$3)",
    [id, email, at],
  );
  await pool.query(
    "INSERT INTO public.profiles(user_id,username,display_name,completed_at,registration_pending) VALUES($1,$2,'Synthetic Runtime',$3,false)",
    [id, "m" + id.replaceAll("-", "").slice(0, 18), at],
  );
  const token = "synthetic-" + id;
  r.users.set(token, { id, email, email_confirmed_at: at.toISOString() });
  const issued = await r.sessions.issue(id, false);
  return { id, token, appSession: issued.appSession };
}
async function waitFor<T>(
  read: () => Promise<T>,
  accept: (value: T) => boolean,
  timeout = 7000,
) {
  const until = Date.now() + timeout;
  while (Date.now() < until) {
    const value = await read();
    if (accept(value)) return value;
    await new Promise((r) => setTimeout(r, 25));
  }
  throw new Error("Synthetic runtime wait timed out");
}
async function oldRoom(
  r: ReturnType<typeof registration>,
  playing = false,
  usernameOnly = false,
  startedAt = new Date(),
) {
  const a = await member(r, usernameOnly),
    b = await member(r),
    wiring = createRoomWiring(pool, new ClockService()),
    rooms = wiring.rooms,
    coordinator = wiring.coordinator,
    authorizer = new RoomSessionAuthorizer(
      new PostgresMemberRoomAuthorizer(r.sessions),
      new GuestRoomAuthorizer(new GuestService(new GuestStore(pool)), pool),
    );
  const service = new RoomHttpService(rooms, coordinator, authorizer),
    proof = (m: typeof a) => ({
      accessToken: m.token,
      appSession: m.appSession,
    });
  const entry = await service.create(proof(a), {
    commandId: randomUUID(),
    timeMinutes: 5,
  });
  await service.join(proof(b), {
    commandId: randomUUID(),
    code: entry.inviteCode!,
    preference: "play",
  });
  let matchId: string | null = null;
  await coordinator.withRoom(
    { actor: { userId: a.id, kind: "member" }, roomIds: [entry.roomId] },
    async (p) => ({ status: "active", actor: p.actor }),
    async (scope) => {
      for (const m of [a, b])
        await rooms.presence(
          scope.actor.userId === m.id
            ? scope
            : { ...scope, actor: { userId: m.id, kind: "member" } },
          entry.roomId,
          {
            connectionId: randomUUID(),
            generation: 1,
            serverInstance: randomUUID(),
          },
          true,
        );
      await scope.client.query(
        "UPDATE public.room_members SET ready=true WHERE room_id=$1",
        [entry.roomId],
      );
      const token = randomUUID(),
        at = startedAt;
      await scope.client.query(
        "INSERT INTO xiangqi_room.countdowns(room_id,token,due_at,red_id,black_id) VALUES($1,$2,$3,$4,$5)",
        [entry.roomId, token, at, a.id, b.id],
      );
      if (playing) {
        const match = wiring.matches,
          created = await match.start(scope.client, {
            roomId: entry.roomId,
            startToken: token,
            redId: a.id,
            blackId: b.id,
            timeControlSeconds: 300,
            startedAt: at,
          });
        matchId = created.matchId;
        await scope.client.query(
          "UPDATE public.rooms SET status='PLAYING',current_match_id=$2 WHERE id=$1",
          [entry.roomId, matchId],
        );
        await scope.client.query(
          "UPDATE public.active_players SET match_id=$2 WHERE room_id=$1",
          [entry.roomId, matchId],
        );
      }
    },
  );
  return { a, b, roomId: entry.roomId, matchId };
}
export async function apply(file: string) {
  await applySql(pool, file);
}
async function resetSchemas(files: string[]) {
  if (!databaseUrl) throw new Error("Dedicated test URL required");
  await pool.query(
    "DROP SCHEMA IF EXISTS xiangqi_chat CASCADE; DROP SCHEMA IF EXISTS xiangqi_room CASCADE; DROP SCHEMA IF EXISTS xiangqi_realtime CASCADE; DROP SCHEMA IF EXISTS xiangqi_ai CASCADE; DROP SCHEMA IF EXISTS xiangqi_auth CASCADE; DROP SCHEMA IF EXISTS public CASCADE; DROP SCHEMA IF EXISTS auth CASCADE; CREATE SCHEMA public",
  );
  await apply("tests/server/fixtures/managed-auth.test-fixture.sql");
  await pool.query(
    "ALTER SCHEMA public OWNER TO postgres; GRANT app_server TO postgres WITH SET TRUE; CREATE TABLE auth.identities(id uuid PRIMARY KEY,user_id uuid REFERENCES auth.users(id),provider text NOT NULL,provider_id text NOT NULL,identity_data jsonb DEFAULT '{}',UNIQUE(provider,provider_id)); ALTER TABLE auth.identities OWNER TO supabase_auth_admin; GRANT SELECT,TRIGGER,REFERENCES ON auth.identities TO postgres",
  );
  await apply("supabase/baseline/20260913_legacy_public.sql");
  for (const file of files) await apply(`supabase/migrations/${file}.sql`);
}
// Legacy baseline (1-7 + 17/31 + 2): used only to prove discovery is absent before migration 8.
export async function resetLegacy() {
  await resetSchemas([
    "20261011000001_email_registration",
    "20261011000002_realtime",
    "20261011000003_username_login",
    "20261011000004_legacy_moves_security",
    "20261011000005_google_guest",
    "20261011000006_rooms",
    "20261011000007_match_outcomes",
    "20261017000018_room_code_digits",
    "20261031000001_session_devices",
    "20261102000002_custom_rematch",
    "20261103000004_room_issued_codes",
  ]);
}
// Full current schema (1-9 + 2 + 3) in order: 8 must precede 3 because 3 replaces guard_settings from 6.
export async function reset() {
  await resetSchemas([
    "20261011000001_email_registration",
    "20261011000002_realtime",
    "20261011000003_username_login",
    "20261011000004_legacy_moves_security",
    "20261011000005_google_guest",
    "20261011000006_rooms",
    "20261011000007_match_outcomes",
    "20261011000008_room_modes",
    "20261011000009_match_draw",
    "20261017000018_room_code_digits",
    "20261031000001_session_devices",
    "20261102000002_custom_rematch",
    "20261103000004_room_issued_codes",
    "20261102000003_unlimited_inactivity",
    "20261103000005_match_aborted",
    "20261103000006_online_undo",
    "20261103000007_match_simultaneous_disconnect",
  ]);
}

export { env, member, oldRoom, registration, waitFor };

/** Reads authority established by the real room socket; never seeds or bypasses the controller gate. */
export async function roomControl(socket: {
  id?: string;
  connected: boolean;
}): Promise<RoomControlProof> {
  if (!socket.connected || !socket.id)
    throw new Error("Fixture must connect its controlling room socket first");
  const { rows } = await pool.query<{
    tabId: string;
    connectionId: string;
    generation: number;
  }>(
    'SELECT c.tab_id AS "tabId",c.connection_id AS "connectionId",c.generation FROM xiangqi_realtime.controllers c JOIN xiangqi_room.presence p ON p.room_id=c.room_id AND p.user_id=c.user_id WHERE c.connection_id=$1 AND p.connection_id=c.connection_id AND p.connected',
    [socket.id],
  );
  if (rows.length !== 1)
    throw new Error(
      "Fixture needs exactly one active room controller for this socket",
    );
  return rows[0]!;
}
