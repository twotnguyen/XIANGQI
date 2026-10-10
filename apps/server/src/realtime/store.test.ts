import { readFile } from "node:fs/promises";
import { randomUUID, randomBytes } from "node:crypto";
import { beforeAll, afterAll, describe, expect, it } from "vitest";
import { RealtimeStore } from "./store.js";
import { createApp } from "../app.js";
import {
  addRoom,
  prepareFixture,
  readyCommand,
  realtimeTestUrl,
} from "./test-helper.js";
import { createServer } from "node:http";
import { performance } from "node:perf_hooks";
import { io, type Socket as ClientSocket } from "socket.io-client";
import { attachRealtime } from "./gateway.js";
import { RealtimeError, type RealtimeIdentity } from "./contracts.js";
import type { CommandAcknowledgement, RoomSnapshot } from "@xiangqi/shared";

describe.skipIf(!realtimeTestUrl)(
  "durable realtime store on isolated PostgreSQL",
  () => {
    let fixture: Awaited<ReturnType<typeof prepareFixture>>;
    let store: RealtimeStore;
    beforeAll(async () => {
      fixture = await prepareFixture();
      store = new RealtimeStore(fixture.runtime, fixture.rooms);
    });
    afterAll(async () => {
      if (fixture) await fixture.close();
    });
    it("rolls back migration before writes without affecting room state", async () => {
      const room = await addRoom(fixture.admin);
      await fixture.admin.query(
        await readFile("supabase/rollback/20261011000002_realtime.sql", "utf8"),
      );
      expect(
        (
          await fixture.admin.query(
            "SELECT version FROM public.rooms WHERE id=$1",
            [room.roomId],
          )
        ).rows[0].version,
      ).toBe(0);
      await fixture.admin.query(
        await readFile(
          "supabase/migrations/20261011000002_realtime.sql",
          "utf8",
        ),
      );
    });
    it("uses a nonsuperuser connection and protects private tables with RLS", async () => {
      const client = await fixture.runtime.connect();
      try {
        expect(
          (
            await client.query(
              "SELECT rolsuper,rolbypassrls FROM pg_roles WHERE rolname=current_user",
            )
          ).rows[0],
        ).toEqual({ rolsuper: false, rolbypassrls: false });
        await expect(
          client.query("SELECT * FROM xiangqi_realtime.receipts"),
        ).rejects.toMatchObject({ code: "42501" });
      } finally {
        client.release();
      }
    });
    it("commits one state mutation and one identical receipt for concurrent duplicates", async () => {
      const room = await addRoom(fixture.admin);
      const connection = room.connection();
      await store.connect(connection);
      const command = readyCommand(room.roomId);
      const results = await Promise.all(
        Array.from({ length: 8 }, () => store.command(connection, command)),
      );
      for (const result of results) expect(result).toEqual(results[0]);
      expect(results[0]).toMatchObject({
        status: "ok",
        commandId: command.commandId,
        snapshot: { version: 1, room: { ready: { red: true } } },
      });
      expect(
        (
          await fixture.admin.query(
            "SELECT version FROM public.rooms WHERE id=$1",
            [room.roomId],
          )
        ).rows[0].version,
      ).toBe(1);
      expect(
        (
          await fixture.admin.query(
            "SELECT count(*)::integer AS count FROM xiangqi_realtime.receipts WHERE room_id=$1",
            [room.roomId],
          )
        ).rows[0].count,
      ).toBe(1);
    });
    it("rejects reused IDs with different payload and stale versions without mutating", async () => {
      const room = await addRoom(fixture.admin);
      const connection = room.connection();
      await store.connect(connection);
      const command = readyCommand(room.roomId);
      await store.command(connection, command);
      expect(
        await store.command(connection, {
          ...command,
          action: { type: "room.ready", payload: { ready: false } },
        }),
      ).toMatchObject({
        status: "error",
        error: { code: "COMMAND_ID_REUSED" },
      });
      expect(
        await store.command(connection, readyCommand(room.roomId)),
      ).toMatchObject({
        status: "error",
        error: { code: "VERSION_STALE" },
        snapshot: { version: 1, room: { ready: { red: true } } },
      });
      expect(
        (
          await fixture.admin.query(
            "SELECT version FROM public.rooms WHERE id=$1",
            [room.roomId],
          )
        ).rows[0].version,
      ).toBe(1);
    });
    it("rolls back a state write when execution fails before receipt creation", async () => {
      const room = await addRoom(fixture.admin);
      const connection = room.connection();
      await store.connect(connection);
      fixture.rooms.failAfterMutation = true;
      try {
        expect(
          await store.command(connection, readyCommand(room.roomId)),
        ).toMatchObject({
          status: "error",
          error: { code: "REALTIME_UNAVAILABLE" },
        });
      } finally {
        fixture.rooms.failAfterMutation = false;
      }
      expect(
        (
          await fixture.admin.query(
            "SELECT version FROM public.rooms WHERE id=$1",
            [room.roomId],
          )
        ).rows[0].version,
      ).toBe(0);
      expect(
        (
          await fixture.admin.query(
            "SELECT count(*)::integer AS count FROM xiangqi_realtime.receipts WHERE room_id=$1",
            [room.roomId],
          )
        ).rows[0].count,
      ).toBe(0);
    });
    it("rolls back a successful domain mutation when the receipt insert itself fails", async () => {
      const room = await addRoom(fixture.admin);
      const connection = room.connection();
      await store.connect(connection);
      const request = readyCommand(room.roomId);
      await fixture.admin
        .query(`CREATE FUNCTION xiangqi_realtime.fixture_reject_receipt() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'fake-sensitive-fixture'; END $$;
      CREATE TRIGGER fixture_reject_receipt BEFORE INSERT ON xiangqi_realtime.receipts FOR EACH ROW WHEN(NEW.command_id='${request.commandId}'::uuid) EXECUTE FUNCTION xiangqi_realtime.fixture_reject_receipt()`);
      try {
        const ack = await store.command(connection, request);
        expect(ack).toMatchObject({
          status: "error",
          error: { code: "REALTIME_UNAVAILABLE" },
        });
        expect(JSON.stringify(ack)).not.toContain("fake-sensitive-fixture");
        expect(
          (
            await fixture.admin.query(
              "SELECT version FROM public.rooms WHERE id=$1",
              [room.roomId],
            )
          ).rows[0].version,
        ).toBe(0);
        expect(
          (
            await fixture.admin.query(
              "SELECT count(*)::integer AS count FROM xiangqi_realtime.receipts WHERE room_id=$1",
              [room.roomId],
            )
          ).rows[0].count,
        ).toBe(0);
      } finally {
        await fixture.admin.query(
          "DROP TRIGGER fixture_reject_receipt ON xiangqi_realtime.receipts; DROP FUNCTION xiangqi_realtime.fixture_reject_receipt()",
        );
      }
    });
    it("persists tab ownership across reconnect and new store instances and requires explicit takeover", async () => {
      const room = await addRoom(fixture.admin);
      const old = room.connection();
      const current = room.connection();
      expect(await store.connect(old)).toMatchObject({
        control: { mode: "writable" },
      });
      expect(await store.connect(current)).toMatchObject({
        control: { mode: "writable" },
      });
      const restart = new RealtimeStore(fixture.runtime, fixture.rooms);
      const reconnect = { ...old, connectionId: randomUUID() };
      expect(await restart.connect(reconnect)).toMatchObject({
        control: { mode: "readonly" },
      });
      expect(
        await restart.command(reconnect, readyCommand(room.roomId)),
      ).toMatchObject({ status: "error", error: { code: "TAB_READ_ONLY" } });
      expect(await restart.connect(reconnect, true)).toMatchObject({
        control: { mode: "writable" },
      });
      expect(
        await restart.command(current, readyCommand(room.roomId)),
      ).toMatchObject({ status: "error", error: { code: "TAB_READ_ONLY" } });
    });
    it("fences older connections even when they share the same stable tab ID", async () => {
      const room = await addRoom(fixture.admin);
      const first = room.connection();
      await store.connect(first);
      const second = { ...first, connectionId: randomUUID() };
      await store.connect(second);
      expect(
        await store.command(first, readyCommand(room.roomId)),
      ).toMatchObject({ status: "error", error: { code: "TAB_READ_ONLY" } });
      expect(
        await store.command(second, readyCommand(room.roomId)),
      ).toMatchObject({ status: "ok", snapshot: { version: 1 } });
    });
    it("rechecks membership before receipt replay or private snapshots", async () => {
      const room = await addRoom(fixture.admin);
      const connection = room.connection();
      await store.connect(connection);
      const command = readyCommand(room.roomId);
      await store.command(connection, command);
      await fixture.admin.query(
        "UPDATE public.rooms SET members=$2 WHERE id=$1",
        [room.roomId, [room.members[1]]],
      );
      expect(await store.command(connection, command)).toMatchObject({
        status: "error",
        error: { code: "ROOM_FORBIDDEN" },
      });
      await expect(store.snapshot(connection)).rejects.toMatchObject({
        code: "ROOM_FORBIDDEN",
      });
      const stranger = room.connection(randomUUID());
      await expect(store.connect(stranger)).rejects.toMatchObject({
        code: "ROOM_FORBIDDEN",
      });
    });
    it("cannot reuse another actor's receipt and keeps spectators read-only", async () => {
      const room = await addRoom(fixture.admin, [
        randomUUID(),
        randomUUID(),
        randomUUID(),
      ]);
      const red = room.connection();
      const black = room.connection(room.members[1]);
      const spectator = room.connection(room.members[2]);
      await store.connect(red);
      await store.connect(black);
      expect(await store.connect(spectator)).toMatchObject({
        control: { mode: "readonly" },
        role: "spectator",
      });
      const command = readyCommand(room.roomId);
      await store.command(red, command);
      expect(
        await store.command(black, { ...command, expectedVersion: 1 }),
      ).toMatchObject({
        status: "ok",
        snapshot: { version: 2, role: "black" },
      });
      expect(
        await store.command(spectator, readyCommand(room.roomId, 2)),
      ).toMatchObject({ status: "error", error: { code: "TAB_READ_ONLY" } });
    });
    it("expires receipts after 24 hours and refuses destructive rollback after writes", async () => {
      const room = await addRoom(fixture.admin);
      const connection = room.connection();
      await store.connect(connection);
      const command = readyCommand(room.roomId);
      await store.command(connection, command);
      const { rows } = await fixture.admin.query(
        "SELECT extract(epoch FROM expires_at-created_at)::integer AS seconds FROM xiangqi_realtime.receipts WHERE room_id=$1",
        [room.roomId],
      );
      expect(rows[0].seconds).toBe(86400);
      await fixture.admin.query(
        "UPDATE xiangqi_realtime.receipts SET expires_at=now()-interval '1 second' WHERE room_id=$1",
        [room.roomId],
      );
      expect(await store.cleanupExpiredReceipts()).toBe(1);
      expect(
        (
          await fixture.admin.query(
            "SELECT count(*)::integer AS count FROM xiangqi_realtime.receipts WHERE room_id=$1",
            [room.roomId],
          )
        ).rows[0].count,
      ).toBe(0);
      const client = await fixture.admin.connect();
      try {
        await expect(
          client.query(
            await readFile(
              "supabase/rollback/20261011000002_realtime.sql",
              "utf8",
            ),
          ),
        ).rejects.toThrow("Rollback requires backup review");
      } finally {
        await client.query("ROLLBACK");
        client.release();
      }
    });
  },
);

