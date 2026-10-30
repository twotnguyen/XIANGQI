import { describe, expect, it } from "vitest";
import {
  inactivityExpired,
  inactivityView,
  unlimitedClock,
} from "@server/game/match/inactivity.js";

describe("unlimited match inactivity", () => {
  const start = new Date("2026-11-02T00:00:00.000Z");

  it("prompts at 3 minutes and expires after the 30 second grace", () => {
    const clock = unlimitedClock(start);
    const view = inactivityView(clock, 0);
    expect(view.promptAt).toBe("2026-11-02T00:03:00.000Z");
    expect(view.expiresAt).toBe("2026-11-02T00:03:30.000Z");
    expect(view.confirmsLeft).toBe(2);
    expect(inactivityExpired(clock, new Date(start.getTime() + 209_999))).toBe(
      false,
    );
    expect(inactivityExpired(clock, new Date(start.getTime() + 210_000))).toBe(
      true,
    );
  });

  it("reports no confirms left after two still-here confirmations", () => {
    expect(inactivityView(unlimitedClock(start), 2).confirmsLeft).toBe(0);
    expect(inactivityView(unlimitedClock(start), 5).confirmsLeft).toBe(0);
  });
});
