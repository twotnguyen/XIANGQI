import { createHash, randomUUID } from "node:crypto";
import { createServer } from "node:http";
import type { PoolClient } from "pg";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { io as socketClient, type Socket } from "socket.io-client";
import type {
  CommandAcknowledgement,
  RoomCommand,
  RoomSnapshot,
} from "@xiangqi/shared";
import { ClockService } from "../clock/clock-service.js";
import { MatchStore } from "../match/match-store.js";
import { apply, databaseUrl, pool, reset } from "../match/match.test-helper.js";
import { PostgresLoginStore } from "../login/postgres-login-store.js";
import { SessionService } from "../login/session.service.js";
import { RoomStore } from "../room/room-store.js";
import { RoomTransactions } from "../room/room-transactions.js";
import type { RoomScope } from "../room/contracts.js";
import { PostgresMemberRoomAuthorizer } from "../room/member-room-auth.js";
import { RoomHttpService } from "../room/room-http.service.js";
import {
  MemberRealtimeIdentities,
  MemberRealtimeTransactions,
} from "./member-transactions.js";
import { GameRooms } from "./game-rooms.js";
import { RealtimeStore } from "./store.js";
import type { RealtimeConnection } from "./contracts.js";
import { attachRealtime } from "./gateway.js";
import { parseCommand } from "./protocol.js";

