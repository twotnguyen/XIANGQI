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
import { RoomStore } from "@server/game/room/room-store.js";

afterAll(() => pool.end());

class ScriptedCodes extends RoomStore {
  constructor(private readonly queue: string[]) {
    super();
  }
  protected override generateCode() {
    return this.queue.shift()!;
  }
}

const issued = async () =>
  (
    await pool.query("SELECT code FROM xiangqi_room.issued_codes ORDER BY code")
  ).rows.map((r: { code: string }) => r.code);

describe.skipIf(!databaseUrl)(
  "YC3 mã phòng không tái sử dụng (AC-YC3-RV-03)",
  () => {
    beforeEach(resetRoomSchema);

    it("ghi mọi mã đã cấp và không cấp lại mã đã dùng của phòng khác", async () => {
      const h = await admitted();
      await pool.query(
        "INSERT INTO xiangqi_room.issued_codes(code) VALUES('11111111')",
      );
      const scripted = new ScriptedCodes(["11111111", "22222222"]);
      const entry = await run(h.a, h.proof, [], (s) =>
        scripted.create(s, { commandId: randomUUID() }),
      );
      expect(entry.inviteCode).toBe("22222222");
      expect(await issued()).toEqual(["11111111", "22222222"]);
    });

    it("mã bị xoay đi khi khóa rồi mở lại vẫn được giữ lại, không cấp cho phòng mới", async () => {
      const { h, roomId } = await connectedPair();
      const before = (
        await pool.query("SELECT invite_code FROM public.rooms WHERE id=$1", [
          roomId,
        ])
      ).rows[0].invite_code as string;
      const lock = async (visibility: "LOCKED" | "CODE_ONLY") => {
        const { version } = await run(h.a, h.proof, [roomId], (s) =>
          store.snapshot(s, roomId),
        );
        await run(h.a, h.proof, [roomId], (s) =>
          store.changeVisibility(s, roomId, version, visibility),
        );
      };
      await lock("LOCKED");
      await lock("CODE_ONLY");
      const after = (
        await pool.query("SELECT invite_code FROM public.rooms WHERE id=$1", [
          roomId,
        ])
      ).rows[0].invite_code as string;
      expect(after).not.toBe(before);
      expect(await issued()).toEqual([before, after].sort());
      const other = await admitted();
      const reuse = new ScriptedCodes([before, "33333333"]);
      const entry = await run(other.a, other.proof, [], (s) =>
        reuse.create(s, { commandId: randomUUID() }),
      );
      expect(entry.inviteCode).toBe("33333333");
    });

    it("mã của phòng đã đóng luôn báo không tồn tại hoặc đã đóng", async () => {
      const h = await admitted();
      const entry = await run(h.a, h.proof, [], (s) =>
        store.create(s, { commandId: randomUUID() }),
      );
      await run(h.a, h.proof, [entry.roomId], (s) =>
        store.leave(s, entry.roomId),
      );
      await expect(
        run(h.a, h.proof, [], (s) =>
          store.resolveCode(s.client, entry.inviteCode),
        ),
      ).rejects.toMatchObject({
        code: "ROOM_FORBIDDEN",
        message: "Mã phòng không tồn tại hoặc phòng đã đóng",
      });
    });
  },
);
