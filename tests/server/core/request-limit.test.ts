import type { IncomingMessage } from "node:http";
import { expect, it } from "vitest";
import {
  clientAddress,
  createRequestLimiter,
} from "@server/core/request-limit.js";

function request(
  url: string,
  options: { method?: string; ip?: string; forwarded?: string } = {},
) {
  return {
    method: options.method ?? "POST",
    url,
    headers:
      options.forwarded === undefined
        ? {}
        : { "x-forwarded-for": options.forwarded },
    socket: { remoteAddress: options.ip ?? "10.0.0.1" },
  } as unknown as IncomingMessage;
}

it("blocks the request after the per-address maximum and reopens after the window", () => {
  let at = 1_000;
  const limiter = createRequestLimiter({
    trustedProxyHops: 0,
    now: () => at,
    rules: [{ name: "r", matches: (p) => p === "/x", max: 2, windowMs: 1000 }],
  });
  expect(limiter.check(request("/x"))).toBeNull();
  expect(limiter.check(request("/x?a=1"))).toBeNull();
  expect(limiter.check(request("/x"))).toBe(1);
  expect(limiter.check(request("/x", { ip: "10.0.0.2" }))).toBeNull();
  at += 1000;
  expect(limiter.check(request("/x"))).toBeNull();
});

it("ignores reads and unlisted paths", () => {
  const limiter = createRequestLimiter({
    trustedProxyHops: 0,
    rules: [{ name: "r", matches: (p) => p === "/x", max: 1, windowMs: 1000 }],
  });
  for (let i = 0; i < 5; i++) {
    expect(limiter.check(request("/x", { method: "GET" }))).toBeNull();
    expect(limiter.check(request("/other"))).toBeNull();
  }
});

it("limits login, guest and other auth routes with separate counters", () => {
  const limiter = createRequestLimiter({ trustedProxyHops: 0 });
  for (let i = 0; i < 30; i++)
    expect(limiter.check(request("/auth/login"))).toBeNull();
  expect(limiter.check(request("/auth/login"))).not.toBeNull();
  expect(limiter.check(request("/auth/register/email"))).toBeNull();
  for (let i = 0; i < 30; i++)
    expect(limiter.check(request("/account/guest"))).toBeNull();
  expect(limiter.check(request("/account/guest"))).not.toBeNull();
  expect(limiter.check(request("/account/guest/logout"))).toBeNull();
});

it("takes the address from the trusted end of X-Forwarded-For, never the client-supplied start", () => {
  const spoofed = request("/x", { forwarded: "6.6.6.6, 1.2.3.4" });
  expect(clientAddress(spoofed, 1)).toBe("1.2.3.4");
  expect(clientAddress(spoofed, 2)).toBe("6.6.6.6");
  expect(clientAddress(spoofed, 0)).toBe("10.0.0.1");
  expect(clientAddress(request("/x"), 1)).toBe("10.0.0.1");
  expect(clientAddress(request("/x", { forwarded: "1.2.3.4" }), 3)).toBe(
    "10.0.0.1",
  );
});

it("folds IPv4-mapped addresses and groups IPv6 by /64", () => {
  expect(clientAddress(request("/x", { ip: "::ffff:1.2.3.4" }), 0)).toBe(
    "1.2.3.4",
  );
  expect(
    clientAddress(request("/x", { ip: "2001:db8:1:2:aaaa:bbbb:cccc:dddd" }), 0),
  ).toBe(
    clientAddress(request("/x", { ip: "2001:db8:1:2:1111:2222:3333:4444" }), 0),
  );
});

it("answers 429 with a retry hint and no body leak", () => {
  const limiter = createRequestLimiter({
    trustedProxyHops: 0,
    rules: [{ name: "r", matches: () => true, max: 1, windowMs: 5000 }],
  });
  const sent: {
    status?: number;
    headers?: Record<string, string>;
    body?: string;
  } = {};
  const response = {
    writeHead: (status: number, headers: Record<string, string>) => {
      sent.status = status;
      sent.headers = headers;
    },
    end: (body: string) => {
      sent.body = body;
    },
  };
  let passed = 0;
  const next = () => passed++;
  limiter.middleware(request("/x"), response as never, next);
  limiter.middleware(request("/x"), response as never, next);
  expect(passed).toBe(1);
  expect(sent.status).toBe(429);
  expect(sent.headers?.["Retry-After"]).toBe("5");
  expect(JSON.parse(sent.body!)).toMatchObject({ code: "RATE_LIMITED" });
});
