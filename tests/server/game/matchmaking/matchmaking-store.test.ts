import { randomUUID } from "node:crypto";
import type { PoolClient } from "pg";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { GuestService } from "@server/account/guest/guest.service.js";
import { GuestStore } from "@server/account/guest/guest.store.js";
import { AiReservations } from "@server/game/ai/ai-reservations.js";
import { ClockService } from "@server/game/clock/clock.service.js";
import { MatchmakingStore } from "@server/game/matchmaking/matchmaking.store.js";
import type { QueueIdentity } from "@server/game/matchmaking/matchmaking-queue.js";
import { GuestRoomAuthorizer, GuestRoomCoordinator } from "@server/game/room/guest-room-auth.js";
import { RoomGuestPort } from "@server/game/room/guest-room-port.js";
import { RoomHttpService } from "@server/game/room/room-http.service.js";
import { PostgresMemberRoomAuthorizer } from "@server/game/room/member-room-auth.js";
import { RoomSessionAuthorizer } from "@server/game/room/room-session.js";
import { RoomTransactions, type RoomAuthorize, type RoomTransactionInput, type RoomTransactionResult } from "@server/game/room/room-transactions.js";
import type { RoomScope } from "@server/game/room/room.types.js";
import { createRoomWiring } from "@server/game/room/room-wiring.js";
import { apply, databaseUrl, loginPool, member, pool, registration, resetBase } from "../game.runtime.test-helper.js";

async function schema() {
  await pool.query("DROP SCHEMA IF EXISTS xiangqi_social CASCADE; DROP SCHEMA IF EXISTS xiangqi_ai CASCADE");
  await resetBase();
  for (const name of [
    "20261011000010_room_chat", "20261011000011_ai_reservations",
    "20261011000012_ai_presence", "20261011000013_side_swap",
    "20261011000014_friendships", "20261011000015_media_share",
    "20261011000016_room_viewers", "20261019000019_principal_foreign_keys",
    "20261102000004_direct_messages",
    "20261103000009_yc7_chat_quota", "20261103000010_media_generation",
    "20261103000011_yc9_ranked",
  ]) await apply(`supabase/migrations/${name}.sql`);
}

// Only the store's clock sample is controlled; every authorization, lock and SQL query stays real.
class FixedClockTransactions extends RoomTransactions {
  constructor(public at?: Date) { super(pool); }
  override withRoom<T>(input: RoomTransactionInput, authorize: RoomAuthorize, work: (scope: RoomScope) => Promise<T>): Promise<RoomTransactionResult<T>> {
    return super.withRoom(input, authorize, (scope) => {
      const client = new Proxy(scope.client, {
        get: (target, key) => key === "query" ? (...args: unknown[]) => {
          if (this.at && args[0] === "SELECT clock_timestamp() AS at") return target.query("SELECT $1::timestamptz AS at", [this.at]);
          return (target.query as (...args: unknown[]) => unknown).apply(target, args);
        } : Reflect.get(target, key, target),
      }) as PoolClient;
      return work({ ...scope, client });
    });
  }
}

async function fixture(fixedTime?: Date, inspectScope?: (scope: RoomScope) => void) {
  const r = registration();
  const wiring = createRoomWiring(pool, new ClockService());
  const port = new RoomGuestPort(
    (client, guestId, roomId) => wiring.rooms.leave(wiring.getScope(client, { userId: guestId, kind: "guest" }, roomId), roomId).then(() => undefined),
    client => {
      const scope = wiring.context.get(client);
      if (!scope) throw new Error("Missing guest room scope");
      return scope;
    },
  );
  const guests = new GuestService(new GuestStore(pool), port, () => new Date(), new GuestRoomCoordinator(wiring.coordinator, wiring.withScope));
  const authorizer = new RoomSessionAuthorizer(new PostgresMemberRoomAuthorizer(r.sessions), new GuestRoomAuthorizer(guests, pool));
  const coordinator = new FixedClockTransactions(fixedTime);
  const store = new MatchmakingStore(pool, coordinator, authorizer, wiring.matches, async (scope, work) => {
    inspectScope?.(scope);
    return wiring.withScope(scope, work);
  });
  const rooms = new RoomHttpService(wiring.rooms, wiring.coordinator, authorizer, wiring.withScope);
  const person = async (): Promise<QueueIdentity> => {
    const m = await member(r);
    const proof = { accessToken: m.token, appSession: m.appSession };
    return { actor: await authorizer.resolve(proof), sessionKey: randomUUID(), proof };
  };
  const guest = async (): Promise<QueueIdentity> => {
    const g = await guests.create("Synthetic Guest");
    const proof = { guestCapability: g.capability };
    return { actor: await authorizer.resolve(proof), sessionKey: randomUUID(), proof };
  };
  return { wiring, store, rooms, person, guest, coordinator, fixedTime, authorizer };
}

