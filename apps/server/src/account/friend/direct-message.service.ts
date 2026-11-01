import { createHash } from "node:crypto";
import { chatSticker, maskForbiddenChat } from "@xiangqi/shared";
import { FriendError } from "./friend.types.js";
import {
  DirectMessageStore,
  type DirectMessageList,
  type DirectMessageSend,
  type DirectMessageUnread,
} from "./direct-message.store.js";

const MAX_CHARS = 200;
export const DM_PAGE_SIZE = 50;

/** Nghiệp vụ tin nhắn riêng giữa hai người bạn: lọc nội dung, băm fingerprint, rồi giao cho store. */
export class DirectMessageService {
  constructor(private readonly store: DirectMessageStore) {}

  async send(
    viewer: string,
    peer: string,
    commandId: string,
    content: unknown,
  ): Promise<DirectMessageSend> {
    if (
      typeof content !== "string" ||
      !content.trim() ||
      Array.from(content).length > MAX_CHARS ||
      (/^:[a-z0-9_+-]+:$/i.test(content) && !chatSticker(content))
    )
      throw new FriendError("DM_INPUT_INVALID", "Tin nhắn không hợp lệ", 400);
    const fingerprint = createHash("sha256")
      .update(JSON.stringify({ content }))
      .digest("hex");
    return this.store.send({
      viewer,
      peer,
      commandId,
      fingerprint,
      content: maskForbiddenChat(content),
    });
  }

  list(
    viewer: string,
    peer: string,
    before: number | null,
  ): Promise<DirectMessageList> {
    return this.store.list(viewer, peer, before, DM_PAGE_SIZE);
  }

  markRead(viewer: string, peer: string, upTo: number): Promise<number> {
    return this.store.markRead(viewer, peer, upTo);
  }

  async unread(viewer: string): Promise<{
    total: number;
    peers: DirectMessageUnread[];
  }> {
    const peers = await this.store.unreadByFriend(viewer);
    return {
      total: peers.reduce((sum, peer) => sum + peer.unread, 0),
      peers,
    };
  }
}
