import { randomUUID } from "node:crypto";
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
const readonly = {
  mode: "readonly" as const,
  generation: 0,
  reason: "not_allowed" as const,
};
async function setup() {
  const users = new Map<
    string,
    { id: string; email: string; email_confirmed_at: string }
  >();
  const provider = {
    signInPassword: vi.fn(),
    getUser: vi.fn(async (token: string) => users.get(token)!),
  };
  const sessions = new SessionService(new PostgresLoginStore(pool), provider);
  async function member() {
    const id = randomUUID(),
      email = `synthetic-${id}@example.invalid`,
      confirmed = new Date();
    await pool.query(
      "INSERT INTO auth.users(id,email,email_confirmed_at) VALUES($1,$2,$3)",
      [id, email, confirmed],
    );
    await pool.query(
      "INSERT INTO public.profiles(user_id,username,display_name,completed_at,registration_pending) VALUES($1,$2,'Synthetic',$3,false)",
      [id, "m" + id.replaceAll("-", "").slice(0, 18), confirmed],
    );
    const proof = {
      accessToken: `synthetic-${id}`,
      appSession: (await sessions.issue(id, false)).appSession,
    };
    users.set(proof.accessToken, {
      id,
      email,
      email_confirmed_at: confirmed.toISOString(),
    });
    return { id, proof };
  }
  const host = await member(),
    viewer = await member();
  const authorizer = new PostgresMemberRoomAuthorizer(sessions),
    coordinator = new RoomTransactions(pool),
    rooms = new RoomStore();
  const http = new RoomHttpService(rooms, coordinator, authorizer);
  const entry = await http.create(host.proof, {
    commandId: randomUUID(),
    name: "Synthetic viewer room",
  });
  await http.join(viewer.proof, {
    commandId: randomUUID(),
    code: entry.inviteCode!,
    preference: "watch",
  });
  const transactions = new MemberRealtimeTransactions(coordinator, authorizer),
    identities = new MemberRealtimeIdentities(authorizer);
  const identity = await identities.resolve(
    viewer.proof.accessToken,
    viewer.proof.appSession,
    viewer.proof,
  );
  const connection: RealtimeConnection = {
    identity,
    proof: viewer.proof,
    roomId: entry.roomId,
    tabId: randomUUID(),
    connectionId: randomUUID(),
  };
  const serverInstance = randomUUID();
  let peers: RealtimeConnection[] = [connection];
  const currentPeers = vi.fn(() => peers);
  const presence = new MemberRealtimePresence(
    pool,
    coordinator,
    rooms,
    transactions,
    serverInstance,
    currentPeers,
  );
  const online = (c = connection) =>
    transactions.run(c, (client) => presence.connected(client, c, readonly));
  const state = async () =>
    (
      await pool.query(
        "SELECT p.connected,p.connection_id,p.generation::text AS generation,p.server_instance,m.disconnected_at FROM public.room_members m LEFT JOIN xiangqi_room.presence p USING(room_id,user_id) WHERE m.room_id=$1 AND m.user_id=$2",
        [entry.roomId, viewer.id],
      )
    ).rows[0];
  return {
    connection,
    currentPeers,
    setPeers: (next: RealtimeConnection[]) => {
      peers = next;
    },
    online,
    state,
    presence,
    provider,
    transactions,
    rooms,
    coordinator,
    serverInstance,
    viewer,
    host,
  };
}
afterAll(() => pool.end());
describe.skipIf(!databaseUrl)("member viewer physical presence SQL", () => {
  beforeEach(reset);
  it("marks a readonly spectator physically online with positive generation without granting controller", async () => {
    const m = await setup();
    await m.online();
    expect(await m.state()).toMatchObject({
      connected: true,
      connection_id: m.connection.connectionId,
      generation: "1",
      disconnected_at: null,
    });
    expect(
      (
        await pool.query(
          "SELECT count(*)::int n FROM xiangqi_realtime.controllers WHERE user_id=$1",
          [m.viewer.id],
        )
      ).rows[0].n,
    ).toBe(0);
    expect(readonly).toEqual({
      mode: "readonly",
      generation: 0,
      reason: "not_allowed",
    });
  });
  it("last physical disconnect starts viewer grace once without credentials or provider", async () => {
    const m = await setup();
    await m.online();
    m.setPeers([]);
    m.provider.getUser.mockClear();
    await m.presence.disconnected({ ...m.connection, proof: undefined });
    const row = await m.state();
    expect(row.connected).toBe(false);
    expect(row.disconnected_at).toBeInstanceOf(Date);
    await m.presence.disconnected(m.connection);
    expect((await m.state()).disconnected_at).toEqual(row.disconnected_at);
    expect(m.provider.getUser).not.toHaveBeenCalled();
  });
  it("rebinds a departing active viewer to its surviving tab and fences stale disconnect events", async () => {
    const m = await setup();
    await m.online();
    const other = {
      ...m.connection,
      connectionId: randomUUID(),
      tabId: randomUUID(),
    };
    m.setPeers([m.connection, other]);
    await m.online(other);
    expect((await m.state()).generation).toBe("2");
    m.setPeers([m.connection]);
    await m.presence.disconnected(other);
    expect(await m.state()).toMatchObject({
      connected: true,
      connection_id: m.connection.connectionId,
      generation: "3",
      disconnected_at: null,
    });
    await m.presence.disconnected(other);
    expect((await m.state()).generation).toBe("3");
    m.setPeers([]);
    await m.presence.disconnected(m.connection);
    expect((await m.state()).connected).toBe(false);
  });
  it("reads surviving peers after waiting for actor/room locks so two closing tabs cannot leave a ghost", async () => {
    const m = await setup();
    await m.online();
    const other = {
      ...m.connection,
      connectionId: randomUUID(),
      tabId: randomUUID(),
    };
    m.setPeers([m.connection, other]);
    await m.online(other);
    m.currentPeers.mockClear();
    const blocker = await pool.connect();
    let first!: Promise<void>, second!: Promise<void>;
    try {
      await blocker.query("BEGIN");
      await blocker.query(
        "SELECT pg_advisory_xact_lock(hashtextextended($1,0))",
        ["actor:" + m.viewer.id],
      );
      m.setPeers([m.connection]);
      first = m.presence.disconnected(other);
      let waiting = false;
      for (let attempt = 0; attempt < 50; attempt++) {
        waiting =
          (
            await pool.query(
              "SELECT count(*)::int n FROM pg_stat_activity WHERE datname=current_database() AND wait_event='advisory'",
            )
          ).rows[0].n > 0;
        if (waiting) break;
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
      expect(waiting).toBe(true);
      expect(m.currentPeers).not.toHaveBeenCalled();
      m.setPeers([]);
      second = m.presence.disconnected(m.connection);
    } finally {
      await blocker.query("ROLLBACK");
      blocker.release();
    }
    await Promise.all([first, second]);
    expect(await m.state()).toMatchObject({ connected: false });
    expect((await m.state()).disconnected_at).toBeInstanceOf(Date);
  });
  it("retires a survivor that closes after peer sampling but before the rebind commits", async () => {
    const m = await setup();
    await m.online();
    const other = {
      ...m.connection,
      connectionId: randomUUID(),
      tabId: randomUUID(),
    };
    await m.online(other);
    await m.online();
    m.setPeers([other]);
    let sampled!: () => void, release!: () => void;
    const entered = new Promise<void>((resolve) => {
      sampled = resolve;
    });
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const original = m.rooms.presence.bind(m.rooms);
    const spy = vi
      .spyOn(m.rooms, "presence")
      .mockImplementationOnce(async (...args) => {
        expect(args[2].connectionId).toBe(other.connectionId);
        expect(args[3]).toBe(true);
        sampled();
        await gate;
        return original(...args);
      });
    const first = m.presence.disconnected(m.connection);
    await entered;
    m.setPeers([]);
    const second = m.presence.disconnected(other);
    release();
    try {
      await Promise.all([first, second]);
    } finally {
      spy.mockRestore();
    }
    expect(await m.state()).toMatchObject({
      connected: false,
      connection_id: other.connectionId,
      generation: "4",
    });
    expect((await m.state()).disconnected_at).toBeInstanceOf(Date);
  });
  it("recovery clears old-boot viewers and old cleanup cannot undo a fresh-boot reconnect", async () => {
    const m = await setup();
    await m.online();
    const newBoot = randomUUID();
    await m.transactions.run(m.connection, (client) =>
      m.rooms.recoverWaiting(
        m.transactions.getScope(
          client,
          m.connection.identity,
          m.connection.roomId,
        ),
        m.connection.roomId,
        newBoot,
      ),
    );
    const recovered = await m.state();
    expect(recovered.connected).toBe(false);
    expect(recovered.disconnected_at).toBeInstanceOf(Date);
    await m.presence.disconnected(m.connection);
    expect((await m.state()).disconnected_at).toEqual(
      recovered.disconnected_at,
    );
    const fresh = { ...m.connection, connectionId: randomUUID() };
    const restarted = new MemberRealtimePresence(
      pool,
      m.coordinator,
      m.rooms,
      m.transactions,
      newBoot,
      () => [fresh],
    );
    await m.transactions.run(fresh, (client) =>
      restarted.connected(client, fresh, readonly),
    );
    m.provider.getUser.mockClear();
    await m.presence.disconnected(fresh);
    expect(await m.state()).toMatchObject({
      connected: true,
      connection_id: fresh.connectionId,
      generation: "2",
      server_instance: newBoot,
      disconnected_at: null,
    });
    expect(m.provider.getUser).not.toHaveBeenCalled();
  });
  it("expired viewer reconnect returns ended and commits membership release at the 300-second boundary", async () => {
    const m = await setup();
    await m.online();
    m.setPeers([]);
    await m.presence.disconnected(m.connection);
    await pool.query(
      "UPDATE public.room_members SET disconnected_at=clock_timestamp()-interval '300 seconds' WHERE room_id=$1 AND user_id=$2",
      [m.connection.roomId, m.viewer.id],
    );
    expect(await m.online()).toBe("ended");
    expect(await m.state()).toBeUndefined();
    expect(
      (
        await pool.query(
          "SELECT count(*)::int n FROM xiangqi_room.presence WHERE user_id=$1",
          [m.viewer.id],
        )
      ).rows[0].n,
    ).toBe(0);
  });
  it("does not mark a readonly PLAYER online or grant it spectator presence", async () => {
    const m = await setup();
    const identity = await new MemberRealtimeIdentities(
      new PostgresMemberRoomAuthorizer(
        new SessionService(new PostgresLoginStore(pool), m.provider),
      ),
    ).resolve(m.host.proof.accessToken, m.host.proof.appSession, m.host.proof);
    const c = {
      ...m.connection,
      identity,
      proof: m.host.proof,
      connectionId: randomUUID(),
    };
    await m.transactions.run(c, (client) =>
      m.presence.connected(client, c, readonly),
    );
    expect(
      (
        await pool.query(
          "SELECT count(*)::int n FROM xiangqi_room.presence WHERE user_id=$1",
          [m.host.id],
        )
      ).rows[0].n,
    ).toBe(0);
  });
  it("rejects exhausted unsafe physical generations without changing the stored fence", async () => {
    const m = await setup();
    await m.online();
    await pool.query(
      "UPDATE xiangqi_room.presence SET generation=$1 WHERE user_id=$2",
      [String(Number.MAX_SAFE_INTEGER), m.viewer.id],
    );
    await expect(m.online()).rejects.toMatchObject({
      code: "REALTIME_UNAVAILABLE",
    });
    expect((await m.state()).generation).toBe(String(Number.MAX_SAFE_INTEGER));
  });
  it("ignores cleanup from another boot instance and filters unrelated surviving peers", async () => {
    const m = await setup();
    await m.online();
    const otherInstance = new MemberRealtimePresence(
      pool,
      m.coordinator,
      m.rooms,
      m.transactions,
      randomUUID(),
      m.currentPeers,
    );
    m.setPeers([]);
    await otherInstance.disconnected(m.connection);
    expect((await m.state()).connected).toBe(true);
    m.setPeers([
      { ...m.connection, connectionId: randomUUID(), roomId: randomUUID() },
      {
        ...m.connection,
        connectionId: randomUUID(),
        identity: { ...m.connection.identity, userId: m.host.id },
      },
      {
        ...m.connection,
        connectionId: randomUUID(),
        identity: { ...m.connection.identity, kind: "guest" },
      },
    ]);
    await m.presence.disconnected(m.connection);
    expect((await m.state()).connected).toBe(false);
  });
});
