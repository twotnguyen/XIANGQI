import { EventEmitter } from "node:events";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { Pool } from "pg";
import { acquireRuntimeLock } from "@server/core/runtime-lock.js";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

function fakePool() {
  const client = Object.assign(new EventEmitter(), {
    query: vi.fn(async () => ({ rows: [{ locked: true, pid: 7 }] })),
    release: vi.fn(),
  });
  return { client, pool: { connect: async () => client } as unknown as Pool };
}

it("pings the holder connection every 30s and reports loss when the ping fails", async () => {
  const { client, pool } = fakePool();
  const lock = await acquireRuntimeLock(pool);
  const before = client.query.mock.calls.length;

  await vi.advanceTimersByTimeAsync(30_000);
  expect(client.query).toHaveBeenCalledTimes(before + 1);
  expect(client.query).toHaveBeenLastCalledWith("SELECT 1");
  expect(() => lock.ready()).not.toThrow();

  client.query.mockRejectedValueOnce(new Error("socket reset"));
  await vi.advanceTimersByTimeAsync(30_000);
  expect(((await lock.lost) as Error).message).toBe("socket reset");
  expect(() => lock.ready()).toThrow("Room runtime lock was lost");

  await lock.release();
  const afterRelease = client.query.mock.calls.length;
  await vi.advanceTimersByTimeAsync(90_000);
  expect(client.query).toHaveBeenCalledTimes(afterRelease);
});
