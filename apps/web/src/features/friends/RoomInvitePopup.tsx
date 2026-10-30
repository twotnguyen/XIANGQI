import "./friends.css";
import { useEffect, useRef, useState } from "react";
import { navigate } from "../../shared/navigation/navigation.js";
import { Button } from "../../shared/ui/primitives.js";
import type {
  AcceptedInvite,
  FriendClient,
  InviteDecline,
  RoomInvite,
} from "./friend-client.js";
import { friendErrorText } from "./friend-client.js";

const POLL_MS = 2000;
const TICK_MS = 1000;

/**
 * Các popup lời mời vào phòng từ bạn bè. Mỗi lời mời có deadline tuyệt đối từ server (sống sót qua reload),
 * không chặn thao tác trang (không modal), và chỉ chuyển phòng sau khi server xác nhận accepted:true.
 */
export function RoomInvitePopup({
  client,
  onEntered,
}: {
  client: FriendClient;
  onEntered?: (entry: AcceptedInvite) => void;
}) {
  const [invites, setInvites] = useState<RoomInvite[]>([]);
  const [declines, setDeclines] = useState<InviteDecline[]>([]);
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [now, setNow] = useState(() => Date.now());
  const epoch = useRef(0);
  const inFlight = useRef(false);
  const pending = useRef(new Set<string>());
  const commandIds = useRef(new Map<string, string>());

  useEffect(() => {
    let active = true;
    const poll = async () => {
      if (inFlight.current) return;
      inFlight.current = true;
      const started = epoch.current;
      try {
        const [nextInvites, state] = await Promise.all([
          client.invites(),
          client.inviteState(),
        ]);
        if (active && started === epoch.current) {
          setInvites(nextInvites);
          setNow(Date.now());
          setDeclines(state.declines);
        }
      } catch {
        /* Lỗi mạng tạm thời: giữ popup hiện tại, lần poll sau thử lại. */
      } finally {
        inFlight.current = false;
      }
    };
    void poll();
    const timer = window.setInterval(() => void poll(), POLL_MS);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [client]);

  const hasItems = invites.length > 0 || declines.length > 0;
  useEffect(() => {
    if (!hasItems) return;
    const clock = window.setInterval(() => setNow(Date.now()), TICK_MS);
    return () => window.clearInterval(clock);
  }, [hasItems]);

  async function answer(invite: RoomInvite, accept: boolean) {
    if (pending.current.has(invite.id)) return;
    pending.current.add(invite.id);
    let commandId = commandIds.current.get(invite.id);
    if (!commandId) {
      commandId = crypto.randomUUID();
      commandIds.current.set(invite.id, commandId);
    }
    setBusy((prev) => ({ ...prev, [invite.id]: true }));
    setErrors((prev) => ({ ...prev, [invite.id]: "" }));
    try {
      const result = await client.respondInvite(invite.id, accept, commandId);
      commandIds.current.delete(invite.id);
      epoch.current += 1;
      setInvites((prev) => prev.filter((item) => item.id !== invite.id));
      if (result.accepted) {
        if (onEntered) onEntered(result);
        else navigate(`/rooms/${encodeURIComponent(result.roomId)}`);
      }
    } catch (error) {
      setErrors((prev) => ({ ...prev, [invite.id]: friendErrorText(error) }));
    } finally {
      pending.current.delete(invite.id);
      setBusy((prev) => ({ ...prev, [invite.id]: false }));
    }
  }

  async function dismiss(decline: InviteDecline) {
    epoch.current += 1;
    setDeclines((prev) => prev.filter((item) => item.id !== decline.id));
    try {
      await client.ackInviteState(decline.id);
    } catch {
      /* Chưa ack được: lần poll sau sẽ hiện lại và thử ack lần nữa. */
    }
  }

  const live = invites.filter((invite) => Date.parse(invite.expiresAt) > now);
  if (!live.length && !declines.length) return null;

  return (
    <div className="xq-room-invite-stack">
      {live.map((invite) => {
        const seconds = Math.max(
          0,
          Math.ceil((Date.parse(invite.expiresAt) - now) / 1000),
        );
        const isBusy = Boolean(busy[invite.id]);
        return (
          <section
            key={invite.id}
            className="xq-room-invite-popup"
            aria-labelledby={`room-invite-${invite.id}`}
            onKeyDown={(event) => {
              if (event.key === "Escape" && !isBusy) {
                event.stopPropagation();
                void answer(invite, false);
              }
            }}
          >
            <header className="xq-room-invite-popup__header">
              <h2 id={`room-invite-${invite.id}`}>Lời mời vào phòng</h2>
              <button
                type="button"
                className="xq-room-invite-popup__close"
                aria-label="Từ chối lời mời"
                disabled={isBusy}
                onClick={() => void answer(invite, false)}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </header>
            <p>
              Người chơi {invite.inviter.displayName} mời bạn tham gia phòng cờ{" "}
              <strong>{invite.roomName}</strong>. Còn {seconds} giây.
            </p>
            {errors[invite.id] && <p role="alert">{errors[invite.id]}</p>}
            <div className="xq-room-invite-popup__actions">
              <Button
                variant="secondary"
                disabled={isBusy}
                onClick={() => void answer(invite, false)}
              >
                Từ chối
              </Button>
              <Button
                loading={isBusy}
                onClick={() => void answer(invite, true)}
              >
                Tham gia
              </Button>
            </div>
          </section>
        );
      })}
      {declines.map((decline) => (
        <section
          key={decline.id}
          className="xq-room-invite-popup"
          role="status"
        >
          <p>{decline.displayName} đã từ chối lời mời tham gia phòng.</p>
          <div className="xq-room-invite-popup__actions">
            <Button variant="ghost" onClick={() => void dismiss(decline)}>
              Đã hiểu
            </Button>
          </div>
        </section>
      ))}
    </div>
  );
}
