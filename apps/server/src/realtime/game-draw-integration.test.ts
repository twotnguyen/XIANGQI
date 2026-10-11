import { createHash, randomUUID } from "node:crypto";
import type { PoolClient } from "pg";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { RoomCommand } from "@xiangqi/shared";
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
  const game = new GameRooms(
    rooms,
    matches,
    clock,
    (client, identity, id) => {
      const s = transactions.getScope(client, identity, id);
      scopes.set(client, s);
      return s;
    },
    matches,
  );
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
  "draw commands with actual auth, coordinator and receipts on synthetic PG55447",
  () => {
    beforeEach(async () => {
      await reset();
      await apply("supabase/migrations/20261011000007_match_outcomes.sql");
      await apply("supabase/migrations/20261011000009_match_draw.sql");
    });
    it("commits one durable offer through replay, rejects command ID reuse, keeps canonical lastMove through withdrawal", async () => {
      const f = await fixture(),
        m = await f.start();
      const first = await f.command(f.r, {
        type: "match.draw.offer",
        payload: { matchId: m.id, matchVersion: m.version },
      });
      expect(first.ack).toMatchObject({
        status: "ok",
        snapshot: {
          match: { version: 1, lastMove: null },
          draw: { offers: [{ sender: "red" }] },
        },
      });
      expect(await f.rt.command(f.r, first.input)).toEqual(first.ack);
      const reused = parseCommand({
        ...first.input,
        action: {
          type: "match.resign",
          payload: { matchId: m.id, matchVersion: 1 },
        },
      });
      expect(await f.rt.command(f.r, reused)).toMatchObject({
        status: "error",
        error: { code: "COMMAND_ID_REUSED" },
      });
      expect(
        (
          await pool.query(
            "SELECT count(*)::int n FROM xiangqi_room.match_draw_offers",
          )
        ).rows[0].n,
      ).toBe(1);
      expect((await f.rt.snapshot(f.v)).draw).toBeNull();
      const moved = await f.command(
        f.r,
        f.move({ id: m.id, version: 1 }, 54, 45),
      );
      expect(moved.ack).toMatchObject({
        status: "ok",
        snapshot: {
          match: { lastMove: { from: 54, to: 45, eventVersion: 2 } },
        },
      });
      const snap = await f.rt.snapshot(f.r),
        offerId = snap.draw!.offers[0].id;
      const withdrawn = await f.command(f.r, {
        type: "match.draw.withdraw",
        payload: { matchId: m.id, matchVersion: snap.match!.version, offerId },
      });
      expect(withdrawn.ack).toMatchObject({
        status: "ok",
        snapshot: {
          draw: { offers: [], remainingMoves: { red: 0 } },
          match: {
            lastMove: { from: 54, to: 45, eventVersion: 2 },
            status: "ACTIVE",
          },
        },
      });
      expect(
        (await pool.query("SELECT ply FROM public.matches WHERE id=$1", [m.id]))
          .rows[0].ply,
      ).toBe(1);
    });
    it("allows readonly player proposal reads but denies readonly/viewer/outsider actions and revoked receipt replay", async () => {
      const f = await fixture(),
        m = await f.start();
      const first = await f.command(f.r, {
        type: "match.draw.offer",
        payload: { matchId: m.id, matchVersion: 0 },
      });
      const replacement = f.connection(f.red);
      await f.connect(replacement);
      const readonly = await f.rt.snapshot(f.r);
      expect(readonly.control.mode).toBe("readonly");
      expect(readonly.draw?.offers).toHaveLength(1);
      const payload = { matchId: m.id, matchVersion: 1 };
      expect(
        (await f.command(f.r, { type: "match.draw.offer", payload })).ack,
      ).toMatchObject({ status: "error", error: { code: "TAB_READ_ONLY" } });
      expect(
        (await f.command(f.v, { type: "match.draw.offer", payload })).ack,
      ).toMatchObject({ status: "error", error: { code: "TAB_READ_ONLY" } });
      await expect(
        f.rt.connect(f.connection(f.outsider)),
      ).rejects.toMatchObject({ code: "ROOM_FORBIDDEN" });
      await pool.query(
        "UPDATE xiangqi_auth.app_sessions SET revoked_at=clock_timestamp() WHERE token_hash=$1",
        [createHash("sha256").update(f.red.proof.appSession).digest("hex")],
      );
      expect(await f.rt.command(replacement, first.input)).toMatchObject({
        status: "error",
        error: { code: "AUTH_REQUIRED" },
      });
      expect(
        (
          await pool.query(
            "SELECT count(*)::int n FROM xiangqi_room.match_draw_offers",
          )
        ).rows[0].n,
      ).toBe(1);
    });
    it("accepts only the receiver and publishes canonical terminal snapshots with seats preserved", async () => {
      const f = await fixture(),
        m = await f.start();
      await f.command(f.r, {
        type: "match.draw.offer",
        payload: { matchId: m.id, matchVersion: 0 },
      });
      const pending = await f.rt.snapshot(f.b),
        offerId = pending.draw!.offers[0].id;
      const self = await f.command(f.r, {
        type: "match.draw.respond",
        payload: {
          matchId: m.id,
          matchVersion: pending.match!.version,
          offerId,
          accept: true,
        },
      });
      expect(self.ack).toMatchObject({
        status: "error",
        error: { code: "MATCH_DRAW_RECEIVER_REQUIRED" },
      });
      const accepted = await f.command(f.b, {
        type: "match.draw.respond",
        payload: {
          matchId: m.id,
          matchVersion: pending.match!.version,
          offerId,
          accept: true,
        },
      });
      expect(accepted.ack).toMatchObject({
        status: "ok",
        snapshot: {
          room: {
            status: "WAITING",
            seats: { red: f.red.id, black: f.black.id },
          },
          match: {
            result: "DRAW_AGREEMENT",
            winner: null,
            status: "FINISHED",
            lastMove: null,
          },
          draw: null,
          clocks: { running: null },
        },
      });
      for (const peer of [f.r, f.b, f.v])
        expect(await f.rt.snapshot(peer)).toMatchObject({
          match: { result: "DRAW_AGREEMENT", winner: null, status: "FINISHED" },
          draw: null,
        });
      expect(
        (
          await pool.query(
            "SELECT count(*)::int n FROM public.match_events WHERE match_id=$1 AND type='RESULT'",
            [m.id],
          )
        ).rows[0].n,
      ).toBe(1);
      expect(
        (
          await pool.query(
            "SELECT count(*)::int n FROM xiangqi_room.outbox WHERE room_id=$1 AND type='MATCH_DRAW'",
            [f.entry.roomId],
          )
        ).rows[0].n,
      ).toBe(2);
    });
    it("commits timeout plus sanitized error receipt instead of accepting a draw or rolling back the terminal result", async () => {
      const f = await fixture(),
        m = await f.start();
      await f.command(f.r, {
        type: "match.draw.offer",
        payload: { matchId: m.id, matchVersion: 0 },
      });
      const pending = await f.rt.snapshot(f.b),
        offerId = pending.draw!.offers[0].id;
      await pool.query(
        "UPDATE public.matches SET clock=jsonb_build_object('redMs',0,'blackMs',600000,'runningSinceEpochMs',floor(extract(epoch FROM clock_timestamp())*1000)::bigint) WHERE id=$1",
        [m.id],
      );
      const ended = await f.command(f.b, {
        type: "match.draw.respond",
        payload: {
          matchId: m.id,
          matchVersion: pending.match!.version,
          offerId,
          accept: true,
        },
      });
      expect(ended.ack).toMatchObject({
        status: "error",
        error: { code: "MATCH_TIME_EXPIRED" },
        snapshot: {
          room: { status: "WAITING" },
          match: { result: "TIMEOUT", winner: "black" },
          draw: null,
        },
      });
      expect(await f.rt.command(f.b, ended.input)).toEqual(ended.ack);
      expect(
        (await pool.query("SELECT status FROM xiangqi_room.match_draw_offers"))
          .rows[0].status,
      ).toBe("CLOSED");
      expect(
        (
          await pool.query(
            "SELECT count(*)::int n FROM public.match_events WHERE match_id=$1 AND type='RESULT'",
            [m.id],
          )
        ).rows[0].n,
      ).toBe(1);
    });

    it("returns canonical expired/cooldown snapshots through draw command receipts", async () => {
      const f = await fixture(),
        m = await f.start();
      await f.command(f.r, {
        type: "match.draw.offer",
        payload: { matchId: m.id, matchVersion: 0 },
      });
      const pending = await f.rt.snapshot(f.b),
        offerId = pending.draw!.offers[0].id;
      await pool.query(
        "WITH t AS MATERIALIZED(SELECT clock_timestamp()-interval '1 second' deadline) UPDATE xiangqi_room.match_draw_offers SET created_at=t.deadline-interval '30 seconds',expires_at=t.deadline FROM t WHERE id=$1",
        [offerId],
      );
      const late = await f.command(f.b, {
        type: "match.draw.respond",
        payload: {
          matchId: m.id,
          matchVersion: pending.match!.version,
          offerId,
          accept: true,
        },
      });
      expect(late.ack).toMatchObject({
        status: "error",
        error: { code: "MATCH_DRAW_EXPIRED" },
        snapshot: {
          draw: { offers: [], remainingMoves: { red: 5 } },
          match: { status: "ACTIVE" },
        },
      });
      expect(await f.rt.command(f.b, late.input)).toEqual(late.ack);
      const current = await f.rt.snapshot(f.r);
      const cooldown = await f.command(f.r, {
        type: "match.draw.offer",
        payload: { matchId: m.id, matchVersion: current.match!.version },
      });
      expect(cooldown.ack).toMatchObject({
        status: "error",
        error: { code: "MATCH_DRAW_COOLDOWN" },
        snapshot: { draw: { remainingMoves: { red: 5 } } },
      });
      expect(
        (
          await pool.query(
            "SELECT count(*)::int n FROM public.match_events WHERE match_id=$1 AND type='RESULT'",
            [m.id],
          )
        ).rows[0].n,
      ).toBe(0);
    });
  },
);
