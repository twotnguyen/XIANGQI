import { createHash, randomUUID } from "node:crypto";
import { afterAll, afterEach, beforeEach, describe, expect, it } from "vitest";
import { initialPosition, playMove } from "@xiangqi/xiangqi-core";
import { createApp } from "../app.js";
import { LoginError } from "../login/contracts.js";
import { SessionService } from "../login/session.service.js";
import { PostgresLoginStore } from "../login/postgres-login-store.js";
import { PostgresMemberRoomAuthorizer } from "../room/member-room-auth.js";
import { RoomTransactions } from "../room/room-transactions.js";
import { apply, databaseUrl, pool, reset } from "../match/match.test-helper.js";
import { encodeMove, encodePosition } from "../match/position-codec.js";
import type { RoomScope } from "../room/contracts.js";
import { HistoryStore } from "./history-store.js";
import { HistoryHttpService } from "./history-http.service.js";
import { ReplayStore } from "./replay-store.js";
import { ReplayHttpService } from "./replay-http.service.js";
import { HistoryModule } from "./history.module.js";
const identities = new Map<
  string,
  { id: string; email: string; email_confirmed_at: string }
>();
let providerCalls = 0,
  slowRead = false;
// Only GoTrue boundary is synthetic; app sessions, locks, membership and replay are actual SQL.
const provider = {
  async signInPassword(): Promise<never> {
    throw Error("Not used");
  },
  async getUser(token: string) {
    providerCalls++;
    const value = identities.get(token);
    if (!value) throw new LoginError("SESSION_INVALID", "synthetic token", 401);
    return value;
  },
};
const sessions = new SessionService(new PostgresLoginStore(pool), provider),
  transactions = new RoomTransactions(pool),
  authorizer = new PostgresMemberRoomAuthorizer(sessions),
  store = new ReplayStore();
const history = new HistoryHttpService(
  new HistoryStore(),
  transactions,
  authorizer,
);
const replay = new ReplayHttpService(
  {
    async read(scope: RoomScope, id: string) {
      const value = await store.read(scope, id);
      if (slowRead)
        await scope.client.query(
          "SELECT pg_sleep(GREATEST(0,EXTRACT(EPOCH FROM expires_at-clock_timestamp()))+0.02) FROM xiangqi_auth.app_sessions WHERE user_id=$1 AND revoked_at IS NULL",
          [scope.actor.userId],
        );
      return value;
    },
  },
  transactions,
  authorizer,
);
let app: Awaited<ReturnType<typeof createApp>> | undefined,
  base = "";
