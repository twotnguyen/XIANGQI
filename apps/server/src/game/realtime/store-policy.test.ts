import { randomUUID } from "node:crypto";
import type { Pool, PoolClient } from "pg";
import { describe, expect, it, vi } from "vitest";
import type { RoomStateSnapshot } from "@xiangqi/shared";
import { RealtimeStore } from "./store.js";
import {
  RealtimeError,
  type RealtimeConnection,
  type RealtimePresence,
  type RealtimeTransactions,
} from "./contracts.js";
function fixture() {
  const connection: RealtimeConnection = {
    identity: { userId: randomUUID(), kind: "member" },
    roomId: randomUUID(),
    tabId: randomUUID(),
    connectionId: randomUUID(),
  };
  const snapshot: RoomStateSnapshot = {
    serverNow: new Date().toISOString(),
    roomId: connection.roomId,
    version: 0,
    role: "red",
    room: {
      status: "WAITING",
      hostId: connection.identity.userId,
      name: "Synthetic room",
      visibility: "CODE_ONLY",
      timeMinutes: 5,
      viewerLimit: 5,
      seats: { red: connection.identity.userId, black: null },
      ready: { red: false, black: false },
      connected: { red: false, black: false },
      graceUntil: { red: null, black: null },
      countdown: null,
    },
    match: null,
    clocks: null,
  };
  const query = vi.fn(async (text: string) => ({
    rows: text.includes("SELECT tab_id,connection_id,generation")
      ? [
          {
            tab_id: connection.tabId,
            connection_id: connection.connectionId,
            generation: 1,
          },
        ]
      : [],
    rowCount: 0,
  }));
  const client = { query } as unknown as PoolClient;
  const pool = {
    connect: vi.fn(async () => {
      throw new Error("Guard must own the transaction");
    }),
  } as unknown as Pool;
  const rooms = {
    authorize: vi.fn(async () => ({ canControl: true })),
    snapshot: vi.fn(async () => snapshot),
    execute: vi.fn(async () => snapshot),
  };
  let committed = 0;
  const run = vi.fn(
    async (
      _connection: RealtimeConnection,
      work: (c: PoolClient) => Promise<unknown>,
    ) => {
      const result = await work(client);
      committed++;
      return result;
    },
  );
  const transactions = { run } as RealtimeTransactions;
  const presence = {
    connected: vi.fn<RealtimePresence["connected"]>(async () => {}),
    disconnected: vi.fn<RealtimePresence["disconnected"]>(async () => {}),
  };
  const store = new RealtimeStore(pool, rooms, transactions, presence);
  return {
    connection,
    client,
    pool,
    rooms,
    run,
    presence,
    store,
    query,
    committed: () => committed,
  };
}
describe("realtime transaction and physical presence policy", () => {
  it("uses the authenticated guard for connect, private snapshot and command instead of a room-first pool transaction", async () => {
    const f = fixture();
    await f.store.connect(f.connection);
    await f.store.snapshot(f.connection);
    expect(
      await f.store.command(f.connection, {
        roomId: f.connection.roomId,
        commandId: randomUUID(),
        expectedVersion: 0,
        action: { type: "room.ready", payload: { ready: true } },
      }),
    ).toMatchObject({ status: "ok" });
    expect(f.run).toHaveBeenCalledTimes(3);
    expect(f.pool.connect).not.toHaveBeenCalled();
    expect(f.presence.connected).toHaveBeenCalledWith(f.client, f.connection, {
      mode: "writable",
      generation: 1,
      reason: null,
    });
  });
  it("commits expired-seat cleanup before denying connection, without reading a revoked private snapshot", async () => {
    const f = fixture();
    f.presence.connected.mockResolvedValueOnce("ended");
    await expect(f.store.connect(f.connection)).rejects.toMatchObject({
      code: "ROOM_FORBIDDEN",
    });
    expect(f.committed()).toBe(1);
    expect(f.rooms.snapshot).not.toHaveBeenCalled();
  });
  it("rejects guard failure before room queries or private state", async () => {
    const f = fixture();
    f.run.mockRejectedValueOnce(new RealtimeError("AUTH_REQUIRED", "Expired"));
    await expect(f.store.snapshot(f.connection)).rejects.toMatchObject({
      code: "AUTH_REQUIRED",
    });
    expect(f.query).not.toHaveBeenCalled();
    expect(f.rooms.snapshot).not.toHaveBeenCalled();
    expect(f.pool.connect).not.toHaveBeenCalled();
  });
  it("delegates physical disconnect without a token refresh or member authorization transaction", async () => {
    const f = fixture();
    await f.store.disconnect(f.connection);
    expect(f.presence.disconnected).toHaveBeenCalledWith(f.connection);
    expect(f.run).not.toHaveBeenCalled();
    expect(f.query).not.toHaveBeenCalled();
  });
});
