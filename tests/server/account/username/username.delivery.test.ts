import { afterAll, afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  UsernameStore,
  type Issued,
} from "@server/account/username/username.store.js";
import { pool, databaseUrl } from "../password/password.test-helper.js";
import {
  setupUsernames,
  type UsernameFixture,
} from "./username.test-helper.js";

let u: UsernameFixture;
const change = "/account/username/change";
const recovery = "/auth/username/recovery";
type Delivery = Extract<Issued, { kind: "ok" }>;
function delivered(value: Issued): Delivery {
  if (value.kind !== "ok")
    throw new Error("Synthetic account must receive OTP");
  return value;
}

// Real database + HTTP service/mailer boundary: no copies of the OTP verifier or SQL behavior.
describe.skipIf(!databaseUrl)("username OTP delivery and resend", () => {
  beforeEach(async () => {
    u = await setupUsernames();
  });
  afterEach(async () => {
    await u?.close();
  });
  afterAll(() => pool.end());

  it.each(["username-change", "username-recovery"] as const)(
    "%s grants five fresh attempts only after a new code is sent",
    async (purpose) => {
      const user = await u.f.member({ contact: "verified" });
      const base = purpose === "username-change" ? change : recovery;
      const proof = purpose === "username-change" ? user : undefined;
      const first = await u.request(
        purpose === "username-change" ? `${base}/request` : base,
        purpose === "username-change" ? {} : { email: user.contact },
        proof,
      );
      expect(first.status, await first.clone().text()).toBe(200);
      const { requestId } = (await first.json()) as { requestId: string };
      const oldOtp = u.messages.at(-1)!.otp;
      const wrong = oldOtp === "000000" ? "111111" : "000000";
      for (let i = 0; i < 5; i += 1)
        expect(
          (await u.request(`${base}/verify`, { requestId, otp: wrong }, proof))
            .status,
        ).toBe(400);
      u.advance(59_999);
      const tooSoon = await u.request(`${base}/resend`, { requestId }, proof);
      expect(tooSoon.status).toBe(purpose === "username-change" ? 429 : 200);
      expect(u.messages).toHaveLength(1);
      u.advance(1);
      expect(
        (await u.request(`${base}/resend`, { requestId }, proof)).status,
      ).toBe(200);
      expect(u.messages).toHaveLength(2);
      expect(
        (
          await pool.query(
            "SELECT attempts FROM xiangqi_auth.username_challenges WHERE user_id=$1 AND purpose=$2",
            [user.userId, purpose],
          )
        ).rows[0].attempts,
      ).toBe(0);
      const newOtp = u.messages.at(-1)!.otp;
      // Two independent six-digit draws may coincide; the same numeric value cannot be rejected as "old" then.
      if (newOtp !== oldOtp)
        expect(
          (await u.request(`${base}/verify`, { requestId, otp: oldOtp }, proof))
            .status,
        ).toBe(400);
      expect(
        (await u.request(`${base}/verify`, { requestId, otp: newOtp }, proof))
          .status,
      ).toBe(200);
    },
  );

  it.each(["username-change", "username-recovery"] as const)(
    "%s preserves its old proof, attempts and cooldown when SMTP fails",
    async (purpose) => {
      const user = await u.f.member({ contact: "verified" });
      const base = purpose === "username-change" ? change : recovery;
      const proof = purpose === "username-change" ? user : undefined;
      const first = await u.request(
        purpose === "username-change" ? `${base}/request` : base,
        purpose === "username-change" ? {} : { email: user.contact },
        proof,
      );
      expect(first.status, await first.clone().text()).toBe(200);
      const { requestId } = (await first.json()) as { requestId: string };
      const oldOtp = u.messages.at(-1)!.otp;
      await u.request(
        `${base}/verify`,
        { requestId, otp: oldOtp === "000000" ? "111111" : "000000" },
        proof,
      );
      const before = (
        await pool.query(
          "SELECT request_hash,otp_hash,sent_at,expires_at,attempts FROM xiangqi_auth.username_challenges WHERE user_id=$1 AND purpose=$2",
          [user.userId, purpose],
        )
      ).rows[0];
      u.advance(60_000);
      u.failMail(true);
      const failed = await u.request(`${base}/resend`, { requestId }, proof);
      expect(failed.status).toBe(purpose === "username-change" ? 503 : 200);
      const after = (
        await pool.query(
          "SELECT request_hash,otp_hash,sent_at,expires_at,attempts,pending_otp_hash,last_issue_at FROM xiangqi_auth.username_challenges WHERE user_id=$1 AND purpose=$2",
          [user.userId, purpose],
        )
      ).rows[0];
      expect(after).toMatchObject(before);
      expect(after.pending_otp_hash).toBeNull();
      expect(after.last_issue_at.getTime()).toBe(
        before.sent_at.getTime() + 60_000,
      );
      u.failMail(false);
      const retry = await u.request(`${base}/resend`, { requestId }, proof);
      expect(retry.status).toBe(purpose === "username-change" ? 429 : 200);
      expect(u.messages).toHaveLength(1);
      expect(
        (await u.request(`${base}/verify`, { requestId, otp: oldOtp }, proof))
          .status,
      ).toBe(200);
    },
  );

  it("keeps an already verified change capability when a replacement email fails", async () => {
    const user = await u.f.member({ contact: "verified" });
    const first = await u.request(`${change}/request`, {}, user);
    expect(first.status, await first.clone().text()).toBe(200);
    const { requestId } = (await first.json()) as { requestId: string };
    const verified = await u.request(
      `${change}/verify`,
      { requestId, otp: u.messages.at(-1)!.otp },
      user,
    );
    const { changeToken } = (await verified.json()) as { changeToken: string };
    u.advance(60_000);
    u.failMail(true);
    expect((await u.request(`${change}/request`, {}, user)).status).toBe(503);
    u.failMail(false);
    expect(
      (
        await u.request(
          `${change}/finalize`,
          {
            changeToken,
            username: "n" + user.userId.replaceAll("-", "").slice(0, 12),
          },
          user,
        )
      ).status,
    ).toBe(200);
  });

  it("rejects stale SMTP acknowledgements and failures after a later send", async () => {
    const user = await u.f.member({ contact: "verified" });
    const firstResponse = await u.request(`${change}/request`, {}, user);
    expect(firstResponse.status, await firstResponse.clone().text()).toBe(200);
    const row = (
      await pool.query(
        "SELECT sent_at FROM xiangqi_auth.username_challenges WHERE user_id=$1",
        [user.userId],
      )
    ).rows[0];
    const store = new UsernameStore(pool);
    const first = delivered(
      await store.issue(user.userId, "username-change", {
        requestHash: "a".repeat(64),
        priorHash: null,
        sentAt: new Date(row.sent_at.getTime() + 60_000),
        otpHash: () => "b".repeat(64),
      }),
    );
    const second = delivered(
      await store.issue(user.userId, "username-change", {
        requestHash: "c".repeat(64),
        priorHash: null,
        sentAt: new Date(row.sent_at.getTime() + 120_000),
        otpHash: () => "d".repeat(64),
      }),
    );
    expect(
      await store.confirmDelivery(user.userId, "username-change", first),
    ).toBe(false);
    await store.discard(user.userId, "username-change", first);
    expect(
      await store.confirmDelivery(user.userId, "username-change", second),
    ).toBe(true);
    await store.discard(user.userId, "username-change", first);
    expect(
      (
        await pool.query(
          "SELECT request_hash,otp_hash,attempts FROM xiangqi_auth.username_challenges WHERE user_id=$1",
          [user.userId],
        )
      ).rows[0],
    ).toEqual({
      request_hash: second.requestHash,
      otp_hash: second.otpHash,
      attempts: 0,
    });
  });

  it("does not overwrite a capability verified while SMTP was in flight", async () => {
    const user = await u.f.member({ contact: "verified" });
    const first = await u.request(`${change}/request`, {}, user);
    expect(first.status, await first.clone().text()).toBe(200);
    const { requestId } = (await first.json()) as { requestId: string };
    const oldOtp = u.messages.at(-1)!.otp;
    const row = (
      await pool.query(
        "SELECT sent_at FROM xiangqi_auth.username_challenges WHERE user_id=$1",
        [user.userId],
      )
    ).rows[0];
    const store = new UsernameStore(pool);
    const pending = delivered(
      await store.issue(user.userId, "username-change", {
        requestHash: "a".repeat(64),
        priorHash: null,
        sentAt: new Date(row.sent_at.getTime() + 60_000),
        otpHash: () => "b".repeat(64),
      }),
    );
    const verified = await u.request(
      `${change}/verify`,
      { requestId, otp: oldOtp },
      user,
    );
    expect(verified.status).toBe(200);
    const { changeToken } = (await verified.json()) as { changeToken: string };
    expect(
      await store.confirmDelivery(user.userId, "username-change", pending),
    ).toBe(false);
    await store.discard(user.userId, "username-change", pending);
    expect(
      (
        await u.request(
          `${change}/finalize`,
          {
            changeToken,
            username: "n" + user.userId.replaceAll("-", "").slice(0, 12),
          },
          user,
        )
      ).status,
    ).toBe(200);
  });
});
