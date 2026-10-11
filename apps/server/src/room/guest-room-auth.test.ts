import { createHash, randomUUID } from "node:crypto";
import type { PoolClient } from "pg";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { GuestService } from "../guest/guest.service.js";
import {
  GuestError,
  type GuestPurpose,
  type GuestRoomPort,
} from "../guest/contracts.js";
import {
  GuestRoomAuthorizer,
  type GuestRoomRequestProof,
} from "./guest-room-auth.js";
import { RoomTransactions, type RoomActorProof } from "./room-transactions.js";
import {
  baseline,
  apply,
  pool,
  databaseUrl,
} from "../google/database.test-helper.js";
const hash = (cap: string) => createHash("sha256").update(cap).digest("hex");
const coordinator = new RoomTransactions(pool);
async function fixture(seated = false, spectator = false) {
  let now = new Date("2026-10-11T00:00:00Z");
  // Boundary fixture only: this end port does not implement production match/chat/media privacy cleanup.
  const port: GuestRoomPort = {
    seatedSeat: vi.fn(async (c, id) => {
      const row = (
        await c.query(
          "SELECT room_id FROM public.room_members WHERE user_id=$1 AND role='PLAYER' ORDER BY room_id LIMIT 1",
          [id],
        )
      ).rows[0];
      return row ? { kind: "room", roomId: row.room_id } : null;
    }),
    end: vi.fn(async (c, id) => {
      await c.query("DELETE FROM public.room_members WHERE user_id=$1", [id]);
    }),
  };
  const service = new GuestService(pool, port, () => now),
    guest = await service.create("Synthetic Guest"),
    authorizer = new GuestRoomAuthorizer(service, pool),
    proof = { capability: guest.capability };
  const roomId = randomUUID();
  if (seated || spectator) {
    const owner = spectator ? await service.create("Synthetic Host") : guest;
    await pool.query(
      "INSERT INTO public.rooms(id,owner_id,name) VALUES($1,$2,'Guest Adapter Fixture')",
      [roomId, owner.userId],
    );
    if (spectator)
      await pool.query(
        "INSERT INTO public.room_members(room_id,user_id,role,side) VALUES($1,$2,'PLAYER','RED')",
        [roomId, owner.userId],
      );
    await pool.query(
      "INSERT INTO public.room_members(room_id,user_id,role,side) VALUES($1,$2,$3,$4)",
      [
        roomId,
        guest.userId,
        spectator ? "SPECTATOR" : "PLAYER",
        spectator ? null : "RED",
      ],
    );
  }
  return {
    service,
    guest,
    authorizer,
    proof,
    port,
    roomId,
    setNow: (value: Date) => {
      now = value;
    },
  };
}
async function state(id: string) {
  return {
    sessions: (
      await pool.query(
        "SELECT guest_id FROM xiangqi_auth.guest_sessions WHERE guest_id=$1",
        [id],
      )
    ).rows,
    name: (
      await pool.query(
        "SELECT display_name FROM public.profiles WHERE user_id=$1",
        [id],
      )
    ).rows[0].display_name,
    members: (
      await pool.query(
        "SELECT user_id FROM public.room_members WHERE user_id=$1",
        [id],
      )
    ).rows,
  };
}
async function run<T>(
  f: Awaited<ReturnType<typeof fixture>>,
  purpose: GuestPurpose,
  work: (c: PoolClient) => Promise<T>,
  roomIds: string[] = [],
  contextId?: string,
) {
  const actor = await f.authorizer.resolve(f.proof);
  return coordinator.withRoom(
    { actor, roomIds },
    (p) => f.authorizer.authorize(f.proof, p, purpose, contextId),
    async (s) => {
      const value = await work(s.client);
      await f.authorizer.finish(f.proof, s);
      return value;
    },
  );
}
afterAll(() => pool.end());
describe.skipIf(!databaseUrl)(
  "guest room private proof adapter on isolated synthetic SQL",
  () => {
    beforeEach(async () => {
      await baseline();
      await apply("supabase/migrations/20261011000005_google_guest.sql");
    });
    it("resolves only a hashed server-owned guest identity without expiry cleanup or caller identity", async () => {
      const f = await fixture(false, true);
      f.setNow(new Date(f.guest.expiresAt));
      const before = await state(f.guest.userId);
      expect(
        await f.authorizer.resolve({
          ...f.proof,
          userId: randomUUID(),
        } as GuestRoomRequestProof),
      ).toEqual({ kind: "guest", userId: f.guest.userId });
      expect(await state(f.guest.userId)).toEqual(before);
      expect(f.port.end).not.toHaveBeenCalled();
      expect(f.port.seatedSeat).not.toHaveBeenCalled();
      for (const cap of ["bad", "A".repeat(43)])
        await expect(
          f.authorizer.resolve({ capability: cap }),
        ).rejects.toMatchObject({ code: "AUTH_REQUIRED", status: 401 });
    });
    it("authorizes pre/post room phases and finishes on the same client without nested pool checkout", async () => {
      const f = await fixture(true),
        actor = await f.authorizer.resolve(f.proof),
        connect = vi.spyOn(pool, "connect"),
        requireActor = vi.spyOn(f.service, "requireActorInTransaction"),
        finish = vi.spyOn(f.service, "finishActorMutation");
      try {
        let used: PoolClient | undefined;
        const result = await coordinator.withRoom(
          { actor, roomIds: [f.roomId] },
          (p) => f.authorizer.authorize(f.proof, p, "existing-room", f.roomId),
          async (s) => {
            used = s.client;
            await f.authorizer.finish(f.proof, s);
            return "performed";
          },
        );
        expect(result).toEqual({ status: "active", value: "performed" });
        expect(connect).toHaveBeenCalledTimes(1);
        expect(requireActor).toHaveBeenCalledTimes(2);
        expect(
          requireActor.mock.calls.every(
            ([c, cap, purpose, id]) =>
              c === used &&
              cap === f.proof.capability &&
              purpose === "existing-room" &&
              id === f.roomId,
          ),
        ).toBe(true);
        expect(finish).toHaveBeenCalledWith(
          used,
          expect.objectContaining({ kind: "guest", userId: f.guest.userId }),
        );
      } finally {
        connect.mockRestore();
      }
    });
    it.each([false, true])(
      "expired non-seated/spectator guest commits cleanup and never executes work (spectator=%s)",
      async (spectator) => {
        const f = await fixture(false, spectator);
        f.setNow(new Date(f.guest.expiresAt));
        const work = vi.fn();
        expect(await run(f, "read", work)).toEqual({ status: "ended" });
        expect(work).not.toHaveBeenCalled();
        expect(await state(f.guest.userId)).toEqual({
          sessions: [],
          name: "Khách",
          members: [],
        });
        expect(f.port.end).toHaveBeenCalledExactlyOnceWith(
          expect.anything(),
          f.guest.userId,
          { reason: "expiry", confirmedResign: false },
        );
      },
    );
    it("rechecks expiry after waiting for the room row and commits ended cleanup without work", async () => {
      const f = await fixture(false, true),
        actor = await f.authorizer.resolve(f.proof),
        blocker = await pool.connect(),
        work = vi.fn();
      await blocker.query("BEGIN");
      await blocker.query(
        "SELECT id FROM public.rooms WHERE id=$1 FOR UPDATE",
        [f.roomId],
      );
      const pending = coordinator.withRoom(
        { actor, roomIds: [f.roomId] },
        (p) => f.authorizer.authorize(f.proof, p),
        work,
      );
      try {
        await expect
          .poll(
            async () =>
              (
                await pool.query(
                  "SELECT count(*)::int AS n FROM pg_catalog.pg_stat_activity WHERE datname=current_database() AND wait_event_type='Lock' AND query LIKE 'SELECT id FROM public.rooms WHERE id=ANY%' ",
                )
              ).rows[0].n,
            { timeout: 3000 },
          )
          .toBe(1);
        f.setNow(new Date(f.guest.expiresAt));
        await blocker.query("ROLLBACK");
        expect(await pending).toEqual({ status: "ended" });
        expect(work).not.toHaveBeenCalled();
        expect(await state(f.guest.userId)).toEqual({
          sessions: [],
          name: "Khách",
          members: [],
        });
      } finally {
        await blocker.query("ROLLBACK");
        blocker.release();
        await pending.catch(() => {});
      }
    });
    it("finishes only the latest same-client authorization with its original private proof", async () => {
      const f = await fixture(),
        actor = await f.authorizer.resolve(f.proof),
        finish = vi.spyOn(f.service, "finishActorMutation");
      await expect(
        coordinator.withRoom(
          { actor, roomIds: [] },
          (p) => f.authorizer.authorize(f.proof, p),
          (s) => f.authorizer.finish({ ...f.proof }, s),
        ),
      ).rejects.toMatchObject({ code: "AUTH_REQUIRED" });
      expect(finish).not.toHaveBeenCalled();
      expect((await state(f.guest.userId)).sessions).toHaveLength(1);
    });
    it("deferred seated guest may continue its room but cannot create or join elsewhere; leave finishes expiry atomically", async () => {
      const f = await fixture(true);
      f.setNow(new Date(f.guest.expiresAt));
      expect(
        await run(
          f,
          "existing-room",
          async () => "continued",
          [f.roomId],
          f.roomId,
        ),
      ).toEqual({ status: "active", value: "continued" });
      for (const purpose of ["new-room", "join-room", "existing-room"] as const)
        await expect(
          run(f, purpose, async () => "forbidden", [], randomUUID()),
        ).rejects.toMatchObject({ code: "GUEST_DEFERRED", status: 403 });
      expect(
        await run(
          f,
          "existing-room",
          (c) =>
            c.query("DELETE FROM public.room_members WHERE user_id=$1", [
              f.guest.userId,
            ]),
          [f.roomId],
          f.roomId,
        ),
      ).toMatchObject({ status: "active" });
      expect(await state(f.guest.userId)).toEqual({
        sessions: [],
        name: "Khách",
        members: [],
      });
      await expect(f.authorizer.resolve(f.proof)).rejects.toMatchObject({
        code: "AUTH_REQUIRED",
      });
    });
    it("refuses proof copies, mutated capabilities, forged actor or missing actor lock before GuestService", async () => {
      const f = await fixture(),
        a = await f.authorizer.resolve(f.proof),
        requireActor = vi.spyOn(f.service, "requireActorInTransaction"),
        client = await pool.connect();
      const p: RoomActorProof = {
        client,
        actor: a,
        roomIds: [],
        lockedActorIds: new Set([a.userId]),
      };
      try {
        await expect(
          f.authorizer.authorize({ ...f.proof }, p),
        ).rejects.toMatchObject({ code: "AUTH_REQUIRED" });
        await expect(
          f.authorizer.authorize(f.proof, {
            ...p,
            actor: { kind: "guest", userId: randomUUID() },
          }),
        ).rejects.toMatchObject({ code: "AUTH_REQUIRED" });
        await expect(
          f.authorizer.authorize(f.proof, { ...p, lockedActorIds: new Set() }),
        ).rejects.toMatchObject({ code: "AUTH_REQUIRED" });
        f.proof.capability = "A".repeat(43);
        await expect(f.authorizer.authorize(f.proof, p)).rejects.toMatchObject({
          code: "AUTH_REQUIRED",
        });
        expect(requireActor).not.toHaveBeenCalled();
      } finally {
        client.release();
      }
    });
    it("refuses guest-session identity drift before attempting a different actor lock", async () => {
      const f = await fixture(),
        other = await f.service.create("Other Guest"),
        a = await f.authorizer.resolve(f.proof),
        requireActor = vi.spyOn(f.service, "requireActorInTransaction");
      await pool.query(
        "DELETE FROM xiangqi_auth.guest_sessions WHERE guest_id=$1",
        [other.userId],
      );
      await pool.query(
        "UPDATE xiangqi_auth.guest_sessions SET guest_id=$2 WHERE token_hash=$1",
        [hash(f.proof.capability), other.userId],
      );
      await expect(
        coordinator.withRoom(
          { actor: a, roomIds: [] },
          (p) => f.authorizer.authorize(f.proof, p),
          async () => "never",
        ),
      ).rejects.toMatchObject({ code: "AUTH_REQUIRED" });
      expect(requireActor).not.toHaveBeenCalled();
    });
    it("enforces one owned open room for an active guest", async () => {
      const f = await fixture(true);
      await expect(
        run(f, "new-room", async () => "never"),
      ).rejects.toMatchObject({ code: "GUEST_ROOM_LIMIT", status: 409 });
    });
    it("fails closed without lifecycle ports and sanitizes unknown dependency errors", async () => {
      const f = await fixture(),
        withoutPorts = new GuestRoomAuthorizer(new GuestService(pool), pool),
        a = await withoutPorts.resolve(f.proof);
      await expect(
        coordinator.withRoom(
          { actor: a, roomIds: [] },
          (p) => withoutPorts.authorize(f.proof, p),
          async () => "never",
        ),
      ).rejects.toMatchObject({ code: "AUTH_UNAVAILABLE", status: 503 });
      await f.authorizer.resolve(f.proof);
      const dependency = vi
        .spyOn(f.service, "requireActorInTransaction")
        .mockRejectedValue(new Error("private-capability-provider-value"));
      try {
        await expect(
          coordinator.withRoom(
            { actor: a, roomIds: [] },
            (p) => f.authorizer.authorize(f.proof, p),
            async () => "never",
          ),
        ).rejects.toMatchObject({
          code: "AUTH_UNAVAILABLE",
          status: 503,
          message: "Chưa thể xác thực phiên Khách",
        });
      } finally {
        dependency.mockRestore();
      }
    });
    it("maps known Guest errors without forwarding raw error payloads", async () => {
      const f = await fixture(),
        a = await f.authorizer.resolve(f.proof),
        dependency = vi
          .spyOn(f.service, "requireActorInTransaction")
          .mockRejectedValue(
            new GuestError("GUEST_INVALID", "private error", 401),
          );
      try {
        await expect(
          coordinator.withRoom(
            { actor: a, roomIds: [] },
            (p) => f.authorizer.authorize(f.proof, p),
            async () => "never",
          ),
        ).rejects.toMatchObject({
          code: "AUTH_REQUIRED",
          status: 401,
          message: "Phiên Khách không hợp lệ",
        });
      } finally {
        dependency.mockRestore();
      }
    });
  },
);
