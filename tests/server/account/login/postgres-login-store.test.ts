import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import { afterAll, beforeAll, expect, it, describe } from "vitest";
import {
  createLoginPool,
  PostgresLoginStore,
} from "@server/account/login/postgres-login-store.js";

const url = process.env.LOGIN_TEST_DATABASE_URL;
if (url) {
  const parsed = new URL(url);
  if (
    !["127.0.0.1", "localhost", "postgres"].includes(parsed.hostname) ||
    parsed.pathname !== "/xiangqi_login_test"
  )
    throw new Error(
      "LOGIN_TEST_DATABASE_URL must identify isolated xiangqi_login_test",
    );
}
describe.skipIf(!url)("login pool role and store lock lifecycle", () => {
  const admin = new Pool({ connectionString: url });
  const loginPool = createLoginPool({ connectionString: url, max: 3 });
  beforeAll(async () => {
    // app_server is created only when missing in the isolated cluster; existing grants are untouched.
    await admin.query(`DO $$ BEGIN
      IF NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='app_server') THEN CREATE ROLE app_server NOLOGIN; END IF;
    END $$;`);
  });
  afterAll(async () => {
    await loginPool.end();
    await admin.end();
  });
  it("runs every physical login connection as app_server", async () => {
    // Holding all three clients at once forces three distinct physical connections without timing.
    const clients = await Promise.all([0, 1, 2].map(() => loginPool.connect()));
    try {
      expect(new Set(clients).size).toBe(3);
      const rows = await Promise.all(
        clients.map((client) =>
          client.query<{ who: string }>("SELECT current_user::text AS who"),
        ),
      );
      expect(rows.map((r) => r.rows[0]?.who)).toEqual([
        "app_server",
        "app_server",
        "app_server",
      ]);
    } finally {
      for (const client of clients) client.release();
    }
  });
  it("keeps app_server after a failing SQL statement", async () => {
    await expect(loginPool.query("SELECT 1/0")).rejects.toMatchObject({
      code: "22012",
    });
    const result = await loginPool.query<{ who: string }>(
      "SELECT current_user::text AS who",
    );
    expect(result.rows[0]?.who).toBe("app_server");
  });
  it("never admits a physical connection whose role initialization fails", async () => {
    // Real Postgres: a LOGIN role without app_server membership cannot SET ROLE app_server.
    const role = `login_probe_${randomUUID().replace(/-/g, "")}`;
    const password = randomUUID();
    const base = url ? new URL(url) : null;
    if (!base) throw new Error("LOGIN_TEST_DATABASE_URL is required");
    await admin.query(`CREATE ROLE "${role}" LOGIN PASSWORD '${password}'`);
    const probeUrl = new URL(base.toString());
    probeUrl.username = role;
    probeUrl.password = password;
    const probe = createLoginPool({ connectionString: probeUrl.toString() });
    try {
      await expect(
        probe.query("SELECT current_user::text AS who"),
      ).rejects.toMatchObject({ code: "42501" });
      expect(probe.totalCount).toBe(0);
      expect(probe.idleCount).toBe(0);
    } finally {
      await probe.end();
      await admin.query(`DROP ROLE IF EXISTS "${role}"`);
    }
  });
  it("releases the username advisory lock when work fails", async () => {
    const store = new PostgresLoginStore(loginPool);
    await expect(
      store.withUsernameLock("lock-probe-fail", async () => {
        throw new Error("boom");
      }),
    ).rejects.toThrow("boom");
    // Advisory locks are session-scoped: a lock still held by a login connection would block this probe.
    const client = await admin.connect();
    try {
      const probe = await client.query<{ locked: boolean }>(
        "SELECT pg_try_advisory_lock(hashtextextended($1,0)) AS locked",
        ["login:lock-probe-fail"],
      );
      expect(probe.rows[0]?.locked).toBe(true);
    } finally {
      await client.query("SELECT pg_advisory_unlock(hashtextextended($1,0))", [
        "login:lock-probe-fail",
      ]);
      client.release();
    }
  });
});
