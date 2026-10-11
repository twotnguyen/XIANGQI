import {
  parsePosition,
  type MatchEnding,
  type Move,
  type Side,
} from "@xiangqi/xiangqi-core";
import { XiangqiBoard } from "../components/XiangqiBoard.js";
import { useEffect, useRef, useState } from "react";
import { Button, Dialog } from "../ui/primitives.js";
import "./ai-game.css";
export interface AiGameSnapshot {
  id: string;
  requestedSide: Side | "random";
  actualSide: Side;
  level: "easy" | "medium" | "hard";
  position: string;
  history: string[];
  version: number;
  status: "ACTIVE" | "FINALIZING" | "FINISHED" | "ABANDONED";
  engineState: "IDLE" | "THINKING" | "RETRY";
  engineError: "ENGINE_TIMEOUT" | "ENGINE_BUSY" | null;
  outcome:
    | MatchEnding
    | { reason: "RESIGN"; winner: Side }
    | { reason: "ENGINE_FAILURE"; winner: null }
    | null;
}
export interface AiGameProps {
  snapshot: AiGameSnapshot;
  connected: boolean;
  canControl: boolean;
  pending?: boolean;
  undoRemaining?: number;
  onMove: (move: Move) => Promise<void>;
  onResign: () => Promise<void>;
  onRetry: () => Promise<void>;
  onUndo?: () => Promise<void>;
  onNewGame: (setup: {
    level: AiGameSnapshot["level"];
    requestedSide: AiGameSnapshot["requestedSide"];
  }) => void;
  onLobby: () => void;
}
export function AiGame(props: AiGameProps) {
  return (
    <AiGameView
      key={`${props.snapshot.id}/${props.connected}/${props.canControl}`}
      {...props}
    />
  );
}
function AiGameView(props: AiGameProps) {
  const { snapshot, connected, canControl, pending = false } = props;
  const [working, setWorking] = useState(false),
    [error, setError] = useState(""),
    [confirm, setConfirm] = useState(false),
    [resultDismissed, setResultDismissed] = useState(false);
  const alive = useRef(true),
    inFlight = useRef(false);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  const active = snapshot.status === "ACTIVE";
  const available = connected && canControl && !pending && !working;
  const ownMoveExists = snapshot.history
    .slice(0, -1)
    .some((fen) => parsePosition(fen).turn === snapshot.actualSide);
  const undoReason = !active
    ? "Ván đã kết thúc"
    : !ownMoveExists
      ? "Chưa có nước nào của bạn để đi lại"
      : props.undoRemaining === 0
        ? "Đã dùng hết 3 lượt đi lại"
        : "";
  const result = snapshot.status === "FINISHED" && snapshot.outcome;
  const resultTitle = result
    ? result.winner === null
      ? "Hòa"
      : result.winner === snapshot.actualSide
        ? "Bạn thắng!"
        : "Bạn thua"
    : "";
  const reason =
    snapshot.outcome &&
    {
      CHECKMATE: "Chiếu hết",
      STALEMATE: "Hết nước đi hợp lệ",
      PERPETUAL_CHECK: "Chiếu liên tục",
      DRAW_REPETITION: "Lặp thế ba lần",
      DRAW_NO_CAPTURE: "120 nửa nước không ăn quân",
      RESIGN: "Đầu hàng",
      ENGINE_FAILURE: "Máy cờ gặp sự cố",
    }[snapshot.outcome.reason];
  const resultActions = (
    <div className="xq-ai-actions">
      <Button
        disabled={!available}
        onClick={() =>
          props.onNewGame({
            level: snapshot.level,
            requestedSide: snapshot.requestedSide,
          })
        }
      >
        Ván mới
      </Button>
      <Button variant="secondary" onClick={props.onLobby}>
        Về Sảnh
      </Button>
    </div>
  );
  async function request(action: () => Promise<void>) {
    if (!available || inFlight.current) return;
    inFlight.current = true;
    setWorking(true);
    setError("");
    try {
      await action();
      if (alive.current) setConfirm(false);
    } catch {
      if (alive.current) {
        setConfirm(false);
        setError("Không thực hiện được thao tác. Vui lòng thử lại.");
      }
    } finally {
      if (alive.current) {
        inFlight.current = false;
        setWorking(false);
      }
    }
  }
  return (
    <section className="xq-ui xq-ai">
      <header className="xq-ai-header">
        <h1>Đấu với máy</h1>
        <p>Không giới hạn thời gian</p>
      </header>
      {!connected && (
        <p role="alert">
          Mất kết nối — ván được giữ tối đa 30 phút để vào lại.
        </p>
      )}
      {connected && !canControl && <p role="status">Tab này chỉ có thể xem.</p>}
      {error && <p role="alert">{error}</p>}
      <div className="xq-ai-layout">
        <div className="xq-ai-board">
          <XiangqiBoard
            position={parsePosition(snapshot.position)}
            orientation={snapshot.actualSide}
            playerSide={snapshot.actualSide}
            disabled={!available || !active || snapshot.engineState !== "IDLE"}
            pending={pending || working}
            onMove={(from, to) => {
              if (active && snapshot.engineState === "IDLE")
                void request(() => props.onMove({ from, to }));
            }}
          />
        </div>
        <aside className="xq-ai-info" aria-label="Thông tin ván đấu với máy">
          <div className="xq-ai-player">
            <h2>Máy cờ</h2>
            <p>
              {
                { easy: "Dễ", medium: "Trung bình", hard: "Khó" }[
                  snapshot.level
                ]
              }
            </p>
            <p>Cầm {snapshot.actualSide === "red" ? "Đen" : "Đỏ"}</p>
          </div>
          <div className="xq-ai-player">
            <h2>Bạn</h2>
            <p>Cầm {snapshot.actualSide === "red" ? "Đỏ" : "Đen"}</p>
          </div>
          {snapshot.engineState === "THINKING" && active && (
            <p role="status">Máy đang suy nghĩ…</p>
          )}
          {snapshot.engineState === "IDLE" && active && (
            <p role="status">
              {parsePosition(snapshot.position).turn === snapshot.actualSide
                ? "Đến lượt bạn"
                : "Đến lượt máy"}
            </p>
          )}
          {snapshot.status === "FINALIZING" && (
            <p role="status">Đang ghi nhận kết quả…</p>
          )}
          {snapshot.engineState === "RETRY" && active && (
            <div role="alert">
              <p>
                Máy cờ gặp sự cố. Thử lại trên cùng thế cờ, không gửi lại nước
                của bạn.
              </p>
              <Button
                disabled={!available}
                onClick={() => void request(props.onRetry)}
              >
                Thử lại
              </Button>
            </div>
          )}
          {snapshot.status === "ABANDONED" && (
            <div>
              <h2>Ván bỏ dở</h2>
              <p>
                Máy cờ gặp sự cố. Thử lại tạo ván mới cùng cấp độ và phe{" "}
                {snapshot.actualSide === "red" ? "Đỏ" : "Đen"} của bạn.
              </p>
              <Button
                disabled={!available}
                onClick={() => void request(props.onRetry)}
              >
                Thử lại
              </Button>
              <Button variant="secondary" onClick={props.onLobby}>
                Về Sảnh
              </Button>
            </div>
          )}
          {props.undoRemaining !== undefined && props.onUndo && (
            <div>
              <p>Lượt đi lại: {props.undoRemaining}/3</p>
              <Button
                disabled={!available}
                disabledReason={undoReason}
                onClick={() => void request(props.onUndo!)}
              >
                Đi lại
              </Button>
            </div>
          )}
          {active && (
            <Button
              variant="danger"
              disabled={!available}
              onClick={() => setConfirm(true)}
            >
              Đầu hàng
            </Button>
          )}
          {result && resultDismissed && (
            <div>
              <h2>{resultTitle}</h2>
              <p>{reason}</p>
              {resultActions}
            </div>
          )}
        </aside>
      </div>
      <Dialog
        open={confirm && active}
        onClose={() => setConfirm(false)}
        title="Đầu hàng ván đấu?"
        danger
        onConfirm={() => void request(props.onResign)}
        confirmLabel="Xác nhận đầu hàng"
        cancelLabel="Ở lại"
      >
        <p>Đầu hàng được tính là thua. Ván đấu với máy không thay đổi Elo.</p>
      </Dialog>
      <Dialog
        open={!!result && !resultDismissed}
        onClose={() => setResultDismissed(true)}
        title={resultTitle}
        cancelLabel="Đóng kết quả"
      >
        <p>{reason}</p>
        {resultActions}
      </Dialog>
    </section>
  );
}
