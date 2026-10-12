import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { parseCommand, parseHandshake } from "./protocol.js";

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

describe("application session capability handshake", () => {
  const base = {
    accessToken: "fixture-bearer",
    roomId: randomUUID(),
    tabId: randomUUID(),
  };
  it.each([
    { appSession: undefined },
    { appSession: null },
    { appSession: true },
    { appSession: 43 },
    { appSession: [] },
    { appSession: "a".repeat(42) },
    { appSession: "a".repeat(44) },
    { appSession: "!".repeat(43) },
  ])("rejects missing or malformed capability %j", ({ appSession }) => {
    expect(() => parseHandshake({ ...base, appSession })).toThrow(
      "Phiên đăng nhập không hợp lệ hoặc đã hết hạn",
    );
  });
  it("retains both valid proofs for the identity resolver", () => {
    const handshake = { ...base, appSession: "Ab_9-".repeat(8) + "abc" };
    expect(parseHandshake(handshake)).toEqual(handshake);
  });
});

function matchCommand(
  type: "match.move" | "match.resign",
  overrides: Record<string, unknown> = {},
) {
  return {
    commandId: randomUUID(),
    roomId: randomUUID(),
    expectedVersion: 19,
    action: {
      type,
      payload: {
        matchId: randomUUID(),
        matchVersion: 2,
        ...(type === "match.move" ? { from: 0, to: 89 } : {}),
        ...overrides,
      },
    },
  };
}
describe.each(["match.move", "match.resign"] as const)(
  "match identity protocol %s",
  (type) => {
    it.each([0, Number.MAX_SAFE_INTEGER])(
      "accepts safe matchVersion %s independent of room version",
      (matchVersion) => {
        const input = matchCommand(type, { matchVersion });
        const result = parseCommand(input);
        expect(result).toEqual(input);
        expect(result.expectedVersion).toBe(19);
        expect(result.action.payload).toHaveProperty(
          "matchVersion",
          matchVersion,
        );
      },
    );
    it("canonicalizes UUID but keeps room and match identities separate", () => {
      const id = randomUUID(),
        input = matchCommand(type, { matchId: id.toUpperCase() });
      const result = parseCommand(input);
      expect(result.roomId).toBe(input.roomId);
      expect(result.action.payload).toHaveProperty("matchId", id);
      expect(result.action.payload).toHaveProperty("matchVersion", 2);
      expect(result.roomId).not.toBe(id);
    });
    it.each([
      undefined,
      null,
      true,
      43,
      [],
      {},
      "not-a-uuid",
      "a".repeat(36),
      ` ${randomUUID()}`,
    ])("rejects missing/malformed matchId %j", (matchId) => {
      expect(() => parseCommand(matchCommand(type, { matchId }))).toThrow(
        "Dữ liệu lệnh không hợp lệ",
      );
    });
    it.each([
      undefined,
      null,
      true,
      "0",
      -1,
      0.5,
      NaN,
      Infinity,
      -Infinity,
      Number.MAX_SAFE_INTEGER + 1,
    ])("rejects missing/unsafe matchVersion %j", (matchVersion) => {
      expect(() => parseCommand(matchCommand(type, { matchVersion }))).toThrow(
        "Dữ liệu lệnh không hợp lệ",
      );
    });
    it("rejects literally absent match identity/version fields", () => {
      for (const key of ["matchId", "matchVersion"]) {
        const input = matchCommand(type);
        delete (input.action.payload as Record<string, unknown>)[key];
        expect(() => parseCommand(input)).toThrow("Dữ liệu lệnh không hợp lệ");
      }
    });
    it.each([
      "userId",
      "side",
      "winner",
      "clock",
      "canControl",
      "accessToken",
      "appSession",
      "extra",
    ])("rejects unlisted payload field %s", (key) => {
      expect(() =>
        parseCommand(matchCommand(type, { [key]: "forged" })),
      ).toThrow("Dữ liệu lệnh không hợp lệ");
    });
    it.each([-1, 0.5, Number.MAX_SAFE_INTEGER + 1])(
      "still rejects invalid room expectedVersion %s",
      (expectedVersion) => {
        expect(() =>
          parseCommand({ ...matchCommand(type), expectedVersion }),
        ).toThrow("Dữ liệu lệnh không hợp lệ");
      },
    );
  },
);
describe("move coordinate bounds with match identity", () => {
  it.each([
    { from: 0, to: 1 },
    { from: 89, to: 0 },
    { from: 88, to: 89 },
  ])("accepts board edge coordinates %j", (coords) => {
    expect(
      parseCommand(matchCommand("match.move", coords)).action.payload,
    ).toMatchObject(coords);
  });
  it.each([
    { from: -1 },
    { from: 90 },
    { from: 0.5 },
    { from: "0" },
    { from: null },
    { from: NaN },
    { to: -1 },
    { to: 90 },
    { to: 0.5 },
    { to: "1" },
    { to: null },
    { to: Infinity },
    { from: 42, to: 42 },
  ])("rejects outside/type/identical endpoints %j", (coords) => {
    expect(() => parseCommand(matchCommand("match.move", coords))).toThrow(
      "Dữ liệu lệnh không hợp lệ",
    );
  });
  it("rejects the obsolete move and empty resign formats", () => {
    for (const action of [
      { type: "match.move", payload: { from: 0, to: 1 } },
      { type: "match.resign", payload: {} },
    ])
      expect(() =>
        parseCommand({ ...matchCommand("match.move"), action }),
      ).toThrow("Dữ liệu lệnh không hợp lệ");
  });
});

