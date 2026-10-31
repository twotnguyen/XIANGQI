import { createHmac, randomUUID } from "node:crypto";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import {
  apply,
  databaseUrl,
  pool,
  reset,
} from "../../game/room/room.test-helper.js";
import { EmailVerificationService } from "@server/account/email/email.service.js";
import { EmailVerificationStore } from "@server/account/email/email.store.js";
import {
  EmailError,
  type EmailSender,
} from "@server/account/email/email.types.js";

const SECRET = "synthetic-email-test-secret";

interface Sent {
  to: string;
  otp: string;
}

function capture(): { sent: Sent[]; mailer: EmailSender } {
  const sent: Sent[] = [];
  return {
    sent,
    mailer: {
      async sendOtp(to, otp) {
        sent.push({ to, otp });
      },
    },
  };
}

const failing: EmailSender = {
  async sendOtp() {
    throw new EmailError("EMAIL_SEND_FAILED", "synthetic smtp failure", 503);
  },
};

function build(mailer: EmailSender) {
  return new EmailVerificationService(
    new EmailVerificationStore(pool),
    mailer,
    SECRET,
  );
}

/** Tài khoản username-only: credential kỹ thuật đã xác nhận, origin khóa kỹ thuật. */
async function usernameAccount(): Promise<string> {
  const id = randomUUID();
  await pool.query(
    `INSERT INTO auth.users(id,email,email_confirmed_at,raw_app_meta_data)
     VALUES($1,$2,clock_timestamp(),'{"provider":"email"}')`,
    [id, `${id}@username.xiangqi.invalid`],
  );
  return id;
}

/** Tài khoản email thường hoặc Google, dùng để kiểm tra collision. */
async function plainAccount(email: string, provider: "email" | "google") {
  const id = randomUUID();
  await pool.query(
    `INSERT INTO auth.users(id,email,email_confirmed_at,raw_app_meta_data)
     VALUES($1,$2,clock_timestamp(),$3::jsonb)`,
    [id, email, JSON.stringify({ provider })],
  );
  return id;
}

async function otpRow(userId: string) {
  const { rows } = await pool.query(
    "SELECT pending_email,otp_hash,last_sent_at,attempts,email,verified_at FROM xiangqi_auth.username_accounts WHERE user_id=$1",
    [userId],
  );
  return rows[0];
}

/** Giống digest trong EmailVerificationService: OTP cố định gắn với pendingEmail + sentAt thật trong DB. */
async function pinOtp(userId: string, otp: string): Promise<void> {
  const row = await otpRow(userId);
  const hash = createHmac("sha256", SECRET)
    .update(
      `${userId}\n${row.pending_email}\n${new Date(row.last_sent_at).toISOString()}\n${otp}`,
    )
    .digest("hex");
  await pool.query(
    "UPDATE xiangqi_auth.username_accounts SET otp_hash=$2 WHERE user_id=$1",
    [userId, hash],
  );
}