// Keep both SQL suites in one test file: their isolated baseline resets run sequentially.
describe.skipIf(!realtimeTestUrl)(
  "actual Socket.IO boundary and preliminary 50-client fixture",
  () => {
    let fixture: Awaited<ReturnType<typeof prepareFixture>>;
    let gateway: ReturnType<typeof attachRealtime>;
    let base: string;
    const httpServer = createServer();
    const identities = new Map<string, RealtimeIdentity>();
    const capabilities = new Map<string, string>();
    const clients: ClientSocket[] = [];
    beforeAll(async () => {
      fixture = await prepareFixture();
      gateway = attachRealtime(httpServer, {
        store: new RealtimeStore(fixture.runtime, fixture.rooms),
        corsOrigins: ["http://localhost:5173"],
        identities: {
          resolve: async (token, appSession) => {
            const identity = identities.get(token);
            if (
              !identity ||
              !appSession ||
              capabilities.get(token) !== appSession
            )
              throw new RealtimeError(
                "AUTH_REQUIRED",
                "Phiên đăng nhập không hợp lệ hoặc đã hết hạn",
              );
            return identity;
          },
        },
      });
      await new Promise<void>((resolve) =>
        httpServer.listen(0, "127.0.0.1", resolve),
      );
      const address = httpServer.address();
      if (!address || typeof address === "string")
        throw new Error("Address unavailable");
      base = `http://127.0.0.1:${address.port}`;
    });
    afterAll(async () => {
      for (const client of clients) client.disconnect();
      if (gateway) await gateway.close();
      if (fixture) await fixture.close();
    });
    function socket(
      roomId: string,
      userId: string,
      tabId = randomUUID(),
      kind: RealtimeIdentity["kind"] = "member",
    ) {
      const token = randomUUID();
      identities.set(token, { userId, kind });
      const appSession = randomBytes(32).toString("base64url");
      capabilities.set(token, appSession);
      const client = io(base, {
        autoConnect: false,
        reconnection: false,
        transports: ["websocket"],
        auth: { accessToken: token, appSession, roomId, tabId },
      });
      clients.push(client);
      return { client, token, tabId, appSession };
    }
    function event<T>(client: ClientSocket, name: string): Promise<T> {
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          client.off(name, receive);
          reject(new Error(`Timeout waiting for ${name}`));
        }, 3000);
        const receive = (payload: T) => {
          clearTimeout(timer);
          resolve(payload);
        };
        client.once(name, receive);
      });
    }
    async function connect(client: ClientSocket) {
      const snapshot = event<RoomSnapshot>(client, "room.snapshot");
      client.connect();
      return snapshot;
    }
    function command(
      client: ClientSocket,
      value: unknown,
    ): Promise<CommandAcknowledgement> {
      return new Promise((resolve, reject) =>
        client
          .timeout(3000)
          .emit(
            "room.command",
            value,
            (error: Error | null, response: CommandAcknowledgement) =>
              error ? reject(error) : resolve(response),
          ),
      );
    }
    it("rejects missing/invalid session tokens before receiving private snapshots", async () => {
      const room = await addRoom(fixture.admin);
      const connection = socket(room.roomId, room.members[0]!);
      identities.delete(connection.token);
      const snapshots: unknown[] = [];
      connection.client.on("room.snapshot", (value) => snapshots.push(value));
      const error = event<Error & { data?: { code: string } }>(
        connection.client,
        "connect_error",
      );
      connection.client.connect();
      expect((await error).data).toEqual({ code: "AUTH_REQUIRED" });
      expect(snapshots).toEqual([]);
    });
    it.each([undefined, "x".repeat(43)])(
      "rejects a valid bearer paired with wrong or missing capability %s",
      async (appSession) => {
        const room = await addRoom(fixture.admin);
        const peer = socket(room.roomId, room.members[0]!);
        peer.client.auth = {
          accessToken: peer.token,
          appSession,
          roomId: room.roomId,
          tabId: peer.tabId,
        };
        const snapshots: unknown[] = [];
        peer.client.on("room.snapshot", (value) => snapshots.push(value));
        const denied = event<Error & { data?: { code: string } }>(
          peer.client,
          "connect_error",
        );
        peer.client.connect();
        expect((await denied).data).toEqual({ code: "AUTH_REQUIRED" });
        expect(snapshots).toEqual([]);
      },
    );
    it("refuses authenticated outsiders without broadcasting any room data", async () => {
      const room = await addRoom(fixture.admin);
      const outsider = randomUUID();
      await fixture.admin.query("INSERT INTO auth.users(id) VALUES($1)", [
        outsider,
      ]);
      const connection = socket(room.roomId, outsider);
      const snapshots: unknown[] = [];
      connection.client.on("room.snapshot", (value) => snapshots.push(value));
      const error = event<Error & { data?: { code: string } }>(
        connection.client,
        "connect_error",
      );
      connection.client.connect();
      expect((await error).data).toEqual({ code: "ROOM_FORBIDDEN" });
      expect(snapshots).toEqual([]);
    });
    it("authenticates guests through the resolver and publishes complete official snapshots", async () => {
      const room = await addRoom(fixture.admin);
      const connection = socket(
        room.roomId,
        room.members[0]!,
        randomUUID(),
        "guest",
      );
      expect(await connect(connection.client)).toMatchObject({
        roomId: room.roomId,
        version: 0,
        room: { status: "WAITING", ready: { red: false, black: false } },
        match: null,
        clocks: null,
        role: "red",
        control: { mode: "writable" },
      });
    });
    it("does not tell a spectator that another tab took over their nonexistent control", async () => {
      const room = await addRoom(fixture.admin, [
        randomUUID(),
        randomUUID(),
        randomUUID(),
      ]);
      const spectator = socket(room.roomId, room.members[2]!);
      const notices: unknown[] = [];
      spectator.client.on("session.read_only", (value) => notices.push(value));
      expect(await connect(spectator.client)).toMatchObject({
        role: "spectator",
        control: { mode: "readonly" },
      });
      expect(
        await command(spectator.client, readyCommand(room.roomId)),
      ).toMatchObject({ status: "error", error: { code: "TAB_READ_ONLY" } });
      expect(notices).toEqual([]);
    });
    it("returns concurrent duplicate acknowledgements once and stale snapshots without rewriting", async () => {
      const room = await addRoom(fixture.admin);
      const connection = socket(room.roomId, room.members[0]!);
      await connect(connection.client);
      const request = readyCommand(room.roomId);
      const results = await Promise.all([
        command(connection.client, request),
        command(connection.client, request),
      ]);
      expect(results[0]).toEqual(results[1]);
      expect(results[0]).toMatchObject({
        status: "ok",
        snapshot: { version: 1 },
      });
      expect(
        await command(connection.client, readyCommand(room.roomId)),
      ).toMatchObject({
        status: "error",
        error: { code: "VERSION_STALE" },
        snapshot: { version: 1 },
      });
      expect(
        (
          await fixture.admin.query(
            "SELECT version FROM public.rooms WHERE id=$1",
            [room.roomId],
          )
        ).rows[0].version,
      ).toBe(1);
    });
    it("sanitizes malformed envelopes and upstream failures without exposing payloads", async () => {
      const room = await addRoom(fixture.admin);
      const connection = socket(room.roomId, room.members[0]!);
      await connect(connection.client);
      for (const value of [
        null,
        { commandId: "fake-sensitive-fixture" },
        { ...readyCommand(room.roomId), expectedVersion: -1 },
        {
          ...readyCommand(room.roomId),
          action: { type: "match.move", payload: { from: -1, to: 900 } },
        },
      ]) {
        const ack = await command(connection.client, value);
        expect(ack).toMatchObject({
          status: "error",
          error: { code: "COMMAND_INVALID" },
        });
        expect(JSON.stringify(ack)).not.toContain("fake-sensitive-fixture");
      }
      fixture.rooms.failAfterMutation = true;
      try {
        expect(
          await command(connection.client, readyCommand(room.roomId)),
        ).toMatchObject({
          status: "error",
          error: { code: "REALTIME_UNAVAILABLE" },
        });
      } finally {
        fixture.rooms.failAfterMutation = false;
      }
    });
    it("makes old tabs read-only, denies direct commands and retains that state on reconnect", async () => {
      const room = await addRoom(fixture.admin);
      const old = socket(room.roomId, room.members[0]!);
      await connect(old.client);
      const notice = event(old.client, "session.read_only");
      const current = socket(room.roomId, room.members[0]!);
      await connect(current.client);
      expect(await notice).toEqual({
        message: "Phiên này đã được mở ở tab khác",
        stopMedia: true,
      });
      expect(
        await command(old.client, readyCommand(room.roomId)),
      ).toMatchObject({ status: "error", error: { code: "TAB_READ_ONLY" } });
      old.client.disconnect();
      expect(await connect(old.client)).toMatchObject({
        control: { mode: "readonly" },
      });
      const response = await new Promise<CommandAcknowledgement>((resolve) =>
        old.client.emit("session.takeover", resolve),
      );
      expect(response).toMatchObject({
        status: "ok",
        snapshot: { control: { mode: "writable" } },
      });
      expect(
        await command(current.client, readyCommand(room.roomId)),
      ).toMatchObject({ status: "error", error: { code: "TAB_READ_ONLY" } });
    });
    it("revalidates expired sessions before commands, replay and outbound snapshots", async () => {
      const room = await addRoom(fixture.admin);
      const red = socket(room.roomId, room.members[0]!);
      const black = socket(room.roomId, room.members[1]!);
      await connect(red.client);
      await connect(black.client);
      const request = readyCommand(room.roomId);
      await command(red.client, request);
      identities.delete(red.token);
      expect(await command(red.client, request)).toMatchObject({
        status: "error",
        error: { code: "AUTH_REQUIRED" },
      });
      const snapshots: unknown[] = [];
      red.client.on("room.snapshot", (value) => snapshots.push(value));
      expect(
        await command(black.client, readyCommand(room.roomId, 1)),
      ).toMatchObject({ status: "ok" });
      // An acknowledgement on the revoked peer flushes any earlier frames on that same transport.
      expect(await command(red.client, request)).toMatchObject({
        status: "error",
        error: { code: "AUTH_REQUIRED" },
      });
      expect(snapshots).toEqual([]);
    });
    it("revokes capability independently of bearer before replay, command, publication and takeover", async () => {
      const room = await addRoom(fixture.admin);
      const red = socket(room.roomId, room.members[0]!);
      const black = socket(room.roomId, room.members[1]!);
      await connect(red.client);
      await connect(black.client);
      const request = readyCommand(room.roomId);
      expect(await command(red.client, request)).toMatchObject({
        status: "ok",
      });
      capabilities.delete(red.token);
      expect(identities.has(red.token)).toBe(true);
      for (const input of [request, readyCommand(room.roomId, 1)])
        expect(await command(red.client, input)).toMatchObject({
          status: "error",
          error: { code: "AUTH_REQUIRED" },
        });
      const takeover = await new Promise<CommandAcknowledgement>((resolve) =>
        red.client.emit("session.takeover", resolve),
      );
      expect(takeover).toMatchObject({
        status: "error",
        error: { code: "AUTH_REQUIRED" },
      });
      const snapshots: unknown[] = [];
      red.client.on("room.snapshot", (value) => snapshots.push(value));
      expect(
        await command(black.client, readyCommand(room.roomId, 1)),
      ).toMatchObject({ status: "ok" });
      await gateway.publishSnapshots(room.roomId);
      await command(red.client, request);
      expect(snapshots).toEqual([]);
      expect(
        (
          await fixture.admin.query(
            "SELECT version FROM public.rooms WHERE id=$1",
            [room.roomId],
          )
        ).rows[0].version,
      ).toBe(2);
    });
    it("does not allow a superseded read-only tab with revoked capability to retake control", async () => {
      const room = await addRoom(fixture.admin);
      const old = socket(room.roomId, room.members[0]!);
      await connect(old.client);
      const fresh = socket(room.roomId, room.members[0]!);
      await connect(fresh.client);
      capabilities.delete(old.token);
      const denied = await new Promise<CommandAcknowledgement>((resolve) =>
        old.client.emit("session.takeover", resolve),
      );
      expect(denied).toMatchObject({
        status: "error",
        error: { code: "AUTH_REQUIRED" },
      });
      expect(
        await command(fresh.client, readyCommand(room.roomId)),
      ).toMatchObject({ status: "ok" });
    });
    it("checks outbound room membership and does not send another room's snapshots", async () => {
      const room = await addRoom(fixture.admin);
      const otherRoom = await addRoom(fixture.admin);
      const removed = socket(room.roomId, room.members[0]!);
      const member = socket(room.roomId, room.members[1]!);
      const other = socket(otherRoom.roomId, otherRoom.members[0]!);
      await connect(removed.client);
      await connect(member.client);
      await connect(other.client);
      await fixture.admin.query(
        "UPDATE public.rooms SET members=$2 WHERE id=$1",
        [room.roomId, [room.members[1]]],
      );
      const removedSnapshots: unknown[] = [];
      const otherSnapshots: unknown[] = [];
      removed.client.on("room.snapshot", (value) =>
        removedSnapshots.push(value),
      );
      other.client.on("room.snapshot", (value) => otherSnapshots.push(value));
      expect(
        await command(member.client, readyCommand(room.roomId)),
      ).toMatchObject({ status: "ok" });
      await gateway.publishSnapshots(room.roomId);
      expect(removedSnapshots).toEqual([]);
      expect(otherSnapshots).toEqual([]);
      expect(
        await command(removed.client, readyCommand(room.roomId)),
      ).toMatchObject({ status: "error", error: { code: "ROOM_FORBIDDEN" } });
    });
    it("handles 50 real clients in 10 fixture rooms and reports preliminary acknowledgement latency", async () => {
      const loadClients: {
        client: ClientSocket;
        roomId: string;
        canControl: boolean;
      }[] = [];
      for (let roomIndex = 0; roomIndex < 10; roomIndex++) {
        const room = await addRoom(
          fixture.admin,
          Array.from({ length: 5 }, () => randomUUID()),
        );
        for (const [index, userId] of room.members.entries())
          loadClients.push({
            client: socket(room.roomId, userId).client,
            roomId: room.roomId,
            canControl: index < 2,
          });
      }
      const connected = await Promise.all(
        loadClients.map(({ client }) => connect(client)),
      );
      expect(connected).toHaveLength(50);
      const latencies: number[] = [];
      const responses = await Promise.all(
        loadClients.map(async ({ client, roomId }) => {
          const start = performance.now();
          const response = await command(client, readyCommand(roomId));
          latencies.push(performance.now() - start);
          return response;
        }),
      );
      expect(responses).toHaveLength(50);
      expect(
        responses.filter(
          (response) =>
            response.status === "error" &&
            response.error.code === "TAB_READ_ONLY",
        ),
      ).toHaveLength(30);
      expect(
        responses.filter((response) => response.status === "ok"),
      ).toHaveLength(10);
      expect(
        responses.filter(
          (response) =>
            response.status === "error" &&
            response.error.code === "VERSION_STALE",
        ),
      ).toHaveLength(10);
      latencies.sort((a, b) => a - b);
      console.log(
        JSON.stringify({
          fixture: "T12 Socket.IO + PostgreSQL, no real game/media",
          connections: 50,
          rooms: 10,
          ackP95Ms: Number(latencies[47]!.toFixed(2)),
        }),
      );
    }, 15000);
  },
);

