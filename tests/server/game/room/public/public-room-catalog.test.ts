import type { PoolClient } from "pg";
import { expect, test, vi } from "vitest";
import { PublicRoomCatalog } from "@server/game/room/public/public-room-catalog.js";
import type { PublicRoomView } from "@xiangqi/shared";

const client = {} as PoolClient;
const otherClient = {} as PoolClient;

function room(roomId: string): PublicRoomView {
  return {
    roomId,
    name: `Room ${roomId}`,
    host: { displayName: "Host", isGuest: false },
    timeMinutes: 10,
    status: "waiting",
    spectators: 0,
    viewerLimit: 10,
    emptySeats: 1,
    canPlay: true,
    canWatch: true,
    publicOpenedAt: null,
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

test("readers sharing one tick share a single catalog load", async () => {
  const query = vi.fn<(client: PoolClient) => Promise<PublicRoomView[]>>(
    async () => [room("r1")],
  );
  const catalog = new PublicRoomCatalog(query);
  const tick = {};
  const [a, b] = await Promise.all([
    catalog.read(tick, client),
    catalog.read(tick, otherClient),
  ]);
  expect(query).toHaveBeenCalledTimes(1);
  expect(a).toEqual([room("r1")]);
  expect(b).toEqual([room("r1")]);
});

test("a late reader of an older tick reuses its own result after a newer tick loaded", async () => {
  const query = vi
    .fn<(client: PoolClient) => Promise<PublicRoomView[]>>()
    .mockResolvedValueOnce([room("tick-a")])
    .mockResolvedValueOnce([room("tick-b")]);
  const catalog = new PublicRoomCatalog(query);
  const tickA = {};
  const tickB = {};
  await expect(catalog.read(tickA, client)).resolves.toEqual([room("tick-a")]);
  await expect(catalog.read(tickB, client)).resolves.toEqual([room("tick-b")]);
  await expect(catalog.read(tickA, otherClient)).resolves.toEqual([
    room("tick-a"),
  ]);
  expect(query).toHaveBeenCalledTimes(2);
});

test("a new tick never reuses an in-flight load, so ticks do not overlap", async () => {
  const first = deferred<PublicRoomView[]>();
  const query = vi
    .fn<(client: PoolClient) => Promise<PublicRoomView[]>>()
    .mockReturnValueOnce(first.promise)
    .mockResolvedValueOnce([room("fresh")]);
  const catalog = new PublicRoomCatalog(query);
  const pending = catalog.read({}, client);
  const next = catalog.read({}, client);
  expect(query).toHaveBeenCalledTimes(1);
  first.resolve([room("old")]);
  await pending;
  expect(await next).toEqual([room("fresh")]);
  expect(query).toHaveBeenCalledTimes(2);
});

test("a failed tick is shared by its readers and the next tick reloads", async () => {
  const failure = Object.assign(Error("database"), { status: 503 });
  const query = vi
    .fn<(client: PoolClient) => Promise<PublicRoomView[]>>()
    .mockRejectedValueOnce(failure)
    .mockResolvedValueOnce([room("recovered")]);
  const catalog = new PublicRoomCatalog(query);
  const tick = {};
  await expect(catalog.read(tick, client)).rejects.toBe(failure);
  await expect(catalog.read(tick, otherClient)).rejects.toBe(failure);
  expect(query).toHaveBeenCalledTimes(1);
  await expect(catalog.read({}, client)).resolves.toEqual([room("recovered")]);
  expect(query).toHaveBeenCalledTimes(2);
});
