import { randomBytes } from "node:crypto";
import { afterAll, afterEach, beforeEach, describe, expect, it } from "vitest";
import { PasswordService } from "@server/account/password/password.service.js";
import {
  databaseUrl,
  newPassword,
  oldPassword,
  pool,
  setupPasswords,
  type PasswordFixture,
} from "./password.test-helper.js";
import { apply } from "../../game/room/room.test-helper.js";

let f: PasswordFixture;
const base = "/auth/password/recovery";
const unavailableMessage =
  "Tài khoản không có Gmail đã xác minh nên không thể khôi phục mật khẩu.";

describe.skipIf(!databaseUrl)(
  "YC1 recovery with PostgreSQL, Nest and Auth HTTP",
  () => {
    beforeEach(async () => {
      f = await setupPasswords();
    });
    afterEach(async () => {
      await f?.close();
    });
    afterAll(() => pool.end());

    async function start(username: string) {
      const response = await f.request(base, { username });
      expect(response.status).toBe(200);
      return (await response.json()) as {
        requestId: string;
        expiresAt: string;
        resendAt: string;
      };
    }

    async function verify(requestId: string, otp = f.messages.at(-1)!.otp) {
      const response = await f.request(`${base}/verify`, { requestId, otp });
      expect(response.status).toBe(200);
      return (await response.json()) as { resetToken: string };
    }

    it("sends to verified contact, accepts case-insensitive username and never exposes the contact or plaintext challenge", async () => {
      const user = await f.member({ contact: "verified" });
      const request = await start(user.username.toUpperCase());
      expect(f.messages.at(-1)!.to).toBe(user.contact);
      expect(user.credentialEmail).not.toBe(user.contact);
      expect(request.requestId).toMatch(/^[A-Za-z0-9_-]{43}$/);
      expect(Date.parse(request.expiresAt) - Date.parse(request.resendAt)).toBe(
        120_000,
      );
      expect(JSON.stringify(request)).not.toContain(user.contact);
      expect(JSON.stringify(request)).not.toContain(user.userId);
      const row = (
        await pool.query(
          "SELECT * FROM xiangqi_auth.password_recoveries WHERE user_id=$1",
          [user.userId],
        )
      ).rows[0];
      expect(row.request_hash).not.toBe(request.requestId);
      expect(row.otp_hash).toMatch(/^[0-9a-f]{64}$/);
      expect(row.otp_hash).not.toBe(f.messages.at(-1)!.otp);
      expect(row.reset_hash).toBeNull();
    });

    it.each(["none", "pending"] as const)(
      "rejects a %s contact and does not send a recovery email",
      async (contact) => {
        const user = await f.member({ contact });
        const sentBefore = f.messages.length;
        const response = await f.request(base, { username: user.username });
        expect(response.status).toBe(400);
        expect(await response.json()).toEqual({
          code: "PASSWORD_RECOVERY_UNAVAILABLE",
          message: unavailableMessage,
        });
        expect(f.messages).toHaveLength(sentBefore);
        expect(
          (await pool.query("SELECT * FROM xiangqi_auth.password_recoveries"))
            .rows,
        ).toEqual([]);
      },
    );

    it("returns the same unavailable reply for nonexistent usernames and cannot redirect OTP through supplied email/userId", async () => {
      const missing = await f.request(base, { username: "NobodyHere" });
      expect(missing.status).toBe(400);
      expect(await missing.json()).toEqual({
        code: "PASSWORD_RECOVERY_UNAVAILABLE",
        message: unavailableMessage,
      });
      const user = await f.member({ contact: "verified" });
      const forged = await f.request(base, {
        username: user.username,
        email: "attacker@example.invalid",
      });
      expect(forged.status).toBe(400);
      expect(await forged.json()).toMatchObject({
        code: "PASSWORD_INVALID_INPUT",
      });
    });

    it("does not treat incomplete registration or a technical credential as a recovery email", async () => {
      const user = await f.member({ contact: "verified" });
      await pool.query(
        "UPDATE public.profiles SET registration_pending=true WHERE user_id=$1",
        [user.userId],
      );
      const response = await f.request(base, { username: user.username });
      expect(response.status).toBe(400);
      expect(await response.json()).toMatchObject({
        code: "PASSWORD_RECOVERY_UNAVAILABLE",
      });
    });

    it("requires OTP verification before reset, then consumes its grant, revokes old sessions and returns to login without issuing app access", async () => {
      const user = await f.member({ contact: "verified" });
      const other = await f.historicalSession(user.userId);
      const request = await start(user.username);
      const beforeVerify = await f.request(`${base}/reset`, {
        requestId: request.requestId,
        resetToken: randomBytes(32).toString("base64url"),
        newPassword,
        passwordConfirmation: newPassword,
      });
      expect(beforeVerify.status).toBe(400);
      const proof = await verify(request.requestId);
      const limitedSession = await f.request("/auth/session", undefined, {
        access_token: proof.resetToken,
        appSession: request.requestId,
      });
      expect(limitedSession.status).toBe(401);
      const response = await f.request(`${base}/reset`, {
        requestId: request.requestId,
        resetToken: proof.resetToken,
        newPassword,
        passwordConfirmation: newPassword,
      });
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ ok: true });
      expect(response.headers.get("cache-control")).toBe("no-store");
      expect(
        response.headers
          .getSetCookie()
          .filter(
            (cookie) =>
              cookie.startsWith("xiangqi_session=") ||
              cookie.startsWith("xiangqi_refresh="),
          )
          .every((cookie) => cookie.includes("Max-Age=0")),
      ).toBe(true);
      await expect(
        f.sessions.requireValidSession(user.appSession),
      ).rejects.toMatchObject({ code: "SESSION_EXPIRED" });
      await expect(f.sessions.requireValidSession(other)).rejects.toMatchObject(
        { code: "SESSION_EXPIRED" },
      );
      await expect(
        f.auth.signInPassword(user.credentialEmail, oldPassword),
      ).rejects.toMatchObject({ code: "RECOVERY_PASSWORD_INVALID" });
      expect(
        (await f.auth.signInPassword(user.credentialEmail, newPassword)).user
          .id,
      ).toBe(user.userId);
      const replay = await f.request(`${base}/reset`, {
        requestId: request.requestId,
        resetToken: proof.resetToken,
        newPassword: "a-second-password",
        passwordConfirmation: "a-second-password",
      });
      expect(replay.status).toBe(400);
      expect(await replay.json()).toMatchObject({
        code: "PASSWORD_RECOVERY_INVALID",
      });
      const row = (
        await pool.query(
          "SELECT otp_hash,reset_hash,consumed_at FROM xiangqi_auth.password_recoveries WHERE user_id=$1",
          [user.userId],
        )
      ).rows[0];
      expect(row).toMatchObject({
        otp_hash: null,
        reset_hash: null,
        consumed_at: expect.any(Date),
      });
    });

    it("does not consume a valid reset grant on password validation errors", async () => {
      const user = await f.member({ contact: "verified" });
      const request = await start(user.username);
      const proof = await verify(request.requestId);
      for (const input of [
        { newPassword: "short", passwordConfirmation: "short" },
        { newPassword, passwordConfirmation: "not-the-same" },
      ]) {
        const response = await f.request(`${base}/reset`, {
          requestId: request.requestId,
          resetToken: proof.resetToken,
          ...input,
        });
        expect(response.status).toBe(400);
        expect(await response.json()).toMatchObject({
          code: "PASSWORD_INVALID_INPUT",
        });
      }
      expect(
        await f.sessions.requireValidSession(user.appSession),
      ).toMatchObject({ userId: user.userId });
      expect(
        (
          await f.request(`${base}/reset`, {
            requestId: request.requestId,
            resetToken: proof.resetToken,
            newPassword,
            passwordConfirmation: newPassword,
          })
        ).status,
      ).toBe(200);
    });

    it("limits invalid OTP attempts in durable SQL, including a fresh service instance", async () => {
      const user = await f.member({ contact: "verified" });
      const request = await start(user.username);
      const correct = f.messages.at(-1)!.otp;
      const wrong = String((Number(correct) + 1) % 1_000_000).padStart(6, "0");
      for (let n = 0; n < 5; n++) {
        const response = await f.request(`${base}/verify`, {
          requestId: request.requestId,
          otp: wrong,
        });
        expect(response.status).toBe(400);
        expect(await response.json()).toMatchObject({
          code: "PASSWORD_OTP_INVALID",
        });
      }
      expect(
        (
          await pool.query(
            "SELECT attempts FROM xiangqi_auth.password_recoveries WHERE user_id=$1",
            [user.userId],
          )
        ).rows,
      ).toEqual([{ attempts: 5 }]);
      const sixth = await f.request(`${base}/verify`, {
        requestId: request.requestId,
        otp: correct,
      });
      expect(sixth.status).toBe(429);
      expect(await sixth.json()).toMatchObject({
        code: "PASSWORD_RATE_LIMITED",
      });
      const restarted = new PasswordService(
        f.passwordStore,
        f.auth,
        { sendOtp: async () => {} },
        "synthetic-password-secret",
      );
      await expect(
        restarted.verify({ requestId: request.requestId, otp: correct }),
      ).rejects.toMatchObject({ code: "PASSWORD_RATE_LIMITED" });
    });

    it("expires OTP and reset authorization at the server boundary and can resend an expired OTP after cooldown", async () => {
      const user = await f.member({ contact: "verified" });
      const request = await start(user.username);
      const otp = f.messages.at(-1)!.otp;
      f.advance(180_000);
      const expired = await f.request(`${base}/verify`, {
        requestId: request.requestId,
        otp,
      });
      expect(expired.status).toBe(410);
      expect(await expired.json()).toMatchObject({
        code: "PASSWORD_OTP_EXPIRED",
      });
      const resent = await f.request(`${base}/resend`, {
        requestId: request.requestId,
      });
      expect(resent.status).toBe(200);
      expect(await resent.json()).toMatchObject({
        requestId: request.requestId,
      });
      const proof = await verify(request.requestId);
      f.advance(180_000);
      const reset = await f.request(`${base}/reset`, {
        requestId: request.requestId,
        resetToken: proof.resetToken,
        newPassword,
        passwordConfirmation: newPassword,
      });
      expect(reset.status).toBe(410);
      expect(
        (await f.auth.signInPassword(user.credentialEmail, oldPassword)).user
          .id,
      ).toBe(user.userId);
    });

    it("enforces resend cooldown and invalidates any previous reset grant when a new OTP is sent", async () => {
      const user = await f.member({ contact: "verified" });
      const request = await start(user.username);
      const proof = await verify(request.requestId);
      expect(
        (await f.request(`${base}/resend`, { requestId: request.requestId }))
          .status,
      ).toBe(429);
      f.advance(60_000);
      const resent = await f.request(`${base}/resend`, {
        requestId: request.requestId,
      });
      expect(resent.status).toBe(200);
      const stale = await f.request(`${base}/reset`, {
        requestId: request.requestId,
        resetToken: proof.resetToken,
        newPassword,
        passwordConfirmation: newPassword,
      });
      expect(stale.status).toBe(400);
      expect(await stale.json()).toMatchObject({
        code: "PASSWORD_RECOVERY_INVALID",
      });
      await verify(request.requestId);
    });

    it("does not mix recovery grants between accounts", async () => {
      const first = await f.member({ contact: "verified" });
      const second = await f.member({ contact: "verified" });
      const a = await start(first.username);
      const grantA = await verify(a.requestId);
      const b = await start(second.username);
      const grantB = await verify(b.requestId);
      const mixed = await f.request(`${base}/reset`, {
        requestId: b.requestId,
        resetToken: grantA.resetToken,
        newPassword,
        passwordConfirmation: newPassword,
      });
      expect(mixed.status).toBe(400);
      expect(await mixed.json()).toMatchObject({
        code: "PASSWORD_RECOVERY_INVALID",
      });
      expect(
        (
          await f.request(`${base}/reset`, {
            requestId: b.requestId,
            resetToken: grantB.resetToken,
            newPassword,
            passwordConfirmation: newPassword,
          })
        ).status,
      ).toBe(200);
      expect(
        (await f.auth.signInPassword(first.credentialEmail, oldPassword)).user
          .id,
      ).toBe(first.userId);
    });

    it("reports mail failure, removes the undelivered OTP and preserves cooldown across a new request", async () => {
      const user = await f.member({ contact: "verified" });
      f.failMail(true);
      const response = await f.request(base, { username: user.username });
      expect(response.status).toBe(503);
      const body = await response.json();
      expect(body).toMatchObject({
        code: "PASSWORD_PROVIDER_ERROR",
        message: "Không gửi được mã, vui lòng thử lại sau",
      });
      expect(JSON.stringify(body)).not.toContain("private-fixture-smtp-secret");
      expect(
        (
          await pool.query(
            "SELECT otp_hash,reset_hash FROM xiangqi_auth.password_recoveries WHERE user_id=$1",
            [user.userId],
          )
        ).rows,
      ).toEqual([{ otp_hash: null, reset_hash: null }]);
      f.failMail(false);
      expect((await f.request(base, { username: user.username })).status).toBe(
        429,
      );
      f.advance(60_000);
      await start(user.username);
    });

    it("does not report success or leave a replayable grant after an ambiguous failed password write", async () => {
      const user = await f.member({ contact: "verified" });
      const request = await start(user.username);
      const proof = await verify(request.requestId);
      f.provider.state.failPasswordUpdate = true;
      const body = {
        requestId: request.requestId,
        resetToken: proof.resetToken,
        newPassword,
        passwordConfirmation: newPassword,
      };
      const failed = await f.request(`${base}/reset`, body);
      expect(failed.status).toBe(503);
      expect(await failed.json()).toMatchObject({
        code: "PASSWORD_PROVIDER_ERROR",
      });
      expect((await f.request(`${base}/reset`, body)).status).toBe(400);
      expect(
        (await f.auth.signInPassword(user.credentialEmail, oldPassword)).user
          .id,
      ).toBe(user.userId);
      await expect(
        f.sessions.requireValidSession(user.appSession),
      ).rejects.toMatchObject({ code: "SESSION_EXPIRED" });
    });

    it("allows exactly one concurrent reset and preserves Google origin when reconciling a committed provider write", async () => {
      const user = await f.member({ google: true });
      const origin = (
        await pool.query(
          "SELECT * FROM xiangqi_auth.account_origins WHERE user_id=$1",
          [user.userId],
        )
      ).rows;
      const request = await start(user.username);
      const proof = await verify(request.requestId);
      f.provider.state.failPasswordUpdateAfterWrite = true;
      const reset = {
        requestId: request.requestId,
        resetToken: proof.resetToken,
        newPassword,
        passwordConfirmation: newPassword,
      };
      const replies = await Promise.all([
        f.request(`${base}/reset`, reset),
        f.request(`${base}/reset`, reset),
      ]);
      expect(replies.map((response) => response.status).sort()).toEqual([
        200, 400,
      ]);
      expect(
        (
          await pool.query(
            "SELECT * FROM xiangqi_auth.account_origins WHERE user_id=$1",
            [user.userId],
          )
        ).rows,
      ).toEqual(origin);
      expect(
        (await f.auth.signInPassword(user.credentialEmail, newPassword)).user
          .id,
      ).toBe(user.userId);
      await expect(
        f.sessions.requireValidSession(user.appSession),
      ).rejects.toMatchObject({ code: "SESSION_EXPIRED" });
    });

    it("keeps recovery rows private from public Auth roles and supports a data-preserving rollback", async () => {
      const user = await f.member({ contact: "verified" });
      await start(user.username);
      const client = await pool.connect();
      try {
        await client.query("SET ROLE authenticated");
        await expect(
          client.query("SELECT * FROM xiangqi_auth.password_recoveries"),
        ).rejects.toMatchObject({ code: "42501" });
      } finally {
        await client.query("RESET ROLE");
        client.release();
      }
      const before = (
        await pool.query(
          "SELECT user_id,username FROM public.profiles WHERE user_id=$1",
          [user.userId],
        )
      ).rows;
      await apply("supabase/rollback/20261030000001_password_recovery.sql");
      expect(
        (
          await pool.query(
            "SELECT user_id,username FROM public.profiles WHERE user_id=$1",
            [user.userId],
          )
        ).rows,
      ).toEqual(before);
      expect(
        (await f.auth.signInPassword(user.credentialEmail, oldPassword)).user
          .id,
      ).toBe(user.userId);
    });
  },
);
