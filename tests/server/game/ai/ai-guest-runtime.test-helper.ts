import type { AddressInfo } from "node:net";
import { randomUUID } from "node:crypto";
import { vi } from "vitest";
import { io, type Socket as ClientSocket } from "socket.io-client";
import type { EngineResult } from "@xiangqi/engine";
import { createApp, drainRealtime } from "@server/app.js";
import { createRoomRuntime } from "@server/game/game.runtime.js";
import { createAiRuntime } from "@server/game/ai/ai-runtime.js";
import { AuthProvidersModule } from "@server/account/auth/registration.module.js";
import { GuestModule } from "@server/account/guest/guest.module.js";
import {
  apply,
  databaseUrl,
  env,
  member,
  pool,
  registration,
  reset,
} from "../game.runtime.test-helper.js";
import {
  createGuest,
  guestCall,
  type GuestBoot,
  type GuestFixture,
  type MemberFixture,
} from "../guest-runtime.test-helper.js";

export { databaseUrl, pool };

export const AI_ORIGIN = "http://localhost:5173";

/** Drops AI-owned schemas (not dropped by the shared reset) and rebuilds the schema with AI tables. */
export async function resetAiGuestDatabase(): Promise<void> {
  if (!databaseUrl) throw new Error("ROOM_RUNTIME_TEST_DATABASE_URL required");
  await pool.query(
    "DROP SCHEMA IF EXISTS xiangqi_ai CASCADE; DROP SCHEMA IF EXISTS xiangqi_chat CASCADE",
  );
  await reset();
  for (const migration of [
    "20261011000008_room_modes",
    "20261011000009_match_draw",
    "20261011000010_room_chat",
    "20261011000011_ai_reservations",
    "20261011000012_ai_presence",
    "20261019060000_guest_privacy_receipt_redaction",
  ])
    await apply(`supabase/migrations/${migration}.sql`);
}

export interface AiTab {
  client: ClientSocket;
  guest: GuestFixture;
  tabId: string;
  connectionId: string;
  generation: number;
}

export interface AiGuestBoot extends GuestBoot {
  origin: string;
  /** Opens an AI socket as the guest and resolves once the server grants control. */
  openTab(guest: GuestFixture, tabId?: string): Promise<AiTab>;
  /** Attempts an AI socket handshake with arbitrary auth; resolves with the connect error or null. */
  handshake(auth: Record<string, unknown>): Promise<unknown>;
}

