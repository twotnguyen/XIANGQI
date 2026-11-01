import { randomUUID } from "node:crypto";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { initialPosition } from "@xiangqi/xiangqi-core";
import { encodePosition } from "@server/game/match/position-codec.js";
import { calculateRating, ratingTier, readLeaderboard, settleRanked } from "@server/game/ranking/ranked.store.js";
import { RoomTransactions } from "@server/game/room/room-transactions.js";
import type { RoomActor, RoomScope } from "@server/game/room/room.types.js";
import { apply, databaseUrl, pool, resetBase as reset } from "../match/match.test-helper.js";

const coordinator = new RoomTransactions(pool);
const at = new Date("2026-10-01T00:00:00Z");
async function member(): Promise<RoomActor> {
  const userId = randomUUID();
  await pool.query("INSERT INTO auth.users(id,email,email_confirmed_at) VALUES($1,$2,now())", [userId, `${userId}@example.invalid`]);
  await pool.query("INSERT INTO public.profiles(user_id,username,display_name) VALUES($1,$2,'Player')", [userId, `u${userId.replaceAll('-', '').slice(0, 18)}`]);
  return { userId, kind: "member" };
}
async function run<T>(actor: RoomActor, roomIds: string[], work: (scope: RoomScope) => Promise<T>) {
  const result = await coordinator.withRoom({ actor, roomIds }, async proof => ({ status: "active", actor: proof.actor }), work);
  if (result.status !== "active") throw new Error("Synthetic actor ended");
  return result.value;
}
async function game(red: RoomActor, black: RoomActor, status: "FINISHED" | "INTERRUPTED" = "FINISHED", kind: "RANKED" | "CUSTOM" = "RANKED") {
  const room = randomUUID(), id = randomUUID();
  await pool.query("INSERT INTO public.rooms(id,owner_id,name,time_control,kind) VALUES($1,$2,'Ranked',300,$3)", [room, red.userId, kind]);
  await pool.query("WITH seats AS (INSERT INTO public.active_players(user_id,room_id) VALUES($2,$1),($3,$1)) INSERT INTO public.room_members(room_id,user_id,role,side,ready) VALUES($1,$2,'PLAYER','RED',false),($1,$3,'PLAYER','BLACK',false)", [room, red.userId, black.userId]);
  await pool.query("INSERT INTO public.matches(id,room_id,mode,status,red_user_id,black_user_id,position,version,created_at,ended_at,outcome) VALUES($1,$2,'ONLINE',$3,$4,$5,$6,2,'2026-01-01',$7,$8)", [id, room, status, red.userId, black.userId, encodePosition(initialPosition()), at, { reason: status === "FINISHED" ? "RESIGN" : "SERVER_RESTART", winner: status === "FINISHED" ? "RED" : null }]);
  return { id, room };
}

describe("ranked Elo boundaries", () => {
  it("rounds exact halves upward, not toward zero or to even", () => {
    expect(calculateRating(1200.5, 1200.5, 0, 0.5)).toBe(1201);
    expect(calculateRating(1201.5, 1201.5, 30, 0.5)).toBe(1202);
  });
  it.each([
    [1199, "Người mới"], [1200, "Sơ cấp"], [1399, "Sơ cấp"], [1400, "Trung cấp"],
    [1599, "Trung cấp"], [1600, "Cao cấp"], [1799, "Cao cấp"], [1800, "Kiện tướng"],
    [1999, "Kiện tướng"], [2000, "Đại sư"],
  ])("assigns Elo %i to %s", (elo, tier) => expect(ratingTier(elo, 1)).toBe(tier));
  it("leaves a player with no completed games unrated", () => expect(ratingTier(2000, 0)).toBe("Chưa xếp hạng"));
});

