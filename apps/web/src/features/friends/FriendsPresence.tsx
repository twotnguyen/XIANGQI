import { useEffect, useRef, useState } from "react";
import type { FriendClient } from "./friend-client";

const HEARTBEAT_MS = 2000;

/**
 * Gửi heartbeat presence cho từng tab đang mở (lease phía server 8s). Không hiển thị gì.
 */
export function FriendsPresence({ client }: { client: FriendClient }) {
  const [connectionId] = useState(() => crypto.randomUUID());
  const inFlight = useRef(false);

  useEffect(() => {
    let active = true;
    const beat = async () => {
      if (inFlight.current) return;
      inFlight.current = true;
      try {
        await client.presence(connectionId);
      } catch {
        /* Heartbeat lỗi tạm thời; lần sau thử lại. */
      } finally {
        inFlight.current = false;
      }
    };
    void beat();
    const timer = window.setInterval(() => {
      if (active) void beat();
    }, HEARTBEAT_MS);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [client, connectionId]);

  return null;
}
