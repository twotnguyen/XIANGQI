import { randomUUID } from "node:crypto";
import { io, type Socket as ClientSocket } from "socket.io-client";
import type { EngineResult } from "@xiangqi/engine";
import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { createApp } from "@server/app.js";
import { SessionService } from "@server/account/login/session.service.js";
import { PostgresLoginStore } from "@server/account/login/postgres-login-store.js";
import { apply, databaseUrl, pool, reset } from "../room/room.test-helper.js";
import type { AiOrigin } from "@server/game/ai/ai-transactions.js";
import { createAiRuntime, type AiRuntime } from "@server/game/ai/ai-runtime.js";
const tokens = new Map<
  string,
  { id: string; email: string; email_confirmed_at: string }
>();
const sessions = new SessionService(new PostgresLoginStore(pool), {
  signInPassword: vi.fn(),
  getUser: async (token) => {
    const user = tokens.get(token);
    if (!user) throw Error("synthetic invalid provider token");
    return user;
  },
});
const clients: ClientSocket[] = [];
async function member() {
  const id = randomUUID(),
    email = id + "@example.invalid",
    at = new Date(),
    accessToken = randomUUID();
  await pool.query(
    "INSERT INTO auth.users(id,email,email_confirmed_at) VALUES($1,$2,$3)",
    [id, email, at],
  );
  await pool.query(
    "INSERT INTO public.profiles(user_id,username,display_name,completed_at,registration_pending) VALUES($1,$2,'Synthetic AI socket member',$3,false)",
    [id, "m" + id.replaceAll("-", "").slice(0, 18), at],
  );
  tokens.set(accessToken, { id, email, email_confirmed_at: at.toISOString() });
  const issued = await sessions.issue(id, false);
  return { id, proof: { accessToken, appSession: issued.appSession } };
}
describe.skipIf(!databaseUrl)(
  "AI factory socket close releases connected presence",
  () => {
    const origin = "http://localhost:5173";
    let base = "";
    let runtime: AiRuntime | undefined;
    let runtimeApi: Awaited<ReturnType<typeof createApp>> | undefined;
    function current(): AiRuntime {
      if (!runtime) throw Error("AI runtime not built");
      return runtime;
    }
    function request(
      p: Extract<AiOrigin, { kind: "human" }>,
      path: string,
      body?: unknown,
    ) {
      return fetch(base + path, {
        method: body === undefined ? "GET" : "POST",
        headers: {
          Origin: origin,
          Authorization: `Bearer ${p.proof.accessToken}`,
          "X-Xiangqi-Session": p.proof.appSession,
          "X-AI-Tab": p.tab.tabId,
          "X-AI-Connection": p.tab.connectionId,
          "X-AI-Generation": String(p.tab.generation),
          "Content-Type": "application/json",
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
    }
    async function live(
      a: Awaited<ReturnType<typeof member>>,
      tabId = randomUUID(),
    ) {
      const client = io(base + "/ai", {
        path: "/ai/socket.io",
        transports: ["websocket"],
        extraHeaders: { Origin: origin },
        auth: {
          accessToken: a.proof.accessToken,
          appSession: a.proof.appSession,
          tabId,
        },
        reconnection: false,
        forceNew: true,
      });
      clients.push(client);
      const control = await new Promise<{
        connectionId: string;
        generation: number;
      }>((resolve, reject) => {
        client.once("ai.control", resolve);
        client.once("connect_error", reject);
      });
      return {
        client,
        origin: {
          kind: "human" as const,
          proof: { ...a.proof },
          tab: {
            tabId,
            connectionId: control.connectionId,
            generation: control.generation,
          },
        },
      };
    }
    // Real socket close is asynchronous on the server; poll the DB row instead of guessing a fixed delay.
    async function untilTrue(check: () => Promise<boolean>) {
      const deadline = Date.now() + 5_000;
      while (!(await check())) {
        if (Date.now() > deadline) throw Error("AI condition not reached");
        await new Promise((resolve) => setTimeout(resolve, 25));
      }
    }
    async function presenceOf(ownerId: string) {
      const row = await pool.query<{
        game_id: string;
        connected: boolean;
        connection_id: string;
        disconnected_at: Date | null;
      }>(
        "SELECT game_id, connected, connection_id, disconnected_at FROM xiangqi_ai.presence WHERE owner_id=$1",
        [ownerId],
      );
      return row.rows[0];
    }
    async function heldGames() {
      const row = await pool.query<{ n: number }>(
        "SELECT count(*)::int AS n FROM public.active_players WHERE ai_game_id IS NOT NULL",
      );
      return row.rows[0]?.n;
    }
    async function createGame(p: Awaited<ReturnType<typeof live>>) {
      const response = await request(p.origin, "/ai", {
        level: "easy",
        requestedSide: "red",
      });
      expect(response.status).toBe(200);
      return (await response.json()) as { snapshot: { id: string } };
    }
    function watch(client: ClientSocket, gameId: string) {
      return new Promise<{ ok: boolean }>((resolve) =>
        client.emit("ai.watch", { gameId }, resolve),
      );
    }

    beforeEach(async () => {
      tokens.clear();
      await pool.query(
        "DROP SCHEMA IF EXISTS xiangqi_ai CASCADE; DROP SCHEMA IF EXISTS xiangqi_chat CASCADE",
      );
      await reset();
      for (const suffix of [
        "06_rooms",
        "07_match_outcomes",
        "08_room_modes",
        "09_match_draw",
        "10_room_chat",
        "11_ai_reservations",
        "12_ai_presence",
      ])
        await apply(`supabase/migrations/202610110000${suffix}.sql`);
      const built = await createAiRuntime({
        env: { ROOMS_ENABLED: "true", CORS_ORIGINS: origin },
        registration: { pool, sessions },
        // Engine is deliberately controlled; search never resolves so games stay ACTIVE.
        engine: {
          ready: vi.fn(async () => {}),
          search: vi.fn(() => new Promise<EngineResult>(() => {})),
          close: vi.fn(async () => {}),
        },
      });
      if (!built) throw Error("AI runtime disabled for test env");
      runtime = built;
      runtimeApi = await createApp([origin], [built.module]);
      built.attach(runtimeApi.getHttpServer());
      await runtimeApi.listen(0, "127.0.0.1");
      await current().start();
      base = `http://127.0.0.1:${runtimeApi.getHttpServer().address().port}`;
    });
    afterEach(async () => {
      for (const client of clients.splice(0)) client.disconnect();
      await runtime?.close();
      await runtimeApi?.close();
      runtime = undefined;
      runtimeApi = undefined;
    });
    afterAll(() => pool.end());

    it("parks connected presence in grace when the socket closes before any watch", async () => {
      const a = await member(),
        c = await live(a),
        created = await createGame(c);
      c.client.disconnect();
      await untilTrue(async () =>
        presenceOf(a.id).then((row) => row?.connected === false),
      );
      const row = await presenceOf(a.id);
      expect(row?.game_id).toBe(created.snapshot.id);
      expect(row?.disconnected_at).not.toBeNull();
      expect(await heldGames()).toBe(1);
    });

    it("parks the current game after a watched game was resigned and replaced", async () => {
      const a = await member(),
        c = await live(a),
        first = await createGame(c);
      expect(await watch(c.client, first.snapshot.id)).toMatchObject({
        ok: true,
      });
      expect(
        (
          await request(c.origin, `/ai/${first.snapshot.id}/resign`, {
            version: 1,
          })
        ).status,
      ).toBe(200);
      const second = await createGame(c);
      c.client.disconnect();
      await untilTrue(async () =>
        presenceOf(a.id).then((row) => row?.connected === false),
      );
      expect(await presenceOf(a.id)).toMatchObject({
        game_id: second.snapshot.id,
        connected: false,
      });
    });

    it("expires the parked game through the runtime sweep after grace", async () => {
      const a = await member(),
        c = await live(a);
      await createGame(c);
      c.client.disconnect();
      await untilTrue(async () =>
        presenceOf(a.id).then((row) => row?.connected === false),
      );
      await pool.query(
        "UPDATE xiangqi_ai.presence SET disconnected_at=clock_timestamp()-interval '30 minutes' WHERE owner_id=$1",
        [a.id],
      );
      await untilTrue(async () => (await heldGames()) === 0);
    }, 10_000);
  },
);
