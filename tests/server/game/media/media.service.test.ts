import { randomUUID } from "node:crypto";
import { decodeJwt, jwtVerify } from "jose";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { MediaAccess } from "@server/game/media/media.service.js";
import { MediaStore } from "@server/game/media/media.store.js";
import { readMediaConfig } from "@server/game/media/media.module.js";
import {
  privateRoomName,
  stageRoomName,
} from "@server/game/media/media.types.js";
import {
  actor,
  config,
  deferred,
  deliveredAt,
  makeRoom,
  pool,
  queueRevoke,
  resetMediaSchema,
  seat,
  takeControl,
  url,
  waitForBlockedAdvisoryLock,
} from "./media.test-helper.js";

afterAll(() => pool.end());
// Tab giữ quyền điều khiển trong các test; tab khác dùng cho kịch bản chuyển quyền.
const TAB = randomUUID();
const CONTROL = { tabId: TAB, connectionId: "test", generation: 1 };

it("discovers only permitted participants with an unmuted provider track", async () => {
  const tx = {
    findMemberRole: async () => "SPECTATOR",
    permittedSources: async () => ["allowed"],
    generation: async () => "generation",
  };
  const store = {
    read: async (work: (value: typeof tx) => unknown) => work(tx),
  } as unknown as MediaStore;
  const fetchFn = async () =>
    new Response(
      JSON.stringify({
        participants: [
          { identity: "denied", tracks: [{ type: "VIDEO", muted: false }] },
          { identity: "allowed", tracks: [{ type: "AUDIO", muted: true }] },
        ],
      }),
      { status: 200 },
    );
  const access = new MediaAccess(config, store, fetchFn as typeof fetch);
  expect(await access.sourcesFor("viewer", "room")).toEqual({
    available: false,
    generation: "generation",
  });
});

it("does not report a reduced share as applied when provider revocation fails", async () => {
  const tx = {
    hasPlayerSeat: async () => true,
    hasControl: async () => true,
    findShare: async () => "ALL",
    saveShare: async () => {},
    queueShareRevoke: async () => {},
    pendingRevocations: async () => [{ id: "event", generation: "generation" }],
    markRevocationsDelivered: async () => {},
  };
  const store = {
    withRoom: async (
      _id: string,
      _roomId: string,
      work: (value: typeof tx) => unknown,
    ) => work(tx),
    withMediaRoom: async (_room: string, work: (value: typeof tx) => unknown) =>
      work(tx),
  } as unknown as MediaStore;
  const access = new MediaAccess(
    config,
    store,
    async () => new Response("", { status: 503 }),
  );
  await expect(
    access.setShare("player", "room", "OPPONENT", CONTROL),
  ).rejects.toThrow();
});

it("discovers a permitted unmuted provider source", async () => {
  const tx = {
    findMemberRole: async () => "SPECTATOR",
    permittedSources: async () => ["allowed"],
    generation: async () => "generation",
  };
  const store = {
    read: async (work: (value: typeof tx) => unknown) => work(tx),
  } as unknown as MediaStore;
  const fetchFn = async () =>
    new Response(
      JSON.stringify({
        participants: [
          { identity: "allowed", tracks: [{ type: "VIDEO", muted: false }] },
        ],
      }),
      { status: 200 },
    );
  const access = new MediaAccess(config, store, fetchFn as typeof fetch);
  expect(await access.sourcesFor("viewer", "room")).toEqual({
    available: true,
    generation: "generation",
  });
});

