import { expect, it } from "vitest";
import {
  readGoogleCookie,
  writeGoogleCookie,
  clearGoogleCookies,
} from "./http-cookies.js";
it("fails closed for duplicate, malformed, controls and bounded cookie authority", () => {
  const cap = "a".repeat(43),
    name = "xiangqi_google_onboarding";
  expect(readGoogleCookie(`unrelated=ok; ${name}=${cap}`, name)).toBe(cap);
  for (const header of [
    null,
    [`${name}=${cap}`],
    `${name}=${cap}; ${name}=${cap}`,
    `${name}=bad`,
    `${name}=%0D${cap}`,
    `${name}=%ZZ`,
    `${name}=${cap}\u007f`,
    `${name}=${cap}; broken`,
    `bad name=ok; ${name}=${cap}`,
    `other=${"x".repeat(8192)}; ${name}=${cap}`,
  ])
    expect(readGoogleCookie(header, name)).toBeUndefined();
  for (const raw of [
    "x".repeat(3801),
    "bad value",
    'bad"value',
    "bad\\value",
    "%00",
    "%0A",
    "%ZZ",
  ])
    expect(
      readGoogleCookie(
        `xiangqi_google_refresh=${raw}`,
        "xiangqi_google_refresh",
      ),
    ).toBeUndefined();
  expect(
    readGoogleCookie(
      "xiangqi_google_refresh=valid%3Dtoken",
      "xiangqi_google_refresh",
    ),
  ).toBe("valid=token");
});
it("appends existing headers and never extends original pending deadline while rotating cookies", () => {
  let cookies = ["existing_cookie=value"];
  const response = {
    getHeader() {
      return cookies;
    },
    setHeader(_name: string, value: string[]) {
      cookies = value;
    },
  };
  writeGoogleCookie(
    response,
    "xiangqi_google_refresh",
    "private-token",
    "2026-10-11T01:00:00Z",
    true,
    new Date("2026-10-11T00:59:00Z"),
  );
  expect(cookies).toEqual([
    "existing_cookie=value",
    "xiangqi_google_refresh=private-token; Path=/auth/google; HttpOnly; SameSite=Lax; Secure; Max-Age=60",
  ]);
  clearGoogleCookies(response, true, ["xiangqi_google_refresh"]);
  expect(cookies).toHaveLength(3);
  expect(cookies.at(-1)).toContain("Max-Age=0");
  for (const invalid of ["bad\nvalue", "x".repeat(3801)])
    expect(() =>
      writeGoogleCookie(
        response,
        "xiangqi_google_refresh",
        invalid,
        "2026-10-11T01:00:00Z",
      ),
    ).toThrow();
  expect(() =>
    writeGoogleCookie(response, "xiangqi_google_refresh", "ok", "not-date"),
  ).toThrow();
});
