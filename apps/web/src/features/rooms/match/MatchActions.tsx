import { useEffect, useRef, useState } from "react";
import type { RoomAction, RoomStateSnapshot } from "@xiangqi/shared";
import { parsePosition } from "@xiangqi/xiangqi-core";
import { Dialog } from "../../../shared/ui/primitives.js";
import "./MatchActions.css";
export type MatchAction = Extract<
  RoomAction,
  {
    type:
      | "match.resign"
      | "match.abort"
      | "match.still-here"
      | "match.draw.offer"
      | "match.draw.withdraw"
      | "match.draw.respond"
      | "match.undo.offer"
      | "match.undo.withdraw"
      | "match.undo.respond";
  }
>;
export interface MatchActionsProps {
  match: RoomStateSnapshot["match"];
  kind?: "CUSTOM" | "CASUAL" | "RANKED";
  role: RoomStateSnapshot["role"];
  draw: RoomStateSnapshot["draw"];
  undo?: RoomStateSnapshot["undo"];
  serverNow: string;
  canAct: boolean;
  busy?: boolean;
  error?: string;
  onAction: (action: MatchAction) => Promise<void>;
}
function time(ms: number) {
  const seconds = Math.ceil(Math.max(0, ms) / 1000);
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

/**
 * Component hiển thị các thao tác người chơi trong ván cờ đang diễn ra (Match Actions):
 * - Đầu hàng (kèm popup xác nhận nguy cơ thua ngay).
 * - Xin hòa (kiểm tra điều kiện cooldown nước đi, hiển thị đồng hồ đếm ngược đề nghị, cho phép rút đề nghị).
 * - Phản hồi lời xin hòa của đối thủ (Đồng ý hoặc Từ chối).
 */
export function MatchActions({
  match,
  kind = "CUSTOM",
  role,
  draw,
  undo,
  serverNow,
  canAct,
  busy = false,
  error,
  onAction,
}: MatchActionsProps) {
  const active = match?.status === "ACTIVE" && role !== "spectator";
  const generation = `${match?.id}/${match?.status}/${role}`;
  const epoch = useRef(0),
    inFlight = useRef(false);
  const [pending, setPending] = useState(false),
    [notice, setNotice] = useState(""),
    [confirm, setConfirm] = useState<"resign" | "abort" | null>(null),
    [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const offers = active
    ? [
        ...(draw?.offers ?? []).map((offer) => ({
          ...offer,
          kind: "draw" as const,
        })),
        ...(kind === "RANKED" ? [] : (undo?.offers ?? [])).map((offer) => ({
          ...offer,
          kind: "undo" as const,
        })),
      ]
    : [];
  const previousOffers = useRef<{
    matchId: string;
    version: number;
    offers: typeof offers;
  }>({ matchId: "", version: -1, offers: [] });
  useEffect(() => {
    const previous = previousOffers.current;
    if (
      match &&
      previous.matchId === match.id &&
      match.lastMove &&
      match.lastMove.eventVersion > previous.version &&
      match.turn === role
    ) {
      const declined = previous.offers.find(
        (offer) =>
          offer.sender === role &&
          !offers.some((current) => current.id === offer.id),
      );
      if (declined) setNotice("Đối thủ đã đi nước, đề nghị bị từ chối.");
    }
    previousOffers.current = {
      matchId: match?.id ?? "",
      version: match?.version ?? -1,
      offers,
    };
  }, [
    match?.id,
    match?.version,
    match?.lastMove?.eventVersion,
    role,
    draw,
    undo,
  ]);
  const clockKey = offers.length
    ? `${match?.id}/${serverNow}/${offers
        .map((o) => `${o.id}:${o.expiresAt}`)
        .sort()
        .join(",")}`
    : null;
  const [sample, setSample] = useState(() => {
    const now = performance.now();
    return { key: clockKey, receivedAt: now, now };
  });
  useEffect(() => {
    epoch.current++;
    inFlight.current = false;
    setPending(false);
    setNotice("");
    setConfirm(null);
    setCollapsed(new Set());
  }, [generation]);
  useEffect(() => {
    if (!canAct) {
      epoch.current++;
      inFlight.current = false;
      setPending(false);
      setNotice("");
      setConfirm(null);
    }
  }, [canAct]);
  useEffect(() => {
    const now = performance.now();
    setSample({ key: clockKey, receivedAt: now, now });
    if (!clockKey) return;
    const redraw = () =>
      setSample((prior) => ({ ...prior, now: performance.now() }));
    const handle = window.setInterval(redraw, 200);
    document.addEventListener("visibilitychange", redraw);
    return () => {
      window.clearInterval(handle);
      document.removeEventListener("visibilitychange", redraw);
    };
  }, [clockKey]);
  const elapsed =
    sample.key === clockKey ? Math.max(0, sample.now - sample.receivedAt) : 0;
  const remaining = (expiresAt: string) =>
    Math.max(0, Date.parse(expiresAt) - Date.parse(serverNow) - elapsed);
  const working = busy || pending;
  let rankedDrawReady = kind !== "RANKED";
  if (kind === "RANKED" && match) {
    try {
      rankedDrawReady = parsePosition(match.position).fullmove >= 21;
    } catch {
      rankedDrawReady = false;
    }
  }
  async function send(action: MatchAction) {
    if (
      !active ||
      !canAct ||
      busy ||
      inFlight.current ||
      (kind === "RANKED" && (action.type === "match.abort" || action.type.startsWith("match.undo.") || (action.type === "match.draw.offer" && !rankedDrawReady))) ||
      !match ||
      action.payload.matchId !== match.id
    )
      return;
    const at = epoch.current;
    inFlight.current = true;
    setPending(true);
    setNotice("");
    try {
      await onAction(action);
      if (epoch.current === at) setConfirm(null);
    } catch {
      if (epoch.current === at) {
        setConfirm(null);
        setNotice(
          "Chưa thể thực hiện thao tác. Kiểm tra trạng thái mới rồi thử lại.",
        );
      }
    } finally {
      if (epoch.current === at) {
        inFlight.current = false;
        setPending(false);
      }
    }
  }
  if (!active || !match) return null;
  const ownPending = offers.some((o) => o.sender === role),
    cooldown = draw?.remainingMoves[role] ?? 0;
  const undoReason = !canAct
    ? "Kết nối hoặc quyền điều khiển chưa sẵn sàng."
    : !undo
      ? "Xin đi lại chưa sẵn sàng."
      : !undo.moved[role]
        ? "Bạn chưa đi nước nào."
        : ownPending
          ? "Đang chờ trả lời đề nghị trước."
          : undo.used[role] >= 3
            ? "Bạn đã sử dụng hết 3 lượt xin đi lại trong ván này."
            : undo.remainingMoves[role] > 0
              ? `Cần đi thêm ${undo.remainingMoves[role]} nước của bạn để xin đi lại.`
              : null;
  const reason = !canAct
    ? "Kết nối hoặc quyền điều khiển chưa sẵn sàng."
    : !draw
      ? "Xin hòa chưa sẵn sàng trong phòng này."
      : !rankedDrawReady
        ? "Mỗi bên phải đi ít nhất 20 nước để xin hòa."
        : ownPending
          ? "Đang chờ trả lời đề nghị trước."
        : cooldown > 0
          ? `Cần đi thêm ${cooldown} nước của bạn để xin hòa lại.`
          : null;
  const payload = { matchId: match.id, matchVersion: match.version };
  return (
    <section className="xq-ui match-actions" aria-label="Thao tác ván cờ">
      <div className="match-actions__buttons">
        <button
          type="button"
          className="xq-button xq-button-danger"
          disabled={!canAct || working}
          onClick={() => setConfirm("resign")}
        >
          Đầu hàng
        </button>
        {/* Hủy ván chỉ khi chưa có nước đi nào; máy chủ kiểm lại dưới khóa. */}
        {kind !== "RANKED" && match.canAbort && (
          <button
            type="button"
            className="xq-button xq-button-secondary"
            disabled={!canAct || working}
            onClick={() => setConfirm("abort")}
          >
            Hủy ván
          </button>
        )}
        <button
          type="button"
          className="xq-button xq-button-secondary"
          disabled={Boolean(reason) || working}
          aria-describedby={reason ? `${match.id}-draw-reason` : undefined}
          onClick={() => {
            void send({ type: "match.draw.offer", payload });
          }}
        >
          Xin hòa
        </button>
        {kind !== "RANKED" && (
        <button
          type="button"
          className="xq-button xq-button-secondary"
          disabled={Boolean(undoReason) || working}
          aria-describedby={
            undoReason
              ? `${match.id}-${undoReason === reason ? "draw" : "undo"}-reason`
              : undefined
          }
          onClick={() => {
            void send({ type: "match.undo.offer", payload });
          }}
        >
          Xin đi lại
        </button>
        )}
      </div>
      {reason && (
        <p id={`${match.id}-draw-reason`} className="match-actions__help">
          {reason}
        </p>
      )}
      {kind !== "RANKED" && undoReason && undoReason !== reason && (
        <p id={`${match.id}-undo-reason`} className="match-actions__help">
          {undoReason}
        </p>
      )}
      {(error || notice) && <p role="alert">{error || notice}</p>}
      {working && <p role="status">Đang chờ máy chủ xác nhận…</p>}
      <div className="match-actions__proposals">
        {offers.map((offer) => {
          const own = offer.sender === role,
            hidden = collapsed.has(offer.id),
            left = remaining(offer.expiresAt);
          return (
            <section
              key={offer.id}
              className="match-actions__proposal"
              role="group"
              aria-label={
                offer.kind === "draw"
                  ? own
                    ? "Đề nghị hòa của bạn"
                    : "Đề nghị hòa của đối thủ"
                  : own
                    ? "Đề nghị đi lại của bạn"
                    : "Đề nghị đi lại của đối thủ"
              }
              onKeyDown={(event) => {
                if (event.key === "Escape" && !hidden && left > 0) {
                  event.preventDefault();
                  event.stopPropagation();
                  event.currentTarget
                    .querySelector<HTMLButtonElement>("[data-collapse]")
                    ?.focus();
                  setCollapsed((prior) => new Set([...prior, offer.id]));
                }
              }}
            >
              {left <= 0 ? (
                <p role="status">
                  Đề nghị đã hết hạn. Đang chờ máy chủ cập nhật.
                </p>
              ) : (
                <>
                  <header>
                    <h3>
                      {own ? "Bạn đang xin" : "Đối thủ xin"}{" "}
                      {offer.kind === "undo" ? "đi lại" : "hòa"}
                    </h3>
                    <button
                      data-collapse
                      type="button"
                      className="xq-button xq-button-ghost"
                      aria-expanded={!hidden}
                      aria-label={
                        offer.kind === "draw"
                          ? hidden
                            ? "Mở đề nghị hòa"
                            : "Thu gọn đề nghị hòa"
                          : hidden
                            ? "Mở đề nghị đi lại"
                            : "Thu gọn đề nghị đi lại"
                      }
                      onClick={() =>
                        setCollapsed((prior) => {
                          const next = new Set(prior);
                          if (hidden) next.delete(offer.id);
                          else next.add(offer.id);
                          return next;
                        })
                      }
                    >
                      {hidden ? "Mở lại" : "×"}
                    </button>
                  </header>
                  {!hidden && (
                    <>
                      <span
                        role="timer"
                        aria-live="off"
                        className="match-actions__time"
                      >
                        Còn {time(left)}
                      </span>
                      {own ? (
                        <>
                          <p>Đang chờ đối thủ trả lời…</p>
                          <button
                            type="button"
                            className="xq-button xq-button-secondary"
                            disabled={!canAct || working}
                            onClick={() => {
                              void send({
                                type:
                                  offer.kind === "undo"
                                    ? "match.undo.withdraw"
                                    : "match.draw.withdraw",
                                payload: { ...payload, offerId: offer.id },
                              });
                            }}
                          >
                            Rút đề nghị
                          </button>
                        </>
                      ) : (
                        <div className="match-actions__buttons">
                          <button
                            type="button"
                            className="xq-button xq-button-secondary"
                            disabled={!canAct || working}
                            onClick={() => {
                              void send({
                                type:
                                  offer.kind === "undo"
                                    ? "match.undo.respond"
                                    : "match.draw.respond",
                                payload: {
                                  ...payload,
                                  offerId: offer.id,
                                  accept: false,
                                },
                              });
                            }}
                          >
                            Từ chối
                          </button>
                          <button
                            type="button"
                            className="xq-button xq-button-primary"
                            disabled={!canAct || working}
                            onClick={() => {
                              void send({
                                type:
                                  offer.kind === "undo"
                                    ? "match.undo.respond"
                                    : "match.draw.respond",
                                payload: {
                                  ...payload,
                                  offerId: offer.id,
                                  accept: true,
                                },
                              });
                            }}
                          >
                            Đồng ý
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </section>
          );
        })}
      </div>
      <fieldset className="match-actions__confirmation" disabled={working}>
        <Dialog
          open={confirm === "resign" && canAct}
          onClose={() => {
            if (!inFlight.current && !busy) setConfirm(null);
          }}
          title="Đầu hàng?"
          danger
          onConfirm={() => {
            if (confirm === "resign")
              void send({ type: "match.resign", payload });
          }}
          confirmLabel="Đầu hàng"
        >
          <p>
            <strong>Bạn sẽ thua ván này ngay lập tức.</strong>
          </p>
        </Dialog>
        <Dialog
          open={confirm === "abort" && canAct}
          onClose={() => {
            if (!inFlight.current && !busy) setConfirm(null);
          }}
          title="Hủy ván?"
          danger
          onConfirm={() => {
            if (confirm === "abort")
              void send({ type: "match.abort", payload });
          }}
          confirmLabel="Hủy ván"
          cancelLabel="Giữ ván"
        >
          <p>
            Ván kết thúc ngay, không ai thắng hay thua và không cần đối thủ đồng
            ý. Chỉ hủy được khi chưa có nước đi nào.
          </p>
        </Dialog>
      </fieldset>
    </section>
  );
}
