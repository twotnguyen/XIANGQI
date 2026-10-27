import { randomUUID } from "node:crypto";
import type { PoolClient } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { apply, databaseUrl, pool, reset } from "./room.test-helper.js";

afterAll(() => pool.end());

const ROOMS_MIGRATION = "supabase/migrations/20261011000006_rooms.sql";
const PRIVACY_MIGRATION =
  "supabase/migrations/20261019060000_guest_privacy_receipt_redaction.sql";
const RECEIPTS = "xiangqi_realtime.receipts";
const DENIED = "42501"; // insufficient_privilege
const FINGERPRINT = "b".repeat(64);
const EXPIRES_AT = "2026-11-01T00:00:00.000Z";
const SEED_NAME = "Nguyễn Guest";
const REDACTED_NAME = "Redacted Guest";
const REDACT_SQL = `jsonb_set(response,'{snapshot,players,0,displayName}','"${REDACTED_NAME}"'::jsonb)`;

type Role = "app_server" | "anon" | "authenticated";
type Receipt = {
  userId: string;
  roomId: string;
  commandId: string;
  key: string[];
};
type Row = {
  user_id: string;
  room_id: string;
  command_id: string;
  fingerprint: string;
  response: {
    ok: boolean;
    snapshot: { players: { userId: string; displayName: string }[] };
  };
  created_at: string;
  expires_at: string;
};

// Runs work as the role in one transaction; SET LOCAL ends with COMMIT or ROLLBACK, then the session role is reset.
async function asRole<T>(
  role: Role,
  work: (c: PoolClient) => Promise<T>,
): Promise<T> {
  const c = await pool.connect();
  let broken = false;
  try {
    await c.query("BEGIN");
    await c.query(`SET LOCAL ROLE ${role}`);
    const value = await work(c);
    await c.query("COMMIT");
    return value;
  } catch (error) {
    await c.query("ROLLBACK");
    throw error;
  } finally {
    try {
      await c.query("RESET ROLE");
    } catch {
      broken = true;
    }
    c.release(broken);
  }
}

async function member(): Promise<string> {
  const id = randomUUID();
  await pool.query(
    "INSERT INTO auth.users(id,email,email_confirmed_at) VALUES($1,$2,clock_timestamp())",
    [id, `synthetic-${id}@example.invalid`],
  );
  await pool.query(
    "INSERT INTO public.profiles(user_id,username,display_name,completed_at,registration_pending) VALUES($1,$2,$3,clock_timestamp(),false)",
    [id, "r" + id.replaceAll("-", "").slice(0, 18), SEED_NAME],
  );
  return id;
}

async function room(owner: string): Promise<string> {
  const id = randomUUID();
  await pool.query(
    "INSERT INTO public.rooms(id,owner_id,name,time_control,room_version) VALUES($1,$2,'Synthetic Receipt Room',600,1)",
    [id, owner],
  );
  return id;
}

// Seeds a real receipt through app_server, the only runtime role allowed to write it.
async function seedReceipt(): Promise<Receipt> {
  const userId = await member();
  const roomId = await room(userId);
  const commandId = randomUUID();
  const response = {
    ok: true,
    snapshot: { players: [{ userId, displayName: SEED_NAME }] },
  };
  await asRole("app_server", (c) =>
    c.query(
      `INSERT INTO ${RECEIPTS}(user_id,room_id,command_id,fingerprint,response,expires_at) VALUES($1,$2,$3,$4,$5::jsonb,$6::timestamptz)`,
      [
        userId,
        roomId,
        commandId,
        FINGERPRINT,
        JSON.stringify(response),
        EXPIRES_AT,
      ],
    ),
  );
  return { userId, roomId, commandId, key: [userId, roomId, commandId] };
}

async function readReceipt(r: Receipt): Promise<Row | undefined> {
  const { rows } = await pool.query(
    `SELECT user_id,room_id,command_id,fingerprint,response,created_at::text AS created_at,expires_at::text AS expires_at FROM ${RECEIPTS} WHERE user_id=$1 AND room_id=$2 AND command_id=$3`,
    r.key,
  );
  return rows[0] as Row | undefined;
}

