import { describe, expect, it } from "vitest";
import { logEvent } from "@server/core/logger.js";

describe("operational logs", () => {
  it("emits time, level and event while dropping secrets in every metadata position", () => {
    const secret = "fake-sensitive-fixture";
    const line = logEvent("info", "server_started", {
      port: 3000,
      password: secret,
      otp: secret,
      token: secret,
      chat: secret,
      nested: { arbitrary: secret },
      message: secret,
    });
    expect(JSON.parse(line)).toEqual({
      time: expect.any(String),
      level: "info",
      event: "server_started",
      port: 3000,
    });
    expect(line).not.toContain(secret);
  });
  it("preserves media revocation failures without logging provider secrets", () => {
    const line = logEvent("error", "media_revocation_failed", {
      token: "private-media-token",
      message: "provider response with private-media-token",
    });
    expect(JSON.parse(line)).toEqual({
      time: expect.any(String),
      level: "error",
      event: "media_revocation_failed",
    });
    expect(line).not.toContain("private-media-token");
  });
  it("does not allow arbitrary values to become event, level or numeric metadata", () => {
    const secret = "fake-sensitive-fixture";
    const line = logEvent(secret, secret, { port: secret });
    expect(JSON.parse(line)).toEqual({
      time: expect.any(String),
      level: "error",
      event: "unknown_event",
    });
    expect(line).not.toContain(secret);
  });
});
