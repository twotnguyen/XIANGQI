import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { actor, apply, databaseUrl, pool, reset } from "./match.test-helper.js";
const migration = "supabase/migrations/20261011000007_match_outcomes.sql";
const rollback = "supabase/rollback/20261011000007_match_outcomes.sql";
describe.skipIf(!databaseUrl)("match schema", () => {
  let room: string,
    red: string,
    black: string,
    metadata: string,
    guards: string;
  async function guardMetadata() {
    const constraints = (
      await pool.query(
        "SELECT conrelid::regclass::text relation,conname,convalidated,pg_get_constraintdef(oid) definition FROM pg_constraint WHERE conrelid IN('public.matches'::regclass,'public.match_moves'::regclass,'public.match_events'::regclass) AND conname<>'matches_status_and_outcome_invariants' ORDER BY conrelid::regclass::text,conname",
      )
    ).rows;
    const triggers = (
      await pool.query(
        "SELECT t.tgname,pg_get_triggerdef(t.oid) definition,p.prosrc,p.proconfig,p.proacl,p.proowner FROM pg_trigger t JOIN pg_proc p ON p.oid=t.tgfoid WHERE t.tgrelid='public.matches'::regclass AND NOT t.tgisinternal ORDER BY t.tgname",
      )
    ).rows;
    const policies = (
      await pool.query(
        "SELECT polrelid::regclass::text relation,polname,polroles,pg_get_expr(polqual,polrelid) qual,pg_get_expr(polwithcheck,polrelid) check_expr FROM pg_policy WHERE polrelid IN('public.matches'::regclass,'public.match_moves'::regclass,'public.match_events'::regclass) ORDER BY polrelid::regclass::text,polname",
      )
    ).rows;
    return JSON.stringify({ constraints, triggers, policies });
  }
  beforeAll(async () => {
    await reset();
    red = (await actor()).userId;
    black = (await actor()).userId;
    room = randomUUID();
    await pool.query(
      "INSERT INTO public.rooms(id,owner_id,name,time_control) VALUES($1,$2,'Synthetic',600)",
      [room, red],
    );
    guards = await guardMetadata();
    metadata = JSON.stringify(
      (
        await pool.query(
          "SELECT c.relname,c.relowner,c.relacl,c.relrowsecurity,c.relforcerowsecurity FROM pg_class c WHERE c.oid IN('public.matches'::regclass,'public.match_moves'::regclass,'public.match_events'::regclass) ORDER BY c.relname",
        )
      ).rows,
    );
  });
  afterAll(() => pool.end());
  async function insert(
    reason: string,
    winner: string | null,
    status = "FINISHED",
  ) {
    const id = randomUUID();
    await pool.query(
      "INSERT INTO public.matches(id,room_id,mode,status,red_user_id,black_user_id,position,time_control,clock,outcome,ended_at) VALUES($1,$2,'ONLINE',$3,$4,$5,$6,600,$7,$8,now())",
      [
        id,
        room,
        status,
        red,
        black,
        { board: Array(90).fill(null), turn: "RED" },
        { redMs: 600000, blackMs: 600000, runningSinceEpochMs: 0 },
        { reason, winner },
      ],
    );
    return id;
  }
  it("retains old outcomes and ACLs while accepting all new adjudication outcomes", async () => {
    await insert("REPETITION", null);
    await insert("AGREED_DRAW", null);
    await apply(migration);
    for (const reason of [
      "DRAW_REPETITION",
      "DRAW_NO_CAPTURE",
      "DRAW_AGREEMENT",
    ])
      await insert(reason, null);
    for (const winner of ["RED", "BLACK", null])
      await insert("PERPETUAL_CHECK", winner);
    expect(
      JSON.stringify(
        (
          await pool.query(
            "SELECT c.relname,c.relowner,c.relacl,c.relrowsecurity,c.relforcerowsecurity FROM pg_class c WHERE c.oid IN('public.matches'::regclass,'public.match_moves'::regclass,'public.match_events'::regclass) ORDER BY c.relname",
          )
        ).rows,
      ),
    ).toBe(metadata);
    expect(await guardMetadata()).toBe(guards);
    expect(
      (
        await pool.query(
          "SELECT count(*)::int n FROM public.matches WHERE outcome->>'reason' IN('REPETITION','AGREED_DRAW')",
        )
      ).rows[0].n,
    ).toBe(2);
    await expect(insert("DRAW_NO_CAPTURE", "RED")).rejects.toThrow(
      "matches_status_and_outcome_invariants",
    );
    await expect(insert("PERPETUAL_CHECK", "PURPLE")).rejects.toThrow(
      "matches_status_and_outcome_invariants",
    );
    await expect(insert("CHECKMATE", null)).rejects.toThrow(
      "matches_status_and_outcome_invariants",
    );
    await expect(
      insert("SERVER_RESTART", "RED", "INTERRUPTED"),
    ).rejects.toThrow("matches_status_and_outcome_invariants");
  });
  it("refuses rollback after new outcome writes and terminal UPDATE stays forbidden", async () => {
    await expect(apply(rollback)).rejects.toThrow("rollback refused");
    const row = (await pool.query("SELECT id FROM public.matches LIMIT 1"))
      .rows[0];
    await expect(
      pool.query("UPDATE public.matches SET version=version+1 WHERE id=$1", [
        row.id,
      ]),
    ).rejects.toThrow("Terminal match is immutable");
  });
  it("browser roles cannot insert or truncate canonical history", async () => {
    for (const role of ["anon", "authenticated"]) {
      const c = await pool.connect();
      try {
        await c.query(`SET ROLE ${role}`);
        await expect(c.query("TRUNCATE public.match_moves")).rejects.toThrow(
          "permission denied",
        );
        await expect(
          c.query(
            "INSERT INTO public.match_events(match_id,version,type,payload) VALUES($1,0,'START','{}')",
            [randomUUID()],
          ),
        ).rejects.toThrow("permission denied");
      } finally {
        await c.query("RESET ROLE");
        c.release();
      }
    }
  });
  it("rolls back exactly on untouched data and refuses unknown metadata", async () => {
    await reset();
    await apply(migration);
    await apply(rollback);
    const old = (
      await pool.query(
        "SELECT md5(pg_get_constraintdef(oid)) hash FROM pg_constraint WHERE conrelid='public.matches'::regclass AND conname='matches_status_and_outcome_invariants'",
      )
    ).rows[0].hash;
    expect(old).toBe("559020c567790e53058a519863fb10a0");
    await pool.query(
      "ALTER TABLE public.matches DROP CONSTRAINT matches_status_and_outcome_invariants; ALTER TABLE public.matches ADD CONSTRAINT matches_status_and_outcome_invariants CHECK(true)",
    );
    await expect(apply(migration)).rejects.toThrow("metadata");
  });
  it.each([migration, rollback])(
    "rejects temporary catalog shadowing in %s",
    async (path) => {
      await reset();
      if (path === rollback) await apply(migration);
      const client = await pool.connect();
      try {
        await client.query("SET ROLE postgres");
        // Retain the audited constraint OID under a different name, then impersonate its catalog row.
        await client.query(
          "CREATE TEMP TABLE pg_constraint AS SELECT * FROM pg_catalog.pg_constraint WHERE conrelid='public.matches'::regclass AND conname='matches_status_and_outcome_invariants'",
        );
        await client.query(
          "ALTER TABLE public.matches RENAME CONSTRAINT matches_status_and_outcome_invariants TO saved_audited_constraint; ALTER TABLE public.matches ADD CONSTRAINT matches_status_and_outcome_invariants CHECK(true)",
        );
        await expect(
          client.query(await readFile(path, "utf8")),
        ).rejects.toThrow(/metadata/i);
      } finally {
        await client.query("ROLLBACK");
        await client.query("DROP TABLE IF EXISTS pg_temp.pg_constraint");
        await client.query("RESET ROLE");
        client.release();
      }
    },
  );
});
