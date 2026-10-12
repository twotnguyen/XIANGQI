import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { Server, type Socket } from "socket.io";
import { io, type Socket as ClientSocket } from "socket.io-client";
import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { createApp } from "../../app.js";
import { SessionService } from "../../account/login/session.service.js";
import { PostgresLoginStore } from "../../account/login/postgres-login-store.js";
import { PostgresMemberRoomAuthorizer } from "../room/member-room-auth.js";
import { RoomTransactions } from "../room/room-transactions.js";
import { apply, databaseUrl, pool, reset } from "../room/room.test-helper.js";
import { AiReservations } from "./ai-reservations.js";
import { AiPresence } from "./ai-presence.js";
import { AiControl } from "./ai-control.js";
import { AiHistoryStore } from "./ai-history-store.js";
import { SqlAiTransactions } from "./ai-sql-transactions.js";
import { AiGames } from "./ai-games.js";
import { AiHttpService } from "./ai-http.service.js";
import { AiModule } from "./ai.module.js";
import type { AiOrigin } from "./ai-transactions.js";
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
const coordinator = new RoomTransactions(pool),
  authorizer = new PostgresMemberRoomAuthorizer(sessions),
  reservations = new AiReservations();
let presence: AiPresence,
  control: AiControl,
  games: AiGames,
  api: Awaited<ReturnType<typeof createApp>>,
  base: string;
let transport: Server,
  transportHttp: ReturnType<typeof createServer>,
  socketBase: string;
