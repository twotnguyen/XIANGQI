import { createHash, randomUUID } from "node:crypto";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { SessionService } from "@server/account/login/session.service.js";
import {
  createLoginPool,
  PostgresLoginStore,
} from "@server/account/login/postgres-login-store.js";
import type { RealtimeConnection } from "@server/game/realtime/realtime.types.js";
import { PostgresMemberRoomAuthorizer } from "@server/game/room/member-room-auth.js";
import { RoomSessionAuthorizer } from "@server/game/room/room-session.js";
import { GuestRoomAuthorizer } from "@server/game/room/guest-room-auth.js";
import { GuestService } from "@server/account/guest/guest.service.js";
import { GuestStore } from "@server/account/guest/guest.store.js";
import { RoomStore } from "@server/game/room/room-store.js";
import { RoomTransactions } from "@server/game/room/room-transactions.js";
import { RoomWorker } from "@server/game/room/room-worker.js";
import { PostgresRoomWorkerPort } from "@server/game/room/postgres-room-worker-port.js";
import type { RoomScope } from "@server/game/room/room.types.js";
import { databaseUrl, pool, reset } from "./room-transactions.test-helper.js";
const loginPool = createLoginPool({ connectionString: databaseUrl });
const hash = (s: string) => createHash("sha256").update(s).digest("hex");
const coordinator = new RoomTransactions(pool);
const users = new Map<string, { userId: string; email: string }>();
const provider = {
  signInPassword: vi.fn(),
  verifyAccessToken: vi.fn(async (token: string) => {
    const user = users.get(token);
    if (!user) throw new Error("synthetic provider unavailable");
    return user;
  }),
};
const sessions = new SessionService(
  new PostgresLoginStore(loginPool),
  provider,
);
const authorizer = new RoomSessionAuthorizer(
  new PostgresMemberRoomAuthorizer(sessions),
  new GuestRoomAuthorizer(new GuestService(new GuestStore(pool)), pool),
);
async function member() {
  const id = randomUUID(),
    email = `synthetic-${id}@example.invalid`,
    at = new Date();
  await pool.query(
    "INSERT INTO auth.users(id,email,email_confirmed_at) VALUES($1,$2,$3)",
    [id, email, at],
  );
  await pool.query(
    "INSERT INTO public.profiles(user_id,username,display_name,completed_at,registration_pending) VALUES($1,$2,'Synthetic Member',$3,false)",
    [id, "m" + id.replaceAll("-", "").slice(0, 18), at],
  );
  const issued = await sessions.issue(id, false),
    proof = { accessToken: id, appSession: issued.appSession };
  users.set(id, { userId: id, email });
  return { userId: id, kind: "member" as const, proof };
}
async function setup(two = false) {
  const a = await member(),
    b = two ? await member() : null,
    matchId = randomUUID();
  const start = vi.fn(async () => ({ matchId })),
    rooms = new RoomStore({ start });
  const run = <T>(
    actor: typeof a,
    roomIds: string[],
    work: (s: RoomScope) => Promise<T>,
  ) =>
    coordinator.withRoom(
      { actor, roomIds },
      async () => ({ status: "active", actor }),
      work,
    );
  const created = await run(a, [], (s) =>
    rooms.create(s, { commandId: randomUUID() }),
  );
  if (created.status !== "active") throw Error("fixture");
  const roomId = created.value.roomId,
    peers: RealtimeConnection[] = [];
  if (b)
    await run(b, [roomId], (s) =>
      rooms.join(s, { commandId: randomUUID(), roomId, intent: "play" }),
    );
  for (const m of [a, ...(b ? [b] : [])]) {
    const peer = {
      identity: { userId: m.userId, kind: m.kind },
      proof: m.proof,
      roomId,
      tabId: randomUUID(),
      connectionId: randomUUID(),
    };
    peers.push(peer);
    await pool.query(
      "INSERT INTO xiangqi_realtime.tabs(user_id,room_id,tab_id) VALUES($1,$2,$3)",
      [m.userId, roomId, peer.tabId],
    );
    await pool.query(
      "INSERT INTO xiangqi_realtime.controllers(user_id,room_id,tab_id,connection_id,generation) VALUES($1,$2,$3,$4,1)",
      [m.userId, roomId, peer.tabId, peer.connectionId],
    );
    await run(m, [roomId], async (s) => {
      await rooms.presence(
        s,
        roomId,
        {
          connectionId: peer.connectionId,
          generation: 1,
          serverInstance: randomUUID(),
        },
        true,
      );
      if (m !== a) await rooms.ready(s, roomId, true);
    });
  }
  if (b) await run(a, [roomId], (s) => rooms.start(s, roomId));
  if (b) {
    await pool.query(
      "INSERT INTO public.matches(id,room_id,mode,red_user_id,black_user_id,position) VALUES($1,$2,'ONLINE',$3,$4,$5)",
      [
        matchId,
        roomId,
        a.userId,
        b.userId,
        JSON.stringify({ board: Array(90).fill(null), turn: "RED" }),
      ],
    );
    await pool.query(
      "UPDATE xiangqi_room.countdowns SET due_at=clock_timestamp()-interval '1 second' WHERE room_id=$1",
      [roomId],
    );
  }
  const port = new PostgresRoomWorkerPort(
    pool,
    rooms,
    coordinator,
    authorizer,
    () => peers,
  );
  const sink = { deliver: vi.fn(async () => {}) };
  return {
    a,
    b,
    rooms,
    roomId,
    peers,
    start,
    port,
    worker: new RoomWorker(rooms, port, sink),
    sink,
  };
}
afterAll(async () => {
  await pool.end();
  await loginPool.end();
});
describe.skipIf(!databaseUrl)("actual PostgreSQL room worker port", () => {
  beforeEach(async () => {
    users.clear();
    provider.verifyAccessToken.mockClear();
    await reset();
  });
  it("starts countdown only with both fresh controller proofs in the same locked SQL transaction", async () => {
    const f = await setup(true);
    const outsideLocks = async (token: string) => {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        for (const id of [f.a.userId, f.b!.userId])
          expect(
            (
              await client.query(
                "SELECT pg_try_advisory_xact_lock(hashtextextended($1,0)) free",
                ["actor:" + id],
              )
            ).rows[0].free,
          ).toBe(true);
        return users.get(token)!;
      } finally {
        await client.query("ROLLBACK");
        client.release();
      }
    };
    provider.verifyAccessToken
      .mockImplementationOnce(outsideLocks)
      .mockImplementationOnce(outsideLocks);
    await f.worker.tick();
    expect(f.start).toHaveBeenCalledOnce();
    expect(
      (
        await pool.query("SELECT status FROM public.rooms WHERE id=$1", [
          f.roomId,
        ])
      ).rows[0].status,
    ).toBe("PLAYING");
    expect(provider.verifyAccessToken).toHaveBeenCalledTimes(2);
  });
  it("cancels countdown with no current peers and explicitly supplies an empty verified set", async () => {
    const f = await setup(true);
    f.peers.length = 0;
    await f.worker.tick();
    expect(f.start).not.toHaveBeenCalled();
    expect(
      (await pool.query("SELECT count(*)::int n FROM xiangqi_room.countdowns"))
        .rows[0].n,
    ).toBe(0);
  });
  it("does not count a fenced readonly peer or a revoked capability as active", async () => {
    const f = await setup(true);
    f.peers[0]!.connectionId = randomUUID();
    await pool.query(
      "UPDATE xiangqi_auth.app_sessions SET revoked_at=clock_timestamp() WHERE token_hash=$1",
      [hash(f.b!.proof.appSession)],
    );
    await f.worker.tick();
    expect(f.start).not.toHaveBeenCalled();
    expect(
      (await pool.query("SELECT count(*)::int n FROM xiangqi_room.countdowns"))
        .rows[0].n,
    ).toBe(0);
  });
  it("physically expires disconnected waiting seats without requiring an owner app capability", async () => {
    const f = await setup();
    f.peers.length = 0;
    await pool.query(
      "UPDATE public.room_members SET disconnected_at=clock_timestamp()-interval '61 seconds' WHERE room_id=$1",
      [f.roomId],
    );
    await f.worker.tick();
    expect(
      (
        await pool.query("SELECT status FROM public.rooms WHERE id=$1", [
          f.roomId,
        ])
      ).rows[0].status,
    ).toBe("CLOSED");
    expect(
      (
        await pool.query(
          "SELECT count(*)::int n FROM public.active_players WHERE room_id=$1",
          [f.roomId],
        )
      ).rows[0].n,
    ).toBe(0);
  });
  it("rechecks fixed session deadline after the actual room row wait before countdown start", async () => {
    const f = await setup(true),
      blocker = await pool.connect();
    await pool.query(
      "WITH t AS(SELECT clock_timestamp()+interval '500 milliseconds' AS deadline) UPDATE xiangqi_auth.app_sessions SET created_at=t.deadline-interval '12 hours',expires_at=t.deadline FROM t WHERE token_hash=$1",
      [hash(f.b!.proof.appSession)],
    );
    await blocker.query("BEGIN");
    await blocker.query("SELECT id FROM public.rooms WHERE id=$1 FOR UPDATE", [
      f.roomId,
    ]);
    let reached!: () => void;
    const waiting = new Promise<void>((r) => (reached = r)),
      original = coordinator.lockRooms.bind(coordinator);
    const spy = vi
      .spyOn(coordinator, "lockRooms")
      .mockImplementation(async (p) => {
        reached();
        return original(p);
      });
    const tick = f.worker.tick();
    try {
      await waiting;
      await blocker.query(
        "SELECT pg_sleep(GREATEST(0,EXTRACT(EPOCH FROM expires_at-clock_timestamp()))+0.01) FROM xiangqi_auth.app_sessions WHERE token_hash=$1",
        [hash(f.b!.proof.appSession)],
      );
      await blocker.query("COMMIT");
      await tick;
    } finally {
      spy.mockRestore();
      await blocker.query("ROLLBACK");
      blocker.release();
    }
    expect(f.start).not.toHaveBeenCalled();
  });
  it("advances the bounded due-room cursor past fifty guest-owned rooms without a live session to a healthy room", async () => {
    const f = await setup();
    await pool.query(
      "UPDATE public.room_members SET disconnected_at=clock_timestamp()-interval '61 seconds' WHERE room_id=$1",
      [f.roomId],
    );
    const ids = (await pool.query("SELECT id FROM public.rooms")).rows.map(
      (r) => r.id,
    );
    for (let i = 1; i <= 50; i++) {
      const id = "00000000-0000-4000-8000-" + i.toString().padStart(12, "0"),
        guest = randomUUID();
      await pool.query(
        "INSERT INTO xiangqi_auth.principals(id,kind) VALUES($1,'guest')",
        [guest],
      );
      await pool.query(
        "INSERT INTO public.profiles(user_id,username,display_name) VALUES($1,$2,'Synthetic Guest')",
        [guest, "guest" + i],
      );
      await pool.query(
        "INSERT INTO public.rooms(id,owner_id,name,visibility,time_control,viewer_limit,invite_code) VALUES($1,$2,'Unsupported Guest','CODE_ONLY',600,5,$3)",
        [id, guest, String(10000000 + i)],
      );
      await pool.query(
        "INSERT INTO xiangqi_room.countdowns(room_id,token,due_at,red_id,black_id) VALUES($1,$2,clock_timestamp()-interval '1 second',$3,$4)",
        [id, randomUUID(), guest, f.a.userId],
      );
    }
    expect(ids).toContain(f.roomId);
    // Guest owners are supported but fail closed: no live guest session means the room is skipped, never worked.
    await f.worker.tick();
    await f.worker.tick();
    expect(
      (await pool.query("SELECT count(*)::int n FROM xiangqi_room.countdowns"))
        .rows[0].n,
    ).toBe(50);
    expect(
      (
        await pool.query("SELECT status FROM public.rooms WHERE id=$1", [
          f.roomId,
        ])
      ).rows[0].status,
    ).toBe("CLOSED");
  });
  it("propagates a sanitized provider outage without cancelling a valid countdown", async () => {
    const f = await setup(true);
    users.delete(f.a.userId);
    await expect(f.worker.tick()).rejects.toThrow(
      "Room batch transactions failed",
    );
    await expect(
      f.port.withRoom(f.roomId, async () => {}),
    ).rejects.toMatchObject({
      code: "AUTH_UNAVAILABLE",
      status: 503,
      message: "Chưa thể xác thực phiên đăng nhập",
    });
    expect(f.start).not.toHaveBeenCalled();
    expect(
      (await pool.query("SELECT count(*)::int n FROM xiangqi_room.countdowns"))
        .rows[0].n,
    ).toBe(1);
  });
  it("keeps an original peer proof valid while worker provider resolution is paused", async () => {
    const f = await setup(true);
    const original = f.peers[0]!.proof;
    const actor = await authorizer.resolve(original);
    let reached!: () => void, release!: () => void;
    const waiting = new Promise<void>((r) => (reached = r));
    const resumed = new Promise<void>((r) => (release = r));
    provider.verifyAccessToken.mockImplementationOnce(async (token) => {
      reached();
      await resumed;
      return users.get(token)!;
    });
    const worker = f.port.withRoom(f.roomId, async (scope) => {
      expect(scope.activeActorIds).toEqual(new Set([f.a.userId, f.b!.userId]));
    });
    try {
      await waiting;
      const result = await coordinator.withRoom(
        { actor, roomIds: [f.roomId] },
        (p) => authorizer.authorize(original, p),
        async () => true,
      );
      expect(result).toEqual({ status: "active", value: true });
    } finally {
      release();
      await worker;
    }
  });
  it("persists outbox delivery failure backoff and successful acknowledgement through app_server", async () => {
    const f = await setup(),
      events = await f.port.pendingEvents();
    expect(events.length).toBeGreaterThan(0);
    const first = events[0]!;
    await f.port.markFailed(first.id);
    expect(
      (
        await pool.query(
          "SELECT attempts,delivered_at,next_attempt_at>clock_timestamp() future FROM xiangqi_room.outbox WHERE id=$1",
          [first.id],
        )
      ).rows[0],
    ).toEqual({ attempts: 1, delivered_at: null, future: true });
    await f.port.markDelivered(first.id);
    expect(
      (
        await pool.query(
          "SELECT delivered_at IS NOT NULL delivered FROM xiangqi_room.outbox WHERE id=$1",
          [first.id],
        )
      ).rows[0].delivered,
    ).toBe(true);
  });
  it("prunes expired receipts, preserves fresh retries and skips an entry locked by another transaction", async () => {
    const f = await setup();
    const entries = [randomUUID(), randomUUID(), randomUUID()];
    await pool.query(
      `INSERT INTO xiangqi_room.entry_receipts(actor_id,command_id,fingerprint,room_id,response,expires_at)
       SELECT $1,id,repeat('a',64),$2,'{}'::jsonb,
         CASE WHEN id=$4::uuid THEN now()+interval '1 hour' ELSE now()-interval '1 second' END
       FROM unnest($3::uuid[]) id`,
      [f.a.userId, f.roomId, entries, entries[2]],
    );
    const lock = await pool.connect();
    try {
      await lock.query("BEGIN");
      await lock.query(
        "SELECT 1 FROM xiangqi_room.entry_receipts WHERE actor_id=$1 AND command_id=$2 FOR UPDATE",
        [f.a.userId, entries[1]],
      );
      expect(await f.port.cleanupExpiredReceipts()).toBe(1);
      expect(
        (
          await pool.query(
            "SELECT command_id FROM xiangqi_room.entry_receipts WHERE command_id=ANY($1::uuid[]) ORDER BY command_id",
            [entries],
          )
        ).rows.map((row) => row.command_id),
      ).toEqual([entries[1], entries[2]].sort());
    } finally {
      await lock.query("ROLLBACK");
      lock.release();
    }
    expect(await f.port.cleanupExpiredReceipts()).toBe(1);
    expect(
      (
        await pool.query(
          "SELECT command_id FROM xiangqi_room.entry_receipts WHERE command_id=ANY($1::uuid[])",
          [entries],
        )
      ).rows,
    ).toEqual([{ command_id: entries[2] }]);
  });
});
