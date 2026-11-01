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

/**
 * Sinh danh sách các nước đi giả định (pseudo-legal) theo quy tắc hình học di chuyển của từng quân cờ
 * (Tướng/Sĩ trong cung, Tượng không qua sông và kiểm tra cản tượng, Mã kiểm tra cản chân mã,
 * Xe/Pháo đi thẳng và Pháo cần ngòi khi ăn quân, Tốt tiến và đi ngang sau khi qua sông).
 * Chưa kiểm tra xem nước đi có khiến Tướng bên mình bị chiếu hay không.
 */
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
  target?: number,
): void {
  const x = from % 9;
  const y = Math.floor(from / 9);
  const add = (tx: number, ty: number): void => {
    if (!onBoard(tx, ty)) return;
    const to = ty * 9 + tx;
    if (
      (target === undefined || to === target) &&
      position.board[to]?.side !== piece.side
    )
      moves.push({ from, to });
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

/**
 * Kiểm tra xem bên chỉ định (Đỏ hoặc Đen) có đang bị chiếu tướng hay không.
 * Xử lý cả luật hai Tướng đối mặt (lộ mặt tướng trên cùng cột mà không có quân cản ở giữa).
 */
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
  const moves: Move[] = [];
  const kingX = king % 9,
    kingY = Math.floor(king / 9);
  for (let from = 0; from < 90; from++) {
    const piece = position.board[from];
    if (!piece || piece.side !== opponent) continue;
    const dx = Math.abs((from % 9) - kingX);
    const dy = Math.abs(Math.floor(from / 9) - kingY);
    // Only prefilter reach; pieceMoves still decides all blocking/palace/river rules.
    if (piece.type === "rook" || piece.type === "cannon") {
      if (dx !== 0 && dy !== 0) continue;
    } else if (piece.type === "horse") {
      if (!((dx === 2 && dy === 1) || (dx === 1 && dy === 2))) continue;
    } else if (piece.type === "elephant") {
      if (dx !== 2 || dy !== 2) continue;
    } else if (dx > 1 || dy > 1) continue;
    pieceMoves(position, piece, from, moves, king);
    if (moves.length) return true;
  }
  return false;
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

/**
 * Trả về danh sách tất cả các nước đi hợp lệ tuyệt đối của bên đang đến lượt.
 * Loại bỏ các nước ăn tướng trực tiếp và các nước đi khiến Tướng bên mình bị chiếu.
 */
export function legalMoves(position: Position): Move[] {
  return pseudoLegalMoves(position).filter((move) =>
    isLegalCandidate(position, move),
  );
}

function isLegalCandidate(position: Position, move: Move): boolean {
  return (
    position.board[move.to]?.type !== "king" &&
    !isInCheck(applyUnchecked(position, move), position.turn)
  );
}

// Adjudication only needs one legal reply, not every reply's check evaluation.
export function hasLegalMove(position: Position): boolean {
  return pseudoLegalMoves(position).some((move) =>
    isLegalCandidate(position, move),
  );
}

/**
 * Thực hiện một nước đi trên bàn cờ và trả về thế cờ mới.
 * Kiểm tra tính hợp lệ nghiêm ngặt: đúng lượt, đúng luật di chuyển của quân, không ăn tướng và không để Tướng bên mình bị chiếu.
 * Ném lỗi "ILLEGAL_MOVE" nếu nước đi không hợp lệ.
 */
export function playMove(position: Position, move: Move): Position {
  const piece = position.board[move.from];
  const candidates: Move[] = [];
  if (Number.isInteger(move.from) && piece?.side === position.turn)
    pieceMoves(position, piece, move.from, candidates);
  if (
    position.board[move.to]?.type === "king" ||
    !candidates.some(
      (candidate) => candidate.from === move.from && candidate.to === move.to,
    )
  ) {
    throw new Error("ILLEGAL_MOVE");
  }
  const next = applyUnchecked(position, move);
  if (isInCheck(next, position.turn)) throw new Error("ILLEGAL_MOVE");
  return next;
}

/**
 * Thuật toán Perft (Performance Test): Đếm tổng số nút thế cờ lá ở độ sâu `depth`.
 * Dùng để kiểm thử tính chính xác và hiệu năng của bộ sinh nước đi và luật cờ.
 */
export function perft(position: Position, depth: number): number {
  if (depth === 0) return 1;
  const moves = legalMoves(position);
  if (depth === 1) return moves.length;
  return moves.reduce(
    (nodes, move) => nodes + perft(applyUnchecked(position, move), depth - 1),
    0,
  );
}
