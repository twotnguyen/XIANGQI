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
export interface MediaToken {
  url: string;
  token: string;
  roomName: string;
  expiresAt: string;
  generation: string;
}
export const SHARE_LEVELS: ShareLevel[] = ["NONE", "OPPONENT", "ALL"];
export function privateRoomName(roomId: string, generation: string) {
  return `xiangqi-${roomId}-${generation}`;
}
export function stageRoomName(roomId: string, generation: string) {
  return `xiangqi-${roomId}-${generation}-stage`;
}
