import { createHash, randomUUID } from "node:crypto";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { SessionService } from "../login/session.service.js";
import { PostgresLoginStore } from "../login/postgres-login-store.js";
import { PostgresMemberRoomAuthorizer } from "../room/member-room-auth.js";
import { RoomTransactions } from "../room/room-transactions.js";
import { RoomHttpService } from "../room/room-http.service.js";
import { RoomStore } from "../room/room-store.js";
import type { RealtimeConnection } from "./contracts.js";
import {
  MemberRealtimeIdentities,
  MemberRealtimeTransactions,
} from "./member-transactions.js";
import { MemberRealtimePresence } from "./member-presence.js";
import { databaseUrl, pool, reset } from "./member-transactions.test-helper.js";
const hash = (s: string) => createHash("sha256").update(s).digest("hex");
async function setup() {
  const id = randomUUID(),
    email = `synthetic-${id}@example.invalid`,
    now = new Date();
  await pool.query(
    "INSERT INTO auth.users(id,email,email_confirmed_at) VALUES($1,$2,$3)",
    [id, email, now],
  );
  await pool.query(
    "INSERT INTO public.profiles(user_id,username,display_name,completed_at,registration_pending) VALUES($1,$2,'Synthetic Member',$3,false)",
    [id, "m" + id.replaceAll("-", "").slice(0, 18), now],
  );
  const provider = {
    signInPassword: vi.fn(),
    getUser: vi.fn(async () => ({
      id,
      email,
      email_confirmed_at: now.toISOString(),
    })),
  };
  const sessions = new SessionService(new PostgresLoginStore(pool), provider),
    issued = await sessions.issue(id, false);
  const proof = {
    accessToken: "synthetic-bearer",
    appSession: issued.appSession,
  };
  const authorizer = new PostgresMemberRoomAuthorizer(sessions),
    coordinator = new RoomTransactions(pool),
    rooms = new RoomStore();
  const entry = await new RoomHttpService(
    rooms,
    coordinator,
    authorizer,
  ).create(proof, { commandId: randomUUID(), name: "Realtime Member" });
  provider.getUser.mockClear();
  const identities = new MemberRealtimeIdentities(authorizer),
    transactions = new MemberRealtimeTransactions(coordinator, authorizer);
  const identity = await identities.resolve(
    proof.accessToken,
    proof.appSession,
    proof,
  );
  const connection: RealtimeConnection = {
    identity,
    proof,
    roomId: entry.roomId,
    tabId: randomUUID(),
    connectionId: randomUUID(),
  };
  const serverInstance = randomUUID(),
    presence = new MemberRealtimePresence(
      pool,
      coordinator,
      rooms,
      transactions,
      serverInstance,
    );
  await pool.query(
    "INSERT INTO xiangqi_realtime.tabs(user_id,room_id,tab_id) VALUES($1,$2,$3)",
    [id, entry.roomId, connection.tabId],
  );
  await pool.query(
    "INSERT INTO xiangqi_realtime.controllers(user_id,room_id,tab_id,connection_id,generation) VALUES($1,$2,$3,$4,1)",
    [id, entry.roomId, connection.tabId, connection.connectionId],
  );
  return {
    serverInstance,
    presence,
    authorizer,
    id,
    proof,
    provider,
    identities,
    transactions,
    connection,
    rooms,
    coordinator,
  };
}

