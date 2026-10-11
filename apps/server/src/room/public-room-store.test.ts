import { randomUUID } from "node:crypto";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { MatchStore } from "../match/match-store.js";
import { ClockService } from "../clock/clock-service.js";
import { RoomStore } from "./room-store.js";
import { RoomTransactions } from "./room-transactions.js";
import type { RoomActor, RoomScope } from "./contracts.js";
import { PublicRoomStore } from "./public-room-store.js";
import {
  actor,
  apply,
  databaseUrl,
  pool,
  reset,
  transaction,
} from "./room.test-helper.js";
const rooms = new RoomStore(),
  publicRooms = new PublicRoomStore(rooms),
  coordinator = new RoomTransactions(pool);
async function run<T>(
  a: RoomActor,
  ids: string[],
  work: (s: RoomScope) => Promise<T>,
) {
  const result = await coordinator.withRoom(
    { actor: a, roomIds: ids },
    async (p) => ({ status: "active", actor: p.actor }),
    work,
  );
  if (result.status !== "active") throw new Error("Synthetic actor ended");
  return result.value;
}
async function create(name = "Public Fixture", viewerLimit = 5) {
  const host = await actor();
  await pool.query(
    "UPDATE public.profiles SET display_name=$2 WHERE user_id=$1",
    [host.userId, name + " Host"],
  );
  const entry = await run(host, [], (s) =>
    rooms.create(s, { commandId: randomUUID(), name, viewerLimit }),
  );
  await run(host, [entry.roomId], (s) =>
    rooms.changeVisibility(s, entry.roomId, entry.version, "PUBLIC"),
  );
  return { host, ...entry };
}
async function list(a: RoomActor) {
  return run(a, [], (s) => publicRooms.list(s));
}
async function join(
  a: RoomActor,
  id: string,
  preference: "play" | "watch" = "watch",
  commandId = randomUUID(),
) {
  return run(a, [id], (s) =>
    publicRooms.join(s, id, { commandId, preference }),
  );
}
afterAll(() => pool.end());
describe.skipIf(!databaseUrl)(
  "public discovery and authoritative join on dedicated synthetic SQL",
  () => {
    beforeEach(async () => {
      await reset();
      for (const name of [
        "20261011000006_rooms",
        "20261011000007_match_outcomes",
        "20261011000008_room_modes",
      ])
        await apply(`supabase/migrations/${name}.sql`);
    });
    it("returns an empty list and refuses a forged actor scope before reading", async () => {
      const a = await actor();
      expect(await list(a)).toEqual([]);
      await transaction([], [], (client) =>
        expect(
          publicRooms.list({
            client,
            actor: a,
            lockedActorIds: new Set(),
            lockedRoomIds: new Set(),
          }),
        ).rejects.toMatchObject({ code: "AUTH_REQUIRED" }),
      );
    });
    it("projects only PUBLIC open managed rooms and safe Host display fields, preserving unknown dates", async () => {
      const a = await actor(),
        visible = await create("Visible"),
        privateRoom = await create("Private"),
        locked = await create("Locked"),
        closed = await create("Closed");
      await run(privateRoom.host, [privateRoom.roomId], async (s) => {
        const v = await rooms.snapshot(s, privateRoom.roomId);
        await rooms.changeVisibility(
          s,
          privateRoom.roomId,
          v.version,
          "CODE_ONLY",
        );
      });
      const opponent = await actor();
      await run(opponent, [locked.roomId], (s) =>
        rooms.join(s, {
          commandId: randomUUID(),
          roomId: locked.roomId,
          intent: "play",
        }),
      );
      await run(locked.host, [locked.roomId], async (s) => {
        const v = await rooms.snapshot(s, locked.roomId);
        await rooms.changeVisibility(s, locked.roomId, v.version, "LOCKED");
      });
      await run(closed.host, [closed.roomId], (s) =>
        rooms.leave(s, closed.roomId),
      );
      await pool.query(
        "UPDATE public.rooms SET public_opened_at=NULL WHERE id=$1",
        [visible.roomId],
      );
      const data = await list(a);
      expect(data).toEqual([
        {
          roomId: visible.roomId,
          name: "Visible",
          host: { displayName: "Visible Host", isGuest: true },
          timeMinutes: 10,
          status: "waiting",
          spectators: 0,
          viewerLimit: 5,
          emptySeats: 1,
          canPlay: true,
          canWatch: true,
          publicOpenedAt: null,
        },
      ]);
      const serialized = JSON.stringify(data);
      expect(serialized).not.toContain(visible.inviteCode!);
      expect(serialized).not.toContain(visible.host.userId);
      expect(serialized).not.toMatch(/email|username|session|position|token/);
    });
    it("labels an actual member Host without exposing its identity", async () => {
      const f = await create();
      const id = randomUUID();
      await pool.query(
        "INSERT INTO auth.users(id,email,email_confirmed_at) VALUES($1,$2,clock_timestamp())",
        [id, `synthetic-${id}@example.invalid`],
      );
      await pool.query(
        "INSERT INTO public.profiles(user_id,username,display_name,completed_at,registration_pending) VALUES($1,$2,'Public Member Host',clock_timestamp(),false)",
        [id, "p" + id.replaceAll("-", "").slice(0, 18)],
      );
      const member: RoomActor = { userId: id, kind: "member" };
      await run(member, [f.roomId], (s) =>
        rooms.join(s, {
          commandId: randomUUID(),
          roomId: f.roomId,
          intent: "play",
        }),
      );
      await run(f.host, [f.roomId], (s) => rooms.leave(s, f.roomId));
      expect((await list(member))[0]!.host).toEqual({
        displayName: "Public Member Host",
        isGuest: false,
      });
    });
    it("bounds to the most recent 50 and refills from the fifty-first when a top room closes", async () => {
      const reader = await actor(),
        entries = [];
      for (let i = 0; i < 51; i++) {
        const f = await create("Room " + i);
        await pool.query(
          "UPDATE public.rooms SET public_opened_at=$2 WHERE id=$1",
          [f.roomId, new Date(1600000000000 + i)],
        );
        entries.push(f);
      }
      let data = await list(reader);
      expect(data).toHaveLength(50);
      expect(data.map((r) => r.roomId)).toEqual(
        entries
          .slice(1)
          .reverse()
          .map((r) => r.roomId),
      );
      const newest = entries[50]!;
      await run(newest.host, [newest.roomId], (s) =>
        rooms.leave(s, newest.roomId),
      );
      data = await list(reader);
      expect(data.map((r) => r.roomId)).toEqual(
        entries
          .slice(0, 50)
          .reverse()
          .map((r) => r.roomId),
      );
      const oldest = entries[0]!;
      await run(oldest.host, [oldest.roomId], async (s) => {
        let v = await rooms.snapshot(s, oldest.roomId);
        v = await rooms.changeVisibility(
          s,
          oldest.roomId,
          v.version,
          "CODE_ONLY",
        );
        await rooms.changeVisibility(s, oldest.roomId, v.version, "PUBLIC");
      });
      expect((await list(reader))[0]!.roomId).toBe(oldest.roomId);
    }, 15000);
    it("zero viewers remains explicit, while expired five-minute reservations free capacity at authoritative join", async () => {
      const reader = await actor(),
        none = await create("No viewers", 0);
      expect(
        (await list(reader)).find((r) => r.roomId === none.roomId),
      ).toMatchObject({ viewerLimit: 0, spectators: 0, canWatch: false });
      await expect(join(reader, none.roomId)).rejects.toMatchObject({
        code: "ROOM_FULL",
      });
      const f = await create("Full viewers"),
        watchers = [];
      for (let i = 0; i < 5; i++) {
        const w = await actor();
        await join(w, f.roomId);
        watchers.push(w);
      }
      expect(
        (await list(reader)).find((r) => r.roomId === f.roomId),
      ).toMatchObject({ spectators: 5, canWatch: false });
      await expect(join(reader, f.roomId)).rejects.toMatchObject({
        code: "ROOM_FULL",
      });
      await pool.query(
        "UPDATE public.room_members SET disconnected_at=clock_timestamp()-interval '301 seconds' WHERE room_id=$1 AND user_id=$2",
        [f.roomId, watchers[0]!.userId],
      );
      expect(
        (await list(reader)).find((r) => r.roomId === f.roomId),
      ).toMatchObject({ spectators: 4, canWatch: true });
      expect(await join(reader, f.roomId)).toMatchObject({ role: "spectator" });
      expect(
        (
          await pool.query(
            "SELECT count(*)::int n FROM public.room_members WHERE room_id=$1 AND role='SPECTATOR'",
            [f.roomId],
          )
        ).rows[0].n,
      ).toBe(5);
      expect(
        (
          await pool.query(
            "SELECT count(*)::int n FROM public.room_members WHERE room_id=$1 AND user_id=$2",
            [f.roomId, watchers[0]!.userId],
          )
        ).rows[0].n,
      ).toBe(0);
    });
    it("rejects stale PUBLIC entry before replay or existing member shortcuts", async () => {
      const f = await create(),
        viewer = await actor(),
        commandId = randomUUID();
      await join(viewer, f.roomId, "watch", commandId);
      await run(f.host, [f.roomId], async (s) => {
        const v = await rooms.snapshot(s, f.roomId);
        await rooms.changeVisibility(s, f.roomId, v.version, "CODE_ONLY");
      });
      await expect(
        join(viewer, f.roomId, "watch", commandId),
      ).rejects.toMatchObject({ code: "ROOM_NOT_PUBLIC" });
      const outsider = await actor();
      await expect(join(outsider, f.roomId, "play")).rejects.toMatchObject({
        code: "ROOM_NOT_PUBLIC",
      });
      expect(await list(outsider)).toEqual([]);
    });
    it("projects actual PLAYING state as watch-only without disclosing the match or player identities", async () => {
      const f = await create("Playing Public"),
        black = await actor(),
        viewer = await actor();
      await join(black, f.roomId, "play");
      const matchId = await run(f.host, [f.roomId], async (s) => {
        await s.client.query(
          "UPDATE public.room_members SET ready=true WHERE room_id=$1 AND role='PLAYER'",
          [f.roomId],
        );
        const at = new Date(),
          startToken = randomUUID();
        await s.client.query(
          "INSERT INTO xiangqi_room.countdowns(room_id,token,due_at,red_id,black_id) VALUES($1,$2,$3,$4,$5)",
          [f.roomId, startToken, at, f.host.userId, black.userId],
        );
        const result = await new MatchStore(new ClockService()).start(
          s.client,
          {
            roomId: f.roomId,
            startToken,
            redId: f.host.userId,
            blackId: black.userId,
            timeControlSeconds: 600,
            startedAt: at,
          },
        );
        await s.client.query(
          "UPDATE public.rooms SET status='PLAYING',current_match_id=$2 WHERE id=$1",
          [f.roomId, result.matchId],
        );
        await s.client.query(
          "UPDATE public.active_players SET match_id=$2 WHERE room_id=$1",
          [f.roomId, result.matchId],
        );
        return result.matchId;
      });
      expect(await join(viewer, f.roomId, "play")).toMatchObject({
        role: "spectator",
      });
      const data = await list(viewer);
      expect(data[0]).toMatchObject({
        status: "playing",
        emptySeats: 0,
        canPlay: false,
        canWatch: true,
        spectators: 1,
      });
      expect(JSON.stringify(data)).not.toContain(matchId);
      expect(JSON.stringify(data)).not.toContain(black.userId);
    });
    it("omits unmanaged legacy PUBLIC rooms and rejects malformed join or missing room locks", async () => {
      const a = await actor();
      await pool.query(
        "INSERT INTO public.rooms(id,owner_id,name,visibility,time_control) VALUES($1,$2,'Unmanaged Legacy','PUBLIC',0)",
        [randomUUID(), a.userId],
      );
      expect(await list(a)).toEqual([]);
      const f = await create();
      await expect(
        run(a, [], (s) =>
          publicRooms.join(s, f.roomId, {
            commandId: randomUUID(),
            preference: "watch",
          }),
        ),
      ).rejects.toMatchObject({ code: "ROOM_LOCK_REQUIRED" });
      await expect(
        run(a, [f.roomId], (s) =>
          publicRooms.join(s, f.roomId, {
            commandId: "forged",
            preference: "watch",
          }),
        ),
      ).rejects.toMatchObject({ code: "ROOM_INPUT_INVALID" });
    });
    it("two concurrent play clicks take one vacant seat and fallback to a viewer with canonical notice", async () => {
      const f = await create(),
        a = await actor(),
        b = await actor();
      const entries = await Promise.all([
        join(a, f.roomId, "play"),
        join(b, f.roomId, "play"),
      ]);
      expect(entries.map((e) => e.role).sort()).toEqual(["black", "spectator"]);
      expect(entries.find((e) => e.role === "spectator")!.notice).toBe(
        "Ghế vừa có người, bạn đang xem trận",
      );
      expect(
        (
          await pool.query(
            "SELECT count(*)::int n FROM public.active_players WHERE room_id=$1",
            [f.roomId],
          )
        ).rows[0].n,
      ).toBe(2);
    });
    it("two concurrent watch clicks cannot overfill a single viewer slot or take a seat", async () => {
      const f = await create("One viewer", 1),
        a = await actor(),
        b = await actor();
      const results = await Promise.allSettled([
        join(a, f.roomId),
        join(b, f.roomId),
      ]);
      expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
      expect(results.find((r) => r.status === "rejected")).toMatchObject({
        reason: { code: "ROOM_FULL" },
      });
      expect(
        (
          await pool.query(
            "SELECT role,side FROM public.room_members WHERE room_id=$1 AND role='SPECTATOR'",
            [f.roomId],
          )
        ).rows,
      ).toEqual([{ role: "SPECTATOR", side: null }]);
      expect((await list(f.host))[0]).toMatchObject({
        emptySeats: 1,
        canPlay: true,
        spectators: 1,
        canWatch: false,
      });
    });
  },
);