async function reservePair(store: MatchmakingStore, a: QueueIdentity, b: QueueIdentity) {
  await store.reserve(a);
  await store.reserve(b);
}

// Match start timestamps are immutable, so create historical rows through the real start path.
async function historicalMatch(t: { store: MatchmakingStore; coordinator: FixedClockTransactions; fixedTime?: Date }, a: QueueIdentity, b: QueueIdentity, started: Date, interrupted = false) {
  await reservePair(t.store, a, b);
  t.coordinator.at = started;
  let room: string;
  try {
    room = await t.store.start(a, b, "RANKED", randomUUID());
  } finally {
    t.coordinator.at = t.fixedTime;
  }
  if (interrupted) await pool.query("UPDATE public.matches SET status='INTERRUPTED', ended_at=GREATEST(clock_timestamp(),created_at), outcome=$2 WHERE room_id=$1", [room, { reason: "SERVER_RESTART", winner: null }]);
  await pool.query("UPDATE public.rooms SET status='CLOSED',closed_at=clock_timestamp() WHERE id=$1", [room]);
  await pool.query("DELETE FROM public.active_players WHERE room_id=$1", [room]);
}

afterAll(async () => { await loginPool.end(); await pool.end(); });
describe.skipIf(!databaseUrl)("MatchmakingStore with real Postgres", () => {
  beforeEach(schema);

  it("reserves and releases the actual shared player slot, returning the stored rating", async () => {
    const t = await fixture(), a = await t.person();
    await pool.query("INSERT INTO xiangqi_room.ratings(user_id,elo) VALUES($1,1450)", [a.actor.userId]);
    expect(await t.store.reserve(a)).toBe(1450);
    expect(await t.store.occupied(a.actor)).toBe(true);
    await expect(t.store.reserve(a)).rejects.toMatchObject({ code: "ALREADY_SEATED" });
    await t.store.release(a);
    expect(await t.store.occupied(a.actor)).toBe(false);
    expect((await pool.query("SELECT user_id FROM public.active_players WHERE user_id=$1", [a.actor.userId])).rowCount).toBe(0);
  });

  it("rejects a revoked session at match start after its queue slot was reserved", async () => {
    const t = await fixture(), a = await t.person(), b = await t.person();
    await reservePair(t.store, a, b);
    await pool.query("UPDATE xiangqi_auth.app_sessions SET revoked_at=clock_timestamp() WHERE user_id=$1", [b.actor.userId]);
    await expect(t.store.start(a, b, "RANKED", randomUUID())).rejects.toMatchObject({ code: "AUTH_REQUIRED" });
    expect((await pool.query("SELECT id FROM public.matches WHERE red_user_id=$1 OR black_user_id=$1", [a.actor.userId])).rowCount).toBe(0);
  });

  it("blocks room create, room join and AI reservation until the queue slot is released", async () => {
    const t = await fixture(), a = await t.person(), host = await t.person();
    const room = await t.rooms.create(host.proof, { commandId: randomUUID(), timeMinutes: 5 });
    await t.store.reserve(a);
    await expect(t.rooms.create(a.proof, { commandId: randomUUID(), timeMinutes: 5 })).rejects.toMatchObject({ code: "ALREADY_SEATED" });
    await expect(t.rooms.join(a.proof, { commandId: randomUUID(), code: room.inviteCode!, preference: "play" })).rejects.toMatchObject({ code: "ALREADY_SEATED" });
    const ai = new AiReservations();
    const result = await t.wiring.coordinator.withRoom({ actor: a.actor, roomIds: [] }, async proof => ({ status: "active", actor: proof.actor }), async scope => {
      const boot = await ai.createBoot(scope.client);
      await expect(ai.reserve(scope, { gameId: randomUUID(), bootId: boot.id })).rejects.toMatchObject({ code: "ALREADY_SEATED" });
    });
    expect(result.status).toBe("active");
    await t.store.release(a);
    const joined = await t.rooms.join(a.proof, { commandId: randomUUID(), code: room.inviteCode!, preference: "play" });
    expect(joined.roomId).toBe(room.roomId);
  });

  it("does not count an owned Casual result room toward a guest's custom room limit", async () => {
    const t = await fixture(), guest = await t.guest(), opponent = await t.person();
    await reservePair(t.store, guest, opponent);
    const casual = await t.store.start(guest, opponent, "CASUAL", randomUUID());
    const client = await pool.connect();
    try {
      expect(await new GuestStore(pool).ownsOpenRoom(client, guest.actor.userId)).toBe(false);
    } finally { client.release(); }
    await t.wiring.coordinator.withRoom(
      { actor: guest.actor, roomIds: [casual] },
      proof => t.authorizer.authorize(guest.proof, proof),
      scope => t.wiring.withScope(scope, () => t.wiring.rooms.leave(scope, casual)),
    );
    const custom = await t.rooms.create(guest.proof, { commandId: randomUUID(), timeMinutes: 5 });
    expect(custom.roomId).not.toBe(casual);
    expect(custom.inviteCode).toMatch(/^\d{8}$/);
    await expect(t.rooms.create(guest.proof, { commandId: randomUUID(), timeMinutes: 5 })).rejects.toMatchObject({ code: "GUEST_ROOM_LIMIT" });
  });

  it("starts both matched seats with one disconnect timestamp so a no-show pair is a simultaneous draw case", async () => {
    const t = await fixture(), a = await t.person(), b = await t.person();
    await reservePair(t.store, a, b);
    const room = await t.store.start(a, b, "CASUAL", randomUUID());
    const rows = (await pool.query<{ n: number }>("SELECT count(DISTINCT disconnected_at)::int AS n FROM public.room_members WHERE room_id=$1", [room])).rows;
    expect(rows[0]!.n).toBe(1);
  });

  it("starts the third Ranked game but rejects the fourth, counting interrupted games in both color orders", async () => {
    const t = await fixture(), a = await t.person(), b = await t.person();
    await historicalMatch(t, a, b, new Date(Date.now() - 60000), true);
    await historicalMatch(t, b, a, new Date(Date.now() - 30000));
    expect(await t.store.canPair(a, b)).toBe(true);
    await reservePair(t.store, a, b);
    const third = await t.store.start(a, b, "RANKED", randomUUID());
    expect((await pool.query("SELECT count(*)::int AS n FROM public.matches WHERE room_id=$1", [third])).rows[0].n).toBe(1);
    await pool.query("UPDATE public.rooms SET status='CLOSED',closed_at=clock_timestamp() WHERE id=$1", [third]);
    await pool.query("DELETE FROM public.active_players WHERE room_id=$1", [third]);
    expect(await t.store.canPair(b, a)).toBe(false);
    await reservePair(t.store, a, b);
    const fourth = randomUUID();
    await expect(t.store.start(b, a, "RANKED", fourth)).rejects.toMatchObject({ code: "MATCHMAKING_PAIR_LIMIT" });
    expect((await pool.query("SELECT id FROM public.rooms WHERE id=$1", [fourth])).rowCount).toBe(0);
    expect((await pool.query("SELECT count(*)::int AS n FROM public.active_players WHERE user_id=ANY($1::uuid[]) AND room_id IS NULL", [[a.actor.userId, b.actor.userId]])).rows[0].n).toBe(2);
  });

  it("uses a lower-exclusive and upper-inclusive 24-hour start window", async () => {
    const at = new Date("2030-01-02T12:00:00.000Z");
    const t = await fixture(at), a = await t.person(), b = await t.person();
    await historicalMatch(t, a, b, new Date(at.getTime() - 86400000));
    await historicalMatch(t, a, b, new Date(at.getTime() - 86400000 + 1));
    await historicalMatch(t, b, a, at, true);
    await historicalMatch(t, b, a, new Date(at.getTime() + 1));
    expect(await t.store.canPair(a, b)).toBe(true);
    await historicalMatch(t, a, b, new Date(at.getTime() - 1));
    expect(await t.store.canPair(b, a)).toBe(false);
  });

  it("serializes competing starts with overlapping actors and retains one real match", async () => {
    const t = await fixture(), a = await t.person(), b = await t.person(), c = await t.person();
    await Promise.all([t.store.reserve(a), t.store.reserve(b), t.store.reserve(c)]);
    const ids = [randomUUID(), randomUUID()];
    const results = await Promise.allSettled([t.store.start(a, b, "CASUAL", ids[0]!), t.store.start(c, a, "CASUAL", ids[1]!)]);
    expect(results.filter(x => x.status === "fulfilled")).toHaveLength(1);
    expect(results.filter(x => x.status === "rejected")).toHaveLength(1);
    expect((await pool.query("SELECT count(*)::int AS n FROM public.matches WHERE room_id=ANY($1::uuid[])", [ids])).rows[0].n).toBe(1);
    expect((await pool.query("SELECT count(*)::int AS n FROM public.active_players WHERE user_id=$1 AND room_id IS NOT NULL AND match_id IS NOT NULL", [a.actor.userId])).rows[0].n).toBe(1);
  });
  it("passes sorted actor locks and the new room proof into the real match start", async () => {
    let observed: { actors: string[]; rooms: string[] } | undefined;
    const t = await fixture(undefined, scope => {
      observed = { actors: [...scope.lockedActorIds], rooms: [...scope.lockedRoomIds] };
    });
    const a = await t.person(), b = await t.person(), room = randomUUID();
    await reservePair(t.store, a, b);
    await t.store.start(b, a, "CASUAL", room);
    expect(observed).toEqual({ actors: [a.actor.userId, b.actor.userId].sort(), rooms: [room] });
    expect((await pool.query("SELECT id FROM public.matches WHERE room_id=$1", [room])).rowCount).toBe(1);
  });


  it("rejects a self-pair and a guest Ranked start without consuming reservations", async () => {
    const t = await fixture(), a = await t.person(), g = await t.guest();
    await reservePair(t.store, a, g);
    await expect(t.store.start(a, a, "CASUAL", randomUUID())).rejects.toMatchObject({ code: "MATCHMAKING_FORBIDDEN" });
    await expect(t.store.start(a, g, "RANKED", randomUUID())).rejects.toMatchObject({ code: "MATCHMAKING_FORBIDDEN" });
    expect((await pool.query("SELECT count(*)::int AS n FROM public.active_players WHERE user_id=ANY($1::uuid[]) AND room_id IS NULL", [[a.actor.userId, g.actor.userId]])).rows[0].n).toBe(2);
    expect((await pool.query("SELECT count(*)::int AS n FROM public.matches")).rows[0].n).toBe(0);
  });

  it("rolls back room, match, membership and slot updates when the final outbox insert fails", async () => {
    const t = await fixture(), a = await t.person(), b = await t.person(), room = randomUUID();
    await reservePair(t.store, a, b);
    await pool.query("ALTER TABLE xiangqi_room.outbox ADD CONSTRAINT synthetic_reject_matched CHECK(type <> 'room.matched')");
    await expect(t.store.start(a, b, "CASUAL", room)).rejects.toThrow();
    expect((await pool.query("SELECT id FROM public.rooms WHERE id=$1", [room])).rowCount).toBe(0);
    expect((await pool.query("SELECT id FROM public.matches WHERE room_id=$1", [room])).rowCount).toBe(0);
    expect((await pool.query("SELECT user_id FROM public.room_members WHERE room_id=$1", [room])).rowCount).toBe(0);
    expect((await pool.query("SELECT count(*)::int AS n FROM public.active_players WHERE user_id=ANY($1::uuid[]) AND room_id IS NULL AND match_id IS NULL", [[a.actor.userId, b.actor.userId]])).rows[0].n).toBe(2);
  });
});
