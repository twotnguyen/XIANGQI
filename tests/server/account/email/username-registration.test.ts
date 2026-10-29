import { createHash, randomBytes, randomUUID } from "node:crypto";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import {
  apply,
  databaseUrl,
  pool,
  reset,
} from "../../game/room/room.test-helper.js";
import { UsernameRegistrationService } from "@server/account/auth/username-registration.service.js";
import { PostgresRegistrationStore } from "@server/account/auth/registration.store.js";
import { EmailVerificationStore } from "@server/account/email/email.store.js";
import { EmailVerificationService } from "@server/account/email/email.service.js";
import type { Session } from "@server/account/auth/registration.types.js";
import { PostgresLoginStore } from "@server/account/login/postgres-login-store.js";
import { LoginService } from "@server/account/login/login.service.js";
import { SessionService } from "@server/account/login/session.service.js";

const unused = (): Promise<never> =>
  Promise.reject(new Error("unused in stub"));

/**
 * Provider stub: chỉ thay Supabase Auth HTTP. Người dùng và origin được tạo thật trong DB.
 */
function providerStub() {
  const auth = {
    async createUsernameAccount(
      email: string,
      _password: string,
      nonce: string,
    ) {
      const id = email.split("@")[0]!;
      await pool.query(
        `INSERT INTO auth.users(id,email,email_confirmed_at,raw_app_meta_data,raw_user_meta_data)
         VALUES($1,$2,clock_timestamp(),'{"provider":"email"}',$3::jsonb)`,
        [id, email, JSON.stringify({ registration_intent: nonce })],
      );
      return id;
    },
    async signInPassword(email: string): Promise<Session> {
      const { rows } = await pool.query(
        "SELECT id,email,email_confirmed_at FROM auth.users WHERE email=$1",
        [email],
      );
      return {
        access_token: "synthetic-access",
        refresh_token: "synthetic-refresh",
        expires_in: 3600,
        user: {
          id: rows[0].id,
          email: rows[0].email,
          email_confirmed_at: rows[0].email_confirmed_at,
          app_metadata: {},
        },
      };
    },
    async deletePending(userId: string) {
      await pool.query("DELETE FROM auth.users WHERE id=$1", [userId]);
    },
    async clearPending(userId: string) {
      await pool.query(
        "UPDATE auth.users SET raw_app_meta_data=raw_app_meta_data||'{\"registration_pending\":false}'::jsonb WHERE id=$1",
        [userId],
      );
    },
    signup: unused,
    updatePendingPassword: unused,
    resend: unused,
    verify: unused,
    getUser: unused,
  };
  return auth;
}

