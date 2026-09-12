/**
 * Move generation, validation, and application.
 * Uses attack geometry from attacks.ts — no recursion.
 */
import {
  type Position,
  type Board,
  type Side,
  type Square,
  type Move,
  BOARD_SIZE,
  squareToIndex,
  indexToSquare,
} from '@xiangqi/contracts';
import { isInCheck, areGeneralsFacing, isSquareAttackedBy, OPPOSITE } from './attacks.js';

// ── Pseudo-legal move generation ────────────────────────────

function inPalace(sq: Square, side: Side): boolean {
  if (sq.x < 3 || sq.x > 5) return false;
  if (side === 'RED') return sq.y >= 0 && sq.y <= 2;
  return sq.y >= 7 && sq.y <= 9;
}

function inOwnHalf(sq: Square, side: Side): boolean {
  if (side === 'RED') return sq.y >= 0 && sq.y <= 4;
  return sq.y >= 5 && sq.y <= 9;
}

function hasCrossedRiver(sq: Square, side: Side): boolean {
  if (side === 'RED') return sq.y >= 5;
  return sq.y <= 4;
}

function inBounds(sq: Square): boolean {
  return sq.x >= 0 && sq.x <= 8 && sq.y >= 0 && sq.y <= 9;
}
/** Generate pseudo-legal moves (ignoring self-check) for one piece */
function pseudoMoves(board: Board, from: Square, side: Side): Square[] {
  const piece = board[squareToIndex(from)];
  if (!piece || piece.side !== side) return [];

  const targets: Square[] = [];
  const add = (sq: Square) => {
    if (!inBounds(sq)) return;
    const target = board[squareToIndex(sq)];
    if (target && target.side === side) return; // can't capture own piece
    targets.push(sq);
  };

  switch (piece.type) {
    case 'GENERAL':
      for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
        const sq = { x: from.x + dx, y: from.y + dy };
        if (inPalace(sq, side)) add(sq);
      }
      break;

    case 'ADVISOR':
      for (const [dx, dy] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
        const sq = { x: from.x + dx, y: from.y + dy };
        if (inPalace(sq, side)) add(sq);
      }
      break;

    case 'ELEPHANT':
      for (const [dx, dy] of [[2, 2], [2, -2], [-2, 2], [-2, -2]]) {
        const sq = { x: from.x + dx, y: from.y + dy };
        if (!inBounds(sq) || !inOwnHalf(sq, side)) continue;
        const eye = { x: from.x + dx / 2, y: from.y + dy / 2 };
        if (board[squareToIndex(eye)] === null) add(sq);
      }
      break;

    case 'HORSE':
      for (const [dx, dy] of [
        [1, 2], [1, -2], [-1, 2], [-1, -2],
        [2, 1], [2, -1], [-2, 1], [-2, -1],
      ]) {
        const sq = { x: from.x + dx, y: from.y + dy };
        if (!inBounds(sq)) continue;
        // Leg block
        let legX: number, legY: number;
        if (Math.abs(dx) === 2) {
          legX = from.x + dx / 2;
          legY = from.y;
        } else {
          legX = from.x;
          legY = from.y + dy / 2;
        }
        if (board[squareToIndex({ x: legX, y: legY })] === null) add(sq);
      }
      break;

    case 'ROOK':
      for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
        for (let step = 1; step <= 9; step++) {
          const sq = { x: from.x + dx * step, y: from.y + dy * step };
          if (!inBounds(sq)) break;
          const target = board[squareToIndex(sq)];
          if (target) {
            if (target.side !== side) targets.push(sq); // capture
            break;
          }
          targets.push(sq);
        }
      }
      break;

    case 'CANNON':
      for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
        let screenFound = false;
        for (let step = 1; step <= 9; step++) {
          const sq = { x: from.x + dx * step, y: from.y + dy * step };
          if (!inBounds(sq)) break;
          const target = board[squareToIndex(sq)];
          if (!screenFound) {
            if (target) {
              screenFound = true; // this is the screen
            } else {
              targets.push(sq); // move to empty
            }
          } else {
            // After screen: can only capture, not move to empty
            if (target) {
              if (target.side !== side) targets.push(sq);
              break;
            }
          }
        }
      }
      break;

    case 'PAWN': {
      const forward = side === 'RED' ? 1 : -1;
      // Always can go forward
      add({ x: from.x, y: from.y + forward });
      // After crossing river: sideways
      if (hasCrossedRiver(from, side)) {
        add({ x: from.x - 1, y: from.y });
        add({ x: from.x + 1, y: from.y });
      }
      break;
    }
  }

  return targets;
}

