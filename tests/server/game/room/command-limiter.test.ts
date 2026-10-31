import { describe, expect, it } from "vitest";
import { CommandLimiter } from "@server/game/room/command-limiter.js";

describe("CommandLimiter (AC-YC2-RV-10)", () => {
  it("chặn lệnh thứ 61 cùng loại trong một phút, loại khác và người khác không ảnh hưởng", () => {
    const now = 0;
    const limiter = new CommandLimiter(() => now);
    for (let i = 0; i < 60; i++)
      expect(limiter.allow("u1", "start")).toBe(true);
    expect(limiter.allow("u1", "start")).toBe(false);
    expect(limiter.allow("u1", "ready")).toBe(true);
    expect(limiter.allow("u2", "start")).toBe(true);
  });

  it("cho phép lại khi cửa sổ 60 giây kết thúc", () => {
    let now = 0;
    const limiter = new CommandLimiter(() => now);
    for (let i = 0; i < 61; i++) limiter.allow("u1", "create");
    now = 60_000;
    expect(limiter.allow("u1", "create")).toBe(true);
  });
});
