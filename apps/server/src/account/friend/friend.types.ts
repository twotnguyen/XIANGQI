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
/** Thông báo từ chối gửi cho người mời; ack để tiêu thụ. */
export interface InviteDeclineView {
  id: string;
  inviteId: string;
  displayName: string;
  createdAt: string;
}
export interface InviteStateView {
  cooldownUntil: string | null;
  declines: InviteDeclineView[];
}
/** Phản hồi lưu bền vững theo lời mời; replay trả lại đúng body này. */
export type RoomInviteResponse =
  | { accepted: false; cooldownUntil: string }
  | {
      accepted: true;
      roomId: string;
      version: number;
      role: "red" | "black" | "spectator";
      notice?: string;
    };
