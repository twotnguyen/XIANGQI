import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Pool } from "pg";
import { applySql } from "./apply-sql.test-helper.js";

const databaseUrl = process.env.ROOM_RUNTIME_TEST_DATABASE_URL;
if (databaseUrl) {
  const u = new URL(databaseUrl);
  if (
    u.hostname !== "127.0.0.1" ||
    u.port !== "55452" ||
    u.pathname !== "/xiangqi_room_runtime_test" ||
    u.search ||
    u.hash
  )
    throw new Error(
      "SQL fixture tests require the dedicated local runtime database",
    );
}
const schema = "apply_sql_probe";

describe.skipIf(!databaseUrl)("applySql", () => {
  let pool: Pool;
  let dir: string;
  let callerRole: string;

  const sqlFile = async (name: string, sql: string) => {
    const path = join(dir, name);
    await writeFile(path, sql);
    return path;
  };
  const exists = async (table: string) => {
    const { rows } = await pool.query("SELECT to_regclass($1) AS r", [
      `${schema}.${table}`,
    ]);
    return rows[0].r !== null;
  };
  const currentUser = async () =>
    (await pool.query("SELECT current_user AS u")).rows[0].u as string;

  beforeAll(async () => {
    pool = new Pool({ connectionString: databaseUrl, max: 1 });
    dir = await mkdtemp(join(tmpdir(), "apply-sql-"));
    await pool.query(
      "DO $$ BEGIN IF NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='postgres') THEN CREATE ROLE postgres LOGIN BYPASSRLS CREATEROLE; END IF; END $$",
    );
    await pool.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
    await pool.query(`CREATE SCHEMA ${schema} AUTHORIZATION postgres`);
    callerRole = await currentUser();
  });

  afterAll(async () => {
    await pool.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
    await pool.end();
    await rm(dir, { recursive: true, force: true });
  });

  it("runs an explicit BEGIN/COMMIT migration as postgres and restores the caller role", async () => {
    const file = await sqlFile(
      "explicit-commit.sql",
      `BEGIN;\nCREATE TABLE ${schema}.committed AS SELECT current_user AS role_seen;\nCOMMIT;\n`,
    );
    await applySql(pool, file);
    const { rows } = await pool.query(
      `SELECT role_seen FROM ${schema}.committed`,
    );
    expect(rows).toEqual([{ role_seen: "postgres" }]);
    expect(await currentUser()).toBe(callerRole);
  });

  it("rolls back a file whose explicit transaction was never committed", async () => {
    const file = await sqlFile(
      "uncommitted.sql",
      `BEGIN;\nCREATE TABLE ${schema}.uncommitted (x int);\n`,
    );
    await applySql(pool, file);
    expect(await exists("uncommitted")).toBe(false);
    expect(await currentUser()).toBe(callerRole);
  });

  it("rolls back a plain migration that fails mid-file", async () => {
    const file = await sqlFile(
      "plain-fail.sql",
      `CREATE TABLE ${schema}.partial_plain (x int);\nSELECT 1/0;\n`,
    );
    await expect(applySql(pool, file)).rejects.toThrow(/division by zero/);
    expect(await exists("partial_plain")).toBe(false);
    expect(await currentUser()).toBe(callerRole);
  });

  it("rolls back an explicit transaction that fails before COMMIT, and the pool stays usable", async () => {
    const bad = await sqlFile(
      "tx-fail.sql",
      `BEGIN;\nCREATE TABLE ${schema}.partial_tx (x int);\nSELECT 1/0;\nCOMMIT;\n`,
    );
    await expect(applySql(pool, bad)).rejects.toThrow(/division by zero/);
    expect(await exists("partial_tx")).toBe(false);
    expect(await currentUser()).toBe(callerRole);

    const good = await sqlFile(
      "after-fail.sql",
      `CREATE TABLE ${schema}.after_fail (x int);\n`,
    );
    await applySql(pool, good);
    expect(await exists("after_fail")).toBe(true);
  });

  it("keeps the caller role for fixtures", async () => {
    const file = await sqlFile(
      "probe.test-fixture.sql",
      `CREATE TABLE ${schema}.fixture_seen AS SELECT current_user AS role_seen;\n`,
    );
    await applySql(pool, file);
    const { rows } = await pool.query(
      `SELECT role_seen FROM ${schema}.fixture_seen`,
    );
    expect(rows).toEqual([{ role_seen: callerRole }]);
  });
});
