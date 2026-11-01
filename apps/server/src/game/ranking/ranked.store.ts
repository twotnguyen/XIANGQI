import type { PoolClient } from "pg";
import type { RankedRating, RatingChange } from "@xiangqi/shared";
export type { RankedRating, RatingChange } from "@xiangqi/shared";
import type { MatchOutcome } from "../match/match.types.js";

type Settlement = { red: RatingChange; black: RatingChange };
type RatingRow = { user_id: string; elo: number; completed: number; wins: number; draws: number; losses: number; rank: string | number | null };

export function ratingTier(elo: number, completed: number): string {
  if (!completed) return "Chưa xếp hạng";
  if (elo < 1200) return "Người mới";
  if (elo < 1400) return "Sơ cấp";
  if (elo < 1600) return "Trung cấp";
  if (elo < 1800) return "Cao cấp";
  if (elo < 2000) return "Kiện tướng";
  return "Đại sư";
}
export function calculateRating(elo: number, opponent: number, completed: number, score: number): number {
  return Math.max(100, Math.round(elo + (completed < 30 ? 32 : 16) * (score - 1 / (1 + 10 ** ((opponent - elo) / 400)))));
}
function project(row: RatingRow, minimum: number): RankedRating {
  return { elo: row.elo, completed: row.completed, wins: row.wins, draws: row.draws, losses: row.losses, tier: ratingTier(row.elo, row.completed), rank: row.rank === null ? null : Number(row.rank), remaining: Math.max(0, minimum - row.completed) };
}
export async function readRatings(client: PoolClient, userIds: string[], minimumGames = 5): Promise<Map<string, RankedRating>> {
  if (!userIds.length) return new Map();
  const rows = await client.query<RatingRow>(`WITH ranked AS (
    SELECT user_id,row_number() OVER (ORDER BY elo DESC,wins DESC,achieved_at ASC,user_id ASC) AS rank
    FROM xiangqi_room.ratings WHERE completed >= $2
  ) SELECT p.id AS user_id,COALESCE(r.elo,1200)::int AS elo,COALESCE(r.completed,0)::int AS completed,
    COALESCE(r.wins,0)::int AS wins,COALESCE(r.draws,0)::int AS draws,COALESCE(r.losses,0)::int AS losses,ranked.rank
    FROM xiangqi_auth.principals p LEFT JOIN xiangqi_room.ratings r ON r.user_id=p.id LEFT JOIN ranked ON ranked.user_id=p.id
    WHERE p.kind='member' AND p.auth_user_id=p.id AND p.id=ANY($1::uuid[])`, [userIds, minimumGames]);
  return new Map(rows.rows.map(row => [row.user_id, project(row, minimumGames)]));
}
export async function readSettlement(client: PoolClient, matchId: string): Promise<Settlement | null> {
  const result = await client.query<{red_before:number;red_after:number;black_before:number;black_after:number;red_tier:string;black_tier:string}>("SELECT red_before,red_after,black_before,black_after,red_tier,black_tier FROM xiangqi_room.ranked_results WHERE match_id=$1", [matchId]);
  const row = result.rows[0];
  return row ? { red: {before:row.red_before,after:row.red_after,delta:row.red_after-row.red_before,tier:row.red_tier}, black: {before:row.black_before,after:row.black_after,delta:row.black_after-row.black_before,tier:row.black_tier} } : null;
}
export async function settleRanked(client: PoolClient, matchId: string, outcome: MatchOutcome, at: Date): Promise<Settlement | null> {
  const match = (await client.query<{red_user_id:string;black_user_id:string;kind:string;status:string}>(`SELECT m.red_user_id,m.black_user_id,r.kind,m.status FROM public.matches m JOIN public.rooms r ON r.id=m.room_id WHERE m.id=$1 AND m.mode='ONLINE' FOR UPDATE OF m`, [matchId])).rows[0];
  if (!match || match.kind !== 'RANKED' || match.status !== 'FINISHED' || ['SERVER_RESTART','ABORTED'].includes(outcome.reason)) return null;
  const existing = await readSettlement(client, matchId);
  if (existing) return existing;
  const ids = [match.red_user_id,match.black_user_id].sort();
  const members = await client.query("SELECT id FROM xiangqi_auth.principals WHERE id=ANY($1::uuid[]) AND kind='member' AND auth_user_id=id", [ids]);
  if (members.rowCount !== 2 || ids[0] === ids[1]) throw new Error('Ranked match requires two members');
  await client.query("INSERT INTO xiangqi_room.ratings(user_id,achieved_at) SELECT id,$2 FROM unnest($1::uuid[]) id ORDER BY id ON CONFLICT DO NOTHING", [ids,at]);
  const rows = (await client.query<RatingRow>("SELECT * FROM xiangqi_room.ratings WHERE user_id=ANY($1::uuid[]) ORDER BY user_id FOR UPDATE", [ids])).rows;
  const red = rows.find(r => r.user_id === match.red_user_id)!; const black = rows.find(r => r.user_id === match.black_user_id)!;
  const redScore = outcome.winner === null ? 0.5 : outcome.winner === 'red' ? 1 : 0;
  const redAfter = calculateRating(red.elo,black.elo,red.completed,redScore), blackAfter = calculateRating(black.elo,red.elo,black.completed,1-redScore);
  for (const [row,after,score] of [[red,redAfter,redScore],[black,blackAfter,1-redScore]] as const) {
    await client.query(`UPDATE xiangqi_room.ratings SET elo=$2,completed=completed+1,wins=wins+$3,draws=draws+$4,losses=losses+$5,achieved_at=CASE WHEN elo<>$2 THEN $6 ELSE achieved_at END WHERE user_id=$1`, [row.user_id,after,Number(score===1),Number(score===0.5),Number(score===0),at]);
  }
  await client.query(`INSERT INTO xiangqi_room.ranked_results(match_id,red_id,black_id,red_before,red_after,black_before,black_after,red_tier,black_tier,achieved_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`, [matchId,red.user_id,black.user_id,red.elo,redAfter,black.elo,blackAfter,ratingTier(redAfter,red.completed+1),ratingTier(blackAfter,black.completed+1),at]);
  return readSettlement(client,matchId);
}
export async function readLeaderboard(client: PoolClient, selfId: string, minimumGames = 5) {
  const ids = (await client.query<{user_id:string}>("SELECT user_id FROM xiangqi_room.ratings WHERE completed >= $1 ORDER BY elo DESC,wins DESC,achieved_at,user_id LIMIT 50", [minimumGames])).rows.map(r => r.user_id);
  const all = [...new Set([...ids,selfId])];
  const ratings = await readRatings(client,all,minimumGames);
  const profiles = (await client.query<{user_id:string;display_name:string;username:string;avatar_url:string|null;can_message:boolean}>(`SELECT p.user_id,p.display_name,p.username,NULL::text AS avatar_url, EXISTS(SELECT 1 FROM xiangqi_social.friendships f WHERE f.user_a=LEAST(p.user_id,$2::uuid) AND f.user_b=GREATEST(p.user_id,$2::uuid)) AS can_message FROM public.profiles p WHERE p.user_id=ANY($1::uuid[])`,[all,selfId])).rows;
  const players = new Map(profiles.filter(p => ratings.has(p.user_id)).map(p => [p.user_id,{userId:p.user_id,displayName:p.display_name,username:p.username,avatarUrl:p.avatar_url,rating:ratings.get(p.user_id)!,canMessage:p.can_message}]));
  const self = players.get(selfId);
  if (!self) throw new Error('Member profile missing');
  return {players:ids.map(id => players.get(id)).filter((p): p is NonNullable<typeof p> => !!p),self,minimumGames,demo:minimumGames<5};
}
