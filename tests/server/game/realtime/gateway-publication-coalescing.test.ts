import { randomUUID } from "node:crypto";
import { expect, it } from "vitest";
import { RealtimeError } from "@server/game/realtime/realtime.types.js";
import type { RealtimeConnection } from "@server/game/realtime/realtime.types.js";
import type { RoomSnapshot } from "@xiangqi/shared";
import { fixture } from "./gateway-publication.test-helper.js";

function gate() {
  const { promise, resolve } = Promise.withResolvers<void>();
  return { promise, open: resolve };
}
it("coalesces overlapping same-room publications into one running pass and one queued pass", async () => {
  const f = await fixture();
  const entered = gate(),
    barrier = gate();
  try {
    await f.peer();
    f.read.mockImplementationOnce(async () => {
      entered.open();
      await barrier.promise;
      return { ...f.snapshot };
    });
    const reads = f.read.mock.calls.length;
    const running = f.gateway.publishSnapshots(f.roomId);
    await entered.promise;
    const followers = [1, 2, 3, 4].map(() =>
      f.gateway.publishSnapshots(f.roomId),
    );
    expect(new Set(followers).size).toBe(1);
    barrier.open();
    await Promise.all([running, ...followers]);
    expect(f.read.mock.calls.length - reads).toBe(2);
  } finally {
    barrier.open();
    await f.close();
  }
});
it("keeps a blocked room from delaying publication to another room", async () => {
  const f = await fixture();
  const entered = gate(),
    barrier = gate();
  try {
    await f.peer();
    const otherRoom = randomUUID();
    await f.peer(otherRoom);
    f.read.mockImplementation(async (connection: RealtimeConnection) => {
      if (connection.roomId === f.roomId) {
        entered.open();
        await barrier.promise;
      }
      return f.snapshot;
    });
    const blocked = f.gateway.publishSnapshots(f.roomId);
    await entered.promise;
    await expect(
      f.gateway.publishSnapshots(otherRoom),
    ).resolves.toBeUndefined();
    expect(f.read).toHaveBeenCalledWith(
      expect.objectContaining({ roomId: otherRoom }),
    );
    barrier.open();
    await blocked;
  } finally {
    barrier.open();
    await f.close();
  }
});
it("sends a state change committed while a publication is reading through the follow-up pass", async () => {
  const f = await fixture();
  const entered = gate(),
    barrier = gate();
  try {
    const peer = await f.peer();
    const delivered = Promise.withResolvers<void>();
    peer.client.on("room.snapshot", (snapshot: RoomSnapshot) => {
      if (snapshot.version === 2) delivered.resolve();
    });
    f.read.mockImplementationOnce(async () => {
      const stale = { ...f.snapshot };
      entered.open();
      await barrier.promise;
      return stale;
    });
    const running = f.gateway.publishSnapshots(f.roomId);
    await entered.promise;
    f.snapshot.version = 2;
    const follow = f.gateway.publishSnapshots(f.roomId);
    barrier.open();
    await Promise.all([running, follow]);
    await delivered.promise;
  } finally {
    barrier.open();
    await f.close();
  }
});
it("re-authorizes every newly read snapshot so revocation between triggers stops private delivery", async () => {
  const f = await fixture();
  const entered = gate(),
    barrier = gate();
  try {
    const peer = await f.peer();
    const seen: number[] = [];
    const sawThree = Promise.withResolvers<void>();
    peer.client.on("room.snapshot", (snapshot: RoomSnapshot) => {
      seen.push(snapshot.version);
      if (snapshot.version === 3) sawThree.resolve();
    });
    f.read.mockImplementationOnce(async () => {
      const stale = { ...f.snapshot };
      entered.open();
      await barrier.promise;
      return stale;
    });
    const running = f.gateway.publishSnapshots(f.roomId);
    await entered.promise;
    const resolves = f.resolve.mock.calls.length;
    f.setMembership(true);
    f.snapshot.version = 2;
    const queued = f.gateway.publishSnapshots(f.roomId);
    barrier.open();
    await Promise.all([running, queued]);
    expect(f.resolve.mock.calls.length - resolves).toBe(1);
    f.setMembership(false);
    f.snapshot.version = 3;
    await f.gateway.publishSnapshots(f.roomId);
    await sawThree.promise;
    expect(seen).not.toContain(2);
  } finally {
    barrier.open();
    await f.close();
  }
});
it("sends a running publication failure only to its own caller and lets the queued pass succeed", async () => {
  const f = await fixture();
  const entered = gate(),
    barrier = gate();
  try {
    await f.peer();
    f.read.mockImplementationOnce(async () => {
      entered.open();
      await barrier.promise;
      throw new Error("PRIVATE_SQL_SECRET");
    });
    const running = f.gateway.publishSnapshots(f.roomId);
    await entered.promise;
    const follow = f.gateway.publishSnapshots(f.roomId);
    const outcomes = Promise.allSettled([running, follow]);
    barrier.open();
    const [first, second] = await outcomes;
    expect(first!.status).toBe("rejected");
    const reason = (first as PromiseRejectedResult).reason as RealtimeError;
    expect(reason).toMatchObject({ code: "REALTIME_UNAVAILABLE" });
    expect(reason.message).not.toContain("PRIVATE");
    expect(second!.status).toBe("fulfilled");
  } finally {
    barrier.open();
    await f.close();
  }
});
it("fails every caller joined to a queued pass that cannot read, then a later call retries", async () => {
  const f = await fixture();
  const entered = gate(),
    barrier = gate();
  try {
    await f.peer();
    f.read.mockImplementationOnce(async () => {
      entered.open();
      await barrier.promise;
      return { ...f.snapshot };
    });
    const reads = f.read.mock.calls.length;
    const running = f.gateway.publishSnapshots(f.roomId);
    await entered.promise;
    f.setSnapshot(true);
    const followers = [
      f.gateway.publishSnapshots(f.roomId),
      f.gateway.publishSnapshots(f.roomId),
    ];
    expect(followers[0]).toBe(followers[1]);
    const outcomes = Promise.allSettled([running, ...followers]);
    barrier.open();
    const [first, ...rest] = await outcomes;
    expect(first!.status).toBe("fulfilled");
    for (const outcome of rest) {
      expect(outcome!.status).toBe("rejected");
      expect((outcome as PromiseRejectedResult).reason).toMatchObject({
        code: "REALTIME_UNAVAILABLE",
      });
    }
    expect(f.read.mock.calls.length - reads).toBe(2);
    f.setSnapshot(false);
    await expect(f.gateway.publishSnapshots(f.roomId)).resolves.toBeUndefined();
  } finally {
    barrier.open();
    await f.close();
  }
});
it("close drains the running publication without starting its queued follow-up pass", async () => {
  const f = await fixture();
  const entered = gate(),
    barrier = gate();
  try {
    await f.peer();
    f.read.mockImplementationOnce(async () => {
      entered.open();
      await barrier.promise;
      return { ...f.snapshot };
    });
    const reads = f.read.mock.calls.length;
    const running = f.gateway.publishSnapshots(f.roomId);
    await entered.promise;
    const follow = f.gateway.publishSnapshots(f.roomId);
    const outcomes = Promise.allSettled([running, follow]);
    let closed = false;
    const closing = f.close().then(() => {
      closed = true;
    });
    await Promise.resolve();
    expect(closed).toBe(false);
    barrier.open();
    const [first, second] = await outcomes;
    await closing;
    expect(first!.status).toBe("fulfilled");
    expect(second!.status).toBe("rejected");
    expect(f.read.mock.calls.length - reads).toBe(1);
  } finally {
    barrier.open();
    await f.close();
  }
});

