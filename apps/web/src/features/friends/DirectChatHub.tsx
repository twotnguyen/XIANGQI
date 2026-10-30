import { useEffect, useRef, useState } from "react";
import { Badge, Button, Dialog } from "../../shared/ui/primitives.js";
import type {
  DirectUnread,
  FriendClient,
  FriendPeer,
} from "./friend-client.js";
import { DirectChatDialog } from "./DirectChatDialog.js";

const POLL_MS = 2000;

/**
 * Nút tin nhắn toàn cục, tách khỏi chuông lời mời bạn bè. `userId` null (khách hoặc chưa đăng nhập)
 * thì không render gì. Mở danh sách bạn bè rồi chọn một người để mở hội thoại.
 */
export function DirectChatHub({
  client,
  userId,
}: {
  client: FriendClient;
  userId: string | null;
}) {
  const [unread, setUnread] = useState<DirectUnread | null>(null);
  const [open, setOpen] = useState(false);
  const [friends, setFriends] = useState<FriendPeer[] | null>(null);
  const [chatWith, setChatWith] = useState<FriendPeer | null>(null);
  const loadSeq = useRef(0);

  useEffect(() => {
    if (userId === null) return;
    const refresh = async () => {
      try {
        setUnread(await client.unread());
      } catch {
        // Giữ số đã biết gần nhất; lỗi mạng tạm thời không được hiển thị thành 0.
      }
    };
    void refresh();
    const timer = window.setInterval(() => void refresh(), POLL_MS);
    return () => window.clearInterval(timer);
  }, [client, userId]);

  useEffect(() => {
    if (!open) return;
    const refresh = async () => {
      const seq = ++loadSeq.current;
      try {
        const list = await client.list();
        if (seq !== loadSeq.current) return;
        setFriends(list);
        // Bạn đã bị hủy kết bạn thì đóng hội thoại đang mở ngay phía client.
        setChatWith((current) =>
          current && !list.some((friend) => friend.userId === current.userId)
            ? null
            : current,
        );
      } catch {
        // Giữ danh sách cũ; hộp thoại vẫn hiển thị lỗi riêng khi tải tin.
      }
    };
    void refresh();
    const timer = window.setInterval(() => void refresh(), POLL_MS);
    return () => window.clearInterval(timer);
  }, [client, open]);

  if (userId === null) return null;
  const total = unread?.total ?? 0;
  const countOf = (peerId: string) =>
    unread?.peers.find((peer) => peer.peerId === peerId)?.unread ?? 0;

  return (
    <>
      <button
        type="button"
        className="xq-friends-bell"
        aria-label={total > 0 ? `Tin nhắn, ${total} tin chưa đọc` : "Tin nhắn"}
        title="Tin nhắn"
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          <path d="M8 8h8M8 12h5" />
        </svg>
        <Badge count={total} label="tin chưa đọc" />
      </button>
      {open ? (
        <Dialog
          open
          onClose={() => setOpen(false)}
          title="Tin nhắn"
          cancelLabel="Đóng"
        >
          {friends === null ? (
            <p>Đang tải danh sách bạn bè…</p>
          ) : friends.length === 0 ? (
            <p>Chưa có bạn bè để nhắn tin.</p>
          ) : (
            <ul className="xq-dm-list">
              {friends.map((friend) => (
                <li key={friend.userId}>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setChatWith(friend);
                      setOpen(false);
                    }}
                  >
                    Nhắn tin với {friend.displayName}{" "}
                    <Badge
                      count={countOf(friend.userId)}
                      label="tin chưa đọc"
                    />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Dialog>
      ) : null}
      {chatWith ? (
        <DirectChatDialog
          client={client}
          friend={chatWith}
          onClose={() => setChatWith(null)}
        />
      ) : null}
    </>
  );
}
