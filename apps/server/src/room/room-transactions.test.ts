import { randomUUID } from "node:crypto";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { GuestService } from "../guest/guest.service.js";
import { SessionService } from "../login/session.service.js";
import { PostgresLoginStore } from "../login/postgres-login-store.js";
import { RoomStore } from "./room-store.js";
import { RoomRosterChanged, type RoomActor } from "./contracts.js";
import { RoomTransactions, type RoomActorProof } from "./room-transactions.js";
import {
  actor,
  databaseUrl,
  pool,
  reset,
} from "./room-transactions.test-helper.js";
const coordinator = new RoomTransactions(pool);
const rooms = new RoomStore();
// Synthetic lifecycle for coordinator tests only, not production privacy cleanup.
const guest = new GuestService(pool, {
  seatedSeat: async () => null,
  end: async () => {},
});
const capabilities = new Map<string, string>();
async function admitted() {
  const result = await guest.create("Synthetic Guest");
  capabilities.set(result.userId, result.capability);
  return { userId: result.userId, kind: "guest" as const };
}
async function authorize(proof: RoomActorProof) {
  const result = await guest.requireActorInTransaction(
    proof.client,
    capabilities.get(proof.actor.userId),
  );
  return result;
}
async function run<T>(
  a: RoomActor,
  roomIds: string[],
  work: (s: import("./contracts.js").RoomScope) => Promise<T>,
) {
  const result = await coordinator.withRoom(
    { actor: a, roomIds },
    authorize,
    work,
  );
  if (result.status !== "active") throw new Error("Unexpected ended fixture");
  return result.value;
}
async function create(a: RoomActor, name = "Synthetic Room") {
  return run(a, [], (s) => rooms.create(s, { commandId: randomUUID(), name }));
}
async function tryLock(key: string) {
  const c = await pool.connect();
  try {
    await c.query("BEGIN");
    return (
      await c.query(
        "SELECT pg_try_advisory_xact_lock(hashtextextended($1,0)) AS acquired",
        [key],
      )
    ).rows[0].acquired as boolean;
  } finally {
    await c.query("ROLLBACK");
    c.release();
  }
}
afterAll(() => pool.end());
describe.skipIf(!databaseUrl)("actor-first room transactions", () => {
  beforeEach(async () => {
    capabilities.clear();
    await reset();
  });
  it("uses real Guest capability and same app_server transaction for actual create/join/snapshot", async () => {
    const a = await admitted(),
      b = await admitted();
    const entry = await create(a);
    await run(b, [entry.roomId], (s) =>
      rooms.join(s, {
        commandId: randomUUID(),
        roomId: entry.roomId,
        intent: "play",
      }),
    );
    const result = await run(a, [entry.roomId], async (s) => {
      expect(
        (await s.client.query("SELECT current_user AS role")).rows[0].role,
      ).toBe("app_server");
      expect(s.lockedActorIds).toEqual(new Set([a.userId, b.userId]));
      expect(s.activeActorIds).toBeUndefined();
      return rooms.snapshot(s, entry.roomId);
    });
    expect(result.room.seats.red).toBe(a.userId);
    expect(result.room.seats.black).toBe(b.userId);
  });
  it("all participants including viewers are actor-locked before auth, with no room lock yet", async () => {
    const a = await admitted(),
      b = await admitted(),
      viewer = await admitted(),
      entry = await create(a);
    await run(b, [entry.roomId], (s) =>
      rooms.join(s, {
        commandId: randomUUID(),
        roomId: entry.roomId,
        intent: "play",
      }),
    );
    await run(viewer, [entry.roomId], (s) =>
      rooms.join(s, {
        commandId: randomUUID(),
        roomId: entry.roomId,
        intent: "watch",
      }),
    );
    let authChecks = 0;
    await coordinator.withRoom(
      { actor: a, roomIds: [entry.roomId] },
      async (p) => {
        for (const id of [a.userId, b.userId, viewer.userId])
          expect(await tryLock("actor:" + id)).toBe(false);
        expect(await tryLock("room:" + entry.roomId)).toBe(authChecks++ === 0);
        return authorize(p);
      },
      async (s) => {
        expect(await tryLock("room:" + entry.roomId)).toBe(false);
        return rooms.snapshot(s, entry.roomId);
      },
    );
  });
  it("auto includes caller membership and owned-open rooms without supplied targets", async () => {
    const a = await admitted(),
      b = await admitted(),
      viewer = await admitted();
    const first = await create(a, "First"),
      second = await create(b, "Second");
    for (const entry of [first, second])
      await run(viewer, [entry.roomId], (s) =>
        rooms.join(s, {
          commandId: randomUUID(),
          roomId: entry.roomId,
          intent: "watch",
        }),
      );
    await run(viewer, [], async (s) => {
      expect(s.lockedRoomIds).toEqual(new Set([first.roomId, second.roomId]));
      expect(s.lockedActorIds).toEqual(
        new Set([a.userId, b.userId, viewer.userId]),
      );
    });
    await run(a, [], async (s) => {
      expect(s.lockedRoomIds.has(first.roomId)).toBe(true);
    });
  });
  it("locks actors referenced by a current match even when absent from room membership", async () => {
    const a = await admitted(),
      removed = await actor(),
      entry = await create(a),
      matchId = randomUUID();
    await pool.query(
      "INSERT INTO public.matches(id,mode,status,red_user_id,black_user_id,position,time_control,clock,room_id) VALUES($1,'ONLINE','ACTIVE',$2,$3,$4,600,$5,$6)",
      [
        matchId,
        a.userId,
        removed.userId,
        JSON.stringify({ board: Array(90).fill(null), turn: "RED" }),
        JSON.stringify({
          redMs: 600000,
          blackMs: 600000,
          runningSinceEpochMs: Date.now(),
        }),
        entry.roomId,
      ],
    );
    await pool.query(
      "UPDATE public.rooms SET status='PLAYING',current_match_id=$2 WHERE id=$1",
      [entry.roomId, matchId],
    );
    await run(a, [], async (s) => {
      expect(s.lockedActorIds.has(removed.userId)).toBe(true);
    });
  });
  it("canonicalizes uppercase UUID and acquires sorted actor locks before any room lock", async () => {
    const a = await admitted(),
      b = await admitted(),
      entry = await create(a);
    await run(b, [entry.roomId], (s) =>
      rooms.join(s, {
        commandId: randomUUID(),
        roomId: entry.roomId,
        intent: "play",
      }),
    );
    const c = await pool.connect(),
      queries: string[] = [];
    const original = c.query.bind(c);
    const spy = vi.spyOn(c, "query").mockImplementation(((
      text: string,
      values?: unknown[],
    ) => {
      if (text.includes("pg_advisory_xact_lock"))
        queries.push(String(values?.[0]));
      return original(text, values);
    }) as typeof c.query);
    try {
      await c.query("BEGIN; SET LOCAL ROLE app_server");
      const prepared = await coordinator.prepare(
        c,
        {
          actor: { ...a, userId: a.userId.toUpperCase() },
          roomIds: [entry.roomId.toUpperCase(), entry.roomId],
        },
        authorize,
      );
      if (prepared.status !== "active")
        throw new Error("Unexpected fixture expiry");
      const scope = await coordinator.lockRooms(prepared.proof);
      expect(scope.actor.userId).toBe(a.userId);
      expect(scope.lockedRoomIds).toEqual(new Set([entry.roomId]));
      // GuestService repeats caller lock; coordinator's first complete sequence remains sorted.
      expect(queries.slice(0, 2)).toEqual(
        [a.userId, b.userId].sort().map((id) => "actor:" + id),
      );
      expect(queries.indexOf("room:" + entry.roomId)).toBeGreaterThanOrEqual(2);
    } finally {
      spy.mockRestore();
      await c.query("ROLLBACK");
      c.release();
    }
  });
  it("rolls back room version/outbox/entry receipt on auth or work failure", async () => {
    const a = await admitted(),
      input = { commandId: randomUUID(), name: "Rollback" };
    await expect(
      coordinator.withRoom(
        { actor: a, roomIds: [] },
        async () => {
          throw new Error("SESSION_INVALID");
        },
        (s) => rooms.create(s, input),
      ),
    ).rejects.toThrow("SESSION_INVALID");
    await expect(
      run(a, [], async (s) => {
        await rooms.create(s, input);
        throw new Error("AFTER_CREATE");
      }),
    ).rejects.toThrow("AFTER_CREATE");
    for (const table of [
      "public.rooms",
      "xiangqi_room.entry_receipts",
      "xiangqi_room.outbox",
      "public.active_players",
    ])
      expect(
        (await pool.query(`SELECT count(*)::int AS n FROM ${table}`)).rows[0].n,
      ).toBe(0);
    expect((await create(a)).version).toBe(1);
  });
  it("retries whole transaction with newly discovered actor before auth/room mutations", async () => {
    const a = await admitted(),
      newViewer = await admitted(),
      entry = await create(a);
    let attempts = 0;
    const result = await coordinator.withRoom(
      { actor: a, roomIds: [entry.roomId] },
      async (p) => {
        attempts++;
        const authenticated = await authorize(p);
        if (attempts === 1) {
          // Synthetic administrative race representing a pre-existing writer, not production API.
          await pool.query(
            "INSERT INTO public.room_members(room_id,user_id,role) VALUES($1,$2,'SPECTATOR')",
            [entry.roomId, newViewer.userId],
          );
        } else expect(await tryLock("actor:" + newViewer.userId)).toBe(false);
        return authenticated;
      },
      (s) => rooms.snapshot(s, entry.roomId),
    );
    expect(result.status).toBe("active");
    // First TX auth, retried TX auth, then same-client post-room auth.
    expect(attempts).toBe(3);
    expect(
      (
        await pool.query("SELECT room_version FROM public.rooms WHERE id=$1", [
          entry.roomId,
        ])
      ).rows[0].room_version,
    ).toBe("1");
  });
  it("detects a participant added while actor locks were acquired before invoking auth", async () => {
    const a = await admitted(),
      viewer = await admitted(),
      entry = await create(a);
    const firstClient = await pool.connect(),
      writer = await pool.connect();
    const original = firstClient.query.bind(firstClient);
    let inserted = false;
    const querySpy = vi.spyOn(firstClient, "query").mockImplementation((async (
      text: string,
      values?: unknown[],
    ) => {
      if (!inserted && text.includes("pg_advisory_xact_lock")) {
        inserted = true;
        await writer.query(
          "INSERT INTO public.room_members(room_id,user_id,role) VALUES($1,$2,'SPECTATOR')",
          [entry.roomId, viewer.userId],
        );
      }
      return original(text, values);
    }) as typeof firstClient.query);
    const connectSpy = vi
      .spyOn(pool, "connect")
      .mockResolvedValueOnce(firstClient);
    const auth = vi.fn(async (p: RoomActorProof) => {
      expect(await tryLock("actor:" + viewer.userId)).toBe(false);
      return authorize(p);
    });
    try {
      const result = await coordinator.withRoom(
        { actor: a, roomIds: [entry.roomId] },
        auth,
        (s) => rooms.snapshot(s, entry.roomId),
      );
      expect(result.status).toBe("active");
      expect(inserted).toBe(true);
      expect(auth).toHaveBeenCalledTimes(2);
    } finally {
      querySpy.mockRestore();
      connectSpy.mockRestore();
      writer.release();
    }
  });
  it("whole-TX retry restores partial mutations and carries actor union, without acquiring after rooms", async () => {
    const a = await admitted(),
      extra = await admitted();
    let attempts = 0;
    const input = { commandId: randomUUID(), name: "Retry Room" };
    const result = await run(a, [], async (s) => {
      attempts++;
      if (attempts === 2)
        expect(await tryLock("actor:" + extra.userId)).toBe(false);
      const entry = await rooms.create(s, input);
      if (attempts === 1) throw new RoomRosterChanged([extra.userId]);
      return entry;
    });
    expect(attempts).toBe(2);
    expect(result.version).toBe(1);
    expect(
      (await pool.query("SELECT count(*)::int AS n FROM xiangqi_room.outbox"))
        .rows[0].n,
    ).toBe(1);
    expect(
      (
        await pool.query(
          "SELECT count(*)::int AS n FROM xiangqi_room.entry_receipts",
        )
      ).rows[0].n,
    ).toBe(1);
  });
  it("bounds roster retry at three attempts and never commits failed work", async () => {
    const a = await admitted();
    let attempts = 0;
    await expect(
      run(a, [], async (s) => {
        attempts++;
        await rooms.create(s, { commandId: randomUUID(), name: "Unstable" });
        throw new RoomRosterChanged([randomUUID()]);
      }),
    ).rejects.toMatchObject({ code: "ROOM_ROSTER_UNSTABLE" });
    expect(attempts).toBe(3);
    expect(
      (await pool.query("SELECT count(*)::int AS n FROM public.rooms")).rows[0]
        .n,
    ).toBe(0);
  });
  it("never grants unknown active actors or accepts changed caller identity", async () => {
    const a = await admitted(),
      other = await admitted(),
      work = vi.fn();
    await expect(
      coordinator.withRoom(
        { actor: a, roomIds: [] },
        async () => ({ status: "active" as const, actor: other }),
        work,
      ),
    ).rejects.toMatchObject({ code: "ROOM_AUTH_MISMATCH" });
    await expect(
      coordinator.withRoom(
        { actor: a, roomIds: [] },
        async () => ({
          status: "active" as const,
          actor: a,
          activeActorIds: new Set([other.userId]),
        }),
        work,
      ),
    ).rejects.toMatchObject({ code: "ROOM_AUTH_PROOF_INVALID" });
    expect(work).not.toHaveBeenCalled();
  });
  it("propagates only explicitly verified active IDs within the actor union", async () => {
    const a = await admitted(),
      b = await admitted(),
      entry = await create(a);
    await run(b, [entry.roomId], (s) =>
      rooms.join(s, {
        commandId: randomUUID(),
        roomId: entry.roomId,
        intent: "play",
      }),
    );
    await coordinator.withRoom(
      { actor: a, roomIds: [entry.roomId] },
      async (p) => ({
        ...(await authorize(p)),
        activeActorIds: new Set([a.userId]),
      }),
      async (s) => {
        expect(s.activeActorIds).toEqual(new Set([a.userId]));
        expect(s.activeActorIds?.has(b.userId)).toBe(false);
      },
    );
  });
  it("commits actual expired Guest cleanup outcome without invoking work", async () => {
    let now = new Date();
    let context: RoomActorProof | undefined;
    const expiredGuest = new GuestService(
      pool,
      {
        seatedSeat: async () => null,
        end: async (c) => {
          if (!context || context.client !== c)
            throw new Error("Missing trusted scope");
          const s = await coordinator.lockRooms(context);
          for (const roomId of s.lockedRoomIds) await rooms.leave(s, roomId);
        },
      },
      () => now,
    );
    const created = await expiredGuest.create("Expired Viewer");
    capabilities.set(created.userId, created.capability);
    const owner = await admitted(),
      entry = await create(owner);
    const a: RoomActor = { userId: created.userId, kind: "guest" };
    await run(a, [entry.roomId], (s) =>
      rooms.join(s, {
        commandId: randomUUID(),
        roomId: entry.roomId,
        intent: "watch",
      }),
    );
    now = new Date(now.getTime() + 13 * 3600000);
    const work = vi.fn();
    const result = await coordinator.withRoom(
      { actor: a, roomIds: [] },
      async (p) => {
        context = p;
        return expiredGuest.requireActorInTransaction(
          p.client,
          created.capability,
        );
      },
      work,
    );
    expect(result).toEqual({ status: "ended" });
    expect(work).not.toHaveBeenCalled();
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
          "SELECT count(*)::int AS n FROM xiangqi_auth.guest_sessions WHERE guest_id=$1",
          [a.userId],
        )
      ).rows[0].n,
    ).toBe(0);
    expect(
      (
        await pool.query(
          "SELECT count(*)::int AS n FROM public.room_members WHERE user_id=$1",
          [a.userId],
        )
      ).rows[0].n,
    ).toBe(0);
  });
  it("validates member fixed deadline on the same client after actor locks and before room work", async () => {
    const id = randomUUID(),
      now = new Date("2026-10-11T00:00:00Z");
    await pool.query(
      "INSERT INTO auth.users(id,email,email_confirmed_at,raw_user_meta_data) VALUES($1,$2,$3,$4)",
      [
        id,
        "synthetic-member@example.invalid",
        now,
        JSON.stringify({ username: "SyntheticMember" }),
      ],
    );
    await pool.query(
      "INSERT INTO public.profiles(user_id,username,display_name,completed_at,registration_pending) VALUES($1,'SyntheticMember','Synthetic Member',$2,false)",
      [id, now],
    );
    const auth = { signInPassword: vi.fn(), getUser: vi.fn() };
    const issuer = new SessionService(
      new PostgresLoginStore(pool),
      auth,
      () => now,
    );
    const session = await issuer.issue(id, false),
      a: RoomActor = { userId: id, kind: "member" };
    let at = new Date(new Date(session.expiresAt).getTime() - 1);
    const authorizeMember = async (p: RoomActorProof) => {
      expect(await tryLock("actor:" + id)).toBe(false);
      const scoped = new SessionService(
        new PostgresLoginStore(pool, p.client),
        auth,
        () => at,
      );
      const active = await scoped.requireValidSession(session.appSession);
      return {
        status: "active" as const,
        actor: { userId: active.userId, kind: "member" as const },
      };
    };
    await coordinator.withRoom(
      { actor: a, roomIds: [] },
      authorizeMember,
      (s) => rooms.create(s, { commandId: randomUUID(), name: "Member room" }),
    );
    at = new Date(session.expiresAt);
    const work = vi.fn();
    await expect(
      coordinator.withRoom({ actor: a, roomIds: [] }, authorizeMember, work),
    ).rejects.toMatchObject({ code: "SESSION_EXPIRED" });
    expect(work).not.toHaveBeenCalled();
    expect(auth.getUser).not.toHaveBeenCalled();
    expect(
      (await pool.query("SELECT count(*)::int AS n FROM public.rooms")).rows[0]
        .n,
    ).toBe(1);
  });
  it("auto includes a reserved match and its room even without caller membership", async () => {
    const a = await admitted(),
      b = await admitted(),
      owner = await admitted(),
      entry = await create(owner),
      matchId = randomUUID();
    await pool.query(
      "INSERT INTO public.matches(id,mode,status,red_user_id,black_user_id,position,time_control,clock,room_id) VALUES($1,'ONLINE','ACTIVE',$2,$3,$4,600,$5,$6)",
      [
        matchId,
        a.userId,
        b.userId,
        JSON.stringify({ board: Array(90).fill(null), turn: "RED" }),
        JSON.stringify({
          redMs: 600000,
          blackMs: 600000,
          runningSinceEpochMs: Date.now(),
        }),
        entry.roomId,
      ],
    );
    await pool.query(
      "INSERT INTO public.active_players(user_id,match_id) VALUES($1,$2)",
      [a.userId, matchId],
    );
    await run(a, [], async (s) => {
      expect(s.lockedActorIds.has(b.userId)).toBe(true);
      expect(s.lockedRoomIds.has(entry.roomId)).toBe(true);
      expect(s.lockedActorIds.has(owner.userId)).toBe(true);
    });
  });
  it("rejects malformed input before invoking auth or opening room mutation", async () => {
    const a = await admitted(),
      auth = vi.fn(),
      work = vi.fn();
    for (const input of [
      { actor: { ...a, userId: "bad" }, roomIds: [] },
      { actor: a, roomIds: ["bad"] },
    ])
      await expect(
        coordinator.withRoom(input, auth, work),
      ).rejects.toMatchObject({ code: "ROOM_INPUT_INVALID" });
    expect(auth).not.toHaveBeenCalled();
    expect(work).not.toHaveBeenCalled();
  });
  it("serializes two opposite actors on shared roster without deadlock", async () => {
    const a = await admitted(),
      b = await admitted(),
      entry = await create(a);
    await run(b, [entry.roomId], (s) =>
      rooms.join(s, {
        commandId: randomUUID(),
        roomId: entry.roomId,
        intent: "play",
      }),
    );
    const results = await Promise.all([
      run(a, [entry.roomId], (s) => rooms.snapshot(s, entry.roomId)),
      run(b, [entry.roomId], (s) => rooms.snapshot(s, entry.roomId)),
    ]);
    expect(results).toHaveLength(2);
    expect(results.map((r) => r.role)).toEqual(["red", "black"]);
  });
});
