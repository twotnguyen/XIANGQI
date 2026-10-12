import { randomUUID } from "node:crypto";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { initialPosition } from "@xiangqi/xiangqi-core";
import { encodePosition } from "../match/position-codec.js";
import { apply, databaseUrl, pool, reset } from "../match/match.test-helper.js";
import { RoomTransactions } from "../room/room-transactions.js";
import type { RoomActor, RoomScope } from "../room/contracts.js";
import { HistoryStore } from "./history-store.js";
const store = new HistoryStore(),
  coordinator = new RoomTransactions(pool);
async function run<T>(
  actor: RoomActor,
  work: (scope: RoomScope) => Promise<T>,
) {
  // Synthetic authenticated actors exercise the SQL port, not provider/session proof.
  const result = await coordinator.withRoom(
    { actor, roomIds: [] },
    async (proof) => ({ status: "active", actor: proof.actor }),
    work,
  );
  if (result.status !== "active") throw new Error("Synthetic actor ended");
  return result.value;
}
async function member(name: string): Promise<RoomActor> {
  const userId = randomUUID();
  await pool.query(
    "INSERT INTO auth.users(id,email,email_confirmed_at) VALUES($1,$2,clock_timestamp())",
    [userId, userId + "@example.invalid"],
  );
  await pool.query(
    "INSERT INTO public.profiles(user_id,username,display_name) VALUES($1,$2,$3)",
    [userId, "u" + userId.replaceAll("-", "").slice(0, 18), name],
  );
  return { userId, kind: "member" };
}
async function guest(name: string): Promise<RoomActor> {
  const userId = randomUUID();
  await pool.query(
    "INSERT INTO xiangqi_auth.principals(id,kind) VALUES($1,'guest')",
    [userId],
  );
  await pool.query(
    "INSERT INTO public.profiles(user_id,display_name) VALUES($1,$2)",
    [userId, name],
  );
  await pool.query(
    "WITH t AS(SELECT clock_timestamp() at) INSERT INTO xiangqi_auth.guest_sessions(token_hash,guest_id,created_at,expires_at) SELECT $1,$2,at,at+interval '12 hours' FROM t",
    [userId.replaceAll("-", "").repeat(2), userId],
  );
  return { userId, kind: "guest" };
}
async function game(
  red: RoomActor | null,
  black: RoomActor | null,
  options: {
    mode?: "ONLINE" | "AI";
    status?: "FINISHED" | "INTERRUPTED" | "ACTIVE";
    winner?: "RED" | "BLACK" | null;
    reason?: string;
    at?: string;
    level?: "EASY" | "MEDIUM" | "HARD";
  } = {},
) {
  const id = randomUUID(),
    mode = options.mode ?? "ONLINE",
    status = options.status ?? "FINISHED";
  let roomId: string | null = null;
  if (mode === "ONLINE") {
    roomId = randomUUID();
    await pool.query(
      "INSERT INTO public.rooms(id,owner_id,name,time_control) VALUES($1,$2,'Synthetic history',300)",
      [roomId, red!.userId],
    );
  }
  const reason =
    options.reason ?? (status === "INTERRUPTED" ? "SERVER_RESTART" : "RESIGN");
  const outcome =
    status === "ACTIVE"
      ? null
      : {
          reason,
          winner:
            options.winner === undefined
              ? status === "INTERRUPTED"
                ? null
                : "RED"
              : options.winner,
        };
  const at = options.at ?? "2026-10-01T00:00:00.123456Z";
  await pool.query(
    `INSERT INTO public.matches(id,room_id,mode,status,red_user_id,black_user_id,ai_side,ai_level,position,version,created_at,ended_at,outcome)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,2,'2026-01-01',$10,$11)`,
    [
      id,
      roomId,
      mode,
      status,
      red?.userId ?? null,
      black?.userId ?? null,
      mode === "AI" ? (red ? "BLACK" : "RED") : null,
      mode === "AI" ? (options.level ?? "EASY") : null,
      encodePosition(initialPosition()),
      status === "ACTIVE" ? null : at,
      outcome,
    ],
  );
  const start =
    mode === "ONLINE"
      ? { roomId, redId: red!.userId, blackId: black!.userId }
      : {
          mode: "AI",
          ownerId: (red ?? black)!.userId,
          requestedSide: red ? "red" : "black",
          aiSide: red ? "BLACK" : "RED",
          level: (options.level ?? "EASY").toLowerCase(),
        };
  await pool.query(
    "INSERT INTO public.match_events(match_id,version,type,payload) VALUES($1,0,'START',$2)",
    [
      id,
      {
        ...start,
        encoding: "xiangqi-core-v1",
        startToken: id,
        initialPosition: encodePosition(initialPosition()),
        ruleSetVersion: "xiangqi-simple-v1",
      },
    ],
  );
  return id;
}
describe.skipIf(!databaseUrl)("own-member terminal history actual SQL", () => {
  beforeEach(async () => {
    await pool.query(
      "DROP SCHEMA IF EXISTS xiangqi_ai CASCADE; DROP SCHEMA IF EXISTS xiangqi_chat CASCADE",
    );
    await reset();
    await apply("supabase/migrations/20261011000007_match_outcomes.sql");
  });
  afterAll(() => pool.end());
  it("returns only own terminal matches from both colors; outsiders and active games are absent", async () => {
    const a = await member("Player A"),
      b = await member("Player B"),
      c = await member("Outsider");
    const red = await game(a, b),
      black = await game(b, a, { at: "2026-10-02T00:00:00.000000Z" });
    await game(b, c);
    await game(a, b, { status: "ACTIVE" });
    const page = await run(a, (s) => store.list(s));
    expect(page.items.map((r) => r.id)).toEqual([black, red]);
    expect(page.items[0]).toMatchObject({
      type: "CASUAL",
      side: "black",
      opponent: { displayName: "Player B", isGuest: false },
      result: { kind: "LOSS", reason: "RESIGN" },
      eloDelta: null,
      replayPath: "/history/" + black,
    });
    expect(page.items[1]!.result.kind).toBe("WIN");
    expect(JSON.stringify(page)).not.toContain(b.userId);
  });
  it("filters canonical Casual and AI, projects difficulty, and keeps neutral results outside WDL", async () => {
    const a = await member("A"),
      b = await member("B");
    await game(a, b, { reason: "AGREED_DRAW", winner: null });
    await game(a, b, { status: "INTERRUPTED" });
    const ai = await game(null, a, {
      mode: "AI",
      level: "HARD",
      status: "INTERRUPTED",
      reason: "AI_UNAVAILABLE",
    });
    const all = await run(a, (s) => store.list(s));
    expect(all.items.map((r) => r.result.kind).sort()).toEqual([
      "DRAW",
      "INTERRUPTED",
      "INTERRUPTED",
    ]);
    expect(
      all.items
        .filter((r) => r.result.kind === "INTERRUPTED")
        .every((r) => !r.result.countsForWdl && r.eloDelta === null),
    ).toBe(true);
    const page = await run(a, (s) => store.list(s, { filter: "AI" }));
    expect(page.items).toHaveLength(1);
    expect(page.items[0]).toMatchObject({
      id: ai,
      side: "black",
      aiLevel: "HARD",
      typeLabel: "Đấu với Máy - Khó",
      result: { kind: "INTERRUPTED", label: "Bị gián đoạn" },
    });
    expect(
      (await run(a, (s) => store.list(s, { filter: "CASUAL" }))).items,
    ).toHaveLength(2);
    await expect(
      run(a, (s) => store.list(s, { filter: "RANKED" })),
    ).rejects.toMatchObject({
      code: "HISTORY_RANKED_UNAVAILABLE",
      status: 503,
    });
    await expect(run(a, (s) => store.rankedSummary(s))).rejects.toMatchObject({
      code: "HISTORY_RANKED_UNAVAILABLE",
      status: 503,
    });
  });
  it("anonymizes expired Guest opponents without preventing the official player from reading", async () => {
    const a = await member("A"),
      g = await guest("Private Guest Name");
    await game(a, g);
    expect(
      (await run(a, (s) => store.list(s))).items[0]!.opponent.displayName,
    ).toBe("Private Guest Name (Khách)");
    await pool.query(
      "WITH t AS(SELECT clock_timestamp() at) UPDATE xiangqi_auth.guest_sessions SET created_at=at-interval '13 hours',expires_at=at-interval '1 hour' FROM t WHERE guest_id=$1",
      [g.userId],
    );
    const page = await run(a, (s) => store.list(s));
    expect(page.items[0]!.opponent).toEqual({
      displayName: "Khách",
      isGuest: true,
    });
    expect(JSON.stringify(page)).not.toContain("Private Guest Name");
    await expect(run(g, (s) => store.list(s))).rejects.toMatchObject({
      code: "HISTORY_FORBIDDEN",
      status: 403,
    });
    await expect(
      run({ ...g, kind: "member" }, (s) => store.list(s)),
    ).rejects.toMatchObject({ code: "HISTORY_FORBIDDEN" });
  });
  it("paginates exact microsecond timestamps and UUID ties without gaps or duplicates", async () => {
    const a = await member("A"),
      b = await member("B");
    const low = await game(a, b, { at: "2026-10-01T00:00:00.123400Z" });
    const high = await game(a, b, { at: "2026-10-01T00:00:00.123456Z" });
    const tied = await game(a, b, { at: "2026-10-01T00:00:00.123456Z" });
    const ids: string[] = [];
    let cursor;
    do {
      const page = await run(a, (s) => store.list(s, { limit: 1, cursor }));
      ids.push(...page.items.map((r) => r.id));
      cursor = page.nextCursor ?? undefined;
      if (cursor) expect(cursor.endedAt).toMatch(/\.\d{6}Z$/);
    } while (cursor);
    expect(ids).toEqual([high, tied].sort().reverse().concat(low));
  });
  it("rejects malformed pagination, missing actor locks, and corrupt canonical START metadata", async () => {
    const a = await member("A"),
      b = await member("B"),
      id = await game(a, b);
    for (const input of [
      { limit: 0 },
      { limit: 51 },
      { limit: 1.5 },
      { filter: "forged" },
      { cursor: { endedAt: "2026-02-30T00:00:00.000000Z", matchId: id } },
      { cursor: { endedAt: "0000-01-01T00:00:00.000000Z", matchId: id } },
      {
        cursor: { endedAt: "2026-01-01T00:00:00.000000Z", matchId: "not uuid" },
      },
    ])
      await expect(
        run(a, (s) =>
          store.list(s, input as Parameters<HistoryStore["list"]>[1]),
        ),
      ).rejects.toMatchObject({ code: "HISTORY_INPUT_INVALID", status: 400 });
    await expect(
      run(a, (s) => store.list({ ...s, lockedActorIds: new Set() })),
    ).rejects.toMatchObject({ code: "HISTORY_FORBIDDEN" });
    await pool.query(
      "UPDATE public.match_events SET payload=jsonb_set(payload,'{redId}',to_jsonb($2::text)) WHERE match_id=$1 AND type='START'",
      [id, b.userId],
    );
    await expect(run(a, (s) => store.list(s))).rejects.toMatchObject({
      code: "HISTORY_CORRUPT",
      status: 409,
    });
  });
  it("does not write canonical history or resurrect rolled-back terminal records", async () => {
    const a = await member("A"),
      b = await member("B"),
      id = await game(a, b);
    await expect(
      run(a, async (s) => {
        await store.list(s);
        await s.client.query(
          "INSERT INTO public.matches(id,room_id,mode,status,red_user_id,black_user_id,position,created_at,ended_at,outcome) SELECT $2,room_id,mode,status,red_user_id,black_user_id,position,created_at,ended_at,outcome FROM public.matches WHERE id=$1",
          [id, randomUUID()],
        );
        throw new Error("Synthetic rollback");
      }),
    ).rejects.toThrow("Synthetic rollback");
    expect(
      (await pool.query("SELECT count(*)::int n FROM public.matches")).rows[0]
        .n,
    ).toBe(1);
    expect(
      (await pool.query("SELECT count(*)::int n FROM public.match_events"))
        .rows[0].n,
    ).toBe(1);
    expect((await run(a, (s) => store.list(s))).items).toHaveLength(1);
  });
  it("keeps every completed terminal reason truthful for both colors and excludes no neutral records", async () => {
    const a = await member("A"),
      b = await member("B");
    for (const reason of [
      "CHECKMATE",
      "STALEMATE",
      "TIMEOUT",
      "RESIGN",
      "DISCONNECT",
    ])
      await game(a, b, { reason, winner: "BLACK" });
    await game(a, b, { reason: "REPETITION", winner: null });
    await game(a, b, { reason: "BOTH_OFFLINE", status: "INTERRUPTED" });
    const page = await run(a, (s) => store.list(s));
    expect(page.items.filter((r) => r.result.kind === "LOSS")).toHaveLength(5);
    expect(page.items.filter((r) => r.result.kind === "DRAW")).toHaveLength(1);
    expect(page.items.filter((r) => !r.result.countsForWdl)).toHaveLength(1);
    expect(page.items.every((r) => r.eloDelta === null)).toBe(true);
    expect(
      (await run(b, (s) => store.list(s))).items.filter(
        (r) => r.result.kind === "WIN",
      ),
    ).toHaveLength(5);
  });
  it("does not expose a departed Guest name or grant history to a pure spectator", async () => {
    const a = await member("A"),
      g = await guest("Departed private name"),
      spectator = await member("Spectator");
    const id = await game(a, g);
    const room = (
      await pool.query("SELECT room_id FROM public.matches WHERE id=$1", [id])
    ).rows[0].room_id;
    await pool.query(
      "INSERT INTO public.room_members(room_id,user_id,role) VALUES($1,$2,'SPECTATOR')",
      [room, spectator.userId],
    );
    await pool.query(
      "UPDATE xiangqi_auth.guest_sessions SET ended_at=clock_timestamp() WHERE guest_id=$1",
      [g.userId],
    );
    expect((await run(spectator, (s) => store.list(s))).items).toEqual([]);
    expect(
      (await run(a, (s) => store.list(s))).items[0]!.opponent.displayName,
    ).toBe("Khách");
    await expect(run(g, (s) => store.rankedSummary(s))).rejects.toMatchObject({
      code: "HISTORY_FORBIDDEN",
      status: 403,
    });
  });
  it("projects the complete migration7 terminal reason/winner matrix including canonical core draws and perpetual check", async () => {
    const a = await member("A"),
      b = await member("B");
    const expected = new Map<
      string,
      { red: string; black: string; reason: string; counted: boolean }
    >();
    for (const reason of [
      "CHECKMATE",
      "STALEMATE",
      "TIMEOUT",
      "RESIGN",
      "DISCONNECT",
      "PERPETUAL_CHECK",
    ]) {
      for (const winner of ["RED", "BLACK"] as const) {
        const id = await game(a, b, { reason, winner });
        expected.set(id, {
          red: winner === "RED" ? "WIN" : "LOSS",
          black: winner === "BLACK" ? "WIN" : "LOSS",
          reason,
          counted: true,
        });
      }
    }
    for (const reason of [
      "AGREED_DRAW",
      "REPETITION",
      "DRAW_REPETITION",
      "DRAW_NO_CAPTURE",
      "DRAW_AGREEMENT",
      "PERPETUAL_CHECK",
    ]) {
      const id = await game(a, b, { reason, winner: null });
      expected.set(id, { red: "DRAW", black: "DRAW", reason, counted: true });
    }
    for (const reason of ["BOTH_OFFLINE", "SERVER_RESTART", "AI_UNAVAILABLE"]) {
      const id = await game(a, b, {
        reason,
        winner: null,
        status: "INTERRUPTED",
      });
      expected.set(id, {
        red: "INTERRUPTED",
        black: "INTERRUPTED",
        reason,
        counted: false,
      });
    }
    for (const [actor, side] of [
      [a, "red"],
      [b, "black"],
    ] as const) {
      const page = await run(actor, (s) => store.list(s, { limit: 50 }));
      expect(page.items).toHaveLength(21);
      for (const item of page.items) {
        const result = expected.get(item.id)!;
        expect(item.result).toMatchObject({
          kind: result[side],
          reason: result.reason,
          countsForWdl: result.counted,
        });
        expect(item.eloDelta).toBeNull();
      }
    }
  });
  it("rejects invalid reason/winner combinations even when synthetic admin corruption bypasses the database check", async () => {
    const a = await member("A"),
      b = await member("B"),
      id = await game(a, b);
    for (const outcome of [
      { reason: "UNKNOWN_RESULT", winner: null },
      { reason: "TIMEOUT", winner: null },
      { reason: "DRAW_NO_CAPTURE", winner: "RED" },
      { reason: "PERPETUAL_CHECK", winner: "GREEN" },
      { reason: "PERPETUAL_CHECK", winner: ["RED"] },
    ]) {
      const c = await pool.connect();
      try {
        // Deliberately corrupt only this isolated transaction; rollback restores both check and data.
        await c.query(
          "BEGIN; SET LOCAL ROLE postgres; ALTER TABLE public.matches DROP CONSTRAINT matches_status_and_outcome_invariants",
        );
        const corruptId = randomUUID();
        await c.query(
          "INSERT INTO public.matches(id,room_id,mode,status,red_user_id,black_user_id,position,created_at,ended_at,outcome) SELECT $2,room_id,mode,status,red_user_id,black_user_id,position,created_at,ended_at,$3 FROM public.matches WHERE id=$1",
          [id, corruptId, outcome],
        );
        await c.query(
          "INSERT INTO public.match_events(match_id,version,type,payload) SELECT $2::uuid,0,'START',jsonb_set(payload,'{startToken}',to_jsonb(($2::uuid)::text)) FROM public.match_events WHERE match_id=$1 AND type='START'",
          [id, corruptId],
        );
        await c.query("SET LOCAL ROLE app_server");
        await c.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))", [
          "actor:" + a.userId,
        ]);
        await expect(
          store.list({
            client: c,
            actor: a,
            lockedActorIds: new Set([a.userId]),
            lockedRoomIds: new Set(),
          }),
        ).rejects.toMatchObject({ code: "HISTORY_CORRUPT", status: 409 });
      } finally {
        await c.query("ROLLBACK");
        c.release();
      }
    }
  });
  it("projects the same canonical core outcomes for AI without turning neutral draws into interruptions", async () => {
    const a = await member("AI player");
    for (const reason of [
      "DRAW_REPETITION",
      "DRAW_NO_CAPTURE",
      "PERPETUAL_CHECK",
    ])
      await game(a, null, { mode: "AI", reason, winner: null });
    await game(a, null, {
      mode: "AI",
      reason: "PERPETUAL_CHECK",
      winner: "RED",
    });
    await game(a, null, {
      mode: "AI",
      reason: "PERPETUAL_CHECK",
      winner: "BLACK",
    });
    const page = await run(a, (s) => store.list(s, { filter: "AI" }));
    expect(page.items.map((item) => item.result.kind).sort()).toEqual([
      "DRAW",
      "DRAW",
      "DRAW",
      "LOSS",
      "WIN",
    ]);
    expect(
      page.items.every(
        (item) => item.result.countsForWdl && item.eloDelta === null,
      ),
    ).toBe(true);
  });
});