// ── Public API ──────────────────────────────────────────────

/**
 * Get all legal moves for the current side to move.
 * Filters pseudo-legal moves by: no self-check, no facing generals.
 */
export function getLegalMoves(position: Position): Move[] {
  const { board, turn } = position;
  const moves: Move[] = [];

  for (let i = 0; i < BOARD_SIZE; i++) {
    const piece = board[i];
    if (!piece || piece.side !== turn) continue;
    const from = indexToSquare(i);
    const targets = pseudoMoves(board, from, turn);

    for (const to of targets) {
      const move = { from, to };
      // Apply move on a copy and check legality
      const nextBoard = applyMoveToBoard(board, move);
      // After our move, our general must not be in check
      if (isInCheckOnBoard(nextBoard, turn)) continue;
      // Generals must not face each other
      if (areGeneralsFacing(nextBoard)) continue;
      moves.push(move);
    }
  }

  return moves;
}

/**
 * Validate a specific move for the current position.
 */
export function validateMove(
  position: Position,
  move: Move,
): { valid: true } | { valid: false; reason: string } {
  const { board, turn } = position;
  const fromIdx = squareToIndex(move.from);
  const piece = board[fromIdx];

  if (!piece) return { valid: false, reason: 'No piece at source square' };
  if (piece.side !== turn) return { valid: false, reason: 'Not your piece' };

  // Check if this move is in the legal moves list
  const legal = getLegalMoves(position);
  const isLegal = legal.some(
    (m) => m.from.x === move.from.x && m.from.y === move.from.y &&
           m.to.x === move.to.x && m.to.y === move.to.y,
  );

  if (!isLegal) return { valid: false, reason: 'Illegal move' };
  return { valid: true };
}

/**
 * Apply a validated move to produce a new position.
 * Pure function — does not mutate input.
 * Asserts the move has been validated; throws on illegal input as internal safety.
 */
export function applyMove(position: Position, move: Move): Position {
  const fromIdx = squareToIndex(move.from);
  const piece = position.board[fromIdx];
  if (!piece) throw new Error('applyMove: no piece at source');
  if (piece.side !== position.turn) throw new Error('applyMove: wrong side');

  const newBoard = applyMoveToBoard(position.board, move);
  return {
    board: newBoard,
    turn: OPPOSITE[position.turn],
  };
}

// ── Internal helpers ────────────────────────────────────────

function applyMoveToBoard(board: Board, move: Move): Board {
  const newBoard = [...board];
  const fromIdx = squareToIndex(move.from);
  const toIdx = squareToIndex(move.to);
  newBoard[toIdx] = newBoard[fromIdx];
  newBoard[fromIdx] = null;
  return newBoard;
}

function isInCheckOnBoard(board: Board, side: Side): boolean {
  // Find general
  for (let i = 0; i < BOARD_SIZE; i++) {
    const p = board[i];
    if (p && p.type === 'GENERAL' && p.side === side) {
      const sq = indexToSquare(i);
      return isSquareAttackedBy(board, sq, OPPOSITE[side]);
    }
  }
  return false;
}

export { isInCheck, isSquareAttackedBy, areGeneralsFacing };
