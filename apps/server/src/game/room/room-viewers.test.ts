import { randomUUID } from "node:crypto";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import {
  actor,
  apply,
  databaseUrl,
  pool,
  reset,
  transaction,
} from "./room.test-helper.js";
import { RoomStore } from "./room-store.js";
import type { RoomActor, RoomScope } from "./room.types.js";
afterAll(() => pool.end());
const store = new RoomStore();
const capabilities = new Map<string, string>();
async function run<T>(
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
async function admitted() {
  const a = await actor();
  const proof = randomUUID();
  capabilities.set(a.userId, proof);
  return { a, proof };
}
async function fullRoom() {
  const h = await admitted(),
    b = await admitted(),
    w = await admitted();
  const e = await run(h.a, h.proof, [], (s) =>
    store.create(s, { commandId: randomUUID(), name: "Khan dai" }),
  );
  await run(b.a, b.proof, [e.roomId], (s) =>
    store.join(s, {
      commandId: randomUUID(),
      roomId: e.roomId,
      intent: "auto",
    }),
  );
  await run(w.a, w.proof, [e.roomId], (s) =>
    store.join(s, {
      commandId: randomUUID(),
      roomId: e.roomId,
      intent: "watch",
    }),
  );
  return { h, b, w, roomId: e.roomId };
}
describe.skipIf(!databaseUrl)("room viewers", () => {
  beforeEach(async () => {
    await pool.query(
      "DROP SCHEMA IF EXISTS xiangqi_chat CASCADE; DROP SCHEMA IF EXISTS xiangqi_ai CASCADE; DROP SCHEMA IF EXISTS xiangqi_social CASCADE",
    );
    await reset();
    await apply("supabase/migrations/20261011000006_rooms.sql");
    await apply("supabase/migrations/20261011000016_room_viewers.sql");
  });
  it("moves a non-host player to spectator and back via host invite", async () => {
    const { h, b, roomId } = await fullRoom();
    await expect(
      run(h.a, h.proof, [roomId], (s) => store.toSpectator(s, roomId)),
    ).rejects.toMatchObject({ code: "HOST_STAYS" });
    const moved = await run(b.a, b.proof, [roomId], (s) =>
      store.toSpectator(s, roomId),
    );
    expect(moved.room.seats).toEqual({ red: h.a.userId, black: null });
    expect(moved.room.downOffer).toBeNull();
    await run(h.a, h.proof, [roomId], (s) =>
      store.inviteDown(s, roomId, b.a.userId),
    );
    const back = await run(b.a, b.proof, [roomId], (s) =>
      store.respondDown(s, roomId, true),
    );
    expect(back.room.seats).toEqual({ red: h.a.userId, black: b.a.userId });
    expect(back.room.ready).toEqual({ red: false, black: false });
    expect(back.room.downOffer).toBeNull();
  });
  it("host moves the other player and declines expire", async () => {
    const { h, b, roomId } = await fullRoom();
    const moved = await run(h.a, h.proof, [roomId], (s) =>
      store.moveToSpectator(s, roomId, b.a.userId),
    );
    expect(moved.room.seats).toEqual({ red: h.a.userId, black: null });
    await expect(
      run(b.a, b.proof, [roomId], (s) =>
        store.moveToSpectator(s, roomId, h.a.userId),
      ),
    ).rejects.toMatchObject({ code: "SEAT_MOVE_DENIED" });
    await run(h.a, h.proof, [roomId], (s) =>
      store.inviteDown(s, roomId, b.a.userId),
    );
    const declined = await run(b.a, b.proof, [roomId], (s) =>
      store.respondDown(s, roomId, false),
    );
    expect(declined.room.downOffer).toBeNull();
    expect(declined.room.seats).toEqual({ red: h.a.userId, black: null });
  });
  it("kicks a viewer and blocks re-entry until close", async () => {
    const { h, b, w, roomId } = await fullRoom();
    await expect(
      run(w.a, w.proof, [roomId], (s) =>
        store.kickViewer(s, roomId, b.a.userId),
      ),
    ).rejects.toMatchObject({ code: "KICK_DENIED" });
    const kicked = await run(b.a, b.proof, [roomId], (s) =>
      store.kickViewer(s, roomId, w.a.userId),
    );
    expect(kicked.room.seats).toEqual({ red: h.a.userId, black: b.a.userId });
    await expect(
      run(w.a, w.proof, [roomId], (s) =>
        store.join(s, { commandId: randomUUID(), roomId, intent: "watch" }),
      ),
    ).rejects.toMatchObject({ code: "ROOM_BLOCKED" });
    await expect(
      run(w.a, w.proof, [roomId], (s) =>
        store.join(s, { commandId: randomUUID(), roomId, intent: "auto" }),
      ),
    ).rejects.toMatchObject({ code: "ROOM_BLOCKED" });
  });
  it("rejects seat invite races and moves during play", async () => {
    const { h, b, roomId } = await fullRoom();
    await run(b.a, b.proof, [roomId], (s) => store.toSpectator(s, roomId));
    await run(h.a, h.proof, [roomId], (s) =>
      store.inviteDown(s, roomId, b.a.userId),
    );
    const v = await admitted();
    await run(v.a, v.proof, [roomId], (s) =>
      store.join(s, { commandId: randomUUID(), roomId, intent: "auto" }),
    );
    await expect(
      run(b.a, b.proof, [roomId], (s) => store.respondDown(s, roomId, true)),
    ).rejects.toMatchObject({ code: "SEAT_INVITE_MISSING" });
    const matchId = randomUUID();
    await pool.query("BEGIN");
    await pool.query(
      "INSERT INTO public.matches(id,room_id,mode,status,red_user_id,black_user_id,position,time_control,clock) VALUES($1,$2,'ONLINE','ACTIVE',$3,$4,(SELECT jsonb_build_object('board',jsonb_agg(x),'turn','RED') FROM (SELECT NULL::jsonb AS x FROM generate_series(1,90)) s),600,jsonb_build_object('redMs',600000,'blackMs',600000,'runningSinceEpochMs',floor(extract(epoch FROM clock_timestamp())*1000)::bigint))",
      [matchId, roomId, h.a.userId, v.a.userId],
    );
    await pool.query(
      "UPDATE public.rooms SET status='PLAYING',current_match_id=$2 WHERE id=$1",
      [roomId, matchId],
    );
    await pool.query("COMMIT");
    await expect(
      run(h.a, h.proof, [roomId], (s) => store.toSpectator(s, roomId)),
    ).rejects.toMatchObject({ code: "SEAT_MOVE_DENIED" });
  });
  it("closes invites when the seat fills before countdown", async () => {
    const { h, b, roomId } = await fullRoom();
    await run(b.a, b.proof, [roomId], (s) => store.toSpectator(s, roomId));
    await run(h.a, h.proof, [roomId], (s) =>
      store.inviteDown(s, roomId, b.a.userId),
    );
    const v = await admitted();
    await run(v.a, v.proof, [roomId], (s) =>
      store.join(s, { commandId: randomUUID(), roomId, intent: "auto" }),
    );
    for (const p of [h, v])
      await run(p.a, p.proof, [roomId], (s) =>
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
    await run(h.a, h.proof, [roomId], (s) => store.ready(s, roomId, true));
    await run(v.a, v.proof, [roomId], (s) => store.ready(s, roomId, true));
    await expect(
      run(b.a, b.proof, [roomId], (s) => store.respondDown(s, roomId, true)),
    ).rejects.toMatchObject({ code: "SEAT_INVITE_MISSING" });
  });
});