it("skips a recipient already at the floor without reading it, and emits a newer floor", async () => {
  const f = await fixture();
  try {
    const peer = await f.peer();
    const seen: number[] = [];
    const delivered = Promise.withResolvers<void>();
    peer.client.on("room.snapshot", (snapshot: RoomSnapshot) => {
      seen.push(snapshot.version);
      if (snapshot.version === 2) delivered.resolve();
    });
    const reads = f.read.mock.calls.length;
    await f.gateway.publishSnapshots(f.roomId, 1);
    expect(f.read.mock.calls.length - reads).toBe(0);
    f.snapshot.version = 2;
    await f.gateway.publishSnapshots(f.roomId, 2);
    await delivered.promise;
    expect(seen).toEqual([2]);
  } finally {
    await f.close();
  }
});

it("replays an already delivered floor during a provider outage without failing or emitting", async () => {
  const f = await fixture();
  try {
    const peer = await f.peer();
    const seen: number[] = [];
    const delivered = Promise.withResolvers<void>();
    peer.client.on("room.snapshot", (snapshot: RoomSnapshot) => {
      seen.push(snapshot.version);
      if (snapshot.version === 2) delivered.resolve();
    });
    const reads = f.read.mock.calls.length;
    f.setProvider(true);
    await expect(
      f.gateway.publishSnapshots(f.roomId, 1),
    ).resolves.toBeUndefined();
    expect(f.read.mock.calls.length - reads).toBe(0);
    f.setProvider(false);
    f.snapshot.version = 2;
    await f.gateway.publishSnapshots(f.roomId, 2);
    await delivered.promise;
    expect(seen).toEqual([2]);
  } finally {
    await f.close();
  }
});

