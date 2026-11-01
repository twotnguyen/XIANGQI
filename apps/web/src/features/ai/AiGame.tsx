import {
  parsePosition,
  playMove,
  serializePosition,
  type MatchEnding,
  type Move,
  type Position,
  type Side,
} from "@xiangqi/xiangqi-core";
import { XiangqiBoard } from "../../shared/board/XiangqiBoard.js";
import { useEffect, useRef, useState } from "react";
import { Button, Dialog } from "../../shared/ui/primitives.js";
import { formatPositionMove } from "../../shared/board/move-notation.js";
import "./ai-game.css";
export interface AiGameSnapshot {
  id: string;
  requestedSide: Side | "random";
  actualSide: Side;
  level: "easy" | "medium" | "hard";
  position: string;
  history: string[];
  version: number;
  /** Số lần undo đã dùng; server-authoritative (tối đa 3). */
  undoUsed: number;
  status: "ACTIVE" | "FINALIZING" | "FINISHED" | "ABANDONED";
  engineState: "IDLE" | "THINKING" | "RETRY";
  engineError: "ENGINE_TIMEOUT" | "ENGINE_BUSY" | null;
  telemetry?: {
    taskVersion: number;
    completedDepth: number;
    targetDepth: number;
    elapsedMs: number;
    nodes: number;
    appliedMove: Move | null;
  } | null;
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
  lastMove?: Move | null;
  onMove: (move: Move) => Promise<void>;
  onResign: () => Promise<void>;
  onRetry: () => Promise<void>;
  onUndo?: () => Promise<void>;
  onNewGame: (setup: {
    level: AiGameSnapshot["level"];
    requestedSide: AiGameSnapshot["requestedSide"];
  }) => void;
  onLobby: () => void;
  onReplay?: () => void;
}
/**
 * Component trình bày bàn cờ và bảng điều khiển ván đấu với Máy AI (nước đi, xin đi lại/undo, đầu hàng, thử lại khi máy bận và kết quả ván cờ).
 */
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
    [metricsOpen, setMetricsOpen] = useState(false),
    [resultDismissed, setResultDismissed] = useState(false),
    // Nước người vừa đi hiện ngay ở đích trong lúc chờ máy chủ; máy chủ từ chối thì hoàn về (YC4 mục 16.1).
    [optimistic, setOptimistic] = useState<Position | null>(null);
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
  let appliedLabel = "Chưa có số liệu";
  if (snapshot.telemetry?.appliedMove && snapshot.history.length > 1) {
    try {
      const before = parsePosition(
        snapshot.history[snapshot.history.length - 2]!,
      );
      const move = snapshot.telemetry.appliedMove;
      if (
        before.board[move.from] &&
        serializePosition(playMove(before, move)) === snapshot.position
      )
        appliedLabel = formatPositionMove(before, move);
    } catch {
      // Ignore a move that does not match the committed history.
    }
  }
  const replayAction = props.onReplay &&
    (snapshot.status === "FINISHED" || snapshot.status === "ABANDONED") && (
      <Button variant="secondary" onClick={props.onReplay}>
        Xem lại
      </Button>
    );
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
      {replayAction}
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
        setOptimistic(null);
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
            position={optimistic ?? parsePosition(snapshot.position)}
            orientation={snapshot.actualSide}
            playerSide={snapshot.actualSide}
            disabled={!available || !active || snapshot.engineState !== "IDLE"}
            pending={pending || working}
            lastMove={props.lastMove}
            onMove={(from, to) => {
              if (active && snapshot.engineState === "IDLE")
                void request(() => {
                  try {
                    setOptimistic(
                      playMove(parsePosition(snapshot.position), { from, to }),
                    );
                  } catch {
                    /* Nước không hợp lệ: để máy chủ từ chối, không dựng thế giả. */
                  }
                  return props.onMove({ from, to });
                });
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
            <div>
              <p role="status">Đang ghi nhận kết quả…</p>
              <p>
                Chưa lưu được kết quả ván. Thử lưu lại để ghi nhận đúng kết quả
                đã xác định.
              </p>
              <Button
                disabled={!available}
                disabledReason={canControl ? "" : "Tab này chỉ có thể xem."}
                onClick={() => void request(props.onRetry)}
              >
                Thử lưu kết quả
              </Button>
            </div>
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
              {replayAction}
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
              <p className="xq-help">Đã dùng {3 - props.undoRemaining}/3 lần</p>
            </div>
          )}
          {active && (
            <div className="xq-ai-actions">
              <Button variant="secondary" onClick={props.onLobby}>
                Về Sảnh
              </Button>
              <Button
                variant="danger"
                disabled={!available}
                onClick={() => setConfirm(true)}
              >
                Đầu hàng
              </Button>
            </div>
          )}
          {props.undoRemaining !== undefined && (
            <div className="xq-ai-metrics">
              <Button
                variant="secondary"
                aria-expanded={metricsOpen}
                onClick={() => setMetricsOpen((open) => !open)}
              >
                Thông số máy
              </Button>
              {metricsOpen && (
                <div>
                  {snapshot.telemetry ? (
                    <>
                      <p>
                        Độ sâu: {snapshot.telemetry.completedDepth}/
                        {snapshot.telemetry.targetDepth}
                      </p>
                      <p>Nodes: {snapshot.telemetry.nodes}</p>
                      <p>
                        Thời gian tính:{" "}
                        {snapshot.telemetry.elapsedMs.toLocaleString("vi-VN", {
                          maximumFractionDigits: 1,
                        })}{" "}
                        ms
                      </p>
                      <p>Nước máy vừa đi: {appliedLabel}</p>
                    </>
                  ) : (
                    <p>Chưa có số liệu</p>
                  )}
                </div>
              )}
            </div>
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
