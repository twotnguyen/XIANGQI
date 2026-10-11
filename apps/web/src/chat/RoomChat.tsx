import { useEffect, useId, useRef, useState } from "react";
import { maskForbiddenChat } from "@xiangqi/shared";
import "./room-chat.css";

export type RoomChatChannel = "PLAYERS_PRIVATE" | "ROOM_PUBLIC";
export interface RoomChatMessage {
  messageId: string;
  roomId: string;
  sequence: number;
  channel: RoomChatChannel;
  content: string;
  createdAt: string;
  sender: {
    displayName: string;
    isGuest: boolean;
    role: "red" | "black" | "spectator";
  };
}
export interface RoomChatChannelState {
  scopeToken: string | null;
  canSend: boolean;
  messages: readonly RoomChatMessage[];
  hasMore: boolean;
  loading: boolean;
  error: string | null;
}
export interface RoomChatProps {
  viewerRole: "red" | "black" | "spectator";
  connected: boolean;
  channels: {
    PLAYERS_PRIVATE?: RoomChatChannelState;
    ROOM_PUBLIC: RoomChatChannelState;
  };
  pendingSend?: RoomChatChannel | null;
  /** Raw <=200-code-point content. Server independently masks it before publication. */
  onSend: (channel: RoomChatChannel, content: string) => Promise<void>;
  onLoadMore: (channel: RoomChatChannel) => void | Promise<void>;
}
const label = (channel: RoomChatChannel) =>
  channel === "PLAYERS_PRIVATE" ? "Kênh riêng" : "Kênh chung";
