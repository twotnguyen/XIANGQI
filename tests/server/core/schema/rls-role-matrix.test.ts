import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  apply,
  databaseUrl,
  pool,
  reset,
} from "../../game/room/room.test-helper.js";

/**
 * NFR-04 / T14: ma trận quyền theo vai trò trên TOÀN BỘ schema ứng dụng.
 * Không thay bằng chứng "đã khai báo" bằng "đã kiểm theo vai trò": test này đọc catalog thật
 * sau khi áp migrations 06–16 lên baseline + 01–05 và assert quyền của anon/authenticated/app_server.
 */
const migrations = [
  "20261011000006_rooms",
  "20261011000007_match_outcomes",
  "20261011000008_room_modes",
  "20261011000009_match_draw",
  "20261011000010_room_chat",
  "20261011000011_ai_reservations",
  "20261011000012_ai_presence",
  "20261011000013_side_swap",
  "20261011000014_friendships",
  "20261011000015_media_share",
  "20261011000016_room_viewers",
  "20261011000017_rls_hardening",
  "20261017000018_room_code_digits",
  "20261029000001_username_account_email",
  "20261030000001_password_recovery",
  "20261101000001_friend_presence_invites",
  "20261102000001_username_management",
  "20261102000002_custom_rematch",
  "20261103000004_room_issued_codes",
  "20261102000003_unlimited_inactivity",
  "20261102000004_direct_messages",
  "20261102000005_account_theme",
  "20261103000001_username_otp_delivery",
  "20261103000002_yc1_account_rules",
  "20261103000003_password_reset_grant",
];
const appSchemas = [
  "public",
  "xiangqi_auth",
  "xiangqi_realtime",
  "xiangqi_room",
  "xiangqi_chat",
  "xiangqi_social",
  "xiangqi_ai",
];

interface MatrixRow {
  schema: string;
  table: string;
  rls: boolean;
  force: boolean;
  anon: string | null;
  authenticated: string | null;
  app_server: string | null;
  policies: string[];
}

afterAll(() => pool.end());

describe.skipIf(!databaseUrl)("NFR-04 role matrix on the real catalog", () => {
  const matrix: MatrixRow[] = [];
  beforeAll(async () => {
    await pool.query(
      "DROP SCHEMA IF EXISTS xiangqi_chat CASCADE; DROP SCHEMA IF EXISTS xiangqi_ai CASCADE; DROP SCHEMA IF EXISTS xiangqi_social CASCADE",
    );
    await reset();
    for (const name of migrations)
      await apply(`supabase/migrations/${name}.sql`);
    const rows = (
      await pool.query<{
        schema: string;
        table: string;
        rls: boolean;
        force: boolean;
      }>(
        `SELECT n.nspname AS schema, c.relname AS table, c.relrowsecurity AS rls, c.relforcerowsecurity AS force
         FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace
         WHERE c.relkind='r' AND n.nspname = ANY($1::text[]) ORDER BY n.nspname, c.relname`,
        [appSchemas],
      )
    ).rows;
    for (const row of rows) {
      const acl = (
        await pool.query<{ grantee: string; privilege_type: string }>(
          `SELECT COALESCE(r.rolname,'PUBLIC') AS grantee, a.privilege_type AS privilege_type
           FROM pg_catalog.pg_class c
           CROSS JOIN LATERAL aclexplode(COALESCE(c.relacl, acldefault('r', c.relowner))) AS a
           JOIN pg_catalog.pg_roles r ON r.oid = a.grantee
           WHERE c.oid = $1::regclass`,
          [`${row.schema}.${row.table}`],
        )
      ).rows;
      const grab = (grantee: string) => {
        const types = acl
          .filter((entry) => entry.grantee === grantee)
          .map((entry) => entry.privilege_type)
          .sort();
        return types.length ? types.join(",") : null;
      };
      const policies = (
        await pool.query<{ text: string }>(
          `SELECT p.polname || ':' || p.polcmd::text || ':' || array_to_string(ARRAY(SELECT rolname FROM pg_catalog.pg_roles WHERE oid = ANY(p.polroles)), '+') AS text
           FROM pg_catalog.pg_policy p WHERE p.polrelid = $1::regclass ORDER BY 1`,
          [`${row.schema}.${row.table}`],
        )
      ).rows.map((entry) => entry.text);
      matrix.push({
        schema: row.schema,
        table: row.table,
        rls: row.rls,
        force: row.force,
        anon: grab("anon"),
        authenticated: grab("authenticated"),
        app_server: grab("app_server"),
        policies,
      });
    }
    // Bằng chứng thô cho báo cáo (không chứa dữ liệu người dùng).
    console.log("ROLE_MATRIX=" + JSON.stringify(matrix));
  }, 120_000);

  it("forces RLS on every application table", () => {
    expect(matrix.length).toBeGreaterThan(25);
    const missing = matrix.filter((row) => !row.rls || !row.force);
    console.log(
      "RLS_MISSING=" +
        JSON.stringify(
          missing.map(
            (r) => `${r.schema}.${r.table} rls=${r.rls} force=${r.force}`,
          ),
        ),
    );
    expect(missing.map((r) => `${r.schema}.${r.table}`)).toEqual([]);
  });

  it("never grants browser roles any table privilege", () => {
    const leaked = matrix.filter(
      (row) => row.anon !== null || row.authenticated !== null,
    );
    expect(leaked).toEqual([]);
  });

  it("keeps a documented, minimal set of app_server-unreachable tables", () => {
    // Hai bảng này bị REVOKE có chủ đích (không có nhánh nghiệp vụ nào đọc/ghi qua app_server).
    const intentional = new Set([
      "xiangqi_auth.google_guest_baseline",
      "xiangqi_auth.role_provisioning",
    ]);
    const none = matrix
      .filter((row) => row.app_server === null)
      .map((r) => `${r.schema}.${r.table}`);
    expect([...none].sort()).toEqual([...intentional].sort());
  });

  it("gives every app_server-reachable table an app_server policy", () => {
    // public.moves: ACL app_server giữ theo baseline đã audit, nhưng RLS khoá chặt
    // không policy (fail-closed, migration 04) — được phép không có policy.
    const allowedWithoutPolicy = new Set(["public.moves"]);
    const withoutPolicy = matrix
      .filter((row) => row.app_server !== null)
      .filter((row) => !allowedWithoutPolicy.has(`${row.schema}.${row.table}`))
      .filter((row) => !row.policies.some((p) => p.includes("app_server")))
      .map((r) => `${r.schema}.${r.table}`);
    console.log("NO_POLICY=" + JSON.stringify(withoutPolicy));
    expect(withoutPolicy).toEqual([]);
  });

  it("exposes every policy only to app_server, never to PUBLIC/browser roles", () => {
    const suspicious = matrix.filter((row) =>
      row.policies.some((policy) => policy.endsWith(":{}")),
    );
    expect(suspicious).toEqual([]);
  });
});
