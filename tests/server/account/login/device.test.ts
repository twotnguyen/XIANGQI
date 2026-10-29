import { expect, it } from "vitest";
import { deviceToken } from "@server/account/login/device.js";

const valid = "a".repeat(43);

it("reuses a well-formed device cookie without asking for a new one", () => {
  expect(deviceToken(`xiangqi_device=${valid}`)).toEqual({
    token: valid,
    fresh: false,
  });
});

it("issues a fresh opaque token when the cookie is missing", () => {
  const device = deviceToken(undefined);
  expect(device.fresh).toBe(true);
  expect(device.token).toMatch(/^[A-Za-z0-9_-]{43}$/);
});

it("replaces a malformed device cookie instead of trusting it", () => {
  const device = deviceToken("xiangqi_device=not-a-token");
  expect(device.fresh).toBe(true);
  expect(device.token).not.toBe("not-a-token");
});
