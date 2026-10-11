import { useEffect, useId, useRef } from "react";
import type { RoomStateSnapshot } from "@xiangqi/shared";
import "../styles/tokens.css";
import "./MatchResult.css";

export interface MatchResultProps {
  match: RoomStateSnapshot["match"];
  role: RoomStateSnapshot["role"];
  onStay: () => void;
  onLeave: () => void;
  leaving?: boolean;
  error?: string;
}
const reasons: Readonly<Record<string, string>> = {
  CHECKMATE: "Chiếu hết",
  STALEMATE: "Hết nước đi",
  RESIGN: "Đầu hàng",
  TIMEOUT: "Hết giờ",
  DISCONNECT: "Mất kết nối",
  DRAW_REPETITION: "Lặp thế cờ ba lần",
  DRAW_AGREEMENT: "Thoả thuận hoà",
  DRAW_NO_CAPTURE: "120 nửa nước không ăn quân",
  PERPETUAL_CHECK: "Chiếu liên tục",
};
const draws = new Set([
  "DRAW_REPETITION",
  "DRAW_AGREEMENT",
  "DRAW_NO_CAPTURE",
  "PERPETUAL_CHECK",
]);

export function MatchResult({
  match,
  role,
  onStay,
  onLeave,
  leaving = false,
  error = "",
}: MatchResultProps) {
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const stay = useRef<HTMLButtonElement>(null);
  const leave = useRef<HTMLButtonElement>(null);
  const terminal = Boolean(match && match.status !== "ACTIVE");
  const player = role !== "spectator";
  useEffect(() => {
    const element = dialog.current;
    if (!terminal || !player || !element) return;
    const priorFocus = document.activeElement as HTMLElement | null;
    element.showModal();
    stay.current?.focus();
    return () => {
      element.close();
      if (priorFocus?.isConnected) priorFocus.focus();
    };
  }, [match?.id, terminal, player]);
  if (!match || !terminal) return null;

  const interrupted =
    match.status === "INTERRUPTED" || match.result === "SERVER_RESTART";
  const title = interrupted
    ? "Ván bị gián đoạn"
    : match.winner
      ? player
        ? match.winner === role
          ? "Bạn thắng!"
          : "Bạn thua"
        : match.winner === "red"
          ? "Đỏ thắng"
          : "Đen thắng"
      : draws.has(match.result ?? "")
        ? "Hoà"
        : "Kết quả ván cờ";
  const reason = interrupted
    ? "Máy chủ đã khởi động lại."
    : Object.hasOwn(reasons, match.result ?? "")
      ? reasons[match.result!]
      : "Lý do kết thúc chưa được đồng bộ.";
  const content = (
    <>
      <h2 id={`${id}-title`}>{title}</h2>
      <div id={`${id}-reason`}>
        <p>{reason}</p>
        {interrupted && <p>Ván cờ không được tính kết quả.</p>}
      </div>
    </>
  );
  if (!player)
    return (
      <section
        className="xq-ui match-result match-result--spectator"
        aria-label="Kết quả ván cờ"
      >
        {content}
      </section>
    );
  return (
    <dialog
      ref={dialog}
      className="xq-ui match-result"
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-reason`}
      onCancel={(event) => event.preventDefault()}
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        if (event.shiftKey && document.activeElement === stay.current) {
          event.preventDefault();
          leave.current?.focus();
        } else if (
          !event.shiftKey &&
          document.activeElement === leave.current
        ) {
          event.preventDefault();
          stay.current?.focus();
        }
      }}
    >
      {content}
      {error && <p role="alert">{error}</p>}
      <footer className="match-result__actions">
        <button
          ref={stay}
          type="button"
          aria-disabled={leaving}
          onClick={() => {
            if (!leaving) onStay();
          }}
        >
          Ở lại phòng
        </button>
        <button
          ref={leave}
          type="button"
          aria-disabled={leaving}
          aria-busy={leaving}
          onClick={() => {
            if (!leaving) onLeave();
          }}
        >
          Rời phòng
        </button>
      </footer>
    </dialog>
  );
}
