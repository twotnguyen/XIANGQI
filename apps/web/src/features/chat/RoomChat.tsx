import { useEffect, useId, useRef, useState } from "react";
import { maskForbiddenChat } from "@xiangqi/shared";
import { breakpoints } from "../../shared/styles/breakpoints.js";
import { ChatContent, StickerPicker } from "../../shared/ui/ChatSticker.js";
import "./room-chat.css";

export type RoomChatChannel = "PLAYERS_PRIVATE" | "ROOM_PUBLIC";
export interface RoomChatMessage {
  messageId: string;
  senderId?: string;
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
  historyThrough?: number;
  historyReady?: boolean;
  hasMore: boolean;
  loading: boolean;
  error: string | null;
}
export interface RoomChatProps {
  viewerRole: "red" | "black" | "spectator";
  privateOnly?: boolean;
  userId?: string;
  panelVisible?: boolean;
  onUnreadChange?: (counts: Record<RoomChatChannel, number>) => void;
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
/**
 * Khung giao diện chi tiết của một kênh chat (hiển thị danh sách tin nhắn, tự động cuộn và ô soạn thảo tin).
 */
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
  const [failedContent, setFailedContent] = useState<string | null>(null);
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
  const content = draft,
    count = Array.from(content).length;
  const masked = maskForbiddenChat(content);
  const busy = status === "sending" || pending;
  const locked = !connected || !state.canSend || !state.scopeToken || busy;
  async function send(value = content) {
    if (locked || !value.trim() || Array.from(value).length > 200) return;
    setStatus("sending");
    setFailedContent(null);
    setError(null);
    try {
      await onSend(channel, value);
      if (!active.current) return;
      if (value === content) setDraft("");
      setStatus("sent");
    } catch (failure) {
      if (!active.current) return;
      setFailedContent(value);
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
          !state.error && state.scopeToken && state.messages.length === 0 && (
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
              <p><ChatContent content={message.content} /></p>
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
        <StickerPicker disabled={locked} label={label(channel)} onSelect={(value) => void send(value)} />
        <div className="room-chat__compose-meta">
          <span>{count}/200 ký tự</span>
          <button
            type="submit"
            aria-label={`Gửi ${label(channel)}`}
            disabled={locked || !content.trim() || count > 200}
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
              disabled={locked || !failedContent}
              onClick={() => failedContent && void send(failedContent)}
            >
              Thử lại
            </button>
          </div>
        )}
      </form>
    </section>
  );
}
/**
 * Khung trò chuyện trong phòng cờ (hỗ trợ chuyển đổi giữa Kênh riêng kỳ thủ và Kênh chung phòng, thích ứng giao diện mobile/desktop).
 */
export function RoomChat(props: RoomChatProps) {
  const query = `(max-width: ${breakpoints.phone - 1}px)`;
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
  const available: RoomChatChannel[] = props.privateOnly
    ? ["PLAYERS_PRIVATE"]
    : spectator
      ? ["ROOM_PUBLIC"]
      : ["PLAYERS_PRIVATE", "ROOM_PUBLIC"];
  const [counts, setCounts] = useState<Record<RoomChatChannel, number>>({ PLAYERS_PRIVATE: 0, ROOM_PUBLIC: 0 });
  const seen = useRef<Partial<Record<RoomChatChannel, { scope: string; max: number; initialized: boolean; unread: Set<number> }>>>({});
  const [visibilityTick, setVisibilityTick] = useState(0);
  const unreadCallback = useRef(props.onUnreadChange);
  unreadCallback.current = props.onUnreadChange;
  useEffect(() => {
    const update = () => setVisibilityTick((value) => value + 1);
    document.addEventListener("visibilitychange", update);
    window.addEventListener("scroll", update, true);
    return () => { document.removeEventListener("visibilitychange", update); window.removeEventListener("scroll", update, true); };
  }, []);
  useEffect(() => { unreadCallback.current?.(counts); }, [counts]);
  useEffect(() => {
    const next = { PLAYERS_PRIVATE: 0, ROOM_PUBLIC: 0 };
    for (const channel of ["PLAYERS_PRIVATE", "ROOM_PUBLIC"] as const) {
      const state = props.channels[channel];
      if (!available.includes(channel) || !state?.scopeToken || (channel === "PLAYERS_PRIVATE" && spectator)) {
        delete seen.current[channel];
        continue;
      }
      let entry = seen.current[channel];
      const max = Math.max(0, ...state.messages.map((message) => message.sequence));
      if (!entry || entry.scope !== state.scopeToken) {
        entry = { scope: state.scopeToken, max, initialized: state.historyReady !== false && !state.loading, unread: new Set() };
        seen.current[channel] = entry;
      } else if (!entry.initialized) {
        entry.max = Math.max(entry.max, max);
        entry.initialized = state.historyReady !== false && !state.loading;
      } else {
        for (const message of state.messages) {
          if (message.sequence > entry.max && message.sequence > (state.historyThrough ?? 0) && message.senderId && message.senderId !== props.userId) entry.unread.add(message.sequence);
        }
        entry.max = Math.max(entry.max, max);
      }
      const pane = document.getElementById(`${id}-${channel}`);
      const log = pane?.querySelector(".room-chat__messages");
      const last = log?.querySelector("li:last-child");
      const rect = last?.getBoundingClientRect();
      const logRect = log?.getBoundingClientRect();
      const atBottom = !!log && log.scrollHeight - log.scrollTop - log.clientHeight <= 32;
      const shown = props.panelVisible !== false && document.visibilityState === "visible" && !!rect && !!logRect && rect.bottom > 0 && rect.top < window.innerHeight && rect.bottom > logRect.top && rect.top < logRect.bottom && atBottom && (spectator || (mobile ? tab === channel : open[channel]));
      if (shown) entry.unread.clear();
      next[channel] = entry.unread.size;
    }
    setCounts((current) => current.PLAYERS_PRIVATE === next.PLAYERS_PRIVATE && current.ROOM_PUBLIC === next.ROOM_PUBLIC ? current : next);
  }, [props.channels, props.userId, props.panelVisible, props.privateOnly, spectator, mobile, tab, open, id, visibilityTick]);
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
              {counts[channel] > 0 && <span className="room-chat__badge" aria-label={`${counts[channel]} tin chưa xem`}>{counts[channel] > 99 ? "99+" : counts[channel]}</span>}
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
                {counts[channel] > 0 && <span className="room-chat__badge" aria-label={`${counts[channel]} tin chưa xem`}>{counts[channel] > 99 ? "99+" : counts[channel]}</span>}
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
              visible={props.panelVisible !== false && (spectator || (mobile ? tab === channel : open[channel]))}
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
