export class MediaError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status = 409,
  ) {
    super(message);
  }
}
export type ShareLevel = "NONE" | "OPPONENT" | "ALL";
export type MediaRole = "player" | "viewer";
export interface MediaToken {
  url: string;
  token: string;
  roomName: string;
  expiresAt: string;
}
export interface MediaRevokePort {
  revoke(roomId: string, userId: string): Promise<void>;
}
export const SHARE_LEVELS: ShareLevel[] = ["NONE", "OPPONENT", "ALL"];
export function privateRoomName(roomId: string) {
  return `xiangqi-${roomId}`;
}
export function stageRoomName(roomId: string) {
  return `xiangqi-${roomId}-stage`;
}
