import { useEffect, useRef, useState } from "react";
import { ErrorState, Notice, Skeleton } from "../../shared/ui/primitives.js";
import {
  RoomRequestError,
  type RoomClient,
  type RoomEntry,
} from "./room-client.js";
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
  const valid = /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8}$/.test(code);
  useEffect(() => {
    const requestEpoch = ++epoch.current;
    setError("");
    if (valid)
      queueMicrotask(() => {
        if (epoch.current !== requestEpoch) return;
        void Promise.resolve().then(() => client.join(code)).then(
          (entry) => {
            if (epoch.current === requestEpoch) entered.current(entry);
          },
          (failure: unknown) => {
            if (epoch.current !== requestEpoch) return;
            const msg =
              failure instanceof RoomRequestError ||
              (typeof failure === "object" && failure !== null && "code" in failure && typeof (failure as Record<string, unknown>).message === "string")
                ? String((failure as Record<string, unknown>).message)
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
        <h1>Vào phòng được mời</h1>
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
      </div>
    </main>
  );
}
