import { afterAll, afterEach, beforeEach, describe, expect, it } from "vitest";
import { EmailVerificationService } from "@server/account/email/email.service.js";
import { EmailVerificationStore } from "@server/account/email/email.store.js";
import { pool, databaseUrl } from "../password/password.test-helper.js";
import {
  setupUsernames,
  type UsernameFixture,
} from "./username.test-helper.js";

let u: UsernameFixture;
const change = "/account/username/change";
const recovery = "/auth/username/recovery";

describe.skipIf(!databaseUrl)("account OTP quota across purposes", () => {
  beforeEach(async () => {
    u = await setupUsernames();
  });
  afterEach(async () => {
    await u?.close();
  });
  afterAll(() => pool.end());

  it("shares five sends across recovery and rename and keeps username recovery generic", async () => {
    const user = await u.f.member({ contact: "verified" });
    const password = await u.f.passwords.request({ username: user.username });
    const name = await u.request(`${change}/request`, {}, user);
    expect(name.status).toBe(200);
    const { requestId } = (await name.json()) as { requestId: string };
    expect((await u.request(recovery, { email: user.contact })).status).toBe(
      200,
    );
    u.f.advance(60_000);
    u.advance(60_000);
    await u.f.passwords.resend({ requestId: password.requestId });
    expect(
      (await u.request(`${change}/resend`, { requestId }, user)).status,
    ).toBe(200);
    const sent = u.messages.length;
    u.f.advance(60_000);
    u.advance(60_000);
    expect((await u.request(recovery, { email: user.contact })).status).toBe(
      200,
    );
    expect(u.messages).toHaveLength(sent);
    await expect(
      u.f.passwords.resend({ requestId: password.requestId }),
    ).rejects.toMatchObject({ code: "PASSWORD_OTP_LIMITED" });
    expect(
      (await u.request(`${change}/resend`, { requestId }, user)).status,
    ).toBe(429);
  });

  it("counts failed SMTP attempts and uses the same normalized email across accounts", async () => {
    const first = await u.f.member();
    const second = await u.f.member();
    let calls = 0;
    const emails = new EmailVerificationService(
      new EmailVerificationStore(pool),
      {
        async sendOtp() {
          calls += 1;
          throw new Error("synthetic-smtp-failure");
        },
      },
      "synthetic-quota-secret",
    );
    const target = "shared@example.invalid";
    for (let i = 0; i < 5; i += 1) {
      await expect(
        emails.send(first.userId, { email: target }),
      ).rejects.toThrow();
      await pool.query(
        "UPDATE xiangqi_auth.username_accounts SET last_sent_at=last_sent_at-interval '60 seconds' WHERE user_id=$1",
        [first.userId],
      );
    }
    expect(calls).toBe(5);
    await expect(
      emails.send(second.userId, { email: " SHARED@example.invalid " }),
    ).rejects.toMatchObject({ code: "EMAIL_OTP_LIMITED", status: 429 });
    expect(calls).toBe(5);
    await pool.query(
      "UPDATE xiangqi_auth.otp_sends SET attempted_at=attempted_at-interval '1 hour' WHERE user_id=$1",
      [first.userId],
    );
    await expect(emails.send(second.userId, { email: target })).rejects.toThrow(
      "synthetic-smtp-failure",
    );
    expect(calls).toBe(6);
  });

  it("reserves the last available slot atomically while SMTP is still in flight", async () => {
    const user = await u.f.member({ contact: "verified" });
    await pool.query(
      "INSERT INTO xiangqi_auth.otp_sends(user_id,email_hash,attempted_at) SELECT $1,repeat('0',64),clock_timestamp() FROM generate_series(1,4)",
      [user.userId],
    );
    const [password, name] = await Promise.all([
      u.f.passwords.request({ username: user.username }).then(
        () => true,
        () => false,
      ),
      u
        .request(`${change}/request`, {}, user)
        .then((response) => response.status === 200),
    ]);
    expect(Number(password) + Number(name)).toBe(1);
  });
});
