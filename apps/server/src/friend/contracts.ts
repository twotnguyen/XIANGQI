export class FriendError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status = 409,
  ) {
    super(message);
  }
}
export type FriendStatus = "online" | "in-match" | "offline";
export interface FriendPeer {
  userId: string;
  username: string;
  displayName: string;
  status: FriendStatus;
}
export interface FriendRequestView {
  id: string;
  direction: "incoming" | "outgoing";
  peer: { userId: string; username: string; displayName: string };
  createdAt: string;
  expiresAt: string;
}
export interface RoomInviteView {
  id: string;
  roomId: string;
  roomName: string;
  inviter: { userId: string; username: string; displayName: string };
  createdAt: string;
  expiresAt: string;
}
