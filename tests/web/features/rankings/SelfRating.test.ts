// @vitest-environment jsdom
import { createElement } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SelfRating } from "@web/features/rankings/SelfRating.js";

afterEach(cleanup);
const rating = (over: object) => ({ elo: 1200, completed: 0, wins: 0, draws: 0, losses: 0, tier: "Chưa xếp hạng", rank: null, remaining: 5, ...over });
const reply = (value: object) => vi.fn().mockResolvedValue(new Response(JSON.stringify(value)));

describe("SelfRating", () => {
  it("shows the real remaining games and no tier for an unplaced member", async () => {
    render(createElement(SelfRating, { authorizedFetch: reply(rating({ remaining: 3, completed: 2 })), guest: false }));
    expect(await screen.findByText(/1200 Elo.*Chưa xếp hạng — cần thêm 3 ván/)).toBeTruthy();
  });
  it("shows tier and rank once placed, and asks nothing for a guest", async () => {
    const placed = reply(rating({ elo: 1450, completed: 5, tier: "Trung cấp", rank: 7, remaining: 0 }));
    render(createElement(SelfRating, { authorizedFetch: placed, guest: false }));
    expect(await screen.findByText(/1450 Elo.*Trung cấp.*#7/)).toBeTruthy();
    cleanup();
    const guestFetch = vi.fn();
    render(createElement(SelfRating, { authorizedFetch: guestFetch, guest: true }));
    expect(guestFetch).not.toHaveBeenCalled();
  });
});
