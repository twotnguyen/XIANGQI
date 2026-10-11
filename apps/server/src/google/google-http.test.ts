import { afterAll, beforeAll, beforeEach, expect, it } from "vitest";
import { createApp } from "../app.js";
import { GoogleModule, type GoogleHttpService } from "./google.module.js";
import { GoogleError } from "./contracts.js";
import type { Session } from "../auth/contracts.js";
import type { INestApplication } from "@nestjs/common";
const time = new Date("2026-10-11T00:00:00Z"),
  expiresAt = "2026-10-11T01:00:00.000Z",
  cap = "o".repeat(43),
  challenge = "c".repeat(43);
const member = {
  kind: "member" as const,
  userId: "user-fixture",
  username: "KyThu",
  access_token: "access-fixture",
  refresh_token: "member-refresh-fixture",
  appSession: "s".repeat(43),
  expires_in: 3600,
  expiresAt: "2026-11-10T00:00:00.000Z",
  remember: true,
};
const provider: Session = {
  access_token: "pending-access-private",
  refresh_token: "pending-refresh-private",
  expires_in: 3600,
  user: {
    id: "user-fixture",
    email: "private@example.invalid",
    email_confirmed_at: time.toISOString(),
  },
};
let app: INestApplication,
  url: string,
  secureApp: INestApplication,
  secureUrl: string;
let mode: "pending" | "member" = "pending",
  authenticateFailure = false,
  completeFailure = false,
  refreshFailure = false;
let proof: Session | undefined,
  lastInput: unknown,
  lastRemember: unknown,
  lastCredential: unknown,
  lastChallenge: unknown,
  refreshes = 0;
let validRefresh = "pending-refresh-private";
const service: GoogleHttpService = {
  async beginChallenge() {
    return {
      capability: challenge,
      nonce: "hash-public-fixture",
      clientId: "configured-client-public",
      expiresAt: "2026-10-11T00:05:00.000Z",
    };
  },
  async authenticate(credential, supplied, remember = true) {
    if (authenticateFailure)
      throw new Error("private provider email/token payload");
    lastCredential = credential;
    lastChallenge = supplied;
    lastRemember = remember;
    if (supplied !== challenge)
      throw new GoogleError(
        "GOOGLE_INVALID",
        "Xác thực Google không hợp lệ",
        401,
      );
    return mode === "member"
      ? {
          ...member,
          remember,
          expiresAt: remember ? member.expiresAt : "2026-10-11T12:00:00.000Z",
        }
      : {
          kind: "pending" as const,
          capability: cap,
          session: provider,
          expiresAt,
        };
  },
  async onboarding(supplied) {
    if (supplied !== cap)
      throw new GoogleError("GOOGLE_INVALID", "Phiên Google không hợp lệ", 401);
    return {
      kind: "pending" as const,
      expiresAt,
      recovering: false,
      email: "verified@example.invalid",
      avatar: {
        kind: "initials" as const,
        text: "?",
        url: "private-provider-photo",
      },
      session: provider,
      capability: cap,
      userId: "private-user",
    };
  },
  async complete(supplied, session, input) {
    if (supplied !== cap)
      throw new GoogleError("GOOGLE_INVALID", "Phiên Google không hợp lệ", 401);
    proof = session;
    lastInput = input;
    if (completeFailure)
      throw new GoogleError("GOOGLE_RECOVERING", "Vui lòng thử lại", 503);
    return member;
  },
};
const refresh = async (token: unknown) => {
  refreshes++;
  if (refreshFailure) throw new Error("secret provider error payload");
  if (token !== validRefresh)
    throw Object.assign(new Error("consumed token"), { status: 401 });
  validRefresh = `rotated-refresh-${refreshes}`;
  return {
    ...provider,
    access_token: `rotated-access-${refreshes}`,
    refresh_token: validRefresh,
  };
};
async function start(secure: boolean | undefined) {
  const instance = await createApp(
    ["http://localhost:5173"],
    [GoogleModule.forRoot(service, refresh, secure, () => time)],
  );
  await instance.listen(0, "127.0.0.1");
  return instance;
}
const cookieHeaders = (response: Response) => response.headers.getSetCookie();
const pairs = (response: Response) =>
  cookieHeaders(response)
    .map((cookie) => cookie.split(";")[0])
    .join("; ");
