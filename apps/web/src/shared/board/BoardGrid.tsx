import { memo } from "react";

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

/**
 * Vẽ lưới bàn cờ tướng dạng SVG gồm các đường ngang/dọc, cung tướng (cửu cung), sông (Sở Hà Hán Giới) và các điểm dấu pháo/tốt.
 */
export const BoardGrid = memo(function BoardGrid({
  woodId,
  boardFrameId,
}: {
  woodId: string;
  boardFrameId: string;
}) {
  return (
    <g aria-hidden="true" className="xq-board-grid">
      {/* Khung viền bàn cờ gỗ tự nhiên dày dặn bo góc */}
      <rect
        x="1"
        y="1"
        width="366"
        height="406"
        rx="10"
        className="xq-board-frame"
        fill={`url(#${boardFrameId})`}
      />
      {/* Mặt bàn cờ gỗ vàng ấm */}
      <rect
        x="6"
        y="6"
        width="356"
        height="396"
        rx="6"
        className="xq-board-surface"
        fill={`url(#${woodId})`}
      />
      {/* Viền rãnh bo quanh lưới cờ */}
      <rect
        x="18"
        y="18"
        width="332"
        height="372"
        rx="3"
        className="xq-board-inner-frame"
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
      <path className="xq-board-palace" d="M144 24L224 104M224 24L144 104" />
      <path className="xq-board-palace" d="M144 304L224 384M224 304L144 384" />
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
  );
});
