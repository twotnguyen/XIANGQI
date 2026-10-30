import { useEffect, useRef, useState } from "react";
import { Button, ErrorState } from "../../shared/ui/primitives.js";
import {
  friendErrorText,
  type FriendClient,
  type FriendPeer,
  type InviteDecline,
} from "./friend-client.js";

const POLL_MS = 2000;
const TICK_MS = 1000;
const STATUS_LABEL = {
  online: "Trực tuyến",
  "in-match": "Đang đấu",
  offline: "Ngoại tuyến",
} as const;

/**
 * Danh sách bạn bè để mời vào phòng hiện tại. Chỉ mời được người đang trực tuyến và không trong cooldown.
 */
export function RoomFriendInvite({
  client,
  roomId,
}: {
  client: FriendClient;
  roomId: string;
}) {
  const [friends, setFriends] = useState<FriendPeer[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [sending, setSending] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");
  const epoch = useRef(0);
  const [declines, setDeclines] = useState<InviteDecline[]>([]);
  const inFlight = useRef(false);

  useEffect(() => {
    let active = true;
    const poll = async () => {
      if (inFlight.current) return;
      inFlight.current = true;
      const started = epoch.current;
      try {
        const [nextFriends, state] = await Promise.all([
          client.list(),
          client.inviteState(),
        ]);
        if (active && started === epoch.current) {
          setFriends(nextFriends);
          setCooldownUntil(state.cooldownUntil);
          setNow(Date.now());
          setLoadFailed(false);
          setDeclines(state.declines);
        }
      } catch {
        if (active) setLoadFailed(true);
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

  const cooling = cooldownUntil !== null && Date.parse(cooldownUntil) > now;
  useEffect(() => {
    if (!cooling) return;
    const clock = window.setInterval(() => setNow(Date.now()), TICK_MS);
    return () => window.clearInterval(clock);
  }, [cooling]);

  async function send(friend: FriendPeer) {
    if (sending) return;
    setSending(friend.userId);
    setNotice("");
    setErrors((prev) => ({ ...prev, [friend.userId]: "" }));
    try {
      const sent = await client.invite(roomId, friend.username);
      epoch.current += 1;
      setCooldownUntil(sent.cooldownUntil);
      setNotice(`Đã gửi lời mời tới ${friend.displayName}.`);
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        [friend.userId]: friendErrorText(error),
      }));
    } finally {
      setSending(null);
    }
  }

  if (loadFailed && !friends)
    return (
      <ErrorState
        message="Chưa tải được danh sách bạn bè."
        onRetry={() => setLoadFailed(false)}
      />
    );
  if (!friends)
    return <p className="xq-room-friend-invite__hint">Đang tải bạn bè…</p>;
  if (!friends.length)
    return (
      <p className="xq-room-friend-invite__hint">Chưa có bạn bè để mời.</p>
    );

  const seconds = cooling
    ? Math.ceil((Date.parse(cooldownUntil!) - now) / 1000)
    : 0;
  return (
    <div className="xq-room-friend-invite">
      {cooling && (
        <p className="xq-room-friend-invite__hint" role="status">
          Bạn có thể mời tiếp sau {seconds} giây.
        </p>
      )}
      {notice && (
        <p className="xq-room-friend-invite__hint" role="status">
          {notice}
        </p>
      )}
      {declines.map((decline) => (
        <p
          key={decline.id}
          className="xq-room-friend-invite__hint"
          role="status"
        >
          {decline.displayName} đã từ chối lời mời tham gia phòng.
        </p>
      ))}
      <ul className="xq-room-friend-invite__list">
        {friends.map((friend) => {
          const reason =
            friend.status === "online"
              ? cooling
                ? "Đang trong thời gian chờ mời."
                : undefined
              : friend.status === "in-match"
                ? "Bạn bè đang trong ván khác"
                : "Ngoại tuyến";
          return (
            <li key={friend.userId} className="xq-room-friend-invite__item">
              <div className="xq-room-friend-invite__who">
                <span className="xq-room-friend-invite__name">
                  {friend.displayName}
                </span>
                <span className="xq-room-friend-invite__status">
                  {STATUS_LABEL[friend.status]}
                </span>
                {errors[friend.userId] && (
                  <span className="xq-room-friend-invite__error" role="alert">
                    {errors[friend.userId]}
                  </span>
                )}
              </div>
              <Button
                variant="secondary"
                loading={sending === friend.userId}
                disabledReason={reason}
                disabled={Boolean(reason) || sending !== null}
                onClick={() => void send(friend)}
              >
                Mời
              </Button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
