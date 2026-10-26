import { randomUUID } from "node:crypto";
import { decodeJwt, jwtVerify } from "jose";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { Pool } from "pg";
import { actor, apply, databaseUrl, reset } from "../room/room.test-helper.js";
import { MediaAccess } from "@server/game/media/media.service.js";
import { MediaStore } from "@server/game/media/media.store.js";
import { readMediaConfig } from "@server/game/media/media.module.js";
import {
  privateRoomName,
  stageRoomName,
} from "@server/game/media/media.types.js";
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
    "INSERT INTO public.rooms(id,owner_id,name,visibility,invite_code,time_control,viewer_limit,status,room_version) VALUES($1,$2,'Phong media','CODE_ONLY','12345678',600,5,'WAITING',1)",
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
    await apply("supabase/migrations/20261017000018_room_code_digits.sql");
    await apply("supabase/migrations/20261011000015_media_share.sql");
  });
  it("issues player tokens with device-scoped publish rights", async () => {
    const access = new MediaAccess(config, new MediaStore(pool), async () => {
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
    const access = new MediaAccess(config, new MediaStore(pool), async () => {
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
    const access = new MediaAccess(config, new MediaStore(pool), async () => {
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
    await access.revoke("room-1", "user-1");
    expect(calls.map(({ url }) => url)).toEqual([
      "https://media.example.invalid/twirp/livekit.RoomService/RemoveParticipant",
      "https://media.example.invalid/twirp/livekit.RoomService/RemoveParticipant",
    ]);
    for (const [index, room] of [
      privateRoomName("room-1"),
      stageRoomName("room-1"),
    ].entries()) {
      expect(JSON.parse(calls[index]!.body)).toEqual({
        room,
        identity: "user-1",
      });
      expect(
        decodeJwt(calls[index]!.token.slice("Bearer ".length)).video,
      ).toMatchObject({ room, roomAdmin: true });
    }
  });
  it("attempts both participant scopes and propagates forbidden and transport failures", async () => {
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
    await expect(forbidden.revoke("room-1", "user-1")).rejects.toBeInstanceOf(
      AggregateError,
    );
    expect(call).toBe(2);
    const transport = new MediaAccess(
      config,
      new MediaStore(pool),
      (async () => {
        throw new Error("media down");
      }) as typeof fetch,
    );
    await expect(transport.revoke("room-1", "user-1")).rejects.toThrow();
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
