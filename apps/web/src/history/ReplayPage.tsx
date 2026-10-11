import { useLayoutEffect, useRef, useState } from "react";
import {
  ReplayRequestError,
  type ReplayClient,
  type ReplayRecord,
} from "./replay-client.js";
import { ReplayViewer } from "./ReplayViewer.js";
import { replayMoveLabels } from "./replay-notation.js";
import { NavigationLink } from "../routing/NavigationLink.js";
import { ErrorState } from "../ui/primitives.js";
export function ReplayPage({
  client,
  id,
}: {
  client: ReplayClient;
  id: string;
}) {
  const epoch = useRef(0),
    [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<{
    client: ReplayClient;
    id: string;
    record: ReplayRecord | null;
    error: string;
    loading: boolean;
  }>({ client, id, record: null, error: "", loading: true });
  useLayoutEffect(() => {
    const token = ++epoch.current;
    setState({ client, id, record: null, error: "", loading: true });
    void client.read(id).then(
      (record) => {
        if (epoch.current === token)
          setState({ client, id, record, error: "", loading: false });
      },
      (error) => {
        if (epoch.current === token)
          setState({
            client,
            id,
            record: null,
            error:
              error instanceof ReplayRequestError
                ? error.message
                : "Chưa thể tải ván xem lại. Vui lòng thử lại.",
            loading: false,
          });
      },
    );
    return () => {
      epoch.current++;
    };
  }, [client, id, attempt]);
  const visible = state.client === client && state.id === id;
  const record = visible ? state.record : null;
  return (
    <section className="xq-panel xq-stack xq-replay-page">
      <header>
        <h1>Xem lại ván đấu</h1>
        <p>Theo dõi lại diễn biến ván đấu.</p>
        <NavigationLink href="/history">Về lịch sử</NavigationLink>
      </header>
      {(!visible || state.loading) && (
        <p role="status">Đang tải ván xem lại…</p>
      )}
      {visible && state.error && (
        <ErrorState
          message={state.error}
          onRetry={() => setAttempt((n) => n + 1)}
        />
      )}
      {record && (
        <ReplayViewer record={record} moveLabels={replayMoveLabels(record)} />
      )}
    </section>
  );
}
