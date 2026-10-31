import { randomUUID } from "node:crypto";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { databaseUrl, pool } from "./room.test-helper.js";
import {
  admitted,
  connect,
  playMatch,
  as,
  fullRoom,
  joinAs,
  migrateViewers,
  reserveAi,
  store,
  type Person,
} from "./room-viewers.test-helper.js";
afterAll(() => pool.end());
const view = (p: Person, roomId: string) =>
  as(p, roomId, (s) => store.snapshot(s, roomId));
const request = (p: Person, roomId: string) =>
  as(p, roomId, (s) => store.requestSeat(s, roomId));
const answer = (
  host: Person,
  roomId: string,
  requestId: string,
  accept: boolean,
) =>
  as(host, roomId, (s) =>
    store.respondSeatRequest(s, roomId, requestId, accept),
  );
/** Dời mốc thời gian của yêu cầu/lời mời về quá khứ để kiểm hạn 30 giây và cooldown 10 giây mà không ngủ. */
async function age(table: "seat_requests" | "seat_invites", seconds: number) {
  await pool.query(
    `UPDATE xiangqi_room.${table} SET created_at=created_at-make_interval(secs=>$1),expires_at=expires_at-make_interval(secs=>$1),resolved_at=resolved_at-make_interval(secs=>$1)`,
    [seconds],
  );
}
/** Host + người chơi b, b xuống xem để còn ghế Đen; w là người xem. */
async function openSeat() {
  const f = await fullRoom();
  await as(f.b, f.roomId, (s) => store.toSpectator(s, f.roomId));
  return f;
}
describe.skipIf(!databaseUrl)("seat requests, leave invites, names", () => {
  beforeEach(migrateViewers);
  it("shows requests only to the host and the requester; a repeat neither duplicates nor extends", async () => {
    const { h, b, w, roomId } = await openSeat();
    const sent = await request(w, roomId);
    expect(sent.room.seatRequests).toHaveLength(1);
    const [mine] = sent.room.seatRequests!;
    expect(mine).toMatchObject({ userId: w.a.userId });
    expect((await view(h, roomId)).room.seatRequests).toEqual([mine]);
    expect((await view(b, roomId)).room.seatRequests).toEqual([]);
    const again = await request(w, roomId);
    expect(again.room.seatRequests).toEqual([mine]);
    expect(
      (
        await pool.query(
          "SELECT count(*)::int AS n FROM xiangqi_room.seat_requests",
        )
      ).rows[0].n,
    ).toBe(1);
  });
  it("seats the requester at once and closes the other requests without a cooldown", async () => {
    const { h, b, w, roomId } = await openSeat();
    const third = await admitted();
    await joinAs(third, roomId, "watch");
    await request(w, roomId);
    await request(b, roomId);
    const asked = await request(third, roomId);
    expect(asked.room.seatRequests).toHaveLength(1);
    const list = (await view(h, roomId)).room.seatRequests!;
    expect(list).toHaveLength(3);
    const winner = list.find((q) => q.userId === w.a.userId)!;
    const after = await answer(h, roomId, winner.id, true);
    expect(after.room.seats.black).toBe(w.a.userId);
    expect(after.room.ready).toEqual({ red: false, black: false });
    expect(after.room.seatRequests).toEqual([]);
    const rows = (
      await pool.query(
        "SELECT requester_id,status FROM xiangqi_room.seat_requests ORDER BY requester_id",
      )
    ).rows as { requester_id: string; status: string }[];
    expect(rows.find((r) => r.requester_id === w.a.userId)!.status).toBe(
      "ACCEPTED",
    );
    expect(
      rows.filter((r) => r.requester_id !== w.a.userId).map((r) => r.status),
    ).toEqual(["CLOSED", "CLOSED"]);
    const loser = await view(third, roomId);
    expect(loser.role).toBe("spectator");
    expect(loser.room.seatRequestCooldownUntil).toBeNull();
    expect(
      (
        await pool.query(
          "SELECT role FROM public.room_members WHERE room_id=$1 AND user_id=$2",
          [roomId, third.a.userId],
        )
      ).rows[0].role,
    ).toBe("SPECTATOR");
  });
  it("rejects a request that cannot succeed and a reply from anyone but the host", async () => {
    const { h, b, w, roomId } = await fullRoom();
    // Ghế đầy: người xem không xin được; người chơi cũng không.
    await expect(request(w, roomId)).rejects.toMatchObject({
      code: "SEAT_FULL",
    });
    await expect(request(b, roomId)).rejects.toMatchObject({
      code: "SEAT_REQUEST_DENIED",
      status: 403,
    });
    await as(b, roomId, (s) => store.toSpectator(s, roomId));
    const sent = await request(w, roomId);
    const id = sent.room.seatRequests![0]!.id;
    await expect(answer(b, roomId, id, true)).rejects.toMatchObject({
      code: "SEAT_REQUEST_DENIED",
      status: 403,
    });
    await expect(answer(w, roomId, id, true)).rejects.toMatchObject({
      code: "SEAT_REQUEST_DENIED",
    });
    await expect(answer(h, roomId, randomUUID(), true)).rejects.toMatchObject({
      code: "SEAT_REQUEST_MISSING",
    });
    // Đang ván thì không xin được.
    await playMatch(roomId, h, b);
    await expect(request(w, roomId)).rejects.toMatchObject({
      code: "SEAT_REQUEST_DENIED",
    });
  });
  it("starts a 10 s wait after Từ chối, keyed to the requester, without touching others", async () => {
    const { h, w, roomId } = await openSeat();
    const id = (await request(w, roomId)).room.seatRequests![0]!.id;
    const declined = await answer(h, roomId, id, false);
    expect(declined.room.seatRequests).toEqual([]);
    const mine = await view(w, roomId);
    const left = Date.parse(mine.room.seatRequestCooldownUntil!) - Date.now();
    expect(left).toBeGreaterThan(8000);
    expect(left).toBeLessThanOrEqual(10000);
    await expect(request(w, roomId)).rejects.toMatchObject({
      code: "SEAT_REQUEST_COOLDOWN",
    });
    expect((await view(h, roomId)).room.seatRequestCooldownUntil).toBeNull();
    await age("seat_requests", 11);
    expect((await view(w, roomId)).room.seatRequestCooldownUntil).toBeNull();
    expect((await request(w, roomId)).room.seatRequests).toHaveLength(1);
  });
  it("counts the wait from the original deadline when a request expires, not from the cleanup", async () => {
    const { w, h, roomId } = await openSeat();
    const id = (await request(w, roomId)).room.seatRequests![0]!.id;
    // Quá hạn gốc 25 giây (E=T-25): hết cooldown dù chưa ai dọn (vẫn PENDING).
    await age("seat_requests", 55);
    expect((await view(w, roomId)).room.seatRequests).toEqual([]);
    expect((await view(w, roomId)).room.seatRequestCooldownUntil).toBeNull();
    await expect(answer(h, roomId, id, true)).resolves.toMatchObject({
      room: { seats: { black: null } },
    });
    expect(
      (
        await pool.query(
          "SELECT status FROM xiangqi_room.seat_requests WHERE id=$1",
          [id],
        )
      ).rows[0].status,
    ).toBe("EXPIRED");
    // Vừa quá hạn 3 giây: còn khoảng 7 giây chờ, tính từ hạn gốc.
    await request(w, roomId);
    await age("seat_requests", 33);
    const waiting = await view(w, roomId);
    expect(waiting.room.seatRequests).toEqual([]);
    const left =
      Date.parse(waiting.room.seatRequestCooldownUntil!) - Date.now();
    expect(left).toBeGreaterThan(5000);
    expect(left).toBeLessThan(9000);
    await expect(request(w, roomId)).rejects.toMatchObject({
      code: "SEAT_REQUEST_COOLDOWN",
    });
  });
  it("refuses to seat a requester who left or took a position elsewhere", async () => {
    const { h, w, roomId } = await openSeat();
    const id = (await request(w, roomId)).room.seatRequests![0]!.id;
    const gameId = await reserveAi(w, roomId);
    await expect(answer(h, roomId, id, true)).rejects.toMatchObject({
      code: "FRIEND_BUSY",
      status: 409,
    });
    expect(
      (
        await pool.query(
          "SELECT room_id,ai_game_id FROM public.active_players WHERE user_id=$1",
          [w.a.userId],
        )
      ).rows[0],
    ).toMatchObject({ room_id: null, ai_game_id: gameId });
    expect((await view(h, roomId)).room.seats.black).toBeNull();
    await as(w, roomId, (s) => store.leave(s, roomId));
    await expect(answer(h, roomId, id, true)).rejects.toMatchObject({
      code: "SEAT_REQUEST_MISSING",
    });
  });
  it("a requester who left the room can no longer be seated", async () => {
    const { h, w, roomId } = await openSeat();
    const id = (await request(w, roomId)).room.seatRequests![0]!.id;
    await as(w, roomId, (s) => store.leave(s, roomId));
    await expect(answer(h, roomId, id, true)).rejects.toMatchObject({
      code: "SEAT_REQUEST_MISSING",
    });
  });
  it("Mời rời ghế removes the second player without a block and lets them back in", async () => {
    const { h, b, w, roomId } = await fullRoom();
    await expect(
      as(b, roomId, (s) => store.inviteLeave(s, roomId, h.a.userId)),
    ).rejects.toMatchObject({ code: "SEAT_LEAVE_DENIED", status: 403 });
    await expect(
      as(w, roomId, (s) => store.inviteLeave(s, roomId, b.a.userId)),
    ).rejects.toMatchObject({ code: "SEAT_LEAVE_DENIED" });
    await expect(
      as(h, roomId, (s) => store.inviteLeave(s, roomId, h.a.userId)),
    ).rejects.toMatchObject({ code: "SEAT_LEAVE_DENIED" });
    await expect(
      as(h, roomId, (s) => store.inviteLeave(s, roomId, w.a.userId)),
    ).rejects.toMatchObject({ code: "SEAT_LEAVE_DENIED" });
    await connect(h, roomId);
    await connect(b, roomId);
    await as(b, roomId, (s) => store.ready(s, roomId, true));
    const removed = await as(h, roomId, (s) =>
      store.inviteLeave(s, roomId, b.a.userId),
    );
    expect(removed.room.seats).toEqual({ red: h.a.userId, black: null });
    expect(removed.room.ready).toEqual({ red: false, black: false });
    expect(
      (
        await pool.query(
          "SELECT count(*)::int AS n FROM public.room_members WHERE room_id=$1 AND user_id=$2",
          [roomId, b.a.userId],
        )
      ).rows[0].n,
    ).toBe(0);
    expect(
      (
        await pool.query(
          "SELECT count(*)::int AS n FROM xiangqi_room.room_blocks WHERE room_id=$1",
          [roomId],
        )
      ).rows[0].n,
    ).toBe(0);
    const events = (
      await pool.query(
        "SELECT type,payload FROM xiangqi_room.outbox WHERE room_id=$1 AND type IN('room.removed','media.revoke-user') AND payload->>'userId'=$2 OR (type='room.removed' AND room_id=$1)",
        [roomId, b.a.userId],
      )
    ).rows;
    expect(events.map((e) => e.type).sort()).toEqual([
      "media.revoke-user",
      "room.removed",
    ]);
    expect(events.find((e) => e.type === "room.removed")!.payload).toEqual({
      recipients: [b.a.userId],
      message: "Chủ phòng đã mời bạn rời ghế",
    });
    // Còn ghế để vào lại và không có cooldown.
    const back = await joinAs(b, roomId, "auto");
    expect(back.role).toBe("black");
    // Một mình: không còn gì để mời rời.
    await as(b, roomId, (s) => store.toSpectator(s, roomId));
    await expect(
      as(h, roomId, (s) => store.inviteLeave(s, roomId, b.a.userId)),
    ).rejects.toMatchObject({ code: "SEAT_LEAVE_DENIED" });
  });
  it("refuses Mời rời ghế during a countdown or a match", async () => {
    const { h, b, roomId } = await fullRoom();
    await connect(h, roomId);
    await connect(b, roomId);
    await as(b, roomId, (s) => store.ready(s, roomId, true));
    await as(h, roomId, (s) => store.start(s, roomId));
    await expect(
      as(h, roomId, (s) => store.inviteLeave(s, roomId, b.a.userId)),
    ).rejects.toMatchObject({ code: "SEAT_LEAVE_DENIED" });
    await pool.query("DELETE FROM xiangqi_room.countdowns");
    await playMatch(roomId, h, b);
    await expect(
      as(h, roomId, (s) => store.inviteLeave(s, roomId, b.a.userId)),
    ).rejects.toMatchObject({ code: "SEAT_LEAVE_DENIED" });
  });
  it("kick queues a removal notice for the target only", async () => {
    const { b, w, roomId } = await fullRoom();
    await as(b, roomId, (s) => store.kickViewer(s, roomId, w.a.userId));
    const rows = (
      await pool.query(
        "SELECT payload FROM xiangqi_room.outbox WHERE room_id=$1 AND type='room.removed'",
        [roomId],
      )
    ).rows;
    expect(rows).toEqual([
      {
        payload: {
          recipients: [w.a.userId],
          message: "Bạn đã bị đuổi khỏi phòng và không thể vào lại.",
        },
      },
    ]);
  });
  it("answers an invite only by its own id and waits 10 s per host after a decline", async () => {
    const { h, b, roomId } = await openSeat();
    const first = await as(h, roomId, (s) =>
      store.inviteDown(s, roomId, b.a.userId),
    );
    const oldId = first.room.downOffer!.id;
    await expect(
      as(b, roomId, (s) => store.respondDown(s, roomId, randomUUID(), true)),
    ).rejects.toMatchObject({ code: "SEAT_INVITE_MISSING" });
    const declined = await as(b, roomId, (s) =>
      store.respondDown(s, roomId, oldId, false),
    );
    expect(declined.room.downOffer).toBeNull();
    const host = await view(h, roomId);
    expect(
      Date.parse(host.room.downCooldownUntil!) - Date.now(),
    ).toBeGreaterThan(8000);
    expect((await view(b, roomId)).room.downCooldownUntil).toBeNull();
    await expect(
      as(h, roomId, (s) => store.inviteDown(s, roomId, b.a.userId)),
    ).rejects.toMatchObject({ code: "SEAT_INVITE_COOLDOWN", status: 429 });
    await age("seat_invites", 11);
    const second = await as(h, roomId, (s) =>
      store.inviteDown(s, roomId, b.a.userId),
    );
    expect(second.room.downOffer!.id).not.toBe(oldId);
    // Hồi đáp muộn cho lời mời cũ không tác động lên lời mời mới.
    await expect(
      as(b, roomId, (s) => store.respondDown(s, roomId, oldId, true)),
    ).rejects.toMatchObject({ code: "SEAT_INVITE_MISSING" });
    expect((await view(b, roomId)).room.downOffer?.id).toBe(
      second.room.downOffer!.id,
    );
  });
  it("an expired invite is not answerable, leaves the viewer a viewer and counts the wait from its deadline", async () => {
    const { h, b, roomId } = await openSeat();
    const sent = await as(h, roomId, (s) =>
      store.inviteDown(s, roomId, b.a.userId),
    );
    await age("seat_invites", 33);
    expect((await view(b, roomId)).room.downOffer).toBeNull();
    const result = await as(b, roomId, (s) =>
      store.respondDown(s, roomId, sent.room.downOffer!.id, true),
    );
    expect(result.role).toBe("spectator");
    expect(result.room.seats.black).toBeNull();
    expect(
      (await pool.query("SELECT status FROM xiangqi_room.seat_invites")).rows[0]
        .status,
    ).toBe("EXPIRED");
    const left =
      Date.parse((await view(h, roomId)).room.downCooldownUntil!) - Date.now();
    expect(left).toBeGreaterThan(5000);
    expect(left).toBeLessThan(9000);
    await age("seat_invites", 10);
    expect((await view(h, roomId)).room.downCooldownUntil).toBeNull();
  });
  it("names spectators with a guest flag visible to every member", async () => {
    const { h, b, w, roomId } = await fullRoom();
    for (const p of [h, b, w]) {
      const seen = (await view(p, roomId)).room.spectators!;
      expect(seen).toEqual([
        expect.objectContaining({
          userId: w.a.userId,
          guest: w.a.kind === "guest",
        }),
      ]);
    }
  });
  it("names every player and flags a position held elsewhere only for the reader who holds it", async () => {
    const { h, b, w, roomId } = await fullRoom();
    for (const p of [h, b, w]) {
      const seen = await view(p, roomId);
      expect(seen.room.seatPlayers).toEqual({
        red: {
          userId: h.a.userId,
          displayName: expect.any(String),
          guest: h.a.kind === "guest",
        },
        black: {
          userId: b.a.userId,
          displayName: expect.any(String),
          guest: b.a.kind === "guest",
        },
      });
      expect(seen.room.occupiedElsewhere).toBe(false);
    }
    await as(b, roomId, (s) => store.toSpectator(s, roomId));
    await reserveAi(w, roomId);
    expect((await view(w, roomId)).room.occupiedElsewhere).toBe(true);
    expect((await view(h, roomId)).room.occupiedElsewhere).toBe(false);
    expect((await view(h, roomId)).room.seatPlayers?.black).toBeNull();
  });
  it("drops a requester's rows with their principal", async () => {
    const { w, roomId } = await openSeat();
    await request(w, roomId);
    await as(w, roomId, (s) => store.leave(s, roomId));
    // Biên lai idempotency giữ khóa ngoại tới principal; dọn như bước xóa danh tính thật.
    await pool.query(
      "DELETE FROM xiangqi_room.entry_receipts WHERE actor_id=$1",
      [w.a.userId],
    );
    await pool.query("DELETE FROM xiangqi_auth.principals WHERE id=$1", [
      w.a.userId,
    ]);
    expect(
      (
        await pool.query(
          "SELECT count(*)::int AS n FROM xiangqi_room.seat_requests WHERE requester_id=$1",
          [w.a.userId],
        )
      ).rows[0].n,
    ).toBe(0);
  });
  it("keeps an already expired request pending when the room leaves WAITING, so its wait still counts", async () => {
    const { h, b, w, roomId } = await openSeat();
    const third = await admitted();
    await joinAs(third, roomId, "watch");
    await request(w, roomId);
    await request(third, roomId);
    await pool.query(
      "UPDATE xiangqi_room.seat_requests SET created_at=created_at-interval '35 seconds',expires_at=expires_at-interval '35 seconds' WHERE requester_id=$1",
      [w.a.userId],
    );
    await playMatch(roomId, h, b);
    const rows = (
      await pool.query(
        "SELECT requester_id,status FROM xiangqi_room.seat_requests",
      )
    ).rows as { requester_id: string; status: string }[];
    const statusOf = (p: Person) =>
      rows.find((r) => r.requester_id === p.a.userId)!.status;
    expect(statusOf(w)).toBe("PENDING");
    expect(statusOf(third)).toBe("CLOSED");
  });
  it("reports who is still in the room for a removal notice", async () => {
    const { h, b, roomId } = await fullRoom();
    const client = await pool.connect();
    try {
      expect(
        await store.membersPresent(client, roomId, [h.a.userId, randomUUID()]),
      ).toEqual(new Set([h.a.userId]));
      await as(b, roomId, (s) => store.leave(s, roomId));
      expect(await store.membersPresent(client, roomId, [b.a.userId])).toEqual(
        new Set(),
      );
    } finally {
      client.release();
    }
  });
});
