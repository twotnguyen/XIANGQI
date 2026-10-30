import { useEffect, useRef, useState } from "react";
import { ErrorState, Notice, Skeleton } from "../../shared/ui/primitives.js";
import { NavigationLink } from "../../shared/navigation/NavigationLink.js";
import {
  RoomRequestError,
  type RoomClient,
  type RoomEntry,
} from "./room-client.js";
/**
 * Màn hình xử lý tự động vào phòng cờ khi người dùng truy cập qua liên kết mời (mã token 8 chữ số).
 */
export function InviteEntry({
  client,
  code,
  onEntered,
}: {
  client: RoomClient;
  code: string;
  onEntered: (entry: RoomEntry) => void;
}) {
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const epoch = useRef(0);
  const entered = useRef(onEntered);
  entered.current = onEntered;
  const normalizedCode = (code ?? "").trim();
  const valid = /^[0-9]{8}$/.test(normalizedCode);
  useEffect(() => {
    const requestEpoch = ++epoch.current;
    setError("");
    if (valid)
      queueMicrotask(() => {
        if (epoch.current !== requestEpoch) return;
        void Promise.resolve()
          .then(() => client.join(normalizedCode))
          .then(
            (entry) => {
              if (epoch.current === requestEpoch) entered.current(entry);
            },
            (failure: unknown) => {
              if (epoch.current !== requestEpoch) return;
              const msg =
                failure instanceof RoomRequestError
                  ? failure.message
                  : "Chưa thể vào phòng theo lời mời. Kiểm tra kết nối và thử lại.";
              setError(msg);
            },
          );
      });
    return () => {
      epoch.current++;
    };
  }, [client, code, valid, attempt]);
  return (
    <main className="xq-ui xq-room-page">
      <div className="xq-room-form">
        <h1>{error ? "Không thể truy cập phòng" : "Vào phòng được mời"}</h1>
        {!valid ? (
          <Notice
            tone="error"
            message="Đường dẫn mời không hợp lệ. Kiểm tra lại mã phòng từ người mời."
          />
        ) : error ? (
          <ErrorState
            message={error}
            onRetry={() => setAttempt((value) => value + 1)}
          />
        ) : (
          <Skeleton label="Đang vào phòng…" />
        )}
        {(!valid || error) && (
          <NavigationLink href="/lobby">Quay về Sảnh chính</NavigationLink>
        )}
      </div>
    </main>
  );
}
