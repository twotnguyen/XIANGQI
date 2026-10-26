import { useEffect, useState } from "react";
import { navigate } from "../../shared/navigation/navigation.js";
import { Button } from "../../shared/ui/primitives.js";
import {
  FriendRequestError,
  type FriendClient,
  type RoomInvite,
} from "./friend-client.js";
/**
 * Hộp thông báo popup hiển thị lời mời vào phòng cờ từ bạn bè (kèm đếm ngược thời gian chấp nhận/từ chối).
 */
export function RoomInvitePopup({ client }: { client: FriendClient }) {
  const [invites, setInvites] = useState<RoomInvite[] | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let alive = true;
    async function poll() {
      if (!alive) return;
      try {
        const list = await client.invites();
        if (alive) setInvites(list);
      } catch {
        if (alive) setInvites((previous) => previous ?? []);
      }
    }
    queueMicrotask(() => void poll());
    const timer = setInterval(poll, 5000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [client]);

  useEffect(() => {
    if (
      !invites ||
      !invites.some((invite) => Date.parse(invite.expiresAt) > Date.now())
    )
      return;
    setNow(Date.now());
    const clock = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(clock);
  }, [invites]);
  if (!invites) return null;
  const live = invites.filter((invite) => Date.parse(invite.expiresAt) > now);
  if (!live.length) return null;
  const invite = live[0]!;
  const seconds = Math.max(
    0,
    Math.ceil((Date.parse(invite.expiresAt) - now) / 1000),
  );
  async function answer(accept: boolean) {
    if (busy) return;
    setBusy(invite.id);
    setError("");
    try {
      const result = await client.respondInvite(invite.id, accept);
      setInvites((previous) =>
        (previous ?? []).filter((item) => item.id !== invite.id),
      );
      if (accept && result.code) navigate(`/rooms/join?token=${result.code}`);
    } catch (failure) {
      setError(
        failure instanceof FriendRequestError
          ? failure.code === "FRIEND_BUSY"
            ? "Bạn đang ở trong một ván/phòng khác."
            : failure.code === "FRIEND_INVITE_REVOKED"
              ? "Phòng đã khoá lời mời này."
              : "Lời mời đã hết hiệu lực."
          : "Chưa thể trả lời. Vui lòng thử lại.",
      );
    } finally {
      setBusy(null);
    }
  }
  return (
    <section role="dialog" aria-label="Lời mời vào phòng">
      <p>
        Người chơi {invite.inviter.displayName} (@{invite.inviter.username}) mời
        bạn tham gia phòng cờ {invite.roomName}. Còn {seconds} giây.
      </p>
      <Button loading={busy === invite.id} onClick={() => void answer(true)}>
        Tham gia
      </Button>{" "}
      <Button
        variant="secondary"
        loading={busy === invite.id}
        onClick={() => void answer(false)}
      >
        Từ chối
      </Button>
      {error && (
        <p role="alert" aria-live="assertive">
          {error}
        </p>
      )}
    </section>
  );
}
