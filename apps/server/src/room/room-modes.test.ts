import { randomInt, randomUUID } from "node:crypto";
import { initialPosition } from "@xiangqi/xiangqi-core";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import {
  actor,
  apply,
  databaseUrl,
  pool,
  reset,
  transaction,
} from "./room.test-helper.js";
import { RoomStore } from "./room-store.js";
import type { RoomActor, RoomScope } from "./contracts.js";
const store = new RoomStore();
vi.mock("node:crypto", async (importOriginal) => {
  const original = await importOriginal<typeof import("node:crypto")>();
  return { ...original, randomInt: vi.fn(original.randomInt) };
});
afterAll(() => pool.end());
async function run<T>(
  a: RoomActor,
  id: string | null,
  work: (scope: RoomScope) => Promise<T>,
) {
  const roster = id
    ? (
        await pool.query(
          "SELECT user_id FROM public.room_members WHERE room_id=$1",
          [id],
        )
      ).rows.map((row) => row.user_id as string)
    : [];
  const ids = [...new Set([a.userId, ...roster])];
  return transaction(ids, id ? [id] : [], (client) =>
    work({
      client,
      actor: a,
      lockedActorIds: new Set(ids),
      lockedRoomIds: new Set(id ? [id] : []),
    }),
  );
}
async function room(twoSeats = false) {
  const host = await actor();
  const entry = await run(host, null, (scope) =>
    store.create(scope, { commandId: randomUUID(), name: "Modes Fixture" }),
  );
  if (twoSeats) {
    const opponent = await actor();
    await run(opponent, entry.roomId, (scope) =>
      store.join(scope, {
        commandId: randomUUID(),
        roomId: entry.roomId,
        intent: "play",
      }),
    );
  }
  const view = await run(host, entry.roomId, (scope) =>
    store.snapshot(scope, entry.roomId),
  );
  return { host, entry, view };
}
describe.skipIf(!databaseUrl)("managed room modes (synthetic PG only)", () => {
  beforeEach(async () => {
    await reset();
    await apply("supabase/migrations/20261011000006_rooms.sql");
    await apply("supabase/migrations/20261011000008_room_modes.sql");
  });
  it("serializes simultaneous changes so only one wins the version CAS", async () => {
    const { host, entry, view } = await room(true);
    const results = await Promise.allSettled([
      run(host, entry.roomId, (scope) =>
        store.changeVisibility(scope, entry.roomId, view.version, "PUBLIC"),
      ),
      run(host, entry.roomId, (scope) =>
        store.changeVisibility(scope, entry.roomId, view.version, "LOCKED"),
      ),
    ]);
    expect(
      results.filter((result) => result.status === "fulfilled"),
    ).toHaveLength(1);
    expect(
      results.find((result) => result.status === "rejected"),
    ).toMatchObject({ reason: { code: "VERSION_STALE" } });
    expect(
      (
        await pool.query("SELECT room_version FROM public.rooms WHERE id=$1", [
          entry.roomId,
        ])
      ).rows[0].room_version,
    ).toBe(String(view.version + 1));
    expect(
      (
        await pool.query(
          "SELECT count(*)::int n FROM xiangqi_room.outbox WHERE room_id=$1 AND type='room.visibility-changed'",
          [entry.roomId],
        )
      ).rows[0].n,
    ).toBe(1);
  });
  it("preserves legacy room data and leaves unknown historical public opening time unset", async () => {
    await reset();
    await apply("supabase/migrations/20261011000006_rooms.sql");
    const owner = await actor(),
      id = randomUUID();
    await pool.query(
      "INSERT INTO public.rooms(id,owner_id,name,visibility,time_control) VALUES($1,$2,'Legacy retained','PUBLIC',0)",
      [id, owner.userId],
    );
    const before = (
      await pool.query(
        "SELECT to_jsonb(r) value FROM public.rooms r WHERE id=$1",
        [id],
      )
    ).rows[0].value;
    await apply("supabase/migrations/20261011000008_room_modes.sql");
    expect(
      (
        await pool.query(
          "SELECT to_jsonb(r)-'public_opened_at' value,public_opened_at FROM public.rooms r WHERE id=$1",
          [id],
        )
      ).rows[0],
    ).toEqual({ value: before, public_opened_at: null });
  });
  it("refuses migration when the audited settings guard metadata differs", async () => {
    await reset();
    await apply("supabase/migrations/20261011000006_rooms.sql");
    const client = await pool.connect();
    try {
      await client.query("SET ROLE postgres");
      await client.query(
        "ALTER FUNCTION xiangqi_room.guard_settings() SET search_path='public'",
      );
    } finally {
      await client.query("RESET ROLE");
      client.release();
    }
    await expect(
      apply("supabase/migrations/20261011000008_room_modes.sql"),
    ).rejects.toThrow("differs from audited migration 000006");
    expect(
      (
        await pool.query(
          "SELECT count(*)::int n FROM pg_catalog.pg_attribute WHERE attrelid='public.rooms'::regclass AND attname='public_opened_at' AND NOT attisdropped",
        )
      ).rows[0].n,
    ).toBe(0);
  });
  it("does not resolve audit builtins from attacker-named public functions", async () => {
    await reset();
    await apply("supabase/migrations/20261011000006_rooms.sql");
    const client = await pool.connect();
    try {
      await client.query("SET ROLE postgres");
      await client.query(
        "CREATE FUNCTION public.md5(text) RETURNS text LANGUAGE sql AS $$ SELECT 'shadow'::text $$; CREATE FUNCTION public.pg_get_functiondef(oid) RETURNS text LANGUAGE sql AS $$ SELECT 'shadow'::text $$",
      );
    } finally {
      await client.query("RESET ROLE");
      client.release();
    }
    await apply("supabase/migrations/20261011000008_room_modes.sql");
    expect(
      (
        await pool.query(
          "SELECT count(*)::int n FROM pg_catalog.pg_attribute WHERE attrelid='public.rooms'::regclass AND attname='public_opened_at' AND NOT attisdropped",
        )
      ).rows[0].n,
    ).toBe(1);
  });
  it("opens PUBLIC at a durable SQL timestamp and treats the same mode as a no-op", async () => {
    const { host, entry, view } = await room();
    const changed = await run(host, entry.roomId, (scope) =>
      store.changeVisibility(scope, entry.roomId, view.version, "PUBLIC"),
    );
    expect(changed).toMatchObject({
      version: view.version + 1,
      room: { visibility: "PUBLIC", inviteCode: entry.inviteCode },
    });
    const first = (
      await pool.query(
        "SELECT public_opened_at FROM public.rooms WHERE id=$1",
        [entry.roomId],
      )
    ).rows[0].public_opened_at;
    expect(first).toBeInstanceOf(Date);
    const count = (
      await pool.query("SELECT count(*)::int AS n FROM xiangqi_room.outbox")
    ).rows[0].n;
    const repeated = await run(host, entry.roomId, (scope) =>
      store.changeVisibility(scope, entry.roomId, changed.version, "PUBLIC"),
    );
    expect(repeated.version).toBe(changed.version);
    expect(
      (
        await pool.query(
          "SELECT public_opened_at FROM public.rooms WHERE id=$1",
          [entry.roomId],
        )
      ).rows[0].public_opened_at,
    ).toEqual(first);
    expect(
      (await pool.query("SELECT count(*)::int AS n FROM xiangqi_room.outbox"))
        .rows[0].n,
    ).toBe(count);
    expect(
      (
        await pool.query(
          "SELECT type,payload FROM xiangqi_room.outbox WHERE room_version=$1 AND room_id=$2",
          [changed.version, entry.roomId],
        )
      ).rows,
    ).toEqual([
      { type: "room.visibility-changed", payload: { visibility: "PUBLIC" } },
    ]);
  });
  it("projects a replayed create receipt from the current mode and code without rewriting the durable receipt", async () => {
    const host = await actor(),
      opponent = await actor();
    const input = { commandId: randomUUID(), name: "Receipt Fixture" };
    const entry = await run(host, null, (scope) => store.create(scope, input));
    await run(opponent, entry.roomId, (scope) =>
      store.join(scope, {
        commandId: randomUUID(),
        roomId: entry.roomId,
        intent: "play",
      }),
    );
    const view = await run(host, entry.roomId, (scope) =>
      store.snapshot(scope, entry.roomId),
    );
    const locked = await run(host, entry.roomId, (scope) =>
      store.changeVisibility(scope, entry.roomId, view.version, "LOCKED"),
    );
    const hidden = await run(host, entry.roomId, (scope) =>
      store.create(scope, input),
    );
    expect(hidden.inviteCode).toBeUndefined();
    const opened = await run(host, entry.roomId, (scope) =>
      store.changeVisibility(scope, entry.roomId, locked.version, "CODE_ONLY"),
    );
    expect(
      await run(host, entry.roomId, (scope) => store.create(scope, input)),
    ).toMatchObject({ inviteCode: opened.room.inviteCode });
    expect(
      (
        await pool.query(
          "SELECT response FROM xiangqi_room.entry_receipts WHERE actor_id=$1 AND command_id=$2",
          [host.userId, input.commandId],
        )
      ).rows[0].response,
    ).toEqual(entry);
  });
  it("rejects non-host and stale CAS without changing mode, code or outbox", async () => {
    const { host, entry, view } = await room(true);
    const other = { userId: view.room.seats.black!, kind: "guest" as const };
    await expect(
      run(other, entry.roomId, (scope) =>
        store.changeVisibility(scope, entry.roomId, view.version, "PUBLIC"),
      ),
    ).rejects.toMatchObject({ code: "ROOM_FORBIDDEN", status: 403 });
    await expect(
      run(host, entry.roomId, (scope) =>
        store.changeVisibility(scope, entry.roomId, view.version - 1, "PUBLIC"),
      ),
    ).rejects.toMatchObject({ code: "VERSION_STALE" });
    expect(
      await run(host, entry.roomId, (scope) =>
        store.snapshot(scope, entry.roomId),
      ),
    ).toMatchObject({
      version: view.version,
      room: { visibility: "CODE_ONLY", inviteCode: entry.inviteCode },
    });
  });
  it("rejects LOCKED with one seat, but allows lock during PLAYING and preserves every member and readiness", async () => {
    const { host, entry, view } = await room();
    await expect(
      run(host, entry.roomId, (scope) =>
        store.changeVisibility(scope, entry.roomId, view.version, "LOCKED"),
      ),
    ).rejects.toMatchObject({ code: "ROOM_LOCK_REQUIRES_PLAYERS" });
    const other = await actor(),
      viewer = await actor();
    await run(other, entry.roomId, (scope) =>
      store.join(scope, {
        commandId: randomUUID(),
        roomId: entry.roomId,
        intent: "play",
      }),
    );
    await run(viewer, entry.roomId, (scope) =>
      store.join(scope, {
        commandId: randomUUID(),
        roomId: entry.roomId,
        intent: "watch",
      }),
    );
    const matchId = randomUUID();
    await pool.query(
      "INSERT INTO public.matches(id,room_id,mode,red_user_id,black_user_id,position) VALUES($1,$2,'ONLINE',$3,$4,$5)",
      [
        matchId,
        entry.roomId,
        host.userId,
        other.userId,
        JSON.stringify({ board: initialPosition().board, turn: "RED" }),
      ],
    );
    await pool.query(
      "UPDATE public.rooms SET status='PLAYING',current_match_id=$2 WHERE id=$1",
      [entry.roomId, matchId],
    );
    await pool.query(
      "UPDATE public.room_members SET ready=true WHERE room_id=$1 AND role='PLAYER'",
      [entry.roomId],
    );
    const before = (
      await pool.query(
        "SELECT * FROM public.room_members WHERE room_id=$1 ORDER BY user_id",
        [entry.roomId],
      )
    ).rows;
    const current = await run(host, entry.roomId, (scope) =>
      store.snapshot(scope, entry.roomId),
    );
    const locked = await run(host, entry.roomId, (scope) =>
      store.changeVisibility(scope, entry.roomId, current.version, "LOCKED"),
    );
    expect(locked.room).toMatchObject({
      status: "PLAYING",
      visibility: "LOCKED",
      inviteCode: null,
      ready: { red: true, black: true },
    });
    expect(
      (
        await pool.query(
          "SELECT * FROM public.room_members WHERE room_id=$1 ORDER BY user_id",
          [entry.roomId],
        )
      ).rows,
    ).toEqual(before);
    expect(
      (
        await pool.query("SELECT invite_code FROM public.rooms WHERE id=$1", [
          entry.roomId,
        ])
      ).rows[0].invite_code,
    ).toBe(entry.inviteCode);
    await expect(
      run(host, entry.roomId, (scope) =>
        store.resolveCode(scope.client, entry.inviteCode),
      ),
    ).rejects.toMatchObject({ code: "ROOM_FORBIDDEN" });
  });
  it.each(["PUBLIC", "CODE_ONLY"] as const)(
    "rotates code on unlock to %s; old code stays invalid and same mode keeps new code",
    async (visibility) => {
      const { host, entry, view } = await room(true);
      const locked = await run(host, entry.roomId, (scope) =>
        store.changeVisibility(scope, entry.roomId, view.version, "LOCKED"),
      );
      const opened = await run(host, entry.roomId, (scope) =>
        store.changeVisibility(scope, entry.roomId, locked.version, visibility),
      );
      expect(opened.room.inviteCode).toMatch(
        /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8}$/,
      );
      expect(opened.room.inviteCode).not.toBe(entry.inviteCode);
      await expect(
        run(host, entry.roomId, (scope) =>
          store.resolveCode(scope.client, entry.inviteCode),
        ),
      ).rejects.toMatchObject({ code: "ROOM_FORBIDDEN" });
      expect(
        await run(host, entry.roomId, (scope) =>
          store.resolveCode(scope.client, opened.room.inviteCode),
        ),
      ).toBe(entry.roomId);
      const repeated = await run(host, entry.roomId, (scope) =>
        store.changeVisibility(scope, entry.roomId, opened.version, visibility),
      );
      expect(repeated.version).toBe(opened.version);
      expect(repeated.room.inviteCode).toBe(opened.room.inviteCode);
    },
  );
  it("revokes unused invitations atomically while retaining consumed invitations", async () => {
    const { host, entry, view } = await room(true);
    await pool.query(
      "INSERT INTO public.invitations(room_id,sender_id,role,token_hash,code_hash,expires_at) VALUES($1,$2,'WATCH',decode(repeat('01',32),'hex'),decode(repeat('02',32),'hex'),clock_timestamp()+interval '1 hour')",
      [entry.roomId, host.userId],
    );
    await pool.query(
      "INSERT INTO public.invitations(room_id,sender_id,recipient_id,role,status,resolved_at,consumed_by,expires_at) VALUES($1,$2,$3,'PLAY','CONSUMED',clock_timestamp(),$3,clock_timestamp()+interval '1 hour')",
      [entry.roomId, host.userId, view.room.seats.black],
    );
    const consumed = (
      await pool.query(
        "SELECT * FROM public.invitations WHERE room_id=$1 AND status='CONSUMED'",
        [entry.roomId],
      )
    ).rows;
    const locked = await run(host, entry.roomId, (scope) =>
      store.changeVisibility(scope, entry.roomId, view.version, "LOCKED"),
    );
    expect(
      (
        await pool.query(
          "SELECT * FROM public.invitations WHERE room_id=$1 AND status='CONSUMED'",
          [entry.roomId],
        )
      ).rows,
    ).toEqual(consumed);
    expect(locked.room.inviteCode).toBeNull();
    expect(
      (
        await pool.query(
          "SELECT status,resolved_at FROM public.invitations WHERE room_id=$1 AND status='REVOKED'",
          [entry.roomId],
        )
      ).rows[0],
    ).toMatchObject({ status: "REVOKED", resolved_at: expect.any(Date) });
  });
  it("preserves immutable clock/viewer settings and refuses dropping the managed marker", async () => {
    const { entry } = await room(true);
    for (const change of [
      "time_control=300",
      "viewer_limit=0",
      "invite_code=NULL",
    ])
      await expect(
        pool.query(`UPDATE public.rooms SET ${change} WHERE id=$1`, [
          entry.roomId,
        ]),
      ).rejects.toThrow();
    expect(
      (
        await pool.query(
          "SELECT time_control,viewer_limit,invite_code FROM public.rooms WHERE id=$1",
          [entry.roomId],
        )
      ).rows[0],
    ).toEqual({
      time_control: 600,
      viewer_limit: 5,
      invite_code: entry.inviteCode,
    });
  });
  it("sets a new opening timestamp after leaving PUBLIC and entering it again", async () => {
    const { host, entry, view } = await room();
    const opened = await run(host, entry.roomId, (scope) =>
      store.changeVisibility(scope, entry.roomId, view.version, "PUBLIC"),
    );
    await pool.query(
      "UPDATE public.rooms SET public_opened_at='2020-01-01' WHERE id=$1",
      [entry.roomId],
    );
    const privateRoom = await run(host, entry.roomId, (scope) =>
      store.changeVisibility(scope, entry.roomId, opened.version, "CODE_ONLY"),
    );
    await run(host, entry.roomId, (scope) =>
      store.changeVisibility(
        scope,
        entry.roomId,
        privateRoom.version,
        "PUBLIC",
      ),
    );
    expect(
      (
        await pool.query(
          "SELECT public_opened_at>'2020-01-01'::timestamptz AS fresh FROM public.rooms WHERE id=$1",
          [entry.roomId],
        )
      ).rows[0].fresh,
    ).toBe(true);
  });
  it("rolls mode/code/timestamp/outbox back if the transaction fails", async () => {
    const { host, entry, view } = await room(true);
    await expect(
      run(host, entry.roomId, async (scope) => {
        await store.changeVisibility(
          scope,
          entry.roomId,
          view.version,
          "PUBLIC",
        );
        throw new Error("rollback fixture");
      }),
    ).rejects.toThrow("rollback fixture");
    expect(
      (
        await pool.query(
          "SELECT visibility,invite_code,public_opened_at,room_version FROM public.rooms WHERE id=$1",
          [entry.roomId],
        )
      ).rows[0],
    ).toEqual({
      visibility: "CODE_ONLY",
      invite_code: entry.inviteCode,
      public_opened_at: null,
      room_version: String(view.version),
    });
  });
  it.each(["LOCKED", "PUBLIC"] as const)(
    "rolls back %s after code/invitation changes when outbox insertion fails",
    async (target) => {
      const { host, entry, view } = await room(true);
      await pool.query(
        "INSERT INTO public.invitations(room_id,sender_id,role,token_hash,code_hash,expires_at) VALUES($1,$2,'WATCH',decode(repeat('01',32),'hex'),decode(repeat('02',32),'hex'),clock_timestamp()+interval '1 hour')",
        [entry.roomId, host.userId],
      );
      const current =
        target === "PUBLIC"
          ? await run(host, entry.roomId, (scope) =>
              store.changeVisibility(
                scope,
                entry.roomId,
                view.version,
                "LOCKED",
              ),
            )
          : view;
      const beforeRoom = (
        await pool.query("SELECT * FROM public.rooms WHERE id=$1", [
          entry.roomId,
        ])
      ).rows[0];
      const beforeInvitations = (
        await pool.query(
          "SELECT * FROM public.invitations WHERE room_id=$1 ORDER BY id",
          [entry.roomId],
        )
      ).rows;
      const beforeEvents = (
        await pool.query(
          "SELECT * FROM xiangqi_room.outbox WHERE room_id=$1 ORDER BY room_version,type",
          [entry.roomId],
        )
      ).rows;
      await pool.query(
        "CREATE FUNCTION xiangqi_room.fail_modes() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.type='room.visibility-changed' THEN RAISE EXCEPTION 'synthetic outbox failure'; END IF; RETURN NEW; END $$; CREATE TRIGGER fail_modes BEFORE INSERT ON xiangqi_room.outbox FOR EACH ROW EXECUTE FUNCTION xiangqi_room.fail_modes()",
      );
      await expect(
        run(host, entry.roomId, (scope) =>
          store.changeVisibility(scope, entry.roomId, current.version, target),
        ),
      ).rejects.toThrow("synthetic outbox failure");
      expect(
        (
          await pool.query("SELECT * FROM public.rooms WHERE id=$1", [
            entry.roomId,
          ])
        ).rows[0],
      ).toEqual(beforeRoom);
      expect(
        (
          await pool.query(
            "SELECT * FROM public.invitations WHERE room_id=$1 ORDER BY id",
            [entry.roomId],
          )
        ).rows,
      ).toEqual(beforeInvitations);
      expect(
        (
          await pool.query(
            "SELECT * FROM xiangqi_room.outbox WHERE room_id=$1 ORDER BY room_version,type",
            [entry.roomId],
          )
        ).rows,
      ).toEqual(beforeEvents);
    },
  );
  it("retries a code uniqueness collision in SQL without aborting the unlock transaction", async () => {
    const { host, entry, view } = await room(true),
      other = await actor();
    const collision = await run(other, null, (scope) =>
      store.create(scope, {
        commandId: randomUUID(),
        name: "Collision Fixture",
      }),
    );
    const locked = await run(host, entry.roomId, (scope) =>
      store.changeVisibility(scope, entry.roomId, view.version, "LOCKED"),
    );
    const fresh = ["AAAAAAAA", "BBBBBBBB", "CCCCCCCC"].find(
      (code) => code !== entry.inviteCode && code !== collision.inviteCode,
    )!;
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const native =
      await vi.importActual<typeof import("node:crypto")>("node:crypto");
    try {
      for (const character of collision.inviteCode! + fresh)
        vi.mocked(randomInt).mockImplementationOnce(
          () => alphabet.indexOf(character) as never,
        );
      const opened = await run(host, entry.roomId, (scope) =>
        store.changeVisibility(scope, entry.roomId, locked.version, "PUBLIC"),
      );
      expect(opened.room.inviteCode).toBe(fresh);
      expect(opened.version).toBe(locked.version + 1);
      expect(
        await run(other, collision.roomId, (scope) =>
          store.resolveCode(scope.client, collision.inviteCode),
        ),
      ).toBe(collision.roomId);
    } finally {
      vi.mocked(randomInt).mockReset().mockImplementation(native.randomInt);
    }
  });
  it("keeps LOCKED when one player leaves, including a repeated same-mode request", async () => {
    const { host, entry, view } = await room(true);
    const locked = await run(host, entry.roomId, (scope) =>
      store.changeVisibility(scope, entry.roomId, view.version, "LOCKED"),
    );
    const opponent = { userId: view.room.seats.black!, kind: "guest" as const };
    await run(opponent, entry.roomId, (scope) =>
      store.leave(scope, entry.roomId),
    );
    const current = await run(host, entry.roomId, (scope) =>
      store.snapshot(scope, entry.roomId),
    );
    expect(current.room).toMatchObject({
      visibility: "LOCKED",
      inviteCode: null,
      seats: { black: null },
    });
    const repeated = await run(host, entry.roomId, (scope) =>
      store.changeVisibility(scope, entry.roomId, current.version, "LOCKED"),
    );
    expect(repeated.version).toBe(current.version);
    expect(repeated.version).toBe(locked.version + 1);
  });
});
it("requires trusted actor and room locks before SQL, and rejects malformed input", async () => {
  const client = { query: vi.fn() } as unknown as RoomScope["client"];
  const a = { userId: randomUUID(), kind: "member" as const },
    id = randomUUID();
  const scope = {
    client,
    actor: a,
    lockedActorIds: new Set<string>(),
    lockedRoomIds: new Set([id]),
  };
  await expect(
    store.changeVisibility(scope, id, 0, "PUBLIC"),
  ).rejects.toMatchObject({ code: "ROOM_LOCK_REQUIRED" });
  scope.lockedActorIds.add(a.userId);
  scope.lockedRoomIds.clear();
  await expect(
    store.changeVisibility(scope, id, 0, "PUBLIC"),
  ).rejects.toMatchObject({ code: "ROOM_LOCK_REQUIRED" });
  scope.lockedRoomIds.add(id);
  await expect(
    store.changeVisibility(scope, id, -1, "PUBLIC"),
  ).rejects.toMatchObject({ code: "ROOM_INPUT_INVALID" });
  await expect(
    store.changeVisibility(scope, "not-a-uuid", 0, "PUBLIC"),
  ).rejects.toMatchObject({ code: "ROOM_INPUT_INVALID" });
  await expect(
    store.changeVisibility(scope, id, Number.MAX_SAFE_INTEGER + 1, "PUBLIC"),
  ).rejects.toMatchObject({ code: "ROOM_INPUT_INVALID" });
  await expect(
    store.changeVisibility(scope, id, 0, "invalid" as "PUBLIC"),
  ).rejects.toMatchObject({ code: "ROOM_INPUT_INVALID" });
  expect(client.query).not.toHaveBeenCalled();
});