async function member() {
  const userId = randomUUID(),
    token = "t" + randomUUID(),
    email = userId + "@example.invalid",
    at = new Date();
  await pool.query(
    "INSERT INTO auth.users(id,email,email_confirmed_at) VALUES($1,$2,$3)",
    [userId, email, at],
  );
  await pool.query(
    "INSERT INTO public.profiles(user_id,username,display_name,completed_at,registration_pending) VALUES($1,$2,'PRIVATE_MEMBER_NAME',$3,false)",
    [userId, "m" + userId.replaceAll("-", "").slice(0, 18), at],
  );
  identities.set(token, {
    id: userId,
    email,
    email_confirmed_at: at.toISOString(),
  });
  const issued = await sessions.issue(userId, false);
  return {
    userId,
    kind: "member" as const,
    token,
    cap: issued.appSession,
    headers: {
      Authorization: "Bearer " + token,
      "X-Xiangqi-Session": issued.appSession,
    },
  };
}
async function waitActor() {
  for (let i = 0; i < 200; i++) {
    if (
      (
        await pool.query(
          "SELECT count(*)::int n FROM pg_stat_activity WHERE datname=current_database() AND wait_event='advisory'",
        )
      ).rows[0].n > 0
    )
      return;
    await new Promise((r) => setTimeout(r, 5));
  }
  throw Error("HTTP did not reach actor lock wait");
}
async function counts() {
  return (
    await pool.query(
      "SELECT (SELECT jsonb_agg(to_jsonb(m) ORDER BY id) FROM public.matches m) match_rows,(SELECT count(*) FROM public.matches)::int matches,(SELECT count(*) FROM public.match_events)::int events,(SELECT count(*) FROM public.match_moves)::int moves",
    )
  ).rows[0];
}
function request(id: string, headers: Record<string, string>, query = "") {
  return fetch(`${base}/history/${id}${query}`, { headers });
}
async function game(
  red: { userId: string; kind: "member" },
  black: { userId: string; kind: "member" } | null,
  options: {
    mode?: "ONLINE" | "AI";
    status?: string;
    start?: Record<string, unknown>;
    position?: unknown;
    activeIds?: unknown;
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
    "INSERT INTO public.matches(id,room_id,mode,status,red_user_id,black_user_id,ai_side,ai_level,position,version,ply,active_move_ids,ended_at,outcome,created_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,4,2,$10,$11,$12,'2026-01-01')",
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

describe.skipIf(!databaseUrl)(
  "Replay native HTTP / SQL with synthetic GoTrue boundary",
  () => {
    beforeEach(async () => {
      identities.clear();
      providerCalls = 0;
      slowRead = false;
      await pool.query(
        "DROP SCHEMA IF EXISTS xiangqi_ai CASCADE; DROP SCHEMA IF EXISTS xiangqi_chat CASCADE",
      );
      await reset();
      await apply("supabase/migrations/20261011000007_match_outcomes.sql");
      app = await createApp(
        ["http://localhost:5173"],
        [HistoryModule.forRoot(history, replay)],
      );
      await app.listen(0, "127.0.0.1");
      base = await app.getUrl();
    });
    afterEach(async () => {
      await app?.close();
      app = undefined;
    });
    afterAll(() => pool.end());
    it("reads golden effective branch for both players without writes or private metadata", async () => {
      const a = await member(),
        b = await member(),
        g = await game(a, b),
        before = await counts();
      for (const [actor, side] of [
        [a, "red"],
        [b, "black"],
      ] as const) {
        const response = await request(g.id, actor.headers);
        expect(response.status).toBe(200);
        expect(response.headers.get("cache-control")).toBe("no-store");
        const value = await response.json();
        expect(value).toEqual({
          id: g.id,
          mode: "CASUAL",
          side,
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
        for (const secret of [
          a.userId,
          b.userId,
          a.cap,
          a.token,
          g.discarded,
          "PRIVATE",
          "ownerId",
          "payload",
        ])
          expect(JSON.stringify(value)).not.toContain(secret);
      }
      expect(await counts()).toEqual(before);
      expect(providerCalls).toBe(2);
    });
    it("reads AI owner's actual side, no alternative/share route", async () => {
      const a = await member(),
        g = await game(a, null, { mode: "AI", blackAiOwner: true });
      expect(await (await request(g.id, a.headers)).json()).toMatchObject({
        mode: "AI",
        side: "black",
      });
      expect(
        (
          await fetch(`${base}/rooms/${g.id}/replay/${g.id}`, {
            headers: a.headers,
          })
        ).status,
      ).toBe(404);
      expect((await request(g.id, a.headers, "?share=1")).status).toBe(400);
    });
    it("denies spectator, outsider, missing and active uniformly404", async () => {
      const a = await member(),
        b = await member(),
        outsider = await member(),
        spectator = await member(),
        g = await game(a, b),
        active = await game(a, b, { status: "ACTIVE" });
      const roomId = (
        await pool.query("SELECT room_id FROM public.matches WHERE id=$1", [
          g.id,
        ])
      ).rows[0].room_id;
      await pool.query(
        "INSERT INTO public.room_members(room_id,user_id,role) VALUES($1,$2,'SPECTATOR')",
        [roomId, spectator.userId],
      );
      for (const [id, actor] of [
        [g.id, outsider],
        [g.id, spectator],
        [randomUUID(), a],
        [active.id, a],
      ] as const) {
        const r = await request(id, actor.headers);
        expect(r.status).toBe(404);
        expect(r.headers.get("cache-control")).toBe("no-store");
        expect(await r.json()).toMatchObject({ code: "REPLAY_NOT_FOUND" });
      }
    });
    it("denies Guest-only capability and missing member proof without data", async () => {
      const a = await member(),
        b = await member(),
        g = await game(a, b);
      for (const headers of [{}, { "X-Guest-Capability": "a".repeat(43) }]) {
        const r = await request(g.id, headers);
        expect(r.status).toBe(401);
        expect(r.headers.get("cache-control")).toBe("no-store");
        expect(await r.json()).toMatchObject({ code: "AUTH_REQUIRED" });
      }
    });
    it("rejects malformed UUID and query ownership before read", async () => {
      const a = await member(),
        b = await member(),
        g = await game(a, b);
      for (const [id, q] of [
        ["invalid", ""],
        [g.id, "?ownerId=" + b.userId],
        [g.id, "?unknown=1"],
      ]) {
        const r = await request(id!, a.headers, q);
        expect(r.status).toBe(400);
        expect(r.headers.get("cache-control")).toBe("no-store");
      }
    });
    it("sanitizes bad JSON before controller with no-store", async () => {
      const a = await member(),
        r = await fetch(`${base}/history/${randomUUID()}`, {
          method: "POST",
          headers: { ...a.headers, "Content-Type": "application/json" },
          body: '{"private-email":',
        });
      expect(r.status).toBe(400);
      expect(r.headers.get("cache-control")).toBe("no-store");
      expect(await r.json()).toMatchObject({ code: "HISTORY_INPUT_INVALID" });
    });
    it.each(["expired", "revoked"])(
      "denies %s fixed session without private response",
      async (mode) => {
        const a = await member(),
          b = await member(),
          g = await game(a, b),
          hash = createHash("sha256").update(a.cap).digest("hex");
        await pool.query(
          mode === "expired"
            ? "WITH t AS(SELECT clock_timestamp() AS at) UPDATE xiangqi_auth.app_sessions SET created_at=t.at-interval '12 hours',expires_at=t.at FROM t WHERE token_hash=$1"
            : "UPDATE xiangqi_auth.app_sessions SET revoked_at=clock_timestamp() WHERE token_hash=$1",
          [hash],
        );
        const r = await request(g.id, a.headers);
        expect(r.status).toBe(401);
        expect(r.headers.get("cache-control")).toBe("no-store");
        expect(await r.json()).toMatchObject({ code: "AUTH_REQUIRED" });
      },
    );
    it.each(["expired", "revoked"])(
      "rechecks %s after actor advisory lock wait",
      async (mode) => {
        const a = await member(),
          b = await member(),
          g = await game(a, b),
          blocker = await pool.connect();
        await blocker.query("BEGIN");
        await blocker.query(
          "SELECT pg_advisory_xact_lock(hashtextextended($1,0))",
          ["actor:" + a.userId],
        );
        try {
          const pending = request(g.id, a.headers);
          await waitActor();
          const hash = createHash("sha256").update(a.cap).digest("hex");
          await pool.query(
            mode === "expired"
              ? "WITH t AS(SELECT clock_timestamp() AS at) UPDATE xiangqi_auth.app_sessions SET created_at=t.at-interval '12 hours',expires_at=t.at FROM t WHERE token_hash=$1"
              : "UPDATE xiangqi_auth.app_sessions SET revoked_at=clock_timestamp() WHERE token_hash=$1",
            [hash],
          );
          await blocker.query("COMMIT");
          const r = await pending;
          expect(r.status).toBe(401);
          expect(r.headers.get("cache-control")).toBe("no-store");
          expect(await r.json()).toMatchObject({ code: "AUTH_REQUIRED" });
        } finally {
          await blocker.query("ROLLBACK");
          blocker.release();
        }
      },
    );
    it("rechecks fixed expiry after actual SQL replay read and pg_sleep before response", async () => {
      const a = await member(),
        b = await member(),
        g = await game(a, b);
      await pool.query(
        "WITH t AS(SELECT clock_timestamp()+interval '700 milliseconds' AS at) UPDATE xiangqi_auth.app_sessions SET created_at=t.at-interval '12 hours',expires_at=t.at FROM t WHERE user_id=$1",
        [a.userId],
      );
      slowRead = true;
      const r = await request(g.id, a.headers);
      expect(r.status).toBe(401);
      expect(r.headers.get("cache-control")).toBe("no-store");
      const value = await r.json();
      expect(value).toMatchObject({ code: "AUTH_REQUIRED" });
      expect(value.positions).toBeUndefined();
      expect(providerCalls).toBe(1);
    });
    it.each(["parent", "event", "position"])(
      "fails closed for canonical %s corruption",
      async (kind) => {
        const a = await member(),
          b = await member(),
          g = await game(
            a,
            b,
            kind === "position"
              ? { position: encodePosition(initialPosition()) }
              : {},
          );
        if (kind === "parent")
          await pool.query(
            "UPDATE public.match_moves SET parent_move_id=NULL WHERE id=$1",
            [g.second],
          );
        if (kind === "event")
          await pool.query(
            "UPDATE public.match_events SET payload=jsonb_set(payload,'{moveId}',to_jsonb($2::text)) WHERE match_id=$1 AND version=2",
            [g.id, g.discarded],
          );
        const r = await request(g.id, a.headers);
        expect(r.status).toBe(409);
        expect(r.headers.get("cache-control")).toBe("no-store");
        expect(await r.json()).toMatchObject({ code: "REPLAY_CORRUPT" });
      },
    );
    it("direct anon/authenticated browser roles cannot SELECT canonical Replay tables", async () => {
      const a = await member(),
        b = await member();
      await game(a, b);
      for (const role of ["anon", "authenticated"])
        for (const table of ["matches", "match_events", "match_moves"]) {
          const c = await pool.connect();
          try {
            await c.query("BEGIN");
            await c.query("SET LOCAL ROLE " + role);
            await expect(
              c.query("SELECT * FROM public." + table),
            ).rejects.toMatchObject({ code: "42501" });
          } finally {
            await c.query("ROLLBACK");
            c.release();
          }
        }
    });
  },
);
