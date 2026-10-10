import { randomUUID } from "node:crypto";
import { beforeAll, describe, it, expect } from "vitest";
import {
  baseline,
  apply,
  pool,
  databaseUrl,
} from "../google/database.test-helper.js";
import { GuestService } from "./guest.service.js";
import type { GuestRoomPort } from "./contracts.js";
describe.skipIf(!databaseUrl)(
  "Guest capability lifecycle with real transactions",
  () => {
    let time = new Date("2026-10-11T00:00:00Z");
    const rooms: GuestRoomPort = {
      async seatedSeat(c, id) {
        const room = (
          await c.query(
            "SELECT room_id FROM public.room_members WHERE user_id=$1 AND role='PLAYER' ORDER BY room_id LIMIT 1",
            [id],
          )
        ).rows[0]?.room_id;
        return room ? { kind: "room" as const, roomId: room } : null;
      },
      async end(c, id) {
        await c.query("DELETE FROM public.room_members WHERE user_id=$1", [id]);
      },
    };
    const service = () => new GuestService(pool, rooms, () => time);
    beforeAll(async () => {
      await baseline();
      await apply("supabase/migrations/20261011000005_google_guest.sql");
    });
    it("issues opaque fixed12h proof without creating Auth account and rejects malformed/forbidden names", async () => {
      const count = (await pool.query("SELECT count(*)::int n FROM auth.users"))
        .rows[0].n;
      const session = await service().create("  Người thử  ");
      expect(session.displayName).toBe("Người thử");
      expect(session.expiresAt).toBe("2026-10-11T12:00:00.000Z");
      expect(session.capability).toMatch(/^[A-Za-z0-9_-]{43}$/);
      expect(
        (await pool.query("SELECT count(*)::int n FROM auth.users")).rows[0].n,
      ).toBe(count);
      const stored = (
        await pool.query(
          "SELECT token_hash FROM xiangqi_auth.guest_sessions WHERE guest_id=$1",
          [session.userId],
        )
      ).rows[0].token_hash;
      expect(stored).not.toContain(session.capability);
      for (const invalid of ["x", "a".repeat(21), "hi\nthere", "địt mẹ"])
        await expect(service().create(invalid)).rejects.toMatchObject({
          code: "GUEST_NAME_INVALID",
        });
      await expect(service().requireActive("bad")).rejects.toMatchObject({
        code: "GUEST_INVALID",
      });
    });
    it("expires non-seated guest at exact deadline, wipes name/capability, permits duplicate names", async () => {
      time = new Date("2026-10-11T00:00:00Z");
      const a = await service().create("Cùng tên"),
        b = await service().create("Cùng tên");
      expect(a.userId).not.toBe(b.userId);
      time = new Date("2026-10-11T12:00:00Z");
      await expect(service().requireActive(a.capability)).rejects.toMatchObject(
        { code: "GUEST_EXPIRED" },
      );
      expect(
        (
          await pool.query(
            "SELECT display_name FROM public.profiles WHERE user_id=$1",
            [a.userId],
          )
        ).rows[0].display_name,
      ).toBe("Khách");
      expect(
        (
          await pool.query(
            "SELECT count(*)::int n FROM xiangqi_auth.guest_sessions WHERE guest_id=$1",
            [a.userId],
          )
        ).rows[0].n,
      ).toBe(0);
    });
    it("defers while seated but denies other room mutation and expires atomically after leave", async () => {
      time = new Date("2026-10-11T00:00:00Z");
      const s = await service().create("Giữ ghế"),
        room = randomUUID();
      await pool.query(
        "INSERT INTO public.rooms(id,owner_id,name) VALUES($1,$2,'Fixture')",
        [room, s.userId],
      );
      await pool.query(
        "INSERT INTO public.room_members(room_id,user_id,role,side) VALUES($1,$2,'PLAYER','RED')",
        [room, s.userId],
      );
      time = new Date("2026-10-11T12:00:00Z");
      expect(
        (await service().requireActive(s.capability, "existing-room", room))
          .deferred,
      ).toBe(true);
      await expect(
        service().requireActive(s.capability, "new-room"),
      ).rejects.toMatchObject({ code: "GUEST_DEFERRED" });
      await service().withActor(
        s.capability,
        "existing-room",
        room,
        async (c) => {
          await c.query("DELETE FROM public.room_members WHERE user_id=$1", [
            s.userId,
          ]);
        },
      );
      await expect(service().requireActive(s.capability)).rejects.toMatchObject(
        { code: "GUEST_INVALID" },
      );
      expect(
        (
          await pool.query("SELECT owner_id FROM public.rooms WHERE id=$1", [
            room,
          ])
        ).rows[0].owner_id,
      ).toBe(s.userId);
    });
    it("fails closed without room adapter and rolls back logout if room cleanup fails", async () => {
      time = new Date("2026-10-11T00:00:00Z");
      const s = await service().create("An toàn");
      await expect(
        new GuestService(pool).requireActive(s.capability),
      ).rejects.toMatchObject({ code: "GUEST_UNAVAILABLE" });
      const bad = new GuestService(
        pool,
        {
          ...rooms,
          async end() {
            throw new Error("sensitive fixture");
          },
        },
        () => time,
      );
      await expect(bad.logout(s.capability, true)).rejects.toMatchObject({
        code: "GUEST_UNAVAILABLE",
      });
      expect((await service().requireActive(s.capability)).displayName).toBe(
        "An toàn",
      );
      await service().logout(s.capability, true);
      await expect(service().requireActive(s.capability)).rejects.toMatchObject(
        { code: "GUEST_INVALID" },
      );
    });
    it("serializes expiry and seat mutation on actor lock", async () => {
      time = new Date("2026-10-11T00:00:00Z");
      const s = await service().create("Đua ghế"),
        room = randomUUID();
      await pool.query(
        "INSERT INTO public.rooms(id,owner_id,name) VALUES($1,$2,'Race')",
        [room, s.userId],
      );
      let entered!: () => void, release!: () => void;
      const started = new Promise<void>((r) => (entered = r)),
        gate = new Promise<void>((r) => (release = r));
      const seating = service().withActor(
        s.capability,
        "join-room",
        undefined,
        async (c) => {
          entered();
          await gate;
          await c.query(
            "INSERT INTO public.room_members(room_id,user_id,role,side) VALUES($1,$2,'PLAYER','RED')",
            [room, s.userId],
          );
        },
      );
      await started;
      time = new Date("2026-10-11T12:00:00Z");
      const expiry = service().requireActive(
        s.capability,
        "existing-room",
        room,
      );
      release();
      await seating;
      expect((await expiry).deferred).toBe(true);
    });
    it("supports caller-owned actor-before-room transaction hook and maintenance on hashed capabilities", async () => {
      time = new Date("2026-10-12T00:00:00Z");
      const s = await service().create("Hook phòng");
      const c = await pool.connect();
      try {
        await c.query("BEGIN");
        await c.query("SET LOCAL ROLE app_server");
        const authorized = await service().requireActorInTransaction(
          c,
          s.capability,
          "read",
        );
        expect(authorized.status).toBe("active");
        if (authorized.status === "active")
          await service().finishActorMutation(c, authorized.actor);
        await c.query("COMMIT");
      } finally {
        await c.query("ROLLBACK");
        c.release();
      }
      time = new Date("2026-10-12T12:00:00Z");
      await service().expireDue();
      await expect(service().requireActive(s.capability)).rejects.toMatchObject(
        { code: "GUEST_INVALID" },
      );
    });
    it("serializes two new-room commands and preserves one open room including FINISHED", async () => {
      time = new Date("2026-10-13T00:00:00Z");
      const s = await service().create("Một phòng");
      const create = () =>
        service().withActor(s.capability, "new-room", undefined, async (c) => {
          const id = randomUUID();
          await c.query(
            "INSERT INTO public.rooms(id,owner_id,name) VALUES($1,$2,'Parallel')",
            [id, s.userId],
          );
          return id;
        });
      const results = await Promise.allSettled([create(), create()]);
      expect(results.filter((x) => x.status === "fulfilled")).toHaveLength(1);
      expect(results.filter((x) => x.status === "rejected")).toHaveLength(1);
      expect(
        (
          await pool.query(
            "SELECT count(*)::int n FROM public.rooms WHERE owner_id=$1 AND closed_at IS NULL",
            [s.userId],
          )
        ).rows[0].n,
      ).toBe(1);
    });
    it("progresses past 100 deferred guests without expiring their seats or extending deadlines", async () => {
      time = new Date("2026-10-16T00:00:00Z");
      const maintenance = service();
      const seated = [];
      for (let i = 0; i < 100; i++) {
        const guest = await maintenance.create(`Giữ ghế ${i}`);
        seated.push(guest);
        const room = randomUUID();
        await pool.query(
          "INSERT INTO public.rooms(id,owner_id,name) VALUES($1,$2,'Deferred')",
          [room, guest.userId],
        );
        await pool.query(
          "INSERT INTO public.room_members(room_id,user_id,role,side) VALUES($1,$2,'PLAYER','RED')",
          [room, guest.userId],
        );
      }
      time = new Date("2026-10-16T00:00:00.001Z");
      const later = await maintenance.create("Phía sau");
      time = new Date("2026-10-16T12:00:01Z");
      await maintenance.expireDue();
      await maintenance.expireDue();
      expect(
        (
          await pool.query(
            "SELECT count(*)::int n FROM xiangqi_auth.guest_sessions WHERE guest_id=$1",
            [later.userId],
          )
        ).rows[0].n,
      ).toBe(0);
      expect(
        (
          await pool.query(
            "SELECT count(*)::int n FROM xiangqi_auth.guest_sessions WHERE guest_id=ANY($1::uuid[]) AND expires_at=$2",
            [seated.map((guest) => guest.userId), "2026-10-16T12:00:00.000Z"],
          )
        ).rows[0].n,
      ).toBe(100);
    });
  },
);