async function call(
  path: string,
  body?: unknown,
  cookie?: string,
  origin = "http://localhost:5173",
  base = url,
) {
  return fetch(`${base}/auth/google/${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: {
      Origin: origin,
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
}
beforeAll(async () => {
  app = await start(false);
  url = await app.getUrl();
  secureApp = await start(undefined);
  secureUrl = await secureApp.getUrl();
});
afterAll(async () => {
  await app.close();
  await secureApp.close();
});
beforeEach(() => {
  time.setTime(Date.parse("2026-10-11T00:00:00Z"));
  mode = "pending";
  completeFailure = refreshFailure = authenticateFailure = false;
  validRefresh = provider.refresh_token;
  refreshes = 0;
  proof = undefined;
  lastInput = undefined;
});
it("keeps raw challenge in HttpOnly cookie while returning only public nonce/client/deadline", async () => {
  const response = await call("challenge", {});
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({
    nonce: "hash-public-fixture",
    clientId: "configured-client-public",
    expiresAt: "2026-10-11T00:05:00.000Z",
  });
  expect(cookieHeaders(response)).toEqual([
    expect.stringContaining(
      `xiangqi_google_challenge=${challenge}; Path=/auth/google; HttpOnly; SameSite=Lax; Max-Age=300`,
    ),
  ]);
  expect(response.headers.get("cache-control")).toBe("no-store");
  expect(response.headers.get("access-control-allow-credentials")).toBe("true");
});
it("strips all pending tokens/user/email and forwards only credential/default remember with cookie authority", async () => {
  const response = await call(
    "authenticate",
    {
      credential: "signed-google-fixture",
      email: "forged@example.invalid",
      userId: "forged",
      proof: { user: { id: "forged" } },
      challenge: "forged",
    },
    `xiangqi_google_challenge=${challenge}`,
  );
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ kind: "pending", expiresAt });
  expect(lastCredential).toBe("signed-google-fixture");
  expect(lastChallenge).toBe(challenge);
  expect(lastRemember).toBe(true);
  const cookies = cookieHeaders(response);
  expect(cookies).toHaveLength(3);
  expect(
    cookies.find((c) => c.startsWith("xiangqi_google_challenge=")),
  ).toContain("Max-Age=0");
  expect(
    cookies.find((c) => c.startsWith("xiangqi_google_onboarding=")),
  ).toContain(
    `${cap}; Path=/auth/google; HttpOnly; SameSite=Lax; Max-Age=3600`,
  );
  expect(
    cookies.find((c) => c.startsWith("xiangqi_google_refresh=")),
  ).toContain("pending-refresh-private");
});
it("reads onboarding from cookie and never from forged query/body", async () => {
  const response = await call(
    "onboarding",
    undefined,
    `xiangqi_google_onboarding=${cap}`,
  );
  expect(await response.json()).toEqual({
    kind: "pending",
    expiresAt,
    recovering: false,
    email: "verified@example.invalid",
    avatar: { kind: "initials", text: "?" },
  });
  expect((await call(`onboarding?capability=${cap}`)).status).toBe(401);
});
it("finishes fresh member authentication after onboarding cookie deadline using member deadline without extending Google cookies", async () => {
  time.setTime(Date.parse("2026-10-11T01:01:00Z"));
  mode = "member";
  const response = await call(
    "authenticate",
    { credential: "fresh-signed-fixture" },
    `xiangqi_google_challenge=${challenge}`,
  );
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual(member);
  expect(
    cookieHeaders(response).find((c) => c.startsWith("xiangqi_session=")),
  ).toContain("Max-Age=2588340");
  for (const name of ["challenge", "onboarding", "refresh"])
    expect(
      cookieHeaders(response).find((c) =>
        c.startsWith(`xiangqi_google_${name}=`),
      ),
    ).toContain("Max-Age=0");
});
it("sanitizes fresh authentication recovery failure and issues no member or pending cookies", async () => {
  authenticateFailure = true;
  const response = await call(
    "authenticate",
    { credential: "fresh-signed-fixture" },
    `xiangqi_google_challenge=${challenge}`,
  );
  expect(response.status).toBe(503);
  expect(await response.json()).toEqual({
    code: "GOOGLE_UNAVAILABLE",
    message: "Chưa thể xác thực Google, vui lòng thử lại",
  });
  expect(cookieHeaders(response)).toHaveLength(0);
});
it("obtains complete proof server-side, appends member cookies and clears every Google cookie", async () => {
  const response = await call(
    "complete",
    {
      username: "KyThu",
      password: "Password123",
      userId: "forged",
      email: "forged@example.invalid",
      proof: { access_token: "forged" },
      refresh_token: "forged",
    },
    `xiangqi_google_onboarding=${cap}; xiangqi_google_refresh=${provider.refresh_token}`,
  );
  expect(response.status).toBe(200);
  const body = await response.json();
  expect(body).toEqual(member);
  expect(proof?.access_token).toBe("rotated-access-1");
  expect(lastInput).toEqual({ username: "KyThu", password: "Password123" });
  const cookies = cookieHeaders(response);
  expect(cookies.find((c) => c.startsWith("xiangqi_session="))).toContain(
    `xiangqi_session=${member.appSession}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`,
  );
  expect(cookies.find((c) => c.startsWith("xiangqi_refresh="))).toContain(
    member.refresh_token,
  );
  for (const name of ["challenge", "onboarding", "refresh"])
    expect(
      cookies.filter((c) => c.startsWith(`xiangqi_google_${name}=`)).at(-1),
    ).toContain("Max-Age=0");
});
it("retains rotated pending refresh on downstream failure, allowing strict one-use provider retry", async () => {
  time.setTime(Date.parse("2026-10-11T00:30:00Z"));
  completeFailure = true;
  const cookie = `xiangqi_google_onboarding=${cap}; xiangqi_google_refresh=${provider.refresh_token}`;
  const failed = await call(
    "complete",
    { username: "KyThu", password: "Password123" },
    cookie,
  );
  expect(failed.status).toBe(503);
  expect(await failed.json()).toEqual({
    code: "GOOGLE_RECOVERING",
    message: "Vui lòng thử lại",
  });
  const rotated = pairs(failed);
  expect(rotated).toContain("xiangqi_google_refresh=rotated-refresh-1");
  expect(cookieHeaders(failed)[0]).toContain("Max-Age=1800");
  expect(rotated).not.toContain("xiangqi_session");
  completeFailure = false;
  const retried = await call(
    "complete",
    { username: "KyThu", password: "Password123" },
    `xiangqi_google_onboarding=${cap}; ${rotated}`,
  );
  expect(retried.status).toBe(200);
  expect(refreshes).toBe(2);
});
it("sanitizes provider outages and does not clear or replace valid pending cookies", async () => {
  refreshFailure = true;
  const response = await call(
    "complete",
    { username: "KyThu", password: "Password123" },
    `xiangqi_google_onboarding=${cap}; xiangqi_google_refresh=${provider.refresh_token}`,
  );
  expect(response.status).toBe(503);
  expect(JSON.stringify(await response.json())).not.toContain("secret");
  expect(cookieHeaders(response)).toHaveLength(0);
});
it("denies duplicate/malformed/missing cookie authority and cross-origin writes before provider call", async () => {
  for (const cookie of [
    `xiangqi_google_onboarding=${cap}; xiangqi_google_onboarding=${cap}`,
    `xiangqi_google_onboarding=%0A${cap}`,
    `xiangqi_google_onboarding=%ZZ`,
    undefined,
  ])
    expect(
      (
        await call(
          "complete",
          { username: "KyThu", password: "Password123", capability: cap },
          cookie,
        )
      ).status,
    ).toBe(401);
  expect(refreshes).toBe(0);
  expect(
    (await call("challenge", {}, undefined, "https://foreign.example")).status,
  ).toBe(403);
});
it("keeps Secure default/member transition and honors explicit remember=false", async () => {
  const challengeResponse = await call(
    "challenge",
    {},
    undefined,
    "http://localhost:5173",
    secureUrl,
  );
  expect(cookieHeaders(challengeResponse)[0]).toContain("; Secure");
  mode = "member";
  const response = await call(
    "authenticate",
    { credential: "fixture", remember: false },
    `xiangqi_google_challenge=${challenge}`,
    undefined,
    secureUrl,
  );
  expect(response.status).toBe(200);
  expect(lastRemember).toBe(false);
  for (const cookie of cookieHeaders(response))
    expect(cookie).toContain("; Secure");
  const sessions = cookieHeaders(response).filter(
    (c) => c.startsWith("xiangqi_session=") || c.startsWith("xiangqi_refresh="),
  );
  expect(sessions).toHaveLength(2);
  for (const cookie of sessions) expect(cookie).not.toContain("Max-Age");
});
