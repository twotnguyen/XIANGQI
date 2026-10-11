import { useEffect, useRef, useState } from "react";
import type { RoomAction, RoomStateSnapshot } from "@xiangqi/shared";
import { Dialog } from "../ui/primitives.js";
import "./MatchActions.css";
export type MatchAction = Extract<
  RoomAction,
  {
    type:
      | "match.resign"
      | "match.draw.offer"
      | "match.draw.withdraw"
      | "match.draw.respond";
  }
>;
export interface MatchActionsProps {
  match: RoomStateSnapshot["match"];
  role: RoomStateSnapshot["role"];
  draw: RoomStateSnapshot["draw"];
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
export function MatchActions({
  match,
  role,
  draw,
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
    [confirm, setConfirm] = useState<string | null>(null),
    [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const offers = active ? (draw?.offers ?? []) : [];
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
  async function send(action: MatchAction) {
    if (
      !active ||
      !canAct ||
      busy ||
      inFlight.current ||
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
  const reason = !canAct
    ? "Kết nối hoặc quyền điều khiển chưa sẵn sàng."
    : !draw
      ? "Xin hòa chưa sẵn sàng trong phòng này."
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
          onClick={() => setConfirm(match.id)}
        >
          Đầu hàng
        </button>
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
      </div>
      {reason && (
        <p id={`${match.id}-draw-reason`} className="match-actions__help">
          {reason}
        </p>
      )}
      {(error || notice) && <p role="alert">{error || notice}</p>}
      {working && <p role="status">Đang chờ máy chủ xác nhận…</p>}
      {offers.map((offer) => {
        const own = offer.sender === role,
          hidden = collapsed.has(offer.id),
          left = remaining(offer.expiresAt);
        return (
          <section
            key={offer.id}
            className="match-actions__proposal"
            role="group"
            aria-label={own ? "Đề nghị hòa của bạn" : "Đề nghị hòa của đối thủ"}
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
                  <h3>{own ? "Bạn đang xin hòa" : "Đối thủ xin hòa"}</h3>
                  <button
                    data-collapse
                    type="button"
                    className="xq-button xq-button-ghost"
                    aria-expanded={!hidden}
                    aria-label={
                      hidden ? "Mở đề nghị hòa" : "Thu gọn đề nghị hòa"
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
                              type: "match.draw.withdraw",
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
                              type: "match.draw.respond",
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
                              type: "match.draw.respond",
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
      <fieldset className="match-actions__confirmation" disabled={working}>
        <Dialog
          open={confirm === match.id && canAct}
          onClose={() => {
            if (!inFlight.current && !busy) setConfirm(null);
          }}
          title="Đầu hàng?"
          danger
          onConfirm={() => {
            if (confirm === match.id)
              void send({ type: "match.resign", payload });
          }}
          confirmLabel="Đầu hàng"
        >
          <p>
            <strong>Bạn sẽ thua ván này ngay lập tức.</strong>
          </p>
        </Dialog>
      </fieldset>
    </section>
  );
}
