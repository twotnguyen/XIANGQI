import { createHash, randomBytes } from "node:crypto";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { createRoomWiring } from "@server/game/room/room-wiring.js";
import { ClockService } from "@server/game/clock/clock.service.js";
import { RoomSessionSeats } from "@server/game/room/session-seat-port.js";
import { SessionSeatStore } from "@server/game/room/session-seat-store.js";
import {
  apply,
  databaseUrl,
  member,
  oldRoom,
  pool,
  registration,
  reset,
  waitFor,
} from "../game.runtime.test-helper.js";

const deviceToken = () => randomBytes(32).toString("base64url");

async function setup() {
  const r = registration(),
    wiring = createRoomWiring(pool, new ClockService());
  r.sessions.attachSeats(
    new RoomSessionSeats(
      wiring.coordinator,
      wiring.rooms,
      new SessionSeatStore(),
      wiring.withScope,
    ),
  );
  return r;
}

async function roomStatus(roomId: string) {
  const row = await pool.query<{ status: string }>(
    "SELECT status FROM public.rooms WHERE id=$1",
    [roomId],
  );
  return row.rows[0]?.status;
}

async function seatCount(roomId: string, userId: string) {
  const row = await pool.query<{ n: number }>(
    "SELECT count(*)::int AS n FROM public.room_members WHERE room_id=$1 AND user_id=$2",
    [roomId, userId],
  );
  return row.rows[0]?.n ?? 0;
}

async function activeSessions(userId: string) {
  const row = await pool.query<{ n: number }>(
    "SELECT count(*)::int AS n FROM xiangqi_auth.app_sessions WHERE user_id=$1 AND revoked_at IS NULL",
    [userId],
  );
  return row.rows[0]?.n ?? 0;
}

async function usernameOf(userId: string) {
  const row = await pool.query<{ username: string }>(
    "SELECT username FROM public.profiles WHERE user_id=$1",
    [userId],
  );
  return row.rows[0]!.username;
}

