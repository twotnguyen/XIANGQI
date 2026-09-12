import React from 'react';
import type { Piece as PieceData, PieceType, Side } from '@xiangqi/contracts';

const GLYPHS: Record<Side, Record<PieceType, string>> = {
  RED: {
    GENERAL: '帥',
    ADVISOR: '仕',
    ELEPHANT: '相',
    HORSE: '傌',
    ROOK: '俥',
    CANNON: '炮',
    PAWN: '兵',
  },
  BLACK: {
    GENERAL: '將',
    ADVISOR: '士',
    ELEPHANT: '象',
    HORSE: '馬',
    ROOK: '車',
    CANNON: '砲',
    PAWN: '卒',
  },
};

const VI_NAMES: Record<Side, Record<PieceType, string>> = {
  RED: {
    GENERAL: 'Tướng đỏ',
    ADVISOR: 'Sĩ đỏ',
    ELEPHANT: 'Tượng đỏ',
    HORSE: 'Mã đỏ',
    ROOK: 'Xe đỏ',
    CANNON: 'Pháo đỏ',
    PAWN: 'Tốt đỏ',
  },
  BLACK: {
    GENERAL: 'Tướng đen',
    ADVISOR: 'Sĩ đen',
    ELEPHANT: 'Tượng đen',
    HORSE: 'Mã đen',
    ROOK: 'Xe đen',
    CANNON: 'Pháo đen',
    PAWN: 'Tốt đen',
  },
};

export interface PieceProps {
  piece: PieceData;
  cx: number;
  cy: number;
  radius: number;
  selected?: boolean;
  inCheck?: boolean;
  canonicalX: number;
  canonicalY: number;
}

export function Piece({
  piece,
  cx,
  cy,
  radius,
  selected = false,
  inCheck = false,
  canonicalX,
  canonicalY,
}: PieceProps) {
  const glyph = GLYPHS[piece.side][piece.type];
  const viName = VI_NAMES[piece.side][piece.type];
  const isRed = piece.side === 'RED';
  const label = `${viName}, cột ${canonicalX + 1} hàng ${canonicalY + 1}`;

  return (
    <g
      role="img"
      aria-label={label}
      data-testid={`piece-${piece.side.toLowerCase()}-${piece.type.toLowerCase()}-${canonicalX}-${canonicalY}`}
      data-piece-id={piece.id}
    >
      {/* Selection / Check glow */}
      {selected && (
        <circle
          cx={cx}
          cy={cy}
          r={radius + 4}
          fill="none"
          stroke="var(--color-focus, #155E75)"
          strokeWidth="3"
        />
      )}
      {inCheck && (
        <circle
          cx={cx}
          cy={cy}
          r={radius + 4}
          fill="none"
          stroke="#DC3545"
          strokeWidth="3"
          strokeDasharray="4 2"
        />
      )}

      {/* Piece body — wooden disc */}
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="#F0D9B5"
        stroke="#B58863"
        strokeWidth="2"
      />
      {/* Inner ring */}
      <circle
        cx={cx}
        cy={cy}
        r={radius - 3}
        fill="none"
        stroke={isRed ? '#A51F25' : '#28221C'}
        strokeWidth="1"
        opacity="0.5"
      />

      {/* Character */}
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fill={isRed ? '#A51F25' : '#28221C'}
        fontSize={radius * 1.1}
        fontFamily="var(--font-piece, 'Noto Serif SC', 'Songti SC', serif)"
        fontWeight="bold"
        style={{ userSelect: 'none', pointerEvents: 'none' }}
      >
        {glyph}
      </text>
    </g>
  );
}

export { GLYPHS, VI_NAMES };