describe.each([
  "match.draw.offer",
  "match.draw.withdraw",
  "match.draw.respond",
] as const)("draw protocol %s", (type) => {
  const input = (extra: Record<string, unknown> = {}) => ({
    commandId: randomUUID(),
    roomId: randomUUID(),
    expectedVersion: 4,
    action: {
      type,
      payload: {
        matchId: randomUUID(),
        matchVersion: 2,
        ...(type === "match.draw.offer" ? {} : { offerId: randomUUID() }),
        ...(type === "match.draw.respond" ? { accept: false } : {}),
        ...extra,
      },
    },
  });
  it("accepts the canonical payload with independent room/match versions", () => {
    const command = input();
    expect(parseCommand(command)).toEqual(command);
  });
  it.each([
    { matchId: undefined },
    { matchId: "forged" },
    { matchVersion: undefined },
    { matchVersion: -1 },
    { matchVersion: 0.5 },
    { matchVersion: Number.MAX_SAFE_INTEGER + 1 },
    { matchVersion: "2" },
    { side: "red" },
    { sender: randomUUID() },
    { canControl: true },
    { appSession: "secret" },
    { accessToken: "secret" },
    { clock: 0 },
    { extra: "unknown" },
  ])("rejects malformed or unlisted payload %j", (extra) => {
    expect(() => parseCommand(input(extra))).toThrow(
      "Dữ liệu lệnh không hợp lệ",
    );
  });
  if (type !== "match.draw.offer")
    it.each([undefined, null, {}, "forged", 12])(
      "rejects malformed offerId %j",
      (offerId) =>
        expect(() => parseCommand(input({ offerId }))).toThrow(
          "Dữ liệu lệnh không hợp lệ",
        ),
    );
  if (type === "match.draw.respond") {
    it.each([true, false])("accepts explicit boolean response %s", (accept) =>
      expect(parseCommand(input({ accept })).action.payload).toHaveProperty(
        "accept",
        accept,
      ),
    );
    it.each([undefined, null, "true", 1, [], {}])(
      "rejects non-boolean response %j",
      (accept) =>
        expect(() => parseCommand(input({ accept }))).toThrow(
          "Dữ liệu lệnh không hợp lệ",
        ),
    );
  }
});
