// @vitest-environment jsdom
import { createElement } from "react";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { RankingsPage } from "@web/features/rankings/RankingsPage.js";
import { SelfRating } from "@web/features/rankings/SelfRating.js";
import { nativeDialogStub } from "../rooms/RoomPage.test-helper.js";
beforeEach(nativeDialogStub);

afterEach(cleanup);
const rating = { elo: 1216, completed: 5, wins: 3, draws: 1, losses: 1, tier: "Sơ cấp", rank: 51, remaining: 0 };
const self = { userId: "self", displayName: "Bạn", username: "ban", avatarUrl: null, rating, canMessage: false };
const friend = { userId: "friend", displayName: "Bạn cờ", username: "friend", avatarUrl: null, rating: { ...rating, rank: 1 }, canMessage: true };
const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

it("pins self outside top 50 and opens accepted friend's summary with messaging", async () => {
  const onMessage = vi.fn();
  const fetch = vi.fn().mockResolvedValue(response({ players: [friend], self, minimumGames: 5, demo: false }));
  render(createElement(RankingsPage, { authorizedFetch: fetch, guest: false, onMessage }));
  expect(await screen.findByText(/#51/)).toBeTruthy();
  await userEvent.click(screen.getByRole("button", { name: /Bạn cờ/ }));
  const dialog = screen.getByRole("dialog");
  expect(within(dialog).getByText("@friend")).toBeTruthy();
  await userEvent.click(within(dialog).getByRole("button", { name: "Nhắn tin" }));
  expect(onMessage).toHaveBeenCalledWith("friend");
});

it("shows empty, refreshes and does not offer messages for self", async () => {
  const fetch = vi.fn().mockResolvedValueOnce(response({ players: [], self: { ...self, rating: { ...rating, rank: null, remaining: 2 } }, minimumGames: 5, demo: false })).mockResolvedValueOnce(response({ players: [], self, minimumGames: 5, demo: false }));
  render(createElement(RankingsPage, { authorizedFetch: fetch, guest: false, onMessage: vi.fn() }));
  expect(await screen.findByText(/cần thêm 2 ván/)).toBeTruthy();
  expect(screen.getByText(/Chưa có người chơi/)).toBeTruthy();
  await userEvent.click(screen.getByRole("button", { name: "Làm mới" }));
  expect(await screen.findByText(/#51/)).toBeTruthy();
  await userEvent.click(screen.getByRole("button", { name: /Bạn \(/ }));
  expect(screen.queryByRole("button", { name: "Nhắn tin" })).toBeNull();
});

it("offers retry on failure and never fetches rankings for guests", async () => {
  const fetch = vi.fn().mockResolvedValueOnce(response({}, 503)).mockResolvedValueOnce(response({ players: [], self, minimumGames: 5, demo: false }));
  const view = render(createElement(RankingsPage, { authorizedFetch: fetch, guest: false, onMessage: vi.fn() }));
  expect(await screen.findByRole("alert")).toBeTruthy();
  await userEvent.click(screen.getByRole("button", { name: "Thử lại" }));
  expect(await screen.findByText(/#51/)).toBeTruthy();
  view.rerender(createElement(RankingsPage, { authorizedFetch: fetch, guest: true, onMessage: vi.fn() }));
  expect(screen.getByText(/Khách không thể xem/)).toBeTruthy();
  expect(fetch).toHaveBeenCalledTimes(2);
});

it("shows member rating and games remaining, but not for guests", async () => {
  const fetch = vi.fn().mockResolvedValue(response({ ...rating, rank: null, remaining: 2 }));
  const view = render(createElement(SelfRating, { authorizedFetch: fetch, guest: false }));
  expect(await screen.findByText(/1216/)).toBeTruthy();
  expect(screen.getByText(/cần thêm 2 ván/)).toBeTruthy();
  view.rerender(createElement(SelfRating, { authorizedFetch: fetch, guest: true }));
  expect(screen.queryByText(/1216/)).toBeNull();
});

it("refreshes self rating when the ranked match result changes", async () => {
  const fetch = vi.fn().mockResolvedValueOnce(response({ ...rating, elo: 1200 })).mockResolvedValueOnce(response(rating));
  const view = render(createElement(SelfRating, { authorizedFetch: fetch, guest: false, revision: 0 }));
  expect(await screen.findByText(/1200 Elo/)).toBeTruthy();
  view.rerender(createElement(SelfRating, { authorizedFetch: fetch, guest: false, revision: 1 }));
  expect(await screen.findByText(/1216 Elo/)).toBeTruthy();
});