describe.skipIf(!url)("media access", () => {
  beforeEach(resetMediaSchema);
  it.each(["CASUAL", "RANKED"])("%s forbids stage sharing and spectator access", async (kind) => {
    const access = new MediaAccess(config, new MediaStore(pool), async () => new Response("{}", { status: 200 }));
    const a = await actor();
    const viewer = await actor();
    const roomId = await makeRoom(a.userId, kind as "CASUAL" | "RANKED");
    await seat(roomId, a.userId, "RED");
    await takeControl(roomId, a.userId, TAB);
    await pool.query("INSERT INTO public.room_members(room_id,user_id,role,side) VALUES($1,$2,'SPECTATOR',NULL)", [roomId, viewer.userId]);
    await expect(access.setShare(a.userId, roomId, "ALL", CONTROL)).rejects.toMatchObject({ code: "MEDIA_FORBIDDEN" });
    await access.setShare(a.userId, roomId, "NONE", CONTROL);
    expect(await access.getShare(a.userId, roomId)).toEqual({ level: "NONE" });
    await access.setShare(a.userId, roomId, "OPPONENT", CONTROL);
    const token = await access.tokenFor(a.userId, roomId, { camera: true, mic: false }, TAB);
    expect(token.stage).toBeNull();
    expect((decodeJwt(token.token).video as Record<string, unknown>).canPublish).toBe(true);
    await expect(access.tokenFor(viewer.userId, roomId, { camera: false, mic: false }, TAB)).rejects.toMatchObject({ code: "MEDIA_FORBIDDEN" });
    await expect(access.sourcesFor(viewer.userId, roomId)).rejects.toMatchObject({ code: "MEDIA_FORBIDDEN" });
    await expect(access.getShare(viewer.userId, roomId)).rejects.toMatchObject({ code: "MEDIA_FORBIDDEN" });
    await pool.query("UPDATE xiangqi_room.media_share SET level='ALL' WHERE room_id=$1 AND user_id=$2", [roomId, a.userId]);
    expect(await access.getShare(a.userId, roomId)).toEqual({ level: "OPPONENT" });
    expect((await access.tokenFor(a.userId, roomId, { camera: true, mic: false }, TAB)).stage).toBeNull();
  });
  it("issues player tokens with device-scoped publish rights", async () => {
    const access = new MediaAccess(config, new MediaStore(pool), async () => {
      throw new Error("no fetch expected");
    });
    const a = await actor();
    const roomId = await makeRoom(a.userId);
    await seat(roomId, a.userId, "RED");
    await takeControl(roomId, a.userId, TAB);
    const on = await access.tokenFor(
      a.userId,
      roomId,
      { camera: true, mic: false },
      TAB,
    );
    expect(on.roomName).toBe(privateRoomName(roomId, on.generation));
    const privateGrant = decodeJwt(on.token).video as Record<string, unknown>;
    expect(privateGrant).toMatchObject({
      room: privateRoomName(roomId, on.generation),
      canPublish: true,
      canSubscribe: true,
      canPublishData: false,
    });
    await jwtVerify(on.token, new TextEncoder().encode(config.apiSecret));
    const off = await access.tokenFor(
      a.userId,
      roomId,
      { camera: false, mic: false },
      TAB,
    );
    expect(
      (decodeJwt(off.token).video as Record<string, unknown>).canPublish,
    ).toBe(false);
    expect(on.stage).toBeNull();
  });
  it("opens the stage room only at ALL and keeps viewers publish-free", async () => {
    const access = new MediaAccess(config, new MediaStore(pool), async () => {
      return new Response("{}", { status: 200 });
    });
    const a = await actor();
    const roomId = await makeRoom(a.userId);
    await seat(roomId, a.userId, "RED");
    await takeControl(roomId, a.userId, TAB);
    await access.setShare(a.userId, roomId, "ALL", CONTROL);
    const all = await access.tokenFor(
      a.userId,
      roomId,
      { camera: true, mic: true },
      TAB,
    );
    expect(
      (decodeJwt(all.stage!.token).video as Record<string, unknown>)
        .canPublishData,
    ).toBe(false);
    expect(decodeJwt(all.stage!.token).video).toMatchObject({
      canPublish: true,
      canSubscribe: false,
    });
    expect(all.stage?.roomName).toBe(stageRoomName(roomId, all.generation));
    const b = await actor();
    await pool.query(
      "INSERT INTO public.room_members(room_id,user_id,role,side) VALUES($1,$2,'SPECTATOR',NULL)",
      [roomId, b.userId],
    );
    const view = await access.tokenFor(
      b.userId,
      roomId,
      { camera: true, mic: true },
      TAB,
    );
    expect(view.roomName).toBe(stageRoomName(roomId, view.generation));
    const grant = decodeJwt(view.token).video as Record<string, unknown>;
    expect(grant).toMatchObject({
      canPublish: false,
      canSubscribe: true,
      canPublishData: false,
    });
    expect(grant.room).not.toBe(privateRoomName(roomId, view.generation));
    await access.setShare(a.userId, roomId, "NONE", CONTROL);
    const none = await access.tokenFor(
      a.userId,
      roomId,
      { camera: true, mic: true },
      TAB,
    );
    expect(none.stage).toBeNull();
    expect(
      (decodeJwt(none.token).video as Record<string, unknown>).canPublish,
    ).toBe(false);
  });
  it("denies outsiders and non-players from sharing", async () => {
    const access = new MediaAccess(config, new MediaStore(pool), async () => {
      throw new Error("no fetch expected");
    });
    const a = await actor();
    const roomId = await makeRoom(a.userId);
    const outsider = await actor();
    await expect(
      access.tokenFor(
        outsider.userId,
        roomId,
        { camera: true, mic: true },
        TAB,
      ),
    ).rejects.toMatchObject({ code: "MEDIA_FORBIDDEN" });
    await expect(
      access.setShare(outsider.userId, roomId, "ALL", CONTROL),
    ).rejects.toMatchObject({
      code: "MEDIA_PLAYER_REQUIRED",
    });
    await expect(
      access.setShare(a.userId, roomId, "EVERYONE" as never, CONTROL),
    ).rejects.toMatchObject({ code: "MEDIA_INPUT_INVALID" });
  });
  it("refuses publish from a tab that does not hold control and moves rights on takeover", async () => {
    const access = new MediaAccess(config, new MediaStore(pool), async () => {
      throw new Error("no fetch expected");
    });
    const a = await actor();
    const roomId = await makeRoom(a.userId);
    await seat(roomId, a.userId, "RED");
    await takeControl(roomId, a.userId, TAB);
    const other = randomUUID();
    await expect(
      access.tokenFor(a.userId, roomId, { camera: true, mic: false }, other),
    ).rejects.toMatchObject({ code: "MEDIA_TAB_READ_ONLY" });
    const listen = await access.tokenFor(
      a.userId,
      roomId,
      { camera: false, mic: false },
      other,
    );
    expect(
      (decodeJwt(listen.token).video as Record<string, unknown>).canPublish,
    ).toBe(false);
    await takeControl(roomId, a.userId, other);
    await expect(
      access.tokenFor(a.userId, roomId, { camera: true, mic: false }, TAB),
    ).rejects.toMatchObject({ code: "MEDIA_TAB_READ_ONLY" });
    const on = await access.tokenFor(
      a.userId,
      roomId,
      { camera: true, mic: false },
      other,
    );
    expect(
      (decodeJwt(on.token).video as Record<string, unknown>).canPublish,
    ).toBe(true);
  });
  it("uses HTTP service URLs and room-scoped grants for both participant scopes", async () => {
    const calls: { url: string; body: string; token: string }[] = [];
    const access = new MediaAccess(config, new MediaStore(pool), (async (
      input,
      init,
    ) => {
      calls.push({
        url: String(input),
        body: String(init?.body),
        token: new Headers(init?.headers).get("Authorization") ?? "",
      });
      return { ok: true } as Response;
    }) as typeof fetch);
    const a = await actor();
    const roomId = await makeRoom(a.userId);
    const eventId = await queueRevoke(roomId, a.userId);
    await access.revoke(roomId, a.userId, eventId);
    expect(calls.map(({ url }) => url)).toEqual([
      "https://media.example.invalid/twirp/livekit.RoomService/DeleteRoom",
      "https://media.example.invalid/twirp/livekit.RoomService/DeleteRoom",
    ]);
    const oldGeneration = (
      await pool.query(
        "SELECT media_generation FROM xiangqi_room.outbox WHERE id=$1",
        [eventId],
      )
    ).rows[0].media_generation;
    for (const [index, room] of [
      privateRoomName(roomId, oldGeneration),
      stageRoomName(roomId, oldGeneration),
    ].entries()) {
      expect(JSON.parse(calls[index]!.body)).toEqual({ room });
      expect(
        decodeJwt(calls[index]!.token.slice("Bearer ".length)).video,
      ).toMatchObject({ roomCreate: true });
    }
    expect(await deliveredAt(eventId)).not.toBeNull();
  });
  it("attempts both participant scopes and propagates forbidden and transport failures", async () => {
    const a = await actor();
    const roomId = await makeRoom(a.userId);
    let call = 0;
    const forbidden = new MediaAccess(
      config,
      new MediaStore(pool),
      (async () => {
        call++;
        return {
          ok: false,
          status: 403,
          json: async () => ({ code: "permission_denied" }),
        } as Response;
      }) as typeof fetch,
    );
    const forbiddenEvent = await queueRevoke(roomId, a.userId);
    await expect(
      forbidden.revoke(roomId, a.userId, forbiddenEvent),
    ).rejects.toBeInstanceOf(AggregateError);
    expect(call).toBe(2);
    expect(await deliveredAt(forbiddenEvent)).toBeNull();
    const transport = new MediaAccess(
      config,
      new MediaStore(pool),
      (async () => {
        throw new Error("media down");
      }) as typeof fetch,
    );
    const transportEvent = await queueRevoke(roomId, a.userId);
    await expect(
      transport.revoke(roomId, a.userId, transportEvent),
    ).rejects.toThrow();
    expect(await deliveredAt(transportEvent)).toBeNull();
  });
  it("deletes both room scopes, treats not_found as idempotent, and propagates real failures", async () => {
    const calls: { url: string; body: string; grant: unknown }[] = [];
    const access = new MediaAccess(config, new MediaStore(pool), (async (
      input,
      init,
    ) => {
      calls.push({
        url: String(input),
        body: String(init?.body),
        grant: decodeJwt(
          new Headers(init?.headers)
            .get("Authorization")!
            .slice("Bearer ".length),
        ).video,
      });
      return { ok: true } as Response;
    }) as typeof fetch);
    const actorUser = await actor();
    const roomId = await makeRoom(actorUser.userId);
    const eventId = await queueRevoke(roomId, actorUser.userId);
    const generation = (
      await pool.query(
        "SELECT media_generation FROM xiangqi_room.outbox WHERE id=$1",
        [eventId],
      )
    ).rows[0].media_generation;
    await access.revokeRoom(roomId, eventId);
    expect(calls.map(({ url }) => url)).toEqual([
      "https://media.example.invalid/twirp/livekit.RoomService/DeleteRoom",
      "https://media.example.invalid/twirp/livekit.RoomService/DeleteRoom",
    ]);
    expect(calls.map(({ body }) => JSON.parse(body))).toEqual([
      { room: privateRoomName(roomId, generation) },
      { room: stageRoomName(roomId, generation) },
    ]);
    expect(calls.map(({ grant }) => grant)).toEqual([
      { roomCreate: true },
      { roomCreate: true },
    ]);
    const missing = new MediaAccess(
      config,
      new MediaStore(pool),
      (async () =>
        ({
          ok: false,
          status: 404,
          json: async () => ({ code: "not_found" }),
        }) as Response) as typeof fetch,
    );
    const missingEvent = await queueRevoke(roomId, actorUser.userId);
    await expect(
      missing.revokeRoom(roomId, missingEvent),
    ).resolves.toBeUndefined();
    const denied = new MediaAccess(
      config,
      new MediaStore(pool),
      (async () =>
        ({
          ok: false,
          status: 403,
          json: async () => ({ code: "permission_denied" }),
        }) as Response) as typeof fetch,
    );
    const deniedEvent = await queueRevoke(roomId, actorUser.userId);
    await expect(denied.revokeRoom(roomId, deniedEvent)).rejects.toThrow();
    const transport = new MediaAccess(
      config,
      new MediaStore(pool),
      (async () => {
        throw new Error("media down");
      }) as typeof fetch,
    );
    await expect(transport.revokeRoom(roomId, deniedEvent)).rejects.toThrow();
  });
  it("keeps token issuance behind a pending revoke while unrelated room work proceeds", async () => {
    const a = await actor();
    const roomId = await makeRoom(a.userId);
    const eventId = await queueRevoke(roomId, a.userId);
    const { promise: entered, resolve: enter } = deferred();
    const { promise: released, resolve: free } = deferred();
    let calls = 0;
    const access = new MediaAccess(config, new MediaStore(pool), (async () => {
      calls++;
      enter();
      await released;
      return { ok: true } as Response;
    }) as typeof fetch);
    const revoking = access.revoke(roomId, a.userId, eventId);
    await entered;
    await seat(roomId, a.userId, "RED");
    let issued = false;
    const token = access
      .tokenFor(
        a.userId.toUpperCase(),
        roomId.toUpperCase(),
        { camera: false, mic: false },
        TAB,
      )
      .then((value) => {
        issued = true;
        return value;
      });
    await waitForBlockedAdvisoryLock();
    await new MediaStore(pool).withRoom(a.userId, roomId, (tx) =>
      tx.saveShare(roomId, a.userId, "ALL"),
    );
    await pool.query("SELECT id FROM public.rooms WHERE id=$1 FOR UPDATE", [
      roomId,
    ]);
    expect(issued).toBe(false);
    free();
    await revoking;
    expect(calls).toBe(2);
    const issuedToken = await token;
    expect(issuedToken.roomName).toBe(
      privateRoomName(roomId, issuedToken.generation),
    );
    expect(issued).toBe(true);
    expect(await deliveredAt(eventId)).not.toBeNull();
  });
  it("reads media configuration strictly", () => {
    expect(readMediaConfig({})).toBeNull();
    expect(
      readMediaConfig({
        LIVEKIT_URL: "wss://media.example.invalid",
        LIVEKIT_API_KEY: "k",
        LIVEKIT_API_SECRET: "s",
      }),
    ).toMatchObject({ url: "wss://media.example.invalid" });
    expect(() =>
      readMediaConfig({
        LIVEKIT_URL: "http://plain.example.invalid",
        LIVEKIT_API_KEY: "k",
        LIVEKIT_API_SECRET: "s",
      }),
    ).toThrow();
  });
  it("defaults sharing to OPPONENT", async () => {
    const access = new MediaAccess(config, new MediaStore(pool), async () => {
      throw new Error("no fetch expected");
    });
    const a = await actor();
    const roomId = await makeRoom(a.userId);
    await seat(roomId, a.userId, "RED");
    await expect(access.getShare(a.userId, roomId)).resolves.toEqual({
      level: "OPPONENT",
    });
  });
});