describe.skipIf(!databaseUrl)(
  "username account contact email verification",
  () => {
    beforeEach(async () => {
      await reset();
      await apply(
        "supabase/migrations/20261029000001_username_account_email.sql",
      );
      await apply("supabase/migrations/20261103000002_yc1_account_rules.sql");
    });
    afterAll(() => pool.end());

    it("requests and verifies a contact email while keeping credential email and origin key rules", async () => {
      const id = await usernameAccount();
      const { sent, mailer } = capture();
      const service = build(mailer);
      await new EmailVerificationStore(pool).createUsernameAccount(id);

      const pending = await service.send(id, {
        email: "  Contact@Example.INVALID ",
      });
      expect(sent).toHaveLength(1);
      expect(sent[0]!.to).toBe("contact@example.invalid");
      expect(pending.emailVerified).toBe(false);
      expect(pending.pendingEmail).toBe("contact@example.invalid");

      const done = await service.verify(id, { otp: sent[0]!.otp });
      expect(done).toMatchObject({
        email: "contact@example.invalid",
        emailVerified: true,
        pendingEmail: null,
      });
      const cred = await pool.query(
        "SELECT email FROM auth.users WHERE id=$1",
        [id],
      );
      expect(cred.rows[0].email).toBe(`${id}@username.xiangqi.invalid`);
      const origin = await pool.query(
        "SELECT email_key FROM xiangqi_auth.account_origins WHERE user_id=$1",
        [id],
      );
      expect(origin.rows[0].email_key).toBe("contact@example.invalid");
    });

    it("rejects wrong OTP, commits attempts, and locks after five failures", async () => {
      const id = await usernameAccount();
      const { sent, mailer } = capture();
      const service = build(mailer);
      await new EmailVerificationStore(pool).createUsernameAccount(id);
      await service.send(id, { email: "lock@example.invalid" });
      const wrong = sent[0]!.otp === "000000" ? "111111" : "000000";

      for (let i = 0; i < 5; i++)
        await expect(service.verify(id, { otp: wrong })).rejects.toMatchObject({
          code: "EMAIL_OTP_INVALID",
        });
      expect((await otpRow(id)).attempts).toBe(5);
      await expect(
        service.verify(id, { otp: sent[0]!.otp }),
      ).rejects.toMatchObject({
        code: "EMAIL_OTP_LOCKED",
      });
    });

    it("rejects an expired OTP and does not promote the email", async () => {
      const id = await usernameAccount();
      const { sent, mailer } = capture();
      const service = build(mailer);
      await new EmailVerificationStore(pool).createUsernameAccount(id);
      await service.send(id, { email: "late@example.invalid" });
      await pool.query(
        "UPDATE xiangqi_auth.username_accounts SET expires_at=now()-interval '1 second' WHERE user_id=$1",
        [id],
      );
      await expect(
        service.verify(id, { otp: sent[0]!.otp }),
      ).rejects.toMatchObject({
        code: "EMAIL_OTP_EXPIRED",
      });
      expect((await otpRow(id)).verified_at).toBeNull();
    });

    it("rejects replay of a consumed OTP after verification", async () => {
      const id = await usernameAccount();
      const { sent, mailer } = capture();
      const service = build(mailer);
      await new EmailVerificationStore(pool).createUsernameAccount(id);
      await service.send(id, { email: "replay@example.invalid" });
      await service.verify(id, { otp: sent[0]!.otp });
      await expect(
        service.verify(id, { otp: sent[0]!.otp }),
      ).rejects.toMatchObject({
        code: "EMAIL_ALREADY_VERIFIED",
      });
    });

    it("rejects an OTP bound to another user's challenge, deterministically", async () => {
      const a = await usernameAccount();
      const b = await usernameAccount();
      const store = new EmailVerificationStore(pool);
      await store.createUsernameAccount(a);
      await store.createUsernameAccount(b);
      const service = build(capture().mailer);
      await service.send(a, { email: "owner-a@example.invalid" });
      await service.send(b, { email: "owner-b@example.invalid" });
      // Mã cố định khác nhau: hash của A là 111111, của B là 222222.
      await pinOtp(a, "111111");
      await pinOtp(b, "222222");

      await expect(service.verify(b, { otp: "111111" })).rejects.toMatchObject({
        code: "EMAIL_OTP_INVALID",
      });
      await expect(service.verify(a, { otp: "222222" })).rejects.toMatchObject({
        code: "EMAIL_OTP_INVALID",
      });
      await expect(service.verify(b, { otp: "222222" })).resolves.toMatchObject(
        {
          emailVerified: true,
          email: "owner-b@example.invalid",
        },
      );
    });

    it("rejects an address already used by an existing email, Google or verified username account", async () => {
      const store = new EmailVerificationStore(pool);
      await plainAccount("taken-email@example.invalid", "email");
      await plainAccount("taken-google@example.invalid", "google");
      const service = build(capture().mailer);
      const id = await usernameAccount();
      await store.createUsernameAccount(id);

      await expect(
        service.send(id, { email: "taken-email@example.invalid" }),
      ).rejects.toMatchObject({ code: "EMAIL_TAKEN" });
      await expect(
        service.send(id, { email: "taken-google@example.invalid" }),
      ).rejects.toMatchObject({ code: "EMAIL_TAKEN" });

      const first = await usernameAccount();
      const captured = capture();
      const verifying = build(captured.mailer);
      await store.createUsernameAccount(first);
      await verifying.send(first, { email: "claimed@example.invalid" });
      await verifying.verify(first, { otp: captured.sent[0]!.otp });
      await expect(
        verifying.send(id, { email: "claimed@example.invalid" }),
      ).rejects.toMatchObject({ code: "EMAIL_TAKEN" });
    });

    it("lets two pending challenges race for one address and rejects the loser at promotion", async () => {
      const store = new EmailVerificationStore(pool);
      const a = await usernameAccount();
      const b = await usernameAccount();
      await store.createUsernameAccount(a);
      await store.createUsernameAccount(b);
      const captured = capture();
      const service = build(captured.mailer);
      await service.send(a, { email: "race@example.invalid" });
      await service.send(b, { email: "race@example.invalid" });

      await service.verify(a, { otp: captured.sent[0]!.otp });
      await expect(
        service.verify(b, { otp: captured.sent[1]!.otp }),
      ).rejects.toMatchObject({
        code: "EMAIL_TAKEN",
      });
    });

    it("clears the undelivered challenge after SMTP failure but keeps the resend cooldown", async () => {
      const id = await usernameAccount();
      const store = new EmailVerificationStore(pool);
      await store.createUsernameAccount(id);
      await expect(
        build(failing).send(id, { email: "smtp@example.invalid" }),
      ).rejects.toMatchObject({ code: "EMAIL_SEND_FAILED" });

      const row = await otpRow(id);
      expect(row.pending_email).toBeNull();
      expect(row.otp_hash).toBeNull();
      expect(row.last_sent_at).not.toBeNull();
      // Cooldown không bị bypass bằng cách gửi lỗi rồi gửi lại ngay.
      await expect(build(capture().mailer).resend(id)).rejects.toMatchObject({
        code: "EMAIL_RESEND_LIMITED",
      });
    });

    it("does not discard a newer challenge when an older discard arrives", async () => {
      const id = await usernameAccount();
      const store = new EmailVerificationStore(pool);
      await store.createUsernameAccount(id);
      const first = await store.challenge(id, {
        email: "old@example.invalid",
        hash: () => "a".repeat(64),
      });
      await pool.query(
        "UPDATE xiangqi_auth.username_accounts SET last_sent_at=now()-interval '61 seconds' WHERE user_id=$1",
        [id],
      );
      await store.challenge(id, {
        email: "new@example.invalid",
        hash: () => "b".repeat(64),
      });
      await store.discardChallenge(id, first.otpHash);
      const row = await otpRow(id);
      expect(row.pending_email).toBe("new@example.invalid");
      expect(row.otp_hash).toBe("b".repeat(64));
    });

    it("enforces a 60 second resend cooldown and then issues a fresh OTP", async () => {
      const id = await usernameAccount();
      const { sent, mailer } = capture();
      const service = build(mailer);
      await new EmailVerificationStore(pool).createUsernameAccount(id);
      await service.send(id, { email: "resend@example.invalid" });

      await expect(service.resend(id)).rejects.toMatchObject({
        code: "EMAIL_RESEND_LIMITED",
      });
      // Lùi thời điểm gửi 61 giây trong DB thay vì chờ thật.
      await pool.query(
        "UPDATE xiangqi_auth.username_accounts SET last_sent_at=now()-interval '61 seconds' WHERE user_id=$1",
        [id],
      );
      const status = await service.resend(id);
      expect(sent).toHaveLength(2);
      expect(sent[1]!.to).toBe("resend@example.invalid");
      expect(status.pendingEmail).toBe("resend@example.invalid");
    });
  },
);
