import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import { actor, apply, databaseUrl, reset } from "../room/room.test-helper.js";
export const url = process.env.ROOM_TEST_DATABASE_URL ?? databaseUrl;
export const pool = new Pool({ connectionString: url });
export const config = {
  url: "wss://media.example.invalid",
  apiKey: "test-api-key",
  apiSecret: "test-api-secret-that-is-long-enough-for-hs256",
};
export { actor };
/** Recreates the room/auth/media schemas used by media access tests. */
export async function resetMediaSchema() {
  await pool.query(
    "DROP SCHEMA IF EXISTS xiangqi_chat CASCADE; DROP SCHEMA IF EXISTS xiangqi_ai CASCADE; DROP SCHEMA IF EXISTS xiangqi_social CASCADE",
  );
  await reset();
  await apply("supabase/migrations/20261011000006_rooms.sql");
  await apply("supabase/migrations/20261017000018_room_code_digits.sql");
  await apply("supabase/migrations/20261011000015_media_share.sql");
}
export async function makeRoom(owner: string) {
  const roomId = randomUUID();
  await pool.query(
    "INSERT INTO public.rooms(id,owner_id,name,visibility,invite_code,time_control,viewer_limit,status,room_version) VALUES($1,$2,'Phong media','CODE_ONLY','12345678',600,5,'WAITING',1)",
    [roomId, owner],
  );
  return roomId;
}
/** Seats a user as a PLAYER with an active player row, as the room service does. */
export async function seat(roomId: string, userId: string, side: string) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      "INSERT INTO public.room_members(room_id,user_id,role,side) VALUES($1,$2,'PLAYER',$3)",
      [roomId, userId, side],
    );
    await client.query(
      "INSERT INTO public.active_players(user_id,room_id,match_id) VALUES($1,$2,NULL)",
      [userId, roomId],
    );
    await client.query("COMMIT");
  } finally {
    client.release();
  }
}
/** Moves a seated PLAYER to SPECTATOR, dropping the seat and its active player row. */
export async function demoteToSpectator(roomId: string, userId: string) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("DELETE FROM public.active_players WHERE user_id=$1", [
      userId,
    ]);
    await client.query(
      "UPDATE public.room_members SET role='SPECTATOR',side=NULL WHERE room_id=$1 AND user_id=$2",
      [roomId, userId],
    );
    await client.query("COMMIT");
  } finally {
    client.release();
  }
}
/**
 * Queues a durable media.revoke-user event for the user with a fresh room version
 * so repeated events for one room never collide on (room, version, type).
 */
export async function queueRevoke(roomId: string, userId: string) {
  const eventId = randomUUID();
  await pool.query(
    `INSERT INTO xiangqi_room.outbox(id,room_id,room_version,type,payload)
     SELECT $1,id,(SELECT COALESCE(max(o.room_version),0)+1 FROM xiangqi_room.outbox o WHERE o.room_id=$2),'media.revoke-user',$3::jsonb
     FROM public.rooms WHERE id=$2`,
    [eventId, roomId, JSON.stringify({ userId })],
  );
  return eventId;
}
export async function deliveredAt(eventId: string): Promise<Date | null> {
  const { rows } = await pool.query<{ delivered_at: Date | null }>(
    "SELECT delivered_at FROM xiangqi_room.outbox WHERE id=$1",
    [eventId],
  );
  return rows[0]?.delivered_at ?? null;
}
export type ProviderCall = {
  url: string;
  body: { room: string; identity: string };
};
/**
 * Fake LiveKit fetch. `gate` holds every request until resolved; `entered` settles
 * once the first request has reached the provider; `fail` answers with HTTP 500.
 */
export function provider(
  options: { gate?: Promise<void>; fail?: boolean } = {},
) {
  const calls: ProviderCall[] = [];
  const { promise: entered, resolve: arrive } = deferred();
  const fetchFn = (async (
    input: string | URL | Request,
    init?: RequestInit,
  ) => {
    calls.push({
      url: String(input),
      body: JSON.parse(String(init?.body)),
    });
    arrive();
    if (options.gate) await options.gate;
    if (options.fail)
      return {
        ok: false,
        status: 500,
        json: async () => ({ code: "internal" }),
      } as Response;
    return { ok: true } as Response;
  }) as typeof fetch;
  return { calls, entered, fetchFn };
}
export async function waitForBlockedAdvisoryLock() {
  for (let i = 0; i < 500; i++) {
    const { rows } = await pool.query<{ n: number }>(
      "SELECT count(*)::int AS n FROM pg_locks WHERE locktype='advisory' AND NOT granted",
    );
    if (rows[0]!.n > 0) return;
  }
  throw new Error("token issuance never waited on the media lock");
}
/** Promise with an externally callable resolver, without Promise.withResolvers (not in ES2022 lib). */
export function deferred(): { promise: Promise<void>; resolve: () => void } {
  let done!: () => void;
  const promise = new Promise<void>((resolve) => {
    done = () => resolve();
  });
  return { promise, resolve: done };
}