// The Nest integration baseline must reset after both earlier suites finish.
describe.skipIf(!realtimeTestUrl)("Nest realtime lifecycle integration", () => {
  let fixture: Awaited<ReturnType<typeof prepareFixture>>;
  let app: Awaited<ReturnType<typeof createApp>>;
  let base: string;
  const clients: ClientSocket[] = [];
  const identities = new Map<string, RealtimeIdentity>();
  const capabilities = new Map<string, string>();
  beforeAll(async () => {
    fixture = await prepareFixture();
    app = await createApp(["http://localhost:5173"], [], null, {
      store: new RealtimeStore(fixture.runtime, fixture.rooms),
      identities: {
        resolve: async (token, appSession) => {
          const identity = identities.get(token);
          if (
            !identity ||
            !appSession ||
            capabilities.get(token) !== appSession
          )
            throw new RealtimeError("AUTH_REQUIRED", "Fixture session invalid");
          return identity;
        },
      },
    });
    await app.listen(0, "127.0.0.1");
    base = await app.getUrl();
  });
  afterAll(async () => {
    for (const client of clients) client.disconnect();
    if (app) await app.close();
    if (fixture) await fixture.close();
  });
  function socket(roomId: string, identity?: RealtimeIdentity) {
    const token = randomUUID();
    if (identity) identities.set(token, identity);
    const appSession = randomBytes(32).toString("base64url");
    capabilities.set(token, appSession);
    const client = io(base, {
      autoConnect: false,
      reconnection: false,
      transports: ["websocket"],
      auth: { accessToken: token, appSession, roomId, tabId: randomUUID() },
    });
    clients.push(client);
    return client;
  }
  function event<T>(client: ClientSocket, name: string): Promise<T> {
    return new Promise((resolve, reject) => {
      const receive = (payload: T) => {
        clearTimeout(timer);
        resolve(payload);
      };
      const timer = setTimeout(() => {
        client.off(name, receive);
        reject(new Error(`Timeout waiting for ${name}`));
      }, 3000);
      client.once(name, receive);
    });
  }
  it.each(["member", "guest"] as const)(
    "accepts verified fixture %s through createApp",
    async (kind) => {
      const room = await addRoom(fixture.admin);
      const client = socket(room.roomId, { userId: room.members[0]!, kind });
      const snapshot = event<RoomSnapshot>(client, "room.snapshot");
      client.connect();
      expect(await snapshot).toMatchObject({
        roomId: room.roomId,
        role: "red",
        control: { mode: "writable" },
      });
    },
  );
  it("rejects invalid sessions and outsiders without exposing private snapshots", async () => {
    const room = await addRoom(fixture.admin);
    for (const [identity, code] of [
      [undefined, "AUTH_REQUIRED"],
      [{ userId: randomUUID(), kind: "member" as const }, "ROOM_FORBIDDEN"],
    ] as const) {
      const client = socket(room.roomId, identity);
      let privateEvents = 0;
      client.on("room.snapshot", () => privateEvents++);
      const denied = event<Error & { data: { code: string } }>(
        client,
        "connect_error",
      );
      client.connect();
      expect((await denied).data.code).toBe(code);
      expect(privateEvents).toBe(0);
    }
  });
  it("closes connected sockets and releases the HTTP port on app.close", async () => {
    const room = await addRoom(fixture.admin);
    const client = socket(room.roomId, {
      userId: room.members[0]!,
      kind: "member",
    });
    const snapshot = event<RoomSnapshot>(client, "room.snapshot");
    client.connect();
    await snapshot;
    const disconnected = event<string>(client, "disconnect");
    const port = Number(new URL(base).port);
    await app.close();
    // io.close shuts down Engine.IO; client observes transport close rather than a namespace packet.
    expect(["transport close", "io server disconnect"]).toContain(
      await disconnected,
    );
    expect(client.connected).toBe(false);
    const replacement = createServer();
    try {
      await new Promise<void>((resolve, reject) => {
        replacement.once("error", reject);
        replacement.listen(port, "127.0.0.1", resolve);
      });
    } finally {
      await new Promise<void>((resolve, reject) =>
        replacement.close((error) => (error ? reject(error) : resolve())),
      );
    }
  });
});
