import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Button, Dialog } from "../../shared/ui/primitives.js";
import { ChatContent, StickerPicker } from "../../shared/ui/ChatSticker.js";
import {
  FriendRequestError,
  friendErrorText as errorText,
  type DirectMessage,
  type FriendClient,
  type FriendPeer,
} from "./friend-client.js";

const POLL_MS = 2000;
const MAX_CHARS = 200;
const PAGE = 50;

type Friend = Pick<FriendPeer, "userId" | "username" | "displayName">;

/** Gộp trang mới nhất vào lịch sử đã tải: giữ tin cũ đã tải thêm, thay phần mới bằng bản từ server. */
function mergeLatest(prev: DirectMessage[], latest: DirectMessage[]) {
  const oldest = latest[0]?.seq ?? Number.POSITIVE_INFINITY;
  return [...prev.filter((message) => message.seq < oldest), ...latest];
}

/**
 * Hộp thoại nhắn tin với một bạn bè. Tin đến chỉ được báo đã đọc khi nằm trong vùng cuộn
 * (≥50% hiển thị) và tab đang hiện có focus. Thu hồi quan hệ bạn bè xóa lịch sử ngay trong UI.
 */
export function DirectChatDialog({
  client,
  friend,
  onClose,
}: {
  client: FriendClient;
  friend: Friend;
  onClose: () => void;
}) {
  const inputId = useId();
  const [messages, setMessages] = useState<DirectMessage[] | null>(null);
  const [olderDone, setOlderDone] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [revoked, setRevoked] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [active, setActive] = useState(
    () => document.visibilityState === "visible" && document.hasFocus(),
  );
  const [visibleMax, setVisibleMax] = useState(0);
  const [readPoll, setReadPoll] = useState(0);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const pending = useRef<{ commandId: string; content: string } | null>(null);
  const pinned = useRef(true);
  const prependHeight = useRef<number | null>(null);
  const markedSeq = useRef(0);
  const visibleSeqs = useRef(new Set<number>());
  const revokedRef = useRef(false);
  const logRef = useRef<HTMLDivElement>(null);
  const loadSeq = useRef(0);
  const mounted = useRef(false);
  const reading = useRef(false);

  const revoke = useCallback(() => {
    revokedRef.current = true;
    pending.current = null;
    visibleSeqs.current.clear();
    setRevoked(true);
    setMessages([]);
    setDraft("");
    setSendError("");
  }, []);

  const load = useCallback(async () => {
    if (revokedRef.current) return;
    const seq = ++loadSeq.current;
    try {
      const page = await client.messages(friend.userId);
      if (!mounted.current || seq !== loadSeq.current || revokedRef.current)
        return;
      setMessages((prev) => mergeLatest(prev ?? [], page.messages));
      setLoadFailed(false);
      // Tận dụng poll lịch sử để thử lại watermark lỗi mạng, tối đa một lần/nhịp.
      setReadPoll((value) => value + 1);
    } catch (error) {
      if (!mounted.current || seq !== loadSeq.current || revokedRef.current)
        return;
      if (
        error instanceof FriendRequestError &&
        error.code === "DM_NOT_FRIENDS"
      )
        revoke();
      else setLoadFailed(true);
    }
  }, [client, friend.userId, revoke]);

  useEffect(() => {
    mounted.current = true;
    void load();
    const timer = window.setInterval(() => void load(), POLL_MS);
    return () => {
      mounted.current = false;
      loadSeq.current++;
      window.clearInterval(timer);
    };
  }, [load]);

  // Theo dõi tab có đang hiện và có focus không; đổi trạng thái thì đánh giá lại việc báo đã đọc.
  useEffect(() => {
    const update = () =>
      setActive(document.visibilityState === "visible" && document.hasFocus());
    window.addEventListener("focus", update);
    window.addEventListener("blur", update);
    document.addEventListener("visibilitychange", update);
    return () => {
      window.removeEventListener("focus", update);
      window.removeEventListener("blur", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  // Quan sát từng tin đến trong vùng cuộn; tin có ≥50% diện tích nhìn thấy mới được tính.
  useEffect(() => {
    const log = logRef.current;
    if (!log || !messages || typeof IntersectionObserver === "undefined")
      return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const seq = Number((entry.target as HTMLElement).dataset.seq);
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5)
            visibleSeqs.current.add(seq);
          else visibleSeqs.current.delete(seq);
        }
        setVisibleMax(Math.max(0, ...visibleSeqs.current));
      },
      { root: log, threshold: 0.5 },
    );
    for (const row of log.querySelectorAll<HTMLElement>(
      '[data-incoming="true"]',
    ))
      observer.observe(row);
    return () => observer.disconnect();
  }, [messages]);

  // Báo đã đọc: watermark chỉ tăng; chỉ gửi khi tab hiện, có focus và có tin đến nhìn thấy mới hơn.
  useEffect(() => {
    if (
      !mounted.current ||
      !active ||
      revoked ||
      revokedRef.current ||
      reading.current ||
      visibleMax <= markedSeq.current
    )
      return;
    reading.current = true;
    client.markRead(friend.userId, visibleMax).then(
      (readSeq) => {
        if (mounted.current && !revokedRef.current)
          markedSeq.current = Math.max(markedSeq.current, readSeq);
        reading.current = false;
      },
      (error: unknown) => {
        reading.current = false;
        if (!mounted.current || revokedRef.current) return;
        if (
          error instanceof FriendRequestError &&
          error.code === "DM_NOT_FRIENDS"
        )
          revoke();
      },
    );
  }, [active, client, friend.userId, readPoll, revoke, revoked, visibleMax]);

  // Giữ đáy khi đang ở cuối; khi tải tin cũ thì giữ nguyên vị trí đang đọc.
  useLayoutEffect(() => {
    const log = logRef.current;
    if (!log) return;
    if (prependHeight.current !== null) {
      log.scrollTop += log.scrollHeight - prependHeight.current;
      prependHeight.current = null;
    } else if (pinned.current) log.scrollTop = log.scrollHeight;
  }, [messages]);

  async function loadOlder() {
    const oldest = messages?.[0]?.seq;
    const log = logRef.current;
    if (oldest === undefined || !log) return;
    setLoadingOlder(true);
    try {
      const page = await client.messages(friend.userId, oldest);
      if (revokedRef.current) return;
      prependHeight.current = log.scrollHeight;
      setMessages((prev) => {
        const known = new Set((prev ?? []).map((message) => message.seq));
        const older = page.messages.filter(
          (message) => !known.has(message.seq),
        );
        return [...older, ...(prev ?? [])];
      });
      if (page.messages.length < PAGE) setOlderDone(true);
    } catch (error) {
      if (
        error instanceof FriendRequestError &&
        error.code === "DM_NOT_FRIENDS"
      )
        revoke();
      else setLoadFailed(true);
    } finally {
      setLoadingOlder(false);
    }
  }

  async function sendContent(content: string) {
    if (revokedRef.current || sending || !content.trim() || Array.from(content).length > MAX_CHARS) return;
    const commandId =
      pending.current?.content === content
        ? pending.current.commandId
        : crypto.randomUUID();
    pending.current = { commandId, content };
    setSending(true);
    setSendError("");
    try {
      await client.sendMessage(friend.userId, content, commandId);
      pending.current = null;
      pinned.current = true;
      if (content === draft) setDraft("");
      await load();
    } catch (error) {
      const code = error instanceof FriendRequestError ? error.code : "";
      if (code === "DM_NOT_FRIENDS") revoke();
      else {
        if (code === "DM_COMMAND_ID_REUSED") pending.current = null;
        setSendError(errorText(error));
      }
    } finally {
      setSending(false);
    }
  }

  const length = Array.from(draft).length;
  const canSend =
    !revoked &&
    !sending &&
    length > 0 &&
    length <= MAX_CHARS &&
    draft.trim() !== "";
  const showOlder = !revoked && !olderDone && (messages?.length ?? 0) >= PAGE;

  return (
    <Dialog
      open
      onClose={onClose}
      title={`Nhắn tin với ${friend.displayName}`}
      cancelLabel="Đóng"
    >
      <div className="xq-dm">
        {revoked ? (
          <p className="xq-dm__status" role="status">
            Không còn là bạn bè, lịch sử trò chuyện đã bị ẩn.
          </p>
        ) : null}
        {loadFailed && !revoked ? (
          <p className="xq-dm__error" role="alert">
            Chưa tải được tin nhắn.{" "}
            <Button variant="secondary" onClick={() => void load()}>
              Thử lại
            </Button>
          </p>
        ) : null}
        <div
          ref={logRef}
          className="xq-dm__log"
          role="log"
          aria-live="polite"
          aria-label={`Lịch sử với ${friend.displayName}`}
          tabIndex={0}
          onScroll={(event) => {
            const log = event.currentTarget;
            pinned.current =
              log.scrollHeight - log.scrollTop - log.clientHeight < 24;
          }}
        >
          {showOlder ? (
            <Button
              variant="ghost"
              disabled={loadingOlder}
              onClick={() => void loadOlder()}
            >
              {loadingOlder ? "Đang tải…" : "Tải tin cũ"}
            </Button>
          ) : null}
          {messages === null ? (
            !loadFailed && <p className="xq-dm__status">Đang tải…</p>
          ) : messages.length === 0 && !revoked && !loadFailed ? (
            <p className="xq-dm__status">Chưa có tin nhắn.</p>
          ) : (
            messages.map((message) => {
              const incoming = message.senderId === friend.userId;
              return (
                <div
                  key={message.seq}
                  data-seq={message.seq}
                  data-incoming={incoming ? "true" : "false"}
                  className={`xq-dm__row${incoming ? "" : " xq-dm__row--mine"}`}
                >
                  <p className="xq-dm__bubble">
                    <ChatContent content={message.content} />
                    <time dateTime={message.createdAt}>
                      {" "}
                      {new Date(message.createdAt).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </p>
                </div>
              );
            })
          )}
        </div>
        {sendError ? (
          <div className="xq-dm__error">
            <p role="alert">{sendError}</p>
            <Button variant="secondary" disabled={sending || !pending.current} onClick={() => pending.current && void sendContent(pending.current.content)}>Thử lại</Button>
          </div>
        ) : null}
        <form
          className="xq-dm__composer"
          onSubmit={(event) => { event.preventDefault(); void sendContent(draft); }}
        >
          <label htmlFor={inputId} className="xq-sr-only">
            Nội dung tin nhắn
          </label>
          <input
            id={inputId}
            className="xq-dm__input"
            value={draft}
            disabled={revoked}
            aria-describedby={`${inputId}-count`}
            aria-invalid={length > MAX_CHARS}
            autoComplete="off"
            onChange={(event) => setDraft(event.target.value)}
          />
          <span
            id={`${inputId}-count`}
            className={`xq-dm__count${length > MAX_CHARS ? " xq-dm__count--over" : ""}`}
          >
            {length}/{MAX_CHARS}
          </span>
          <StickerPicker disabled={revoked || sending} label="tin nhắn" onSelect={(content) => void sendContent(content)} />
          <Button type="submit" disabled={!canSend}>
            Gửi
          </Button>
        </form>
      </div>
    </Dialog>
  );
}
