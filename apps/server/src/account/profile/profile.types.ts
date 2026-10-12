export class ProfileError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status = 409,
  ) {
    super(message);
  }
}
export interface ProfileView {
  userId: string;
  username: string;
  email: string;
  displayName: string;
}
export type ProfileLocationKind =
  "none" | "waiting" | "playing-online" | "playing-ai";
export interface ProfileLocation {
  kind: ProfileLocationKind;
  roomId: string | null;
  matchId: string | null;
}
export const DISPLAY_NAME_MIN = 2;
export const DISPLAY_NAME_MAX = 30;
