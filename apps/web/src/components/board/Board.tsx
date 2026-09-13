import React, { useState, useCallback, useRef } from 'react';
import type { Position, Side, Square, Move } from '@xiangqi/contracts';
import { squareToIndex } from '@xiangqi/contracts';
import { canonicalToView, viewToCanonical } from './coordinates.js';
import { Piece } from './Piece.js';
import styles from './board.module.css';

export interface BoardProps {
  position: Position;
  orientation?: Side;
  interactive?: boolean;
  legalMoves?: Move[];
  onMove?: (move: Move) => void;
  lastMove?: Move | null;
  inCheckSide?: Side | null;
}

// SVG layout constants
const CELL = 56;
const PADDING = 36;
const WIDTH = 8 * CELL + 2 * PADDING;   // 8 intervals = 9 lines
const HEIGHT = 9 * CELL + 2 * PADDING;  // 9 intervals = 10 lines
const PIECE_RADIUS = 22;

/** Arrow keys move the cursor in VIEW space, so a flipped board still moves "up" on screen. */
const ARROW_DELTAS: Record<string, [number, number]> = {
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function Board({
  position,
  orientation = 'RED',
  interactive = true,
  legalMoves = [],
  onMove,
  lastMove = null,
  inCheckSide = null,
}: BoardProps) {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [cursor, setCursor] = useState<Square | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  // Filter legal moves for selected piece
  const targetsForSelected = selectedSquare
    ? legalMoves.filter(
        (m) => m.from.x === selectedSquare.x && m.from.y === selectedSquare.y,
      )
    : [];

  /** Roving tabindex anchor: the cursor, or the first movable piece of the side to move. */
  const tabStop = (): Square => {
    if (cursor) return cursor;
    for (let i = 0; i < 90; i += 1) {
      const piece = position.board[i];
      if (piece && piece.side === position.turn) {
        return { x: i % 9, y: Math.floor(i / 9) };
      }
    }
    return { x: 4, y: position.turn === 'RED' ? 9 : 0 };
  };
  const activeSquare = tabStop();

  const focusSquare = useCallback((square: Square) => {
    setCursor(square);
    const element = boardRef.current?.querySelector<SVGElement>(
      `[data-testid="square-${square.x}-${square.y}"]`,
    );
    element?.focus();
  }, []);

  const handleSquareClick = useCallback(
    (canonical: Square) => {
      if (!interactive) return;

      // If clicked a legal target for current selection → emit move
      if (selectedSquare) {
        const matchingMove = targetsForSelected.find(
          (m) => m.to.x === canonical.x && m.to.y === canonical.y,
        );
        if (matchingMove) {
          onMove?.(matchingMove);
          setSelectedSquare(null);
          return;
        }
      }

      // Check if clicked a piece of current side to move
      const idx = squareToIndex(canonical);
      const piece = position.board[idx];
      if (piece && piece.side === position.turn) {
        // Toggle or select
        if (
          selectedSquare &&
          selectedSquare.x === canonical.x &&
          selectedSquare.y === canonical.y
        ) {
          setSelectedSquare(null);
        } else {
          setSelectedSquare(canonical);
        }
      } else {
        // Clicked empty or opponent piece (not a valid move target) → clear
        setSelectedSquare(null);
      }
    },
    [interactive, selectedSquare, targetsForSelected, position, onMove],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!interactive) return;

      if (e.key === 'Escape') {
        setSelectedSquare(null);
        return;
      }

      const delta = ARROW_DELTAS[e.key];
      if (delta) {
        e.preventDefault();
        const from = canonicalToView(activeSquare, orientation);
        const col = clamp(from.col + delta[0], 0, 8);
        const row = clamp(from.row + delta[1], 0, 9);
        focusSquare(viewToCanonical(col, row, orientation));
        return;
      }

      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        if (
          selectedSquare &&
          selectedSquare.x === activeSquare.x &&
          selectedSquare.y === activeSquare.y
        ) {
          setSelectedSquare(null);
          return;
        }
        handleSquareClick(activeSquare);
      }
    },
    [interactive, activeSquare, orientation, focusSquare, selectedSquare, handleSquareClick],
  );

  // Pixel coordinates for a view grid point (col, row)
  const toPx = (col: number, row: number) => ({
    x: PADDING + col * CELL,
    y: PADDING + row * CELL,
  });

  return (
    <div
      ref={boardRef}
      className={styles.boardContainer}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      role="region"
      aria-label="Bàn cờ tướng"
    >
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className={styles.boardSvg}
        data-testid="xiangqi-board"
      >
        {/* Board wood background */}
        <rect
          x="0"
          y="0"
          width={WIDTH}
          height={HEIGHT}
          fill="#D8AE72"
          stroke="#704525"
          strokeWidth="6"
          rx="8"
        />

        {/* Outer border line */}
        <rect
          x={PADDING - 6}
          y={PADDING - 6}
          width={8 * CELL + 12}
          height={9 * CELL + 12}
          fill="none"
          stroke="#28221C"
          strokeWidth="2"
        />

        {/* ── Grid lines ─────────────────────────── */}
        {/* Horizontal lines: 10 lines (rows 0..9) */}
        {Array.from({ length: 10 }, (_, row) => {
          const from = toPx(0, row);
          const to = toPx(8, row);
          return (
            <line
              key={`h-${row}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="#28221C"
              strokeWidth="1"
            />
          );
        })}

        {/* Vertical lines: top half (rows 0..4), bottom half (rows 5..9) */}
        {/* River breaks vertical lines except columns 0 and 8 */}
        {Array.from({ length: 9 }, (_, col) => {
          const topStart = toPx(col, 0);
          const topEnd = toPx(col, 4);
          const botStart = toPx(col, 5);
          const botEnd = toPx(col, 9);
          const isEdge = col === 0 || col === 8;

          return (
            <g key={`v-${col}`}>
              {isEdge ? (
                // Border lines continue across river
                <line
                  x1={topStart.x}
                  y1={topStart.y}
                  x2={botEnd.x}
                  y2={botEnd.y}
                  stroke="#28221C"
                  strokeWidth="1"
                />
              ) : (
                <>
                  <line
                    x1={topStart.x}
                    y1={topStart.y}
                    x2={topEnd.x}
                    y2={topEnd.y}
                    stroke="#28221C"
                    strokeWidth="1"
                  />
                  <line
                    x1={botStart.x}
                    y1={botStart.y}
                    x2={botEnd.x}
                    y2={botEnd.y}
                    stroke="#28221C"
                    strokeWidth="1"
                  />
                </>
              )}
            </g>
          );
        })}

        {/* ── Palace diagonals ───────────────────── */}
        {/* Top palace: cols 3..5, rows 0..2 */}
        <line
          x1={toPx(3, 0).x}
          y1={toPx(3, 0).y}
          x2={toPx(5, 2).x}
          y2={toPx(5, 2).y}
          stroke="#28221C"
          strokeWidth="1"
        />
        <line
          x1={toPx(5, 0).x}
          y1={toPx(5, 0).y}
          x2={toPx(3, 2).x}
          y2={toPx(3, 2).y}
          stroke="#28221C"
          strokeWidth="1"
        />

        {/* Bottom palace: cols 3..5, rows 7..9 */}
        <line
          x1={toPx(3, 7).x}
          y1={toPx(3, 7).y}
          x2={toPx(5, 9).x}
          y2={toPx(5, 9).y}
          stroke="#28221C"
          strokeWidth="1"
        />
        <line
          x1={toPx(5, 7).x}
          y1={toPx(5, 7).y}
          x2={toPx(3, 9).x}
          y2={toPx(3, 9).y}
          stroke="#28221C"
          strokeWidth="1"
        />

        {/* ── River text ─────────────────────────── */}
        <text
          x={toPx(2, 4.5).x}
          y={toPx(2, 4.5).y}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#704525"
          fontSize="18"
          fontFamily="var(--font-piece, 'Noto Serif SC', serif)"
          fontWeight="bold"
          opacity="0.8"
        >
          楚河
        </text>
        <text
          x={toPx(6, 4.5).x}
          y={toPx(6, 4.5).y}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#704525"
          fontSize="18"
          fontFamily="var(--font-piece, 'Noto Serif SC', serif)"
          fontWeight="bold"
          opacity="0.8"
        >
          漢界
        </text>

        {/* ── Last move highlight ────────────────── */}
        {lastMove && (
          <g className={styles.lastMove}>
            {[lastMove.from, lastMove.to].map((sq, i) => {
              const view = canonicalToView(sq, orientation);
              const pt = toPx(view.col, view.row);
              return (
                <rect
                  key={`lm-${i}`}
                  x={pt.x - CELL / 2 + 4}
                  y={pt.y - CELL / 2 + 4}
                  width={CELL - 8}
                  height={CELL - 8}
                  fill="var(--color-last-move, rgba(216,174,114,0.6))"
                  rx="4"
                />
              );
            })}
          </g>
        )}

        {/* ── Legal target indicators ────────────── */}
        {targetsForSelected.map((m, i) => {
          const view = canonicalToView(m.to, orientation);
          const pt = toPx(view.col, view.row);
          const targetPiece = position.board[squareToIndex(m.to)];
          return (
            <circle
              key={`target-${i}`}
              cx={pt.x}
              cy={pt.y}
              r={targetPiece ? PIECE_RADIUS + 2 : 8}
              fill={targetPiece ? 'none' : 'var(--color-legal-target, rgba(40,167,69,0.5))'}
              stroke={targetPiece ? '#DC3545' : 'none'}
              strokeWidth={targetPiece ? 3 : 0}
              data-testid={`legal-target-${m.to.x}-${m.to.y}`}
              style={{ pointerEvents: 'none' }}
            />
          );
        })}

        {/* ── Pieces ─────────────────────────────── */}
        {Array.from({ length: 90 }, (_, i) => {
          const piece = position.board[i];
          if (!piece) return null;
          const canonical = { x: i % 9, y: Math.floor(i / 9) };
          const view = canonicalToView(canonical, orientation);
          const pt = toPx(view.col, view.row);
          const isSelected =
            selectedSquare?.x === canonical.x && selectedSquare?.y === canonical.y;
          const isChecked =
            piece.type === 'GENERAL' && piece.side === inCheckSide;

          return (
            <Piece
              key={piece.id}
              piece={piece}
              cx={pt.x}
              cy={pt.y}
              radius={PIECE_RADIUS}
              selected={isSelected}
              inCheck={isChecked}
              canonicalX={canonical.x}
              canonicalY={canonical.y}
            />
          );
        })}

        {/* ── Click targets for all 90 intersections ── */}
        {Array.from({ length: 90 }, (_, i) => {
          const col = i % 9;
          const row = Math.floor(i / 9);
          const canonical = viewToCanonical(col, row, orientation);
          const pt = toPx(col, row);
          const piece = position.board[squareToIndex(canonical)];
          const isTabStop =
            interactive && canonical.x === activeSquare.x && canonical.y === activeSquare.y;
          const isCursor =
            activeSquare.x === canonical.x && activeSquare.y === canonical.y;

          return (
            <circle
              key={`click-${col}-${row}`}
              cx={pt.x}
              cy={pt.y}
              r={CELL / 2}
              fill="transparent"
              className={styles.clickTarget}
              onClick={() => handleSquareClick(canonical)}
              onFocus={() => setCursor(canonical)}
              data-testid={`square-${canonical.x}-${canonical.y}`}
              data-cursor={isCursor ? 'true' : undefined}
              role="button"
              tabIndex={isTabStop ? 0 : -1}
              stroke={isCursor ? '#155E75' : undefined}
              strokeWidth={isCursor ? 3 : undefined}
              aria-label={
                piece
                  ? undefined // Piece already has label
                  : `Ô trống cột ${canonical.x + 1} hàng ${canonical.y + 1}`
              }
            />
          );
        })}
      </svg>
    </div>
  );
}
