import type { Move, Piece, Position, Side } from "./position.js";

const orthogonal = [
  [0, -1],
  [0, 1],
  [-1, 0],
  [1, 0],
] as const;
const diagonal = [
  [-1, -1],
  [-1, 1],
  [1, -1],
  [1, 1],
] as const;
const horses = [
  [-2, -1],
  [-2, 1],
  [2, -1],
  [2, 1],
  [-1, -2],
  [1, -2],
  [-1, 2],
  [1, 2],
] as const;

function onBoard(x: number, y: number): boolean {
  return x >= 0 && x < 9 && y >= 0 && y < 10;
}

function inPalace(x: number, y: number, side: Side): boolean {
  return x >= 3 && x <= 5 && (side === "red" ? y >= 7 : y <= 2);
}

/** Geometric candidates only; may expose the general and must not authorize play. */
export function pseudoLegalMoves(position: Position): Move[] {
  const moves: Move[] = [];
  for (let from = 0; from < 90; from += 1) {
    const piece = position.board[from];
    if (!piece || piece.side !== position.turn) continue;
    pieceMoves(position, piece, from, moves);
  }
  return moves;
}

function pieceMoves(
  position: Position,
  piece: Piece,
  from: number,
  moves: Move[],
): void {
  const x = from % 9;
  const y = Math.floor(from / 9);
  const add = (tx: number, ty: number): void => {
    if (!onBoard(tx, ty)) return;
    const to = ty * 9 + tx;
    if (position.board[to]?.side !== piece.side) moves.push({ from, to });
  };
  switch (piece.type) {
    case "king":
    case "advisor":
      for (const [dx, dy] of piece.type === "king" ? orthogonal : diagonal) {
        const tx = x + dx;
        const ty = y + dy;
        if (inPalace(tx, ty, piece.side)) add(tx, ty);
      }
      break;
    case "elephant":
      for (const [dx, dy] of diagonal) {
        const tx = x + 2 * dx;
        const ty = y + 2 * dy;
        if (
          onBoard(tx, ty) &&
          (piece.side === "red" ? ty >= 5 : ty <= 4) &&
          !position.board[(y + dy) * 9 + x + dx]
        )
          add(tx, ty);
      }
      break;
    case "horse":
      for (const [dx, dy] of horses) {
        const legX = x + (Math.abs(dx) === 2 ? Math.sign(dx) : 0);
        const legY = y + (Math.abs(dy) === 2 ? Math.sign(dy) : 0);
        if (onBoard(legX, legY) && !position.board[legY * 9 + legX]) {
          add(x + dx, y + dy);
        }
      }
      break;
    case "rook":
    case "cannon":
      for (const [dx, dy] of orthogonal) {
        let screened = false;
        for (
          let tx = x + dx, ty = y + dy;
          onBoard(tx, ty);
          tx += dx, ty += dy
        ) {
          const target = position.board[ty * 9 + tx];
          if (!screened) {
            if (!target) add(tx, ty);
            else if (piece.type === "rook") {
              add(tx, ty);
              break;
            } else screened = true;
          } else if (target) {
            add(tx, ty);
            break;
          }
        }
      }
      break;
    case "pawn":
      add(x, y + (piece.side === "red" ? -1 : 1));
      if (piece.side === "red" ? y <= 4 : y >= 5) {
        add(x - 1, y);
        add(x + 1, y);
      }
      break;
  }
}

export function isInCheck(position: Position, side: Side): boolean {
  const king = position.board.findIndex(
    (piece) => piece?.type === "king" && piece.side === side,
  );
  if (king < 0) throw new Error("INVALID_POSITION");
  const opponent: Side = side === "red" ? "black" : "red";
  const enemyKing = position.board.findIndex(
    (piece) => piece?.type === "king" && piece.side === opponent,
  );
  if (enemyKing >= 0 && king % 9 === enemyKing % 9) {
    let facing = true;
    for (
      let index = Math.min(king, enemyKing) + 9;
      index < Math.max(king, enemyKing);
      index += 9
    ) {
      if (position.board[index]) {
        facing = false;
        break;
      }
    }
    if (facing) return true;
  }
  return pseudoLegalMoves({ ...position, turn: opponent }).some(
    (move) => move.to === king,
  );
}

function applyUnchecked(position: Position, move: Move): Position {
  const board = position.board.slice();
  const captured = board[move.to];
  board[move.to] = board[move.from]!;
  board[move.from] = null;
  return {
    board,
    turn: position.turn === "red" ? "black" : "red",
    halfmove: captured ? 0 : position.halfmove + 1,
    fullmove: position.fullmove + (position.turn === "black" ? 1 : 0),
  };
}

export function legalMoves(position: Position): Move[] {
  return pseudoLegalMoves(position).filter(
    (move) =>
      position.board[move.to]?.type !== "king" &&
      !isInCheck(applyUnchecked(position, move), position.turn),
  );
}

/** Rejects ILLEGAL_MOVE without altering the input. Server must check clocks first. */
export function playMove(position: Position, move: Move): Position {
  if (
    !legalMoves(position).some(
      (candidate) => candidate.from === move.from && candidate.to === move.to,
    )
  ) {
    throw new Error("ILLEGAL_MOVE");
  }
  return applyUnchecked(position, move);
}

/** Counts legal move paths without applying repetition/no-capture adjudication. */
export function perft(position: Position, depth: number): number {
  if (depth === 0) return 1;
  const moves = legalMoves(position);
  if (depth === 1) return moves.length;
  return moves.reduce(
    (nodes, move) => nodes + perft(applyUnchecked(position, move), depth - 1),
    0,
  );
}
