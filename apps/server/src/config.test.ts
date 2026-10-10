import { expect, it } from "vitest";
import { readConfig } from "./config.js";

it("uses local defaults without requiring unintegrated service secrets", () => {
  expect(readConfig({})).toEqual({
    port: 3000,
    corsOrigins: ["http://localhost:5173"],
    logLevel: "info",
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
  });
});
it("rejects unsafe origins and unknown log level without including supplied values", () => {
  expect(() => readConfig({ CORS_ORIGINS: "*" })).toThrow(
    "Invalid configuration: CORS_ORIGINS",
  );
  expect(() => readConfig({ LOG_LEVEL: "fake-sensitive-fixture" })).toThrow(
    "Invalid configuration: LOG_LEVEL",
  );
});
