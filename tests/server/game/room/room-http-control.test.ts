import { randomUUID } from "node:crypto";
import { afterAll, afterEach, beforeEach, describe, expect, it } from "vitest";
import type { RoomControlProof, RoomSnapshot } from "@xiangqi/shared";
import { createApp } from "@server/app.js";
import { GuestService } from "@server/account/guest/guest.service.js";
import { GuestStore } from "@server/account/guest/guest.store.js";
import { ClockService } from "@server/game/clock/clock.service.js";
import { GameRooms } from "@server/game/realtime/game-rooms.js";
import { RoomRealtimePresence } from "@server/game/realtime/member-presence.js";
import {
  RoomRealtimeIdentities,
  RoomRealtimeTransactions,
} from "@server/game/realtime/member-transactions.js";
import type { RealtimeConnection } from "@server/game/realtime/realtime.types.js";
import { RealtimeStore } from "@server/game/realtime/store.js";
import { GuestRoomAuthorizer } from "@server/game/room/guest-room-auth.js";
import { PostgresMemberRoomAuthorizer } from "@server/game/room/member-room-auth.js";
import { RoomHttpService } from "@server/game/room/room-http.service.js";
import { RoomModule } from "@server/game/room/room.module.js";
import { RoomSessionAuthorizer } from "@server/game/room/room-session.js";
import { createRoomWiring } from "@server/game/room/room-wiring.js";
import {
  apply,
  databaseUrl,
  loginPool,
  member,
  pool,
  registration,
  resetBase as reset,
} from "../game.runtime.test-helper.js";

let app: Awaited<ReturnType<typeof createApp>> | undefined;
afterEach(async () => {
  await app?.close();
  app = undefined;
});
afterAll(async () => {
  await pool.end();
  await loginPool.end();
});
const control = (
  peer: RealtimeConnection,
  state: RoomSnapshot,
): RoomControlProof => ({
  tabId: peer.tabId,
  connectionId: peer.connectionId,
  generation: state.control.generation,
});
async function fixture() {
  const r = registration(),
    clock = new ClockService();
  const [a, b, w] = await Promise.all([member(r), member(r), member(r)]);
  const wiring = createRoomWiring(pool, clock);
  const authorizer = new RoomSessionAuthorizer(
    new PostgresMemberRoomAuthorizer(r.sessions),
    new GuestRoomAuthorizer(new GuestService(new GuestStore(pool)), pool),
  );
  const service = new RoomHttpService(
    wiring.rooms,
    wiring.coordinator,
    authorizer,
    wiring.withScope,
  );
  const transactions = new RoomRealtimeTransactions(
    wiring.coordinator,
    authorizer,
  );
  const identities = new RoomRealtimeIdentities(authorizer);
  const games = new GameRooms(
    wiring.rooms,
    wiring.matches,
    clock,
    (c, id, roomId) => transactions.getScope(c, id, roomId),
  );
  const presence = new RoomRealtimePresence(
    pool,
    wiring.coordinator,
    wiring.rooms,
    transactions,
    randomUUID(),
  );
  const realtime = new RealtimeStore(pool, games, transactions, presence);
  const proof = (m: typeof a) => ({
    accessToken: m.token,
    appSession: m.appSession,
  });
  const entry = await service.create(proof(a), {
    commandId: randomUUID(),
    timeMinutes: 5,
  });
  await service.join(proof(b), {
    commandId: randomUUID(),
    code: entry.inviteCode!,
    preference: "play",
  });
  await service.join(proof(w), {
    commandId: randomUUID(),
    code: entry.inviteCode!,
    preference: "watch",
  });
  const connect = async (m: typeof a) => {
    const credential = proof(m);
    const peer: RealtimeConnection = {
      proof: credential,
      identity: await identities.resolve(credential),
      roomId: entry.roomId,
      tabId: randomUUID(),
      connectionId: randomUUID(),
    };
    const state = await realtime.connect(peer);
    return { peer, state, control: control(peer, state) };
  };
  app = await createApp(
    ["http://localhost:5173"],
    [RoomModule.forRoot(service)],
  );
  await app.listen(0, "127.0.0.1");
  const base = `http://127.0.0.1:${app.getHttpServer().address().port}`;
  const post = (m: typeof a, action: string, body: object) =>
    fetch(`${base}/rooms/${entry.roomId}/${action}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${m.token}`,
        "X-Xiangqi-Session": m.appSession,
        "Content-Type": "application/json",
        Origin: "http://localhost:5173",
      },
      body: JSON.stringify(body),
    });
  const view = (m = a) => service.snapshot(proof(m), entry.roomId);
  const persisted = async () => ({
    room: (
      await pool.query(
        "SELECT room_version::text, visibility FROM public.rooms WHERE id=$1",
        [entry.roomId],
      )
    ).rows,
    members: (
      await pool.query(
        "SELECT user_id::text,role,side FROM public.room_members WHERE room_id=$1 ORDER BY user_id",
        [entry.roomId],
      )
    ).rows,
    active: (
      await pool.query(
        "SELECT user_id::text,room_id::text FROM public.active_players WHERE room_id=$1 ORDER BY user_id",
        [entry.roomId],
      )
    ).rows,
    outbox: (
      await pool.query(
        "SELECT count(*)::text AS count FROM xiangqi_room.outbox WHERE room_id=$1",
        [entry.roomId],
      )
    ).rows,
  });
  return { a, b, w, connect, realtime, entry, post, view, persisted };
}

