import { randomUUID } from "node:crypto";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import {
  apply,
  databaseUrl,
  pool,
  reset,
} from "../../game/room/room.test-helper.js";

const migration = "supabase/migrations/20261103000002_yc1_account_rules.sql";
const rollback = "supabase/rollback/20261103000002_yc1_account_rules.sql";

async function member(username: string) {
  const userId = randomUUID();
  await pool.query(
    'INSERT INTO auth.users(id,email,email_confirmed_at,raw_app_meta_data) VALUES($1,$2,clock_timestamp(),\'{"provider":"email"}\')',
    [userId, `${username}@example.invalid`],
  );
  await pool.query(
    "INSERT INTO public.profiles(user_id,username,display_name,completed_at) VALUES($1,$2,$2,clock_timestamp())",
    [userId, username],
  );
  return userId;
}

describe.skipIf(!databaseUrl)("YC1 account migration", () => {
  beforeEach(() => reset());
  afterAll(() => pool.end());

  it("recovers the latest evidenced rename date without inferring future or missing history", async () => {
    const userId = await member("renamed");
    const untouched = await member("untouched");
    const futureOnly = await member("futureonly");
    const at = (
      await pool.query<{ at: Date }>("SELECT clock_timestamp() AS at")
    ).rows[0]!.at;
    const latest = new Date(at.getTime() - 2 * 24 * 3600_000);
    const older = new Date(at.getTime() - 8 * 24 * 3600_000);
    const future = new Date(at.getTime() + 24 * 3600_000);
    for (const [name, owner, changed] of [
      ["oldfirst", userId, older],
      ["oldlast", userId, latest],
      ["oldfuture", userId, future],
      ["futurehistory", futureOnly, future],
    ] as const)
      await pool.query(
        "INSERT INTO xiangqi_auth.username_reservations(username_key,owner_id,expires_at) VALUES($1,$2,$3::timestamptz+interval '30 days')",
        [name, owner, changed],
      );
    const reservations = (
      await pool.query(
        "SELECT * FROM xiangqi_auth.username_reservations ORDER BY username_key",
      )
    ).rows;
    await apply(migration);
    const rows = (
      await pool.query(
        "SELECT user_id,username,username_changed_at FROM public.profiles WHERE user_id=ANY($1::uuid[]) ORDER BY username",
        [[userId, untouched, futureOnly]],
      )
    ).rows;
    expect(rows).toEqual([
      {
        user_id: futureOnly,
        username: "futureonly",
        username_changed_at: null,
      },
      { user_id: userId, username: "renamed", username_changed_at: latest },
      { user_id: untouched, username: "untouched", username_changed_at: null },
    ]);
    expect(
      (
        await pool.query(
          "SELECT * FROM xiangqi_auth.username_reservations ORDER BY username_key",
        )
      ).rows,
    ).toEqual(reservations);
    await expect(apply(rollback)).rejects.toThrow(
      "Cannot remove an active username change history",
    );
    expect(
      (
        await pool.query(
          "SELECT username_changed_at FROM public.profiles WHERE user_id=$1",
          [userId],
        )
      ).rows[0].username_changed_at,
    ).toEqual(latest);
  });

  it("refuses to drop live OTP quota and rolls back safely after it expires when no rename history exists", async () => {
    const userId = await member("quotauser");
    await apply(migration);
    await pool.query(
      "INSERT INTO xiangqi_auth.otp_sends(user_id,email_hash,attempted_at) VALUES($1,repeat('0',64),clock_timestamp())",
      [userId],
    );
    await expect(apply(rollback)).rejects.toThrow(
      "Cannot remove an active OTP quota",
    );
    await pool.query(
      "UPDATE xiangqi_auth.otp_sends SET attempted_at=attempted_at-interval '1 hour'",
    );
    await apply(rollback);
    expect(
      (
        await pool.query(
          "SELECT username FROM public.profiles WHERE user_id=$1",
          [userId],
        )
      ).rows[0].username,
    ).toBe("quotauser");
    expect(
      (
        await pool.query(
          "SELECT to_regclass('xiangqi_auth.otp_sends') AS table_name",
        )
      ).rows[0].table_name,
    ).toBeNull();
    await apply(migration);
    expect(
      (
        await pool.query(
          "SELECT username_changed_at FROM public.profiles WHERE user_id=$1",
          [userId],
        )
      ).rows[0].username_changed_at,
    ).toBeNull();
  });
});