it("fails a newer floor during a provider outage without emitting, and a later retry delivers it", async () => {
  const f = await fixture();
  try {
    const peer = await f.peer();
    const seen: number[] = [];
    const delivered = Promise.withResolvers<void>();
    peer.client.on("room.snapshot", (snapshot: RoomSnapshot) => {
      seen.push(snapshot.version);
      if (snapshot.version === 2) delivered.resolve();
    });
    f.setProvider(true);
    f.snapshot.version = 2;
    const failure = await f.gateway
      .publishSnapshots(f.roomId, 2)
      .catch((error: unknown) => error);
    expect(failure).toMatchObject({ code: "REALTIME_UNAVAILABLE" });
    expect((failure as RealtimeError).message).not.toContain("PRIVATE");
    f.setProvider(false);
    await f.gateway.publishSnapshots(f.roomId, 2);
    await delivered.promise;
    expect(seen).toEqual([2]);
  } finally {
    await f.close();
  }
});

it("still fails a versionless publication during a provider outage", async () => {
  const f = await fixture();
  try {
    await f.peer();
    f.setProvider(true);
    const failure = await f.gateway
      .publishSnapshots(f.roomId)
      .catch((error: unknown) => error);
    expect(failure).toMatchObject({ code: "REALTIME_UNAVAILABLE" });
    expect((failure as RealtimeError).message).not.toContain("PRIVATE");
    f.setProvider(false);
    await expect(f.gateway.publishSnapshots(f.roomId)).resolves.toBeUndefined();
  } finally {
    await f.close();
  }
});

it("denies a revoked recipient behind the floor while other recipients still receive the newer snapshot", async () => {
  const f = await fixture();
  try {
    const kept = await f.peer();
    const revoked = await f.peer();
    const keptDelivered = Promise.withResolvers<void>();
    const revokedSeen: number[] = [];
    kept.client.on("room.snapshot", (snapshot: RoomSnapshot) => {
      if (snapshot.version === 2) keptDelivered.resolve();
    });
    revoked.client.on("room.snapshot", (snapshot: RoomSnapshot) => {
      revokedSeen.push(snapshot.version);
    });
    f.users.delete(revoked.token);
    f.snapshot.version = 2;
    await f.gateway.publishSnapshots(f.roomId, 2);
    await keptDelivered.promise;
    expect(f.read).not.toHaveBeenCalledWith(
      expect.objectContaining({
        identity: expect.objectContaining({ userId: revoked.userId }),
      }),
    );
    expect(revokedSeen).toEqual([]);
  } finally {
    await f.close();
  }
});

it("sends the latest state when a newer floor arrives while an older floored pass is reading", async () => {
  const f = await fixture();
  const entered = gate(),
    barrier = gate();
  try {
    const peer = await f.peer();
    const seen: number[] = [];
    const newest = Promise.withResolvers<void>();
    peer.client.on("room.snapshot", (snapshot: RoomSnapshot) => {
      seen.push(snapshot.version);
      if (snapshot.version === 3) newest.resolve();
    });
    f.read.mockImplementationOnce(async () => {
      const stale = { ...f.snapshot };
      entered.open();
      await barrier.promise;
      return stale;
    });
    f.snapshot.version = 2;
    const running = f.gateway.publishSnapshots(f.roomId, 2);
    await entered.promise;
    f.snapshot.version = 3;
    const follow = f.gateway.publishSnapshots(f.roomId, 3);
    barrier.open();
    await Promise.all([running, follow]);
    await newest.promise;
    expect(seen).toEqual([2, 3]);
  } finally {
    barrier.open();
    await f.close();
  }
});

