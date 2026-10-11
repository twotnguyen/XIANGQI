import { createHash, randomUUID } from "node:crypto";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { maskForbiddenChat } from "../../../../packages/shared/src/chat-filter.js";
import { SessionService } from "../login/session.service.js";
import { PostgresLoginStore } from "../login/postgres-login-store.js";
import { PostgresMemberRoomAuthorizer } from "../room/member-room-auth.js";
import { RoomTransactions } from "../room/room-transactions.js";
import { RoomHttpService } from "../room/room-http.service.js";
import { RoomStore } from "../room/room-store.js";
import {
  MemberRealtimeIdentities,
  MemberRealtimeTransactions,
} from "../realtime/member-transactions.js";
import {
  RealtimeError,
  type RealtimeConnection,
} from "../realtime/contracts.js";
import { RoomError } from "../room/contracts.js";
import { apply, databaseUrl, pool, reset } from "../room/room.test-helper.js";
import { ChatStore } from "./chat-store.js";
import { ChatRealtimeService } from "./chat-realtime.js";
const hash = (s: string) => createHash("sha256").update(s).digest("hex");
async function fixture() {
  const users = new Map<
    string,
    { id: string; email: string; email_confirmed_at: string }
  >();
  // Only GoTrue is synthetic: sessions, authorizers, transactions, rooms and chat use actual SQL.
  const provider = {
    signInPassword: vi.fn(),
    getUser: vi.fn(async (token: string) => {
      const u = users.get(token);
      if (!u) throw new Error("private synthetic token");
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
    store = new ChatStore(maskForbiddenChat),
    service = new ChatRealtimeService(store, transactions);
  const members = [];
  for (let i = 0; i < 3; i++) {
    const id = randomUUID(),
      at = new Date(),
      token = "synthetic-" + id,
      email = "synthetic-" + id + "@example.invalid";
    await pool.query(
      "INSERT INTO auth.users(id,email,email_confirmed_at) VALUES($1,$2,$3)",
      [id, email, at],
    );
    await pool.query(
      "INSERT INTO public.profiles(user_id,username,display_name,completed_at,registration_pending) VALUES($1,$2,'Synthetic Chat Member',$3,false)",
      [id, "m" + id.replaceAll("-", "").slice(0, 18), at],
    );
    users.set(token, { id, email, email_confirmed_at: at.toISOString() });
    const proof = {
      accessToken: token,
      appSession: (await sessions.issue(id, false)).appSession,
    };
    members.push({ id, proof });
  }
  const a = members[0]!,
    b = members[1]!,
    c = members[2]!;
  const entry = await http.create(a.proof, {
    commandId: randomUUID(),
    name: "Synthetic Realtime Chat",
  });
  const connect = async (m: typeof a) => {
    // Each realtime resolution owns the original proof for the following guarded transaction.
    const proof = { ...m.proof },
      identity = await identities.resolve(
        proof.accessToken,
        proof.appSession,
        proof,
      );
    return {
      identity,
      proof,
      roomId: entry.roomId,
      tabId: randomUUID(),
      connectionId: randomUUID(),
    } satisfies RealtimeConnection;
  };
  const connection = await connect(a);
  const control = async (peer: RealtimeConnection) => {
    await pool.query(
      "INSERT INTO xiangqi_realtime.tabs(user_id,room_id,tab_id) VALUES($1,$2,$3) ON CONFLICT DO NOTHING",
      [peer.identity.userId, peer.roomId, peer.tabId],
    );
    await pool.query(
      "INSERT INTO xiangqi_realtime.controllers(user_id,room_id,tab_id,connection_id,generation) VALUES($1,$2,$3,$4,1) ON CONFLICT(user_id,room_id) DO UPDATE SET tab_id=excluded.tab_id,connection_id=excluded.connection_id,generation=xiangqi_realtime.controllers.generation+1",
      [peer.identity.userId, peer.roomId, peer.tabId, peer.connectionId],
    );
  };
  await control(connection);
  const join = (m: typeof a, preference: "play" | "watch") =>
    http.join(m.proof, {
      commandId: randomUUID(),
      code: entry.inviteCode,
      preference,
    });
  const send = (
    peer = connection,
    content = "hello",
    commandId = randomUUID(),
  ) => service.send(peer, { channel: "ROOM_PUBLIC", content, commandId });
  return {
    a,
    b,
    c,
    entry,
    connection,
    connect,
    control,
    join,
    service,
    store,
    transactions,
    send,
    http,
    provider,
  };
}
afterAll(() => pool.end());
describe.skipIf(!databaseUrl)(
  "member guarded realtime chat on actual SQL",
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
    it("commits canonical masked messages and metadata ACK; uppercase command UUID deduplicates", async () => {
      const f = await fixture(),
        command = randomUUID();
      const one = await f.send(
          f.connection,
          "địt <script>",
          command.toUpperCase(),
        ),
        two = await f.send(f.connection, "địt <script>", command);
      expect(two).toEqual(one);
      const page = await f.service.read(f.connection, {
        channel: "ROOM_PUBLIC",
      });
      expect(page.messages).toHaveLength(1);
      expect(page.messages[0]!.content).toBe(maskForbiddenChat("địt <script>"));
      expect(page.canSend).toBe(true);
      expect(page.scopeToken).toMatch(/^[a-f0-9]{64}$/);
      expect(page).toMatchObject({
        roomId: f.entry.roomId,
        channel: "ROOM_PUBLIC",
        roomVersion: 1,
      });
      expect(JSON.stringify(one)).not.toContain("content");
      expect(JSON.stringify(page)).not.toContain(f.a.id);
      expect(JSON.stringify(page)).not.toContain(f.a.proof.appSession);
      expect(
        (await pool.query("SELECT count(*)::int n FROM xiangqi_chat.receipts"))
          .rows[0].n,
      ).toBe(1);
    });
    it("readonly PLAYER can read but cannot send or replay until exact controller takes control", async () => {
      const f = await fixture();
      const command = randomUUID();
      await f.send(f.connection, "hello", command);
      const old = await f.connect(f.a);
      await f.control(old);
      expect(
        (await f.service.read(f.connection, { channel: "ROOM_PUBLIC" }))
          .canSend,
      ).toBe(false);
      await expect(f.send()).rejects.toMatchObject({ code: "TAB_READ_ONLY" });
      await expect(
        f.send(f.connection, "hello", command),
      ).rejects.toMatchObject({ code: "TAB_READ_ONLY" });
      await expect(
        f.send({ ...old, connectionId: "forged" }),
      ).rejects.toMatchObject({ code: "TAB_READ_ONLY" });
      expect(
        (await f.service.read(old, { channel: "PLAYERS_PRIVATE" })).canSend,
      ).toBe(true);
      await f.send(old);
    });
    it("spectator can send public without controller promotion, cannot access private and outsider cannot send", async () => {
      const f = await fixture();
      await f.join(f.b, "watch");
      const viewer = await f.connect(f.b),
        outsider = await f.connect(f.c);
      expect(
        (await f.service.read(viewer, { channel: "ROOM_PUBLIC" })).canSend,
      ).toBe(true);
      await f.send(viewer);
      await expect(
        f.service.read(viewer, { channel: "PLAYERS_PRIVATE" }),
      ).rejects.toMatchObject({ code: "CHAT_FORBIDDEN" });
      await expect(
        f.service.send(viewer, {
          commandId: randomUUID(),
          channel: "PLAYERS_PRIVATE",
          content: "secret",
        }),
      ).rejects.toMatchObject({ code: "CHAT_FORBIDDEN" });
      await expect(f.send(outsider)).rejects.toMatchObject({
        code: "CHAT_FORBIDDEN",
      });
      expect(
        (
          await pool.query(
            "SELECT count(*)::int n FROM xiangqi_realtime.controllers WHERE user_id=$1",
            [f.b.id],
          )
        ).rows[0].n,
      ).toBe(0);
    });
    it.each(["revoke", "expire"])(
      "rejects %s fixed session before read/send without mutations",
      async (mode) => {
        const f = await fixture();
        if (mode === "revoke")
          await pool.query(
            "UPDATE xiangqi_auth.app_sessions SET revoked_at=clock_timestamp() WHERE token_hash=$1",
            [hash(f.connection.proof!.appSession)],
          );
        else
          await pool.query(
            "UPDATE xiangqi_auth.app_sessions SET created_at=clock_timestamp()-interval '13 hours',expires_at=clock_timestamp()-interval '1 hour' WHERE token_hash=$1",
            [hash(f.connection.proof!.appSession)],
          );
        await expect(f.send()).rejects.toMatchObject({ code: "AUTH_REQUIRED" });
        await expect(
          f.service.read(f.connection, { channel: "ROOM_PUBLIC" }),
        ).rejects.toMatchObject({ code: "AUTH_REQUIRED" });
        expect(
          (
            await pool.query(
              "SELECT count(*)::int n FROM xiangqi_chat.messages",
            )
          ).rows[0].n,
        ).toBe(0);
      },
    );
    it("rejects forged extra identity/room keys, malformed channels and unsafe cursor without SQL work", async () => {
      const f = await fixture();
      for (const extra of [
        { roomId: randomUUID() },
        { userId: f.b.id },
        { kind: "guest" },
      ])
        await expect(
          f.service.send(f.connection, {
            commandId: randomUUID(),
            channel: "ROOM_PUBLIC",
            content: "hello",
            ...extra,
          }),
        ).rejects.toMatchObject({ code: "CHAT_INPUT_INVALID" });
      for (const input of [
        { channel: "ROOM_PUBLIC", after: -1 },
        { channel: "ROOM_PUBLIC", after: 1.1 },
        { channel: ["ROOM_PUBLIC"] },
        { channel: "ROOM_PUBLIC", roomId: f.entry.roomId },
      ])
        await expect(
          f.service.read(f.connection, input as never),
        ).rejects.toMatchObject({ code: "CHAT_INPUT_INVALID" });
      expect(
        (await pool.query("SELECT count(*)::int n FROM xiangqi_chat.messages"))
          .rows[0].n,
      ).toBe(0);
    });
    it("private pair replacement changes scope token while current common membership token is stable", async () => {
      const f = await fixture(),
        before = await f.service.read(f.connection, {
          channel: "PLAYERS_PRIVATE",
        }),
        common = await f.service.read(f.connection, { channel: "ROOM_PUBLIC" });
      await f.join(f.b, "play");
      const after = await f.service.read(f.connection, {
        channel: "PLAYERS_PRIVATE",
      });
      expect(after.scopeToken).not.toBe(before.scopeToken);
      expect(
        (await f.service.read(f.connection, { channel: "ROOM_PUBLIC" }))
          .scopeToken,
      ).toBe(common.scopeToken);
    });
    it("resets a spectator common scope token after leave/rejoin while keeping reconnect stable", async () => {
      const f = await fixture();
      await f.send();
      await f.join(f.b, "watch");
      const viewer = await f.connect(f.b);
      const before = await f.service.read(viewer, { channel: "ROOM_PUBLIC" });
      const reconnect = await f.connect(f.b);
      expect(
        (await f.service.read(reconnect, { channel: "ROOM_PUBLIC" }))
          .scopeToken,
      ).toBe(before.scopeToken);
      await f.send(f.connection, "after viewer joined");
      const version = (
        await pool.query(
          "SELECT room_version::float8 AS version FROM public.rooms WHERE id=$1",
          [f.entry.roomId],
        )
      ).rows[0].version;
      await f.http.leave(f.b.proof, f.entry.roomId, version);
      await f.join(f.b, "watch");
      const fresh = await f.service.read(viewer, { channel: "ROOM_PUBLIC" });
      expect(fresh.scopeToken).not.toBe(before.scopeToken);
      expect(fresh.messages).toEqual([]);
    });
    it("rejects a deferred COMMIT failure with no canonical message/receipt/outbox/rate ACK", async () => {
      const f = await fixture();
      const owner = await pool.connect();
      try {
        await owner.query("SET ROLE postgres");
        await owner.query(`CREATE FUNCTION public.synthetic_chat_commit_failure() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'private SQL commit fault'; END $$;
          CREATE CONSTRAINT TRIGGER synthetic_chat_commit_failure AFTER INSERT ON xiangqi_chat.messages DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION public.synthetic_chat_commit_failure()`);
      } finally {
        await owner.query("RESET ROLE");
        owner.release();
      }
      await expect(f.send()).rejects.toMatchObject({
        code: "REALTIME_UNAVAILABLE",
        message: "Chat chưa sẵn sàng",
      });
      for (const table of ["messages", "receipts", "outbox", "rate"])
        expect(
          (
            await pool.query(
              `SELECT count(*)::int n FROM xiangqi_chat.${table}`,
            )
          ).rows[0].n,
        ).toBe(0);
    });
    it("never ACKs rolled-back store work and sanitizes unknown errors while preserving typed errors", async () => {
      const f = await fixture();
      const original = f.store.send.bind(f.store);
      const injected = new ChatRealtimeService(
        {
          send: async (...args: Parameters<ChatStore["send"]>) => {
            await original(...args);
            throw new Error("private bearer token providerSQL");
          },
        } as ChatStore,
        f.transactions,
      );
      await expect(
        injected.send(f.connection, {
          commandId: randomUUID(),
          channel: "ROOM_PUBLIC",
          content: "rollback",
        }),
      ).rejects.toMatchObject({
        code: "REALTIME_UNAVAILABLE",
        message: "Chat chưa sẵn sàng",
      });
      for (const table of ["messages", "receipts", "outbox", "rate"])
        expect(
          (
            await pool.query(
              `SELECT count(*)::int n FROM xiangqi_chat.${table}`,
            )
          ).rows[0].n,
        ).toBe(0);
      for (const error of [
        new RoomError("CHAT_FORBIDDEN", "safe", 403),
        new RealtimeError("AUTH_REQUIRED", "safe"),
      ]) {
        const failing = new ChatRealtimeService(f.store, {
          getScope: f.transactions.getScope.bind(f.transactions),
          run: async () => {
            throw error;
          },
        });
        await expect(
          failing.read(f.connection, { channel: "ROOM_PUBLIC" }),
        ).rejects.toBe(error);
      }
    });
  },
);
