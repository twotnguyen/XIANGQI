import { randomUUID } from "node:crypto";
import { request } from "node:http";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { initialPosition } from "@xiangqi/xiangqi-core";
import type { createRegistrationRuntime } from "./auth-runtime.js";
import { createApp } from "./app.js";
import { SessionService } from "./login/session.service.js";
import { PostgresLoginStore } from "./login/postgres-login-store.js";
import { LoginError } from "./login/contracts.js";
import { encodePosition } from "./match/position-codec.js";
import { apply, databaseUrl, pool, reset } from "./match/match.test-helper.js";
import { createHistoryRuntime } from "./history-runtime.js";
type Registration = NonNullable<
  Awaited<ReturnType<typeof createRegistrationRuntime>>
>;
const enabled = { HISTORY_ENABLED: "true", AUTH_LOGIN_ENABLED: "true" };
function registration() {
  const users = new Map<
    string,
    { id: string; email: string; email_confirmed_at: string }
  >();
  // Only GoTrue is mocked; SQL fixed sessions, principal checks and transaction locks are real.
  const auth = {
    async signInPassword(): Promise<never> {
      throw new Error("Not used");
    },
    async getUser(token: string) {
      const user = users.get(token);
      if (!user)
        throw new LoginError(
          "SESSION_INVALID",
          "Synthetic bearer invalid",
          401,
        );
      return user;
    },
  };
  const sessions = new SessionService(new PostgresLoginStore(pool), auth);
  return {
    users,
    sessions,
    context: { pool, sessions } as unknown as Registration,
  };
}
async function member(r: ReturnType<typeof registration>) {
  const id = randomUUID(),
    email = id + "@example.invalid",
    at = new Date();
  await pool.query(
    "INSERT INTO auth.users(id,email,email_confirmed_at) VALUES($1,$2,$3)",
    [id, email, at],
  );
  await pool.query(
    "INSERT INTO public.profiles(user_id,username,display_name,completed_at,registration_pending) VALUES($1,$2,'Synthetic history member',$3,false)",
    [id, "m" + id.replaceAll("-", "").slice(0, 18), at],
  );
  const token = "synthetic-" + id;
  r.users.set(token, { id, email, email_confirmed_at: at.toISOString() });
  const issued = await r.sessions.issue(id, false);
  return {
    id,
    proof: { accessToken: token, appSession: issued.appSession },
    headers: {
      Authorization: "Bearer " + token,
      "X-Xiangqi-Session": issued.appSession,
    },
  };
}
describe("History runtime feature configuration", () => {
  it("returns null without touching registration or SQL when disabled/default", async () => {
    const forbidden = {
      get pool() {
        throw new Error("Unexpected pool access");
      },
      get sessions() {
        throw new Error("Unexpected sessions access");
      },
    } as unknown as Registration;
    expect(await createHistoryRuntime({}, forbidden)).toBeNull();
    expect(
      await createHistoryRuntime({ HISTORY_ENABLED: "false" }, forbidden),
    ).toBeNull();
  });
  it("rejects invalid flags and missing actual login/session dependency", async () => {
    for (const [env, context] of [
      [{ HISTORY_ENABLED: "yes" }, null],
      [{ HISTORY_ENABLED: "true" }, null],
      [enabled, null],
      [enabled, { pool, sessions: null } as unknown as Registration],
    ] as const)
      await expect(createHistoryRuntime(env, context)).rejects.toThrow(
        "Invalid History configuration",
      );
  });
});
describe.skipIf(!databaseUrl)(
  "History factory real synthetic SQL readiness and native module",
  () => {
    beforeEach(async () => {
      await pool.query(
        "DROP SCHEMA IF EXISTS xiangqi_ai CASCADE; DROP SCHEMA IF EXISTS xiangqi_chat CASCADE",
      );
      await reset();
      await apply("supabase/migrations/20261011000007_match_outcomes.sql");
    });
    afterAll(() => pool.end());
    it("enables with migration1–7 alone, serves own terminal history, protects bad JSON and leaves borrowed pool open", async () => {
      const r = registration(),
        owner = await member(r),
        opponent = await member(r),
        outsider = await member(r);
      const roomId = randomUUID(),
        matchId = randomUUID();
      await pool.query(
        "INSERT INTO public.rooms(id,owner_id,name,time_control) VALUES($1,$2,'Synthetic history',300)",
        [roomId, owner.id],
      );
      await pool.query(
        "INSERT INTO public.matches(id,room_id,mode,status,red_user_id,black_user_id,position,created_at,ended_at,outcome) VALUES($1,$2,'ONLINE','FINISHED',$3,$4,$5,'2026-01-01',clock_timestamp(),$6)",
        [
          matchId,
          roomId,
          owner.id,
          opponent.id,
          encodePosition(initialPosition()),
          { reason: "RESIGN", winner: "RED" },
        ],
      );
      await pool.query(
        "INSERT INTO public.match_events(match_id,version,type,payload) VALUES($1,0,'START',$2)",
        [
          matchId,
          {
            encoding: "xiangqi-core-v1",
            startToken: matchId,
            roomId,
            redId: owner.id,
            blackId: opponent.id,
            ruleSetVersion: "xiangqi-simple-v1",
            initialPosition: encodePosition(initialPosition()),
          },
        ],
      );
      const runtime = await createHistoryRuntime(enabled, r.context);
      expect(runtime).not.toBeNull();
      expect(Object.keys(runtime!).sort()).toEqual(["module", "service"]);
      expect((await runtime!.service.list(owner.proof)).items[0]!.id).toBe(
        matchId,
      );
      const app = await createApp([], [runtime!.module]);
      try {
        await app.listen(0, "127.0.0.1");
        const base = await app.getUrl();
        const response = await fetch(base + "/history", {
          headers: owner.headers,
        });
        expect(response.status).toBe(200);
        expect(response.headers.get("cache-control")).toBe("no-store");
        expect((await response.json()).items[0].id).toBe(matchId);
        expect(
          await (
            await fetch(base + "/history", { headers: outsider.headers })
          ).json(),
        ).toEqual({ items: [], nextCursor: null });
        const body = "synthetic-private-body";
        const malformed = await new Promise<{
          status?: number;
          cache?: string | string[];
          body: string;
        }>((resolve, reject) => {
          const req = request(
            base + "/history",
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(body),
              },
            },
            (res) => {
              let content = "";
              res.on("data", (c) => (content += c));
              res.on("end", () =>
                resolve({
                  status: res.statusCode,
                  cache: res.headers["cache-control"],
                  body: content,
                }),
              );
            },
          );
          req.on("error", reject);
          req.end(body);
        });
        expect(malformed.status).toBe(400);
        expect(malformed.cache).toBe("no-store");
        expect(JSON.parse(malformed.body).code).toBe("HISTORY_INPUT_INVALID");
        expect(malformed.body).not.toContain("synthetic-private");
      } finally {
        await app.close();
      }
      expect((await pool.query("SELECT 1 value")).rows[0].value).toBe(1);
    });
    it.each(["DISABLE ROW LEVEL SECURITY", "NO FORCE ROW LEVEL SECURITY"])(
      "refuses unsafe match RLS: %s",
      async (change) => {
        await pool.query("ALTER TABLE public.matches " + change);
        await expect(
          createHistoryRuntime(enabled, registration().context),
        ).rejects.toThrow("History migration is not ready");
      },
    );
    it("refuses missing server SELECT, public client grant and missing required policy", async () => {
      await pool.query("REVOKE SELECT ON public.match_events FROM app_server");
      await expect(
        createHistoryRuntime(enabled, registration().context),
      ).rejects.toThrow("History migration is not ready");
      await pool.query(
        "GRANT SELECT ON public.match_events TO app_server; GRANT SELECT ON public.matches TO authenticated",
      );
      await expect(
        createHistoryRuntime(enabled, registration().context),
      ).rejects.toThrow("History migration is not ready");
      await pool.query(
        "REVOKE SELECT ON public.matches FROM authenticated; DROP POLICY app_server_matches ON public.matches",
      );
      await expect(
        createHistoryRuntime(enabled, registration().context),
      ).rejects.toThrow("History migration is not ready");
    });
    it("refuses stale outcome constraints despite familiar names and rejects missing timestamp column", async () => {
      await pool.query(
        "ALTER TABLE public.matches DROP CONSTRAINT matches_status_and_outcome_invariants; ALTER TABLE public.matches ADD CONSTRAINT matches_status_and_outcome_invariants CHECK(true)",
      );
      await expect(
        createHistoryRuntime(enabled, registration().context),
      ).rejects.toThrow("History migration is not ready");
      await pool.query(
        "ALTER TABLE public.matches DROP COLUMN ended_at CASCADE",
      );
      await expect(
        createHistoryRuntime(enabled, registration().context),
      ).rejects.toThrow("History migration is not ready");
    });
    it("refuses unsafe table ownership and app_server privilege escalation", async () => {
      await pool.query("ALTER TABLE public.matches OWNER TO app_server");
      await expect(
        createHistoryRuntime(enabled, registration().context),
      ).rejects.toThrow("History migration is not ready");
      await pool.query(
        "ALTER TABLE public.matches OWNER TO postgres; ALTER ROLE app_server BYPASSRLS",
      );
      try {
        await expect(
          createHistoryRuntime(enabled, registration().context),
        ).rejects.toThrow("History migration is not ready");
      } finally {
        await pool.query("ALTER ROLE app_server NOBYPASSRLS");
      }
    });
    it("refuses a familiar START index name with different uniqueness semantics", async () => {
      await pool.query(
        "DROP INDEX public.match_start_token_unique; CREATE UNIQUE INDEX match_start_token_unique ON public.match_events(id)",
      );
      await expect(
        createHistoryRuntime(enabled, registration().context),
      ).rejects.toThrow("History migration is not ready");
    });
    it("refuses incomplete Guest dependency schema and missing coordinator row-lock permissions", async () => {
      await pool.query(
        "ALTER TABLE xiangqi_auth.guest_sessions RENAME TO synthetic_missing_guest_sessions",
      );
      await expect(
        createHistoryRuntime(enabled, registration().context),
      ).rejects.toThrow("History migration is not ready");
      await pool.query(
        "ALTER TABLE xiangqi_auth.synthetic_missing_guest_sessions RENAME TO guest_sessions; REVOKE UPDATE ON public.rooms FROM app_server",
      );
      await expect(
        createHistoryRuntime(enabled, registration().context),
      ).rejects.toThrow("History migration is not ready");
    });
  },
);
