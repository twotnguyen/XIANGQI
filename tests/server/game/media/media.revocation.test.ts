import { randomUUID } from "node:crypto";
import { decodeJwt } from "jose";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { MediaAccess } from "@server/game/media/media.service.js";
import { MediaStore } from "@server/game/media/media.store.js";
import {
  privateRoomName,
  stageRoomName,
} from "@server/game/media/media.types.js";
import {
  actor,
  config,
  deferred,
  deliveredAt,
  demoteToSpectator,
  makeRoom,
  pool,
  provider,
  queueRevoke,
  resetMediaSchema,
  seat,
  takeControl,
  url,
} from "./media.test-helper.js";

afterAll(() => pool.end());
// Tab giữ quyền điều khiển cho các lượt phát; dùng chung cho mọi test trong file.
const TAB = randomUUID();

function access(fetchFn: typeof fetch) {
  return new MediaAccess(config, new MediaStore(pool), fetchFn);
}

describe.skipIf(!url)("media revocation", () => {
  beforeEach(resetMediaSchema);
  it("drains a former player's pending revoke before a spectator token without publish rights", async () => {
    const owner = await actor();
    const player = await actor();
    const roomId = await makeRoom(owner.userId);
    await seat(roomId, player.userId, "RED");
    await takeControl(roomId, player.userId, TAB);
    const eventId = await queueRevoke(roomId, player.userId);
    await demoteToSpectator(roomId, player.userId);
    const p = provider();
    const token = await access(p.fetchFn).tokenFor(
      player.userId,
      roomId,
      { camera: true, mic: true },
      TAB,
    );
    expect(p.calls.map((call) => call.body.room)).toEqual([
      privateRoomName(roomId),
      stageRoomName(roomId),
    ]);
    expect(p.calls.every((call) => call.body.identity === player.userId)).toBe(
      true,
    );
    expect(decodeJwt(token.token).video).toMatchObject({
      room: stageRoomName(roomId),
      canPublish: false,
      canSubscribe: true,
      canPublishData: false,
    });
    expect(token.stage).toBeNull();
    expect(await deliveredAt(eventId)).not.toBeNull();
  });
  it("does not revoke a newly issued publish token when a stale event is delivered afterwards", async () => {
    const owner = await actor();
    const player = await actor();
    const roomId = await makeRoom(owner.userId);
    await seat(roomId, player.userId, "RED");
    await takeControl(roomId, player.userId, TAB);
    const eventId = await queueRevoke(roomId, player.userId);
    const p = provider();
    const media = access(p.fetchFn);
    const token = await media.tokenFor(
      player.userId,
      roomId,
      { camera: true, mic: true },
      TAB,
    );
    expect(p.calls).toHaveLength(2);
    expect(decodeJwt(token.token).video).toMatchObject({
      room: privateRoomName(roomId),
      canPublish: true,
    });
    await expect(
      media.revoke(roomId, player.userId, eventId),
    ).resolves.toBeUndefined();
    expect(p.calls).toHaveLength(2);
    expect(await deliveredAt(eventId)).not.toBeNull();
  });
  it("after takeover: old tab reconnect cannot publish, and a delayed revoke never removes the new publisher", async () => {
    const owner = await actor();
    const player = await actor();
    const roomId = await makeRoom(owner.userId);
    await seat(roomId, player.userId, "RED");
    const oldTab = TAB,
      newTab = randomUUID();
    await takeControl(roomId, player.userId, oldTab);
    // Takeover commits controller change and outbox row in one transaction.
    await takeControl(roomId, player.userId, newTab);
    const eventId = await queueRevoke(roomId, player.userId);
    const p = provider();
    const media = access(p.fetchFn);
    const fresh = await media.tokenFor(
      player.userId,
      roomId,
      { camera: true, mic: true },
      newTab,
    );
    // Delayed revoke is settled (both rooms removed) before the new token is minted.
    expect(p.calls).toHaveLength(2);
    expect(decodeJwt(fresh.token).video).toMatchObject({ canPublish: true });
    await expect(
      media.tokenFor(
        player.userId,
        roomId,
        { camera: true, mic: true },
        oldTab,
      ),
    ).rejects.toMatchObject({ code: "MEDIA_TAB_READ_ONLY" });
    const listen = await media.tokenFor(
      player.userId,
      roomId,
      { camera: false, mic: false },
      oldTab,
    );
    expect(decodeJwt(listen.token).video).toMatchObject({ canPublish: false });
    expect(p.calls).toHaveLength(2);
    await expect(
      media.revoke(roomId, player.userId, eventId),
    ).resolves.toBeUndefined();
    expect(p.calls).toHaveLength(2);
    expect(await deliveredAt(eventId)).not.toBeNull();
  });
  it("leaves the revoke pending and issues no token when provider removal fails", async () => {
    const owner = await actor();
    const user = await actor();
    const roomId = await makeRoom(owner.userId);
    const eventId = await queueRevoke(roomId, user.userId);
    await pool.query(
      "INSERT INTO public.room_members(room_id,user_id,role,side) VALUES($1,$2,'SPECTATOR',NULL)",
      [roomId, user.userId],
    );
    const failing = provider({ fail: true });
    await expect(
      access(failing.fetchFn).tokenFor(
        user.userId,
        roomId,
        { camera: false, mic: false },
        TAB,
      ),
    ).rejects.toThrow();
    expect(failing.calls).toHaveLength(2);
    expect(await deliveredAt(eventId)).toBeNull();
    const ok = provider();
    const token = await access(ok.fetchFn).tokenFor(
      user.userId,
      roomId,
      { camera: false, mic: false },
      TAB,
    );
    expect(ok.calls).toHaveLength(2);
    expect(await deliveredAt(eventId)).not.toBeNull();
    expect(decodeJwt(token.token).video).toMatchObject({
      canPublish: false,
    });
  });
  it("acknowledges only the snapshotted revoke and keeps a newer event created during provider HTTP pending", async () => {
    const owner = await actor();
    const user = await actor();
    const roomId = await makeRoom(owner.userId);
    const first = await queueRevoke(roomId, user.userId);
    const { promise: gate, resolve: release } = deferred();
    const p = provider({ gate });
    const media = access(p.fetchFn);
    const revoking = media.revoke(roomId, user.userId, first);
    await p.entered;
    const second = await queueRevoke(roomId, user.userId);
    release();
    await revoking;
    expect(p.calls).toHaveLength(2);
    expect(await deliveredAt(first)).not.toBeNull();
    expect(await deliveredAt(second)).toBeNull();
    await media.revoke(roomId, user.userId, second);
    expect(p.calls).toHaveLength(4);
    expect(await deliveredAt(second)).not.toBeNull();
  });
});