function safeError(error: unknown) {
  const message = error instanceof Error ? error.message : error;
  return [
    "Bạn gửi quá nhanh",
    "Không có quyền gửi tin nhắn",
    "Chat tạm thời không dùng được",
    "Phiên truy cập không hợp lệ",
  ].includes(String(message))
    ? String(message)
    : "Không gửi được tin nhắn. Vui lòng thử lại.";
}
function ChatPane({
  channel,
  state,
  visible,
  connected,
  pending,
  onSend,
  onLoadMore,
  id,
  mobile,
}: {
  channel: RoomChatChannel;
  state: RoomChatChannelState;
  visible: boolean;
  connected: boolean;
  pending: boolean;
  onSend: RoomChatProps["onSend"];
  onLoadMore: RoomChatProps["onLoadMore"];
  id: string;
  mobile: boolean;
}) {
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState<"sending" | "sent" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [unread, setUnread] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const pinned = useRef(true);
  const latest = state.scopeToken ? state.messages.at(-1)?.sequence : undefined;
  const previous = useRef(latest);
  useEffect(() => {
    if (latest === undefined) return;
    const changed = latest !== previous.current;
    previous.current = latest;
    if (!visible || !scroller.current) return;
    if (pinned.current)
      scroller.current.scrollTop = scroller.current.scrollHeight;
    else if (changed) setUnread(true);
  }, [latest, visible]);
  const active = useRef(true);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  const content = draft.trim(),
    count = Array.from(content).length;
  const masked = maskForbiddenChat(content);
  const busy = status === "sending" || pending;
  const locked = !connected || !state.canSend || !state.scopeToken || busy;
  async function send() {
    if (locked || !content || count > 200) return;
    setStatus("sending");
    setError(null);
    try {
      await onSend(channel, content);
      if (!active.current) return;
      setDraft("");
      setStatus("sent");
    } catch (failure) {
      if (!active.current) return;
      setError(safeError(failure));
      setStatus(null);
    }
  }
  async function loadMore() {
    setLoadError(false);
    try {
      await onLoadMore(channel);
    } catch {
      if (active.current) setLoadError(true);
    }
  }
  if (!visible) return null;
  return (
    <section
      className="room-chat__pane"
      id={id}
      role={mobile ? "tabpanel" : undefined}
      aria-label={
        channel === "PLAYERS_PRIVATE" ? "Kênh riêng người chơi" : "Kênh chung"
      }
    >
      <h3>
        {channel === "PLAYERS_PRIVATE" ? "Kênh riêng người chơi" : "Kênh chung"}
      </h3>
      <p className="room-chat__note">
        {channel === "PLAYERS_PRIVATE"
          ? "Chỉ hai người đang ngồi ghế đọc và gửi."
          : "Người chơi cũng đọc và gửi được ở kênh này."}
      </p>
      {state.error && <p role="alert">{safeError(state.error)}</p>}
      {loadError && (
        <p role="alert">Không tải được tin nhắn. Vui lòng thử lại.</p>
      )}
      {state.hasMore && (
        <button
          type="button"
          disabled={state.loading || !connected || !state.scopeToken}
          onClick={() => void loadMore()}
        >
          Tải thêm tin {label(channel)}
        </button>
      )}
      <div
        className="room-chat__messages"
        ref={scroller}
        role="log"
        aria-label={`Tin nhắn ${label(channel)}`}
        aria-live="polite"
        aria-relevant="additions"
        aria-busy={state.loading}
        onScroll={(event) => {
          const element = event.currentTarget;
          pinned.current =
            element.scrollHeight - element.scrollTop - element.clientHeight <=
            32;
          if (pinned.current) setUnread(false);
        }}
      >
        {state.loading && <p role="status">Đang tải tin nhắn…</p>}
        {!state.loading &&
          (!state.scopeToken || state.messages.length === 0) && (
            <p className="room-chat__note">Chưa có tin nhắn.</p>
          )}
        <ol>
          {(state.scopeToken ? state.messages : []).map((message) => (
            <li key={message.messageId}>
              <div className="room-chat__sender">
                <strong>
                  {message.sender.displayName}
                  {message.sender.isGuest && " (Khách)"}
                </strong>
                <span>
                  {message.sender.role === "spectator"
                    ? "Người xem"
                    : `Người chơi · ${message.sender.role === "red" ? "Đỏ" : "Đen"}`}
                </span>
              </div>
              <p>{message.content}</p>
              <time dateTime={message.createdAt}>
                {new Date(message.createdAt).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </time>
            </li>
          ))}
        </ol>
      </div>
      {unread && (
        <button
          type="button"
          aria-label={`Tin mới ${label(channel)}`}
          onClick={() => {
            if (scroller.current)
              scroller.current.scrollTop = scroller.current.scrollHeight;
            pinned.current = true;
            setUnread(false);
          }}
        >
          Tin mới — xuống cuối
        </button>
      )}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void send();
        }}
      >
        <label htmlFor={`${id}-draft`}>Tin nhắn {label(channel)}</label>
        <textarea
          id={`${id}-draft`}
          value={draft}
          disabled={locked}
          rows={2}
          onChange={(event) => {
            setDraft(event.target.value);
            setError(null);
            setStatus(null);
          }}
        />
        <div className="room-chat__compose-meta">
          <span>{count}/200 ký tự</span>
          <button
            type="submit"
            aria-label={`Gửi ${label(channel)}`}
            disabled={locked || !content || count > 200}
          >
            Gửi
          </button>
        </div>
        {count > 200 && <p role="alert">Tin nhắn tối đa 200 ký tự.</p>}
        {masked !== content && (
          <div className="room-chat__preview">
            <span>Nội dung hiển thị:</span>
            <p>{masked}</p>
          </div>
        )}
        {!connected && <p role="status">Mất kết nối — chưa thể gửi tin.</p>}
        {connected && !state.canSend && (
          <p className="room-chat__note">Bạn chỉ có quyền đọc ở kênh này.</p>
        )}
        {busy && <p role="status">Đang gửi…</p>}
        {status === "sent" && <p role="status">Đã gửi</p>}
        {error && (
          <div>
            <p role="alert">{error}</p>
            <button
              type="button"
              aria-label={`Thử lại ${label(channel)}`}
              disabled={locked || !content || count > 200}
              onClick={() => void send()}
            >
              Thử lại
            </button>
          </div>
        )}
      </form>
    </section>
  );
}
export function RoomChat(props: RoomChatProps) {
  const query = "(max-width: 767px)";
  const [mobile, setMobile] = useState(
    () => typeof window !== "undefined" && !!window.matchMedia?.(query).matches,
  );
  useEffect(() => {
    const media = window.matchMedia?.(query);
    if (!media) return;
    const changed = () => setMobile(media.matches);
    media.addEventListener("change", changed);
    return () => media.removeEventListener("change", changed);
  }, []);
  const [open, setOpen] = useState({
    PLAYERS_PRIVATE: true,
    ROOM_PUBLIC: false,
  });
  const [tab, setTab] = useState<RoomChatChannel>("PLAYERS_PRIVATE");
  const id = useId();
  const spectator = props.viewerRole === "spectator";
  const available: RoomChatChannel[] = spectator
    ? ["ROOM_PUBLIC"]
    : ["PLAYERS_PRIVATE", "ROOM_PUBLIC"];
  return (
    <aside className="room-chat" aria-label="Trò chuyện trong phòng">
      <h2>Trò chuyện</h2>
      {mobile ? (
        <div
          className="room-chat__tabs"
          role="tablist"
          aria-label="Kênh trò chuyện"
        >
          {available.map((channel) => (
            <button
              key={channel}
              type="button"
              role="tab"
              tabIndex={spectator || tab === channel ? 0 : -1}
              aria-selected={spectator || tab === channel}
              aria-controls={`${id}-${channel}`}
              onClick={() => setTab(channel)}
              onKeyDown={(event) => {
                if (
                  !["ArrowLeft", "ArrowRight", "Home", "End"].includes(
                    event.key,
                  )
                )
                  return;
                event.preventDefault();
                const index = available.indexOf(channel);
                const next =
                  event.key === "Home"
                    ? 0
                    : event.key === "End"
                      ? available.length - 1
                      : (index +
                          (event.key === "ArrowRight" ? 1 : -1) +
                          available.length) %
                        available.length;
                setTab(available[next]!);
                const buttons =
                  event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>(
                    "button",
                  );
                buttons?.[next]?.focus();
              }}
            >
              {label(channel)}
            </button>
          ))}
        </div>
      ) : (
        !spectator && (
          <div className="room-chat__toggles">
            {available.map((channel) => (
              <button
                key={channel}
                type="button"
                aria-pressed={open[channel]}
                onClick={() =>
                  setOpen((current) => ({
                    ...current,
                    [channel]: !current[channel],
                  }))
                }
              >
                {open[channel] ? "Ẩn" : "Hiện"} {label(channel)}
              </button>
            ))}
          </div>
        )
      )}
      <div className="room-chat__panes">
        {available.map((channel) => {
          const state = props.channels[channel];
          if (!state) return null;
          return (
            <ChatPane
              key={channel + ":" + state.scopeToken}
              channel={channel}
              state={state}
              visible={spectator || (mobile ? tab === channel : open[channel])}
              connected={props.connected}
              pending={!!props.pendingSend}
              onSend={props.onSend}
              onLoadMore={props.onLoadMore}
              id={`${id}-${channel}`}
              mobile={mobile}
            />
          );
        })}
      </div>
    </aside>
  );
}
