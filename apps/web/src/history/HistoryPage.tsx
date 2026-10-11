import { useLayoutEffect, useRef, useState } from "react";
import { Button } from "../ui/primitives.js";
import {
  HistoryRequestError,
  type HistoryClient,
  type HistoryCursor,
  type HistoryInput,
  type HistoryItem,
} from "./history-client.js";
import "./history-page.css";
export interface HistoryPageProps {
  client: Pick<HistoryClient, "list">;
  onReplay: (id: string) => void;
}
const filters = [
  ["ALL", "Tất cả"],
  ["CASUAL", "Đánh Thường"],
  ["AI", "Đấu với Máy"],
  ["RANKED", "Đánh Hạng"],
] as const;
const reasons: Record<string, string> = {
  CHECKMATE: "Chiếu hết",
  STALEMATE: "Hết nước đi hợp lệ",
  TIMEOUT: "Hết giờ",
  RESIGN: "Đầu hàng",
  DISCONNECT: "Mất kết nối",
  PERPETUAL_CHECK: "Chiếu liên tục",
  AGREED_DRAW: "Đồng ý hòa",
  DRAW_AGREEMENT: "Đồng ý hòa",
  REPETITION: "Lặp thế ba lần",
  DRAW_REPETITION: "Lặp thế ba lần",
  DRAW_NO_CAPTURE: "120 nửa nước không ăn quân",
  BOTH_OFFLINE: "Hai người mất kết nối",
  SERVER_RESTART: "Máy chủ khởi động lại",
  AI_UNAVAILABLE: "Máy cờ gặp sự cố",
};
interface State {
  client: HistoryPageProps["client"];
  filter: HistoryInput["filter"];
  items: HistoryItem[];
  next: HistoryCursor | null;
  loading: boolean;
  error: string;
}
export function HistoryPage({ client, onReplay }: HistoryPageProps) {
  const [filter, setFilter] =
      useState<NonNullable<HistoryInput["filter"]>>("ALL"),
    [state, setState] = useState<State>({
      client,
      filter: "ALL",
      items: [],
      next: null,
      loading: true,
      error: "",
    });
  const epoch = useRef(0),
    pending = useRef(false),
    lastRequest = useRef<HistoryCursor | undefined>(undefined);
  const visible = state.client === client && state.filter === filter;
  async function load(cursor?: HistoryCursor, token = epoch.current) {
    if (pending.current) return;
    pending.current = true;
    lastRequest.current = cursor;
    setState((s) => ({ ...s, loading: true, error: "" }));
    try {
      const page = await client.list({
        filter,
        limit: 20,
        ...(cursor ? { cursor } : {}),
      });
      if (token !== epoch.current) return;
      setState((s) => {
        if (token !== epoch.current) return s;
        const existing = cursor ? s.items : [];
        const ids = new Set(existing.map((i) => i.id.toLowerCase()));
        if (
          page.items.some((i) => ids.has(i.id.toLowerCase())) ||
          (cursor &&
            page.items.some(
              (i) =>
                i.endedAt > cursor.endedAt ||
                (i.endedAt === cursor.endedAt &&
                  i.id.toLowerCase() >= cursor.matchId.toLowerCase()),
            )) ||
          (cursor &&
            page.nextCursor?.endedAt === cursor.endedAt &&
            page.nextCursor.matchId === cursor.matchId)
        )
          return {
            ...s,
            loading: false,
            error: "Chưa thể tải lịch sử. Vui lòng thử lại.",
          };
        return {
          client,
          filter,
          items: [...existing, ...page.items],
          next: page.nextCursor,
          loading: false,
          error: "",
        };
      });
    } catch (e) {
      if (token !== epoch.current) return;
      const denied =
        e instanceof HistoryRequestError &&
        (e.status === 401 || e.status === 403);
      const error =
        e instanceof HistoryRequestError
          ? e.message
          : "Chưa thể tải lịch sử. Vui lòng thử lại.";
      setState((s) => ({
        ...s,
        items: denied ? [] : s.items,
        next: denied ? null : s.next,
        loading: false,
        error,
      }));
      if (denied) lastRequest.current = undefined;
    } finally {
      if (token === epoch.current) pending.current = false;
    }
  }
  useLayoutEffect(() => {
    const token = ++epoch.current;
    pending.current = false;
    lastRequest.current = undefined;
    setState({
      client,
      filter,
      items: [],
      next: null,
      loading: true,
      error: "",
    });
    void load(undefined, token);
    return () => {
      epoch.current++;
    };
  }, [client, filter]);
  const items = visible ? state.items : [],
    loading = !visible || state.loading,
    error = visible ? state.error : "";
  return (
    <section className="xq-ui xq-history" aria-labelledby="xq-history-title">
      <header>
        <p className="xq-history-eyebrow">Những ván đã qua</p>
        <h1 id="xq-history-title">Lịch sử ván đấu</h1>
        <p>Ván đấu của bạn, kết quả và lý do kết thúc.</p>
      </header>
      <nav aria-label="Bộ lọc lịch sử" className="xq-history-filters">
        {filters.map(([value, label]) => (
          <Button
            key={value}
            variant={filter === value ? "primary" : "secondary"}
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
          >
            {label}
          </Button>
        ))}
      </nav>
      <div aria-busy={loading} className="xq-history-results">
        {loading && <p role="status">Đang tải lịch sử…</p>}
        {error && (
          <div className="xq-history-error">
            <p role="alert">{error}</p>
            <Button
              variant="secondary"
              disabled={loading}
              onClick={() => void load(lastRequest.current)}
            >
              Thử lại
            </Button>
          </div>
        )}
        {!loading && !error && items.length === 0 && (
          <p className="xq-history-empty">Chưa có ván đấu trong bộ lọc này.</p>
        )}
        <ol className="xq-history-list">
          {items.map((item) => (
            <li key={item.id} className="xq-history-row">
              <div>
                <p className="xq-history-type">{item.typeLabel}</p>
                <h2>{item.opponent.displayName}</h2>
                <p>
                  Phe của bạn:{" "}
                  <strong>{item.side === "red" ? "Đỏ" : "Đen"}</strong>
                </p>
                <time dateTime={item.endedAt}>
                  {new Date(item.endedAt).toLocaleString("vi-VN")}
                </time>
              </div>
              <div className="xq-history-result">
                <strong
                  className={`xq-history-${item.result.kind.toLowerCase()}`}
                >
                  {item.result.label}
                </strong>
                <p>{reasons[item.result.reason] ?? "Ván đã kết thúc"}</p>
                {!item.result.countsForWdl && (
                  <p className="xq-history-excluded">
                    Không tính thắng/thua/hòa
                  </p>
                )}
              </div>
              <Button
                variant="secondary"
                onClick={() => onReplay(item.id)}
                aria-label={`Xem lại ván với ${item.opponent.displayName}`}
              >
                Xem lại
              </Button>
            </li>
          ))}
        </ol>
        {visible && state.next && !error && (
          <Button
            variant="secondary"
            loading={loading}
            onClick={() => void load(state.next!)}
          >
            Tải thêm ván
          </Button>
        )}
      </div>
    </section>
  );
}
