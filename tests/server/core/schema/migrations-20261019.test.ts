import { randomUUID } from "node:crypto";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import {
  actor,
  apply,
  databaseUrl,
  pool,
  reset,
} from "../../game/room/room.test-helper.js";

const foreignKeys = "20261019000019_principal_foreign_keys";
const indexes = "20261019000020_caller_indexes";
afterAll(() => pool.end());

describe.skipIf(!databaseUrl)(
  "principal references and caller index migrations",
  () => {
    beforeEach(async () => {
      await pool.query(
        "DROP SCHEMA IF EXISTS xiangqi_chat CASCADE; DROP SCHEMA IF EXISTS xiangqi_ai CASCADE; DROP SCHEMA IF EXISTS xiangqi_social CASCADE",
      );
      await reset();
      for (const migration of [
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
        "20261102000002_custom_rematch",
        "20261103000004_room_issued_codes",
        "20261102000003_unlimited_inactivity",
        "20261103000005_match_aborted",
      ])
        await apply(`supabase/migrations/${migration}.sql`);
    });

    async function room() {
      const owner = await actor();
      const roomId = randomUUID();
      await pool.query(
        "INSERT INTO public.rooms(id,owner_id,name,invite_code) VALUES($1,$2,'Migration fixture','12345678')",
        [roomId, owner.userId],
      );
      return { owner, roomId };
    }

    it("rejects orphan principals, supports guest references and cascades only their social/media state", async () => {
      const { owner, roomId } = await room();
      const guest = await actor();
      await apply(`supabase/migrations/${foreignKeys}.sql`);
      await apply(`supabase/migrations/${indexes}.sql`);
      await expect(
        pool.query(
          "INSERT INTO xiangqi_room.media_share(room_id,user_id,level,updated_at) VALUES($1,$2,'NONE',now())",
          [roomId, randomUUID()],
        ),
      ).rejects.toMatchObject({ code: "23503" });
      await expect(
        pool.query(
          "INSERT INTO xiangqi_social.friend_requests(id,sender_id,receiver_id,status,created_at,expires_at) VALUES($1,$2,$3,'PENDING',now(),now()+interval '30 days')",
          [randomUUID(), owner.userId, randomUUID()],
        ),
      ).rejects.toMatchObject({ code: "23503" });
      await pool.query(
        "INSERT INTO xiangqi_room.media_share(room_id,user_id,level,updated_at) VALUES($1,$2,'OPPONENT',now()),($1,$3,'NONE',now())",
        [roomId, owner.userId, guest.userId],
      );
      await pool.query(
        "INSERT INTO xiangqi_social.friendships(user_a,user_b,created_at) VALUES(LEAST($1::uuid,$2::uuid),GREATEST($1::uuid,$2::uuid),now())",
        [owner.userId, guest.userId],
      );
      await pool.query("DELETE FROM xiangqi_auth.principals WHERE id=$1", [
        guest.userId,
      ]);
      expect(
        (
          await pool.query(
            "SELECT user_id FROM xiangqi_room.media_share WHERE room_id=$1",
            [roomId],
          )
        ).rows,
      ).toEqual([{ user_id: owner.userId }]);
      expect(
        (await pool.query("SELECT user_a FROM xiangqi_social.friendships"))
          .rows,
      ).toEqual([]);
      expect(
        (
          await pool.query("SELECT owner_id FROM public.rooms WHERE id=$1", [
            roomId,
          ])
        ).rows,
      ).toEqual([{ owner_id: owner.userId }]);
      await apply(`supabase/rollback/${indexes}.sql`);
      await apply(`supabase/rollback/${foreignKeys}.sql`);
      expect(
        (
          await pool.query(
            "SELECT level FROM xiangqi_room.media_share WHERE room_id=$1 AND user_id=$2",
            [roomId, owner.userId],
          )
        ).rows,
      ).toEqual([{ level: "OPPONENT" }]);
    });

    it("refuses existing orphan rows without deleting data or partially adding constraints", async () => {
      const { roomId } = await room();
      const missingUser = randomUUID();
      await pool.query(
        "INSERT INTO xiangqi_room.media_share(room_id,user_id,level,updated_at) VALUES($1,$2,'NONE',now())",
        [roomId, missingUser],
      );
      await expect(
        apply(`supabase/migrations/${foreignKeys}.sql`),
      ).rejects.toThrow("Orphan social/room principal reference");
      expect(
        (
          await pool.query(
            "SELECT user_id FROM xiangqi_room.media_share WHERE room_id=$1",
            [roomId],
          )
        ).rows,
      ).toEqual([{ user_id: missingUser }]);
      expect(
        (
          await pool.query(
            "SELECT count(*)::int n FROM pg_constraint WHERE conname='friend_requests_sender_principal_fk'",
          )
        ).rows[0].n,
      ).toBe(0);
    });
  },
);
