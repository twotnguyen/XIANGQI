import { randomUUID } from "node:crypto";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { databaseUrl, pool } from "./room.test-helper.js";
import {
  admitted,
  fullRoom,
  migrateViewers,
  reserveAi,
  run,
  store,
} from "./room-viewers.test-helper.js";
afterAll(() => pool.end());
describe.skipIf(!databaseUrl)("room viewers", () => {
  beforeEach(migrateViewers);
  it("moves a non-host player to spectator and back via host invite", async () => {
    const { h, b, roomId } = await fullRoom();
    await expect(
      run(h.a, h.proof, [roomId], (s) => store.toSpectator(s, roomId)),
    ).rejects.toMatchObject({ code: "HOST_STAYS" });
    const moved = await run(b.a, b.proof, [roomId], (s) =>
      store.toSpectator(s, roomId),
    );
    expect(moved.room.seats).toEqual({ red: h.a.userId, black: null });
    expect(moved.room.downOffer).toBeNull();
    const invite = await run(h.a, h.proof, [roomId], (s) =>
      store.inviteDown(s, roomId, b.a.userId),
    );
    const back = await run(b.a, b.proof, [roomId], (s) =>
      store.respondDown(s, roomId, invite.room.downOffer!.id, true),
    );
    expect(back.room.seats).toEqual({ red: h.a.userId, black: b.a.userId });
    expect(back.room.ready).toEqual({ red: false, black: false });
    expect(back.room.downOffer).toBeNull();
  });
  it("host moves the other player and declines expire", async () => {
    const { h, b, roomId } = await fullRoom();
    const moved = await run(h.a, h.proof, [roomId], (s) =>
      store.moveToSpectator(s, roomId, b.a.userId),
    );
    expect(moved.room.seats).toEqual({ red: h.a.userId, black: null });
    await expect(
      run(b.a, b.proof, [roomId], (s) =>
        store.moveToSpectator(s, roomId, h.a.userId),
      ),
    ).rejects.toMatchObject({ code: "SEAT_MOVE_DENIED" });
    const invite = await run(h.a, h.proof, [roomId], (s) =>
      store.inviteDown(s, roomId, b.a.userId),
    );
    const declined = await run(b.a, b.proof, [roomId], (s) =>
      store.respondDown(s, roomId, invite.room.downOffer!.id, false),
    );
    expect(declined.room.downOffer).toBeNull();
    expect(declined.room.seats).toEqual({ red: h.a.userId, black: null });
  });
  it.each(["self", "host"] as const)(
    "%s demotion queues a durable revoke for the former player",
    async (action) => {
      const { h, b, roomId } = await fullRoom();
      const moved =
        action === "self"
          ? await run(b.a, b.proof, [roomId], (s) =>
              store.toSpectator(s, roomId),
            )
          : await run(h.a, h.proof, [roomId], (s) =>
              store.moveToSpectator(s, roomId, b.a.userId),
            );
      const rows = (
        await pool.query(
          "SELECT type,room_version::float8 AS version,payload,delivered_at FROM xiangqi_room.outbox WHERE room_id=$1 AND type IN('room.seats-changed','media.revoke-user')",
          [roomId],
        )
      ).rows;
      expect(rows.filter((row) => row.type === "media.revoke-user")).toEqual([
        expect.objectContaining({
          version: moved.version,
          payload: { userId: b.a.userId },
          delivered_at: null,
        }),
      ]);
      expect(
        rows.find((row) => row.type === "room.seats-changed"),
      ).toMatchObject({ version: moved.version });
      const pending = await run(h.a, h.proof, [roomId], (s) =>
        store.pendingEvents(s.client),
      );
      expect(pending.map((event) => event.type)).not.toContain(
        "media.revoke-user",
      );
      expect(moved.room.seats.black).toBeNull();
      expect(
        moved.room.spectators?.some((person) => person.userId === b.a.userId),
      ).toBe(true);
    },
  );
  it.each(["self", "host"] as const)(
    "%s demotion rolls back if its media revoke cannot be stored",
    async (action) => {
      const { h, b, roomId } = await fullRoom();
      await pool.query(
        "CREATE FUNCTION public.fail_demotion_revoke() RETURNS trigger LANGUAGE plpgsql AS $$BEGIN IF NEW.type='media.revoke-user' THEN RAISE EXCEPTION 'synthetic demotion revoke failure'; END IF; RETURN NEW; END$$; CREATE TRIGGER fail_demotion_revoke BEFORE INSERT ON xiangqi_room.outbox FOR EACH ROW EXECUTE FUNCTION public.fail_demotion_revoke()",
      );
      try {
        await expect(
          action === "self"
            ? run(b.a, b.proof, [roomId], (s) => store.toSpectator(s, roomId))
            : run(h.a, h.proof, [roomId], (s) =>
                store.moveToSpectator(s, roomId, b.a.userId),
              ),
        ).rejects.toThrow("synthetic demotion revoke failure");
      } finally {
        await pool.query(
          "DROP TRIGGER fail_demotion_revoke ON xiangqi_room.outbox; DROP FUNCTION public.fail_demotion_revoke()",
        );
      }
      expect(
        (
          await pool.query(
            "SELECT role,side FROM public.room_members WHERE room_id=$1 AND user_id=$2",
            [roomId, b.a.userId],
          )
        ).rows[0],
      ).toEqual({ role: "PLAYER", side: "BLACK" });
      expect(
        (
          await pool.query(
            "SELECT room_id FROM public.active_players WHERE user_id=$1",
            [b.a.userId],
          )
        ).rows[0].room_id,
      ).toBe(roomId);
      expect(
        (
          await pool.query(
            "SELECT count(*)::int AS n FROM xiangqi_room.outbox WHERE room_id=$1 AND type='media.revoke-user'",
            [roomId],
          )
        ).rows[0].n,
      ).toBe(0);
    },
  );
  it("does not invite an audience member who already holds a real AI reservation", async () => {
    const { h, b, w, roomId } = await fullRoom();
    await run(b.a, b.proof, [roomId], (s) => store.toSpectator(s, roomId));
    const gameId = await reserveAi(w, roomId);
    await expect(
      run(h.a, h.proof, [roomId], (s) =>
        store.inviteDown(s, roomId, w.a.userId),
      ),
    ).rejects.toMatchObject({ code: "FRIEND_BUSY", status: 409 });
    expect(
      (
        await pool.query(
          "SELECT count(*)::int AS n FROM xiangqi_room.seat_invites WHERE room_id=$1",
          [roomId],
        )
      ).rows[0].n,
    ).toBe(0);
    expect(
      (
        await pool.query(
          "SELECT room_id,ai_game_id FROM public.active_players WHERE user_id=$1",
          [w.a.userId],
        )
      ).rows[0],
    ).toMatchObject({ room_id: null, ai_game_id: gameId });
  });
  it("rejects accepting a seat after an AI game reserves the invitee's position", async () => {
    const { h, b, w, roomId } = await fullRoom();
    await run(b.a, b.proof, [roomId], (s) => store.toSpectator(s, roomId));
    const invite = await run(h.a, h.proof, [roomId], (s) =>
      store.inviteDown(s, roomId, w.a.userId),
    );
    const gameId = await reserveAi(w, roomId);
    await expect(
      run(w.a, w.proof, [roomId], (s) =>
        store.respondDown(s, roomId, invite.room.downOffer!.id, true),
      ),
    ).rejects.toMatchObject({ code: "ALREADY_SEATED", status: 409 });
    const state = await run(h.a, h.proof, [roomId], (s) =>
      store.snapshot(s, roomId),
    );
    expect(state.room.seats.black).toBeNull();
    expect(state.room.countdown).toBeNull();
    expect(
      state.room.spectators?.some((person) => person.userId === w.a.userId),
    ).toBe(true);
    expect(
      (
        await pool.query(
          "SELECT room_id,ai_game_id FROM public.active_players WHERE user_id=$1",
          [w.a.userId],
        )
      ).rows[0],
    ).toMatchObject({ room_id: null, ai_game_id: gameId });
  });
  it("kicks a viewer and blocks re-entry until close", async () => {
    const { h, b, w, roomId } = await fullRoom();
    await expect(
      run(w.a, w.proof, [roomId], (s) =>
        store.kickViewer(s, roomId, b.a.userId),
      ),
    ).rejects.toMatchObject({ code: "KICK_DENIED" });
    const kicked = await run(b.a, b.proof, [roomId], (s) =>
      store.kickViewer(s, roomId, w.a.userId),
    );
    expect(kicked.room.seats).toEqual({ red: h.a.userId, black: b.a.userId });
    await expect(
      run(w.a, w.proof, [roomId], (s) =>
        store.join(s, { commandId: randomUUID(), roomId, intent: "watch" }),
      ),
    ).rejects.toMatchObject({ code: "ROOM_BLOCKED" });
    await expect(
      run(w.a, w.proof, [roomId], (s) =>
        store.join(s, { commandId: randomUUID(), roomId, intent: "auto" }),
      ),
    ).rejects.toMatchObject({ code: "ROOM_BLOCKED" });
  });
  it("kick queues a per-user media revoke with the kick version, kept out of generic delivery", async () => {
    const { h, b, w, roomId } = await fullRoom();
    await run(b.a, b.proof, [roomId], (s) =>
      store.kickViewer(s, roomId, w.a.userId),
    );
    const rows = (
      await pool.query(
        "SELECT type,room_version::float8 AS version,payload FROM xiangqi_room.outbox WHERE room_id=$1 AND type IN ('room.viewer-kicked','media.revoke-user')",
        [roomId],
      )
    ).rows;
    // Cả hai sự kiện cùng giao dịch nên không có thứ tự ghi nhận đáng tin; chỉ kiểm tra tập sự kiện và nội dung.
    expect(rows.map((r) => r.type).sort()).toEqual([
      "media.revoke-user",
      "room.viewer-kicked",
    ]);
    const kick = rows.find((r) => r.type === "room.viewer-kicked")!;
    const revoke = rows.find((r) => r.type === "media.revoke-user")!;
    expect(revoke).toMatchObject({
      version: kick.version,
      payload: { userId: w.a.userId },
    });
    const pending = await run(h.a, h.proof, [roomId], (s) =>
      store.pendingEvents(s.client),
    );
    expect(pending.map((e) => e.type)).toContain("room.viewer-kicked");
    expect(pending.map((e) => e.type)).not.toContain("media.revoke-user");
  });
  it("rolls the kick back when its media revoke event cannot be stored", async () => {
    const { b, w, roomId } = await fullRoom();
    await pool.query(
      "CREATE FUNCTION public.fail_media_revoke_outbox() RETURNS trigger LANGUAGE plpgsql AS $$BEGIN IF NEW.type='media.revoke-user' THEN RAISE EXCEPTION 'synthetic media outbox failure'; END IF; RETURN NEW; END$$; CREATE TRIGGER fail_media_revoke_outbox BEFORE INSERT ON xiangqi_room.outbox FOR EACH ROW EXECUTE FUNCTION public.fail_media_revoke_outbox()",
    );
    try {
      await expect(
        run(b.a, b.proof, [roomId], (s) =>
          store.kickViewer(s, roomId, w.a.userId),
        ),
      ).rejects.toThrow("synthetic media outbox failure");
    } finally {
      await pool.query(
        "DROP TRIGGER fail_media_revoke_outbox ON xiangqi_room.outbox; DROP FUNCTION public.fail_media_revoke_outbox()",
      );
    }
    expect(
      (
        await pool.query(
          "SELECT count(*)::int AS n FROM public.room_members WHERE room_id=$1 AND user_id=$2",
          [roomId, w.a.userId],
        )
      ).rows[0].n,
    ).toBe(1);
    expect(
      (
        await pool.query(
          "SELECT count(*)::int AS n FROM xiangqi_room.room_blocks WHERE room_id=$1 AND user_id=$2",
          [roomId, w.a.userId],
        )
      ).rows[0].n,
    ).toBe(0);
  });
  it("spectator leave queues a per-user media revoke in the membership transaction", async () => {
    const { w, roomId } = await fullRoom();
    await run(w.a, w.proof, [roomId], (s) => store.leave(s, roomId));
    expect(
      (
        await pool.query(
          "SELECT payload FROM xiangqi_room.outbox WHERE room_id=$1 AND type='media.revoke-user'",
          [roomId],
        )
      ).rows,
    ).toEqual([{ payload: { userId: w.a.userId } }]);
    expect(
      (
        await pool.query(
          "SELECT count(*)::int AS n FROM public.room_members WHERE room_id=$1 AND user_id=$2",
          [roomId, w.a.userId],
        )
      ).rows[0].n,
    ).toBe(0);
  });
  it("rejects seat invite races and moves during play", async () => {
    const { h, b, roomId } = await fullRoom();
    await run(b.a, b.proof, [roomId], (s) => store.toSpectator(s, roomId));
    const invite = await run(h.a, h.proof, [roomId], (s) =>
      store.inviteDown(s, roomId, b.a.userId),
    );
    const v = await admitted();
    await run(v.a, v.proof, [roomId], (s) =>
      store.join(s, { commandId: randomUUID(), roomId, intent: "auto" }),
    );
    await expect(
      run(b.a, b.proof, [roomId], (s) =>
        store.respondDown(s, roomId, invite.room.downOffer!.id, true),
      ),
    ).rejects.toMatchObject({ code: "SEAT_INVITE_MISSING" });
    const matchId = randomUUID();
    await pool.query("BEGIN");
    await pool.query(
      "INSERT INTO public.matches(id,room_id,mode,status,red_user_id,black_user_id,position,time_control,clock) VALUES($1,$2,'ONLINE','ACTIVE',$3,$4,(SELECT jsonb_build_object('board',jsonb_agg(x),'turn','RED') FROM (SELECT NULL::jsonb AS x FROM generate_series(1,90)) s),600,jsonb_build_object('redMs',600000,'blackMs',600000,'runningSinceEpochMs',floor(extract(epoch FROM clock_timestamp())*1000)::bigint))",
      [matchId, roomId, h.a.userId, v.a.userId],
    );
    await pool.query(
      "UPDATE public.rooms SET status='PLAYING',current_match_id=$2 WHERE id=$1",
      [roomId, matchId],
    );
    await pool.query("COMMIT");
    await expect(
      run(h.a, h.proof, [roomId], (s) => store.toSpectator(s, roomId)),
    ).rejects.toMatchObject({ code: "SEAT_MOVE_DENIED" });
  });
  it("closes invites when the seat fills before countdown", async () => {
    const { h, b, roomId } = await fullRoom();
    await run(b.a, b.proof, [roomId], (s) => store.toSpectator(s, roomId));
    const invite = await run(h.a, h.proof, [roomId], (s) =>
      store.inviteDown(s, roomId, b.a.userId),
    );
    const v = await admitted();
    await run(v.a, v.proof, [roomId], (s) =>
      store.join(s, { commandId: randomUUID(), roomId, intent: "auto" }),
    );
    for (const p of [h, v])
      await run(p.a, p.proof, [roomId], (s) =>
        store.presence(
          s,
          roomId,
          {
            connectionId: p.a.userId,
            generation: 1,
            serverInstance: randomUUID(),
          },
          true,
        ),
      );
    await run(v.a, v.proof, [roomId], (s) => store.ready(s, roomId, true));
    await run(h.a, h.proof, [roomId], (s) => store.start(s, roomId));
    await expect(
      run(b.a, b.proof, [roomId], (s) =>
        store.respondDown(s, roomId, invite.room.downOffer!.id, true),
      ),
    ).rejects.toMatchObject({ code: "SEAT_INVITE_MISSING" });
  });
});
