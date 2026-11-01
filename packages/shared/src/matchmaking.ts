export type RoomKind = "CUSTOM" | "CASUAL" | "RANKED";
export type MatchmakingMode = Exclude<RoomKind, "CUSTOM">;

export interface RankedRating {
  elo: number;
  completed: number;
  wins: number;
  draws: number;
  losses: number;
  tier: string;
  rank: number | null;
  remaining: number;
}
export interface RatingChange {
  before: number;
  after: number;
  delta: number;
  tier: string;
}
export interface RankedResult {
  red: RatingChange;
  black: RatingChange;
}
export interface LeaderboardPlayer {
  userId: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
  rating: RankedRating;
  canMessage: boolean;
}
export interface LeaderboardView {
  players: LeaderboardPlayer[];
  self: LeaderboardPlayer;
  minimumGames: number;
  demo: boolean;
}

/** Queue projections never disclose an opponent before both confirmations. */
export interface MatchmakingState {
  bootId: string;
  serverNow: string;
  queueId: string | null;
  mode: MatchmakingMode | null;
  status:
    | "IDLE"
    | "SEARCHING"
    | "CONFIRMING"
    | "WAITING"
    | "COUNTDOWN"
    | "MATCHED"
    | "TIMED_OUT"
    | "CANCELLED";
  startedAt: string | null;
  deadline: string | null;
  offerId: string | null;
  confirmed: boolean;
  roomId: string | null;
  reason?: string;
  occupiedElsewhere?: boolean;
}
export interface MatchmakingCommand {
  commandId: string;
  type: "join" | "cancel" | "confirm" | "decline" | "sync";
  mode?: MatchmakingMode;
  queueId?: string;
  offerId?: string;
  bootId?: string;
}
export type MatchmakingAcknowledgement =
  | { status: "ok"; state: MatchmakingState }
  | { status: "error"; error: { code: string; message: string } };
