import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  actor,
  databaseUrl,
  pool,
  reset,
} from "../room/room-transactions.test-helper";

const anchor = (ms: number) => ({
  redMs: ms,
  blackMs: ms,
  runningSinceEpochMs: Date.now(),
});

describe.skipIf(!databaseUrl)(
  "matches clock presence invariant (migration 03)",
  () => {
    beforeAll(async () => {
      await reset();
    }, 120_000);
    afterAll(async () => {
      await pool.end();
    });

    it("accepts AI time 0 with NULL clock (legacy shape)", async () => {
      const red = await actor();
      await expect(
        pool.query(
          "INSERT INTO public.matches(id,mode,red_user_id,ai_side,ai_level,position,time_control,clock) VALUES($1,'AI',$2,'BLACK','EASY',$3,0,NULL)",
          [
            randomUUID(),
            red.userId,
            { board: Array(90).fill(null), turn: "RED" },
          ],
        ),
      ).resolves.toBeDefined();
    });

    it("rejects AI timed match with NULL clock", async () => {
      const red = await actor();
      await expect(
        pool.query(
          "INSERT INTO public.matches(id,mode,red_user_id,ai_side,ai_level,position,time_control,clock) VALUES($1,'AI',$2,'BLACK','EASY',$3,600,NULL)",
          [
            randomUUID(),
            red.userId,
            { board: Array(90).fill(null), turn: "RED" },
          ],
        ),
      ).rejects.toThrow(/matches_clock_presence_check/);
    });

    it("rejects AI time 0 with a non-NULL clock anchor", async () => {
      const red = await actor();
      await expect(
        pool.query(
          "INSERT INTO public.matches(id,mode,red_user_id,ai_side,ai_level,position,time_control,clock) VALUES($1,'AI',$2,'BLACK','EASY',$3,0,$4)",
          [
            randomUUID(),
            red.userId,
            { board: Array(90).fill(null), turn: "RED" },
            anchor(0),
          ],
        ),
      ).rejects.toThrow(/matches_clock_presence_check/);
    });

    describe("ONLINE unlimited room", () => {
      async function unlimitedRoom() {
        const owner = await actor();
        const black = await actor();
        const roomId = randomUUID();
        await pool.query(
          "INSERT INTO public.rooms(id,owner_id,name,time_control) VALUES($1,$2,'Unlimited regression',0)",
          [roomId, owner.userId],
        );
        return { roomId, red: owner.userId, black: black.userId };
      }
      const position = { board: Array(90).fill(null), turn: "RED" };

      it("accepts time 0 with zero anchor clock", async () => {
        const r = await unlimitedRoom();
        await expect(
          pool.query(
            "INSERT INTO public.matches(id,room_id,mode,status,red_user_id,black_user_id,position,time_control,clock) VALUES($1,$2,'ONLINE','ACTIVE',$3,$4,$5,0,$6)",
            [randomUUID(), r.roomId, r.red, r.black, position, anchor(0)],
          ),
        ).resolves.toBeDefined();
      });

      it("rejects time 0 with nonzero anchor clock", async () => {
        const r = await unlimitedRoom();
        await expect(
          pool.query(
            "INSERT INTO public.matches(id,room_id,mode,status,red_user_id,black_user_id,position,time_control,clock) VALUES($1,$2,'ONLINE','ACTIVE',$3,$4,$5,0,$6)",
            [randomUUID(), r.roomId, r.red, r.black, position, anchor(1000)],
          ),
        ).rejects.toThrow(/matches_clock_presence_check/);
      });

      it("rejects timed ONLINE match with NULL clock", async () => {
        const r = await unlimitedRoom();
        await expect(
          pool.query(
            "INSERT INTO public.matches(id,room_id,mode,status,red_user_id,black_user_id,position,time_control,clock) VALUES($1,$2,'ONLINE','ACTIVE',$3,$4,$5,600,NULL)",
            [randomUUID(), r.roomId, r.red, r.black, position],
          ),
        ).rejects.toThrow(/matches_clock_presence_check/);
      });
    });
  },
);
