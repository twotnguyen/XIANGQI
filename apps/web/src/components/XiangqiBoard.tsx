import { useId } from "react";
import type { PieceType, Position, Side } from "@xiangqi/xiangqi-core";
import "./XiangqiBoard.css";

export interface XiangqiBoardProps {
  position: Position;
  /** Display only; spectators use the default Red-at-bottom view. */
  orientation?: Side;
}

const glyphs: Record<Side, Record<PieceType, string>> = {
  red: {
    king: "帥",
    advisor: "仕",
    elephant: "相",
    rook: "俥",
    horse: "傌",
    cannon: "炮",
    pawn: "兵",
  },
  black: {
    king: "將",
    advisor: "士",
    elephant: "象",
    rook: "車",
    horse: "馬",
    cannon: "砲",
    pawn: "卒",
  },
};
const names: Record<PieceType, string> = {
  king: "Tướng",
  advisor: "Sĩ",
  elephant: "Tượng",
  rook: "Xe",
  horse: "Mã",
  cannon: "Pháo",
  pawn: "Tốt",
};
const pieceTypes: PieceType[] = [
  "king",
  "advisor",
  "elephant",
  "horse",
  "rook",
  "cannon",
  "pawn",
];
const files = Array.from({ length: 9 }, (_, x) => x);
const ranks = Array.from({ length: 10 }, (_, y) => y);
const marks = [
  [1, 2],
  [7, 2],
  [1, 7],
  [7, 7],
  ...[0, 2, 4, 6, 8].flatMap((x) => [
    [x, 3],
    [x, 6],
  ]),
];

function markerPath(x: number, y: number): string {
  const cx = 24 + x * 40;
  const cy = 24 + y * 40;
  const corners: string[] = [];
  for (const dx of [-1, 1]) {
    if ((x === 0 && dx === -1) || (x === 8 && dx === 1)) continue;
    for (const dy of [-1, 1]) {
      corners.push(`M${cx + dx * 4} ${cy + dy * 9}v${-dy * 5}h${dx * 5}`);
    }
  }
  return corners.join(" ");
}

/** Read-only display. Selection, commands and legality belong to the caller. */
export function XiangqiBoard({
  position,
  orientation = "red",
}: XiangqiBoardProps) {
  const id = useId();
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;
  const woodId = `${id}-wood`;
  const bottom = orientation === "red" ? "Đỏ" : "Đen";
  return (
    <figure className="xq-board">
      <svg
        className="xq-board-svg"
        viewBox="0 0 368 408"
        role="group"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <title id={titleId}>{`Bàn cờ tướng — ${bottom} ở phía dưới`}</title>
        <desc id={descriptionId}>
          9 cột, 10 hàng giao điểm. Quân đỏ viền một nét, quân đen viền hai nét.
          Nhãn quân dùng tọa độ gốc.
        </desc>
        <defs>
          <linearGradient id={woodId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--color-wood)" />
            <stop offset="0.5" stopColor="var(--color-paper-board)" />
            <stop offset="1" stopColor="var(--color-wood)" />
          </linearGradient>
        </defs>
        <g aria-hidden="true" className="xq-board-grid">
          <rect
            x="1"
            y="1"
            width="366"
            height="406"
            rx="8"
            fill={`url(#${woodId})`}
          />
          {ranks.map((y) => (
            <line
              key={y}
              className="xq-board-rank"
              x1="24"
              x2="344"
              y1={24 + y * 40}
              y2={24 + y * 40}
            />
          ))}
          {files.map((x) =>
            x === 0 || x === 8 ? (
              <line
                key={x}
                className="xq-board-file"
                x1={24 + x * 40}
                x2={24 + x * 40}
                y1="24"
                y2="384"
              />
            ) : (
              <g key={x}>
                <line
                  className="xq-board-file"
                  x1={24 + x * 40}
                  x2={24 + x * 40}
                  y1="24"
                  y2="184"
                />
                <line
                  className="xq-board-file"
                  x1={24 + x * 40}
                  x2={24 + x * 40}
                  y1="224"
                  y2="384"
                />
              </g>
            ),
          )}
          <path
            className="xq-board-palace"
            d="M144 24L224 104M224 24L144 104"
          />
          <path
            className="xq-board-palace"
            d="M144 304L224 384M224 304L144 384"
          />
          {marks.map(([x, y]) => (
            <path
              key={`${x}-${y}`}
              className="xq-board-mark"
              d={markerPath(x!, y!)}
            />
          ))}
          <text className="xq-board-river" x="104" y="204">
            楚河
          </text>
          <text className="xq-board-river" x="264" y="204">
            漢界
          </text>
        </g>
        {position.board.map((piece, square) => {
          if (!piece) return null;
          const x = square % 9;
          const y = Math.floor(square / 9);
          const displayX = orientation === "black" ? 8 - x : x;
          const displayY = orientation === "black" ? 9 - y : y;
          return (
            <g
              key={square}
              className={`xq-board-piece xq-board-piece-${piece.side}`}
              role="img"
              aria-label={`${names[piece.type]} ${piece.side === "red" ? "đỏ" : "đen"}, cột ${x + 1} hàng ${y + 1}`}
              transform={`translate(${24 + displayX * 40} ${24 + displayY * 40})`}
            >
              <circle className="xq-board-piece-face" r="17.6" />
              {piece.side === "black" && (
                <circle className="xq-board-piece-inner" r="14.5" />
              )}
              <text className="xq-board-piece-glyph" aria-hidden="true">
                {glyphs[piece.side][piece.type]}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption
        className="xq-board-turn"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <span aria-hidden="true">▸</span> Lượt:{" "}
        {position.turn === "red" ? "Đỏ" : "Đen"}
      </figcaption>
      <details className="xq-board-legend">
        <summary>Chú giải quân</summary>
        <div className="xq-board-legend-sides">
          {(["red", "black"] as const).map((side) => (
            <ul key={side} aria-label={`Quân ${side === "red" ? "đỏ" : "đen"}`}>
              {pieceTypes.map((type) => (
                <li key={type}>
                  <span
                    className={`xq-board-legend-glyph xq-board-piece-${side}`}
                    aria-hidden="true"
                  >
                    {glyphs[side][type]}
                  </span>
                  {names[type]} {side === "red" ? "đỏ" : "đen"}
                </li>
              ))}
            </ul>
          ))}
        </div>
      </details>
    </figure>
  );
}
