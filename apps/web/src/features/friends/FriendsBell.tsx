import { useEffect, useState } from "react";
import { Badge } from "../../shared/ui/primitives.js";
import type { FriendClient } from "./friend-client.js";

export function FriendsBell({ client }: { client: FriendClient }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let alive = true;
    async function poll() {
      if (!alive) return;
      try {
        const pending = await client.requests();
        if (alive)
          setCount(pending.filter((r) => r.direction === "incoming").length);
      } catch {
        /* Chuong im lang khi mang loi; trang chinh van bao loi. */
      }
    }
    queueMicrotask(() => void poll());
    const timer = setInterval(poll, 15000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [client]);
  return (
    <a
      href="/friends"
      className="xq-friends-bell"
      aria-label={count ? `${count} lời mời kết bạn` : "Bạn bè"}
      title={count ? `${count} lời mời kết bạn` : "Thông báo kết bạn"}
    >
      <span aria-hidden="true">🔔</span>
      <Badge count={count} label="lời mời kết bạn" />
    </a>
  );
}
