import { createHash, randomBytes, randomUUID } from "node:crypto";
import type { INestApplication } from "@nestjs/common";
import type { Session } from "@server/account/auth/registration.types.js";
import { createApp } from "@server/app.js";
import { SupabaseAuth } from "@server/account/auth/supabase-auth.js";
import { EmailVerificationService } from "@server/account/email/email.service.js";
import { EmailVerificationStore } from "@server/account/email/email.store.js";
import { PostgresLoginStore } from "@server/account/login/postgres-login-store.js";
import { SessionService } from "@server/account/login/session.service.js";
import { SessionModule } from "@server/account/session/session.module.js";
import { PasswordModule } from "@server/account/password/password.module.js";
import { PasswordService } from "@server/account/password/password.service.js";
import { PasswordStore } from "@server/account/password/password.store.js";
import {
  startAuthFixture,
  type AuthFixture,
} from "../auth/auth-fixture.test-helper.js";
import {
  apply,
  databaseUrl,
  pool,
  reset,
} from "../../game/room/room.test-helper.js";

export { databaseUrl, pool };
export const oldPassword = "fixture-old-password";
export const newPassword = "fixture-new-password";
export const fingerprint = (value: string) =>
  createHash("sha256").update(value).digest("hex");

export interface PasswordMember extends Session {
  userId: string;
  username: string;
  credentialEmail: string;
  contact: string;
  appSession: string;
  expiresAt: string;
}

export interface PasswordFixture {
  app: INestApplication;
  auth: SupabaseAuth;
  provider: AuthFixture;
  loginStore: PostgresLoginStore;
  sessions: SessionService;
  passwordStore: PasswordStore;
  passwords: PasswordService;
  messages: { to: string; otp: string }[];
  member(options?: {
    username?: string;
    contact?: "verified" | "pending" | "none";
    google?: boolean;
  }): Promise<PasswordMember>;
  request(
    path: string,
    body?: unknown,
    proof?: { access_token: string; appSession: string },
    headers?: Record<string, string>,
  ): Promise<Response>;
  historicalSession(userId: string): Promise<string>;
  advance(milliseconds: number): void;
  failMail(value: boolean): void;
  close(): Promise<void>;
}

export async function setupPasswords(): Promise<PasswordFixture> {
  await reset();
  await apply("supabase/migrations/20261029000001_username_account_email.sql");
  await apply("supabase/migrations/20261030000001_password_recovery.sql");
  await apply("supabase/migrations/20261031000001_session_devices.sql");
  let time = Date.now();
  const now = () => new Date(time);
  const provider = await startAuthFixture(pool, now);
  const auth = new SupabaseAuth(
    provider.url,
    "synthetic-public",
    "synthetic-secret",
  );
  const loginStore = new PostgresLoginStore(pool);
  const sessions = new SessionService(loginStore, auth, now);
  const passwordStore = new PasswordStore(pool);
  const messages: { to: string; otp: string }[] = [];
  let failMail = false;
  const mailer = {
    async sendOtp(to: string, otp: string) {
      if (failMail) throw new Error("private-fixture-smtp-secret");
      messages.push({ to, otp });
    },
  };
  const passwords = new PasswordService(
    passwordStore,
    auth,
    mailer,
    "synthetic-password-secret",
    now,
  );
  const app = await createApp(
    ["http://localhost:5173"],
    [
      SessionModule.forRoot(
        sessions,
        (token) => auth.refreshSession(token),
        false,
      ),
      PasswordModule.forRoot(passwords, sessions, false),
    ],
  );
  await app.listen(0, "127.0.0.1");
  const address = app.getHttpServer().address();
  const url = `http://127.0.0.1:${address.port}`;

  async function member(
    options: {
      username?: string;
      contact?: "verified" | "pending" | "none";
      google?: boolean;
    } = {},
  ) {
    const userId = randomUUID();
    const username =
      options.username ?? `u${userId.replaceAll("-", "").slice(0, 15)}`;
    const contact = `contact-${userId}@example.invalid`;
    const credentialEmail = options.google
      ? contact
      : `${userId}@username.xiangqi.invalid`;
    await pool.query(
      "INSERT INTO auth.users(id,email,email_confirmed_at,raw_app_meta_data,created_at) VALUES($1,$2,$3,$4,$3)",
      [
        userId,
        credentialEmail,
        now(),
        {
          provider: options.google ? "google" : "email",
          registration_pending: false,
        },
      ],
    );
    await pool.query(
      "INSERT INTO public.profiles(user_id,username,display_name,completed_at,registration_pending) VALUES($1,$2,$2,$3,false)",
      [userId, username, now()],
    );
    if (!options.google) {
      const emailStore = new EmailVerificationStore(pool);
      await emailStore.createUsernameAccount(userId);
      if (options.contact && options.contact !== "none") {
        const emails = new EmailVerificationService(
          emailStore,
          mailer,
          "synthetic-email-secret",
        );
        await emails.send(userId, { email: contact });
        if (options.contact === "verified")
          await emails.verify(userId, { otp: messages.at(-1)!.otp });
      }
    }
    await auth.setPassword(userId, oldPassword);
    const proof = await auth.signInPassword(credentialEmail, oldPassword);
    const session = await sessions.issue(userId);
    return { userId, username, credentialEmail, contact, ...proof, ...session };
  }

  async function request(
    path: string,
    body?: unknown,
    proof?: { access_token: string; appSession: string },
    headers: Record<string, string> = {},
  ) {
    return fetch(`${url}${path}`, {
      method: body === undefined ? "GET" : "POST",
      headers: {
        Origin: "http://localhost:5173",
        "Content-Type": "application/json",
        ...(proof
          ? {
              Authorization: `Bearer ${proof.access_token}`,
              "X-Xiangqi-Session": proof.appSession,
            }
          : {}),
        ...headers,
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  }

  async function historicalSession(userId: string) {
    const appSession = randomBytes(32).toString("base64url");
    await pool.query(
      "INSERT INTO xiangqi_auth.app_sessions(token_hash,user_id,created_at,expires_at,remember) VALUES($1,$2,$3,$4,true)",
      [
        fingerprint(appSession),
        userId,
        now(),
        new Date(time + 30 * 24 * 3600_000),
      ],
    );
    return appSession;
  }

  return {
    app,
    auth,
    provider,
    loginStore,
    sessions,
    passwordStore,
    passwords,
    messages,
    member,
    request,
    historicalSession,
    advance: (milliseconds: number) => {
      time += milliseconds;
    },
    failMail: (value: boolean) => {
      failMail = value;
    },
    close: async () => {
      await app.close();
      await provider.close();
    },
  };
}
