import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { createApp } from "../app.js";
import { LoginError } from "../login/contracts.js";
import { RegistrationError } from "../auth/contracts.js";
import type { SessionService } from "../login/session.service.js";
import { SessionModule } from "./session.module.js";

let app: Awaited<ReturnType<typeof createApp>>;
let base: string;
let expired: boolean;
let rejectedBearer: boolean;
const expiresAt = "2030-01-01T00:00:00.000Z";
const headers = {
  Authorization: "Bearer synthetic-access",
  "X-Xiangqi-Session": "synthetic-capability",
  "Content-Type": "application/json",
};
const refresh = vi.fn();
const revoke = vi.fn();
const sessions = {
  requireValidSession: vi.fn(async (capability: unknown) => {
    if (expired || capability !== "synthetic-capability")
      throw new LoginError("SESSION_EXPIRED", "Phiên đăng nhập đã hết hạn");
    return { userId: "synthetic-user", expiresAt, remember: true };
  }),
  requireActive: vi.fn(async (bearer: unknown, capability: unknown) => {
    await sessions.requireValidSession(capability);
    if (
      rejectedBearer ||
      !["synthetic-access", "refreshed-access"].includes(String(bearer))
    )
      throw new LoginError("SESSION_INVALID", "Phiên đăng nhập không hợp lệ");
    return "synthetic-user";
  }),
  revokeSession: revoke,
  revoke,
  store: {
    accountById: vi.fn(async () => ({
      userId: "synthetic-user",
      username: "SyntheticUser",
      email: "private@example.invalid",
      active: true,
    })),
  },
};
beforeEach(async () => {
  expired = false;
  rejectedBearer = false;
  vi.clearAllMocks();
  refresh.mockResolvedValue({
    access_token: "refreshed-access",
    refresh_token: "refreshed-token",
    expires_in: 3600,
    user: { id: "synthetic-user" },
  });
  revoke.mockImplementation(async () => {
    expired = true;
  });
  app = await createApp(
    [],
    [SessionModule.forRoot(sessions as unknown as SessionService, refresh)],
  );
  await app.listen(0, "127.0.0.1");
  base = await app.getUrl();
});
afterEach(async () => {
  await app?.close();
});
it("requires both credentials for the current actor and omits private account fields", async () => {
  const rejected = await fetch(`${base}/auth/session`, {
    headers: { Authorization: headers.Authorization },
  });
  expect(rejected.status).toBe(401);
  const response = await fetch(`${base}/auth/session`, { headers });
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({
    userId: "synthetic-user",
    username: "SyntheticUser",
    kind: "member",
    expiresAt,
    remember: true,
  });
});
it("refreshes only after capability validation and preserves the application deadline", async () => {
  const response = await fetch(`${base}/auth/refresh`, {
    method: "POST",
    headers,
    body: JSON.stringify({ refresh_token: "old-refresh" }),
  });
  expect(response.status).toBe(200);
  expect(await response.json()).toMatchObject({
    access_token: "refreshed-access",
    refresh_token: "refreshed-token",
    appSession: headers["X-Xiangqi-Session"],
    expiresAt,
  });
  expect(refresh).toHaveBeenCalledWith("old-refresh");
  expect(sessions.requireValidSession.mock.invocationCallOrder[0]).toBeLessThan(
    refresh.mock.invocationCallOrder[0]!,
  );
  expect(sessions.requireActive).toHaveBeenCalledWith(
    "refreshed-access",
    headers["X-Xiangqi-Session"],
  );
});
it("does not call the provider for expired application sessions", async () => {
  expired = true;
  const response = await fetch(`${base}/auth/refresh`, {
    method: "POST",
    headers,
    body: JSON.stringify({ refresh_token: "old-refresh" }),
  });
  expect(response.status).toBe(401);
  expect(refresh).not.toHaveBeenCalled();
});
it("rejects malformed refresh input before contacting the provider", async () => {
  const response = await fetch(`${base}/auth/refresh`, {
    method: "POST",
    headers,
    body: JSON.stringify({ refresh_token: 12 }),
  });
  expect(response.status).toBe(401);
  expect(refresh).not.toHaveBeenCalled();
});
it("preserves upstream outages as retryable errors without disclosing provider text", async () => {
  refresh.mockRejectedValue(
    new RegistrationError(
      "AUTH_PROVIDER_ERROR",
      "private upstream message",
      503,
    ),
  );
  const response = await fetch(`${base}/auth/refresh`, {
    method: "POST",
    headers,
    body: JSON.stringify({ refresh_token: "old-refresh" }),
  });
  expect(response.status).toBe(503);
  expect(await response.json()).toEqual({
    code: "SESSION_UNAVAILABLE",
    message: "Chưa thể xác thực phiên đăng nhập",
  });
});
it("rechecks capability revocation after the provider refresh returns", async () => {
  refresh.mockImplementation(async () => {
    expired = true;
    return {
      access_token: "refreshed-access",
      refresh_token: "next",
      expires_in: 3600,
    };
  });
  const response = await fetch(`${base}/auth/refresh`, {
    method: "POST",
    headers,
    body: JSON.stringify({ refresh_token: "old-refresh" }),
  });
  expect(response.status).toBe(401);
  expect(await response.json()).not.toHaveProperty("access_token");
});
it("refuses refreshed tokens rejected by the same-user active-session guard", async () => {
  rejectedBearer = true;
  const response = await fetch(`${base}/auth/refresh`, {
    method: "POST",
    headers,
    body: JSON.stringify({ refresh_token: "old-refresh" }),
  });
  expect(response.status).toBe(401);
  expect(await response.json()).not.toHaveProperty("access_token");
});
it("revokes the validated application session on logout", async () => {
  const response = await fetch(`${base}/auth/logout`, {
    method: "POST",
    headers,
  });
  expect(response.status).toBe(200);
  expect(revoke).toHaveBeenCalledWith(headers["X-Xiangqi-Session"]);
  expect((await fetch(`${base}/auth/session`, { headers })).status).toBe(401);
});

it("bootstraps from HttpOnly cookies and rotates them without extending the deadline", async () => {
  const response = await fetch(`${base}/auth/refresh`, {
    method: "POST",
    headers: {
      Cookie:
        "xiangqi_session=synthetic-capability; xiangqi_refresh=old-refresh",
    },
  });
  expect(response.status).toBe(200);
  expect(refresh).toHaveBeenCalledWith("old-refresh");
  expect(response.headers.getSetCookie()).toHaveLength(2);
  expect(response.headers.getSetCookie()[0]).toContain(
    "HttpOnly; SameSite=Lax; Secure",
  );
  expect(await response.json()).toMatchObject({ expiresAt });
});
it("clears cookies after successful logout", async () => {
  const response = await fetch(`${base}/auth/logout`, {
    method: "POST",
    headers,
  });
  expect(response.status).toBe(200);
  expect(response.headers.getSetCookie()).toHaveLength(2);
  expect(
    response.headers
      .getSetCookie()
      .every((cookie) => cookie.includes("Max-Age=0")),
  ).toBe(true);
});
it("does not replace cookies when the refresh provider is unavailable", async () => {
  refresh.mockRejectedValue(new Error("private"));
  const response = await fetch(`${base}/auth/refresh`, {
    method: "POST",
    headers,
    body: JSON.stringify({ refresh_token: "old-refresh" }),
  });
  expect(response.status).toBe(503);
  expect(response.headers.getSetCookie()).toEqual([]);
});
