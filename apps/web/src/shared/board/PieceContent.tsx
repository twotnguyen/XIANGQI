import type { PieceType, Side } from "@xiangqi/xiangqi-core";

export const glyphs: Record<Side, Record<PieceType, string>> = {
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

/**
 * Vẽ đồ họa quân cờ dạng SVG gồm phôi gỗ 3D, viền, rãnh chạm khắc và ký tự chữ Hán thư pháp.
 */
export function PieceContent({
  side,
  type,
  woodId,
  rimId,
  grooveId,
}: {
  side: Side;
  type: PieceType;
  woodId: string;
  rimId: string;
  grooveId: string;
}) {
  return (
    <>
      {/* Mặt phôi gỗ tiện 3D */}
      <circle
        className="xq-board-piece-face"
        r="17.6"
        fill={`url(#${woodId})`}
        stroke={`url(#${rimId})`}
        strokeWidth="1.2"
      />
      {/* Quân đen có thêm vòng tròn inner để phân biệt 1 nét và 2 nét chuẩn T11 */}
      {side === "black" && (
        <circle
          className="xq-board-piece-inner"
          r="14.3"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.9"
        />
      )}
      {/* Rãnh tròn chạm khắc đồng tâm tinh xảo (path SVG) */}
      <path
        className="xq-board-piece-groove"
        d="M 0 -14.3 a 14.3 14.3 0 1 0 0.0001 0 Z"
        fill="none"
        stroke={`url(#${grooveId})`}
        strokeWidth="0.9"
      />
      {/* Chữ Hán thư pháp */}
      <text className="xq-board-piece-glyph" aria-hidden="true">
        {glyphs[side][type]}
      </text>
    </>
  );
}
