import { describe, expect, it } from "vitest";
import { calculateRating, ratingTier } from "@server/game/ranking/ranked.store.js";

describe("ranked Elo", () => {
  it("uses K32 for game 30 and K16 from game 31 independently", () => {
    expect(calculateRating(1200, 1200, 29, 1)).toBe(1216);
    expect(calculateRating(1200, 1200, 30, 0)).toBe(1192);
  });
  it("rounds before applying the floor", () => {
    expect(calculateRating(100, 2000, 0, 0)).toBe(100);
    expect(calculateRating(1200, 1200, 0, 0.5)).toBe(1200);
  });
  it("labels unrated and tier boundaries", () => {
    expect(ratingTier(1200, 0)).toBe("Chưa xếp hạng");
    expect(ratingTier(1199, 1)).toBe("Người mới");
    expect(ratingTier(2000, 1)).toBe("Đại sư");
  });
});