const writable = { mode: "writable" as const, generation: 1, reason: null };
async function online(
  m: Awaited<ReturnType<typeof setup>>,
  connection = m.connection,
  generation = 1,
) {
  await m.transactions.run(connection, (c) =>
    m.rooms.presence(
      m.transactions.getScope(c, connection.identity, connection.roomId),
      connection.roomId,
      {
        connectionId: connection.connectionId,
        generation,
        serverInstance: m.serverInstance,
      },
      true,
    ),
  );
}
async function state(m: Awaited<ReturnType<typeof setup>>) {
  return (
    await pool.query(
      "SELECT p.connected,p.connection_id,p.generation::integer AS generation,p.server_instance,m.disconnected_at FROM xiangqi_room.presence p JOIN public.room_members m USING(room_id,user_id) WHERE p.room_id=$1 AND p.user_id=$2",
      [m.connection.roomId, m.id],
    )
  ).rows[0];
}
afterAll(() => pool.end());
describe.skipIf(!databaseUrl)("member realtime physical presence SQL", () => {
  beforeEach(reset);
  it("writes writable control using exact authenticated transaction client and server fence", async () => {
    const m = await setup();
    await m.transactions.run(m.connection, (c) =>
      m.presence.connected(c, m.connection, writable),
    );
    expect(await state(m)).toMatchObject({
      connected: true,
      connection_id: m.connection.connectionId,
      generation: 1,
      server_instance: m.serverInstance,
      disconnected_at: null,
    });
    expect(m.provider.getUser).toHaveBeenCalledTimes(1);
  });
  it("readonly control never marks a player online", async () => {
    const m = await setup();
    await m.transactions.run(m.connection, (c) =>
      m.presence.connected(c, m.connection, {
        mode: "readonly",
        generation: 1,
        reason: "superseded",
      }),
    );
    expect(await state(m)).toBeUndefined();
  });
  it("rejects borrowed clients outside the authenticated scope", async () => {
    const m = await setup(),
      c = await pool.connect();
    try {
      await expect(
        m.presence.connected(c, m.connection, writable),
      ).rejects.toMatchObject({ code: "AUTH_REQUIRED" });
    } finally {
      c.release();
    }
  });
  it.each(["expiry", "revocation"])(
    "physical disconnect after %s marks grace without credentials/provider",
    async (change) => {
      const m = await setup();
      await online(m);
      await pool.query(
        change === "expiry"
          ? "WITH t AS (SELECT clock_timestamp() AS at) UPDATE xiangqi_auth.app_sessions SET created_at=t.at-interval '12 hours',expires_at=t.at FROM t WHERE token_hash=$1"
          : "UPDATE xiangqi_auth.app_sessions SET revoked_at=clock_timestamp() WHERE token_hash=$1",
        [hash(m.proof.appSession)],
      );
      m.provider.getUser.mockRejectedValue(
        new Error("synthetic provider unavailable"),
      );
      await m.presence.disconnected({ ...m.connection, proof: undefined });
      const row = await state(m);
      expect(row.connected).toBe(false);
      expect(row.disconnected_at).toBeInstanceOf(Date);
      expect(m.provider.getUser).toHaveBeenCalledTimes(1);
      await m.presence.disconnected(m.connection);
      expect((await state(m)).disconnected_at).toEqual(row.disconnected_at);
    },
  );
  it("takeover fences old physical disconnect and ignores other server instances", async () => {
    const m = await setup();
    await online(m);
    const next = {
      ...m.connection,
      tabId: randomUUID(),
      connectionId: randomUUID(),
    };
    await pool.query(
      "INSERT INTO xiangqi_realtime.tabs(user_id,room_id,tab_id) VALUES($1,$2,$3)",
      [m.id, next.roomId, next.tabId],
    );
    await pool.query(
      "UPDATE xiangqi_realtime.controllers SET tab_id=$3,connection_id=$4,generation=2 WHERE user_id=$1 AND room_id=$2",
      [m.id, next.roomId, next.tabId, next.connectionId],
    );
    await online(m, next, 2);
    await m.presence.disconnected(m.connection);
    expect(await state(m)).toMatchObject({
      connected: true,
      connection_id: next.connectionId,
      generation: 2,
      disconnected_at: null,
    });
    const other = new MemberRealtimePresence(
      pool,
      m.coordinator,
      m.rooms,
      m.transactions,
      randomUUID(),
    );
    await other.disconnected(next);
    expect((await state(m)).connected).toBe(true);
    await m.presence.disconnected(next);
    expect((await state(m)).connected).toBe(false);
  });
  it("returns ended while committing expired-seat cleanup", async () => {
    const m = await setup();
    await online(m);
    await pool.query(
      "UPDATE public.room_members SET disconnected_at=clock_timestamp()-interval '61 seconds' WHERE room_id=$1 AND user_id=$2",
      [m.connection.roomId, m.id],
    );
    await pool.query(
      "UPDATE xiangqi_room.presence SET connected=false WHERE room_id=$1 AND user_id=$2",
      [m.connection.roomId, m.id],
    );
    const result = await m.transactions.run(m.connection, (c) =>
      m.presence.connected(c, m.connection, writable),
    );
    expect(result).toBe("ended");
    expect(
      (
        await pool.query(
          "SELECT count(*)::int n FROM public.room_members WHERE room_id=$1 AND user_id=$2",
          [m.connection.roomId, m.id],
        )
      ).rows[0].n,
    ).toBe(0);
    expect(
      (
        await pool.query("SELECT status FROM public.rooms WHERE id=$1", [
          m.connection.roomId,
        ])
      ).rows[0].status,
    ).toBe("CLOSED");
  });
  it("rolls back a physical-disconnect failure after the presence mutation", async () => {
    const m = await setup();
    await online(m);
    const original = m.rooms.presence.bind(m.rooms),
      spy = vi
        .spyOn(m.rooms, "presence")
        .mockImplementationOnce(async (...args) => {
          await original(...args);
          throw new Error("synthetic grace failure");
        });
    try {
      await expect(m.presence.disconnected(m.connection)).rejects.toThrow(
        "synthetic grace failure",
      );
    } finally {
      spy.mockRestore();
    }
    expect(await state(m)).toMatchObject({
      connected: true,
      disconnected_at: null,
    });
    await m.presence.disconnected(m.connection);
    expect((await state(m)).connected).toBe(false);
    expect(m.provider.getUser).toHaveBeenCalledTimes(1);
  });
});