describe.skipIf(!url)("media share tab isolation", () => {
  beforeEach(resetMediaSchema);
  it("rejects old or missing control without changing the persisted share", async () => {
    const access = new MediaAccess(
      config,
      new MediaStore(pool),
      async () => new Response("{}", { status: 200 }),
    );
    const a = await actor(),
      roomId = await makeRoom(a.userId);
    await seat(roomId, a.userId, "RED");
    await takeControl(roomId, a.userId, TAB);
    await access.setShare(a.userId, roomId, "ALL", CONTROL);
    const tabId = randomUUID();
    await takeControl(roomId, a.userId, tabId);
    const current = { tabId, connectionId: "test", generation: 2 };
    for (const proof of [
      undefined,
      CONTROL,
      { ...current, generation: 1 },
      { ...current, connectionId: "old-peer" },
    ]) {
      await expect(
        access.setShare(a.userId, roomId, "NONE", proof as never),
      ).rejects.toMatchObject({ code: "MEDIA_TAB_READ_ONLY" });
      expect(await access.getShare(a.userId, roomId)).toEqual({ level: "ALL" });
    }
    await access.setShare(a.userId, roomId, "OPPONENT", current);
    expect(await access.getShare(a.userId, roomId)).toEqual({
      level: "OPPONENT",
    });
    await pool.query(
      "UPDATE xiangqi_room.presence SET connected=false WHERE room_id=$1 AND user_id=$2",
      [roomId, a.userId],
    );
    await expect(
      access.setShare(a.userId, roomId, "NONE", current),
    ).rejects.toMatchObject({ code: "MEDIA_TAB_READ_ONLY" });
    expect(await access.getShare(a.userId, roomId)).toEqual({
      level: "OPPONENT",
    });
  });
});
