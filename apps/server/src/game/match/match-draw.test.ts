import { randomUUID } from "node:crypto";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import type { PoolClient } from "pg";
import { ClockService } from "../clock/clock-service.js";
import { MatchStore } from "./match-store.js";
import type { MatchScope } from "./contracts.js";
import {
  actor,
  apply,
  databaseUrl,
  pool,
  reset,
  transaction,
} from "./match.test-helper.js";
const migration = "supabase/migrations/20261011000009_match_draw.sql";
const roomEnd = {
  async onMatchEnded(
    client: PoolClient,
    input: { roomId: string; matchId: string },
  ) {
    await client.query(
      "UPDATE public.rooms SET status='WAITING',current_match_id=NULL,room_version=room_version+1 WHERE id=$1 AND current_match_id=$2",
      [input.roomId, input.matchId],
    );
    await client.query(
      "UPDATE public.room_members SET ready=false WHERE room_id=$1",
      [input.roomId],
    );
    await client.query(
      "UPDATE public.active_players SET match_id=NULL WHERE room_id=$1",
      [input.roomId],
    );
  },
};
const store = new MatchStore(new ClockService(), roomEnd);
async function fixture() {
  const red = (await actor()).userId,
    black = (await actor()).userId,
    viewer = (await actor()).userId;
  const roomId = randomUUID(),
    token = randomUUID();
  const result = await transaction(
    [red, black, viewer],
    [roomId],
    async (client) => {
      await client.query(
        "INSERT INTO public.rooms(id,owner_id,name,time_control,viewer_limit,invite_code) VALUES($1,$2,'Synthetic Draw',600,5,'ABCDEFGH')",
        [roomId, red],
      );
      await client.query(
        "INSERT INTO public.room_members(room_id,user_id,role,side,ready) VALUES($1,$2,'PLAYER','RED',true),($1,$3,'PLAYER','BLACK',true),($1,$4,'SPECTATOR',NULL,false)",
        [roomId, red, black, viewer],
      );
      await client.query(
        "INSERT INTO public.active_players(user_id,room_id) VALUES($1,$3),($2,$3)",
        [red, black, roomId],
      );
      const at = new Date();
      await client.query(
        "INSERT INTO xiangqi_room.countdowns(room_id,token,due_at,red_id,black_id) VALUES($1,$2,$3,$4,$5)",
        [roomId, token, at, red, black],
      );
      const result = await store.start(client, {
        roomId,
        startToken: token,
        redId: red,
        blackId: black,
        timeControlSeconds: 600,
        startedAt: at,
      });
      await client.query(
        "UPDATE public.rooms SET status='PLAYING',current_match_id=$2 WHERE id=$1",
        [roomId, result.matchId],
      );
      await client.query(
        "UPDATE public.active_players SET match_id=$2 WHERE room_id=$1",
        [roomId, result.matchId],
      );
      return result;
    },
  );
  return { red, black, viewer, roomId, ...result };
}
async function run<T>(
  f: Awaited<ReturnType<typeof fixture>>,
  userId: string,
  action: (scope: MatchScope) => Promise<T>,
  canControl = true,
) {
  const ids = [f.red, f.black, userId];
  return transaction(ids, [f.roomId], (client) =>
    action({
      client,
      actor: { userId, kind: "guest" },
      roomId: f.roomId,
      canControl,
      lockedActorIds: new Set(ids),
      lockedRoomIds: new Set([f.roomId]),
    }),
  );
}
afterAll(() => pool.end());
describe.skipIf(!databaseUrl)(
  "durable draw agreements on synthetic PostgreSQL",
  () => {
    beforeEach(async () => {
      await reset();
      await apply("supabase/migrations/20261011000007_match_outcomes.sql");
      await apply(migration);
    });
    it("persists an offer without pausing the clock and only the receiver can accept it", async () => {
      const f = await fixture();
      const before = (
        await pool.query("SELECT clock FROM public.matches WHERE id=$1", [
          f.matchId,
        ])
      ).rows[0].clock;
      const offered = await run(f, f.red, (s) =>
        store.offerDraw(s, { matchId: f.matchId, matchVersion: 0 }),
      );
      expect(offered.applied).toBe(true);
      expect(offered.draw.offers).toHaveLength(1);
      expect(offered.draw.offers[0].sender).toBe("red");
      expect(
        (
          await pool.query("SELECT clock FROM public.matches WHERE id=$1", [
            f.matchId,
          ])
        ).rows[0].clock,
      ).toEqual(before);
      const offerId = offered.draw.offers[0].id;
      const self = await run(f, f.red, (s) =>
        store.respondDraw(s, {
          matchId: f.matchId,
          matchVersion: offered.match.version,
          offerId,
          accept: true,
        }),
      );
      expect(self.applied).toBe(false);
      expect(self.error?.code).toBe("MATCH_DRAW_RECEIVER_REQUIRED");
      const accepted = await run(f, f.black, (s) =>
        store.respondDraw(s, {
          matchId: f.matchId,
          matchVersion: offered.match.version,
          offerId,
          accept: true,
        }),
      );
      expect(accepted.match.outcome).toEqual({
        reason: "DRAW_AGREEMENT",
        winner: null,
      });
      expect(accepted.draw.offers).toEqual([]);
      expect(
        (
          await pool.query(
            "SELECT status,current_match_id FROM public.rooms WHERE id=$1",
            [f.roomId],
          )
        ).rows[0],
      ).toEqual({ status: "WAITING", current_match_id: null });
      expect(
        (
          await pool.query(
            "SELECT count(*)::int n FROM public.match_events WHERE match_id=$1 AND type='RESULT'",
            [f.matchId],
          )
        ).rows[0].n,
      ).toBe(1);
    });
    it("rejects viewers/read-only tabs and permits opposite pending offers without implicit acceptance", async () => {
      const f = await fixture();
      await expect(
        run(f, f.viewer, (s) =>
          store.offerDraw(s, { matchId: f.matchId, matchVersion: 0 }),
        ),
      ).rejects.toMatchObject({ code: "MATCH_PLAYER_REQUIRED" });
      await expect(
        run(
          f,
          f.red,
          (s) => store.offerDraw(s, { matchId: f.matchId, matchVersion: 0 }),
          false,
        ),
      ).rejects.toMatchObject({ code: "MATCH_READ_ONLY" });
      const a = await run(f, f.red, (s) =>
        store.offerDraw(s, { matchId: f.matchId, matchVersion: 0 }),
      );
      const duplicate = await run(f, f.red, (s) =>
        store.offerDraw(s, {
          matchId: f.matchId,
          matchVersion: a.match.version,
        }),
      );
      expect(duplicate.error?.code).toBe("MATCH_DRAW_PENDING");
      const b = await run(f, f.black, (s) =>
        store.offerDraw(s, {
          matchId: f.matchId,
          matchVersion: a.match.version,
        }),
      );
      expect(b.match.status).toBe("ACTIVE");
      expect(b.draw.offers.map((o) => o.sender).sort()).toEqual([
        "black",
        "red",
      ]);
      const wrong = await run(f, f.black, (s) =>
        store.withdrawDraw(s, {
          matchId: f.matchId,
          matchVersion: b.match.version,
          offerId: a.draw.offers[0].id,
        }),
      );
      expect(wrong.error?.code).toBe("MATCH_DRAW_SENDER_REQUIRED");
      const withdrawn = await run(f, f.red, (s) =>
        store.withdrawDraw(s, {
          matchId: f.matchId,
          matchVersion: b.match.version,
          offerId: a.draw.offers[0].id,
        }),
      );
      expect(withdrawn.draw.offers).toHaveLength(1);
      expect(withdrawn.draw.remainingMoves.red).toBe(0);
      const again = await run(f, f.red, (s) =>
        store.offerDraw(s, {
          matchId: f.matchId,
          matchVersion: withdrawn.match.version,
        }),
      );
      expect(again.applied).toBe(true);
      const serialized = JSON.stringify(
        await run(f, f.red, (s) =>
          store.drawSnapshot(s, { matchId: f.matchId }),
        ),
      );
      for (const secret of [f.red, f.black, f.viewer])
        expect(serialized).not.toContain(secret);
    });
    it("requires five accepted sender moves after decline; opponent/illegal/duplicate moves do not count", async () => {
      const f = await fixture();
      const offer = await run(f, f.red, (s) =>
        store.offerDraw(s, { matchId: f.matchId, matchVersion: 0 }),
      );
      let current = await run(f, f.black, (s) =>
        store.respondDraw(s, {
          matchId: f.matchId,
          matchVersion: offer.match.version,
          offerId: offer.draw.offers[0].id,
          accept: false,
        }),
      );
      expect(current.draw.remainingMoves.red).toBe(5);
      const illegal = await run(f, f.red, (s) =>
        store.move(s, {
          matchId: f.matchId,
          matchVersion: current.match.version,
          from: 54,
          to: 55,
        }),
      );
      expect(illegal.error?.code).toBe("MATCH_ILLEGAL_MOVE");
      const moves = [
        [54, 45],
        [27, 36],
        [56, 47],
        [29, 38],
        [58, 49],
        [31, 40],
        [60, 51],
        [33, 42],
        [62, 53],
      ];
      for (let n = 0; n < moves.length; n++) {
        const version = current.match.version,
          user = n % 2 === 0 ? f.red : f.black;
        const moved = await run(f, user, (s) =>
          store.move(s, {
            matchId: f.matchId,
            matchVersion: version,
            from: moves[n][0],
            to: moves[n][1],
          }),
        );
        expect(moved.applied).toBe(true);
        if (n === 0) {
          const duplicate = await run(f, user, (s) =>
            store.move(s, {
              matchId: f.matchId,
              matchVersion: version,
              from: 54,
              to: 45,
            }),
          );
          expect(duplicate.applied).toBe(false);
        }
        current = {
          ...moved,
          draw: await run(f, f.red, (s) =>
            store.drawSnapshot(s, { matchId: f.matchId }),
          ),
        };
        if (n === 7) {
          expect(current.draw.remainingMoves.red).toBe(1);
          expect(
            (
              await run(f, f.red, (s) =>
                store.offerDraw(s, {
                  matchId: f.matchId,
                  matchVersion: current.match.version,
                }),
              )
            ).error?.code,
          ).toBe("MATCH_DRAW_COOLDOWN");
        }
      }
      expect(current.draw.remainingMoves.red).toBe(0);
      expect(
        (
          await run(f, f.red, (s) =>
            store.offerDraw(s, {
              matchId: f.matchId,
              matchVersion: current.match.version,
            }),
          )
        ).applied,
      ).toBe(true);
      expect(
        await run(f, f.red, (s) =>
          store.snapshot(s.client, f.roomId, f.matchId),
        ),
      ).toMatchObject({
        ply: 9,
        status: "ACTIVE",
        lastMove: { from: 62, to: 53 },
      });
    });
    it("expires at the server deadline, blocks late acceptance and bases cooldown at expiry, not worker execution", async () => {
      const f = await fixture();
      const offer = await run(f, f.red, (s) =>
        store.offerDraw(s, { matchId: f.matchId, matchVersion: 0 }),
      );
      await pool.query(
        "WITH t AS MATERIALIZED(SELECT clock_timestamp()-interval '1 second' deadline) UPDATE xiangqi_room.match_draw_offers SET created_at=t.deadline-interval '30 seconds',expires_at=t.deadline FROM t WHERE id=$1",
        [offer.draw.offers[0].id],
      );
      const late = await run(f, f.black, (s) =>
        store.respondDraw(s, {
          matchId: f.matchId,
          matchVersion: offer.match.version,
          offerId: offer.draw.offers[0].id,
          accept: true,
        }),
      );
      expect(late.error?.code).toBe("MATCH_DRAW_EXPIRED");
      expect(late.match.status).toBe("ACTIVE");
      expect(late.draw.remainingMoves.red).toBe(5);
      expect(
        (
          await pool.query(
            "SELECT status FROM xiangqi_room.match_draw_offers WHERE id=$1",
            [offer.draw.offers[0].id],
          )
        ).rows[0].status,
      ).toBe("EXPIRED");
      const expiredAgain = await run(f, f.red, (s) =>
        store.expireDrawOffers(s, { matchId: f.matchId }),
      );
      expect(expiredAgain.applied).toBe(false);
    });
    it("preserves timeout/disconnect precedence over accepting a still-pending offer", async () => {
      const f = await fixture();
      const offer = await run(f, f.red, (s) =>
        store.offerDraw(s, { matchId: f.matchId, matchVersion: 0 }),
      );
      await pool.query(
        "UPDATE public.matches SET clock=jsonb_build_object('redMs',0,'blackMs',600000,'runningSinceEpochMs',floor(extract(epoch FROM clock_timestamp())*1000)::bigint) WHERE id=$1",
        [f.matchId],
      );
      const late = await run(f, f.black, (s) =>
        store.respondDraw(s, {
          matchId: f.matchId,
          matchVersion: offer.match.version,
          offerId: offer.draw.offers[0].id,
          accept: true,
        }),
      );
      expect(late.error?.code).toBe("MATCH_TIME_EXPIRED");
      expect(late.match.outcome).toEqual({
        reason: "TIMEOUT",
        winner: "black",
      });
      expect(
        (
          await pool.query(
            "SELECT status FROM xiangqi_room.match_draw_offers WHERE match_id=$1",
            [f.matchId],
          )
        ).rows[0].status,
      ).toBe("CLOSED");
    });
    it("serializes simultaneous offer commands and acceptance versus resignation into one terminal result", async () => {
      const f = await fixture();
      const sending = await Promise.all([
        run(f, f.red, (s) =>
          store.offerDraw(s, { matchId: f.matchId, matchVersion: 0 }),
        ),
        run(f, f.red, (s) =>
          store.offerDraw(s, { matchId: f.matchId, matchVersion: 0 }),
        ),
      ]);
      expect(sending.filter((r) => r.applied)).toHaveLength(1);
      const offer = sending.find((r) => r.applied)!;
      const finished = await Promise.all([
        run(f, f.black, (s) =>
          store.respondDraw(s, {
            matchId: f.matchId,
            matchVersion: offer.match.version,
            offerId: offer.draw.offers[0].id,
            accept: true,
          }),
        ),
        run(f, f.red, (s) =>
          store.resign(s, {
            matchId: f.matchId,
            matchVersion: offer.match.version,
          }),
        ),
      ]);
      expect(finished.filter((r) => r.applied)).toHaveLength(1);
      expect(finished[0].match.outcome).toEqual(finished[1].match.outcome);
      expect(
        (
          await pool.query(
            "SELECT count(*)::int n FROM public.match_events WHERE match_id=$1 AND type='RESULT'",
            [f.matchId],
          )
        ).rows[0].n,
      ).toBe(1);
    });

    it("expires without a response through the explicit worker seam and credits sender moves after the deadline", async () => {
      const f = await fixture();
      const offer = await run(f, f.red, (s) =>
        store.offerDraw(s, { matchId: f.matchId, matchVersion: 0 }),
      );
      await pool.query(
        "WITH t AS MATERIALIZED(SELECT date_trunc('milliseconds',clock_timestamp())-interval '1 second' deadline) UPDATE xiangqi_room.match_draw_offers SET created_at=t.deadline-interval '30 seconds',expires_at=t.deadline FROM t WHERE id=$1",
        [offer.draw.offers[0].id],
      );
      const moved = await run(f, f.red, (s) =>
        store.move(s, {
          matchId: f.matchId,
          matchVersion: offer.match.version,
          from: 54,
          to: 45,
        }),
      );
      expect(moved.applied).toBe(true);
      const projected = await run(f, f.red, (s) =>
        store.drawSnapshot(s, { matchId: f.matchId }),
      );
      expect(projected.offers).toEqual([]);
      expect(projected.remainingMoves.red).toBe(4);
      expect(
        (
          await pool.query(
            "SELECT status FROM xiangqi_room.match_draw_offers WHERE id=$1",
            [offer.draw.offers[0].id],
          )
        ).rows[0].status,
      ).toBe("PENDING");
      const expired = await run(f, f.black, (s) =>
        store.expireDrawOffers(s, { matchId: f.matchId }),
      );
      expect(expired.applied).toBe(true);
      expect(expired.draw.remainingMoves.red).toBe(4);
      expect(expired.draw.offers).toEqual([]);
      const before = (
        await pool.query("SELECT version FROM public.matches WHERE id=$1", [
          f.matchId,
        ])
      ).rows[0].version;
      await run(f, f.black, (s) =>
        store.expireDrawOffers(s, { matchId: f.matchId }),
      );
      expect(
        (
          await pool.query("SELECT version FROM public.matches WHERE id=$1", [
            f.matchId,
          ])
        ).rows[0].version,
      ).toBe(before);
    });
    it("an expired earlier disconnect beats draw acceptance while proposals do not stop clock consumption", async () => {
      const f = await fixture();
      const offer = await run(f, f.red, (s) =>
        store.offerDraw(s, { matchId: f.matchId, matchVersion: 0 }),
      );
      await pool.query(
        "UPDATE public.room_members SET disconnected_at=clock_timestamp()-interval '61 seconds' WHERE room_id=$1 AND user_id=$2",
        [f.roomId, f.red],
      );
      const accepted = await run(f, f.black, (s) =>
        store.respondDraw(s, {
          matchId: f.matchId,
          matchVersion: offer.match.version,
          offerId: offer.draw.offers[0].id,
          accept: true,
        }),
      );
      expect(accepted.match.outcome).toEqual({
        reason: "DISCONNECT",
        winner: "black",
      });
      expect(accepted.applied).toBe(false);
      const response = await run(f, f.black, (s) =>
        store.respondDraw(s, {
          matchId: f.matchId,
          matchVersion: accepted.match.version,
          offerId: offer.draw.offers[0].id,
          accept: true,
        }),
      );
      expect(response.match.outcome).toEqual(accepted.match.outcome);
      expect(response.error?.code).toBe("MATCH_FINISHED");
    });
    it("rolls back offers, versions, events and outbox when publication persistence fails", async () => {
      const f = await fixture();
      await pool.query(
        "CREATE FUNCTION public.fail_draw_outbox() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.type='MATCH_DRAW' THEN RAISE EXCEPTION 'synthetic persistence failure'; END IF; RETURN NEW; END $$; CREATE TRIGGER fail_draw_outbox BEFORE INSERT ON xiangqi_room.outbox FOR EACH ROW EXECUTE FUNCTION public.fail_draw_outbox()",
      );
      await expect(
        run(f, f.red, (s) =>
          store.offerDraw(s, { matchId: f.matchId, matchVersion: 0 }),
        ),
      ).rejects.toThrow("synthetic persistence failure");
      expect(
        (
          await pool.query(
            "SELECT count(*)::int n FROM xiangqi_room.match_draw_offers",
          )
        ).rows[0].n,
      ).toBe(0);
      expect(
        (
          await pool.query("SELECT version FROM public.matches WHERE id=$1", [
            f.matchId,
          ])
        ).rows[0].version,
      ).toBe("0");
      expect(
        (
          await pool.query(
            "SELECT count(*)::int n FROM public.match_events WHERE match_id=$1 AND type='PROPOSAL_CREATED'",
            [f.matchId],
          )
        ).rows[0].n,
      ).toBe(0);
    });
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

    it("closes the receiver's own pending offer when they accept the opponent's offer", async () => {
      const f = await fixture();
      const a = await run(f, f.red, (s) =>
        store.offerDraw(s, { matchId: f.matchId, matchVersion: 0 }),
      );
      const b = await run(f, f.black, (s) =>
        store.offerDraw(s, {
          matchId: f.matchId,
          matchVersion: a.match.version,
        }),
      );
      const accepted = await run(f, f.black, (s) =>
        store.respondDraw(s, {
          matchId: f.matchId,
          matchVersion: b.match.version,
          offerId: a.draw.offers[0].id,
          accept: true,
        }),
      );
      expect(accepted.match.outcome).toEqual({
        reason: "DRAW_AGREEMENT",
        winner: null,
      });
      expect(
        (
          await pool.query(
            "SELECT sender,status FROM xiangqi_room.match_draw_offers ORDER BY sender",
          )
        ).rows,
      ).toEqual([
        { sender: "BLACK", status: "CLOSED" },
        { sender: "RED", status: "ACCEPTED" },
      ]);
      expect(
        (
          await pool.query(
            "SELECT count(*)::int n FROM public.match_events WHERE match_id=$1 AND type='RESULT'",
            [f.matchId],
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
