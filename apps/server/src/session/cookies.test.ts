import { createServer } from "node:http";
import { expect, it, vi } from "vitest";
import {
  writeSessionCookies,
  clearSessionCookies,
  readSessionCookie,
} from "./cookies.js";
it("writes two HttpOnly cookies with secure transport and the remaining fixed lifetime over actual HTTP", async () => {
  const server = createServer((request, response) => {
    writeSessionCookies(
      response,
      {
        appSession: "app-fixture",
        refresh_token: "refresh-fixture",
        expiresAt: "2026-11-10T00:00:00.000Z",
        remember: request.url !== "/session",
      },
      true,
      new Date(
        request.url === "/refresh"
          ? "2026-10-12T00:00:00Z"
          : "2026-10-11T00:00:00Z",
      ),
    );
    response.end("ok");
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string")
    throw new Error("Fixture unavailable");
  try {
    const response = await fetch(`http://127.0.0.1:${address.port}`);
    expect(response.headers.getSetCookie()).toEqual([
      "xiangqi_session=app-fixture; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=2592000",
      "xiangqi_refresh=refresh-fixture; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=2592000",
    ]);
    const refreshed = await fetch(`http://127.0.0.1:${address.port}/refresh`);
    expect(refreshed.headers.getSetCookie()).toEqual([
      "xiangqi_session=app-fixture; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=2505600",
      "xiangqi_refresh=refresh-fixture; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=2505600",
    ]);
    const temporary = await fetch(`http://127.0.0.1:${address.port}/session`);
    expect(temporary.headers.getSetCookie()).toEqual([
      "xiangqi_session=app-fixture; Path=/; HttpOnly; SameSite=Lax; Secure",
      "xiangqi_refresh=refresh-fixture; Path=/; HttpOnly; SameSite=Lax; Secure",
    ]);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
});

it("refreshes against the original fixed deadline and uses session cookies when remember is disabled", () => {
  const response = { setHeader: vi.fn() };
  const session = {
    appSession: "app",
    refresh_token: "refresh",
    expiresAt: "2026-11-10T00:00:00.000Z",
    remember: true,
  };
  writeSessionCookies(
    response,
    session,
    false,
    new Date("2026-10-12T00:00:00Z"),
  );
  expect(response.setHeader.mock.calls[0]![1]).toEqual([
    "xiangqi_session=app; Path=/; HttpOnly; SameSite=Lax; Max-Age=2505600",
    "xiangqi_refresh=refresh; Path=/; HttpOnly; SameSite=Lax; Max-Age=2505600",
  ]);
  response.setHeader.mockClear();
  writeSessionCookies(
    response,
    { ...session, remember: false },
    false,
    new Date("2026-10-12T00:00:00Z"),
  );
  expect(response.setHeader.mock.calls[0]![1]).toEqual([
    "xiangqi_session=app; Path=/; HttpOnly; SameSite=Lax",
    "xiangqi_refresh=refresh; Path=/; HttpOnly; SameSite=Lax",
  ]);
});
it("expires remembered cookies at the exact deadline and clears both cookies with matching flags", () => {
  const response = { setHeader: vi.fn() };
  writeSessionCookies(
    response,
    {
      appSession: "app",
      refresh_token: "refresh",
      expiresAt: "2026-10-11T00:00:00Z",
      remember: true,
    },
    true,
    new Date("2026-10-11T00:00:00Z"),
  );
  expect(
    response.setHeader.mock.calls[0]![1].every((cookie: string) =>
      cookie.endsWith("Max-Age=0"),
    ),
  ).toBe(true);
  clearSessionCookies(response, true);
  expect(response.setHeader.mock.calls[1]![1]).toEqual([
    "xiangqi_session=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0",
    "xiangqi_refresh=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0",
  ]);
});
it("encodes credential separators, reads both cookies, and rejects duplicate or malformed values", () => {
  const response = { setHeader: vi.fn() };
  writeSessionCookies(
    response,
    {
      appSession: "safe;fixture=one",
      refresh_token: "refresh%token",
      expiresAt: "2026-10-11T12:00:00Z",
      remember: false,
    },
    false,
  );
  const header = response.setHeader.mock.calls[0]![1].map(
    (cookie: string) => cookie.split(";")[0],
  ).join("; ");
  expect(readSessionCookie(header, "xiangqi_session")).toBe("safe;fixture=one");
  expect(readSessionCookie(header, "xiangqi_refresh")).toBe("refresh%token");
  for (const malformed of [
    undefined,
    ["xiangqi_session=app"],
    "xiangqi_session=app; xiangqi_session=other",
    "xiangqi_session=%ZZ",
    "xiangqi_session=%0d%0a",
    'xiangqi_session="quoted"',
    "xiangqi_session=a\\b",
    "xiangqi_session=",
    "bad segment; xiangqi_session=app",
    "xiangqi_session =bad; xiangqi_session=app",
    "xiangqi_session=" + "a".repeat(3801),
    "other=" + "a".repeat(8192),
    "xiangqi_session=app\r\n",
  ]) {
    expect(readSessionCookie(malformed, "xiangqi_session")).toBeUndefined();
  }
});
it("rejects invalid lifetimes or credentials before writing any cookie header", () => {
  const response = { setHeader: vi.fn() };
  const session = {
    appSession: "app",
    refresh_token: "refresh",
    expiresAt: "invalid",
    remember: true,
  };
  expect(() => writeSessionCookies(response, session, false)).toThrow(
    "Invalid session cookie lifetime",
  );
  expect(() =>
    writeSessionCookies(
      response,
      {
        ...session,
        expiresAt: "2026-10-11T00:00:00Z",
        refresh_token: "bad\nfixture",
      },
      false,
    ),
  ).toThrow("Invalid session cookie");
  expect(response.setHeader).not.toHaveBeenCalled();
});