// Real production boot: Postgres room runtime + AI runtime + guest service, composed
// the same way as the server root. Only the provider token verifier is synthetic.
export async function bootAiGuestRuntime(): Promise<AiGuestBoot> {
  const r = registration();
  const rooms = await createRoomRuntime(env, r.context);
  if (!rooms) throw new Error("Missing room runtime");
  const ai = await createAiRuntime({
    env: { ...env, ROOMS_ENABLED: "true", CORS_ORIGINS: AI_ORIGIN },
    registration: { pool, sessions: r.sessions },
    authorizer: rooms.authorizer,
    guests: rooms.guests,
    withScope: rooms.withScope,
    // Engine never resolves: games stay ACTIVE and the test controls every transition.
    engine: {
      ready: vi.fn(async () => {}),
      search: vi.fn(() => new Promise<EngineResult>(() => {})),
      close: vi.fn(async () => {}),
    },
  });
  if (!ai) throw new Error("AI runtime disabled for test env");
  rooms.attachAiTermination(ai.sessionTermination);
  const app = await createApp(
    [AI_ORIGIN],
    [
      AuthProvidersModule.forRoot({ google: false, guest: true }),
      GuestModule.forRoot(rooms.guests, false),
      rooms.module,
      ai.module,
    ],
    null,
    rooms.realtime,
    rooms.publicFeed,
  );
  const sockets: ClientSocket[] = [];
  try {
    ai.attach(app.getHttpServer());
    await app.listen(0, "127.0.0.1");
    await rooms.start();
    await ai.start();
  } catch (error) {
    await drainRealtime(app).catch(() => undefined);
    await app.close().catch(() => undefined);
    throw error;
  }
  const base = `http://127.0.0.1:${(app.getHttpServer().address() as AddressInfo).port}`;
  function socketFor(auth: Record<string, unknown>) {
    const client = io(base + "/ai", {
      path: "/ai/socket.io",
      transports: ["websocket"],
      extraHeaders: { Origin: AI_ORIGIN },
      auth,
      reconnection: false,
      forceNew: true,
    });
    sockets.push(client);
    return client;
  }
  return {
    base,
    origin: AI_ORIGIN,
    newMember: async () => {
      const m = await member(r);
      return m as MemberFixture;
    },
    open(auth) {
      const socket = io(base, {
        transports: ["websocket"],
        reconnection: false,
        autoConnect: false,
        auth,
      });
      sockets.push(socket);
      return socket;
    },
    async openTab(guest, tabId = randomUUID()) {
      const client = socketFor({ guestCapability: guest.cap, tabId });
      const { promise, resolve, reject } = Promise.withResolvers<{
        connectionId: string;
        generation: number;
      }>();
      client.once("ai.control", resolve);
      client.once("connect_error", reject);
      const control = await promise;
      return {
        client,
        guest,
        tabId,
        connectionId: control.connectionId,
        generation: control.generation,
      };
    },
    handshake(auth) {
      const client = socketFor(auth);
      const { promise, resolve } = Promise.withResolvers<unknown>();
      client.once("connect", () => resolve(null));
      client.once("connect_error", (error) => resolve(error));
      return promise;
    },
    async close() {
      for (const socket of sockets.splice(0)) socket.disconnect();
      await ai.close();
      await rooms.stop();
      await drainRealtime(app);
      await rooms.close();
      await app.close();
    },
  };
}

/** HTTP call to /ai with an explicit Authorization header (guest or otherwise) and optional tab. */
export function aiRequest(
  boot: AiGuestBoot,
  authorization: string,
  tab: Pick<AiTab, "tabId" | "connectionId" | "generation"> | undefined,
  method: "GET" | "POST",
  path: string,
  body?: unknown,
) {
  const headers: Record<string, string> = {
    Origin: AI_ORIGIN,
    Authorization: authorization,
    "Content-Type": "application/json",
  };
  if (tab) {
    headers["X-AI-Tab"] = tab.tabId;
    headers["X-AI-Connection"] = tab.connectionId;
    headers["X-AI-Generation"] = String(tab.generation);
  }
  return fetch(boot.base + path, {
    method,
    headers,
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

/** Authenticated guest call to /ai using the guest's capability and the given tab. */
export function guestAi(
  boot: AiGuestBoot,
  tab: AiTab,
  method: "GET" | "POST",
  path: string,
  body?: unknown,
) {
  return aiRequest(boot, "Guest " + tab.guest.cap, tab, method, path, body);
}

export async function createGuestAiGame(
  boot: AiGuestBoot,
  tab: AiTab,
  requestedSide: "red" | "black" = "red",
): Promise<string> {
  const response = await guestAi(boot, tab, "POST", "/ai", {
    level: "easy",
    requestedSide,
  });
  if (response.status !== 200)
    throw new Error("AI create failed: " + response.status);
  const body = (await response.json()) as { snapshot: { id: string } };
  return body.snapshot.id;
}

export { createGuest, guestCall, type GuestFixture };

export async function countRows(
  table: string,
  where = "TRUE",
): Promise<number> {
  const row = await pool.query<{ n: number }>(
    `SELECT count(*)::int AS n FROM ${table} WHERE ${where}`,
  );
  return row.rows[0]?.n ?? 0;
}

/** Rows that a guest's AI game must never create in member history tables. */
export async function historyRowCount(): Promise<number> {
  const [matches, moves, events] = await Promise.all([
    countRows("public.matches"),
    countRows("public.match_moves"),
    countRows("public.match_events"),
  ]);
  return matches + moves + events;
}

export async function heldAiSeats(userId: string): Promise<number> {
  return countRows(
    "public.active_players",
    `user_id='${userId}'::uuid AND ai_game_id IS NOT NULL`,
  );
}
