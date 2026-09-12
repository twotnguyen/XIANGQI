/**
 * Attack geometry — determines which squares a side attacks.
 * Does NOT use getLegalMoves to avoid recursion.
 * Used by isInCheck and facing-generals detection.
 */
import {
  type Position,
  type Board,
  type Side,
  type Square,
  BOARD_SIZE,
  squareToIndex,
  indexToSquare,
} from '@xiangqi/contracts';

const OPPOSITE: Record<Side, Side> = { RED: 'BLACK', BLACK: 'RED' };

/**
 * Check if a square is attacked by any piece of the given side.
 * Pure attack geometry — ignores self-check constraints.
 */
export function isSquareAttackedBy(
  board: Board,
  square: Square,
  attackingSide: Side,
): boolean {
  for (let i = 0; i < BOARD_SIZE; i++) {
    const piece = board[i];
    if (!piece || piece.side !== attackingSide) continue;
    const from = indexToSquare(i);
    if (canAttack(board, from, square, piece.type, piece.side)) {
      return true;
    }
  }
  return false;
}

/**
 * Check if the given side's general is in check.
 */
export function isInCheck(position: Position, side: Side): boolean {
  const generalIdx = findGeneral(position.board, side);
  if (generalIdx === -1) return false;
  const generalSq = indexToSquare(generalIdx);
  return isSquareAttackedBy(position.board, generalSq, OPPOSITE[side]);
}

/**
 * Check if the two generals face each other on the same column with no pieces between.
 */
export function areGeneralsFacing(board: Board): boolean {
  const redGen = findGeneral(board, 'RED');
  const blackGen = findGeneral(board, 'BLACK');
  if (redGen === -1 || blackGen === -1) return false;
  const rSq = indexToSquare(redGen);
  const bSq = indexToSquare(blackGen);
  if (rSq.x !== bSq.x) return false;

  const minY = Math.min(rSq.y, bSq.y);
  const maxY = Math.max(rSq.y, bSq.y);
  for (let y = minY + 1; y < maxY; y++) {
    if (board[squareToIndex({ x: rSq.x, y })] !== null) return false;
  }
  return true;
}

function findGeneral(board: Board, side: Side): number {
  for (let i = 0; i < BOARD_SIZE; i++) {
    const p = board[i];
    if (p && p.type === 'GENERAL' && p.side === side) return i;
  }
  return -1;
}

function canAttack(
  board: Board,
  from: Square,
  to: Square,
  type: string,
  side: Side,
): boolean {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const adx = Math.abs(dx);
  const ady = Math.abs(dy);

  switch (type) {
    case 'GENERAL':
      // One step orthogonal within palace
      return adx + ady === 1 && (adx === 0 || ady === 0) &&
        inPalace(to, side);

    case 'ADVISOR':
      // One step diagonal within palace
      return adx === 1 && ady === 1 && inPalace(to, side);

    case 'ELEPHANT': {
      // Two steps diagonal, blocked by eye piece
      if (adx !== 2 || ady !== 2) return false;
      if (!inOwnHalf(to, side)) return false;
      const eyeX = from.x + dx / 2;
      const eyeY = from.y + dy / 2;
      return board[squareToIndex({ x: eyeX, y: eyeY })] === null;
    }

    case 'HORSE': {
      // L-shape: one orthogonal + one diagonal, blocked by leg
      if (!((adx === 1 && ady === 2) || (adx === 2 && ady === 1))) return false;
      // Leg blocks: if moving 2 in x, leg at (from.x + dx/2, from.y)
      //             if moving 2 in y, leg at (from.x, from.y + dy/2)
      let legX: number, legY: number;
      if (adx === 2) {
        legX = from.x + dx / 2;
        legY = from.y;
      } else {
        legX = from.x;
        legY = from.y + dy / 2;
      }
      return board[squareToIndex({ x: legX, y: legY })] === null;
    }

    case 'ROOK':
      // Straight line, no pieces between
      return isStraightLine(from, to) &&
        countBetween(board, from, to) === 0;

    case 'CANNON':
      // Straight line: move to empty = 0 between, capture = exactly 1 between
      if (!isStraightLine(from, to)) return false;
      {
        const between = countBetween(board, from, to);
        const target = board[squareToIndex(to)];
        // For attack purposes: can attack if exactly 1 piece between (the screen)
        if (target !== null) return between === 1;
        return false; // Cannon only attacks occupied squares
      }

    case 'PAWN': {
      // Before crossing river: forward only
      // After crossing river: forward + sideways
      const forward = side === 'RED' ? 1 : -1;
      if (adx + ady !== 1) return false;
      if (dy === forward && dx === 0) return true; // forward
      if (ady === 0 && adx === 1 && hasCrossedRiver(from, side)) return true; // sideways
      return false;
    }

    default:
      return false;
  }
}

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

function isStraightLine(a: Square, b: Square): boolean {
  return a.x === b.x || a.y === b.y;
}

function countBetween(board: Board, from: Square, to: Square): number {
  let count = 0;
  if (from.x === to.x) {
    const minY = Math.min(from.y, to.y);
    const maxY = Math.max(from.y, to.y);
    for (let y = minY + 1; y < maxY; y++) {
      if (board[squareToIndex({ x: from.x, y })] !== null) count++;
    }
  } else {
    const minX = Math.min(from.x, to.x);
    const maxX = Math.max(from.x, to.x);
    for (let x = minX + 1; x < maxX; x++) {
      if (board[squareToIndex({ x, y: from.y })] !== null) count++;
    }
  }
  return count;
}

export { OPPOSITE };
