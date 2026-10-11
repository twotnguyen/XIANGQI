import { randomUUID } from "node:crypto";
import { initialPosition } from "@xiangqi/xiangqi-core";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { SessionService } from "../login/session.service.js";
import { PostgresLoginStore } from "../login/postgres-login-store.js";
import { PostgresMemberRoomAuthorizer } from "./member-room-auth.js";
import { PostgresRoomWorkerPort } from "./postgres-room-worker-port.js";
import { RoomStore } from "./room-store.js";
import { RoomTransactions } from "./room-transactions.js";
import { RoomWorker } from "./room-worker.js";
import {
  actor,
  databaseUrl,
  pool,
  reset,
} from "./room-transactions.test-helper.js";
const rooms = new RoomStore();
const coordinator = new RoomTransactions(pool);
const provider = { signInPassword: vi.fn(), getUser: vi.fn() };
const authorizer = new PostgresMemberRoomAuthorizer(
  new SessionService(new PostgresLoginStore(pool), provider),
);
function port() {
  return new PostgresRoomWorkerPort(
    pool,
    rooms,
    coordinator,
    authorizer,
    () => [],
  );
}
let codeSequence = 0;
async function fixture(memberOwner = false, id = randomUUID()) {
  let hostId = (await actor()).userId;
  if (memberOwner) {
    const userId = randomUUID();
    await pool.query(
      "INSERT INTO auth.users(id,email,email_confirmed_at) VALUES($1,$2,clock_timestamp())",
      [userId, `worker-${userId}@example.invalid`],
    );
    await pool.query(
      "INSERT INTO public.profiles(user_id,username,display_name,completed_at,registration_pending) VALUES($1,$2,'Synthetic Worker',clock_timestamp(),false)",
      [userId, `m${userId.replaceAll("-", "").slice(0, 18)}`],
    );
    hostId = userId;
  }
  const opponent = await actor(),
    viewer = await actor();
  await pool.query(
    "INSERT INTO public.rooms(id,owner_id,name,visibility,time_control,viewer_limit,invite_code) VALUES($1,$2,'Synthetic Worker','CODE_ONLY',600,5,$3)",
    [
      id,
      hostId,
      String(++codeSequence)
        .padStart(8, "0")
        .replace(/[0-9]/g, (digit) => "ABCDEFGHJK"[Number(digit)]!),
    ],
  );
  const client = await pool.connect();
  await client.query("BEGIN");
  try {
    for (const [userId, role, side] of [
      [hostId, "PLAYER", "RED"],
      [opponent.userId, "PLAYER", "BLACK"],
      [viewer.userId, "SPECTATOR", null],
    ]) {
      await client.query(
        "INSERT INTO public.room_members(room_id,user_id,role,side) VALUES($1,$2,$3,$4)",
        [id, userId, role, side],
      );
    }
    await client.query(
      "INSERT INTO public.active_players(user_id,room_id) VALUES($1,$3),($2,$3)",
      [hostId, opponent.userId, id],
    );
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
  return { id, host: hostId, opponent: opponent.userId, viewer: viewer.userId };
}
async function age(id: string, userId: string, seconds: number) {
  await pool.query(
    "UPDATE public.room_members SET disconnected_at=clock_timestamp()-make_interval(secs=>$3) WHERE room_id=$1 AND user_id=$2",
    [id, userId, seconds],
  );
}
async function playing(f: Awaited<ReturnType<typeof fixture>>) {
  const matchId = randomUUID(),
    position = initialPosition();
  await pool.query(
    "INSERT INTO public.matches(id,room_id,mode,red_user_id,black_user_id,position) VALUES($1,$2,'ONLINE',$3,$4,$5)",
    [
      matchId,
      f.id,
      f.host,
      f.opponent,
      JSON.stringify({ board: position.board, turn: "RED" }),
    ],
  );
  await pool.query(
    "UPDATE public.rooms SET status='PLAYING',current_match_id=$2 WHERE id=$1",
    [f.id, matchId],
  );
  return matchId;
}
afterAll(() => pool.end());
describe.skipIf(!databaseUrl)(
  "runtime viewer due-room bridge on synthetic PostgreSQL",
  () => {
    beforeEach(async () => {
      codeSequence = 0;
      await reset();
    });
    it("selects PLAYING viewers after 300 seconds while preserving PLAYER and countdown rules", async () => {
      const viewerDue = await fixture(),
        viewerEarly = await fixture(),
        playerPlaying = await fixture(),
        playerWaiting = await fixture(),
        countdown = await fixture();
      await playing(viewerDue);
      await playing(viewerEarly);
      await playing(playerPlaying);
      await age(viewerDue.id, viewerDue.viewer, 300);
      await age(viewerEarly.id, viewerEarly.viewer, 299);
      await age(playerPlaying.id, playerPlaying.host, 301);
      await age(playerWaiting.id, playerWaiting.host, 60);
      await pool.query(
        "INSERT INTO xiangqi_room.countdowns(room_id,token,due_at,red_id,black_id) VALUES($1,$2,clock_timestamp()-interval '1 second',$3,$4)",
        [countdown.id, randomUUID(), countdown.host, countdown.opponent],
      );
      expect(await port().dueRooms()).toEqual(
        [viewerDue.id, playerWaiting.id, countdown.id].sort(),
      );
    });
    it("keeps FINISHED viewers eligible and excludes CLOSED and unmanaged legacy rooms", async () => {
      const finished = await fixture(),
        closed = await fixture(),
        legacy = await fixture();
      const matchId = await playing(finished);
      await pool.query(
        "UPDATE public.rooms SET status='FINISHED',finished_at=clock_timestamp() WHERE id=$1",
        [finished.id],
      );
      await pool.query(
        "UPDATE public.rooms SET status='CLOSED',closed_at=clock_timestamp() WHERE id=$1",
        [closed.id],
      );
      // A legacy room has no managed invite marker; create it without changing a managed room's immutable marker.
      const legacyId = randomUUID();
      await pool.query(
        "INSERT INTO public.rooms(id,owner_id,name) VALUES($1,$2,'Legacy Worker')",
        [legacyId, legacy.host],
      );
      await pool.query(
        "INSERT INTO public.room_members(room_id,user_id,role) VALUES($1,$2,'SPECTATOR')",
        [legacyId, legacy.viewer],
      );
      await age(finished.id, finished.viewer, 300);
      await age(closed.id, closed.viewer, 300);
      await age(legacyId, legacy.viewer, 300);
      expect(await port().dueRooms()).toEqual([finished.id]);
      expect(
        (
          await pool.query(
            "SELECT current_match_id FROM public.rooms WHERE id=$1",
            [finished.id],
          )
        ).rows[0].current_match_id,
      ).toBe(matchId);
    });
    it("pages at most 50 rows and wraps without starving a PLAYING viewer beyond the first page", async () => {
      const ids: string[] = [];
      for (let n = 1; n <= 51; n++) {
        const f = await fixture(
          false,
          `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`,
        );
        ids.push(f.id);
        if (n === 51) {
          await playing(f);
          await age(f.id, f.viewer, 300);
        } else await age(f.id, f.host, 60);
      }
      const p = port();
      expect(await p.dueRooms()).toEqual(ids.slice(0, 50));
      expect(await p.dueRooms()).toEqual(ids.slice(50));
      expect(await p.dueRooms()).toEqual(ids.slice(0, 50));
    });
    it("actual worker tick removes only the expired viewer during PLAYING and preserves the match", async () => {
      const f = await fixture(true),
        matchId = await playing(f);
      await age(f.id, f.viewer, 300);
      await age(f.id, f.host, 61);
      const before = (
        await pool.query("SELECT * FROM public.matches WHERE id=$1", [matchId])
      ).rows[0];
      const deliver = vi.fn(async () => {});
      await new RoomWorker(rooms, port(), { deliver }).tick();
      expect(
        (
          await pool.query(
            "SELECT user_id FROM public.room_members WHERE room_id=$1 ORDER BY user_id",
            [f.id],
          )
        ).rows.map((r) => r.user_id),
      ).toEqual([f.host, f.opponent].sort());
      expect(
        (
          await pool.query("SELECT * FROM public.matches WHERE id=$1", [
            matchId,
          ])
        ).rows[0],
      ).toEqual(before);
      expect(
        (
          await pool.query(
            "SELECT status,current_match_id FROM public.rooms WHERE id=$1",
            [f.id],
          )
        ).rows[0],
      ).toEqual({ status: "PLAYING", current_match_id: matchId });
      expect(deliver).toHaveBeenCalled();
      expect(provider.getUser).not.toHaveBeenCalled();
    });
  },
);
