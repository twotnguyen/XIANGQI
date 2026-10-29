import { afterAll, afterEach, beforeEach, describe, expect, it } from "vitest";
import { LoginService } from "@server/account/login/login.service.js";
import {
  databaseUrl,
  fingerprint,
  newPassword,
  oldPassword,
  pool,
  setupPasswords,
  type PasswordFixture,
} from "./password.test-helper.js";

let f: PasswordFixture;
const changeBody = {
  currentPassword: oldPassword,
  newPassword,
  passwordConfirmation: newPassword,
};

describe.skipIf(!databaseUrl)(
  "YC1 profile password change with PostgreSQL, Nest and Auth HTTP",
  () => {
    beforeEach(async () => {
      f = await setupPasswords();
    });
    afterEach(async () => {
      await f?.close();
    });
    afterAll(() => pool.end());

    it("changes credentials without email, keeps the current capability/deadline, replaces provider refresh and revokes other sessions", async () => {
      const user = await f.member();
      const otherSession = await f.historicalSession(user.userId);
      const before = (
        await pool.query(
          "SELECT to_jsonb(p) AS profile FROM public.profiles p WHERE user_id=$1",
          [user.userId],
        )
      ).rows[0];
      const response = await f.request(
        "/account/password/change",
        changeBody,
        user,
      );
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ ok: true });
      expect(response.headers.get("cache-control")).toBe("no-store");
      const cookies = response.headers.getSetCookie();
      expect(
        cookies.find((cookie) => cookie.startsWith("xiangqi_session=")),
      ).toContain(user.appSession);
      const current = await f.sessions.requireActiveSession(
        user.access_token,
        user.appSession,
      );
      expect(current.expiresAt).toBe(user.expiresAt);
      await expect(
        f.sessions.requireValidSession(otherSession),
      ).rejects.toMatchObject({ code: "SESSION_EXPIRED" });
      expect(
        (
          await pool.query(
            "SELECT to_jsonb(p) AS profile FROM public.profiles p WHERE user_id=$1",
            [user.userId],
          )
        ).rows[0],
      ).toEqual(before);
      await expect(
        f.auth.signInPassword(user.credentialEmail, oldPassword),
      ).rejects.toMatchObject({ code: "RECOVERY_PASSWORD_INVALID" });
      expect(
        (await f.auth.signInPassword(user.credentialEmail, newPassword)).user
          .id,
      ).toBe(user.userId);
      await expect(
        f.auth.refreshSession(user.refresh_token),
      ).rejects.toMatchObject({ code: "SESSION_INVALID" });
      const refreshed = cookies.find((cookie) =>
        cookie.startsWith("xiangqi_refresh="),
      )!;
      const refreshToken = decodeURIComponent(
        refreshed.split(";")[0]!.slice("xiangqi_refresh=".length),
      );
      const refresh = await f.request(
        "/auth/refresh",
        { refresh_token: refreshToken },
        user,
      );
      expect(refresh.status).toBe(200);
      expect(await refresh.json()).toMatchObject({
        appSession: user.appSession,
        expiresAt: user.expiresAt,
        userId: user.userId,
      });
    });

    it("rejects an incorrect old password without changing credentials or revoking sessions", async () => {
      const user = await f.member();
      const other = await f.historicalSession(user.userId);
      const response = await f.request(
        "/account/password/change",
        { ...changeBody, currentPassword: "wrong-old-password" },
        user,
      );
      expect(response.status).toBe(400);
      expect(await response.json()).toMatchObject({
        code: "PASSWORD_CURRENT_INVALID",
      });
      expect(
        (await f.auth.signInPassword(user.credentialEmail, oldPassword)).user
          .id,
      ).toBe(user.userId);
      expect(await f.sessions.requireValidSession(other)).toMatchObject({
        userId: user.userId,
      });
    });

    it.each([
      { ...changeBody, newPassword: "short", passwordConfirmation: "short" },
      { ...changeBody, passwordConfirmation: "different-password" },
      { ...changeBody, currentPassword: "" },
    ])(
      "validates credentials at the API boundary before mutating provider or sessions: %j",
      async (body) => {
        const user = await f.member();
        const response = await f.request(
          "/account/password/change",
          body,
          user,
        );
        expect(response.status).toBe(400);
        expect(await response.json()).toMatchObject({
          code: "PASSWORD_INVALID_INPUT",
        });
        expect(
          (await f.auth.signInPassword(user.credentialEmail, oldPassword)).user
            .id,
        ).toBe(user.userId);
        expect(
          await f.sessions.requireValidSession(user.appSession),
        ).toMatchObject({ userId: user.userId });
      },
    );

    it("rejects unauthenticated, guest-shaped, mixed-user and revoked proofs", async () => {
      const user = await f.member();
      const other = await f.member();
      const anonymous = await f.request("/account/password/change", changeBody);
      expect(anonymous.status).toBe(401);
      const mixed = await f.request("/account/password/change", changeBody, {
        access_token: other.access_token,
        appSession: user.appSession,
      });
      expect(mixed.status).toBe(401);
      const forgedBody = await f.request(
        "/account/password/change",
        { ...changeBody, userId: other.userId },
        user,
      );
      expect(forgedBody.status).toBe(400);
      await f.sessions.revoke(user.appSession);
      expect(
        (await f.request("/account/password/change", changeBody, user)).status,
      ).toBe(401);
      expect(
        (await f.auth.signInPassword(other.credentialEmail, oldPassword)).user
          .id,
      ).toBe(other.userId);
    });

    it("does not trim passwords and does not remove an existing login lock", async () => {
      const user = await f.member();
      const blockedUntil = new Date(Date.now() + 15 * 60_000);
      await pool.query(
        "INSERT INTO xiangqi_auth.login_attempts(username_key,failures,blocked_until) VALUES($1,$2,$3)",
        [user.username.toLowerCase(), [new Date()], blockedUntil],
      );
      const spaced = "  password with spaces  ";
      expect(
        (
          await f.request(
            "/account/password/change",
            {
              currentPassword: oldPassword,
              newPassword: spaced,
              passwordConfirmation: spaced,
            },
            user,
          )
        ).status,
      ).toBe(200);
      expect(
        (await f.auth.signInPassword(user.credentialEmail, spaced)).user.id,
      ).toBe(user.userId);
      await expect(
        f.auth.signInPassword(user.credentialEmail, spaced.trim()),
      ).rejects.toMatchObject({ code: "RECOVERY_PASSWORD_INVALID" });
      expect(
        (await f.loginStore.attempts(user.username.toLowerCase())).blockedUntil,
      ).toEqual(blockedUntil);
    });

    it("preserves a Google-origin account and its identity data when changing its application password", async () => {
      const user = await f.member({ google: true });
      const before = (
        await pool.query(
          "SELECT * FROM xiangqi_auth.account_origins WHERE user_id=$1",
          [user.userId],
        )
      ).rows;
      expect(
        (await f.request("/account/password/change", changeBody, user)).status,
      ).toBe(200);
      expect(
        (
          await pool.query(
            "SELECT * FROM xiangqi_auth.account_origins WHERE user_id=$1",
            [user.userId],
          )
        ).rows,
      ).toEqual(before);
      expect(
        (await f.auth.signInPassword(user.credentialEmail, newPassword)).user
          .id,
      ).toBe(user.userId);
    });

    it("does not claim success when the provider rejects the write", async () => {
      const user = await f.member();
      f.provider.state.failPasswordUpdate = true;
      const response = await f.request(
        "/account/password/change",
        changeBody,
        user,
      );
      expect(response.status).toBe(503);
      const body = await response.json();
      expect(body).toMatchObject({ code: "PASSWORD_PROVIDER_ERROR" });
      expect(JSON.stringify(body)).not.toContain("fake-sensitive-fixture");
      expect(
        (await f.auth.signInPassword(user.credentialEmail, oldPassword)).user
          .id,
      ).toBe(user.userId);
    });

    it("reconciles a provider failure after the credential was already committed", async () => {
      const user = await f.member();
      f.provider.state.failPasswordUpdateAfterWrite = true;
      const response = await f.request(
        "/account/password/change",
        changeBody,
        user,
      );
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ ok: true });
      expect(
        await f.sessions.requireValidSession(user.appSession),
      ).toMatchObject({ userId: user.userId, expiresAt: user.expiresAt });
      expect(
        (await f.auth.signInPassword(user.credentialEmail, newPassword)).user
          .id,
      ).toBe(user.userId);
    });

    it("finishes the same authorized change after token issuance fails, without replacing the app session or accepting another password intent", async () => {
      const user = await f.member();
      f.provider.state.failPasswordSession = true;
      expect(
        (await f.request("/account/password/change", changeBody, user)).status,
      ).toBe(503);
      const checkpoint = (
        await pool.query(
          "SELECT password_change_hash FROM xiangqi_auth.app_sessions WHERE token_hash=$1",
          [fingerprint(user.appSession)],
        )
      ).rows[0].password_change_hash;
      expect(checkpoint).toMatch(/^[0-9a-f]{64}$/);
      f.provider.state.failPasswordSession = false;
      const different = {
        ...changeBody,
        newPassword: "different-password",
        passwordConfirmation: "different-password",
      };
      expect(
        (await f.request("/account/password/change", different, user)).status,
      ).toBe(400);
      const retried = await f.request(
        "/account/password/change",
        changeBody,
        user,
      );
      expect(retried.status).toBe(200);
      const refreshCookie = retried.headers
        .getSetCookie()
        .find((cookie) => cookie.startsWith("xiangqi_refresh="))!;
      const refreshToken = decodeURIComponent(
        refreshCookie.split(";")[0]!.slice("xiangqi_refresh=".length),
      );
      const refreshed = await f.request(
        "/auth/refresh",
        { refresh_token: refreshToken },
        user,
      );
      expect(refreshed.status).toBe(200);
      expect(await refreshed.json()).toMatchObject({
        userId: user.userId,
        appSession: user.appSession,
        expiresAt: user.expiresAt,
      });
      expect(
        (
          await pool.query(
            "SELECT password_change_hash FROM xiangqi_auth.app_sessions WHERE token_hash=$1",
            [fingerprint(user.appSession)],
          )
        ).rows,
      ).toEqual([{ password_change_hash: null }]);
    });

    it("does not retain a session that expires while the provider is working", async () => {
      const user = await f.member();
      const gate = f.provider.holdPasswordUpdate();
      const changing = f.request("/account/password/change", changeBody, user);
      await gate.started;
      f.advance(30 * 24 * 3600_000);
      gate.release();
      expect((await changing).status).toBe(401);
      await expect(
        f.sessions.requireValidSession(user.appSession),
      ).rejects.toMatchObject({ code: "SESSION_EXPIRED" });
    });

    it("serializes login proofs against a concurrent password write", async () => {
      const user = await f.member();
      const gate = f.provider.holdPasswordUpdate();
      const changing = f.request("/account/password/change", changeBody, user);
      await gate.started;
      const login = new LoginService(
        f.loginStore,
        f.auth,
        f.sessions,
        undefined,
        0,
      );
      const staleLogin = expect(
        login.login({ username: user.username, password: oldPassword }),
      ).rejects.toMatchObject({ code: "LOGIN_INVALID" });
      gate.release();
      expect((await changing).status).toBe(200);
      await staleLogin;
      expect(
        await f.sessions.requireValidSession(user.appSession),
      ).toMatchObject({ userId: user.userId });
      const rows = await pool.query(
        "SELECT token_hash FROM xiangqi_auth.app_sessions WHERE user_id=$1 AND revoked_at IS NULL",
        [user.userId],
      );
      expect(rows.rows).toEqual([{ token_hash: fingerprint(user.appSession) }]);
    });
  },
);
