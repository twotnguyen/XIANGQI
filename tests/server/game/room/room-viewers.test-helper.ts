import { randomUUID } from "node:crypto";
import { actor, apply, pool, reset, transaction } from "./room.test-helper.js";
import { RoomStore } from "@server/game/room/room-store.js";
import { AiReservations } from "@server/game/ai/ai-reservations.js";
import type { RoomActor, RoomScope } from "@server/game/room/room.types.js";

export const store = new RoomStore();
const capabilities = new Map<string, string>();
export type Person = Awaited<ReturnType<typeof admitted>>;
export async function run<T>(
  a: RoomActor,
  proof: string,
  roomIds: string[],
  work: (s: RoomScope) => Promise<T>,
) {
  const roster = roomIds.length
    ? (
        await pool.query(
          "SELECT user_id FROM public.room_members WHERE room_id=ANY($1::uuid[])",
          [roomIds],
        )
      ).rows.map((r: { user_id: string }) => r.user_id)
    : [];
  const ids = [a.userId, ...roster];
  return transaction(
    ids,
    roomIds,
    async (client) =>
      work({
        client,
        actor: a,
        lockedActorIds: new Set(ids),
        lockedRoomIds: new Set(roomIds),
        activeActorIds: new Set(ids.filter((id) => capabilities.has(id))),
      }),
    async () => {
      if (capabilities.get(a.userId) !== proof)
        throw new Error("SESSION_INVALID");
    },
  );
}
export async function admitted() {
  const a = await actor();
  const proof = randomUUID();
  capabilities.set(a.userId, proof);
  return { a, proof };
}
export const as = <T>(
  p: Person,
  roomId: string,
  work: (s: RoomScope) => Promise<T>,
) => run(p.a, p.proof, [roomId], work);
export async function joinAs(
  p: Person,
  roomId: string,
  intent: "auto" | "watch",
) {
  return as(p, roomId, (s) =>
    store.join(s, { commandId: randomUUID(), roomId, intent }),
  );
}
/** Host (Đỏ) + người chơi b (Đen) + người xem w. */
export async function fullRoom() {
  const h = await admitted(),
    b = await admitted(),
    w = await admitted();
  const e = await run(h.a, h.proof, [], (s) =>
    store.create(s, { commandId: randomUUID() }),
  );
  await joinAs(b, e.roomId, "auto");
  await joinAs(w, e.roomId, "watch");
  return { h, b, w, roomId: e.roomId };
}
/** Đánh dấu người chơi đã nối realtime để Sẵn sàng/Bắt đầu được phép. */
export const connect = (p: Person, roomId: string) =>
  as(p, roomId, (s) =>
    store.presence(
      s,
      roomId,
      {
        connectionId: p.a.userId,
        generation: 1,
        serverInstance: randomUUID(),
      },
      true,
    ),
  );
/** Đưa phòng vào ván ACTIVE bằng dữ liệu thật (không qua đếm ngược). */
export async function playMatch(roomId: string, red: Person, black: Person) {
  const matchId = randomUUID();
  await pool.query("BEGIN");
  await pool.query(
    "INSERT INTO public.matches(id,room_id,mode,status,red_user_id,black_user_id,position,time_control,clock) VALUES($1,$2,'ONLINE','ACTIVE',$3,$4,(SELECT jsonb_build_object('board',jsonb_agg(x),'turn','RED') FROM (SELECT NULL::jsonb AS x FROM generate_series(1,90)) s),600,jsonb_build_object('redMs',600000,'blackMs',600000,'runningSinceEpochMs',floor(extract(epoch FROM clock_timestamp())*1000)::bigint))",
    [matchId, roomId, red.a.userId, black.a.userId],
  );
  await pool.query(
    "UPDATE public.rooms SET status='PLAYING',current_match_id=$2 WHERE id=$1",
    [roomId, matchId],
  );
  await pool.query("COMMIT");
}
export async function reserveAi(player: Person, roomId: string) {
  await apply("supabase/migrations/20261011000011_ai_reservations.sql");
  const reservations = new AiReservations();
  const boot = await transaction([], [], (client) =>
    reservations.createBoot(client),
  );
  const gameId = randomUUID();
  await run(player.a, player.proof, [roomId], (s) =>
    reservations.reserve(s, { gameId, bootId: boot.id }),
  );
  return gameId;
}
export async function migrateViewers() {
  await pool.query(
    "DROP SCHEMA IF EXISTS xiangqi_chat CASCADE; DROP SCHEMA IF EXISTS xiangqi_ai CASCADE; DROP SCHEMA IF EXISTS xiangqi_social CASCADE",
  );
  await reset();
  await apply("supabase/migrations/20261011000006_rooms.sql");
  await apply("supabase/migrations/20261017000018_room_code_digits.sql");
  await apply("supabase/migrations/20261102000002_custom_rematch.sql");
  await apply("supabase/migrations/20261103000004_room_issued_codes.sql");
  await apply("supabase/migrations/20261011000016_room_viewers.sql");
  await apply("supabase/migrations/20261103000008_seat_requests.sql");
  await apply("supabase/migrations/20261103000011_yc9_ranked.sql");
}
