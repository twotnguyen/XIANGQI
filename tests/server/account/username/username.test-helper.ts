import type { INestApplication } from "@nestjs/common";
import { createApp } from "@server/app.js";
import { SessionModule } from "@server/account/session/session.module.js";
import { UsernameModule } from "@server/account/username/username.module.js";
import { UsernameService } from "@server/account/username/username.service.js";
import { UsernameStore } from "@server/account/username/username.store.js";
import {
  pool,
  setupPasswords,
  type PasswordFixture,
} from "../password/password.test-helper.js";
import { apply } from "../../game/room/room.test-helper.js";

export interface UsernameFixture {
  app: INestApplication;
  f: PasswordFixture;
  messages: { to: string; otp: string }[];
  failMail: (value: boolean) => void;
  advance: (milliseconds: number) => void;
  request(
    path: string,
    body?: unknown,
    proof?: { access_token: string; appSession: string },
  ): Promise<Response>;
  close(): Promise<void>;
}

export async function setupUsernames(): Promise<UsernameFixture> {
  const f = await setupPasswords();
  await pool.query("DROP TABLE IF EXISTS xiangqi_auth.username_challenges");
  await apply("supabase/migrations/20261102000001_username_management.sql");
  let time = Date.now();
  const now = () => new Date(time);
  const messages: { to: string; otp: string }[] = [];
  let failMail = false;
  const mailer = {
    async sendOtp(to: string, otp: string) {
      if (failMail) throw new Error("private-fixture-smtp-secret");
      messages.push({ to, otp });
    },
  };
  const usernames = new UsernameService(
    new UsernameStore(pool),
    mailer,
    "synthetic-username-secret",
    now,
  );
  const app = await createApp(
    ["http://localhost:5173"],
    [
      SessionModule.forRoot(
        f.sessions,
        (token) => f.auth.refreshSession(token),
        false,
      ),
      UsernameModule.forRoot(usernames, f.sessions),
    ],
  );
  await app.listen(0, "127.0.0.1");
  const address = app.getHttpServer().address();
  const url = `http://127.0.0.1:${address.port}`;

  return {
    app,
    f,
    messages,
    failMail: (value: boolean) => {
      failMail = value;
    },
    advance: (milliseconds: number) => {
      time += milliseconds;
    },
    request: async (path, body, proof) =>
      fetch(`${url}${path}`, {
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
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      }),
    close: async () => {
      await app.close();
      await f.close();
    },
  };
}
