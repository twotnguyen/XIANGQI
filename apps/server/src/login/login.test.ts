import { createApp } from "../app.js";
import { SessionModule } from "../session/session.module.js";
import { RegistrationError } from "../auth/contracts.js";
import "reflect-metadata";
import { Controller, Get, Module, Req, UseGuards } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { performance } from "node:perf_hooks";
import { LoginController } from "./login.controller.js";
import { SessionGuard, type AuthenticatedRequest } from "./session.guard.js";
import { readFile } from "node:fs/promises";
import { Pool } from "pg";
import {
  afterAll,
  beforeAll,
  beforeEach,
  expect,
  it,
  describe,
  vi,
} from "vitest";
import { startAuthFixture } from "../auth/auth-fixture.test-helper.js";
import { SupabaseAuth } from "../auth/supabase-auth.js";
import { RegistrationService } from "../auth/registration.service.js";
import { PostgresRegistrationStore } from "../auth/postgres-store.js";
import { PostgresLoginStore } from "./postgres-login-store.js";
import { LoginService } from "./login.service.js";
import { SessionService } from "./session.service.js";

// Password failures are padded inside the lock; concurrent sequences need their real runtime.
vi.setConfig({ testTimeout: 30000 });
const url = process.env.LOGIN_TEST_DATABASE_URL;
if (url) {
  const parsed = new URL(url);
  if (
    !["127.0.0.1", "localhost", "postgres"].includes(parsed.hostname) ||
    parsed.pathname !== "/xiangqi_login_test"
  )
    throw new Error(
      "LOGIN_TEST_DATABASE_URL must identify isolated xiangqi_login_test",
    );
}
describe.skipIf(!url)(
  "username login with PostgreSQL and native provider HTTP",
  () => {
    const pool = new Pool({ connectionString: url });
    let fixture: Awaited<ReturnType<typeof startAuthFixture>>;
    let auth: SupabaseAuth;
    let store: PostgresLoginStore;
    let sessions: SessionService;
    let login: LoginService;
    let clock = new Date("2026-10-11T00:00:00Z");
    const now = () => clock;
    beforeEach(() => {
      clock = new Date("2026-10-11T00:00:00Z");
    });
    beforeAll(async () => {
      // Database-local synthetic baseline only: never reset shared cluster memberships.
      let baseline = await readFile("supabase/tests/auth-baseline.sql", "utf8");
      const start = baseline.indexOf("DROP SCHEMA IF EXISTS xiangqi_auth");
      const end = baseline.indexOf("GRANT app_server TO supabase_admin");
      if (start < 0 || end <= start)
        throw new Error(
          "Synthetic baseline boundaries changed; review database-local fixture before running",
        );
      baseline = baseline
        .slice(start, end)
        .replace(
          "GRANT CREATE ON DATABASE xiangqi_auth_test TO postgres;",
          "GRANT CREATE ON DATABASE xiangqi_login_test TO postgres;",
        );
      if (
        /CREATE ROLE|GRANT app_server TO|REVOKE app_server|pg_auth_members/.test(
          baseline,
        )
      )
        throw new Error("Login fixture must not mutate cluster roles");
      // New CI cluster: create missing fixture roles only; preserve existing roles/memberships.
      await pool.query(`DO $$ BEGIN
        IF current_user='postgres' OR NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname=current_user AND rolsuper AND rolcanlogin) THEN
          RAISE EXCEPTION 'Isolated login tests require a distinct superuser test administrator';
        END IF;
        IF NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='app_server') THEN CREATE ROLE app_server NOLOGIN; END IF;
        IF NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='anon') THEN CREATE ROLE anon NOLOGIN; END IF;
        IF NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='authenticated') THEN CREATE ROLE authenticated NOLOGIN; END IF;
        IF NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='postgres') THEN CREATE ROLE postgres NOLOGIN BYPASSRLS; END IF;
        IF NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='supabase_admin') THEN CREATE ROLE supabase_admin NOLOGIN; END IF;
        IF NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='supabase_auth_admin') THEN CREATE ROLE supabase_auth_admin NOLOGIN; END IF;
        IF NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='service_role') THEN CREATE ROLE service_role NOLOGIN; END IF;
        IF EXISTS(SELECT 1 FROM pg_roles WHERE rolname='app_server' AND (rolsuper OR rolbypassrls)) THEN
          RAISE EXCEPTION 'Application role must enforce row-level security';
        END IF;
      END $$;`);
      await pool.query(baseline);
      await pool.query(
        await readFile(
          "supabase/migrations/20261011000001_email_registration.sql",
          "utf8",
        ),
      );
      await pool.query(
        await readFile(
          "supabase/migrations/20261011000003_username_login.sql",
          "utf8",
        ),
      );
      fixture = await startAuthFixture(pool, now);
      auth = new SupabaseAuth(fixture.url, "fixture-public", "fixture-secret");
      store = new PostgresLoginStore(pool);
      sessions = new SessionService(store, auth, now);
      login = new LoginService(store, auth, sessions, now);
      const registration = new RegistrationService(
        new PostgresRegistrationStore(pool),
        auth,
        now,
      );
      const credentials = {
        username: "TestPlayer",
        password: "password123",
        passwordConfirmation: "password123",
      };
      const draft = await registration.email({
        ...credentials,
        email: "login-fixture@example.invalid",
      });
      await registration.verify({
        registrationToken: draft.registrationToken,
        otp: "123456",
      });
    });
    afterAll(async () => {
      await fixture?.close();
      await pool.end();
    });
    it("logs in by case-insensitive username without returning internal email and guards its fixed session", async () => {
      const result = await login.login({
        username: "TESTPLAYER",
        password: "password123",
      });
      expect(result.username).toBe("TestPlayer");
      expect(result.expiresAt).toBe("2026-11-10T00:00:00.000Z");
      expect(JSON.stringify(result)).not.toContain(
        "login-fixture@example.invalid",
      );
      expect(
        await sessions.requireActive(result.access_token, result.appSession),
      ).toBe(result.userId);
    });
    it("counts concurrent mixed-case failures for existing and unknown usernames and blocks correct passwords until exactly fifteen minutes", async () => {
      for (const username of ["TESTPLAYER", "UnknownPlayer"]) {
        const failures = await Promise.all(
          Array.from({ length: 5 }, (_, i) =>
            login
              .login({
                username: i % 2 ? username.toLowerCase() : username,
                password: "wrong-password",
              })
              .catch((error) => error),
          ),
        );
        expect(failures.map((error) => error.code).sort()).toEqual([
          "LOGIN_INVALID",
          "LOGIN_INVALID",
          "LOGIN_INVALID",
          "LOGIN_INVALID",
          "LOGIN_LOCKED",
        ]);
        await expect(
          login.login({ username, password: "password123" }),
        ).rejects.toMatchObject({ code: "LOGIN_LOCKED" });
      }
      clock = new Date("2026-10-11T00:14:59Z");
      await expect(
        login.login({ username: "TestPlayer", password: "password123" }),
      ).rejects.toMatchObject({ code: "LOGIN_LOCKED" });
      clock = new Date("2026-10-11T00:15:00Z");
      expect(
        (await login.login({ username: "TestPlayer", password: "password123" }))
          .username,
      ).toBe("TestPlayer");
    });
    it("rejects an app session that expires while the provider is validating the bearer", async () => {
      const result = await login.login({
        username: "TestPlayer",
        password: "password123",
        remember: false,
      });
      clock = new Date(new Date(result.expiresAt).getTime() - 1);
      const crossing = new SessionService(
        store,
        {
          signInPassword: auth.signInPassword.bind(auth),
          getUser: async (token) => {
            const user = await auth.getUser(token);
            clock = new Date(result.expiresAt);
            return user;
          },
        },
        now,
      );
      await expect(
        crossing.requireActive(result.access_token, result.appSession),
      ).rejects.toMatchObject({ code: "SESSION_EXPIRED" });
    });

    it("uses a sliding strict fifteen-minute boundary and a successful password resets the count", async () => {
      for (let i = 0; i < 3; i++)
        await expect(
          login.login({ username: "TestPlayer", password: "wrong" }),
        ).rejects.toMatchObject({ code: "LOGIN_INVALID" });
      await login.login({ username: "TestPlayer", password: "password123" });
      for (let i = 0; i < 4; i++)
        await expect(
          login.login({ username: "TestPlayer", password: "wrong" }),
        ).rejects.toMatchObject({ code: "LOGIN_INVALID" });
      clock = new Date("2026-10-11T00:15:00Z");
      await expect(
        login.login({ username: "TestPlayer", password: "wrong" }),
      ).rejects.toMatchObject({ code: "LOGIN_INVALID" });
      await login.login({ username: "TestPlayer", password: "password123" });
    });
    it("requires both proofs, supports a refreshed bearer without extending the app deadline and revokes durably", async () => {
      const result = await login.login({
        username: "TestPlayer",
        password: "password123",
        remember: false,
      });
      expect(result.expiresAt).toBe("2026-10-11T12:00:00.000Z");
      await expect(
        sessions.requireActive(result.access_token, undefined),
      ).rejects.toMatchObject({ code: "SESSION_INVALID" });
      await expect(
        sessions.requireActive(undefined, result.appSession),
      ).rejects.toMatchObject({ code: "SESSION_INVALID" });
      const renewed = await auth.signInPassword(
        "login-fixture@example.invalid",
        "password123",
      );
      clock = new Date("2026-10-11T11:59:59Z");
      expect(
        await sessions.requireActive(renewed.access_token, result.appSession),
      ).toBe(result.userId);
      const restarted = new SessionService(
        new PostgresLoginStore(pool),
        auth,
        now,
      );
      await restarted.revoke(result.appSession);
      await expect(
        restarted.requireActive(renewed.access_token, result.appSession),
      ).rejects.toMatchObject({ code: "SESSION_EXPIRED" });
    });
    it("does not count provider outages or reset preceding failures", async () => {
      for (let i = 0; i < 3; i++)
        await expect(
          login.login({ username: "TestPlayer", password: "wrong" }),
        ).rejects.toMatchObject({ code: "LOGIN_INVALID" });
      const down = new LoginService(
        store,
        {
          getUser: auth.getUser.bind(auth),
          signInPassword: async () => {
            throw new Error("fake secret payload");
          },
        },
        sessions,
        now,
      );
      await expect(
        down.login({ username: "TestPlayer", password: "password123" }),
      ).rejects.toMatchObject({ code: "LOGIN_UNAVAILABLE", status: 503 });
      await expect(
        login.login({ username: "TestPlayer", password: "wrong" }),
      ).rejects.toMatchObject({ code: "LOGIN_INVALID" });
      await expect(
        login.login({ username: "TestPlayer", password: "wrong" }),
      ).rejects.toMatchObject({ code: "LOGIN_LOCKED" });
      clock = new Date("2026-10-11T00:15:00Z");
      await login.login({ username: "TestPlayer", password: "password123" });
    });
    it("denies direct anonymous/authenticated table access and app_server deadline updates", async () => {
      const client = await pool.connect();
      try {
        for (const role of ["anon", "authenticated"]) {
          await client.query(`SET ROLE ${role}`);
          await expect(
            client.query("SELECT * FROM xiangqi_auth.app_sessions"),
          ).rejects.toMatchObject({ code: "42501" });
          await expect(
            client.query("SELECT * FROM xiangqi_auth.login_attempts"),
          ).rejects.toMatchObject({ code: "42501" });
          await client.query("RESET ROLE");
        }
        await client.query("SET ROLE app_server");
        await expect(
          client.query(
            "UPDATE xiangqi_auth.app_sessions SET expires_at=expires_at+interval '1 second'",
          ),
        ).rejects.toMatchObject({ code: "42501" });
      } finally {
        await client.query("RESET ROLE");
        client.release();
      }
    });

    it("rejects a provider identity mismatch without granting or resetting attempts", async () => {
      await expect(
        login.login({ username: "TestPlayer", password: "wrong" }),
      ).rejects.toMatchObject({ code: "LOGIN_INVALID" });
      const foreign = new LoginService(
        store,
        {
          getUser: auth.getUser.bind(auth),
          signInPassword: async (email, password) => {
            const session = await auth.signInPassword(email, password);
            session.user.id = "00000000-0000-0000-0000-000000000099";
            return session;
          },
        },
        sessions,
        now,
      );
      await expect(
        foreign.login({ username: "TestPlayer", password: "password123" }),
      ).rejects.toMatchObject({ code: "LOGIN_UNAVAILABLE" });
      expect((await store.attempts("testplayer")).failures).toHaveLength(1);
      await login.login({ username: "TestPlayer", password: "password123" });
    });
    it("gives wrong passwords and unknown usernames the same measured response floor", async () => {
      const measurements: number[][] = [[], []];
      for (let i = 0; i < 3; i++)
        for (const [index, username] of [
          "TestPlayer",
          "TimingGhost",
        ].entries()) {
          const start = performance.now();
          await expect(
            login.login({ username, password: "wrong" }),
          ).rejects.toMatchObject({
            code: "LOGIN_INVALID",
            message: "Sai tên đăng nhập hoặc mật khẩu",
          });
          measurements[index]!.push(performance.now() - start);
        }
      const median = (values: number[]) => values.sort((a, b) => a - b)[1]!;
      expect(Math.min(...measurements.flat())).toBeGreaterThanOrEqual(2100);
      expect(
        Math.abs(median(measurements[0]!) - median(measurements[1]!)),
      ).toBeLessThan(100);
      console.info(
        JSON.stringify({
          event: "login_fixture_latency",
          knownMedianMs: Math.round(median(measurements[0]!)),
          unknownMedianMs: Math.round(median(measurements[1]!)),
        }),
      );
      await login.login({ username: "TestPlayer", password: "password123" });
    });
    it("serves actual HTTP login and requires both credentials in the Nest guard", async () => {
      @Controller("login-protected")
      class ProtectedController {
        @Get()
        @UseGuards(SessionGuard)
        get(@Req() request: AuthenticatedRequest) {
          return { userId: request.userId };
        }
      }
      @Module({
        controllers: [LoginController, ProtectedController],
        providers: [
          { provide: LoginService, useValue: login },
          { provide: SessionService, useValue: sessions },
          SessionGuard,
        ],
      })
      class TestModule {}
      const app = await NestFactory.create(TestModule, { logger: false });
      await app.listen(0, "127.0.0.1");
      const base = await app.getUrl();
      try {
        const post = async (body: object) =>
          fetch(base + "/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
        const wrong = await post({ username: "TestPlayer", password: "wrong" });
        const unknown = await post({
          username: "OtherGhost",
          password: "wrong",
        });
        expect(wrong.status).toBe(401);
        expect(unknown.status).toBe(401);
        expect(await wrong.json()).toEqual(await unknown.json());
        const success = await post({
          username: "testplayer",
          password: "password123",
          remember: false,
        });
        expect(success.status).toBe(200);
        const result = (await success.json()) as Awaited<
          ReturnType<LoginService["login"]>
        >;
        expect(JSON.stringify(result)).not.toContain(
          "login-fixture@example.invalid",
        );
        expect(
          (
            await fetch(base + "/login-protected", {
              headers: { Authorization: `Bearer ${result.access_token}` },
            })
          ).status,
        ).toBe(401);
        const invalidBearer = await fetch(base + "/login-protected", {
          headers: {
            Authorization: "Bearer invalid-fixture-token",
            "X-Xiangqi-Session": result.appSession,
          },
        });
        expect(invalidBearer.status).toBe(401);
        expect(await invalidBearer.json()).toEqual({
          code: "SESSION_INVALID",
          message: "Phiên đăng nhập không hợp lệ",
        });
        const headers = {
          Authorization: `Bearer ${result.access_token}`,
          "X-Xiangqi-Session": result.appSession,
        };
        expect(
          await (await fetch(base + "/login-protected", { headers })).json(),
        ).toEqual({ userId: result.userId });
        const getUser = auth.getUser.bind(auth);
        auth.getUser = async () => {
          throw new RegistrationError(
            "AUTH_PROVIDER_ERROR",
            "fake-sensitive-provider-payload",
            503,
          );
        };
        try {
          const unavailable = await fetch(base + "/login-protected", {
            headers,
          });
          expect(unavailable.status).toBe(503);
          expect(await unavailable.json()).toEqual({
            code: "SESSION_UNAVAILABLE",
            message: "Chưa thể xác thực phiên đăng nhập",
          });
        } finally {
          auth.getUser = getUser;
        }
        await sessions.revoke(result.appSession);
        expect(
          (await fetch(base + "/login-protected", { headers })).status,
        ).toBe(401);
      } finally {
        await app.close();
      }
    });
    it("refuses rollback once login has persisted data", async () => {
      const client = await pool.connect();
      try {
        await expect(
          client.query(
            await readFile(
              "supabase/rollback/20261011000003_username_login.sql",
              "utf8",
            ),
          ),
        ).rejects.toThrow("reviewed backup");
      } finally {
        await client.query("ROLLBACK");
        client.release();
      }
    });
    it("keeps counters over a new store instance and preserves active Google-style issuance", async () => {
      for (let i = 0; i < 3; i++)
        await expect(
          login.login({ username: "TestPlayer", password: "wrong" }),
        ).rejects.toMatchObject({ code: "LOGIN_INVALID" });
      const account = await store.accountByUsername("testplayer");
      await sessions.issue(account!.userId); // Google integration only issues: never resets password failures.
      const restarted = new LoginService(
        new PostgresLoginStore(pool),
        auth,
        sessions,
        now,
      );
      await expect(
        restarted.login({ username: "TestPlayer", password: "wrong" }),
      ).rejects.toMatchObject({ code: "LOGIN_INVALID" });
      await expect(
        restarted.login({ username: "TESTPLAYER", password: "wrong" }),
      ).rejects.toMatchObject({ code: "LOGIN_LOCKED" });
      clock = new Date("2026-10-11T00:15:00Z");
      await login.login({ username: "TestPlayer", password: "password123" });
    });
    it("does not issue sessions for pending profiles or allow a different provider user to use another capability", async () => {
      const result = await login.login({
        username: "TestPlayer",
        password: "password123",
      });
      const foreign = new SessionService(
        store,
        {
          signInPassword: auth.signInPassword.bind(auth),
          getUser: async (token) => {
            const user = await auth.getUser(token);
            return { ...user, id: "00000000-0000-0000-0000-000000000099" };
          },
        },
        now,
      );
      await expect(
        foreign.requireActive(result.access_token, result.appSession),
      ).rejects.toMatchObject({ code: "SESSION_INVALID" });
      await pool.query(
        "UPDATE public.profiles SET registration_pending=true WHERE user_id=$1",
        [result.userId],
      );
      try {
        await expect(sessions.issue(result.userId)).rejects.toMatchObject({
          code: "ACCOUNT_PENDING",
        });
        await expect(
          sessions.requireActive(result.access_token, result.appSession),
        ).rejects.toMatchObject({ code: "ACCOUNT_PENDING" });
        await expect(
          login.login({ username: "TestPlayer", password: "password123" }),
        ).rejects.toMatchObject({ code: "LOGIN_INVALID" });
      } finally {
        await pool.query(
          "UPDATE public.profiles SET registration_pending=false WHERE user_id=$1",
          [result.userId],
        );
      }
      await login.login({ username: "TestPlayer", password: "password123" });
    });
    it("denies revocation during provider validation and validates capability deadlines before refresh", async () => {
      const result = await login.login({
        username: "TestPlayer",
        password: "password123",
      });
      expect(await sessions.requireValidSession(result.appSession)).toEqual({
        userId: result.userId,
        expiresAt: "2026-11-10T00:00:00.000Z",
        remember: true,
      });
      const revoked = new SessionService(
        store,
        {
          signInPassword: auth.signInPassword.bind(auth),
          getUser: async (token) => {
            const user = await auth.getUser(token);
            await sessions.revoke(result.appSession);
            return user;
          },
        },
        now,
      );
      await expect(
        revoked.requireActive(result.access_token, result.appSession),
      ).rejects.toMatchObject({ code: "SESSION_EXPIRED" });
      const fresh = await sessions.issue(result.userId, false);
      clock = new Date("2026-10-11T12:00:00Z");
      await expect(
        sessions.requireValidSession(fresh.appSession),
      ).rejects.toMatchObject({ code: "SESSION_EXPIRED" });
    });

    it("shares normalized concurrent password failures and blocking between login and registration recovery", async () => {
      const account = (await store.accountByUsername("testplayer"))!;
      const failures = await Promise.all(
        Array.from({ length: 5 }, (_, i) =>
          (i % 2
            ? login.login({ username: "TESTPLAYER", password: "wrong" })
            : login.authenticateRegistration(account, "wrong")
          ).catch((error) => error),
        ),
      );
      expect(failures.map((error) => error.code).sort()).toEqual([
        "LOGIN_INVALID",
        "LOGIN_INVALID",
        "LOGIN_INVALID",
        "LOGIN_INVALID",
        "LOGIN_LOCKED",
      ]);
      await expect(
        login.authenticateRegistration(account, "password123"),
      ).rejects.toMatchObject({ code: "LOGIN_LOCKED" });
      await expect(
        login.login({ username: "testplayer", password: "password123" }),
      ).rejects.toMatchObject({ code: "LOGIN_LOCKED" });
      await sessions.issue(account.userId); // Google issuance does not reset a locked password username.
      await expect(
        login.authenticateRegistration(account, "password123"),
      ).rejects.toMatchObject({ code: "LOGIN_LOCKED" });
      clock = new Date("2026-10-11T00:15:00Z");
      expect(
        (await login.authenticateRegistration(account, "password123")).user.id,
      ).toBe(account.userId);
      expect((await store.attempts("testplayer")).failures).toHaveLength(0);
    });

    it("permits provider-pending password proof only for an authoritative verified registration caller and never issues a capability there", async () => {
      const email = "pending-login-fixture@example.invalid";
      const userId = await auth.signup(email, "password123", "a".repeat(43));
      await auth.verify(email, "123456");
      const account = { userId, email, username: "PendingPlayer" };
      await expect(
        login.login({ username: account.username, password: "password123" }),
      ).rejects.toMatchObject({ code: "LOGIN_INVALID" });
      const proof = await login.authenticateRegistration(
        account,
        "password123",
      );
      expect(proof.user.id).toBe(userId);
      expect(proof.user.app_metadata?.registration_pending).toBe(true);
      expect(proof).not.toHaveProperty("appSession");
      await expect(sessions.issue(userId)).rejects.toMatchObject({
        code: "ACCOUNT_PENDING",
      });
    });
    it("preserves password counts through a registration-provider outage", async () => {
      const account = (await store.accountByUsername("testplayer"))!;
      await expect(
        login.authenticateRegistration(account, "wrong"),
      ).rejects.toMatchObject({ code: "LOGIN_INVALID" });
      const failures = (await store.attempts("testplayer")).failures;
      const down = new LoginService(
        store,
        {
          getUser: auth.getUser.bind(auth),
          signInPassword: async () => {
            throw new Error("fake provider secret");
          },
        },
        sessions,
        now,
      );
      await expect(
        down.authenticateRegistration(account, "password123"),
      ).rejects.toMatchObject({ code: "LOGIN_UNAVAILABLE", status: 503 });
      expect((await store.attempts("testplayer")).failures).toEqual(failures);
      await login.authenticateRegistration(account, "password123");
    });
    it("rotates provider credentials through actual cookie HTTP while keeping the SQL application deadline and revokes durably", async () => {
      await store.resetAttempts("testplayer");
      @Module({})
      class BrowserSessionFixture {}
      const app = await createApp(
        [],
        [
          {
            module: BrowserSessionFixture,
            controllers: [LoginController],
            providers: [
              { provide: LoginService, useValue: login },
              { provide: "SESSION_COOKIE_SECURE", useValue: false },
            ],
          },
          SessionModule.forRoot(
            sessions,
            (token) => auth.refreshSession(token),
            false,
          ),
        ],
      );
      await app.listen(0, "127.0.0.1");
      const base = await app.getUrl();
      const cookieJar = (response: Response) =>
        response.headers
          .getSetCookie()
          .map((value) => value.split(";")[0])
          .join("; ");
      try {
        const loggedIn = await fetch(`${base}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "TESTPLAYER",
            password: "password123",
            remember: false,
          }),
        });
        expect(loggedIn.status).toBe(200);
        const original = await loggedIn.json();
        const oldCookies = cookieJar(loggedIn);
        expect(
          loggedIn.headers
            .getSetCookie()
            .every((value) => !value.includes("Max-Age=")),
        ).toBe(true);
        const refreshed = await fetch(`${base}/auth/refresh`, {
          method: "POST",
          headers: { Cookie: oldCookies },
        });
        expect(refreshed.status).toBe(200);
        const renewed = await refreshed.json();
        expect(renewed).toMatchObject({
          appSession: original.appSession,
          userId: original.userId,
          expiresAt: original.expiresAt,
          remember: false,
        });
        expect(renewed.refresh_token).not.toBe(original.refresh_token);
        expect(renewed.access_token).not.toBe(original.access_token);
        await expect(
          auth.refreshSession(original.refresh_token),
        ).rejects.toMatchObject({ status: 401 });
        const currentCookies = cookieJar(refreshed);
        const actor = await fetch(`${base}/auth/session`, {
          headers: {
            Cookie: currentCookies,
            Authorization: `Bearer ${renewed.access_token}`,
          },
        });
        expect(actor.status).toBe(200);
        expect(await actor.json()).toEqual({
          userId: original.userId,
          username: "TestPlayer",
          kind: "member",
          expiresAt: original.expiresAt,
          remember: false,
        });
        const loggedOut = await fetch(`${base}/auth/logout`, {
          method: "POST",
          headers: {
            Cookie: currentCookies,
            Authorization: `Bearer ${renewed.access_token}`,
          },
        });
        expect(loggedOut.status).toBe(200);
        expect(
          loggedOut.headers
            .getSetCookie()
            .every((value) => value.includes("Max-Age=0")),
        ).toBe(true);
        expect(
          (
            await fetch(`${base}/auth/refresh`, {
              method: "POST",
              headers: { Cookie: currentCookies },
            })
          ).status,
        ).toBe(401);
        await expect(
          new SessionService(
            new PostgresLoginStore(pool),
            auth,
            now,
          ).requireValidSession(original.appSession),
        ).rejects.toMatchObject({ code: "SESSION_EXPIRED" });
        expect(
          (
            await pool.query(
              "SELECT revoked_at FROM xiangqi_auth.app_sessions WHERE user_id=$1 AND revoked_at IS NOT NULL",
              [original.userId],
            )
          ).rowCount,
        ).toBeGreaterThan(0);
      } finally {
        await app.close();
      }
    });
    it.each([
      {
        remember: false,
        deadline: "2026-10-11T12:00:00.000Z",
        midpoint: "2026-10-11T06:00:00.000Z",
        initialMaxAge: undefined,
        midpointMaxAge: undefined,
      },
      {
        remember: true,
        deadline: "2026-11-10T00:00:00.000Z",
        midpoint: "2026-10-26T00:00:00.000Z",
        initialMaxAge: 2592000,
        midpointMaxAge: 1296000,
      },
    ])(
      "enforces the exact SQL deadline through HTTP refresh (remember=$remember)",
      async ({
        remember,
        deadline,
        midpoint,
        initialMaxAge,
        midpointMaxAge,
      }) => {
        vi.useFakeTimers({ toFake: ["Date"] });
        vi.setSystemTime(clock);
        const advance = (value: string | number) => {
          clock = new Date(value);
          vi.setSystemTime(clock);
        };
        @Module({})
        class BoundaryFixture {}
        const app = await createApp(
          [],
          [
            {
              module: BoundaryFixture,
              controllers: [LoginController],
              providers: [
                { provide: LoginService, useValue: login },
                { provide: "SESSION_COOKIE_SECURE", useValue: false },
              ],
            },
            SessionModule.forRoot(
              sessions,
              (token) => auth.refreshSession(token),
              false,
            ),
          ],
        );
        await app.listen(0, "127.0.0.1");
        const base = await app.getUrl();
        const jar = (response: Response) =>
          response.headers
            .getSetCookie()
            .map((cookie) => cookie.split(";")[0])
            .join("; ");
        const maxAges = (response: Response) =>
          response.headers.getSetCookie().map((cookie) => {
            const match = /(?:^|; )Max-Age=(\d+)(?:;|$)/.exec(cookie);
            return match ? Number(match[1]) : undefined;
          });
        try {
          await store.resetAttempts("testplayer");
          const issued = await fetch(`${base}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: "TestPlayer",
              password: "password123",
              remember,
            }),
          });
          expect(issued.status).toBe(200);
          const original = await issued.json();
          expect(original.expiresAt).toBe(deadline);
          expect(maxAges(issued)).toEqual([initialMaxAge, initialMaxAge]);
          for (const cookie of issued.headers.getSetCookie()) {
            expect(cookie).toContain("; HttpOnly; SameSite=Lax");
            expect(cookie).toContain("; Path=/");
            expect(cookie).not.toContain("Expires=");
          }
          const persisted = async () =>
            (
              await pool.query(
                "SELECT created_at,expires_at,remember FROM xiangqi_auth.app_sessions WHERE token_hash=encode(sha256($1::bytea),'hex')",
                [Buffer.from(original.appSession)],
              )
            ).rows[0];
          expect(await persisted()).toEqual({
            created_at: new Date("2026-10-11T00:00:00.000Z"),
            expires_at: new Date(deadline),
            remember,
          });
          let cookies = jar(issued);
          const calls = fixture.state.refreshRequests;
          for (const [at, maxAge] of [
            [midpoint, midpointMaxAge],
            [Date.parse(deadline) - 1, remember ? 0 : undefined],
          ] as const) {
            advance(at);
            const refreshed = await fetch(`${base}/auth/refresh`, {
              method: "POST",
              headers: { Cookie: cookies },
            });
            expect(refreshed.status).toBe(200);
            const result = await refreshed.json();
            expect(result).toMatchObject({
              appSession: original.appSession,
              userId: original.userId,
              expiresAt: deadline,
              remember,
            });
            expect(maxAges(refreshed)).toEqual([maxAge, maxAge]);
            expect(
              refreshed.headers
                .getSetCookie()
                .every((cookie) => !cookie.includes("Expires=")),
            ).toBe(true);
            cookies = jar(refreshed);
            expect(await persisted()).toEqual({
              created_at: new Date("2026-10-11T00:00:00.000Z"),
              expires_at: new Date(deadline),
              remember,
            });
          }
          expect(fixture.state.refreshRequests).toBe(calls + 2);
          fixture.state.failRefresh = true;
          for (const at of [Date.parse(deadline), Date.parse(deadline) + 1]) {
            advance(at);
            const expired = await fetch(`${base}/auth/refresh`, {
              method: "POST",
              headers: { Cookie: cookies },
            });
            expect(expired.status).toBe(401);
            expect(await expired.json()).toEqual({
              code: "SESSION_EXPIRED",
              message: "Phiên đăng nhập đã hết hạn",
            });
            expect(expired.headers.getSetCookie()).toEqual([]);
            expect(fixture.state.refreshRequests).toBe(calls + 2);
          }
        } finally {
          fixture.state.failRefresh = false;
          vi.useRealTimers();
          await app.close();
        }
      },
    );
    it("can roll back empty synthetic login tables and reapply without changing existing auth objects", async () => {
      const metadata = async () =>
        (
          await pool.query(
            "SELECT oid::regclass::text,relacl::text,relowner::regrole::text,relrowsecurity,relforcerowsecurity FROM pg_class WHERE oid IN ('public.profiles'::regclass,'auth.users'::regclass,'xiangqi_auth.accounts'::regclass) ORDER BY oid::regclass::text",
          )
        ).rows;
      const before = await metadata();
      await pool.query(
        "TRUNCATE xiangqi_auth.app_sessions,xiangqi_auth.login_attempts",
      );
      await pool.query(
        await readFile(
          "supabase/rollback/20261011000003_username_login.sql",
          "utf8",
        ),
      );
      expect(await metadata()).toEqual(before);
      expect(
        (
          await pool.query(
            "SELECT to_regclass('xiangqi_auth.app_sessions') AS relation",
          )
        ).rows[0].relation,
      ).toBeNull();
      await pool.query(
        await readFile(
          "supabase/migrations/20261011000003_username_login.sql",
          "utf8",
        ),
      );
      expect(await metadata()).toEqual(before);
    });
  },
);
