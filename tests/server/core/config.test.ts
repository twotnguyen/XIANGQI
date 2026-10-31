import { expect, it } from "vitest";
import { readConfig } from "@server/core/config.js";

it("uses local defaults without requiring unintegrated service secrets", () => {
  expect(readConfig({})).toEqual({
    port: 3000,
    corsOrigins: ["http://localhost:5173"],
    logLevel: "info",
    trustedProxyHops: 0,
  });
});
it("rejects invalid port without exposing its value", () => {
  expect(() => readConfig({ PORT: "fake-sensitive-fixture" })).toThrow(
    "Invalid configuration: PORT",
  );
});
it("reads explicit port, origins and level", () => {
  expect(
    readConfig({
      PORT: "3100",
      CORS_ORIGINS: "https://example.org,http://localhost:5173",
      LOG_LEVEL: "error",
    }),
  ).toEqual({
    port: 3100,
    corsOrigins: ["https://example.org", "http://localhost:5173"],
    logLevel: "error",
    trustedProxyHops: 0,
  });
});
it("reads trusted proxy hops and rejects invalid counts without echoing them", () => {
  expect(readConfig({ TRUST_PROXY_HOPS: "1" }).trustedProxyHops).toBe(1);
  for (const value of ["-1", "1.5", "x", "6", ""])
    expect(() => readConfig({ TRUST_PROXY_HOPS: value })).toThrow(
      "Invalid configuration: TRUST_PROXY_HOPS",
    );
});
it("rejects unsafe origins and unknown log level without including supplied values", () => {
  expect(() => readConfig({ CORS_ORIGINS: "*" })).toThrow(
    "Invalid configuration: CORS_ORIGINS",
  );
  expect(() => readConfig({ LOG_LEVEL: "fake-sensitive-fixture" })).toThrow(
    "Invalid configuration: LOG_LEVEL",
  );
});
