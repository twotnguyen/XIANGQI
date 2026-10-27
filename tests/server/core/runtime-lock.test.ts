import { afterAll, describe, expect, it } from "vitest";
import { Pool } from "pg";
import { acquireRuntimeLock } from "@server/core/runtime-lock.js";
import { databaseUrl, pool } from "../game/game.runtime.test-helper.js";

afterAll(() => pool.end());

describe.skipIf(!databaseUrl)("runtime single-active lock", () => {
  it("rejects a second holder until the first releases", async () => {
    const ownerPool = new Pool({ connectionString: databaseUrl, max: 1 });
    try {
      const owner = await acquireRuntimeLock(ownerPool);
      try {
        const contender = new Pool({ connectionString: databaseUrl, max: 1 });
        try {
          await expect(acquireRuntimeLock(contender)).rejects.toThrow(
            "Game runtime is already active on another instance",
          );
        } finally {
          await contender.end();
        }
      } finally {
        await owner.release();
      }
      const successorPool = new Pool({ connectionString: databaseUrl, max: 1 });
      try {
        const successor = await acquireRuntimeLock(successorPool);
        await successor.release();
      } finally {
        await successorPool.end();
      }
    } finally {
      await ownerPool.end();
    }
  });

  it("reports loss when the holder connection dies and frees the lock for a successor", async () => {
    const holderPool = new Pool({
      connectionString: databaseUrl,
      max: 1,
      application_name: "runtime-lock-loss-probe",
    });
    try {
      const lock = await acquireRuntimeLock(holderPool);
      try {
        await pool.query(
          "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE application_name = 'runtime-lock-loss-probe' AND pid <> pg_backend_pid()",
        );
        const lostError = await lock.lost;
        expect(lostError).toBeInstanceOf(Error);
        expect(() => lock.ready()).toThrow("Room runtime lock was lost");
      } finally {
        await lock.release();
      }
    } finally {
      await holderPool.end();
    }

    const successorPool = new Pool({ connectionString: databaseUrl, max: 1 });
    try {
      const successor = await acquireRuntimeLock(successorPool);
      try {
        const successorState = await Promise.race([
          successor.lost.then(() => "lost"),
          Promise.resolve("held"),
        ]);
        expect(successorState).toBe("held");
        expect(successor.holderPid).toBeGreaterThan(0);
      } finally {
        await successor.release();
      }
    } finally {
      await successorPool.end();
    }
  });

  it("makes release idempotent and marks the lock released", async () => {
    const holderPool = new Pool({ connectionString: databaseUrl, max: 1 });
    try {
      const lock = await acquireRuntimeLock(holderPool);
      await lock.release();
      await lock.release();
      expect(() => lock.ready()).toThrow("Room runtime lock is released");
    } finally {
      await holderPool.end();
    }
  });
});
