import { createHash, randomUUID } from "node:crypto";
import { afterAll, afterEach, beforeEach, describe, expect, it } from "vitest";
import { initialPosition } from "@xiangqi/xiangqi-core";
import { createApp } from "../app.js";
import { LoginError } from "../login/contracts.js";
import { SessionService } from "../login/session.service.js";
import { PostgresLoginStore } from "../login/postgres-login-store.js";
import { PostgresMemberRoomAuthorizer } from "../room/member-room-auth.js";
import { RoomTransactions } from "../room/room-transactions.js";
import { encodePosition } from "../match/position-codec.js";
import { apply, databaseUrl, pool, reset } from "../match/match.test-helper.js";
import { HistoryStore } from "./history-store.js";
import { HistoryHttpService } from "./history-http.service.js";
import { HistoryModule } from "./history.module.js";
type Identity = { id: string; email: string; email_confirmed_at: string };
const identities = new Map<string, Identity>();
let upstreamFailure = false,
  upstreamCalls = 0;
// GoTrue is the only mocked authority boundary; fixed sessions/account state/locks are actual SQL.
const provider = {
  async signInPassword(): Promise<never> {
    throw new Error("Not used");
  },
  async getUser(token: string) {
    upstreamCalls++;
    if (upstreamFailure) throw new Error("synthetic private provider payload");
    const identity = identities.get(token);
    if (!identity)
      throw new LoginError("SESSION_INVALID", "synthetic private token", 401);
    return identity;
  },
};
const sessions = new SessionService(new PostgresLoginStore(pool), provider);
const service = new HistoryHttpService(
  new HistoryStore(),
  new RoomTransactions(pool),
  new PostgresMemberRoomAuthorizer(sessions),
);
let app: Awaited<ReturnType<typeof createApp>> | undefined,
  base = "";
