import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { createHash } from "node:crypto";
import { createApp } from "@server/app.js";
import type { LoginStore } from "@server/account/login/login.types.js";
import { RegistrationError } from "@server/account/auth/registration.types.js";
import { SessionService } from "@server/account/login/session.service.js";
import { SessionModule } from "@server/account/session/session.module.js";

let app: Awaited<ReturnType<typeof createApp>>;
let base: string;
let expired: boolean;
const expiresAt = "2030-01-01T00:00:00.000Z";
const capability = "synthetic-capability".padEnd(43, "x");
const headers = {
  Authorization: "Bearer synthetic-access",
  "X-Xiangqi-Session": capability,
  "Content-Type": "application/json",
};
const refresh = vi.fn();
const revoke = vi.fn();
const sessions = new SessionService(
  {
    sessionByHash: async (hash: string) =>
      hash === createHash("sha256").update(capability).digest("hex")
        ? {
            tokenHash: hash,
            userId: "synthetic-user",
            createdAt: new Date("2026-01-01T00:00:00Z"),
            expiresAt: new Date(expiresAt),
            remember: true,
            revokedAt: expired ? new Date() : null,
            account: {
              userId: "synthetic-user",
              username: "SyntheticUser",
              email: "private@example.invalid",
              active: true,
            },
          }
        : null,
    revokeSession: revoke,
  } as unknown as LoginStore,
  {
    signInPassword: vi.fn(),
    getUser: async (bearer: string) => {
      if (!["synthetic-access", "refreshed-access"].includes(bearer))
        throw new RegistrationError("SESSION_INVALID", "Invalid token", 401);
      return {
        id: "synthetic-user",
        email: "private@example.invalid",
        email_confirmed_at: "2026-01-01T00:00:00Z",
      };
    },
  },
  () => new Date("2026-01-01T00:00:00Z"),
);
beforeEach(async () => {
  expired = false;
  vi.clearAllMocks();
  refresh.mockResolvedValue({
    access_token: "refreshed-access",
    refresh_token: "refreshed-token",
    expires_in: 3600,
    user: {
      id: "synthetic-user",
      email: "private@example.invalid",
      email_confirmed_at: "2026-01-01T00:00:00Z",
    },
  });
  revoke.mockImplementation(async () => {
    expired = true;
  });
  app = await createApp([], [SessionModule.forRoot(sessions, refresh)]);
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
});
it.each([
  [
    "different user",
    {
      id: "different-user",
      email: "private@example.invalid",
      email_confirmed_at: "2026-01-01T00:00:00Z",
    },
  ],
  [
    "different email",
    {
      id: "synthetic-user",
      email: "other@example.invalid",
      email_confirmed_at: "2026-01-01T00:00:00Z",
    },
  ],
  [
    "unconfirmed email",
    {
      id: "synthetic-user",
      email: "private@example.invalid",
      email_confirmed_at: null,
    },
  ],
  [
    "pending registration",
    {
      id: "synthetic-user",
      email: "private@example.invalid",
      email_confirmed_at: "2026-01-01T00:00:00Z",
      app_metadata: { registration_pending: true },
    },
  ],
])("rejects refresh response with %s", async (_description, user) => {
  refresh.mockResolvedValue({
    access_token: "refreshed-access",
    refresh_token: "refreshed-token",
    expires_in: 3600,
    user,
  });
  const response = await fetch(`${base}/auth/refresh`, {
    method: "POST",
    headers,
    body: JSON.stringify({ refresh_token: "old-refresh" }),
  });
  expect(response.status).toBe(401);
  expect(await response.json()).not.toHaveProperty("access_token");
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
      user: {
        id: "synthetic-user",
        email: "private@example.invalid",
        email_confirmed_at: "2026-01-01T00:00:00Z",
      },
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
it("revokes the validated application session on logout", async () => {
  const response = await fetch(`${base}/auth/logout`, {
    method: "POST",
    headers,
  });
  expect(response.status).toBe(200);
  expect((await fetch(`${base}/auth/session`, { headers })).status).toBe(401);
});

it("bootstraps from HttpOnly cookies and rotates them without extending the deadline", async () => {
  const response = await fetch(`${base}/auth/refresh`, {
    method: "POST",
    headers: {
      Cookie: `xiangqi_session=${capability}; xiangqi_refresh=old-refresh`,
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