describe.skipIf(!databaseUrl)("session seat lifecycle (real DB)", () => {
  beforeEach(async () => {
    await reset();
  }, 60000);

  afterAll(async () => {
    await pool.end();
  });

  it("a login from another device ends a PLAYING seat and revokes old sessions", async () => {
    const r = await setup();
    const { a, roomId } = await oldRoom(r, true);

    const issued = await r.sessions.issue(
      a.id,
      false,
      undefined,
      deviceToken(),
    );

    expect(issued.displaced).toBe(true);
    expect(await seatCount(roomId, a.id)).toBe(0);
    expect(await roomStatus(roomId)).not.toBe("PLAYING");
    expect(await activeSessions(a.id)).toBe(1);
  });

  it("a login from the same device again is not displaced", async () => {
    const r = await setup();
    const a = await member(r);
    const device = deviceToken();

    const first = await r.sessions.issue(a.id, false, undefined, device);
    const second = await r.sessions.issue(a.id, false, undefined, device);

    expect(first.displaced).toBe(false);
    expect(second.displaced).toBe(false);
    expect(await activeSessions(a.id)).toBe(1);
  });

  it("a login from another device without a held seat revokes old sessions but is not displaced", async () => {
    const r = await setup();
    const a = await member(r);

    await r.sessions.issue(a.id, false, undefined, deviceToken());
    const issued = await r.sessions.issue(
      a.id,
      false,
      undefined,
      deviceToken(),
    );

    expect(issued.displaced).toBe(false);
    expect(await activeSessions(a.id)).toBe(1);
  });

  it("logout during a PLAYING match without confirmation is refused and changes nothing", async () => {
    const r = await setup();
    const { a, roomId } = await oldRoom(r, true);

    await expect(
      r.sessions.logout(
        a.appSession,
        { userId: a.id, username: await usernameOf(a.id) } as never,
        false,
      ),
    ).rejects.toMatchObject({ code: "LOGOUT_CONFIRM_REQUIRED", status: 409 });

    expect(await seatCount(roomId, a.id)).toBe(1);
    expect(await roomStatus(roomId)).toBe("PLAYING");
    expect(await activeSessions(a.id)).toBe(1);
  });

  it("a confirmed logout leaves the room and revokes the session", async () => {
    const r = await setup();
    const { a, roomId } = await oldRoom(r, true);

    await r.sessions.logout(
      a.appSession,
      { userId: a.id, username: await usernameOf(a.id) } as never,
      true,
    );

    expect(await seatCount(roomId, a.id)).toBe(0);
    expect(await activeSessions(a.id)).toBe(0);
  });

  it("a logout whose session was revoked in the meantime is refused under the lock", async () => {
    const r = await setup();
    const { a, roomId } = await oldRoom(r, true);
    await pool.query(
      "UPDATE xiangqi_auth.app_sessions SET revoked_at=now() WHERE user_id=$1",
      [a.id],
    );

    await expect(
      r.sessions.logout(
        a.appSession,
        { userId: a.id, username: await usernameOf(a.id) } as never,
        true,
      ),
    ).rejects.toMatchObject({ code: "SESSION_EXPIRED", status: 401 });

    expect(await seatCount(roomId, a.id)).toBe(1);
    expect(await roomStatus(roomId)).toBe("PLAYING");
  });

  it("re-login from the newest device is not a displacement even when session timestamps tie", async () => {
    const r = await setup();
    const a = await member(r);
    const deviceA = deviceToken();
    const deviceB = deviceToken();
    await r.sessions.issue(a.id, true, undefined, deviceA);
    await r.sessions.issue(a.id, true, undefined, deviceB);
    await pool.query(
      "UPDATE xiangqi_auth.app_sessions SET created_at=$1,expires_at=$1::timestamptz+CASE WHEN remember THEN interval '720 hours' ELSE interval '12 hours' END WHERE user_id=$2",
      [new Date(Date.now() - 1000), a.id],
    );
    expect(await r.sessions.store.latestDeviceHash(a.id)).toBe(
      createHash("sha256").update(deviceB).digest("hex"),
    );
    const again = await r.sessions.issue(a.id, true, undefined, deviceB);
    expect(again.displaced).toBe(false);
  });

  it("a logout whose session expires while it waits for the username lock is refused", async () => {
    const r = await setup();
    const a = await member(r);
    const username = (await usernameOf(a.id)).toLowerCase();
    const holder = await pool.connect();
    try {
      await holder.query("SELECT pg_advisory_lock(hashtextextended($1,0))", [
        `login:${username}`,
      ]);
      const pending = r.sessions
        .logout(a.appSession, { userId: a.id, username } as never, true)
        .then(
          () => null,
          (error: unknown) => error,
        );
      const holderId = (await holder.query("SELECT pg_backend_pid() AS pid"))
        .rows[0].pid;
      await waitFor(
        async () =>
          (
            await pool.query(
              "SELECT EXISTS(SELECT 1 FROM pg_stat_activity WHERE $1=ANY(pg_blocking_pids(pid))) AS blocked",
              [holderId],
            )
          ).rows[0].blocked,
        Boolean,
      );
      // Expiry lands while logout waits on the username lock; the check runs under the lock.
      await pool.query(
        "WITH t AS (SELECT clock_timestamp()-interval '1 second' AS deadline) UPDATE xiangqi_auth.app_sessions SET expires_at=t.deadline,created_at=t.deadline-CASE WHEN remember THEN interval '720 hours' ELSE interval '12 hours' END FROM t WHERE user_id=$1",
        [a.id],
      );
      await holder.query("SELECT pg_advisory_unlock(hashtextextended($1,0))", [
        `login:${username}`,
      ]);
      expect(await pending).toMatchObject({
        code: "SESSION_EXPIRED",
        status: 401,
      });
    } finally {
      await holder.query("SELECT pg_advisory_unlock_all()");
      holder.release();
    }
  }, 20000);

  it.each(["different-device", "logout"] as const)(
    "releases a WAITING seat on %s without creating a losing result",
    async (reason) => {
      const r = await setup();
      const { a, b, roomId } = await oldRoom(r, false);
      if (reason === "logout")
        await r.sessions.logout(
          a.appSession,
          await r.sessions.requireActiveSession(a.token, a.appSession),
          false,
        );
      else
        expect(
          (await r.sessions.issue(a.id, false, undefined, deviceToken()))
            .displaced,
        ).toBe(true);
      expect(await seatCount(roomId, a.id)).toBe(0);
      expect(await seatCount(roomId, b.id)).toBe(1);
      expect(await roomStatus(roomId)).toBe("WAITING");
      expect(
        (
          await pool.query(
            "SELECT outcome FROM public.matches WHERE room_id=$1",
            [roomId],
          )
        ).rows,
      ).toEqual([]);
      await expect(
        r.sessions.requireValidSession(a.appSession),
      ).rejects.toMatchObject({ code: "SESSION_EXPIRED" });
    },
  );

  it("does not resign or revoke a playing account that became inactive before displacement", async () => {
    const r = await setup();
    const { a, roomId } = await oldRoom(r, true);
    const active = await r.sessions.store.accountById(a.id);
    if (!active) throw Error("active fixture account missing");
    const store = {
      ...r.sessions.store,
      accountById: async () => active,
      latestDeviceHash: () => r.sessions.store.latestDeviceHash(a.id),
    } as typeof r.sessions.store;
    await pool.query(
      "UPDATE public.profiles SET registration_pending=true WHERE user_id=$1",
      [a.id],
    );
    await expect(
      r.sessions.issue(a.id, false, store, deviceToken()),
    ).rejects.toMatchObject({ code: "ACCOUNT_PENDING" });
    expect(await seatCount(roomId, a.id)).toBe(1);
    expect(await roomStatus(roomId)).toBe("PLAYING");
    expect(await activeSessions(a.id)).toBe(1);
  });

  it("rolls back device tracking without removing accounts, existing sessions or game seats", async () => {
    const r = await setup();
    const { a, roomId } = await oldRoom(r, false);
    const before = await r.sessions.requireActiveSession(a.token, a.appSession);
    await apply("supabase/rollback/20261031000001_session_devices.sql");
    expect(
      await r.sessions.requireActiveSession(a.token, a.appSession),
    ).toEqual(before);
    expect(await seatCount(roomId, a.id)).toBe(1);
    await apply("supabase/migrations/20261031000001_session_devices.sql");
    expect(await r.sessions.store.latestDeviceHash(a.id)).toBeNull();
    expect(
      await r.sessions.requireActiveSession(a.token, a.appSession),
    ).toEqual(before);
  });
});
