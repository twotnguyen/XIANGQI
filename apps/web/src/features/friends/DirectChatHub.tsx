import "./friends.css";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Badge,
  Button,
  Dialog,
  ErrorState,
} from "../../shared/ui/primitives.js";
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
  floating = false,
}: {
  client: FriendClient;
  userId: string | null;
  floating?: boolean;
}) {
  const [unread, setUnread] = useState<DirectUnread | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [friends, setFriends] = useState<FriendPeer[] | null>(null);
  const [listFailed, setListFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
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
    let active = true;
    let inFlight = false;
    const refresh = async () => {
      if (inFlight) return;
      inFlight = true;
      const seq = ++loadSeq.current;
      try {
        const list = await client.list();
        if (!active || seq !== loadSeq.current) return;
        setFriends(list);
        setListFailed(false);
        // Bạn đã bị hủy kết bạn thì đóng hội thoại đang mở ngay phía client.
        setChatWith((current) =>
          current && !list.some((friend) => friend.userId === current.userId)
            ? null
            : current,
        );
      } catch {
        if (active && seq === loadSeq.current) setListFailed(true);
      } finally {
        inFlight = false;
      }
    };
    void refresh();
    const timer = window.setInterval(() => void refresh(), POLL_MS);
    return () => {
      active = false;
      loadSeq.current++;
      window.clearInterval(timer);
    };
  }, [attempt, client, open]);

  if (userId === null) return null;
  const total = unread?.total ?? 0;
  const countOf = (peerId: string) =>
    unread?.peers.find((peer) => peer.peerId === peerId)?.unread ?? 0;
  const filteredFriends = friends?.filter((friend) =>
    `${friend.displayName} ${friend.username}`.toLocaleLowerCase("vi").includes(query.trim().toLocaleLowerCase("vi")),
  );

  return (
    <>
      <button
        type="button"
        className="xq-friends-bell"
        aria-label={total > 0 ? `Tin nhắn, ${total} tin chưa đọc` : "Tin nhắn"}
        title="Tin nhắn"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          <path d="M8 8h8M8 12h5" />
        </svg>
        <Badge count={total} label="tin chưa đọc" />
      </button>
      {open ? floating ? createPortal(
        <aside className="xq-dm-sidebar" aria-label="Danh sách bạn bè" onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); }}>
          <header className="xq-dm-sidebar__header">
            <h2>Đoạn chat</h2>
            <button type="button" onClick={() => setOpen(false)} aria-label="Đóng danh sách bạn bè">×</button>
          </header>
          <label className="xq-dm-sidebar__search">
            <span aria-hidden="true">⌕</span>
            <input aria-label="Tìm kiếm bạn bè" placeholder="Tìm kiếm bạn bè" value={query} onChange={(event) => setQuery(event.target.value)} />
          </label>
          <div className="xq-dm-sidebar__filter">Tất cả</div>
          {listFailed && (
            <ErrorState
              message={friends === null ? "Chưa tải được danh sách bạn bè. Vui lòng thử lại." : "Chưa cập nhật được danh sách bạn bè. Đang giữ danh sách gần nhất."}
              onRetry={() => setAttempt((value) => value + 1)}
            />
          )}
          {friends === null ? (
            !listFailed && <p role="status">Đang tải danh sách bạn bè…</p>
          ) : friends.length === 0 ? (
            <p>Chưa có bạn bè để nhắn tin.</p>
          ) : filteredFriends?.length === 0 ? (
            <p>Không tìm thấy bạn bè.</p>
          ) : (
            <ul className="xq-dm-list">
              {filteredFriends?.map((friend) => (
                <li key={friend.userId}>
                  <button type="button" className="xq-dm-sidebar__friend" aria-label={`Nhắn tin với ${friend.displayName}`} onClick={() => { setChatWith(friend); setOpen(false); }}>
                    <span className="xq-dm-sidebar__avatar" aria-hidden="true">{Array.from(friend.displayName)[0]}{friend.status === "online" && <span className="xq-dm-sidebar__online" />}</span>
                    <span className="xq-dm-sidebar__name">{friend.displayName}<small>{friend.status === "online" ? "Đang trực tuyến" : friend.status === "in-match" ? "Đang chơi" : "Ngoại tuyến"}</small></span>
                    <Badge count={countOf(friend.userId)} label="tin chưa đọc" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>
      , document.querySelector(".xq-shell") ?? document.body) : (
        <Dialog open onClose={() => setOpen(false)} title="Tin nhắn" cancelLabel="Đóng">
          {listFailed && (
            <ErrorState
              message={
                friends === null
                  ? "Chưa tải được danh sách bạn bè. Vui lòng thử lại."
                  : "Chưa cập nhật được danh sách bạn bè. Đang giữ danh sách gần nhất."
              }
              onRetry={() => setAttempt((value) => value + 1)}
            />
          )}
          {friends === null ? (
            !listFailed && <p role="status">Đang tải danh sách bạn bè…</p>
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
      {chatWith ? createPortal(
        <DirectChatDialog
          key={chatWith.userId}
          client={client}
          friend={chatWith}
          floating={floating}
          onClose={() => setChatWith(null)}
        />
      , document.querySelector(".xq-shell") ?? document.body) : null}
    </>
  );
}