describe.skipIf(!databaseUrl)(
  "physical room controller enforced across HTTP and realtime on actual SQL",
  () => {
    beforeEach(async () => {
      await reset();
      await apply("supabase/migrations/20261011000016_room_viewers.sql");
      await apply("supabase/migrations/20261103000011_yc9_ranked.sql");
    });
    it("rejects an old tab on all room mutations, requires proof, and fences disconnect and takeover generations", async () => {
      const f = await fixture(),
        old = await f.connect(f.a),
        current = await f.connect(f.a);
      expect((await f.realtime.snapshot(old.peer)).control.reason).toBe(
        "superseded",
      );
      const reconnect = await f.realtime.connect({
        ...old.peer,
        connectionId: randomUUID(),
      });
      expect(reconnect.control).toMatchObject({
        mode: "readonly",
        reason: "superseded",
      });
      const expectedVersion = (await f.view()).version;
      const before = await f.persisted();
      const actions: [string, object][] = [
        ["visibility", { visibility: "CODE_ONLY" }],
        ["switch-seat", {}],
        ["to-spectator", {}],
        ["move-to-spectator", { targetId: f.b.id }],
        ["invite-down", { targetId: f.w.id }],
        ["respond-down", { accept: true, offerId: randomUUID() }],
        ["request-seat", {}],
        ["respond-seat-request", { accept: true, requestId: randomUUID() }],
        ["invite-leave", { targetId: f.b.id }],
        ["kick", { targetId: f.w.id }],
        ["leave", {}],
        ["swap-propose", {}],
        ["swap-withdraw", {}],
        ["swap-respond", { accept: true }],
        ["rematch-propose", { side: "KEEP" }],
        ["rematch-respond", { accept: true }],
      ];
      for (const [action, extra] of actions) {
        const response = await f.post(f.a, action, {
          expectedVersion,
          control: old.control,
          ...extra,
        });
        expect(response.status, action).toBe(403);
        expect(await response.json()).toMatchObject({
          code: "ROOM_TAB_READ_ONLY",
        });
        const omitted = await f.post(f.a, action, {
          expectedVersion,
          ...extra,
        });
        expect(omitted.status, `${action} without proof`).toBe(403);
      }
      for (const candidate of [
        null,
        {},
        { ...current.control, connectionId: "wrong-socket" },
        { ...current.control, tabId: randomUUID() },
        { ...current.control, generation: 0 },
        { ...current.control, generation: 2_147_483_648 },
        { ...current.control, generation: current.control.generation + 1 },
      ]) {
        const response = await f.post(f.a, "visibility", {
          expectedVersion,
          visibility: "CODE_ONLY",
          control: candidate,
        });
        expect(response.status).toBe(403);
      }
      const otherActor = await f.post(f.b, "visibility", {
        expectedVersion,
        visibility: "CODE_ONLY",
        control: current.control,
      });
      expect(otherActor.status).toBe(403);
      expect(await f.persisted()).toEqual(before);
      const accepted = await f.post(f.a, "visibility", {
        expectedVersion,
        visibility: "CODE_ONLY",
        control: current.control,
      });
      expect(accepted.status).toBe(200);
      await f.realtime.disconnect(current.peer);
      const afterDisconnect = await f.persisted();
      const disconnected = await f.post(f.a, "leave", {
        expectedVersion: (await f.view()).version,
        control: current.control,
      });
      expect(disconnected.status).toBe(403);
      expect(await f.persisted()).toEqual(afterDisconnect);
      const recovered = await f.realtime.connect(old.peer, true);
      const recoveredProof = control(old.peer, recovered);
      expect(recoveredProof.generation).toBeGreaterThan(
        current.control.generation,
      );
      const stale = await f.post(f.a, "visibility", {
        expectedVersion: recovered.version,
        visibility: "PUBLIC",
        control: old.control,
      });
      expect(stale.status).toBe(403);
      const restored = await f.post(f.a, "visibility", {
        expectedVersion: recovered.version,
        visibility: "PUBLIC",
        control: recoveredProof,
      });
      expect(restored.status).toBe(200);
    });
    it("lets the owning spectator tab respond and leave while its superseded tab remains read-only", async () => {
      const f = await fixture(),
        host = await f.connect(f.a),
        old = await f.connect(f.w),
        owner = await f.connect(f.w);
      expect(owner.state.control).toMatchObject({
        mode: "readonly",
        reason: "not_allowed",
      });
      expect(
        (
          await f.post(f.a, "move-to-spectator", {
            expectedVersion: (await f.view()).version,
            targetId: f.b.id,
            control: host.control,
          })
        ).status,
      ).toBe(200);
      const invite = await f.post(f.a, "invite-down", {
        expectedVersion: (await f.view()).version,
        targetId: f.w.id,
        control: host.control,
      });
      expect(invite.status).toBe(200);
      const offerId = (await invite.json()).room.downOffer.id as string;
      const expectedVersion = (await f.view(f.w)).version;
      expect(
        (
          await f.post(f.w, "respond-down", {
            expectedVersion,
            accept: false,
            offerId,
            control: old.control,
          })
        ).status,
      ).toBe(403);
      expect(
        (
          await f.post(f.w, "respond-down", {
            expectedVersion,
            accept: false,
            offerId,
            control: owner.control,
          })
        ).status,
      ).toBe(200);
      const leaveVersion = (await f.view(f.w)).version;
      expect(
        (
          await f.post(f.w, "leave", {
            expectedVersion: leaveVersion,
            control: old.control,
          })
        ).status,
      ).toBe(403);
      expect(
        (
          await f.post(f.w, "leave", {
            expectedVersion: leaveVersion,
            control: owner.control,
          })
        ).status,
      ).toBe(200);
      expect(
        (
          await pool.query(
            "SELECT 1 FROM public.room_members WHERE room_id=$1 AND user_id=$2",
            [f.entry.roomId, f.w.id],
          )
        ).rowCount,
      ).toBe(0);
    });
  },
);