describe.skipIf(!databaseUrl)(
  "Guest privacy receipt grants against real Postgres",
  () => {
    let baseline: { sel: boolean; ins: boolean; del: boolean; upd: boolean };

    beforeAll(async () => {
      await reset();
      await apply(ROOMS_MIGRATION);
      // Captured before the migration so the assertions reflect the real pre-migration grants.
      const { rows } = await pool.query(
        `SELECT has_table_privilege('app_server','${RECEIPTS}','SELECT') AS sel,
                has_table_privilege('app_server','${RECEIPTS}','INSERT') AS ins,
                has_table_privilege('app_server','${RECEIPTS}','DELETE') AS del,
                has_table_privilege('app_server','${RECEIPTS}','UPDATE') AS upd`,
      );
      baseline = rows[0];
      await apply(PRIVACY_MIGRATION);
    });

    it("baseline grants app_server SELECT, INSERT and DELETE but no table UPDATE before the migration", () => {
      expect(baseline).toEqual({
        sel: true,
        ins: true,
        del: true,
        upd: false,
      });
    });

    it("lets app_server rewrite only response while fingerprint, key and expiry stay intact", async () => {
      const r = await seedReceipt();
      const before = await readReceipt(r);
      const result = await asRole("app_server", (c) =>
        c.query(
          `UPDATE ${RECEIPTS} SET response=${REDACT_SQL} WHERE user_id=$1 AND room_id=$2 AND command_id=$3`,
          r.key,
        ),
      );
      expect(result.rowCount).toBe(1);
      const after = await readReceipt(r);
      expect(after?.response.ok).toBe(true);
      expect(after?.response.snapshot.players[0]).toEqual({
        userId: r.userId,
        displayName: REDACTED_NAME,
      });
      expect({ ...after, response: undefined }).toEqual({
        ...before,
        response: undefined,
      });
    });

    it("denies app_server rewrites of fingerprint, user_id and expires_at, leaving the row unchanged", async () => {
      const r = await seedReceipt();
      const before = await readReceipt(r);
      const other = await member();
      const denied: [string, unknown][] = [
        ["fingerprint=$4", "c".repeat(64)],
        ["user_id=$4", other],
        ["expires_at=$4::timestamptz", "2030-01-01T00:00:00.000Z"],
      ];
      for (const [assignment, value] of denied) {
        await expect(
          asRole("app_server", (c) =>
            c.query(
              `UPDATE ${RECEIPTS} SET ${assignment} WHERE user_id=$1 AND room_id=$2 AND command_id=$3`,
              [...r.key, value],
            ),
          ),
        ).rejects.toMatchObject({ code: DENIED });
      }
      expect(await readReceipt(r)).toEqual(before);
    });

    for (const role of ["anon", "authenticated"] as const) {
      it(`${role} cannot read or rewrite private receipts`, async () => {
        const r = await seedReceipt();
        const before = await readReceipt(r);
        await expect(
          asRole(role, (c) => c.query(`SELECT response FROM ${RECEIPTS}`)),
        ).rejects.toMatchObject({ code: DENIED });
        await expect(
          asRole(role, (c) =>
            c.query(
              `UPDATE ${RECEIPTS} SET response='{}'::jsonb WHERE user_id=$1 AND room_id=$2 AND command_id=$3`,
              r.key,
            ),
          ),
        ).rejects.toMatchObject({ code: DENIED });
        expect(await readReceipt(r)).toEqual(before);
      });
    }
  },
);

describe.skipIf(!databaseUrl)("Guest privacy receipt grant rollback", () => {
  beforeAll(async () => {
    await reset();
    await apply(ROOMS_MIGRATION);
    await apply(PRIVACY_MIGRATION);
  });

  it("removes only the response grant on rollback, keeping SELECT, INSERT and DELETE", async () => {
    const r = await seedReceipt();
    const before = await readReceipt(r);
    // Redaction must succeed before the revoke, so the later denial is caused by the revoke alone.
    await asRole("app_server", (c) =>
      c.query(
        `UPDATE ${RECEIPTS} SET response=${REDACT_SQL} WHERE user_id=$1 AND room_id=$2 AND command_id=$3`,
        r.key,
      ),
    );
    const redacted = await readReceipt(r);
    expect(redacted).not.toEqual(before);
    await apply(
      "supabase/rollback/20261019060000_guest_privacy_receipt_redaction.sql",
    );
    await expect(
      asRole("app_server", (c) =>
        c.query(
          `UPDATE ${RECEIPTS} SET response='{}'::jsonb WHERE user_id=$1 AND room_id=$2 AND command_id=$3`,
          r.key,
        ),
      ),
    ).rejects.toMatchObject({ code: DENIED });
    expect(await readReceipt(r)).toEqual(redacted);

    const second = await seedReceipt();
    const count = await asRole("app_server", (c) =>
      c.query(
        `SELECT count(*)::int AS n FROM ${RECEIPTS} WHERE user_id=ANY($1::uuid[])`,
        [[r.userId, second.userId]],
      ),
    );
    expect(count.rows[0].n).toBe(2);
    await asRole("app_server", (c) =>
      c.query(
        `DELETE FROM ${RECEIPTS} WHERE user_id=$1 AND room_id=$2 AND command_id=$3`,
        second.key,
      ),
    );
    expect(await readReceipt(second)).toBeUndefined();
  });
});