const clients: ClientSocket[] = [],
  sockets: Socket[] = [];
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
    "INSERT INTO public.profiles(user_id,username,display_name,completed_at,registration_pending) VALUES($1,$2,'Synthetic AI HTTP member',$3,false)",
    [id, "m" + id.replaceAll("-", "").slice(0, 18), at],
  );
  tokens.set(accessToken, { id, email, email_confirmed_at: at.toISOString() });
  const issued = await sessions.issue(id, false);
  return { id, proof: { accessToken, appSession: issued.appSession } };
}
// Transport is native. Admission identity is supplied by this trusted test fixture, not a production gateway.
async function peer(
  a: Awaited<ReturnType<typeof member>>,
  tabId = randomUUID(),
) {
  const accepted = new Promise<Socket>((resolve) =>
      transport.once("connection", resolve),
    ),
    client = io(socketBase, {
      transports: ["websocket"],
      reconnection: false,
      forceNew: true,
    });
  clients.push(client);
  const socket = await accepted;
  sockets.push(socket);
  const proof = Object.freeze({ ...a.proof }),
    actor = await authorizer.resolve(proof);
  const attached = await coordinator.withRoom(
    { actor, roomIds: [] },
    (p) => authorizer.authorize(proof, p),
    (scope) => presence.attach(scope, { tabId, connectionId: socket.id }),
  );
  if (attached.status !== "active") throw Error("synthetic inactive peer");
  control.bind(
    socket,
    a.id,
    proof.appSession,
    tabId,
    attached.value.control.generation,
  );
  const origin: Extract<AiOrigin, { kind: "human" }> = {
    kind: "human",
    proof,
    tab: {
      tabId,
      connectionId: socket.id,
      generation: attached.value.control.generation,
    },
  };
  return { socket, origin };
}
function request(
  origin: Extract<AiOrigin, { kind: "human" }>,
  path: string,
  body?: unknown,
  headers: Record<string, string> = {},
) {
  return fetch(base + path, {
    method: body === undefined ? "GET" : "POST",
    headers: {
      Origin: "http://localhost:5173",
      Authorization: `Bearer ${origin.proof.accessToken}`,
      "X-Xiangqi-Session": origin.proof.appSession,
      "X-AI-Tab": origin.tab.tabId,
      "X-AI-Connection": origin.tab.connectionId,
      "X-AI-Generation": String(origin.tab.generation),
      "Content-Type": "application/json",
      ...headers,
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}
describe.skipIf(!databaseUrl)(
  "AI native HTTP + fixed member session + PostgreSQL + physical Socket binding",
  () => {
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
      const client = await pool.connect();
      let boot;
      try {
        await client.query("BEGIN; SET LOCAL ROLE app_server");
        boot = await reservations.createBoot(client);
        await client.query("COMMIT");
      } finally {
        await client.query("ROLLBACK");
        client.release();
      }
      presence = new AiPresence(boot.id, reservations);
      control = new AiControl(presence);
      const transactions = new SqlAiTransactions({
        coordinator,
        authorizer,
        reservations,
        history: new AiHistoryStore(reservations),
        bootId: boot.id,
        control,
      });
      // Engine is deliberately controlled; the independent ai-engine tests cover real compiled Worker behavior.
      games = new AiGames({
        engine: {
          ready: async () => {},
          search: async () => new Promise(() => {}),
        },
        transactions,
      });
      await games.ready();
      const service = new AiHttpService({
        games,
        transactions,
        reservations,
        bootId: boot.id,
        control,
      });
      api = await createApp(
        ["http://localhost:5173"],
        [AiModule.forRoot(service)],
      );
      await api.listen(0, "127.0.0.1");
      base = `http://127.0.0.1:${api.getHttpServer().address().port}`;
      transportHttp = createServer();
      transport = new Server(transportHttp, { transports: ["websocket"] });
      await new Promise<void>((resolve) =>
        transportHttp.listen(0, "127.0.0.1", resolve),
      );
      socketBase = `http://127.0.0.1:${(transportHttp.address() as { port: number }).port}`;
    });
    afterEach(async () => {
      for (const client of clients.splice(0)) client.disconnect();
      for (const socket of sockets.splice(0)) socket.disconnect(true);
      await games?.close();
      await api?.close();
      if (transport)
        await new Promise<void>((resolve, reject) =>
          transport.close((error) => (error ? reject(error) : resolve())),
        );
    });
    it("creates canonical RAM and global reservation through native HTTP without a fake active match", async () => {
      const a = await member(),
        p = await peer(a),
        response = await request(p.origin, "/ai", {
          level: "easy",
          requestedSide: "red",
        });
      expect(response.status).toBe(200);
      expect(response.headers.get("cache-control")).toBe("no-store");
      const result = await response.json();
      expect(result.snapshot).toMatchObject({
        actualSide: "red",
        requestedSide: "red",
        status: "ACTIVE",
        version: 1,
        engineState: "IDLE",
      });
      expect(result.control.mode).toBe("controller");
      expect(JSON.stringify(result)).not.toContain(a.id);
      expect(
        (
          await pool.query(
            "SELECT ai_game_id FROM public.active_players WHERE user_id=$1",
            [a.id],
          )
        ).rows[0].ai_game_id,
      ).toBe(result.snapshot.id);
      expect(
        (await pool.query("SELECT count(*) FROM public.matches")).rows[0].count,
      ).toBe("0");
      expect(
        await (
          await request(p.origin, "/ai/current", undefined, {
            "X-AI-Tab": "",
            "X-AI-Connection": "",
            "X-AI-Generation": "",
          })
        ).json(),
      ).toEqual({ gameId: result.snapshot.id });
    });
    it("rejects forged physical connection even with a valid member session before reserving a seat", async () => {
      const a = await member(),
        p = await peer(a);
      const response = await request(
        p.origin,
        "/ai",
        { level: "easy", requestedSide: "red" },
        { "X-AI-Connection": "forged_socket" },
      );
      expect(response.status).toBe(403);
      expect((await response.json()).code).toBe("AI_AUTHORITY_REQUIRED");
      expect(
        (await pool.query("SELECT count(*) FROM public.active_players")).rows[0]
          .count,
      ).toBe("0");
    });
    it("retains read-only old tabs while new physical controller alone can mutate", async () => {
      const a = await member(),
        old = await peer(a),
        created = await (
          await request(old.origin, "/ai", {
            level: "easy",
            requestedSide: "red",
          })
        ).json(),
        newer = await peer(a);
      const prior = await request(old.origin, `/ai/${created.snapshot.id}`);
      expect(prior.status).toBe(200);
      expect((await prior.json()).control.mode).toBe("readonly");
      const rejected = await request(
        old.origin,
        `/ai/${created.snapshot.id}/resign`,
        { version: 1 },
      );
      expect(rejected.status).toBe(409);
      expect((await rejected.json()).code).toBe("TAB_READ_ONLY");
      expect(
        (await request(newer.origin, `/ai/${created.snapshot.id}`)).status,
      ).toBe(200);
    });
    it("surrenders through actual writer, releases slot and keeps terminal state privately readable", async () => {
      const a = await member(),
        p = await peer(a),
        created = await (
          await request(p.origin, "/ai", {
            level: "easy",
            requestedSide: "red",
          })
        ).json();
      const response = await request(
        p.origin,
        `/ai/${created.snapshot.id}/resign`,
        { version: 1 },
      );
      expect(response.status).toBe(200);
      expect((await response.json()).snapshot).toMatchObject({
        status: "FINISHED",
        outcome: { reason: "RESIGN", winner: "black" },
      });
      expect(
        (await pool.query("SELECT count(*) FROM public.active_players")).rows[0]
          .count,
      ).toBe("0");
      expect(
        (
          await pool.query(
            "SELECT status,mode,outcome FROM public.matches WHERE id=$1",
            [created.snapshot.id],
          )
        ).rows[0],
      ).toMatchObject({
        mode: "AI",
        status: "FINISHED",
        outcome: { reason: "RESIGN", winner: "BLACK" },
      });
      expect(
        (await request(p.origin, `/ai/${created.snapshot.id}`)).status,
      ).toBe(200);
      expect(await (await request(p.origin, "/ai/current")).json()).toEqual({
        gameId: null,
      });
    });
    it("does not expose another member's private board even through an authenticated Socket", async () => {
      const a = await member(),
        p = await peer(a),
        created = await (
          await request(p.origin, "/ai", {
            level: "easy",
            requestedSide: "red",
          })
        ).json(),
        b = await member(),
        outsider = await peer(b);
      const response = await request(
        outsider.origin,
        `/ai/${created.snapshot.id}`,
      );
      expect(response.status).toBe(403);
      const value = await response.json();
      expect(value.code).toBe("AI_FORBIDDEN");
      expect(JSON.stringify(value)).not.toContain(created.snapshot.position);
    });
    it("rejects a disconnected Socket immediately even if the SQL disconnect callback has not run", async () => {
      const a = await member(),
        p = await peer(a);
      p.socket.disconnect(true);
      const response = await request(p.origin, "/ai", {
        level: "easy",
        requestedSide: "red",
      });
      expect(response.status).toBe(403);
      expect((await response.json()).code).toBe("AI_AUTHORITY_REQUIRED");
    });
    it("rejects revoked fixed session and does not manufacture a current game", async () => {
      const a = await member(),
        p = await peer(a);
      await sessions.revoke(p.origin.proof.appSession);
      const response = await request(p.origin, "/ai/current");
      expect(response.status).toBe(401);
      expect((await response.json()).code).toBe("AUTH_REQUIRED");
    });
    it("does not publish a board if the native Socket disconnects after SQL retention read", async () => {
      const a = await member(),
        p = await peer(a),
        created = await (
          await request(p.origin, "/ai", {
            level: "easy",
            requestedSide: "red",
          })
        ).json();
      const retained = presence.assertRetained.bind(presence);
      vi.spyOn(presence, "assertRetained").mockImplementationOnce(
        async (scope, id) => {
          await retained(scope, id);
          p.socket.disconnect(true);
        },
      );
      const response = await request(p.origin, `/ai/${created.snapshot.id}`);
      expect(response.status).toBe(403);
      const result = await response.json();
      expect(result.code).toBe("AI_AUTHORITY_REQUIRED");
      expect(JSON.stringify(result)).not.toContain(created.snapshot.position);
    });
  },
);

afterAll(() => pool.end());