describe.skipIf(!databaseUrl)("username registration without email", () => {
  beforeEach(async () => {
    await reset();
    await apply(
      "supabase/migrations/20261029000001_username_account_email.sql",
    );
  });
  afterAll(() => pool.end());

  function service() {
    const store = new PostgresRegistrationStore(pool);
    const auth = providerStub();
    const emails = new EmailVerificationStore(pool);
    return {
      store,
      auth,
      registration: new UsernameRegistrationService(
        store,
        auth,
        emails,
        async () => ({
          appSession: "synthetic-app-session",
          expiresAt: new Date(Date.now() + 3600_000).toISOString(),
        }),
      ),
    };
  }

  it("creates a username-only account with a marker and no contact email", async () => {
    const { registration } = service();
    const username = "Tuong" + randomUUID().slice(0, 8);
    const result = await registration.register({
      username,
      password: "fake-password-fixture",
      passwordConfirmation: "fake-password-fixture",
    });
    expect(result.username).toBe(username);
    const marker = await pool.query(
      "SELECT verified_at,email FROM xiangqi_auth.username_accounts WHERE user_id=$1",
      [result.userId],
    );
    expect(marker.rows).toEqual([{ verified_at: null, email: null }]);
    const cred = await pool.query(
      "SELECT email,email_confirmed_at FROM auth.users WHERE id=$1",
      [result.userId],
    );
    expect(cred.rows[0].email).toMatch(/@username\.xiangqi\.invalid$/);
    expect(cred.rows[0].email_confirmed_at).not.toBeNull();
    expect(
      (await new PostgresLoginStore(pool).accountByUsername(username))?.active,
    ).toBe(true);
  });

  it("keeps the same user after a skipped-email account signs in again by username and password", async () => {
    const { registration, auth } = service();
    const username = "Skip" + randomUUID().slice(0, 8);
    const password = "fake-password-fixture";
    const registered = await registration.register({
      username,
      password,
      passwordConfirmation: password,
    });
    const store = new PostgresLoginStore(pool);
    const login = new LoginService(
      store,
      {
        signInPassword: (email, pw) =>
          pw === password
            ? auth.signInPassword(email)
            : Promise.reject(new Error("wrong password")),
      },
      new SessionService(store, { verifyAccessToken: unused }),
      () => new Date(),
      0,
    );
    const again = await login.login({ username, password });
    expect(again.userId).toBe(registered.userId);
    expect(again.username).toBe(username);
  });

  it("cancels only the capability-owned unconfirmed draft when skipping OTP", async () => {
    const { registration, store } = service();
    const pendingId = randomUUID();
    const address = `${pendingId}@example.invalid`;
    const token = randomBytes(32).toString("base64url");
    const nonce = randomBytes(32).toString("base64url");
    const username = "Skip" + randomUUID().slice(0, 8);
    const createdAt = new Date();
    await store.beginIntent(address, nonce, createdAt);
    await pool.query(
      'INSERT INTO auth.users(id,email,raw_user_meta_data,raw_app_meta_data) VALUES($1,$2,$3::jsonb,\'{"provider":"email","registration_pending":true}\')',
      [pendingId, address, JSON.stringify({ registration_intent: nonce })],
    );
    await store.bindIntent(address, pendingId);
    await store.saveDraft({
      tokenHash: createHash("sha256").update(token).digest("hex"),
      userId: pendingId,
      email: address,
      username,
      createdAt,
      lastSentAt: createdAt,
    });
    const result = await registration.register({
      username,
      password: "fake-password-fixture",
      passwordConfirmation: "fake-password-fixture",
      registrationToken: token,
    });
    expect(
      (await pool.query("SELECT 1 FROM auth.users WHERE id=$1", [pendingId]))
        .rows,
    ).toEqual([]);
    expect(
      (await store.accountById(result.userId))?.completedAt,
    ).not.toBeNull();
    expect(await store.accountByEmail(address)).toBeNull();
    expect(
      (
        await pool.query(
          "SELECT email,verified_at FROM xiangqi_auth.username_accounts WHERE user_id=$1",
          [result.userId],
        )
      ).rows,
    ).toEqual([{ email: null, verified_at: null }]);
  });

  it("resolves the verified contact email back to the same account for collision checks", async () => {
    const { registration, store } = service();
    const result = await registration.register({
      username: "Mai" + randomUUID().slice(0, 8),
      password: "fake-password-fixture",
      passwordConfirmation: "fake-password-fixture",
    });
    const captured: { otp: string }[] = [];
    const email = new EmailVerificationService(
      new EmailVerificationStore(pool),
      {
        async sendOtp(_to, otp) {
          captured.push({ otp });
        },
      },
      "synthetic-email-test-secret",
    );
    await email.send(result.userId, { email: "mai-contact@example.invalid" });
    await email.verify(result.userId, { otp: captured[0]!.otp });

    const owner = await store.accountByEmail("mai-contact@example.invalid");
    expect(owner?.userId).toBe(result.userId);
    // Credential email trả về vẫn là email kỹ thuật của Auth.
    expect(owner?.email).toMatch(/@username\.xiangqi\.invalid$/);
  });
});
