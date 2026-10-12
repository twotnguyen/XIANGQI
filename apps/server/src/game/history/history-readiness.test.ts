import { afterAll, describe, expect, it } from "vitest";
import { databaseUrl, pool } from "../room/room.test-helper.js";
import { HISTORY_COLUMN_TYPE_MATCH } from "./history.module.js";

/**
 * XIAN-160: `xiangqi_auth.accounts` là view trên managed Auth. Supabase dùng
 * `character varying`, fixture local dùng `text`, nên điều kiện kiểu phải chấp nhận
 * họ kiểu chuỗi mà không nới lỏng các kiểu khác (regression: runtime từ chối sai trên production).
 */
afterAll(() => pool.end());

describe.skipIf(!databaseUrl)("history column type match", () => {
  it("accepts text/varchar/bpchar for a text requirement and stays strict otherwise", async () => {
    const client = await pool.connect();
    try {
      await client.query(`
        CREATE TEMP TABLE t_text(col text);
        CREATE TEMP TABLE t_varchar(col varchar(255));
        CREATE TEMP TABLE t_bpchar(col char(8));
        CREATE TEMP TABLE t_int(col integer);
      `);
      const rows = (
        await client.query<{
          relation: string;
          column_type: string;
          expected: boolean;
          matched: boolean;
        }>(
          `WITH t(relation,column_name,column_type,expected) AS (VALUES
             ('t_text','col','text',true),
             ('t_varchar','col','text',true),
             ('t_bpchar','col','text',true),
             ('t_int','col','text',false),
             ('t_int','col','int4',true),
             ('t_text','col','int4',false),
             ('t_text','col','uuid',false))
           SELECT t.relation, t.column_type, t.expected,
             EXISTS(SELECT 1 FROM pg_catalog.pg_attribute a
               WHERE a.attrelid=pg_catalog.to_regclass(t.relation)
                 AND a.attname=t.column_name AND NOT a.attisdropped
                 AND ${HISTORY_COLUMN_TYPE_MATCH}) AS matched
           FROM t`,
        )
      ).rows;
      expect(rows.length).toBe(7);
      for (const row of rows)
        expect(
          { case: `${row.relation}:${row.column_type}`, matched: row.matched },
          `expected ${row.expected} for ${row.relation}:${row.column_type}`,
        ).toEqual({
          case: `${row.relation}:${row.column_type}`,
          matched: row.expected,
        });
    } finally {
      client.release();
    }
  });
});