it("keeps the newest queued floor when an older floor joins the queued pass", async () => {
  const f = await fixture();
  const entered = gate(),
    barrier = gate();
  try {
    const peer = await f.peer();
    const newest = Promise.withResolvers<void>();
    peer.client.on("room.snapshot", (snapshot: RoomSnapshot) => {
      if (snapshot.version === 3) newest.resolve();
    });
    f.snapshot.version = 2;
    await f.gateway.publishSnapshots(f.roomId, 2);
    f.read.mockImplementationOnce(async () => {
      const stale = { ...f.snapshot };
      entered.open();
      await barrier.promise;
      return stale;
    });
    const running = f.gateway.publishSnapshots(f.roomId);
    await entered.promise;
    const newer = f.gateway.publishSnapshots(f.roomId, 3);
    f.snapshot.version = 3;
    const older = f.gateway.publishSnapshots(f.roomId, 2);
    barrier.open();
    await Promise.all([running, newer, older]);
    await newest.promise;
  } finally {
    barrier.open();
    await f.close();
  }
});

it("authorizes every recipient in a queued versionless pass even when a floor joins it", async () => {
  const f = await fixture();
  const entered = gate(),
    barrier = gate();
  try {
    await f.peer();
    f.snapshot.version = 3;
    await f.gateway.publishSnapshots(f.roomId, 3);
    f.read.mockImplementationOnce(async () => {
      const stale = { ...f.snapshot };
      entered.open();
      await barrier.promise;
      return stale;
    });
    const running = f.gateway.publishSnapshots(f.roomId);
    await entered.promise;
    const resolves = f.resolve.mock.calls.length;
    const floored = f.gateway.publishSnapshots(f.roomId, 3);
    const versionless = f.gateway.publishSnapshots(f.roomId);
    barrier.open();
    await Promise.all([running, floored, versionless]);
    expect(f.resolve.mock.calls.length - resolves).toBe(1);
  } finally {
    barrier.open();
    await f.close();
  }
});

it("never lowers a delivered version when a stale read or an old floor arrives", async () => {
  const f = await fixture();
  try {
    const peer = await f.peer();
    const seen: number[] = [];
    const delivered = Promise.withResolvers<void>();
    const newest = Promise.withResolvers<void>();
    peer.client.on("room.snapshot", (snapshot: RoomSnapshot) => {
      seen.push(snapshot.version);
      if (snapshot.version === 2) delivered.resolve();
      if (snapshot.version === 3) newest.resolve();
    });
    f.snapshot.version = 2;
    await f.gateway.publishSnapshots(f.roomId, 2);
    await delivered.promise;
    f.read.mockImplementationOnce(async () => ({ ...f.snapshot, version: 1 }));
    await f.gateway.publishSnapshots(f.roomId);
    await f.gateway.publishSnapshots(f.roomId, 1);
    f.snapshot.version = 3;
    await f.gateway.publishSnapshots(f.roomId, 3);
    await newest.promise;
    expect(seen).toEqual([2, 3]);
  } finally {
    await f.close();
  }
});

it("re-authorizes a floored publication so a revoked recipient receives no snapshot", async () => {
  const f = await fixture();
  try {
    const peer = await f.peer();
    const seen: number[] = [];
    const newest = Promise.withResolvers<void>();
    peer.client.on("room.snapshot", (snapshot: RoomSnapshot) => {
      seen.push(snapshot.version);
      if (snapshot.version === 3) newest.resolve();
    });
    f.setMembership(true);
    f.snapshot.version = 2;
    const resolves = f.resolve.mock.calls.length;
    await f.gateway.publishSnapshots(f.roomId, 2);
    expect(f.resolve.mock.calls.length - resolves).toBe(1);
    f.setMembership(false);
    f.snapshot.version = 3;
    await f.gateway.publishSnapshots(f.roomId);
    await newest.promise;
    expect(seen).toEqual([3]);
  } finally {
    await f.close();
  }
});
