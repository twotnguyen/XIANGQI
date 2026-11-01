import { randomUUID } from "node:crypto";
import { decodeJwt } from "jose";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { MediaAccess } from "@server/game/media/media.service.js";
import { MediaStore } from "@server/game/media/media.store.js";
import {
  privateRoomName,
  stageRoomName,
} from "@server/game/media/media.types.js";
import { apply } from "../room/room.test-helper.js";
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
  it("rotates atomically and fences every pending generation before another member receives a token", async () => {
    const owner = await actor();
    const player = await actor();
    const roomId = await makeRoom(owner.userId);
    await seat(roomId, player.userId, "RED");
    await takeControl(roomId, player.userId, TAB);
    const p = provider();
    const media = access(p.fetchFn);
    const before = await media.tokenFor(
      player.userId,
      roomId,
      { camera: true, mic: false },
      TAB,
    );
    const event = await queueRevoke(roomId, owner.userId);
    const after = await media.tokenFor(
      player.userId,
      roomId,
      { camera: true, mic: false },
      TAB,
    );
    expect(after.generation).not.toBe(before.generation);
    expect(after.roomName).not.toBe(before.roomName);
    expect(p.calls.map((call) => call.body.room)).toEqual([
      privateRoomName(roomId, before.generation),
      stageRoomName(roomId, before.generation),
    ]);
    expect(await deliveredAt(event)).not.toBeNull();
    await media.revoke(roomId, owner.userId, event);
    expect(p.calls).toHaveLength(2);
  });
  it("rolls back the generation rotation with the revoke event", async () => {
    const owner = await actor(),
      roomId = await makeRoom(owner.userId);
    const before = (
      await pool.query(
        "SELECT media_generation FROM public.rooms WHERE id=$1",
        [roomId],
      )
    ).rows[0].media_generation;
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        "INSERT INTO xiangqi_room.outbox(id,room_id,room_version,type,payload) VALUES($1,$2,100,'media.revoke-user',$3)",
        [randomUUID(), roomId, { userId: owner.userId }],
      );
      const during = (
        await client.query(
          "SELECT media_generation FROM public.rooms WHERE id=$1",
          [roomId],
        )
      ).rows[0].media_generation;
      expect(during).not.toBe(before);
      await client.query("ROLLBACK");
    } finally {
      client.release();
    }
    expect(
      (
        await pool.query(
          "SELECT media_generation FROM public.rooms WHERE id=$1",
          [roomId],
        )
      ).rows[0].media_generation,
    ).toBe(before);
  });
  it("refuses rollback while rooms are active or media revocations remain pending", async () => {
    const owner = await actor(),
      roomId = await makeRoom(owner.userId);
    const before = (
      await pool.query(
        "SELECT media_generation FROM public.rooms WHERE id=$1",
        [roomId],
      )
    ).rows[0].media_generation;
    await expect(
      apply("supabase/rollback/20261103000010_media_generation.sql"),
    ).rejects.toThrow(/Close rooms/);
    expect(
      (
        await pool.query(
          "SELECT media_generation FROM public.rooms WHERE id=$1",
          [roomId],
        )
      ).rows[0].media_generation,
    ).toBe(before);
    const eventId = await queueRevoke(roomId, owner.userId);
    await pool.query(
      "UPDATE public.rooms SET closed_at=clock_timestamp(),status='CLOSED' WHERE id=$1",
      [roomId],
    );
    await expect(
      apply("supabase/rollback/20261103000010_media_generation.sql"),
    ).rejects.toThrow(/Close rooms/);
    await access(provider().fetchFn).revoke(roomId, owner.userId, eventId);
    await apply("supabase/rollback/20261103000010_media_generation.sql");
    expect(
      (await pool.query("SELECT id FROM public.rooms WHERE id=$1", [roomId]))
        .rows,
    ).toEqual([{ id: roomId }]);
  });

  it("migration queues legacy cleanup for rooms that already exist", async () => {
    await apply("supabase/rollback/20261103000010_media_generation.sql");
    const owner = await actor(),
      roomId = await makeRoom(owner.userId);
    await seat(roomId, owner.userId, "RED");
    await takeControl(roomId, owner.userId, TAB);
    await apply("supabase/migrations/20261103000010_media_generation.sql");
    const p = provider(),
      media = access(p.fetchFn);
    const token = await media.tokenFor(
      owner.userId,
      roomId,
      { camera: false, mic: false },
      TAB,
    );
    expect(p.calls.map((call) => call.body.room)).toEqual([
      `xiangqi-${roomId}`,
      `xiangqi-${roomId}-stage`,
    ]);
    expect(token.generation).toMatch(/^[0-9a-f-]{36}$/);
  });
  it("migration skips closed rooms whose legacy invite code predates the digit check", async () => {
    await apply("supabase/rollback/20261103000010_media_generation.sql");
    const owner = await actor(),
      roomId = await makeRoom(owner.userId);
    const c = await pool.connect();
    try {
      await c.query("BEGIN");
      await c.query("SET LOCAL session_replication_role = replica");
      await c.query("ALTER TABLE public.rooms DROP CONSTRAINT rooms_invite_code_check");
      await c.query(
        "UPDATE public.rooms SET status='CLOSED', closed_at=now(), invite_code='38PP2YM8' WHERE id=$1",
        [roomId],
      );
      await c.query(
        "ALTER TABLE public.rooms ADD CONSTRAINT rooms_invite_code_check CHECK(invite_code IS NULL OR invite_code ~ '^[0-9]{8}$') NOT VALID",
      );
      await c.query("COMMIT");
    } catch (error) {
      await c.query("ROLLBACK");
      throw error;
    } finally {
      c.release();
    }
    await apply("supabase/migrations/20261103000010_media_generation.sql");
    expect(
      (
        await pool.query("SELECT invite_code FROM public.rooms WHERE id=$1", [
          roomId,
        ])
      ).rows[0].invite_code,
    ).toBe("38PP2YM8");
  });
  it("settles a revoke committed during provider I/O before issuing the new generation", async () => {
    const owner = await actor(),
      player = await actor();
    const roomId = await makeRoom(owner.userId);
    await seat(roomId, player.userId, "RED");
    await takeControl(roomId, player.userId, TAB);
    const first = await queueRevoke(roomId, owner.userId);
    const { promise: gate, resolve: release } = deferred();
    const p = provider({ gate });
    const media = access(p.fetchFn);
    const issuing = media.tokenFor(
      player.userId,
      roomId,
      { camera: true, mic: false },
      TAB,
    );
    await p.entered;
    const second = await queueRevoke(roomId, player.userId);
    release();
    const token = await issuing;
    const generations = (
      await pool.query(
        "SELECT media_generation FROM xiangqi_room.outbox WHERE id=ANY($1::uuid[])",
        [[first, second]],
      )
    ).rows.map((row) => row.media_generation);
    expect(generations).not.toContain(token.generation);
    expect(await deliveredAt(first)).not.toBeNull();
    expect(await deliveredAt(second)).not.toBeNull();
    expect(p.calls.map((call) => call.body.room)).not.toContain(token.roomName);
  });
  it("cleans legacy fixed rooms without deleting the current generation", async () => {
    const owner = await actor(),
      roomId = await makeRoom(owner.userId);
    await seat(roomId, owner.userId, "RED");
    await takeControl(roomId, owner.userId, TAB);
    const event = await queueRevoke(roomId, owner.userId);
    await pool.query(
      "UPDATE xiangqi_room.outbox SET media_generation=NULL WHERE id=$1",
      [event],
    );
    const p = provider(),
      media = access(p.fetchFn);
    const token = await media.tokenFor(
      owner.userId,
      roomId,
      { camera: true, mic: false },
      TAB,
    );
    expect(p.calls.map((call) => call.body.room)).toEqual([
      `xiangqi-${roomId}`,
      `xiangqi-${roomId}-stage`,
    ]);
    expect(p.calls.map((call) => call.body.room)).not.toContain(token.roomName);
  });
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
    const oldGeneration = (
      await pool.query(
        "SELECT media_generation FROM xiangqi_room.outbox WHERE id=$1",
        [eventId],
      )
    ).rows[0].media_generation;
    expect(p.calls.map((call) => call.body.room)).toEqual([
      privateRoomName(roomId, oldGeneration),
      stageRoomName(roomId, oldGeneration),
    ]);
    expect(decodeJwt(token.token).video).toMatchObject({
      room: stageRoomName(roomId, token.generation),
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
      room: privateRoomName(roomId, token.generation),
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
