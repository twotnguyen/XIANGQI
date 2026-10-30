import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { PoolClient } from "pg";
import {
  apply,
  databaseUrl,
  pool,
  reset,
} from "../../game/room/room.test-helper.js";

const DM_TABLES = [
  "xiangqi_social.direct_messages",
  "xiangqi_social.direct_message_reads",
  "xiangqi_social.direct_message_rate",
];

let a: string;
let b: string;

/** Chạy một câu lệnh dưới role chỉ định rồi trả về client đã reset role. */
async function asRole<T>(
  role: string,
  work: (client: PoolClient) => Promise<T>,
) {
  const client = await pool.connect();
  try {
    await client.query(`SET ROLE ${role}`);
    return await work(client);
  } finally {
    await client.query("RESET ROLE");
    client.release();
  }
}

describe.skipIf(!databaseUrl)("direct message RLS and grants", () => {
  beforeAll(async () => {
    await pool.query(
      "DROP SCHEMA IF EXISTS xiangqi_chat CASCADE; DROP SCHEMA IF EXISTS xiangqi_ai CASCADE; DROP SCHEMA IF EXISTS xiangqi_social CASCADE",
    );
  });

  afterAll(async () => {
    await pool.end();
  });

  beforeEach(async () => {
    await pool.query(
      "DROP SCHEMA IF EXISTS xiangqi_chat CASCADE; DROP SCHEMA IF EXISTS xiangqi_ai CASCADE; DROP SCHEMA IF EXISTS xiangqi_social CASCADE",
    );
    await reset();
    await apply("supabase/migrations/20261011000006_rooms.sql");
    await apply("supabase/migrations/20261017000018_room_code_digits.sql");
    await apply("supabase/migrations/20261011000014_friendships.sql");
    await apply(
      "supabase/migrations/20261101000001_friend_presence_invites.sql",
    );
    await apply("supabase/migrations/20261102000004_direct_messages.sql");
    a = randomUUID();
    b = randomUUID();
    const [low, high] = [a, b].sort();
    await pool.query(
      `INSERT INTO xiangqi_social.direct_messages(id,user_low,user_high,sender_id,command_id,fingerprint,content,created_at)
       VALUES(gen_random_uuid(),$1,$2,$3,gen_random_uuid(),repeat('a',64),'bí mật',clock_timestamp())`,
      [low, high, a],
    );
    await pool.query(
      `INSERT INTO xiangqi_social.direct_message_reads(reader_id,peer_id,read_seq,updated_at) VALUES($1,$2,0,clock_timestamp())`,
      [b, a],
    );
  });

  for (const role of ["authenticated", "anon"]) {
    for (const table of DM_TABLES) {
      it(`${role} cannot read ${table}`, async () => {
        await expect(
          asRole(role, (client) => client.query(`SELECT 1 FROM ${table}`)),
        ).rejects.toMatchObject({ code: "42501" });
      });
    }

    it(`${role} cannot insert a direct message`, async () => {
      await expect(
        asRole(role, (client) =>
          client.query(
            `INSERT INTO xiangqi_social.direct_messages(id,user_low,user_high,sender_id,command_id,fingerprint,content)
             VALUES(gen_random_uuid(),$1,$2,$1,gen_random_uuid(),repeat('b',64),'giả mạo')`,
            [a < b ? a : b, a < b ? b : a],
          ),
        ),
      ).rejects.toMatchObject({ code: "42501" });
    });
  }

  it("app_server can read and insert messages but cannot rewrite or delete them", async () => {
    const rows = await asRole("app_server", (client) =>
      client.query<{ content: string }>(
        "SELECT content FROM xiangqi_social.direct_messages",
      ),
    );
    expect(rows.rows.map((r) => r.content)).toEqual(["bí mật"]);

    await expect(
      asRole("app_server", (client) =>
        client.query("UPDATE xiangqi_social.direct_messages SET content='sửa'"),
      ),
    ).rejects.toMatchObject({ code: "42501" });
    await expect(
      asRole("app_server", (client) =>
        client.query("DELETE FROM xiangqi_social.direct_messages"),
      ),
    ).rejects.toMatchObject({ code: "42501" });
  });

  it("app_server can update the read watermark and rate table", async () => {
    await asRole("app_server", (client) =>
      client.query(
        "UPDATE xiangqi_social.direct_message_reads SET read_seq=read_seq+1 WHERE reader_id=$1",
        [b],
      ),
    );
    const rate = await asRole("app_server", (client) =>
      client.query(
        "INSERT INTO xiangqi_social.direct_message_rate(sender_id,sent_at) VALUES($1,ARRAY[clock_timestamp()]) RETURNING sender_id",
        [a],
      ),
    );
    expect(rate.rowCount).toBe(1);
  });
});
