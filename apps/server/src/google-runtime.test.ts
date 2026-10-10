import { expect, it } from "vitest";
import { createGoogleRuntime, readGoogleConfig } from "./google-runtime.js";

it("keeps Google disabled until explicitly configured", () => {
  expect(readGoogleConfig({})).toBeNull();
  expect(
    readGoogleConfig({
      AUTH_GOOGLE_ENABLED: "false",
      GOOGLE_CLIENT_ID: "unused",
    }),
  ).toBeNull();
});
it.each([
  { AUTH_GOOGLE_ENABLED: "yes" },
  { AUTH_GOOGLE_ENABLED: "true" },
  {
    AUTH_GOOGLE_ENABLED: "true",
    AUTH_LOGIN_ENABLED: "false",
    GOOGLE_CLIENT_ID: "synthetic-client",
  },
  {
    AUTH_GOOGLE_ENABLED: "true",
    AUTH_LOGIN_ENABLED: "true",
    GOOGLE_CLIENT_ID: "",
  },
  {
    AUTH_GOOGLE_ENABLED: "true",
    AUTH_LOGIN_ENABLED: "true",
    GOOGLE_CLIENT_ID: "x".repeat(256),
  },
])(
  "rejects incomplete Google activation without exposing configuration",
  (env) => {
    expect(() => readGoogleConfig(env)).toThrow("Invalid Google configuration");
  },
);
it("uses the server client ID without requiring client secret in the browser flow", () => {
  expect(
    readGoogleConfig({
      AUTH_GOOGLE_ENABLED: "true",
      AUTH_LOGIN_ENABLED: "true",
      GOOGLE_CLIENT_ID: "synthetic-client",
      GOOGLE_CLIENT_SECRET: "synthetic-server-only",
    }),
  ).toEqual({ clientId: "synthetic-client" });
});

it("does not access infrastructure when Google is disabled", async () => {
  await expect(createGoogleRuntime({}, null)).resolves.toBeNull();
});
it("fails closed when its member-session runtime is missing", async () => {
  await expect(
    createGoogleRuntime(
      {
        AUTH_GOOGLE_ENABLED: "true",
        AUTH_LOGIN_ENABLED: "true",
        GOOGLE_CLIENT_ID: "synthetic-client",
      },
      null,
    ),
  ).rejects.toThrow("Google migration is not ready");
});
