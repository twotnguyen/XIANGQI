import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { parsePosition } from "@xiangqi/xiangqi-core";
import { XiangqiBoard } from "../board/XiangqiBoard.js";
import { Button } from "../ui/primitives.js";
import type { ReplayRecord } from "./replay-client.js";
import "./replay-viewer.css";
export interface ReplayViewerProps {
  record: ReplayRecord;
  /** Canonical Vietnamese notation supplied by the caller, one label per effective move. */
  moveLabels: string[];
  /** Permission-gated export; absent means the controls are hidden. */
  exportAt?: (ply: number) => Promise<{ fen: string; pgn: string }>;
}
export function ReplayViewer({
  record,
  moveLabels,
  exportAt,
}: ReplayViewerProps) {
  const [playback, setPlayback] = useState({
    record,
    index: 0,
    playing: false,
  });
  const [exportState, setExportState] = useState<"idle" | "busy">("idle");
  const [exportStatus, setExportStatus] = useState("");
  const [exportError, setExportError] = useState("");
  const selectedRow = useRef<HTMLButtonElement | null>(null);
  const current = playback.record === record;
  const index = current ? playback.index : 0;
  const playing = current && playback.playing;
  const last = record.moves.length;
  useLayoutEffect(() => {
    setPlayback({ record, index: 0, playing: false });
  }, [record]);
  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      setPlayback((previous) => {
        if (previous.record !== record || !previous.playing) return previous;
        const next = Math.min(previous.index + 1, last);
        return { record, index: next, playing: next < last };
      });
    }, 1500);
    return () => clearInterval(timer);
  }, [record, playing, last]);
  useEffect(() => {
    selectedRow.current?.scrollIntoView?.({ block: "nearest" });
  }, [index]);
  function jump(next: number) {
    setPlayback({
      record,
      index: Math.max(0, Math.min(next, last)),
      playing: false,
    });
  }
  async function copyFen() {
    if (!exportAt || exportState === "busy") return;
    setExportState("busy");
    setExportStatus("");
    setExportError("");
    try {
      const { fen } = await exportAt(index);
      if (!navigator.clipboard?.writeText) throw Error("clipboard unavailable");
      await navigator.clipboard.writeText(fen);
      setExportStatus("Đã sao chép FEN của thế cờ hiện tại.");
    } catch {
      setExportError("Chưa thể sao chép FEN. Vui lòng thử lại.");
    } finally {
      setExportState("idle");
    }
  }
  async function downloadPgn() {
    if (!exportAt || exportState === "busy") return;
    setExportState("busy");
    setExportStatus("");
    setExportError("");
    try {
      const { pgn } = await exportAt(last);
      const blob = new Blob([pgn], { type: "application/x-chess-pgn" }),
        url = URL.createObjectURL(blob),
        anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${record.id}.pgn`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      setExportStatus("Đã tải tệp PGN của ván đấu.");
    } catch {
      setExportError("Chưa thể tải PGN. Vui lòng thử lại.");
    } finally {
      setExportState("idle");
    }
  }
  const position = parsePosition(record.positions[index]!.fen);
  return (
    <section
      className="xq-ui xq-replay-viewer"
      aria-label="Xem lại từng nước cờ"
    >
      <div className="xq-replay-board">
        <XiangqiBoard
          position={position}
          orientation={record.side}
          disabled
          lastMove={index ? record.moves[index - 1]! : null}
        />
      </div>
      <div className="xq-replay-sidebar">
        <div
          className="xq-replay-controls"
          role="group"
          aria-label="Điều khiển xem lại"
        >
          <Button
            variant="secondary"
            aria-label="Về đầu ván"
            disabled={index === 0}
            onClick={() => jump(0)}
          >
            ⏮
          </Button>
          <Button
            variant="secondary"
            aria-label="Nước trước"
            disabled={index === 0}
            onClick={() => jump(index - 1)}
          >
            ◀
          </Button>
          <Button
            variant="secondary"
            aria-label="Nước tiếp"
            disabled={index === last}
            onClick={() => jump(index + 1)}
          >
            ▶
          </Button>
          <Button
            variant="secondary"
            aria-label="Đến cuối ván"
            disabled={index === last}
            onClick={() => jump(last)}
          >
            ⏭
          </Button>
          <Button
            variant="secondary"
            aria-pressed={playing}
            disabled={!playing && index === last}
            onClick={() => setPlayback({ record, index, playing: !playing })}
          >
            {playing ? "Tạm dừng" : "Tự động phát"}
          </Button>
        </div>
        <p className="xq-replay-progress" role="status" aria-live="polite">
          Nước {index} / {last}
        </p>
        {exportAt && (
          <div className="xq-replay-export" aria-label="Xuất biên bản">
            <Button
              variant="secondary"
              loading={exportState === "busy"}
              onClick={() => void copyFen()}
            >
              Copy FEN
            </Button>
            <Button
              variant="secondary"
              loading={exportState === "busy"}
              onClick={() => void downloadPgn()}
            >
              Tải PGN
            </Button>
            {exportStatus && (
              <p role="status" aria-live="polite">
                {exportStatus}
              </p>
            )}
            {exportError && (
              <p role="alert" aria-live="assertive">
                {exportError}
              </p>
            )}
          </div>
        )}
        <section className="xq-replay-score" aria-label="Biên bản ván đấu">
          <h2>Biên bản ván đấu</h2>
          {last === 0 ? (
            <p>Ván đấu kết thúc ở thế cờ ban đầu.</p>
          ) : (
            <ol className="xq-replay-moves">
              {record.moves.map((move, i) => (
                <li key={i}>
                  <button
                    type="button"
                    ref={i + 1 === index ? selectedRow : undefined}
                    className="xq-replay-move"
                    aria-label={`Nước ${i + 1}: ${moveLabels[i]}`}
                    aria-current={i + 1 === index ? "step" : undefined}
                    onClick={() => jump(i + 1)}
                  >
                    <span className="xq-replay-number" aria-hidden="true">
                      {i + 1}.
                    </span>
                    <span>{moveLabels[i]}</span>
                    <span className="xq-replay-side">
                      {move.side === "red" ? "Đỏ" : "Đen"}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </section>
  );
}
