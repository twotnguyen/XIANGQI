import { Controller, Get, Module, UseGuards } from "@nestjs/common";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { createApp } from "../app.js";
import { RegistrationError } from "../auth/contracts.js";
import { LoginError } from "./contracts.js";
import { LoginController } from "./login.controller.js";
import { LoginService } from "./login.service.js";
import { SessionGuard } from "./session.guard.js";
import { SessionService } from "./session.service.js";

@Controller("cookie-probe")
@UseGuards(SessionGuard)
class ProbeController {
  @Get()
  read() {
    return { ok: true };
  }
}
@Module({})
class FixtureModule {}
let app: Awaited<ReturnType<typeof createApp>>;
let base: string;
const login = vi.fn();
const active = vi.fn();
beforeEach(async () => {
  vi.clearAllMocks();
  login.mockResolvedValue({
    appSession: "synthetic-capability",
    refresh_token: "synthetic-refresh",
    expiresAt: new Date(Date.now() + 60000).toISOString(),
    access_token: "synthetic-access",
  });
  active.mockImplementation(async (bearer: unknown, capability: unknown) => {
    if (bearer !== "synthetic-access" || capability !== "synthetic-capability")
      throw new LoginError("SESSION_INVALID", "Phiên đăng nhập không hợp lệ");
    return "synthetic-user";
  });
  app = await createApp(
    [],
    [
      {
        module: FixtureModule,
        controllers: [LoginController, ProbeController],
        providers: [
          { provide: LoginService, useValue: { login } },
          { provide: SessionService, useValue: { requireActive: active } },
          SessionGuard,
          { provide: "SESSION_COOKIE_SECURE", useValue: false },
        ],
      },
    ],
  );
  await app.listen(0, "127.0.0.1");
  base = await app.getUrl();
});
afterEach(async () => {
  await app?.close();
});
it("writes host-only HttpOnly cookies and no-store after login, with remember default and session-cookie opt-out", async () => {
  for (const remember of [undefined, false]) {
    const response = await fetch(`${base}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "SyntheticUser",
        password: "synthetic-password",
        remember,
      }),
    });
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    const cookies = response.headers.getSetCookie();
    expect(cookies).toHaveLength(2);
    for (const cookie of cookies) {
      expect(cookie).toContain("; Path=/; HttpOnly; SameSite=Lax");
      expect(cookie).not.toMatch(/Secure|Domain=|Expires=/);
      if (remember === false) expect(cookie).not.toContain("Max-Age=");
      else expect(cookie).toMatch(/Max-Age=5[89]/);
    }
  }
});
it("accepts cookie fallback while retaining the required bearer", async () => {
  const response = await fetch(`${base}/cookie-probe`, {
    headers: {
      Authorization: "Bearer synthetic-access",
      Cookie: "xiangqi_session=synthetic-capability",
    },
  });
  expect(response.status).toBe(200);
  expect(active).toHaveBeenCalledWith(
    "synthetic-access",
    "synthetic-capability",
  );
  const missingBearer = await fetch(`${base}/cookie-probe`, {
    headers: { Cookie: "xiangqi_session=synthetic-capability" },
  });
  expect(missingBearer.status).toBe(401);
});
it("never falls back from a present bad capability header and denies duplicate or malformed cookies", async () => {
  for (const headers of [
    {
      "X-Xiangqi-Session": "bad",
      Cookie: "xiangqi_session=synthetic-capability",
    },
    { "X-Xiangqi-Session": "", Cookie: "xiangqi_session=synthetic-capability" },
    { Cookie: "xiangqi_session=synthetic-capability; xiangqi_session=other" },
    { Cookie: "xiangqi_session=%ZZ" },
  ]) {
    expect(
      (
        await fetch(`${base}/cookie-probe`, {
          headers: { Authorization: "Bearer synthetic-access", ...headers },
        })
      ).status,
    ).toBe(401);
  }
});
it("sanitizes provider outage and writes no login cookies on failure", async () => {
  active.mockRejectedValue(
    new RegistrationError(
      "AUTH_PROVIDER_ERROR",
      "private upstream fixture",
      503,
    ),
  );
  const response = await fetch(`${base}/cookie-probe`, {
    headers: {
      Authorization: "Bearer synthetic-access",
      Cookie: "xiangqi_session=synthetic-capability",
    },
  });
  expect(response.status).toBe(503);
  expect(await response.json()).toEqual({
    code: "SESSION_UNAVAILABLE",
    message: "Chưa thể xác thực phiên đăng nhập",
  });
  login.mockRejectedValue(
    new LoginError("LOGIN_INVALID", "Sai tên đăng nhập hoặc mật khẩu"),
  );
  const rejected = await fetch(`${base}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  expect(rejected.status).toBe(401);
  expect(rejected.headers.getSetCookie()).toEqual([]);
});
it("defaults cookie transport to Secure when the optional configuration is absent", async () => {
  await app.close();
  app = await createApp(
    [],
    [
      {
        module: FixtureModule,
        controllers: [LoginController],
        providers: [{ provide: LoginService, useValue: { login } }],
      },
    ],
  );
  await app.listen(0, "127.0.0.1");
  const response = await fetch(`${await app.getUrl()}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "SyntheticUser",
      password: "synthetic-password",
    }),
  });
  expect(response.status).toBe(200);
  expect(response.headers.getSetCookie()).toHaveLength(2);
  for (const cookie of response.headers.getSetCookie())
    expect(cookie).toContain("; Secure;");
});
it("does not write partial provider credentials without a complete application session", async () => {
  login.mockResolvedValue({
    access_token: "synthetic-access",
    refresh_token: "synthetic-refresh",
  });
  const response = await fetch(`${base}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "SyntheticUser",
      password: "synthetic-password",
    }),
  });
  expect(response.status).toBe(200);
  expect(response.headers.getSetCookie()).toEqual([]);
});