async function member(name: string) {
  const id = randomUUID(),
    token = "t" + randomUUID(),
    confirmed = new Date();
  const email = id + "@example.invalid";
  await pool.query(
    "INSERT INTO auth.users(id,email,email_confirmed_at) VALUES($1,$2,$3)",
    [id, email, confirmed],
  );
  await pool.query(
    "INSERT INTO public.profiles(user_id,username,display_name,completed_at,registration_pending) VALUES($1,$2,$3,$4,false)",
    [id, "m" + id.replaceAll("-", "").slice(0, 18), name, confirmed],
  );
  identities.set(token, {
    id,
    email,
    email_confirmed_at: confirmed.toISOString(),
  });
  const issued = await sessions.issue(id, false);
  return {
    id,
    token,
    cap: issued.appSession,
    headers: {
      Authorization: "Bearer " + token,
      "X-Xiangqi-Session": issued.appSession,
    },
  };
}
async function terminal(
  redId: string,
  blackId: string,
  at = "2026-10-01T00:00:00.123456Z",
) {
  const id = randomUUID(),
    roomId = randomUUID();
  await pool.query(
    "INSERT INTO public.rooms(id,owner_id,name,time_control) VALUES($1,$2,'Synthetic history',300)",
    [roomId, redId],
  );
  await pool.query(
    "INSERT INTO public.matches(id,room_id,mode,status,red_user_id,black_user_id,position,created_at,ended_at,outcome) VALUES($1,$2,'ONLINE','FINISHED',$3,$4,$5,'2026-01-01',$6,$7)",
    [
      id,
      roomId,
      redId,
      blackId,
      encodePosition(initialPosition()),
      at,
      { reason: "RESIGN", winner: "RED" },
    ],
  );
  await pool.query(
    "INSERT INTO public.match_events(match_id,version,type,payload) VALUES($1,0,'START',$2)",
    [
      id,
      {
        encoding: "xiangqi-core-v1",
        startToken: id,
        roomId,
        redId,
        blackId,
        initialPosition: encodePosition(initialPosition()),
        ruleSetVersion: "xiangqi-simple-v1",
      },
    ],
  );
  return { id, roomId };
}
async function waitingActor() {
  for (let i = 0; i < 200; i++) {
    const row = (
      await pool.query(
        "SELECT count(*)::int n FROM pg_stat_activity WHERE datname=current_database() AND wait_event='advisory'",
      )
    ).rows[0];
    if (row.n > 0) return;
    await new Promise((r) => setTimeout(r, 5));
  }
  throw new Error("Native HTTP request never reached actor lock wait");
}
describe.skipIf(!databaseUrl)(
  "History module native HTTP with real fixed member sessions and SQL",
  () => {
    beforeEach(async () => {
      identities.clear();
      upstreamFailure = false;
      upstreamCalls = 0;
      await pool.query(
        "DROP SCHEMA IF EXISTS xiangqi_ai CASCADE; DROP SCHEMA IF EXISTS xiangqi_chat CASCADE",
      );
      await reset();
      await apply("supabase/migrations/20261011000007_match_outcomes.sql");
      app = await createApp(
        ["http://localhost:5173"],
        [HistoryModule.forRoot(service)],
      );
      await app.listen(0, "127.0.0.1");
      base = await app.getUrl();
    });
    afterEach(async () => {
      await app?.close();
      app = undefined;
    });
    afterAll(() => pool.end());
    it("returns member-owned terminal safe DTO with no-store and never accepts a forged owner or spectator membership", async () => {
      const a = await member("A"),
        b = await member("B"),
        spectator = await member("Spectator");
      const { id, roomId } = await terminal(a.id, b.id);
      await pool.query(
        "INSERT INTO public.room_members(room_id,user_id,role) VALUES($1,$2,'SPECTATOR')",
        [roomId, spectator.id],
      );
      const response = await fetch(base + "/history", { headers: a.headers });
      expect(response.status).toBe(200);
      expect(response.headers.get("cache-control")).toBe("no-store");
      const body = await response.json();
      expect(body.items).toHaveLength(1);
      expect(body.items[0]).toMatchObject({
        id,
        type: "CASUAL",
        side: "red",
        opponent: { displayName: "B", isGuest: false },
        result: { kind: "WIN", reason: "RESIGN" },
      });
      const text = JSON.stringify(body);
      for (const secret of [a.cap, a.token, b.id, a.id, "position", "email"])
        expect(text).not.toContain(secret);
      const foreign = await fetch(base + "/history", {
        headers: spectator.headers,
      });
      expect(await foreign.json()).toEqual({ items: [], nextCursor: null });
      const forged = await fetch(base + "/history?ownerId=" + a.id, {
        headers: spectator.headers,
      });
      expect(forged.status).toBe(400);
      expect(forged.headers.get("cache-control")).toBe("no-store");
      expect(
        (await fetch(base + "/history/" + id, { headers: a.headers })).status,
      ).toBe(404);
    });
    it("parses strict filters, limit and microsecond JSON cursor and keeps Ranked explicitly unavailable", async () => {
      const a = await member("A"),
        b = await member("B");
      const low = await terminal(a.id, b.id, "2026-10-01T00:00:00.123400Z"),
        high = await terminal(a.id, b.id);
      const first = await fetch(base + "/history?filter=CASUAL&limit=1", {
        headers: a.headers,
      });
      expect(first.status).toBe(200);
      const page = await first.json();
      expect(page.items[0].id).toBe(high.id);
      expect(page.nextCursor.endedAt).toBe("2026-10-01T00:00:00.123456Z");
      const second = await fetch(
        base +
          "/history?limit=1&cursor=" +
          encodeURIComponent(JSON.stringify(page.nextCursor)),
        { headers: a.headers },
      );
      expect((await second.json()).items[0].id).toBe(low.id);
      for (const path of [
        "/history?filter=RANKED",
        "/history/ranked-summary",
      ]) {
        const response = await fetch(base + path, { headers: a.headers });
        expect(response.status).toBe(503);
        expect((await response.json()).code).toBe("HISTORY_RANKED_UNAVAILABLE");
        expect(response.headers.get("cache-control")).toBe("no-store");
      }
      expect(
        await (
          await fetch(base + "/history?filter=AI", { headers: a.headers })
        ).json(),
      ).toEqual({ items: [], nextCursor: null });
    });
    it("rejects duplicate, structured, unknown and malformed query inputs without returning private error metadata", async () => {
      const a = await member("A");
      const malformed = [
        "filter=ALL&filter=AI",
        "filter=unknown",
        "limit=0",
        "limit=51",
        "limit=01",
        "limit=1.5",
        "limit=1e1",
        "limit[]=1",
        "cursor=oops",
        "cursor=null",
        "cursor=%5B%5D",
        "cursor=" +
          encodeURIComponent(
            JSON.stringify({
              endedAt: "2026-02-30T00:00:00.000000Z",
              matchId: randomUUID(),
            }),
          ),
        "cursor=" +
          encodeURIComponent(
            JSON.stringify({
              endedAt: "2026-01-01T00:00:00.000000Z",
              matchId: randomUUID(),
              ownerId: a.id,
            }),
          ),
        "userId=" + a.id,
      ];
      for (const query of malformed) {
        const response = await fetch(base + "/history?" + query, {
          headers: a.headers,
        });
        expect(response.status, query).toBe(400);
        expect(response.headers.get("cache-control")).toBe("no-store");
        const body = await response.text();
        expect(body).toContain("HISTORY_INPUT_INVALID");
        expect(body).not.toContain(a.cap);
      }
    });
    it("requires both valid bearer and session, supports fixed cookie, and does not fall back from malformed explicit header", async () => {
      const a = await member("A");
      for (const headers of [
        {},
        { Authorization: a.headers.Authorization },
        { "X-Xiangqi-Session": a.cap },
        { ...a.headers, Authorization: "Bearer revoked-token" },
        { ...a.headers, "X-Xiangqi-Session": "x".repeat(43) },
      ]) {
        const response = await fetch(base + "/history", { headers });
        expect(response.status).toBe(401);
        expect(response.headers.get("cache-control")).toBe("no-store");
      }
      expect(
        (
          await fetch(base + "/history", {
            headers: {
              Authorization: a.headers.Authorization,
              Cookie: "xiangqi_session=" + a.cap,
            },
          })
        ).status,
      ).toBe(200);
      expect(
        (
          await fetch(base + "/history", {
            headers: {
              Authorization: a.headers.Authorization,
              Cookie: "xiangqi_session=" + a.cap,
              "X-Xiangqi-Session": "invalid",
            },
          })
        ).status,
      ).toBe(401);
    });
    it.each(["expiry", "revocation"])(
      "denies fixed session %s after provider resolution during actual actor lock wait",
      async (change) => {
        const a = await member("A"),
          b = await member("B");
        await terminal(a.id, b.id);
        const blocker = await pool.connect();
        try {
          await blocker.query("BEGIN; SET LOCAL ROLE app_server");
          await blocker.query(
            "SELECT pg_advisory_xact_lock(hashtextextended($1,0))",
            ["actor:" + a.id],
          );
          const pending = fetch(base + "/history", { headers: a.headers });
          await waitingActor();
          expect(upstreamCalls).toBe(1);
          if (change === "expiry") await blocker.query("RESET ROLE");
          await blocker.query(
            change === "expiry"
              ? "WITH t AS(SELECT clock_timestamp() at) UPDATE xiangqi_auth.app_sessions SET created_at=at-interval '12 hours',expires_at=at FROM t WHERE token_hash=$1"
              : "UPDATE xiangqi_auth.app_sessions SET revoked_at=clock_timestamp() WHERE token_hash=$1",
            [createHash("sha256").update(a.cap).digest("hex")],
          );
          await blocker.query("COMMIT");
          const response = await pending;
          expect(response.status).toBe(401);
          expect((await response.json()).code).toBe("AUTH_REQUIRED");
        } finally {
          await blocker.query("ROLLBACK");
          blocker.release();
        }
      },
    );
    it("anonymizes expired Guest opponent and rejects Guest/uncompleted accounts rather than serving personal history", async () => {
      const a = await member("A"),
        guestId = randomUUID();
      await pool.query(
        "INSERT INTO xiangqi_auth.principals(id,kind) VALUES($1,'guest')",
        [guestId],
      );
      await pool.query(
        "INSERT INTO public.profiles(user_id,display_name) VALUES($1,'Secret Guest')",
        [guestId],
      );
      await pool.query(
        "WITH t AS(SELECT clock_timestamp() at) INSERT INTO xiangqi_auth.guest_sessions(token_hash,guest_id,created_at,expires_at) SELECT $1,$2,at-interval '13 hours',at-interval '1 hour' FROM t",
        [guestId.replaceAll("-", "").repeat(2), guestId],
      );
      await terminal(a.id, guestId);
      const response = await fetch(base + "/history", { headers: a.headers });
      const body = await response.json();
      expect(body.items[0].opponent).toEqual({
        displayName: "Khách",
        isGuest: true,
      });
      expect(JSON.stringify(body)).not.toContain("Secret Guest");
      identities.set("synthetic-guest", {
        id: guestId,
        email: "guest@example.invalid",
        email_confirmed_at: new Date().toISOString(),
      });
      expect(
        (
          await fetch(base + "/history", {
            headers: {
              Authorization: "Bearer synthetic-guest",
              "X-Xiangqi-Session": a.cap,
            },
          })
        ).status,
      ).toBe(401);
      await pool.query(
        "UPDATE public.profiles SET registration_pending=true WHERE user_id=$1",
        [a.id],
      );
      expect(
        (await fetch(base + "/history", { headers: a.headers })).status,
      ).toBe(401);
    });
    it("sanitizes provider outage, keeps account/session dates intact and advertises no-store", async () => {
      const a = await member("A");
      const before = (
        await pool.query(
          "SELECT created_at,expires_at,revoked_at FROM xiangqi_auth.app_sessions WHERE user_id=$1",
          [a.id],
        )
      ).rows;
      upstreamFailure = true;
      const response = await fetch(base + "/history", { headers: a.headers });
      expect(response.status).toBe(503);
      expect(response.headers.get("cache-control")).toBe("no-store");
      const text = await response.text();
      expect(text).not.toContain("private provider");
      expect(text).not.toContain(a.cap);
      expect(
        (
          await pool.query(
            "SELECT created_at,expires_at,revoked_at FROM xiangqi_auth.app_sessions WHERE user_id=$1",
            [a.id],
          )
        ).rows,
      ).toEqual(before);
    });
    it("rejects a fixed deadline crossed while waiting for room locks after initial session authorization", async () => {
      const a = await member("A"),
        b = await member("B"),
        { roomId } = await terminal(a.id, b.id);
      await pool.query(
        "WITH t AS(SELECT clock_timestamp()+interval '2 seconds' deadline) UPDATE xiangqi_auth.app_sessions SET created_at=deadline-interval '12 hours',expires_at=deadline FROM t WHERE user_id=$1",
        [a.id],
      );
      const blocker = await pool.connect();
      try {
        await blocker.query("BEGIN");
        await blocker.query(
          "SELECT id FROM public.rooms WHERE id=$1 FOR UPDATE",
          [roomId],
        );
        const pending = fetch(base + "/history", { headers: a.headers });
        let reached = false;
        for (let i = 0; i < 200; i++) {
          const row = (
            await pool.query(
              "SELECT count(*)::int n FROM pg_stat_activity WHERE datname=current_database() AND wait_event_type='Lock' AND query LIKE 'SELECT id FROM public.rooms WHERE id=ANY%'",
            )
          ).rows[0];
          if (row.n > 0) {
            reached = true;
            break;
          }
          await new Promise((r) => setTimeout(r, 5));
        }
        expect(reached).toBe(true);
        let expired = false;
        for (let i = 0; i < 500; i++) {
          expired = (
            await pool.query(
              "SELECT clock_timestamp()>=expires_at expired FROM xiangqi_auth.app_sessions WHERE user_id=$1",
              [a.id],
            )
          ).rows[0].expired;
          if (expired) break;
          await new Promise((r) => setTimeout(r, 5));
        }
        expect(expired).toBe(true);
        await blocker.query("COMMIT");
        const response = await pending;
        expect(response.status).toBe(401);
        expect((await response.json()).code).toBe("AUTH_REQUIRED");
        expect(upstreamCalls).toBe(1);
      } finally {
        await blocker.query("ROLLBACK");
        blocker.release();
      }
    });
  },
);
