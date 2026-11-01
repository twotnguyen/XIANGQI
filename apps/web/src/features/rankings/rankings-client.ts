import type { AuthorizedFetch } from "../../shared/api.js";

import type { RankedRating, LeaderboardPlayer, LeaderboardView } from "@xiangqi/shared";
export type { RankedRating, LeaderboardPlayer, LeaderboardView } from "@xiangqi/shared";
function isRating(value: unknown): value is RankedRating {
  if (!value || typeof value !== "object") return false;
  const r = value as RankedRating;
  return [r.elo, r.completed, r.wins, r.draws, r.losses, r.remaining].every((n) => Number.isInteger(n) && n >= 0) && typeof r.tier === "string" && (r.rank === null || (Number.isInteger(r.rank) && r.rank > 0));
}
function isPlayer(value: unknown): value is LeaderboardPlayer {
  if (!value || typeof value !== "object") return false;
  const p = value as LeaderboardPlayer;
  return typeof p.userId === "string" && typeof p.displayName === "string" && typeof p.username === "string" && (p.avatarUrl === null || typeof p.avatarUrl === "string") && typeof p.canMessage === "boolean" && isRating(p.rating);
}
export async function readRankings(fetch: AuthorizedFetch): Promise<LeaderboardView> {
  const response = await fetch("/rankings", { method: "GET", redirect: "error", cache: "no-store" });
  if (!response.ok) throw new Error("Không thể tải bảng xếp hạng.");
  const value: unknown = await response.json();
  if (!value || typeof value !== "object") throw new Error("Phản hồi không hợp lệ.");
  const view = value as LeaderboardView;
  if (!Array.isArray(view.players) || view.players.length > 50 || !view.players.every(isPlayer) || !isPlayer(view.self) || !Number.isInteger(view.minimumGames) || typeof view.demo !== "boolean") throw new Error("Phản hồi không hợp lệ.");
  return view;
}
export async function readSelfRating(fetch: AuthorizedFetch): Promise<RankedRating> {
  const response = await fetch("/rankings/me", { method: "GET", redirect: "error", cache: "no-store" });
  if (!response.ok) throw new Error("Không thể tải xếp hạng.");
  const value: unknown = await response.json();
  if (!isRating(value)) throw new Error("Phản hồi không hợp lệ.");
  return value;
}
export function ratingPosition(rating: RankedRating): string {
  return rating.rank === null ? `Chưa xếp hạng — cần thêm ${rating.remaining} ván` : `#${rating.rank}`;
}
