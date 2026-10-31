import { randomUUID } from "node:crypto";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { databaseUrl, pool } from "./room.test-helper.js";
import {
  admitted,
  connectedPair,
  resetRoomSchema,
  run,
  store,
} from "./room-host-start.test-helper.js";

afterAll(() => pool.end());

const countdowns = async (roomId: string) =>
  (
    await pool.query(
      "SELECT count(*)::int AS n FROM xiangqi_room.countdowns WHERE room_id=$1",
      [roomId],
    )
  ).rows[0].n as number;

describe.skipIf(!databaseUrl)(
  "YC2 Host Bắt đầu và Nhường Host (mục 21)",
  () => {
    beforeEach(resetRoomSchema);

    it("Host không có Sẵn sàng (AC-YC2-RV-01)", async () => {
      const { h, roomId } = await connectedPair();
      await expect(
        run(h.a, h.proof, [roomId], (s) => store.ready(s, roomId, true)),
      ).rejects.toMatchObject({ code: "READY_DENIED" });
    });

    it("đối thủ Sẵn sàng không tự đếm ngược (AC-YC2-RV-02)", async () => {
      const { b, roomId } = await connectedPair();
      const view = await run(b.a, b.proof, [roomId], (s) =>
        store.ready(s, roomId, true),
      );
      expect(view.room.countdown).toBeNull();
      expect(await countdowns(roomId)).toBe(0);
    });

    it("Host Bắt đầu khi đối thủ Sẵn sàng thì đếm đúng một lần (AC-YC2-RV-03)", async () => {
      const { h, b, roomId } = await connectedPair();
      await run(b.a, b.proof, [roomId], (s) => store.ready(s, roomId, true));
      const view = await run(h.a, h.proof, [roomId], (s) =>
        store.start(s, roomId),
      );
      expect(view.room.countdown).not.toBeNull();
      await expect(
        run(h.a, h.proof, [roomId], (s) => store.start(s, roomId)),
      ).rejects.toMatchObject({ code: "START_DENIED" });
      expect(await countdowns(roomId)).toBe(1);
    });

    it("từ chối Bắt đầu khi đối thủ chưa Sẵn sàng hoặc người gọi không phải Host (AC-YC2-RV-05)", async () => {
      const { h, b, roomId } = await connectedPair();
      await expect(
        run(h.a, h.proof, [roomId], (s) => store.start(s, roomId)),
      ).rejects.toMatchObject({ code: "START_DENIED" });
      await run(b.a, b.proof, [roomId], (s) => store.ready(s, roomId, true));
      await expect(
        run(b.a, b.proof, [roomId], (s) => store.start(s, roomId)),
      ).rejects.toMatchObject({ code: "START_DENIED" });
      expect(await countdowns(roomId)).toBe(0);
    });

    it("Host ngồi một mình không Bắt đầu được (AC-YC2-RV-01)", async () => {
      const { h, b, roomId } = await connectedPair();
      await run(b.a, b.proof, [roomId], (s) => store.leave(s, roomId));
      await expect(
        run(h.a, h.proof, [roomId], (s) => store.start(s, roomId)),
      ).rejects.toMatchObject({ code: "START_DENIED" });
    });

    it("đối thủ Hủy Sẵn sàng khi đang đếm thì hủy đếm và reset (AC-YC2-RV-04)", async () => {
      const { h, b, roomId } = await connectedPair();
      await run(b.a, b.proof, [roomId], (s) => store.ready(s, roomId, true));
      await run(h.a, h.proof, [roomId], (s) => store.start(s, roomId));
      const view = await run(b.a, b.proof, [roomId], (s) =>
        store.ready(s, roomId, false),
      );
      expect(view.room.countdown).toBeNull();
      expect(view.room.ready).toEqual({ red: false, black: false });
    });

    it("Nhường Host chuyển ngay, giữ ghế, reset Sẵn sàng (AC-YC2-RV-06)", async () => {
      const { h, b, roomId } = await connectedPair();
      await run(b.a, b.proof, [roomId], (s) => store.ready(s, roomId, true));
      const before = await run(h.a, h.proof, [roomId], (s) =>
        store.snapshot(s, roomId),
      );
      const view = await run(h.a, h.proof, [roomId], (s) =>
        store.transferHost(s, roomId),
      );
      expect(view.room.hostId).toBe(b.a.userId);
      expect(view.room.seats).toEqual(before.room.seats);
      expect(view.room.ready).toEqual({ red: false, black: false });
      await expect(
        run(h.a, h.proof, [roomId], (s) => store.start(s, roomId)),
      ).rejects.toMatchObject({ code: "START_DENIED" });
    });

    it("từ chối Nhường Host khi đang đếm, một mình hoặc không phải Host (AC-YC2-RV-07)", async () => {
      const { h, b, roomId } = await connectedPair();
      await expect(
        run(b.a, b.proof, [roomId], (s) => store.transferHost(s, roomId)),
      ).rejects.toMatchObject({ code: "HOST_TRANSFER_DENIED" });
      await run(b.a, b.proof, [roomId], (s) => store.ready(s, roomId, true));
      await run(h.a, h.proof, [roomId], (s) => store.start(s, roomId));
      await expect(
        run(h.a, h.proof, [roomId], (s) => store.transferHost(s, roomId)),
      ).rejects.toMatchObject({ code: "HOST_TRANSFER_DENIED" });
      await run(b.a, b.proof, [roomId], (s) => store.leave(s, roomId));
      await expect(
        run(h.a, h.proof, [roomId], (s) => store.transferHost(s, roomId)),
      ).rejects.toMatchObject({ code: "HOST_TRANSFER_DENIED" });
    });

    it("vượt 60 lệnh Sẵn sàng/phút thì bị từ chối, không ghi dữ liệu (AC-YC2-RV-10)", async () => {
      const { b, roomId } = await connectedPair();
      for (let i = 0; i < 60; i++)
        await run(b.a, b.proof, [roomId], (s) =>
          store.ready(s, roomId, i % 2 === 0),
        );
      await expect(
        run(b.a, b.proof, [roomId], (s) => store.ready(s, roomId, true)),
      ).rejects.toMatchObject({ code: "ROOM_RATE_LIMITED", status: 429 });
      const view = await run(b.a, b.proof, [roomId], (s) =>
        store.snapshot(s, roomId),
      );
      expect(view.room.ready).toEqual({ red: false, black: false });
    });

    it("tạo, rời rồi tạo lại liên tục đều thành công dưới trần (AC-YC2-RV-09)", async () => {
      const h = await admitted();
      for (let i = 0; i < 5; i++) {
        const e = await run(h.a, h.proof, [], (s) =>
          store.create(s, { commandId: randomUUID() }),
        );
        await run(h.a, h.proof, [e.roomId], (s) => store.leave(s, e.roomId));
      }
    });

    it("người đang xem (đã rời ghế) vẫn tạo được phòng ở Sảnh (AC-YC2-RV-08)", async () => {
      const { b, roomId } = await connectedPair();
      await run(b.a, b.proof, [roomId], (s) => store.toSpectator(s, roomId));
      await run(b.a, b.proof, [roomId], (s) => store.leave(s, roomId));
      const created = await run(b.a, b.proof, [], (s) =>
        store.create(s, { commandId: randomUUID() }),
      );
      expect(created.role).toBe("red");
      const viewers = await pool.query(
        "SELECT count(*)::int AS n FROM public.room_members WHERE room_id=$1 AND user_id=$2",
        [roomId, b.a.userId],
      );
      expect(viewers.rows[0].n).toBe(0);
    });

    it("người ngoài phòng không Bắt đầu hay Nhường Host được", async () => {
      const { roomId } = await connectedPair();
      const outsider = await admitted();
      await expect(
        run(outsider.a, outsider.proof, [roomId], (s) =>
          store.start(s, roomId),
        ),
      ).rejects.toMatchObject({ code: expect.any(String) });
      await expect(
        run(outsider.a, outsider.proof, [roomId], (s) =>
          store.transferHost(s, roomId),
        ),
      ).rejects.toMatchObject({ code: expect.any(String) });
    });
  },
);
