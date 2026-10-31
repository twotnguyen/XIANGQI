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

describe.skipIf(!url)("media access", () => {
  beforeEach(resetMediaSchema);
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
    expect(on.roomName).toBe(privateRoomName(roomId));
    const privateGrant = decodeJwt(on.token).video as Record<string, unknown>;
    expect(privateGrant).toMatchObject({
      room: privateRoomName(roomId),
      canPublish: true,
      canSubscribe: true,
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
      throw new Error("no fetch expected");
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
    expect(all.stage?.roomName).toBe(stageRoomName(roomId));
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
    expect(view.roomName).toBe(stageRoomName(roomId));
    const grant = decodeJwt(view.token).video as Record<string, unknown>;
    expect(grant).toMatchObject({
      canPublish: false,
      canSubscribe: true,
      canPublishData: false,
    });
    expect(grant.room).not.toBe(privateRoomName(roomId));
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
      "https://media.example.invalid/twirp/livekit.RoomService/RemoveParticipant",
      "https://media.example.invalid/twirp/livekit.RoomService/RemoveParticipant",
    ]);
    for (const [index, room] of [
      privateRoomName(roomId),
      stageRoomName(roomId),
    ].entries()) {
      expect(JSON.parse(calls[index]!.body)).toEqual({
        room,
        identity: a.userId,
      });
      expect(
        decodeJwt(calls[index]!.token.slice("Bearer ".length)).video,
      ).toMatchObject({ room, roomAdmin: true });
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
    await access.revokeRoom("room-2");
    expect(calls.map(({ url }) => url)).toEqual([
      "https://media.example.invalid/twirp/livekit.RoomService/DeleteRoom",
      "https://media.example.invalid/twirp/livekit.RoomService/DeleteRoom",
    ]);
    expect(calls.map(({ body }) => JSON.parse(body))).toEqual([
      { room: privateRoomName("room-2") },
      { room: stageRoomName("room-2") },
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
    await expect(missing.revokeRoom("room-2")).resolves.toBeUndefined();
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
    await expect(denied.revokeRoom("room-2")).rejects.toThrow();
    const transport = new MediaAccess(
      config,
      new MediaStore(pool),
      (async () => {
        throw new Error("media down");
      }) as typeof fetch,
    );
    await expect(transport.revokeRoom("room-2")).rejects.toThrow();
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
    await new MediaStore(pool).withUser(a.userId, (tx) =>
      tx.saveShare(roomId, a.userId, "ALL"),
    );
    await pool.query("SELECT id FROM public.rooms WHERE id=$1 FOR UPDATE", [
      roomId,
    ]);
    expect(issued).toBe(false);
    free();
    await revoking;
    expect(calls).toBe(2);
    expect((await token).roomName).toBe(privateRoomName(roomId));
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
    const access = new MediaAccess(config, new MediaStore(pool));
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
