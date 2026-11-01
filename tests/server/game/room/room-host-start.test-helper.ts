import { randomUUID } from "node:crypto";
import { actor, apply, pool, reset, transaction } from "./room.test-helper.js";
import { RoomStore } from "@server/game/room/room-store.js";
import type { RoomActor, RoomScope } from "@server/game/room/room.types.js";

export const store = new RoomStore();
const capabilities = new Map<string, string>();

export async function run<T>(
  a: RoomActor,
  proof: string,
  roomIds: string[],
  work: (s: RoomScope) => Promise<T>,
) {
  const roster = roomIds.length
    ? (
        await pool.query(
          "SELECT user_id FROM public.room_members WHERE room_id=ANY($1::uuid[]) AND role='PLAYER'",
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

export type Admitted = { a: RoomActor; proof: string };

export async function admitted(): Promise<Admitted> {
  const a = await actor();
  const proof = randomUUID();
  capabilities.set(a.userId, proof);
  return { a, proof };
}

/** Host (Đỏ) và người chơi thứ hai (Đen) đã ngồi ghế, cả hai đã kết nối. */
export async function connectedPair() {
  const h = await admitted(),
    b = await admitted();
  const e = await run(h.a, h.proof, [], (s) =>
    store.create(s, { commandId: randomUUID() }),
  );
  await run(b.a, b.proof, [e.roomId], (s) =>
    store.join(s, {
      commandId: randomUUID(),
      roomId: e.roomId,
      intent: "auto",
    }),
  );
  for (const [u, connectionId] of [
    [h, "host"],
    [b, "black"],
  ] as const)
    await run(u.a, u.proof, [e.roomId], (s) =>
      store.presence(
        s,
        e.roomId,
        { connectionId, generation: 1, serverInstance: randomUUID() },
        true,
      ),
    );
  return { h, b, roomId: e.roomId };
}

export async function resetRoomSchema() {
  await pool.query(
    "DROP SCHEMA IF EXISTS xiangqi_chat CASCADE; DROP SCHEMA IF EXISTS xiangqi_ai CASCADE",
  );
  await reset();
  await apply("supabase/migrations/20261011000006_rooms.sql");
  await apply("supabase/migrations/20261011000008_room_modes.sql");
  await apply("supabase/migrations/20261017000018_room_code_digits.sql");
  await apply("supabase/migrations/20261102000002_custom_rematch.sql");
  await apply("supabase/migrations/20261011000013_side_swap.sql");
  await apply("supabase/migrations/20261103000004_room_issued_codes.sql");
  await apply("supabase/migrations/20261103000011_yc9_ranked.sql");
}
