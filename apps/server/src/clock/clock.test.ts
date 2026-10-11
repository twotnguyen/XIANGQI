import { describe, expect, it } from "vitest";
import * as implementation from "./clock-service.js";
const at = new Date(1_000_000);
const state = {
  redMs: 300000,
  blackMs: 300000,
  runningSinceEpochMs: at.getTime(),
};
const service = () => new implementation.ClockService();
describe("fixed online clock", () => {
  it("exports the frozen ClockPort implementation", () =>
    expect(implementation.ClockService).toBeTypeOf("function"));
  it.each([300, 600, 900] as const)(
    "starts %ss fully without increment",
    (seconds) =>
      expect(service().start(seconds, at)).toEqual({
        redMs: seconds * 1000,
        blackMs: seconds * 1000,
        runningSinceEpochMs: 1000000,
      }),
  );
  it("subtracts only the active side, switches without increment and does not mutate input", () => {
    const c = service();
    const red = c.beforeAction(state, "red", new Date(1001234));
    expect(red).toEqual({
      clock: { redMs: 298766, blackMs: 300000, runningSinceEpochMs: 1001234 },
      expired: null,
    });
    const switched = c.afterMove(red.clock, "black", new Date(1001234));
    expect(switched).toEqual(red.clock);
    expect(switched).not.toBe(red.clock);
    expect(c.beforeAction(switched, "black", new Date(1002234))).toEqual({
      clock: { redMs: 298766, blackMs: 299000, runningSinceEpochMs: 1002234 },
      expired: null,
    });
    expect(state).toEqual({
      redMs: 300000,
      blackMs: 300000,
      runningSinceEpochMs: 1000000,
    });
  });
  it.each([
    [-1, 1, null],
    [0, 0, "red"],
    [1, 0, "red"],
    [999999, 0, "red"],
  ] as const)(
    "checks deadline offset%sms exactly",
    (offset, remaining, expired) =>
      expect(
        service().beforeAction(state, "red", new Date(1300000 + offset)),
      ).toEqual({
        clock: {
          redMs: remaining,
          blackMs: 300000,
          runningSinceEpochMs: 1300000 + offset,
        },
        expired,
      }),
  );
  it("is idempotent at a repeated sample and never refunds or rewinds on a backward sample", () => {
    const c = service();
    const first = c.beforeAction(state, "red", new Date(1005000));
    expect(c.beforeAction(first.clock, "red", new Date(1005000))).toEqual(
      first,
    );
    expect(c.beforeAction(first.clock, "red", new Date(1004000))).toEqual(
      first,
    );
    expect(c.afterMove(first.clock, "black", new Date(1004000))).toEqual(
      first.clock,
    );
  });
  it.each([
    { ...state, redMs: -1 },
    { ...state, blackMs: 1.5 },
    { ...state, runningSinceEpochMs: NaN },
    { ...state, redMs: Number.MAX_SAFE_INTEGER + 1 },
    { ...state, blackMs: "300000" },
  ])("refuses corrupt stored clock", (clock) =>
    expect(() => service().beforeAction(clock as never, "red", at)).toThrow(
      "CLOCK_INVALID_STATE",
    ),
  );
  it("refuses unsupported control, side and invalid trusted Date", () => {
    const c = service();
    expect(() => c.start(0 as never, at)).toThrow("CLOCK_INVALID_STATE");
    expect(() => c.start(300, new Date(NaN))).toThrow("CLOCK_INVALID_STATE");
    expect(() => c.beforeAction(state, "BLUE" as never, at)).toThrow(
      "CLOCK_INVALID_STATE",
    );
    expect(() => c.afterMove(state, "BLUE" as never, at)).toThrow(
      "CLOCK_INVALID_STATE",
    );
  });
});
