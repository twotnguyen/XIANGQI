import { readFile } from "node:fs/promises";
import type { Pool } from "pg";

// Keep each file's transaction boundaries; send its role switch in the same round trip.
export async function applySql(pool: Pool, file: string): Promise<void> {
  const sql = await readFile(file, "utf8");
  const c = await pool.connect();
  try {
    await c.query(
      file.includes("test-fixture") ? sql : `SET ROLE postgres;\n${sql}`,
    );
  } finally {
    try {
      await c.query("ROLLBACK; RESET ROLE");
    } finally {
      c.release();
    }
  }
}
