import { useEffect, useRef, useState } from "react";
import { navigate } from "../../shared/navigation/navigation.js";
import { Badge } from "../../shared/ui/primitives.js";
import type { FriendClient } from "./friend-client.js";

const POLL_MS = 2000;

/**
 * Chuông hiển thị số lời mời kết bạn đến đang chờ; bấm mở tab lời mời trong trang bạn bè.
 */
export function FriendsBell({ client }: { client: FriendClient }) {
  const [count, setCount] = useState(0);
  const inFlight = useRef(false);

  useEffect(() => {
    let active = true;
    const poll = async () => {
      if (inFlight.current) return;
      inFlight.current = true;
      try {
        const pending = await client.requests();
        if (active)
          setCount(pending.filter((r) => r.direction === "incoming").length);
      } catch {
        /* Chuông im lặng khi mạng lỗi; trang bạn bè vẫn báo lỗi chi tiết. */
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

  const label = count ? `${count} lời mời kết bạn` : "Bạn bè";
  return (
    <a
      href="/friends?tab=requests"
      className="xq-friends-bell"
      aria-label={label}
      title={label}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
          return;
        event.preventDefault();
        navigate("/friends?tab=requests");
      }}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6" />
        <path d="M10 19a2 2 0 0 0 4 0" />
      </svg>
      <Badge count={count} label="lời mời kết bạn" />
    </a>
  );
}
