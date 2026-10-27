import { randomUUID } from "node:crypto";
import { decodeJwt } from "jose";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { createRoomRuntime } from "@server/game/game.runtime.js";
import { MediaAccess } from "@server/game/media/media.service.js";
import { MediaStore } from "@server/game/media/media.store.js";
import { stageRoomName } from "@server/game/media/media.types.js";
import {
  apply,
  databaseUrl,
  env,
  member,
  oldRoom,
  pool,
  registration,
  reset,
  waitFor,
} from "./game.runtime.test-helper.js";

afterAll(() => pool.end());

const mediaConfig = {
  url: "wss://media.example.invalid",
  apiKey: "test-api-key",
  apiSecret: "test-api-secret-that-is-long-enough-for-hs256",
};

describe.skipIf(!databaseUrl)("Room runtime media revocation", () => {
  beforeEach(async () => {
    await reset();
    await apply("supabase/migrations/20261011000015_media_share.sql");
  });
  it("keeps media revocation unacknowledged when no real media port is integrated", async () => {
    const r = registration(),
      g = await oldRoom(r),
      runtime = await createRoomRuntime(env, r.context),
      eventId = randomUUID();
    if (!runtime) throw new Error("missing runtime");
    await pool.query(
      "INSERT INTO xiangqi_room.outbox(id,room_id,room_version,type,payload) SELECT $1,id,room_version,'media.revoke-room','{}'::jsonb FROM public.rooms WHERE id=$2",
      [eventId, g.roomId],
    );
    runtime.realtime.onAttached({
      connections: () => [],
      publishRoomClosed: async () => {},
      publishSnapshots: async () => {},
    });
    try {
      await runtime.start();
      const row = await waitFor(
        async () =>
          (
            await pool.query(
              "SELECT delivered_at,attempts FROM xiangqi_room.outbox WHERE id=$1",
              [eventId],
            )
          ).rows[0],
        (value) => value?.attempts > 0,
      );
      expect(row.delivered_at).toBeNull();
    } finally {
      await runtime.close();
    }
  });
  it("dispatches a per-user media revoke only after commit and acknowledges it after a retry", async () => {
    const r = registration(),
      g = await oldRoom(r),
      departed = await member(r),
      eventId = randomUUID(),
      media = {
        revoke: vi
          .fn()
          .mockRejectedValueOnce(new Error("synthetic provider outage"))
          .mockResolvedValue(undefined),
        revokeRoom: vi.fn().mockResolvedValue(undefined),
      },
      runtime = await createRoomRuntime(env, r.context, media);
    if (!runtime) throw new Error("missing runtime");
    await pool.query(
      "INSERT INTO xiangqi_room.outbox(id,room_id,room_version,type,payload) SELECT $1,id,room_version,'media.revoke-user',$3::jsonb FROM public.rooms WHERE id=$2",
      [eventId, g.roomId, JSON.stringify({ userId: departed.id })],
    );
    runtime.realtime.onAttached({
      connections: () => [],
      publishRoomClosed: async () => {},
      publishSnapshots: async () => {},
    });
    try {
      await runtime.start();
      await waitFor(
        async () =>
          (
            await pool.query(
              "SELECT attempts FROM xiangqi_room.outbox WHERE id=$1",
              [eventId],
            )
          ).rows[0],
        (value) => value?.attempts > 0,
      );
      await pool.query(
        "UPDATE xiangqi_room.outbox SET next_attempt_at=clock_timestamp()-interval '1 second' WHERE id=$1",
        [eventId],
      );
      const row = await waitFor(
        async () =>
          (
            await pool.query(
              "SELECT delivered_at FROM xiangqi_room.outbox WHERE id=$1",
              [eventId],
            )
          ).rows[0],
        (value) => value?.delivered_at != null,
      );
      expect(row.delivered_at).not.toBeNull();
      expect(media.revoke).toHaveBeenCalledTimes(2);
      expect(media.revoke).toHaveBeenLastCalledWith(
        g.roomId,
        departed.id,
        eventId,
      );
      expect(media.revokeRoom).not.toHaveBeenCalled();
    } finally {
      await runtime.close();
    }
  }, 15000);
  it("drains a queued revoke before a rejoined spectator token and does not dispatch it again", async () => {
    const r = registration(),
      g = await oldRoom(r),
      former = await member(r),
      other = await member(r),
      eventId = randomUUID(),
      sentinelId = randomUUID(),
      provider = vi.fn().mockResolvedValue({ ok: true } as Response),
      media = new MediaAccess(
        mediaConfig,
        new MediaStore(pool),
        provider as unknown as typeof fetch,
      ),
      runtime = await createRoomRuntime(env, r.context, media);
    if (!runtime) throw new Error("missing runtime");
    await pool.query(
      "INSERT INTO xiangqi_room.outbox(id,room_id,room_version,type,payload) SELECT $1,id,(SELECT COALESCE(max(o.room_version),0)+1 FROM xiangqi_room.outbox o WHERE o.room_id=$2),'media.revoke-user',$3::jsonb FROM public.rooms WHERE id=$2",
      [eventId, g.roomId, JSON.stringify({ userId: former.id })],
    );
    await pool.query(
      "INSERT INTO public.room_members(room_id,user_id,role,side) VALUES($1,$2,'SPECTATOR',NULL)",
      [g.roomId, former.id],
    );
    const token = await media.tokenFor(former.id, g.roomId, {
      camera: true,
      mic: true,
    });
    expect(decodeJwt(token.token).video).toMatchObject({
      room: stageRoomName(g.roomId),
      canPublish: false,
    });
    expect(provider).toHaveBeenCalledTimes(2);
    runtime.realtime.onAttached({
      connections: () => [],
      publishRoomClosed: async () => {},
      publishSnapshots: async () => {},
    });
    try {
      // Sự kiện đã ack không được dispatch lại; sentinel chứng minh runtime đã quét sau đó.
      await pool.query(
        "INSERT INTO public.room_members(room_id,user_id,role,side) VALUES($1,$2,'SPECTATOR',NULL)",
        [g.roomId, other.id],
      );
      await pool.query(
        "INSERT INTO xiangqi_room.outbox(id,room_id,room_version,type,payload) SELECT $1,id,(SELECT COALESCE(max(o.room_version),0)+1 FROM xiangqi_room.outbox o WHERE o.room_id=$2),'media.revoke-user',$3::jsonb FROM public.rooms WHERE id=$2",
        [sentinelId, g.roomId, JSON.stringify({ userId: other.id })],
      );
      await runtime.start();
      await waitFor(
        async () =>
          (
            await pool.query(
              "SELECT delivered_at FROM xiangqi_room.outbox WHERE id=$1",
              [sentinelId],
            )
          ).rows[0],
        (value) => value?.delivered_at != null,
      );
      expect(
        provider.mock.calls.map(
          ([, init]) => JSON.parse(String((init as RequestInit).body)).identity,
        ),
      ).toEqual([former.id, former.id, other.id, other.id]);
    } finally {
      await runtime.close();
    }
  }, 15000);
  it("does not dispatch a per-user media revoke that is not yet committed", async () => {
    const r = registration(),
      g = await oldRoom(r),
      sentinel = await oldRoom(r),
      departed = await member(r),
      eventId = randomUUID(),
      sentinelId = randomUUID(),
      media = {
        revoke: vi.fn().mockResolvedValue(undefined),
        revokeRoom: vi.fn().mockResolvedValue(undefined),
      },
      runtime = await createRoomRuntime(env, r.context, media);
    if (!runtime) throw new Error("missing runtime");
    const client = await pool.connect();
    runtime.realtime.onAttached({
      connections: () => [],
      publishRoomClosed: async () => {},
      publishSnapshots: async () => {},
    });
    try {
      await client.query("BEGIN");
      await client.query(
        "INSERT INTO xiangqi_room.outbox(id,room_id,room_version,type,payload) SELECT $1,id,room_version,'media.revoke-user',$3::jsonb FROM public.rooms WHERE id=$2",
        [eventId, g.roomId, JSON.stringify({ userId: departed.id })],
      );
      await runtime.start();
      // Sự kiện đã commit ở phòng khác chứng minh có ít nhất một lượt quét diễn ra khi sự kiện chưa commit đang chờ.
      await pool.query(
        "INSERT INTO xiangqi_room.outbox(id,room_id,room_version,type,payload) SELECT $1,id,room_version,'media.revoke-user',$3::jsonb FROM public.rooms WHERE id=$2",
        [sentinelId, sentinel.roomId, JSON.stringify({ userId: departed.id })],
      );
      await waitFor(
        async () =>
          (
            await pool.query(
              "SELECT delivered_at FROM xiangqi_room.outbox WHERE id=$1",
              [sentinelId],
            )
          ).rows[0],
        (value) => value?.delivered_at != null,
      );
      expect(media.revoke).not.toHaveBeenCalledWith(
        g.roomId,
        departed.id,
        eventId,
      );
      await client.query("ROLLBACK");
      expect(
        (
          await pool.query(
            "SELECT count(*)::int AS n FROM xiangqi_room.outbox WHERE id=$1",
            [eventId],
          )
        ).rows[0].n,
      ).toBe(0);
      expect(media.revoke).toHaveBeenCalledTimes(1);
      expect(media.revoke).toHaveBeenCalledWith(
        sentinel.roomId,
        departed.id,
        sentinelId,
      );
    } finally {
      await client.query("ROLLBACK").catch(() => {});
      client.release();
      await runtime.close();
    }
  }, 15000);
});
