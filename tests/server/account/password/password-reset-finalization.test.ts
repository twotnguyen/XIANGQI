import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { PasswordTx } from "@server/account/password/password.store.js";
import {
  databaseUrl,
  pool,
  setupPasswords,
  newPassword,
  type PasswordFixture,
} from "./password.test-helper.js";

const base = "/auth/password/recovery";
let f: PasswordFixture;

describe.skipIf(!databaseUrl)("password reset finalization", () => {
  beforeEach(async () => {
    f = await setupPasswords();
  });
  afterEach(async () => {
    await f?.close();
  });
  afterAll(() => pool.end());
  async function start(username: string): Promise<{ requestId: string }> {
    const response = await f.request(base, { username });
    expect(response.status).toBe(200);
    return response.json();
  }
  async function verify(requestId: string): Promise<{ resetToken: string }> {
    const response = await f.request(`${base}/verify`, {
      requestId,
      otp: f.messages.at(-1)!.otp,
    });
    expect(response.status).toBe(200);
    return response.json();
  }

  it("keeps the grant and sessions when Auth explicitly rejects a new password", async () => {
    const user = await f.member({ contact: "verified" });
    const request = await start(user.username);
    const proof = await verify(request.requestId);
    const body = {
      requestId: request.requestId,
      resetToken: proof.resetToken,
      newPassword,
      passwordConfirmation: newPassword,
    };
    const before = (
      await pool.query(
        "SELECT reset_hash,reset_expires_at FROM xiangqi_auth.password_recoveries WHERE user_id=$1",
        [user.userId],
      )
    ).rows[0];
    f.provider.state.rejectPasswordUpdate = true;
    const rejected = await f.request(`${base}/reset`, body);
    expect(rejected.status).toBe(400);
    expect(await rejected.json()).toMatchObject({
      code: "PASSWORD_PROVIDER_REJECTED",
    });
    await expect(
      f.sessions.requireValidSession(user.appSession),
    ).resolves.toMatchObject({ userId: user.userId });
    expect(
      (
        await pool.query(
          "SELECT reset_hash,reset_expires_at,reset_operation_hash,consumed_at FROM xiangqi_auth.password_recoveries WHERE user_id=$1",
          [user.userId],
        )
      ).rows[0],
    ).toEqual({ ...before, reset_operation_hash: null, consumed_at: null });
    f.provider.state.rejectPasswordUpdate = false;
    const differentPassword = "accepted-different-password";
    expect(
      (
        await f.request(`${base}/reset`, {
          ...body,
          newPassword: differentPassword,
          passwordConfirmation: differentPassword,
        })
      ).status,
    ).toBe(200);
    await expect(
      f.sessions.requireValidSession(user.appSession),
    ).rejects.toMatchObject({ code: "SESSION_EXPIRED" });
  });

  it("rechecks the grant after Auth returns and fails closed when the deadline passed during the write", async () => {
    const user = await f.member({ contact: "verified" });
    const request = await start(user.username);
    const proof = await verify(request.requestId);
    const gate = f.provider.holdPasswordUpdate();
    const reset = f.request(`${base}/reset`, {
      requestId: request.requestId,
      resetToken: proof.resetToken,
      newPassword,
      passwordConfirmation: newPassword,
    });
    await gate.started;
    f.advance(600_000);
    gate.release();
    const response = await reset;
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({
      code: "PASSWORD_RECOVERY_INVALID",
    });
    await expect(
      f.sessions.requireValidSession(user.appSession),
    ).rejects.toMatchObject({ code: "SESSION_EXPIRED" });
    expect(
      (
        await pool.query(
          "SELECT reset_hash,reset_operation_hash,consumed_at FROM xiangqi_auth.password_recoveries WHERE user_id=$1",
          [user.userId],
        )
      ).rows[0],
    ).toMatchObject({
      reset_hash: null,
      reset_operation_hash: null,
      consumed_at: expect.any(Date),
    });
  });

  it("reconciles the same reset after a failure between the remote write and local finalization", async () => {
    const user = await f.member({ contact: "verified" });
    const request = await start(user.username);
    const proof = await verify(request.requestId);
    const body = {
      requestId: request.requestId,
      resetToken: proof.resetToken,
      newPassword,
      passwordConfirmation: newPassword,
    };
    const failure = vi
      .spyOn(PasswordTx.prototype, "finishReset")
      .mockRejectedValueOnce(new Error("synthetic-crash-before-finalize"));
    try {
      expect((await f.request(`${base}/reset`, body)).status).toBe(503);
    } finally {
      failure.mockRestore();
    }
    expect(
      (
        await f.request(`${base}/reset`, {
          ...body,
          newPassword: "another-operation",
          passwordConfirmation: "another-operation",
        })
      ).status,
    ).toBe(400);
    expect((await f.request(`${base}/reset`, body)).status).toBe(200);
    await expect(
      f.sessions.requireValidSession(user.appSession),
    ).rejects.toMatchObject({ code: "SESSION_EXPIRED" });
  });
});
