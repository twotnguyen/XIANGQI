import { randomUUID } from "node:crypto";
import { initialPosition } from "@xiangqi/xiangqi-core";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import {
  apply,
  databaseUrl,
  pool,
  reset,
  transaction,
} from "./room.test-helper.js";
import { RoomStore } from "@server/game/room/room-store.js";
import type { RoomActor, RoomScope } from "@server/game/room/room.types.js";
afterAll(() => pool.end());
const store = new RoomStore();
const startCalls: { roomId: string; redId: string; blackId: string }[] = [];
// Stub cổng ván: ghi một dòng matches thật để khóa ngoại current_match_id hợp lệ.
const matchStore = new RoomStore({
  start: async (client, input) => {
    const matchId = randomUUID();
    await client.query(
      "INSERT INTO public.matches(id,room_id,mode,red_user_id,black_user_id,position) VALUES($1,$2,'ONLINE',$3,$4,$5)",
      [
        matchId,
        input.roomId,
        input.redId,
        input.blackId,
        JSON.stringify({ board: initialPosition().board, turn: "RED" }),
      ],
    );
    startCalls.push(input);
    return { matchId };
  },
});
const capabilities = new Map<string, string>();
async function run<T>(
  a: RoomActor,
  proof: string,
  roomIds: string[],
  work: (s: RoomScope) => Promise<T>,
) {
  const roster = roomIds.length
    ? (
        await pool.query(
          "SELECT user_id FROM public.room_members WHERE room_id=ANY($1::uuid[]) AND role='PLAYER'",
          [roomIds],
        )
      ).rows.map((r: { user_id: string }) => r.user_id)
    : [];
  const ids = [a.userId, ...roster];
  return transaction(
    ids,
    roomIds,
    async (client) =>
      work({
        client,
        actor: a,
        lockedActorIds: new Set(ids),
        lockedRoomIds: new Set(roomIds),
        activeActorIds: new Set(ids.filter((id) => capabilities.has(id))),
      }),
    async () => {
      if (capabilities.get(a.userId) !== proof)
        throw new Error("SESSION_INVALID");
    },
  );
}
async function admitted() {
  const id = randomUUID();
  await pool.query(
    "INSERT INTO auth.users(id,email,email_confirmed_at) VALUES($1,$2,clock_timestamp())",
    [id, `synthetic-${id}@example.invalid`],
  );
  await pool.query(
    "INSERT INTO public.profiles(user_id,username,display_name,completed_at,registration_pending) VALUES($1,$2,'Synthetic Rematch',clock_timestamp(),false)",
    [id, "m" + id.replaceAll("-", "").slice(0, 18)],
  );
  const proof = randomUUID();
  capabilities.set(id, proof);
  return { a: { userId: id, kind: "member" as const } as RoomActor, proof };
}
/** Phòng tùy chỉnh có hai người, cả hai đang kết nối, và một ván FINISHED vừa kết thúc. */
async function finishedCustomRoom() {
  const h = await admitted(),
    b = await admitted();
  const e = await run(h.a, h.proof, [], (s) =>
    store.create(s, { commandId: randomUUID() }),
  );
  const roomId = e.roomId;
  await run(b.a, b.proof, [roomId], (s) =>
    store.join(s, { commandId: randomUUID(), roomId, intent: "auto" }),
  );
  const bServer = randomUUID();
  for (const p of [h, b])
    await run(p.a, p.proof, [roomId], (s) =>
      store.presence(
        s,
        roomId,
        {
          connectionId: p.a.userId,
          generation: 1,
          serverInstance: p === b ? bServer : randomUUID(),
        },
        true,
      ),
    );
  const view = await run(h.a, h.proof, [roomId], (s) =>
    store.snapshot(s, roomId),
  );
  await pool.query(
    'INSERT INTO public.matches(id,room_id,mode,status,red_user_id,black_user_id,position,outcome,ended_at) VALUES($1,$2,\'ONLINE\',\'FINISHED\',$3,$4,$5,\'{"reason":"RESIGN","winner":"RED"}\',clock_timestamp())',
    [
      randomUUID(),
      roomId,
      view.room.seats.red,
      view.room.seats.black,
      JSON.stringify({ board: initialPosition().board, turn: "RED" }),
    ],
  );
  return {
    h,
    b,
    roomId,
    view,
    bPresence: {
      connectionId: b.a.userId,
      generation: 1,
      serverInstance: bServer,
    },
  };
}
async function replaceOpponent(
  fixture: Awaited<ReturnType<typeof finishedCustomRoom>>,
) {
  const { b, roomId } = fixture;
  await run(b.a, b.proof, [roomId], (s) => store.toSpectator(s, roomId));
  const replacement = await admitted();
  await run(replacement.a, replacement.proof, [roomId], (s) =>
    store.join(s, { commandId: randomUUID(), roomId, intent: "auto" }),
  );
  await run(replacement.a, replacement.proof, [roomId], (s) =>
    store.presence(
      s,
      roomId,
      {
        connectionId: replacement.a.userId,
        generation: 1,
        serverInstance: randomUUID(),
      },
      true,
    ),
  );
  return replacement;
}

