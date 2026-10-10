import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { parseCommand } from "./protocol.js";

function sharingCommand(sharing: unknown) {
  return {
    commandId: randomUUID(),
    roomId: randomUUID(),
    expectedVersion: 0,
    action: { type: "media.sharing", payload: { sharing } },
  };
}

describe("media sharing protocol", () => {
  it.each([
    { sharing: ["room"] },
    { sharing: { value: "room" } },
    { sharing: true },
    { sharing: false },
  ])("rejects non-string sharing %j", ({ sharing }) => {
    expect(() => parseCommand(sharingCommand(sharing))).toThrow(
      "Dữ liệu lệnh không hợp lệ",
    );
  });
  it.each(["none", "opponent", "room"])(
    "accepts the explicit sharing value %s",
    (sharing) => {
      expect(parseCommand(sharingCommand(sharing)).action).toEqual({
        type: "media.sharing",
        payload: { sharing },
      });
    },
  );
});