async function fixture() {
  const users = new Map<
    string,
    { id: string; email: string; email_confirmed_at: string }
  >();
  // Synthetic provider boundary ONLY; all application auth/session/room/match SQL is real.
  const provider = {
    signInPassword: vi.fn(),
    getUser: vi.fn(async (token: string) => {
      const user = users.get(token);
      if (!user) throw new Error("Synthetic unauthorized");
      return user;
    }),
  };
  const sessions = new SessionService(new PostgresLoginStore(pool), provider),
    authorizer = new PostgresMemberRoomAuthorizer(sessions),
    coordinator = new RoomTransactions(pool);
  const identities = new MemberRealtimeIdentities(authorizer),
    transactions = new MemberRealtimeTransactions(coordinator, authorizer),
    clock = new ClockService(),
    scopes = new WeakMap<PoolClient, RoomScope>();
  const matches = new MatchStore(clock, {
    onMatchEnded: async (client, input) => {
      const scope = scopes.get(client);
      if (!scope) throw new Error("Missing verified fixture scope");
      await rooms.onMatchEnded(scope, input);
    },
  });
  const rooms = new RoomStore(matches);
  const game = new GameRooms(rooms, matches, clock, (client, identity, id) => {
    const s = transactions.getScope(client, identity, id);
    scopes.set(client, s);
    return s;
  });
  const rt = new RealtimeStore(pool, game, transactions),
    http = new RoomHttpService(rooms, coordinator, authorizer);
  async function member() {
    const id = randomUUID(),
      email = `synthetic-${id}@example.invalid`,
      at = new Date();
    await pool.query(
      "INSERT INTO auth.users(id,email,email_confirmed_at) VALUES($1,$2,$3)",
      [id, email, at],
    );
    await pool.query(
      "INSERT INTO public.profiles(user_id,username,display_name,completed_at,registration_pending) VALUES($1,$2,'Synthetic Member',$3,false)",
      [id, "m" + id.replaceAll("-", "").slice(0, 18), at],
    );
    const token = "synthetic-bearer-" + id;
    users.set(token, { id, email, email_confirmed_at: at.toISOString() });
    const issued = await sessions.issue(id, false),
      proof = { accessToken: token, appSession: issued.appSession };
    const identity = await identities.resolve(token, issued.appSession, proof);
    return { id, proof, identity };
  }
  const red = await member(),
    black = await member(),
    viewer = await member(),
    outsider = await member();
  const entry = await http.create(red.proof, {
    commandId: randomUUID(),
    name: "Synthetic integration",
  });
  await http.join(black.proof, {
    commandId: randomUUID(),
    code: entry.inviteCode!,
    preference: "play",
  });
  await http.join(viewer.proof, {
    commandId: randomUUID(),
    code: entry.inviteCode!,
    preference: "watch",
  });
  const connection = (m: typeof red): RealtimeConnection => ({
    identity: m.identity,
    proof: m.proof,
    roomId: entry.roomId,
    tabId: randomUUID(),
    connectionId: randomUUID(),
  });
  const r = connection(red),
    b = connection(black),
    v = connection(viewer);
  const boot = randomUUID();
  async function connect(c: RealtimeConnection, presence = false) {
    const snapshot = await rt.connect(c);
    // Trusted fixture setup only until production root presence integration exists.
    if (presence)
      await transactions.run(c, (client) =>
        rooms.presence(
          transactions.getScope(client, c.identity, c.roomId),
          c.roomId,
          {
            connectionId: c.connectionId,
            generation: snapshot.control.generation,
            serverInstance: boot,
          },
          true,
        ),
      );
    return rt.snapshot(c);
  }
  async function command(
    c: RealtimeConnection,
    action: RoomCommand["action"],
    overrides: Partial<RoomCommand> = {},
  ) {
    const before = await rt.snapshot(c);
    const input = parseCommand({
      commandId: randomUUID(),
      roomId: c.roomId,
      expectedVersion: before.version,
      action,
      ...overrides,
    });
    return { input, ack: await rt.command(c, input) };
  }
  async function start() {
    await connect(r, true);
    await connect(b, true);
    await connect(v);
    expect(
      (await command(r, { type: "room.ready", payload: { ready: true } })).ack
        .status,
    ).toBe("ok");
    expect(
      (await command(b, { type: "room.ready", payload: { ready: true } })).ack
        .status,
    ).toBe("ok");
    // Administrator advances only synthetic countdown, no claim production scheduler.
    await pool.query(
      "UPDATE xiangqi_room.countdowns SET due_at=clock_timestamp()-interval '1 millisecond' WHERE room_id=$1",
      [entry.roomId],
    );
    await coordinator.withRoom(
      { actor: red.identity, roomIds: [entry.roomId] },
      async (p) => {
        const a = await authorizer.authorize(red.proof, p);
        const peer = await authorizer.authorize(black.proof, {
          ...p,
          actor: black.identity,
        });
        if (a.status !== "active" || peer.status !== "active")
          throw new Error("No verified players");
        return {
          ...a,
          activeActorIds: new Set([a.actor.userId, peer.actor.userId]),
        };
      },
      (s) => rooms.startDue(s, entry.roomId),
    );
    const snapshot = await rt.snapshot(r);
    expect(snapshot.match?.status).toBe("ACTIVE");
    return snapshot.match!;
  }
  const move = (
    m: { id: string; version: number },
    from: number,
    to: number,
  ): RoomCommand["action"] => ({
    type: "match.move",
    payload: { matchId: m.id, matchVersion: m.version, from, to },
  });
  return {
    red,
    black,
    viewer,
    outsider,
    r,
    b,
    v,
    entry,
    rooms,
    matches,
    rt,
    http,
    identities,
    transactions,
    provider,
    connect,
    connection,
    command,
    start,
    move,
  };
}
afterAll(() => pool.end());
describe.skipIf(!databaseUrl)(
  "real room/match/realtime integration on isolated PG55447",
  () => {
    beforeEach(async () => {
      await reset();
      await apply("supabase/migrations/20261011000007_match_outcomes.sql");
    });
    it("starts with both verified members then commits actual red/black moves and replays one receipt", async () => {
      const f = await fixture(),
        match = await f.start();
      const first = await f.command(f.r, f.move(match, 54, 45));
      expect(first.ack).toMatchObject({
        status: "ok",
        snapshot: { match: { version: 1, turn: "black" } },
      });
      expect(await f.rt.command(f.r, first.input)).toEqual(first.ack);
      const changed = parseCommand({
        ...first.input,
        action: f.move(match, 54, 46),
      });
      expect(await f.rt.command(f.r, changed)).toMatchObject({
        status: "error",
        error: { code: "COMMAND_ID_REUSED" },
      });
      const next = (await f.rt.snapshot(f.b)).match!;
      expect((await f.command(f.b, f.move(next, 27, 36))).ack).toMatchObject({
        status: "ok",
        snapshot: { match: { version: 2, turn: "red" } },
      });
      expect(
        (
          await pool.query(
            "SELECT count(*)::int AS n FROM public.match_moves WHERE match_id=$1",
            [match.id],
          )
        ).rows[0].n,
      ).toBe(2);
      expect(
        (await pool.query("SELECT count(*)::int AS n FROM public.moves"))
          .rows[0].n,
      ).toBe(0);
    });
    it("rejects wrong turn, illegal move, stale match/room versions and other match identity without mutations", async () => {
      const f = await fixture(),
        m = await f.start();
      expect((await f.command(f.b, f.move(m, 27, 36))).ack).toMatchObject({
        status: "error",
        error: { code: "MATCH_NOT_YOUR_TURN" },
      });
      expect((await f.command(f.r, f.move(m, 54, 44))).ack).toMatchObject({
        status: "error",
        error: { code: "MATCH_ILLEGAL_MOVE" },
      });
      expect(
        (await f.command(f.r, f.move({ ...m, version: 9 }, 54, 45))).ack,
      ).toMatchObject({
        status: "error",
        error: { code: "MATCH_VERSION_CONFLICT" },
      });
      expect(
        (await f.command(f.r, f.move({ ...m, id: randomUUID() }, 54, 45))).ack,
      ).toMatchObject({
        status: "error",
        error: { code: "MATCH_ID_MISMATCH" },
      });
      expect(
        (await f.command(f.r, f.move(m, 54, 45), { expectedVersion: 0 })).ack,
      ).toMatchObject({ status: "error", error: { code: "VERSION_STALE" } });
      expect(
        (
          await pool.query(
            "SELECT ply,version FROM public.matches WHERE id=$1",
            [m.id],
          )
        ).rows[0],
      ).toEqual({ ply: 0, version: "0" });
    });
    it("resign ends once, resets WAITING but retains seats and durable result for both snapshots/reload", async () => {
      const f = await fixture(),
        m = await f.start();
      const result = await f.command(f.r, {
        type: "match.resign",
        payload: { matchId: m.id, matchVersion: m.version },
      });
      expect(result.ack).toMatchObject({
        status: "ok",
        snapshot: {
          room: {
            status: "WAITING",
            seats: { red: f.red.id, black: f.black.id },
            ready: { red: false, black: false },
          },
          match: { status: "FINISHED", result: "RESIGN", winner: "black" },
          clocks: { running: null },
        },
      });
      for (const c of [f.r, f.b, f.v])
        expect(await f.rt.snapshot(c)).toMatchObject({
          match: {
            id: m.id,
            status: "FINISHED",
            result: "RESIGN",
            winner: "black",
          },
        });
      expect(await f.rt.command(f.r, result.input)).toEqual(result.ack);
      expect(
        (
          await pool.query(
            "SELECT count(*)::int AS n FROM public.match_events WHERE match_id=$1 AND type='RESULT'",
            [m.id],
          )
        ).rows[0].n,
      ).toBe(1);
    });
    it("TIMEOUT command commits terminal result, receipt/outbox once and no move even when payload is otherwise illegal", async () => {
      const f = await fixture(),
        m = await f.start();
      await pool.query(
        "UPDATE public.matches SET clock=jsonb_build_object('redMs',1,'blackMs',600000,'runningSinceEpochMs',floor(extract(epoch FROM clock_timestamp())*1000)::bigint-100) WHERE id=$1",
        [m.id],
      );
      const result = await f.command(f.r, f.move(m, 54, 44));
      expect(result.ack).toMatchObject({
        status: "error",
        error: { code: "MATCH_TIME_EXPIRED" },
        snapshot: {
          room: { status: "WAITING" },
          match: { status: "FINISHED", result: "TIMEOUT", winner: "black" },
          clocks: { redMs: 0, running: null },
        },
      });
      expect(await f.rt.command(f.r, result.input)).toEqual(result.ack);
      expect(
        (
          await pool.query(
            "SELECT ply,outcome FROM public.matches WHERE id=$1",
            [m.id],
          )
        ).rows[0],
      ).toEqual({ ply: 0, outcome: { reason: "TIMEOUT", winner: "BLACK" } });
      expect(
        (
          await pool.query(
            "SELECT count(*)::int AS n FROM xiangqi_realtime.receipts WHERE command_id=$1",
            [result.input.commandId],
          )
        ).rows[0].n,
      ).toBe(1);
      expect(
        (
          await pool.query(
            "SELECT count(*)::int AS n FROM xiangqi_room.outbox WHERE room_id=$1 AND type='MATCH_RESULT'",
            [f.entry.roomId],
          )
        ).rows[0].n,
      ).toBe(1);
    });
    it("receipt failure rolls back terminal match/room/outbox atomically, then same command retries once", async () => {
      const f = await fixture(),
        m = await f.start();
      await pool.query(
        "UPDATE public.matches SET clock=jsonb_build_object('redMs',1,'blackMs',600000,'runningSinceEpochMs',floor(extract(epoch FROM clock_timestamp())*1000)::bigint-100) WHERE id=$1",
        [m.id],
      );
      await pool.query(
        "CREATE FUNCTION xiangqi_realtime.fixture_receipt_failure() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Synthetic receipt failure'; END $$; CREATE TRIGGER fixture_receipt_failure BEFORE INSERT ON xiangqi_realtime.receipts FOR EACH ROW EXECUTE FUNCTION xiangqi_realtime.fixture_receipt_failure()",
      );
      const result = await f.command(f.r, f.move(m, 54, 45));
      expect(result.ack).toMatchObject({
        status: "error",
        error: { code: "REALTIME_UNAVAILABLE" },
      });
      expect(
        (
          await pool.query(
            "SELECT status,ply,outcome FROM public.matches WHERE id=$1",
            [m.id],
          )
        ).rows[0],
      ).toEqual({ status: "ACTIVE", ply: 0, outcome: null });
      expect(
        (
          await pool.query(
            "SELECT status,current_match_id FROM public.rooms WHERE id=$1",
            [f.entry.roomId],
          )
        ).rows[0],
      ).toEqual({ status: "PLAYING", current_match_id: m.id });
      expect(
        (
          await pool.query(
            "SELECT count(*)::int AS n FROM xiangqi_room.outbox WHERE room_id=$1 AND type='MATCH_RESULT'",
            [f.entry.roomId],
          )
        ).rows[0].n,
      ).toBe(0);
      expect(
        (
          await pool.query(
            "SELECT count(*)::int AS n FROM xiangqi_realtime.receipts WHERE command_id=$1",
            [result.input.commandId],
          )
        ).rows[0].n,
      ).toBe(0);
      await pool.query(
        "DROP TRIGGER fixture_receipt_failure ON xiangqi_realtime.receipts; DROP FUNCTION xiangqi_realtime.fixture_receipt_failure()",
      );
      expect(await f.rt.command(f.r, result.input)).toMatchObject({
        status: "error",
        error: { code: "MATCH_TIME_EXPIRED" },
        snapshot: { match: { status: "FINISHED", result: "TIMEOUT" } },
      });
      expect(
        (
          await pool.query(
            "SELECT count(*)::int AS n FROM public.match_events WHERE match_id=$1 AND type='RESULT'",
            [m.id],
          )
        ).rows[0].n,
      ).toBe(1);
    });
    it("viewer/outsider/superseded tab cannot move and revoked session cannot query room", async () => {
      const f = await fixture(),
        m = await f.start();
      expect((await f.command(f.v, f.move(m, 54, 45))).ack).toMatchObject({
        status: "error",
        error: { code: "TAB_READ_ONLY" },
      });
      await expect(
        f.rt.connect(f.connection(f.outsider)),
      ).rejects.toMatchObject({ code: "ROOM_FORBIDDEN" });
      const replacement = f.connection(f.red);
      await f.connect(replacement);
      expect((await f.command(f.r, f.move(m, 54, 45))).ack).toMatchObject({
        status: "error",
        error: { code: "TAB_READ_ONLY" },
      });
      await pool.query(
        "UPDATE xiangqi_auth.app_sessions SET revoked_at=clock_timestamp() WHERE token_hash=$1",
        [createHash("sha256").update(f.black.proof.appSession).digest("hex")],
      );
      await expect(f.rt.snapshot(f.b)).rejects.toMatchObject({
        code: "AUTH_REQUIRED",
      });
      expect(
        (await pool.query("SELECT ply FROM public.matches WHERE id=$1", [m.id]))
          .rows[0].ply,
      ).toBe(0);
    });
    it("uses native Socket.IO packets with real auth/SQL/controller guard and publishes actual move to peer", async () => {
      const f = await fixture();
      await f.start();
      const server = createServer();
      const io = attachRealtime(server, {
        store: f.rt,
        identities: f.identities,
        corsOrigins: ["http://localhost:5173"],
      });
      await new Promise<void>((resolve) =>
        server.listen(0, "127.0.0.1", resolve),
      );
      const address = server.address();
      if (!address || typeof address === "string")
        throw new Error("No local address");
      const sockets: Socket[] = [];
      async function open(m: typeof f.red) {
        const socket = socketClient(`http://127.0.0.1:${address.port}`, {
          transports: ["websocket"],
          forceNew: true,
          reconnection: false,
          extraHeaders: { Origin: "http://localhost:5173" },
          auth: { ...m.proof, roomId: f.entry.roomId, tabId: randomUUID() },
        });
        sockets.push(socket);
        const initial = await new Promise<RoomSnapshot>((resolve, reject) => {
          const timeout = setTimeout(
            () => reject(new Error("Socket snapshot timeout")),
            3000,
          );
          socket.once("room.snapshot", (s) => {
            clearTimeout(timeout);
            resolve(s);
          });
          socket.once("connect_error", (e) => {
            clearTimeout(timeout);
            reject(e);
          });
        });
        return { socket, initial };
      }
      try {
        const a = await open(f.red),
          b = await open(f.black);
        expect(a.initial.control.mode).toBe("writable");
        expect(b.initial.control.mode).toBe("writable");
        const peerUpdate = new Promise<RoomSnapshot>((resolve, reject) => {
          const timeout = setTimeout(
            () => reject(new Error("Peer move timeout")),
            3000,
          );
          b.socket.on("room.snapshot", (s) => {
            if (s.match?.version === 1) {
              clearTimeout(timeout);
              resolve(s);
            }
          });
        });
        const command = parseCommand({
          commandId: randomUUID(),
          roomId: f.entry.roomId,
          expectedVersion: a.initial.version,
          action: f.move(a.initial.match!, 54, 45),
        });
        const ack = await new Promise<CommandAcknowledgement>((resolve) =>
          a.socket.emit("room.command", command, resolve),
        );
        expect(ack).toMatchObject({
          status: "ok",
          snapshot: { match: { version: 1, turn: "black" } },
        });
        expect(await peerUpdate).toMatchObject({
          match: { version: 1, turn: "black" },
        });
        expect(JSON.stringify(ack)).not.toContain("appSession");
      } finally {
        for (const socket of sockets) socket.disconnect();
        await io.close();
        if (server.listening)
          await new Promise<void>((resolve) => server.close(() => resolve()));
      }
    });
  },
);
