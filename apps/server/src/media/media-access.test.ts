import { randomUUID } from "node:crypto";
import { decodeJwt, jwtVerify } from "jose";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { Pool } from "pg";
import { actor, apply, databaseUrl, reset } from "../room/room.test-helper.js";
import { MediaAccess } from "./media-access.js";
import { readMediaConfig } from "../media-runtime.js";
import { privateRoomName, stageRoomName } from "./contracts.js";
const url = process.env.ROOM_TEST_DATABASE_URL ?? databaseUrl;
const pool = new Pool({ connectionString: url });
afterAll(() => pool.end());
const config = {
  url: "wss://media.example.invalid",
  apiKey: "test-api-key",
  apiSecret: "test-api-secret-that-is-long-enough-for-hs256",
};
async function seat(roomId: string, userId: string, side: string) {
  await pool.query("BEGIN");
  await pool.query(
    "INSERT INTO public.room_members(room_id,user_id,role,side) VALUES($1,$2,'PLAYER',$3)",
    [roomId, userId, side],
  );
  await pool.query(
    "INSERT INTO public.active_players(user_id,room_id,match_id) VALUES($1,$2,NULL)",
    [userId, roomId],
  );
  await pool.query("COMMIT");
}
async function makeRoom(owner: string) {
  const roomId = randomUUID();
  await pool.query(
    "INSERT INTO public.rooms(id,owner_id,name,visibility,invite_code,time_control,viewer_limit,status,room_version) VALUES($1,$2,'Phong media','CODE_ONLY','ABCDEFGH',600,5,'WAITING',1)",
    [roomId, owner],
  );
  return roomId;
}
describe.skipIf(!url)("media access", () => {
  beforeEach(async () => {
    await pool.query(
      "DROP SCHEMA IF EXISTS xiangqi_chat CASCADE; DROP SCHEMA IF EXISTS xiangqi_ai CASCADE; DROP SCHEMA IF EXISTS xiangqi_social CASCADE",
    );
    await reset();
    await apply("supabase/migrations/20261011000006_rooms.sql");
    await apply("supabase/migrations/20261011000015_media_share.sql");
  });
  it("issues player tokens with device-scoped publish rights", async () => {
    const access = new MediaAccess(config, pool, async () => {
      throw new Error("no fetch expected");
    });
    const a = await actor();
    const roomId = await makeRoom(a.userId);
    await seat(roomId, a.userId, "RED");
    const on = await access.tokenFor(a.userId, roomId, {
      camera: true,
      mic: false,
    });
    expect(on.roomName).toBe(privateRoomName(roomId));
    const privateGrant = decodeJwt(on.token).video as Record<string, unknown>;
    expect(privateGrant).toMatchObject({
      room: privateRoomName(roomId),
      canPublish: true,
      canSubscribe: true,
    });
    await jwtVerify(on.token, new TextEncoder().encode(config.apiSecret));
    const off = await access.tokenFor(a.userId, roomId, {
      camera: false,
      mic: false,
    });
    expect(
      (decodeJwt(off.token).video as Record<string, unknown>).canPublish,
    ).toBe(false);
    expect(on.stage).toBeNull();
  });
  it("opens the stage room only at ALL and keeps viewers publish-free", async () => {
    const access = new MediaAccess(config, pool, async () => {
      throw new Error("no fetch expected");
    });
    const a = await actor();
    const roomId = await makeRoom(a.userId);
    await seat(roomId, a.userId, "RED");
    await access.setShare(a.userId, roomId, "ALL");
    const all = await access.tokenFor(a.userId, roomId, {
      camera: true,
      mic: true,
    });
    expect(all.stage?.roomName).toBe(stageRoomName(roomId));
    const b = await actor();
    await pool.query(
      "INSERT INTO public.room_members(room_id,user_id,role,side) VALUES($1,$2,'SPECTATOR',NULL)",
      [roomId, b.userId],
    );
    const view = await access.tokenFor(b.userId, roomId, {
      camera: true,
      mic: true,
    });
    expect(view.roomName).toBe(stageRoomName(roomId));
    const grant = decodeJwt(view.token).video as Record<string, unknown>;
    expect(grant).toMatchObject({
      canPublish: false,
      canSubscribe: true,
      canPublishData: false,
    });
    expect(grant.room).not.toBe(privateRoomName(roomId));
    await access.setShare(a.userId, roomId, "NONE");
    const none = await access.tokenFor(a.userId, roomId, {
      camera: true,
      mic: true,
    });
    expect(none.stage).toBeNull();
    expect(
      (decodeJwt(none.token).video as Record<string, unknown>).canPublish,
    ).toBe(false);
  });
  it("denies outsiders and non-players from sharing", async () => {
    const access = new MediaAccess(config, pool, async () => {
      throw new Error("no fetch expected");
    });
    const a = await actor();
    const roomId = await makeRoom(a.userId);
    const outsider = await actor();
    await expect(
      access.tokenFor(outsider.userId, roomId, { camera: true, mic: true }),
    ).rejects.toMatchObject({ code: "MEDIA_FORBIDDEN" });
    await expect(
      access.setShare(outsider.userId, roomId, "ALL"),
    ).rejects.toMatchObject({
      code: "MEDIA_PLAYER_REQUIRED",
    });
    await expect(
      access.setShare(a.userId, roomId, "EVERYONE" as never),
    ).rejects.toMatchObject({ code: "MEDIA_INPUT_INVALID" });
  });
  it("revokes both rooms and never rejects on service outage", async () => {
    const calls: string[] = [];
    const access = new MediaAccess(config, pool, (async (
      url: string | URL | Request,
    ) => {
      calls.push(String(url));
      return { ok: true } as Response;
    }) as typeof fetch);
    await access.revoke("room-1", "user-1");
    expect(calls).toEqual([
      `${config.url}/twirp/livekit.RoomService/RemoveParticipant`,
      `${config.url}/twirp/livekit.RoomService/RemoveParticipant`,
    ]);
    const failing = new MediaAccess(config, pool, (async () => {
      throw new Error("media down");
    }) as typeof fetch);
    await expect(failing.revoke("room-1", "user-1")).resolves.toBeUndefined();
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
    const access = new MediaAccess(config, pool, async () => {
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
