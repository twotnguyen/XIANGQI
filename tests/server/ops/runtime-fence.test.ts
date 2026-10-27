import { afterAll, describe, expect, it } from "vitest";
import { Pool, type PoolClient } from "pg";
import {
  acquireRuntimeLock,
  fenceClient,
  unfenceClient,
  type RuntimeLock,
} from "@server/core/runtime-lock.js";
import { databaseUrl, pool } from "../game/game.runtime.test-helper.js";

afterAll(() => pool.end());

/** Chờ tới khi successor thật sự xếp hàng trên barrier: poll DB, không dùng timer. */
async function waitForQueuedAdvisoryLock(): Promise<void> {
  for (let attempt = 0; attempt < 500; attempt += 1) {
    const queued = await pool.query(
      "SELECT 1 FROM pg_locks WHERE locktype='advisory' AND NOT granted",
    );
    if (queued.rowCount) return;
  }
  throw new Error("Successor never queued on the barrier");
}

describe.skipIf(!databaseUrl)("runtime barrier fence", () => {
  it("rejects a connection fenced with a holder PID that no longer holds the lock", async () => {
    const holderPool = new Pool({
      connectionString: databaseUrl,
      max: 1,
      application_name: "runtime-fence-dead-holder",
    });
    try {
      const lock = await acquireRuntimeLock(holderPool);
      const deadPid = lock.holderPid;
      try {
        await pool.query(
          "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE application_name = 'runtime-fence-dead-holder' AND pid <> pg_backend_pid()",
        );
        await lock.lost;
      } finally {
        await lock.release();
      }

      const client = await pool.connect();
      try {
        await expect(fenceClient(client, deadPid)).rejects.toThrow(
          "Room runtime lock holder is no longer active",
        );
      } finally {
        client.release(true);
      }
    } finally {
      await holderPool.end();
    }
  });

  it("makes a successor wait for checked-out fenced connections of the lost holder", async () => {
    const holderPool = new Pool({
      connectionString: databaseUrl,
      max: 1,
      application_name: "runtime-fence-drain-holder",
    });
    const successorPool = new Pool({ connectionString: databaseUrl, max: 1 });
    const oldClient: PoolClient = await pool.connect();
    let lock: RuntimeLock | undefined;
    let successor: RuntimeLock | undefined;
    let successorPid: number;
    let successorState: "pending" | "acquired" = "pending";
    let successorAcquired: Promise<RuntimeLock> | undefined;
    try {
      lock = await acquireRuntimeLock(holderPool);
      await fenceClient(oldClient, lock.holderPid);
      await pool.query(
        "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE application_name = 'runtime-fence-drain-holder' AND pid <> pg_backend_pid()",
      );
      await lock.lost;
      await lock.release();
      await holderPool.end();

      successorAcquired = acquireRuntimeLock(successorPool).then((acquired) => {
        successorState = "acquired";
        return acquired;
      });
      await waitForQueuedAdvisoryLock();
      expect(successorState).toBe("pending");
    } finally {
      await unfenceClient(oldClient).then(
        () => oldClient.release(),
        () => oldClient.release(true),
      );
      successor = await successorAcquired?.catch(() => undefined);
      successorPid = successor?.holderPid ?? 0;
      await successor?.release();
      await lock?.release();
      await holderPool.end().catch(() => undefined);
      await successorPool.end();
    }
    expect(successorState).toBe("acquired");
    expect(successorPid).toBeGreaterThan(0);
  });
});
