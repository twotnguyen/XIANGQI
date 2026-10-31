import { afterAll, afterEach, beforeEach, describe, expect, it } from "vitest";
import { pool, databaseUrl } from "../password/password.test-helper.js";
import {
  setupUsernames,
  type UsernameFixture,
} from "./username.test-helper.js";

let u: UsernameFixture;
const change = "/account/username/change";
const recovery = "/auth/username/recovery";
const CAPABILITY_MS = 10 * 60_000;

interface Member {
  userId: string;
  username: string;
  contact: string;
  access_token: string;
  appSession: string;
}

describe.skipIf(!databaseUrl)("username change and recovery", () => {
  beforeEach(async () => {
    u = await setupUsernames();
  });
  afterEach(async () => {
    await u?.close();
  });
  afterAll(() => pool.end());

  async function member(contact: "verified" | "none" = "verified") {
    return u.f.member({ contact });
  }

  function nameOf(user: Member, prefix: string) {
    return `${prefix}${user.userId.replaceAll("-", "").slice(0, 12)}`;
  }

  async function requestCode(user: Member) {
    return u.request(`${change}/request`, {}, user);
  }

  async function sessionCount(userId: string) {
    return (
      await pool.query(
        "SELECT count(*)::int AS n FROM xiangqi_auth.app_sessions WHERE user_id=$1",
        [userId],
      )
    ).rows[0].n as number;
  }

  /** Gửi OTP và xác minh; trả về requestId và changeToken để test các bước sau. */
  async function verifiedCapability(user: Member) {
    const sent = await requestCode(user);
    expect(sent.status).toBe(200);
    const { requestId } = (await sent.json()) as { requestId: string };
    const otp = u.messages.at(-1)!.otp;
    const verified = await u.request(
      `${change}/verify`,
      { requestId, otp },
      user,
    );
    expect(verified.status).toBe(200);
    const { changeToken } = (await verified.json()) as { changeToken: string };
    return { requestId, changeToken };
  }

  function finalize(user: Member, changeToken: string, username: string) {
    return u.request(`${change}/finalize`, { changeToken, username }, user);
  }

  it("changes username after OTP without a name in the request, keeps sessions, and reserves the old name", async () => {
    const user = await member();
    const newName = nameOf(user, "n");
    const before = await sessionCount(user.userId);
    const sent = await requestCode(user);
    expect(sent.status).toBe(200);
    const { requestId } = (await sent.json()) as { requestId: string };
    expect(u.messages.at(-1)!.to).toBe(user.contact);
    const verified = await u.request(
      `${change}/verify`,
      { requestId, otp: u.messages.at(-1)!.otp },
      user,
    );
    const { changeToken } = (await verified.json()) as { changeToken: string };
    const done = await finalize(user, changeToken, newName);
    expect(done.status).toBe(200);
    expect(await done.json()).toEqual({ username: newName });
    expect(
      (
        await pool.query(
          "SELECT username FROM public.profiles WHERE user_id=$1",
          [user.userId],
        )
      ).rows[0].username,
    ).toBe(newName);
    expect(await sessionCount(user.userId)).toBe(before);
    const other = await member();
    const reclaim = await finalize(
      other,
      (await verifiedCapability(other)).changeToken,
      user.username,
    );
    expect(reclaim.status).toBe(409);
    expect(await reclaim.json()).toMatchObject({ code: "USERNAME_TAKEN" });
  });

  it("keeps the verified capability after a taken name so the user can retry without a new OTP", async () => {
    const holder = await member();
    const user = await member();
    const taken = nameOf(holder, "h");
    expect(
      (
        await finalize(
          holder,
          (await verifiedCapability(holder)).changeToken,
          taken,
        )
      ).status,
    ).toBe(200);
    const { changeToken } = await verifiedCapability(user);
    const messagesBefore = u.messages.length;
    const conflict = await finalize(user, changeToken, taken);
    expect(conflict.status).toBe(409);
    expect(await conflict.json()).toMatchObject({ code: "USERNAME_TAKEN" });
    const retry = await finalize(user, changeToken, nameOf(user, "r"));
    expect(retry.status).toBe(200);
    expect(u.messages.length).toBe(messagesBefore);
  });

  it("keeps the seven-day rename cooldown across requests and rechecks it before finalize", async () => {
    const user = await member();
    const { changeToken } = await verifiedCapability(user);
    expect((await finalize(user, changeToken, nameOf(user, "c"))).status).toBe(
      200,
    );
    const sent = u.messages.length;
    const tooSoon = await requestCode(user);
    expect(tooSoon.status).toBe(429);
    expect(await tooSoon.json()).toMatchObject({
      code: "USERNAME_CHANGE_LIMITED",
      retryAfterDays: 7,
    });
    expect(u.messages).toHaveLength(sent);
    u.advance(7 * 24 * 3600_000 - 1);
    expect((await requestCode(user)).status).toBe(429);
    u.advance(1);
    const next = await verifiedCapability(user);
    await pool.query(
      "UPDATE public.profiles SET username_changed_at=username_changed_at+interval '7 days' WHERE user_id=$1",
      [user.userId],
    );
    expect((await finalize(user, next.changeToken, user.username)).status).toBe(
      429,
    );
    await pool.query(
      "UPDATE public.profiles SET username_changed_at=username_changed_at-interval '7 days' WHERE user_id=$1",
      [user.userId],
    );
    expect((await finalize(user, next.changeToken, user.username)).status).toBe(
      200,
    );
  });

  it("consumes the capability on success so the same token cannot rename twice", async () => {
    const user = await member();
    const { changeToken } = await verifiedCapability(user);
    expect((await finalize(user, changeToken, nameOf(user, "a"))).status).toBe(
      200,
    );
    const again = await finalize(user, changeToken, nameOf(user, "b"));
    expect(again.status).toBe(400);
    expect(await again.json()).toMatchObject({
      code: "USERNAME_REQUEST_INVALID",
    });
  });

  it("rejects finalize with a wrong or missing capability", async () => {
    const user = await member();
    const { changeToken } = await verifiedCapability(user);
    const wrong = await finalize(user, "A".repeat(43), nameOf(user, "w"));
    expect(wrong.status).toBe(400);
    expect(await wrong.json()).toMatchObject({
      code: "USERNAME_REQUEST_INVALID",
    });
    const bare = await u.request(
      `${change}/finalize`,
      { username: nameOf(user, "w") },
      user,
    );
    expect(bare.status).toBe(400);
    expect((await finalize(user, changeToken, nameOf(user, "w"))).status).toBe(
      200,
    );
  });

  it("expires the capability after ten minutes", async () => {
    const user = await member();
    const { changeToken } = await verifiedCapability(user);
    u.advance(CAPABILITY_MS + 1_000);
    const late = await finalize(user, changeToken, nameOf(user, "e"));
    expect(late.status).toBe(400);
    expect(await late.json()).toMatchObject({
      code: "USERNAME_REQUEST_INVALID",
    });
  });

  it("blocks resend once the OTP is verified", async () => {
    const user = await member();
    const sent = await requestCode(user);
    const { requestId } = (await sent.json()) as { requestId: string };
    await u.request(
      `${change}/verify`,
      { requestId, otp: u.messages.at(-1)!.otp },
      user,
    );
    u.advance(120_000);
    const resend = await u.request(`${change}/resend`, { requestId }, user);
    expect(resend.status).toBe(400);
    expect(await resend.json()).toMatchObject({
      code: "USERNAME_REQUEST_INVALID",
    });
  });

  it("rejects change without a verified contact email before sending any OTP", async () => {
    const user = await member("none");
    const sent = await requestCode(user);
    expect(sent.status).toBe(409);
    expect(await sent.json()).toMatchObject({
      code: "USERNAME_EMAIL_REQUIRED",
    });
    expect(u.messages).toHaveLength(0);
  });

  it("locks the OTP after five wrong attempts even with the right code", async () => {
    const user = await member();
    const sent = await requestCode(user);
    const { requestId } = (await sent.json()) as { requestId: string };
    const otp = u.messages.at(-1)!.otp;
    const wrong = otp === "000000" ? "111111" : "000000";
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const response = await u.request(
        `${change}/verify`,
        { requestId, otp: wrong },
        user,
      );
      expect(response.status).toBe(400);
    }
    const locked = await u.request(
      `${change}/verify`,
      { requestId, otp },
      user,
    );
    expect(locked.status).toBe(400);
    expect(await locked.json()).toMatchObject({ code: "USERNAME_OTP_INVALID" });
  });

  it("lets exactly one of two concurrent finalizes to the same name succeed", async () => {
    const first = await member();
    const second = await member();
    const shared = nameOf(first, "s");
    const [a, b] = await Promise.all([
      finalize(first, (await verifiedCapability(first)).changeToken, shared),
      finalize(second, (await verifiedCapability(second)).changeToken, shared),
    ]);
    expect([a.status, b.status].sort()).toEqual([200, 409]);
  });

  it("answers recovery generically for unknown email and reveals username only after valid OTP without a session", async () => {
    const user = await member();
    const sessionsBefore = (
      await pool.query(
        "SELECT count(*)::int AS n FROM xiangqi_auth.app_sessions",
      )
    ).rows[0].n;
    const unknown = await u.request(recovery, {
      email: "nobody@example.invalid",
    });
    const known = await u.request(recovery, { email: user.contact });
    expect(unknown.status).toBe(200);
    expect(known.status).toBe(200);
    const unknownBody = (await unknown.json()) as Record<string, unknown>;
    const knownBody = (await known.json()) as {
      requestId: string;
      expiresAt: string;
      resendAt: string;
    };
    expect(Object.keys(unknownBody).sort()).toEqual(
      Object.keys(knownBody).sort(),
    );
    expect(JSON.stringify(knownBody)).not.toContain(user.username);
    const otp = u.messages.at(-1)!.otp;
    const verified = await u.request(`${recovery}/verify`, {
      requestId: knownBody.requestId,
      otp,
    });
    expect(verified.status).toBe(200);
    expect(await verified.json()).toEqual({ username: user.username });
    const sessionsAfter = (
      await pool.query(
        "SELECT count(*)::int AS n FROM xiangqi_auth.app_sessions",
      )
    ).rows[0].n;
    expect(sessionsAfter).toBe(sessionsBefore);
  });

  it("reports SMTP failure as a provider error for change without leaking the provider message", async () => {
    const user = await member();
    u.failMail(true);
    const response = await requestCode(user);
    expect(response.status).toBe(503);
    const text = await response.text();
    expect(text).not.toContain("private-fixture-smtp-secret");
    expect(JSON.parse(text)).toMatchObject({ code: "USERNAME_PROVIDER_ERROR" });
  });

  it("rejects a row that holds a pending OTP and a verified capability at once", async () => {
    const user = await member();
    const attempt = pool.query(
      `INSERT INTO xiangqi_auth.username_challenges(user_id,purpose,request_hash,contact_email,verified_hash,verified_expires_at,otp_hash,sent_at,expires_at)
       VALUES($1,'username-change',$2,$3,$4,now()+interval '10 minutes',$5,now(),now()+interval '180 seconds')`,
      [
        user.userId,
        "a".repeat(64),
        user.contact,
        "b".repeat(64),
        "c".repeat(64),
      ],
    );
    await expect(attempt).rejects.toThrow();
  });

  it("answers recovery request and resend with one envelope at cooldown and on provider failure", async () => {
    const user = await member();
    const keys = async (response: Response) =>
      Object.keys((await response.json()) as object).sort();
    const first = await u.request(recovery, { email: user.contact });
    const { requestId } = (await first.json()) as { requestId: string };
    const cooldown = await u.request(recovery, { email: user.contact });
    const unknown = await u.request(recovery, {
      email: "nobody@example.invalid",
    });
    expect(cooldown.status).toBe(200);
    expect(unknown.status).toBe(200);
    expect(await keys(cooldown)).toEqual(await keys(unknown));
    const resendCooldown = await u.request(`${recovery}/resend`, { requestId });
    const resendUnknown = await u.request(`${recovery}/resend`, {
      requestId: "B".repeat(43),
    });
    expect(resendCooldown.status).toBe(200);
    expect(resendUnknown.status).toBe(200);
    expect(await keys(resendCooldown)).toEqual(await keys(resendUnknown));
    u.advance(61_000);
    u.failMail(true);
    const failedKnown = await u.request(recovery, { email: user.contact });
    const failedUnknown = await u.request(recovery, {
      email: "nobody2@example.invalid",
    });
    u.failMail(false);
    expect(failedKnown.status).toBe(200);
    expect(failedUnknown.status).toBe(200);
    expect(await keys(failedKnown)).toEqual(await keys(failedUnknown));
  });

  it("returns the same wrong-OTP error for an expired recovery code", async () => {
    const user = await member();
    const sent = await u.request(recovery, { email: user.contact });
    const { requestId } = (await sent.json()) as { requestId: string };
    const otp = u.messages.at(-1)!.otp;
    u.advance(181_000);
    const expired = await u.request(`${recovery}/verify`, { requestId, otp });
    expect(expired.status).toBe(400);
    expect(await expired.json()).toMatchObject({
      code: "USERNAME_OTP_INVALID",
    });
  });

  it("blocks a direct username UPDATE without a verified change proof", async () => {
    const user = await member();
    await expect(
      pool.query("UPDATE public.profiles SET username=$2 WHERE user_id=$1", [
        user.userId,
        nameOf(user, "d"),
      ]),
    ).rejects.toThrow("Username change requires a verified proof");
  });
  it("allows a direct username UPDATE only with a live verified change proof", async () => {
    const user = await member();
    await verifiedCapability(user);
    const newName = nameOf(user, "p");
    await pool.query(
      "UPDATE public.profiles SET username=$2 WHERE user_id=$1",
      [user.userId, newName],
    );
    const row = await pool.query(
      "SELECT username FROM public.profiles WHERE user_id=$1",
      [user.userId],
    );
    expect(row.rows[0].username).toBe(newName);
  });
});
