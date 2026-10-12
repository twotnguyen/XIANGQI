import { expect, it } from "vitest";
import { containsForbiddenName, validateCredentials } from "./name-filter.js";
it("rejects forbidden names after accent, leetspeak and separator normalization", () => {
  for (const name of ["f.u.c.k", "sh1t", "ĐỤ_MÁ", "d!t me"])
    expect(containsForbiddenName(name)).toBe(true);
  expect(containsForbiddenName("KyThu_2026")).toBe(false);
  expect(containsForbiddenName("Long")).toBe(false);
});
it("preserves valid username case and rejects format, forbidden names and mismatched passwords", () => {
  expect(
    validateCredentials({
      username: "KyThu_2026",
      password: "fake-password",
      passwordConfirmation: "fake-password",
    }).username,
  ).toBe("KyThu_2026");
  for (const username of [
    "ab",
    "name-with-dash",
    "tên",
    "x".repeat(21),
    "FuCk",
  ])
    expect(() =>
      validateCredentials({
        username,
        password: "fake-password",
        passwordConfirmation: "fake-password",
      }),
    ).toThrow();
  expect(() =>
    validateCredentials({
      username: "KyThu",
      password: "short",
      passwordConfirmation: "short",
    }),
  ).toThrow();
  expect(() =>
    validateCredentials({
      username: "KyThu",
      password: "fake-password",
      passwordConfirmation: "different",
    }),
  ).toThrow();
});