describe.skipIf(!databaseUrl)("custom room rematch offers", () => {
  beforeEach(async () => {
    startCalls.length = 0;
    await pool.query(
      "DROP SCHEMA IF EXISTS xiangqi_chat CASCADE; DROP SCHEMA IF EXISTS xiangqi_ai CASCADE",
    );
    await reset();
    for (const migration of [
      "20261011000006_rooms",
      "20261011000007_match_outcomes",
      "20261011000008_room_modes",
      "20261011000009_match_draw",
      "20261011000010_room_chat",
      "20261011000013_side_swap",
      "20261017000018_room_code_digits",
      "20261102000002_custom_rematch",
      "20261103000004_room_issued_codes",
      "20261102000003_unlimited_inactivity",
      "20261103000005_match_aborted",
      "20261103000006_online_undo",
      "20261103000007_match_simultaneous_disconnect",
    ])
      await apply(`supabase/migrations/${migration}.sql`);
  });
  it("proposes, forbids the proposer from accepting, and swaps seats then counts down", async () => {
    const { h, b, roomId, view } = await finishedCustomRoom();
    const proposed = await run(h.a, h.proof, [roomId], (s) =>
      store.proposeRematch(s, roomId, "SWAP"),
    );
    expect(proposed.room.rematchOffer).toMatchObject({
      proposerId: h.a.userId,
      responderId: b.a.userId,
      side: "SWAP",
    });
    await expect(
      run(h.a, h.proof, [roomId], (s) =>
        store.proposeRematch(s, roomId, "KEEP"),
      ),
    ).rejects.toMatchObject({ code: "REMATCH_ALREADY_PENDING" });
    await expect(
      run(h.a, h.proof, [roomId], (s) => store.respondRematch(s, roomId, true)),
    ).rejects.toMatchObject({ code: "REMATCH_FORBIDDEN" });
    const accepted = await run(b.a, b.proof, [roomId], (s) =>
      store.respondRematch(s, roomId, true),
    );
    expect(accepted.roomId).toBe(roomId);
    expect(accepted.room.rematchOffer).toBeNull();
    expect(accepted.room.seats).toEqual({
      red: view.room.seats.black,
      black: view.room.seats.red,
    });
    expect(accepted.room.countdown).not.toBeNull();
  });
  it("rejects a late accept and expires the offer through the worker path", async () => {
    const { h, b, roomId } = await finishedCustomRoom();
    await run(h.a, h.proof, [roomId], (s) =>
      store.proposeRematch(s, roomId, "KEEP"),
    );
    await pool.query(
      "WITH t AS (SELECT clock_timestamp() AS now) UPDATE xiangqi_room.rematch_offers o SET created_at=t.now-interval '31 seconds', expires_at=t.now-interval '1 second' FROM t WHERE o.room_id=$1",
      [roomId],
    );
    await expect(
      run(b.a, b.proof, [roomId], (s) => store.respondRematch(s, roomId, true)),
    ).rejects.toMatchObject({ code: "REMATCH_EXPIRED" });
    const expired = await run(h.a, h.proof, [roomId], (s) =>
      store.expireRematchOffers(s, roomId),
    );
    expect(expired).toBe(1);
    await expect(
      run(b.a, b.proof, [roomId], (s) => store.respondRematch(s, roomId, true)),
    ).rejects.toMatchObject({ code: "REMATCH_NOT_PENDING" });
  });
  it("keep side: accept then startDue starts a new match with the same colours and keeps the room chat", async () => {
    const { h, b, roomId, view } = await finishedCustomRoom();
    const chatBefore = (
      await pool.query(
        "SELECT pair_epoch FROM xiangqi_chat.rooms WHERE room_id=$1",
        [roomId],
      )
    ).rows[0];
    await run(h.a, h.proof, [roomId], (s) =>
      matchStore.proposeRematch(s, roomId, "KEEP"),
    );
    await run(b.a, b.proof, [roomId], (s) =>
      matchStore.respondRematch(s, roomId, true),
    );
    await pool.query(
      "UPDATE xiangqi_room.countdowns SET due_at=clock_timestamp()-interval '1 second' WHERE room_id=$1",
      [roomId],
    );
    await run(h.a, h.proof, [roomId], (s) => matchStore.startDue(s, roomId));
    expect(startCalls).toEqual([
      {
        roomId,
        redId: view.room.seats.red,
        blackId: view.room.seats.black,
        startToken: expect.any(String),
        timeControlSeconds: expect.anything(),
        startedAt: expect.anything(),
      },
    ]);
    const room = (
      await pool.query(
        "SELECT status,current_match_id FROM public.rooms WHERE id=$1",
        [roomId],
      )
    ).rows[0];
    expect(room.status).toBe("PLAYING");
    expect(room.current_match_id).toBeTruthy();
    expect(
      (
        await pool.query(
          "SELECT count(*)::int AS n FROM xiangqi_room.countdowns WHERE room_id=$1",
          [roomId],
        )
      ).rows[0].n,
    ).toBe(0);
    expect(
      (
        await pool.query(
          "SELECT pair_epoch FROM xiangqi_chat.rooms WHERE room_id=$1",
          [roomId],
        )
      ).rows[0],
    ).toEqual(chatBefore);
  });
  it("swap side: the new match puts the previous black player on red", async () => {
    const { h, b, roomId, view } = await finishedCustomRoom();
    await run(h.a, h.proof, [roomId], (s) =>
      matchStore.proposeRematch(s, roomId, "SWAP"),
    );
    await run(b.a, b.proof, [roomId], (s) =>
      matchStore.respondRematch(s, roomId, true),
    );
    await pool.query(
      "UPDATE xiangqi_room.countdowns SET due_at=clock_timestamp()-interval '1 second' WHERE room_id=$1",
      [roomId],
    );
    await run(h.a, h.proof, [roomId], (s) => matchStore.startDue(s, roomId));
    expect(startCalls[0]).toMatchObject({
      redId: view.room.seats.black,
      blackId: view.room.seats.red,
    });
  });
  it("concurrent offers: the responder cannot open a second offer while one is pending", async () => {
    const { h, b, roomId } = await finishedCustomRoom();
    await run(h.a, h.proof, [roomId], (s) =>
      matchStore.proposeRematch(s, roomId, "KEEP"),
    );
    await expect(
      run(b.a, b.proof, [roomId], (s) =>
        matchStore.proposeRematch(s, roomId, "SWAP"),
      ),
    ).rejects.toMatchObject({ code: "REMATCH_ALREADY_PENDING" });
  });
  it("a seat change voids a pending offer; the late accept is rejected", async () => {
    const { h, b, roomId } = await finishedCustomRoom();
    await run(h.a, h.proof, [roomId], (s) =>
      matchStore.proposeRematch(s, roomId, "SWAP"),
    );
    await run(b.a, b.proof, [roomId], (s) => matchStore.toSpectator(s, roomId));
    expect(
      (
        await pool.query(
          "SELECT status FROM xiangqi_room.rematch_offers WHERE room_id=$1",
          [roomId],
        )
      ).rows[0].status,
    ).not.toBe("PENDING");
    await expect(
      run(b.a, b.proof, [roomId], (s) =>
        matchStore.respondRematch(s, roomId, true),
      ),
    ).rejects.toMatchObject({ code: "REMATCH_NOT_PENDING" });
    expect(startCalls).toHaveLength(0);
  });
  it("accept then a player drops before the countdown: startDue cancels and no match starts", async () => {
    const { h, b, roomId, bPresence } = await finishedCustomRoom();
    await run(h.a, h.proof, [roomId], (s) =>
      matchStore.proposeRematch(s, roomId, "KEEP"),
    );
    await run(b.a, b.proof, [roomId], (s) =>
      matchStore.respondRematch(s, roomId, true),
    );
    await run(b.a, b.proof, [roomId], (s) =>
      matchStore.presence(s, roomId, bPresence, false),
    );
    await pool.query(
      "UPDATE xiangqi_room.countdowns SET due_at=clock_timestamp()-interval '1 second' WHERE room_id=$1",
      [roomId],
    );
    await run(h.a, h.proof, [roomId], (s) => matchStore.startDue(s, roomId));
    expect(startCalls).toHaveLength(0);
    expect(
      (
        await pool.query("SELECT status FROM public.rooms WHERE id=$1", [
          roomId,
        ])
      ).rows[0].status,
    ).toBe("WAITING");
  });
  it.each(["KEEP", "SWAP"] as const)(
    "%s cannot create a rematch for A-C from the previous A-B result",
    async (side) => {
      const fixture = await finishedCustomRoom();
      const { h, roomId } = fixture;
      const replacement = await replaceOpponent(fixture);
      for (const player of [h, replacement])
        await expect(
          run(player.a, player.proof, [roomId], (s) =>
            matchStore.proposeRematch(s, roomId, side),
          ),
        ).rejects.toMatchObject({ code: "REMATCH_DENIED" });
      const state = (
        await pool.query(
          "SELECT (SELECT count(*)::int FROM xiangqi_room.rematch_offers WHERE room_id=$1) AS offers, (SELECT count(*)::int FROM xiangqi_room.countdowns WHERE room_id=$1) AS countdowns, (SELECT count(*)::int FROM public.matches WHERE room_id=$1) AS matches, status FROM public.rooms WHERE id=$1",
          [roomId],
        )
      ).rows[0];
      expect(state).toEqual({
        offers: 0,
        countdowns: 0,
        matches: 1,
        status: "WAITING",
      });
      expect(startCalls).toHaveLength(0);
    },
  );
  it("rejects an old persisted A-C offer tied to A-B instead of starting a different pair", async () => {
    const fixture = await finishedCustomRoom();
    const { h, roomId } = fixture;
    const replacement = await replaceOpponent(fixture);
    // Model an offer previously accepted by the old implementation, using the real schema.
    await pool.query(
      "WITH t AS MATERIALIZED(SELECT clock_timestamp() AS now) INSERT INTO xiangqi_room.rematch_offers(id,room_id,match_id,proposer_id,responder_id,side,status,created_at,expires_at,resolved_at) SELECT $1,$2,m.id,$3,$4,'SWAP','PENDING',t.now,t.now+interval '30 seconds',NULL FROM public.matches m CROSS JOIN t WHERE m.room_id=$2 ORDER BY m.created_at DESC LIMIT 1",
      [randomUUID(), roomId, h.a.userId, replacement.a.userId],
    );
    await expect(
      run(replacement.a, replacement.proof, [roomId], (s) =>
        matchStore.respondRematch(s, roomId, true),
      ),
    ).rejects.toMatchObject({ code: "REMATCH_STALE" });
    const state = (
      await pool.query(
        "SELECT (SELECT count(*)::int FROM xiangqi_room.countdowns WHERE room_id=$1) AS countdowns, (SELECT count(*)::int FROM public.matches WHERE room_id=$1) AS matches, status FROM public.rooms WHERE id=$1",
        [roomId],
      )
    ).rows[0];
    expect(state).toEqual({ countdowns: 0, matches: 1, status: "WAITING" });
    expect(startCalls).toHaveLength(0);
  });
  it("keeps a locked custom room locked while the same pair rematches without a visible code", async () => {
    const { h, b, roomId, view } = await finishedCustomRoom();
    const locked = await run(h.a, h.proof, [roomId], (s) =>
      matchStore.changeVisibility(s, roomId, view.version, "LOCKED"),
    );
    expect(locked.room.inviteCode).toBeNull();
    const storedBefore = (
      await pool.query(
        "SELECT invite_code,time_control FROM public.rooms WHERE id=$1",
        [roomId],
      )
    ).rows[0];
    expect(storedBefore.invite_code).toBe(view.room.inviteCode);
    await run(h.a, h.proof, [roomId], (s) =>
      matchStore.proposeRematch(s, roomId, "KEEP"),
    );
    const accepted = await run(b.a, b.proof, [roomId], (s) =>
      matchStore.respondRematch(s, roomId, true),
    );
    expect(accepted.room.visibility).toBe("LOCKED");
    expect(accepted.room.inviteCode).toBeNull();
    expect(accepted.room.countdown).not.toBeNull();
    await pool.query(
      "UPDATE xiangqi_room.countdowns SET due_at=clock_timestamp()-interval '1 second' WHERE room_id=$1",
      [roomId],
    );
    await run(h.a, h.proof, [roomId], (s) => matchStore.startDue(s, roomId));
    expect(startCalls).toHaveLength(1);
    expect(
      (
        await pool.query(
          "SELECT visibility,invite_code,time_control,status FROM public.rooms WHERE id=$1",
          [roomId],
        )
      ).rows[0],
    ).toEqual({ ...storedBefore, visibility: "LOCKED", status: "PLAYING" });
  });
  it("a ranked room without an invite code is rejected with REMATCH_DENIED", async () => {
    const h = await admitted();
    const roomId = randomUUID();
    await pool.query(
      "INSERT INTO public.rooms(id,owner_id,name,visibility,time_control,viewer_limit,invite_code,room_version) VALUES($1,$2,'ranked','CODE_ONLY',600,0,NULL,1)",
      [roomId, h.a.userId],
    );
    await pool.query(
      "INSERT INTO public.room_members(room_id,user_id,role,side,disconnected_at) VALUES($1,$2,'PLAYER','RED',NULL)",
      [roomId, h.a.userId],
    );
    await expect(
      run(h.a, h.proof, [roomId], (s) =>
        store.proposeRematch(s, roomId, "KEEP"),
      ),
    ).rejects.toMatchObject({ code: "REMATCH_DENIED" });
  });
});
