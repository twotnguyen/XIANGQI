import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  fixture,
  run,
  store,
  pool,
  apply,
  migration,
  databaseUrl,
  useProposalHooks,
} from "./match-proposals.test-helper.js";
useProposalHooks();
describe.skipIf(!databaseUrl)(
  "proposal storage authorization and rollback",
  () => {
    it("denies browser access and app_server TRUNCATE, permits empty rollback and refuses rollback after feature writes", async () => {
      for (const role of ["anon", "authenticated", "app_server"]) {
        const client = await pool.connect();
        try {
          await client.query("BEGIN");
          await client.query(`SET LOCAL ROLE ${role}`);
          await expect(
            client.query(
              role === "app_server"
                ? "TRUNCATE xiangqi_room.match_draw_offers"
                : "SELECT * FROM xiangqi_room.match_draw_offers",
            ),
          ).rejects.toThrow(/permission denied/);
        } finally {
          await client.query("ROLLBACK");
          client.release();
        }
      }
      await apply("supabase/rollback/20261011000009_match_draw.sql");
      expect(
        (
          await pool.query(
            "SELECT to_regclass('xiangqi_room.match_draw_offers') object",
          )
        ).rows[0].object,
      ).toBeNull();
      await apply(migration);
      const f = await fixture();
      await run(f, f.red, (s) =>
        store.offerDraw(s, { matchId: f.matchId, matchVersion: 0 }),
      );
      await expect(
        apply("supabase/rollback/20261011000009_match_draw.sql"),
      ).rejects.toThrow("Draw feature writes exist");
      expect(
        (
          await pool.query(
            "SELECT count(*)::int n FROM xiangqi_room.match_draw_offers",
          )
        ).rows[0].n,
      ).toBe(1);
    });
    it("rejects malformed and unrelated offer IDs without changing state", async () => {
      const f = await fixture();
      const a = await run(f, f.red, (s) =>
        store.offerDraw(s, { matchId: f.matchId, matchVersion: 0 }),
      );
      await expect(
        run(f, f.black, (s) =>
          store.respondDraw(s, {
            matchId: f.matchId,
            matchVersion: a.match.version,
            offerId: "not-an-id",
            accept: true,
          }),
        ),
      ).rejects.toMatchObject({ code: "MATCH_INVALID_INPUT", status: 400 });
      const wrong = await run(f, f.black, (s) =>
        store.respondDraw(s, {
          matchId: f.matchId,
          matchVersion: a.match.version,
          offerId: randomUUID(),
          accept: true,
        }),
      );
      expect(wrong.error?.code).toBe("MATCH_DRAW_EXPIRED");
      expect(wrong.match.version).toBe(a.match.version);
      expect(wrong.draw.offers).toHaveLength(1);
    });
    it("rollback refuses ACL or schema drift instead of removing altered objects", async () => {
      await pool.query(
        "GRANT DELETE ON xiangqi_room.match_draw_offers TO app_server",
      );
      await expect(
        apply("supabase/rollback/20261011000009_match_draw.sql"),
      ).rejects.toThrow("Draw metadata changed");
      await pool.query(
        "REVOKE DELETE ON xiangqi_room.match_draw_offers FROM app_server",
      );
      await pool.query(
        "ALTER TABLE xiangqi_room.match_draw_offers ALTER COLUMN resolved_at SET NOT NULL",
      );
      await expect(
        apply("supabase/rollback/20261011000009_match_draw.sql"),
      ).rejects.toThrow("Draw metadata changed");
      await pool.query(
        "ALTER TABLE xiangqi_room.match_draw_offers ALTER COLUMN resolved_at DROP NOT NULL",
      );
      await pool.query(
        "ALTER TABLE xiangqi_room.match_draw_offers ADD COLUMN unexpected text",
      );
      await expect(
        apply("supabase/rollback/20261011000009_match_draw.sql"),
      ).rejects.toThrow("Draw metadata changed");
      expect(
        (
          await pool.query(
            "SELECT to_regclass('xiangqi_room.match_draw_offers') object",
          )
        ).rows[0].object,
      ).toBe("xiangqi_room.match_draw_offers");
    });
  },
);
