import { randomUUID } from "node:crypto";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { RealtimeConnection } from "./contracts.js";
import {
  MemberRealtimeIdentities,
  MemberRealtimeTransactions,
} from "./member-transactions.js";
import { MemberRealtimePresence } from "./member-presence.js";
import { RealtimeStore } from "./store.js";
import { GameRooms } from "./game-rooms.js";
import { ClockService } from "../clock/clock-service.js";
import { MatchStore } from "../match/match-store.js";
import { RoomStore } from "../room/room-store.js";
import { RoomHttpService } from "../room/room-http.service.js";
import { RoomTransactions } from "../room/room-transactions.js";
import { PostgresMemberRoomAuthorizer } from "../room/member-room-auth.js";
import { SessionService } from "../login/session.service.js";
import { PostgresLoginStore } from "../login/postgres-login-store.js";
import { ChatStore } from "../chat/chat-store.js";
import { ChatRealtimeService } from "../chat/chat-realtime.js";
import { pool, reset, apply, databaseUrl } from "../room/room.test-helper.js";
async function fixture() {
  const users = new Map<
    string,
    { id: string; email: string; email_confirmed_at: string }
  >();
  // Synthetic GoTrue and physical peer inventory only; all authority, room/game adapters and presence storage are real.
  const provider = {
    signInPassword: vi.fn(),
    getUser: vi.fn(async (token: string) => {
      const u = users.get(token);
      if (!u) throw Error("invalid synthetic bearer");
      return u;
    }),
  };
  const sessions = new SessionService(new PostgresLoginStore(pool), provider),
    authorizer = new PostgresMemberRoomAuthorizer(sessions),
    coordinator = new RoomTransactions(pool),
    rooms = new RoomStore(),
    http = new RoomHttpService(rooms, coordinator, authorizer),
    transactions = new MemberRealtimeTransactions(coordinator, authorizer),
    identities = new MemberRealtimeIdentities(authorizer),
    clock = new ClockService(),
    game = new GameRooms(
      rooms,
      new MatchStore(clock),
      clock,
      transactions.getScope.bind(transactions),
    ),
    peers: RealtimeConnection[] = [];
  const presence = new MemberRealtimePresence(
      pool,
      coordinator,
      rooms,
      transactions,
      randomUUID(),
      () => peers,
    ),
    store = new RealtimeStore(pool, game, transactions, presence),
    chat = new ChatRealtimeService(new ChatStore((s) => s), transactions);
  const members = [];
  for (let i = 0; i < 2; i++) {
    const id = randomUUID(),
      email = `synthetic-${id}@example.invalid`,
      at = new Date(),
      token = "synthetic-" + id;
    await pool.query(
      "INSERT INTO auth.users(id,email,email_confirmed_at) VALUES($1,$2,$3)",
      [id, email, at],
    );
    await pool.query(
      "INSERT INTO public.profiles(user_id,username,display_name,completed_at,registration_pending) VALUES($1,$2,'Synthetic Viewer Tabs',$3,false)",
      [id, "m" + id.replaceAll("-", "").slice(0, 18), at],
    );
    users.set(token, { id, email, email_confirmed_at: at.toISOString() });
    members.push({
      id,
      proof: {
        accessToken: token,
        appSession: (await sessions.issue(id, false)).appSession,
      },
    });
  }
  const owner = members[0]!,
    viewer = members[1]!,
    entry = await http.create(owner.proof, {
      commandId: randomUUID(),
      name: "Actual Viewer Tab Chat",
    });
  await http.join(viewer.proof, {
    commandId: randomUUID(),
    code: entry.inviteCode,
    preference: "watch",
  });
  const connection = async (tabId = randomUUID()) => {
    const proof = { ...viewer.proof },
      identity = await identities.resolve(
        proof.accessToken,
        proof.appSession,
        proof,
      );
    return {
      identity,
      proof,
      roomId: entry.roomId,
      tabId,
      connectionId: randomUUID(),
    } satisfies RealtimeConnection;
  };
  const admit = async (peer: RealtimeConnection, takeover = false) => {
    const snapshot = await store.connect(peer, takeover);
    peers.push(peer);
    return snapshot;
  };
  const disconnect = async (peer: RealtimeConnection) => {
    const index = peers.indexOf(peer);
    if (index >= 0) peers.splice(index, 1);
    await store.disconnect(peer);
  };
  const send = (peer: RealtimeConnection, commandId = randomUUID()) =>
    chat.send(peer, {
      commandId,
      channel: "ROOM_PUBLIC",
      content: "actual viewer chat",
    });
  return {
    viewer,
    entry,
    connection,
    admit,
    disconnect,
    store,
    chat,
    send,
    game,
    transactions,
    presence,
  };
}
afterAll(() => pool.end());
describe.skipIf(!databaseUrl)(
  "durable spectator tab chat ownership with actual member SQL",
  () => {
    beforeEach(async () => {
      await pool.query("DROP SCHEMA IF EXISTS xiangqi_chat CASCADE");
      await reset();
      for (const n of [
        "06_rooms",
        "07_match_outcomes",
        "08_room_modes",
        "09_match_draw",
        "10_room_chat",
      ])
        await apply(`supabase/migrations/202610110000${n}.sql`);
    });
    it("new viewer tab supersedes old chat including replay; old reconnect/restart cannot steal but explicit takeover never grants game authority", async () => {
      const f = await fixture(),
        a = await f.connection(),
        commandId = randomUUID();
      expect((await f.admit(a)).control).toMatchObject({
        mode: "readonly",
        reason: "not_allowed",
        generation: 1,
      });
      await f.send(a, commandId);
      const b = await f.connection();
      expect((await f.admit(b)).control).toMatchObject({
        mode: "readonly",
        reason: "not_allowed",
      });
      expect((await f.store.snapshot(a)).control.reason).toBe("superseded");
      expect((await f.chat.read(a, { channel: "ROOM_PUBLIC" })).canSend).toBe(
        false,
      );
      await expect(f.send(a)).rejects.toMatchObject({ code: "TAB_READ_ONLY" });
      await expect(f.send(a, commandId)).rejects.toMatchObject({
        code: "TAB_READ_ONLY",
      });
      await f.send(b);
      const old = await f.connection(a.tabId),
        restarted = new RealtimeStore(pool, f.game, f.transactions, f.presence);
      expect((await restarted.connect(old)).control).toMatchObject({
        mode: "readonly",
        reason: "superseded",
      });
      await expect(f.send(old)).rejects.toMatchObject({
        code: "TAB_READ_ONLY",
      });
      expect(
        (
          await pool.query(
            "SELECT tab_id FROM xiangqi_realtime.controllers WHERE user_id=$1 AND room_id=$2",
            [f.viewer.id, f.entry.roomId],
          )
        ).rows[0].tab_id,
      ).toBe(b.tabId);
      expect((await f.store.connect(old, true)).control).toMatchObject({
        mode: "readonly",
        reason: "not_allowed",
      });
      expect((await f.chat.read(old, { channel: "ROOM_PUBLIC" })).canSend).toBe(
        true,
      );
      await f.send(old);
      await expect(
        f.chat.read(old, { channel: "PLAYERS_PRIVATE" }),
      ).rejects.toMatchObject({ code: "CHAT_FORBIDDEN" });
      const state = await f.store.snapshot(old);
      for (const action of [
        { type: "room.ready" as const, payload: { ready: true } },
        {
          type: "match.move" as const,
          payload: {
            matchId: randomUUID(),
            matchVersion: 0,
            from: { file: 0, rank: 6 },
            to: { file: 0, rank: 5 },
          },
        },
      ])
        expect(
          await f.store.command(old, {
            roomId: f.entry.roomId,
            commandId: randomUUID(),
            expectedVersion: state.version,
            action,
          }),
        ).toMatchObject({ status: "error", error: { code: "TAB_READ_ONLY" } });
      expect(
        (
          await pool.query(
            "SELECT ready FROM public.room_members WHERE room_id=$1 AND user_id=$2",
            [f.entry.roomId, f.viewer.id],
          )
        ).rows[0].ready,
      ).toBe(false);
      expect(
        (
          await pool.query(
            "SELECT count(*)::int n FROM xiangqi_realtime.receipts",
          )
        ).rows[0].n,
      ).toBe(0);
    });
    it("physical viewer rebind preserves surviving older tab without implicitly changing chat owner", async () => {
      const f = await fixture(),
        a = await f.connection(),
        b = await f.connection();
      await f.admit(a);
      await f.admit(b);
      await f.disconnect(b);
      const row = (
        await pool.query(
          "SELECT connection_id,connected,generation::float8 AS generation FROM xiangqi_room.presence WHERE room_id=$1 AND user_id=$2",
          [f.entry.roomId, f.viewer.id],
        )
      ).rows[0];
      expect(row).toMatchObject({
        connection_id: a.connectionId,
        connected: true,
      });
      expect(row.generation).toBeGreaterThan(2);
      expect(
        (
          await pool.query(
            "SELECT disconnected_at FROM public.room_members WHERE room_id=$1 AND user_id=$2",
            [f.entry.roomId, f.viewer.id],
          )
        ).rows[0].disconnected_at,
      ).toBeNull();
      expect((await f.chat.read(a, { channel: "ROOM_PUBLIC" })).canSend).toBe(
        false,
      );
      await f.store.connect(a, true);
      await f.send(a);
      await f.disconnect(a);
      expect(
        (
          await pool.query(
            "SELECT connected FROM xiangqi_room.presence WHERE room_id=$1 AND user_id=$2",
            [f.entry.roomId, f.viewer.id],
          )
        ).rows[0].connected,
      ).toBe(false);
      expect(
        (
          await pool.query(
            "SELECT disconnected_at FROM public.room_members WHERE room_id=$1 AND user_id=$2",
            [f.entry.roomId, f.viewer.id],
          )
        ).rows[0].disconnected_at,
      ).toEqual(expect.any(Date));
    });
  },
);