describe.skipIf(!databaseUrl)("ranked database boundaries", () => {
  beforeEach(async () => {
    await pool.query("DROP SCHEMA IF EXISTS xiangqi_ai CASCADE; DROP SCHEMA IF EXISTS xiangqi_chat CASCADE; DROP SCHEMA IF EXISTS xiangqi_social CASCADE");
    await reset();
    for (const file of ["20261011000007_match_outcomes", "20261102000003_unlimited_inactivity", "20261103000005_match_aborted", "20261103000006_online_undo", "20261103000007_match_simultaneous_disconnect", "20261011000014_friendships"]) await apply(`supabase/migrations/${file}.sql`);
    await pool.query("ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA xiangqi_room GRANT SELECT ON TABLES TO service_role");
    await apply("supabase/migrations/20261103000011_yc9_ranked.sql");
  });
  afterAll(async () => {
    await pool.query("ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA xiangqi_room REVOKE SELECT ON TABLES FROM service_role");
    await pool.end();
  });

  it("settles both players with their own K, once under concurrent actor locks", async () => {
    const red = await member(), black = await member(), match = await game(red, black);
    await pool.query("INSERT INTO xiangqi_room.ratings(user_id,elo,completed,wins,draws,losses) VALUES($1,1200,29,0,29,0),($2,1200,30,0,30,0)", [red.userId, black.userId]);
    const settle = (actor: RoomActor) => run(actor, [match.room], async scope => {
      expect(scope.lockedActorIds.has(red.userId)).toBe(true);
      expect(scope.lockedActorIds.has(black.userId)).toBe(true);
      return settleRanked(scope.client, match.id, { reason: "RESIGN", winner: "red" }, at);
    });
    const results = await Promise.all([settle(red), settle(black)]);
    expect(results[0]).toEqual(results[1]);
    expect(results[0]).toMatchObject({ red: { before: 1200, after: 1216 }, black: { before: 1200, after: 1192 } });
    expect((await pool.query("SELECT user_id,elo,completed,wins,draws,losses FROM xiangqi_room.ratings WHERE user_id=ANY($1::uuid[]) ORDER BY user_id", [[red.userId, black.userId]])).rows).toEqual(expect.arrayContaining([
      { user_id: red.userId, elo: 1216, completed: 30, wins: 1, draws: 29, losses: 0 },
      { user_id: black.userId, elo: 1192, completed: 31, wins: 0, draws: 30, losses: 1 },
    ]));
    expect((await pool.query("SELECT count(*)::int AS n FROM xiangqi_room.ranked_results WHERE match_id=$1", [match.id])).rows[0].n).toBe(1);
  });
  it("applies the floor and rolls back both ratings and the result together", async () => {
    const red = await member(), black = await member(), match = await game(red, black);
    await pool.query("INSERT INTO xiangqi_room.ratings(user_id,elo,completed,wins,draws,losses) VALUES($1,100,0,0,0,0),($2,100,0,0,0,0)", [red.userId, black.userId]);
    await expect(run(red, [match.room], async scope => {
      expect(await settleRanked(scope.client, match.id, {reason:"RESIGN",winner:"black"}, at)).toMatchObject({red:{after:100},black:{after:116}});
      throw new Error("rollback test");
    })).rejects.toThrow();
    expect((await pool.query("SELECT elo,completed FROM xiangqi_room.ratings WHERE user_id=ANY($1::uuid[])", [[red.userId,black.userId]])).rows).toEqual([{elo:100,completed:0},{elo:100,completed:0}]);
    expect((await pool.query("SELECT count(*)::int AS n FROM xiangqi_room.ranked_results WHERE match_id=$1", [match.id])).rows[0].n).toBe(0);
  });
  it("excludes interrupted matches from both standings and results", async () => {
    const red = await member(), black = await member(), match = await game(red, black, "INTERRUPTED");
    expect(await run(red, [match.room], scope => settleRanked(scope.client, match.id, {reason:"SERVER_RESTART",winner:null}, at))).toBeNull();
    expect((await pool.query("SELECT count(*)::int AS n FROM xiangqi_room.ratings")).rows[0].n).toBe(0);
    expect((await pool.query("SELECT count(*)::int AS n FROM xiangqi_room.ranked_results")).rows[0].n).toBe(0);
  });
  it("orders by wins then user id and pins rank 51; four games become eligible at five", async () => {
    const players = await Promise.all(Array.from({length: 52}, () => member()));
    const ids = players.map(p => p.userId).sort();
    for (let i = 0; i < ids.length; i++) await pool.query("INSERT INTO xiangqi_room.ratings(user_id,elo,completed,wins,draws,losses,achieved_at) VALUES($1,1400,$2,$3,$4,0,'2026-01-01')", [ids[i], i === 51 ? 4 : 5, i === 50 ? 4 : 3, i === 51 ? 1 : i === 50 ? 1 : 2]);
    const self = players.find(p => p.userId === ids[49])!;
    let view = await run(self, [], scope => readLeaderboard(scope.client, self.userId));
    expect(view.players).toHaveLength(50);
    expect(view.players[0]?.userId).toBe(ids[50]);
    expect(view.players.slice(1).map(p => p.userId)).toEqual(ids.slice(0,49));
    expect(view.self.rating.rank).toBe(51);
    const under = players.find(p => p.userId === ids[51])!;
    view = await run(under, [], scope => readLeaderboard(scope.client, under.userId));
    expect(view.self.rating).toMatchObject({rank:null,remaining:1});
    await pool.query("UPDATE xiangqi_room.ratings SET completed=5,draws=draws+1 WHERE user_id=$1", [under.userId]);
    view = await run(under, [], scope => readLeaderboard(scope.client, under.userId));
    expect(view.self.rating).toMatchObject({rank:52,remaining:0});
  });
  it("denies direct access to ratings and results for external roles", async () => {
    for (const role of ["anon", "authenticated", "service_role"]) {
      for (const table of ["ratings", "ranked_results"]) {
        expect((await pool.query("SELECT has_table_privilege($1,$2,'SELECT') AS allowed", [role, `xiangqi_room.${table}`])).rows[0].allowed).toBe(false);
        const client = await pool.connect();
        try {
          await client.query("BEGIN");
          await client.query(`SET LOCAL ROLE ${role}`);
          await expect(client.query(`SELECT * FROM xiangqi_room.${table}`)).rejects.toMatchObject({code:"42501"});
        } finally { await client.query("ROLLBACK"); client.release(); }
      }
    }
  });
  it("rolls back an empty migration and refuses to drop existing ratings", async () => {
    await apply("supabase/rollback/20261103000011_yc9_ranked.sql");
    expect((await pool.query("SELECT to_regclass('xiangqi_room.ratings') AS ratings")).rows[0].ratings).toBeNull();
    await apply("supabase/migrations/20261103000011_yc9_ranked.sql");
    const user = await member();
    await pool.query("INSERT INTO xiangqi_room.ratings(user_id) VALUES($1)", [user.userId]);
    await expect(apply("supabase/rollback/20261103000011_yc9_ranked.sql")).rejects.toThrow();
    expect((await pool.query("SELECT count(*)::int AS n FROM xiangqi_room.ratings WHERE user_id=$1", [user.userId])).rows[0].n).toBe(1);
  });
  it("refuses rollback when a result exists even without ratings or ranked rooms", async () => {
    const red = await member(), black = await member(), match = await game(red, black, "FINISHED", "CUSTOM");
    await pool.query("INSERT INTO xiangqi_room.ranked_results(match_id,red_id,black_id,red_before,red_after,black_before,black_after,red_tier,black_tier,achieved_at) VALUES($1,$2,$3,1200,1216,1200,1184,'Sơ cấp','Người mới',$4)", [match.id, red.userId, black.userId, at]);
    await expect(apply("supabase/rollback/20261103000011_yc9_ranked.sql")).rejects.toThrow();
    expect((await pool.query("SELECT count(*)::int AS n FROM xiangqi_room.ranked_results WHERE match_id=$1", [match.id])).rows[0].n).toBe(1);
  });
});
