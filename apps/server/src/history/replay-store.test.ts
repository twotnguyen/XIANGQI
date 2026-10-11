import { randomUUID } from "node:crypto";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { initialPosition, playMove } from "@xiangqi/xiangqi-core";
import {
  apply,
  databaseUrl,
  pool,
  reset,
  transaction,
} from "../room/room.test-helper.js";
import { encodeMove, encodePosition } from "../match/position-codec.js";
import type { RoomActor } from "../room/contracts.js";
import { ReplayStore } from "./replay-store.js";
const store = new ReplayStore();
async function member() {
  const userId = randomUUID();
  await pool.query(
    "INSERT INTO auth.users(id,email,email_confirmed_at) VALUES($1,$2,clock_timestamp())",
    [userId, userId + "@example.invalid"],
  );
  await pool.query(
    "INSERT INTO public.profiles(user_id,username,display_name) VALUES($1,$2,'Synthetic member')",
    [userId, "u" + userId.replaceAll("-", "").slice(0, 18)],
  );
  return { userId, kind: "member" as const };
}
async function guest() {
  const userId = randomUUID();
  await pool.query(
    "INSERT INTO xiangqi_auth.principals(id,kind) VALUES($1,'guest')",
    [userId],
  );
  await pool.query(
    "INSERT INTO public.profiles(user_id,display_name) VALUES($1,'PRIVATE_GUEST_NAME')",
    [userId],
  );
  await pool.query(
    "INSERT INTO xiangqi_auth.guest_sessions(token_hash,guest_id,created_at,expires_at) SELECT $1,$2,t.born,t.born+interval '12 hours' FROM (SELECT clock_timestamp()-interval '13 hours' AS born)t",
    [userId.replaceAll("-", "").repeat(2), userId],
  );
  return { userId, kind: "guest" as const };
}
async function read(actor: RoomActor, id: string, locked = true) {
  return transaction([actor.userId], [], (c) =>
    store.read(
      {
        client: c,
        actor,
        lockedActorIds: new Set(locked ? [actor.userId] : []),
        lockedRoomIds: new Set(),
      },
      id,
    ),
  );
}
async function game(
  red: RoomActor,
  black: RoomActor | null,
  options: {
    mode?: "ONLINE" | "AI";
    status?: string;
    start?: Record<string, unknown>;
    position?: unknown;
    activeIds?: unknown;
    ply?: number;
    blackAiOwner?: boolean;
    reason?: string;
  } = {},
) {
  const id = randomUUID(),
    roomId = options.mode === "AI" ? null : randomUUID(),
    first = randomUUID(),
    second = randomUUID(),
    discarded = randomUUID(),
    p0 = initialPosition(),
    p1 = playMove(p0, { from: 54, to: 45 }),
    p2 = playMove(p1, { from: 27, to: 36 }),
    mode = options.mode ?? "ONLINE",
    status = options.status ?? "FINISHED",
    at = "2026-10-11T00:00:00.000Z",
    outcome = {
      reason:
        options.reason ??
        (status === "INTERRUPTED" ? "SERVER_RESTART" : "RESIGN"),
      winner: status === "INTERRUPTED" ? null : "RED",
    };
  if (roomId)
    await pool.query(
      "INSERT INTO public.rooms(id,owner_id,name,time_control) VALUES($1,$2,'Synthetic replay',300)",
      [roomId, red.userId],
    );
  await pool.query(
    "INSERT INTO public.matches(id,room_id,mode,status,red_user_id,black_user_id,ai_side,ai_level,position,version,ply,active_move_ids,ended_at,outcome,created_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,4,$13,$10,$11,$12,'2026-01-01')",
    [
      id,
      roomId,
      mode,
      status,
      options.blackAiOwner ? null : red.userId,
      options.blackAiOwner ? red.userId : (black?.userId ?? null),
      mode === "AI" ? (options.blackAiOwner ? "RED" : "BLACK") : null,
      mode === "AI" ? "EASY" : null,
      options.position ?? encodePosition(p2),
      JSON.stringify(options.activeIds ?? [first, second]),
      status === "ACTIVE" ? null : at,
      status === "ACTIVE" ? null : outcome,
      options.ply ?? 2,
    ],
  );
  const start = {
    encoding: "xiangqi-core-v1",
    ruleSetVersion: "xiangqi-simple-v1",
    startToken: id,
    initialPosition: encodePosition(p0),
    ...(mode === "AI"
      ? {
          mode: "AI",
          ownerId: red.userId,
          requestedSide: "random",
          aiSide: options.blackAiOwner ? "RED" : "BLACK",
          level: "easy",
        }
      : { roomId, redId: red.userId, blackId: black!.userId }),
    ...options.start,
  };
  await pool.query(
    "INSERT INTO public.match_events(match_id,version,type,payload) VALUES($1,0,'START',$2)",
    [id, start],
  );
  for (const [moveId, parent, eventVersion, side, move] of [
    [first, null, 1, "RED", { from: 54, to: 45 }],
    [second, first, 2, "BLACK", { from: 27, to: 36 }],
    [discarded, null, 3, "RED", { from: 56, to: 47 }],
  ] as const) {
    const encoded = encodeMove(move);
    await pool.query(
      "INSERT INTO public.match_events(match_id,version,type,payload) VALUES($1,$2,'MOVE',$3)",
      [id, eventVersion, { moveId, side, move: encoded }],
    );
    await pool.query(
      "INSERT INTO public.match_moves(id,match_id,parent_move_id,event_version,side,move) VALUES($1,$2,$3,$4,$5,$6)",
      [moveId, id, parent, eventVersion, side, encoded],
    );
  }
  if (status !== "ACTIVE")
    await pool.query(
      "INSERT INTO public.match_events(match_id,version,type,payload) VALUES($1,4,'RESULT',$2)",
      [id, { outcome, endedAt: at }],
    );
  return { id, first, second, discarded, positions: [p0, p1, p2] };
}
describe.skipIf(!databaseUrl)("ReplayStore actual synthetic PostgreSQL", () => {
  beforeEach(async () => {
    await pool.query(
      "DROP SCHEMA IF EXISTS xiangqi_ai CASCADE; DROP SCHEMA IF EXISTS xiangqi_chat CASCADE",
    );
    await reset();
    await apply("supabase/migrations/20261011000006_rooms.sql");
    await apply("supabase/migrations/20261011000007_match_outcomes.sql");
  });
  afterAll(() => pool.end());
  it("returns only effective canonical branch for both player colors, omits private IDs and discarded moves", async () => {
    const a = await member(),
      b = await member(),
      g = await game(a, b);
    const value = await read(a, g.id);
    expect(value).toEqual({
      id: g.id,
      mode: "CASUAL",
      side: "red",
      positions: [
        {
          fen: "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1",
          turn: "red",
        },
        {
          fen: "rnbakabnr/9/1c5c1/p1p1p1p1p/9/P8/2P1P1P1P/1C5C1/9/RNBAKABNR b - - 1 1",
          turn: "black",
        },
        {
          fen: "rnbakabnr/9/1c5c1/2p1p1p1p/p8/P8/2P1P1P1P/1C5C1/9/RNBAKABNR w - - 2 2",
          turn: "red",
        },
      ],
      moves: [
        { from: 54, to: 45, side: "red" },
        { from: 27, to: 36, side: "black" },
      ],
    });
    expect((await read(b, g.id)).side).toBe("black");
    expect(JSON.stringify(value)).not.toContain(a.userId);
    expect(JSON.stringify(value)).not.toContain(g.discarded);
  });
  it("returns the same404 for outsiders, missing and active games", async () => {
    const a = await member(),
      b = await member(),
      outside = await member(),
      g = await game(a, b),
      active = await game(a, b, { status: "ACTIVE" });
    for (const [actor, id] of [
      [outside, g.id],
      [a, randomUUID()],
      [a, active.id],
    ] as const)
      await expect(read(actor, id)).rejects.toMatchObject({
        code: "REPLAY_NOT_FOUND",
        status: 404,
      });
  });
  it("denies guest, forged member kind and missing actor lock", async () => {
    const a = await member(),
      b = await guest(),
      g = await game(a, b);
    await expect(read(b, g.id)).rejects.toMatchObject({ status: 403 });
    await expect(read({ ...b, kind: "member" }, g.id)).rejects.toMatchObject({
      status: 403,
    });
    await expect(read(a, g.id, false)).rejects.toMatchObject({ status: 403 });
  });
  it("keeps official opponent replay after guest expires without revealing guest name", async () => {
    const a = await member(),
      b = await guest(),
      g = await game(a, b);
    const result = await read(a, g.id);
    expect(result.positions).toHaveLength(3);
    expect(JSON.stringify(result)).not.toContain("PRIVATE_GUEST");
  });
  it("accepts canonical AI and interrupted records", async () => {
    const a = await member(),
      g = await game(a, null, { mode: "AI" });
    expect(await read(a, g.id)).toMatchObject({
      mode: "AI",
      side: "red",
      moves: [
        { from: 54, to: 45, side: "red" },
        { from: 27, to: 36, side: "black" },
      ],
    });
    const b = await member(),
      interrupted = await game(a, b, { status: "INTERRUPTED" });
    expect((await read(a, interrupted.id)).positions).toHaveLength(3);
  });
  it.each([
    { encoding: "legacy" },
    { ruleSetVersion: "wrong" },
    { redId: randomUUID() },
    { roomId: randomUUID() },
    { startToken: "bad" },
  ])("fails closed for altered START provenance", async (start) => {
    const a = await member(),
      b = await member(),
      g = await game(a, b, { start });
    await expect(read(a, g.id)).rejects.toMatchObject({
      code: "REPLAY_CORRUPT",
      status: 409,
    });
  });
  it("rejects tampered parent and MOVE payload", async () => {
    const a = await member(),
      b = await member(),
      g = await game(a, b);
    await pool.query(
      "UPDATE public.match_moves SET parent_move_id=NULL WHERE id=$1",
      [g.second],
    );
    await expect(read(a, g.id)).rejects.toMatchObject({
      code: "REPLAY_CORRUPT",
    });
  });
  it("rejects event mismatch", async () => {
    const a = await member(),
      b = await member(),
      g = await game(a, b);
    await pool.query(
      "UPDATE public.match_events SET payload=jsonb_set(payload,'{moveId}',to_jsonb($2::text)) WHERE match_id=$1 AND version=2",
      [g.id, g.discarded],
    );
    await expect(read(a, g.id)).rejects.toMatchObject({
      code: "REPLAY_CORRUPT",
    });
  });
  it("rejects final canonical position mismatch", async () => {
    const a = await member(),
      b = await member(),
      g = await game(a, b, { position: encodePosition(initialPosition()) });
    await expect(read(a, g.id)).rejects.toMatchObject({
      code: "REPLAY_CORRUPT",
    });
  });
  it.each(["ONLINE", "AI"] as const)(
    "rejects a consistent altered START and current position in zero-move %s replay",
    async (mode) => {
      const a = await member(),
        b = mode === "ONLINE" ? await member() : null,
        altered = initialPosition();
      altered.halfmove = 9;
      const position = encodePosition(altered),
        g = await game(a, b, {
          mode,
          position,
          activeIds: [],
          ply: 0,
          start: { initialPosition: position },
        });
      await expect(read(a, g.id)).rejects.toMatchObject({
        code: "REPLAY_CORRUPT",
        status: 409,
      });
    },
  );
  it("rejects mismatched RESULT outcome", async () => {
    const a = await member(),
      b = await member(),
      g = await game(a, b);
    await pool.query(
      "UPDATE public.match_events SET payload=jsonb_set(payload,'{outcome,winner}','\"BLACK\"') WHERE match_id=$1 AND type='RESULT'",
      [g.id],
    );
    await expect(read(a, g.id)).rejects.toMatchObject({
      code: "REPLAY_CORRUPT",
    });
  });
  it("rejects forged AI owner metadata", async () => {
    const a = await member(),
      g = await game(a, null, { mode: "AI", start: { ownerId: randomUUID() } });
    await expect(read(a, g.id)).rejects.toMatchObject({
      code: "REPLAY_CORRUPT",
    });
  });
  it("rejects invalid UUID input400", async () => {
    const a = await member();
    await expect(read(a, "not-id")).rejects.toMatchObject({
      code: "REPLAY_INPUT_INVALID",
      status: 400,
    });
  });
  it("maps invalid active move UUIDs to sanitized corruption", async () => {
    const a = await member(),
      b = await member(),
      g = await game(a, b, { activeIds: ["bad", randomUUID()] });
    await expect(read(a, g.id)).rejects.toMatchObject({
      code: "REPLAY_CORRUPT",
      status: 409,
    });
  });
  it("supports a black AI owner without exposing owner metadata", async () => {
    const a = await member(),
      g = await game(a, null, { mode: "AI", blackAiOwner: true });
    expect(await read(a, g.id)).toMatchObject({
      mode: "AI",
      side: "black",
      moves: [
        { from: 54, to: 45, side: "red" },
        { from: 27, to: 36, side: "black" },
      ],
    });
  });
  it("rejects a claimed core checkmate on an ongoing canonical position", async () => {
    const a = await member(),
      b = await member(),
      g = await game(a, b, { reason: "CHECKMATE" });
    await expect(read(a, g.id)).rejects.toMatchObject({
      code: "REPLAY_CORRUPT",
    });
  });
  it("rejects missing RESULT and altered endedAt", async () => {
    const a = await member(),
      b = await member(),
      g = await game(a, b);
    await pool.query(
      "UPDATE public.match_events SET payload=jsonb_set(payload,'{endedAt}','\"2026-10-12T00:00:00.000Z\"') WHERE match_id=$1 AND type='RESULT'",
      [g.id],
    );
    await expect(read(a, g.id)).rejects.toMatchObject({
      code: "REPLAY_CORRUPT",
    });
    await pool.query(
      "DELETE FROM public.match_events WHERE match_id=$1 AND type='RESULT'",
      [g.id],
    );
    await expect(read(a, g.id)).rejects.toMatchObject({
      code: "REPLAY_CORRUPT",
    });
  });
});
