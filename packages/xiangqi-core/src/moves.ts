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

function add(
  board: (Piece | null)[],
  side: Side,
  from: number,
  tx: number,
  ty: number,
  moves: Move[],
  target: number | undefined,
): void {
  if (!onBoard(tx, ty)) return;
  const to = ty * 9 + tx;
  if ((target === undefined || to === target) && board[to]?.side !== side)
    moves.push({ from, to });
}

function pieceMoves(
  position: Position,
  piece: Piece,
  from: number,
  moves: Move[],
  target?: number,
): void {
  const board = position.board;
  const side = piece.side;
  const x = from % 9;
  const y = (from - x) / 9;
  switch (piece.type) {
    case "king":
    case "advisor": {
      const steps = piece.type === "king" ? orthogonal : diagonal;
      for (let index = 0; index < 4; index++) {
        const tx = x + steps[index]![0];
        const ty = y + steps[index]![1];
        if (inPalace(tx, ty, side))
          add(board, side, from, tx, ty, moves, target);
      }
      break;
    }
    case "elephant":
      for (let index = 0; index < 4; index++) {
        const dx = diagonal[index]![0];
        const dy = diagonal[index]![1];
        const tx = x + 2 * dx;
        const ty = y + 2 * dy;
        if (
          onBoard(tx, ty) &&
          (side === "red" ? ty >= 5 : ty <= 4) &&
          !board[(y + dy) * 9 + x + dx]
        )
          add(board, side, from, tx, ty, moves, target);
      }
      break;
    case "horse":
      for (let index = 0; index < 8; index++) {
        const dx = horses[index]![0];
        const dy = horses[index]![1];
        const legX = x + (Math.abs(dx) === 2 ? Math.sign(dx) : 0);
        const legY = y + (Math.abs(dy) === 2 ? Math.sign(dy) : 0);
        if (onBoard(legX, legY) && !board[legY * 9 + legX])
          add(board, side, from, x + dx, y + dy, moves, target);
      }
      break;
    case "rook":
    case "cannon":
      for (let direction = 0; direction < 4; direction++) {
        const dx = orthogonal[direction]![0];
        const dy = orthogonal[direction]![1];
        let screened = false;
        for (
          let tx = x + dx, ty = y + dy;
          onBoard(tx, ty);
          tx += dx, ty += dy
        ) {
          const occupant = board[ty * 9 + tx];
          if (!screened) {
            if (!occupant) add(board, side, from, tx, ty, moves, target);
            else if (piece.type === "rook") {
              add(board, side, from, tx, ty, moves, target);
              break;
            } else screened = true;
          } else if (occupant) {
            add(board, side, from, tx, ty, moves, target);
            break;
          }
        }
      }
      break;
    case "pawn":
      add(board, side, from, x, y + (side === "red" ? -1 : 1), moves, target);
      if (side === "red" ? y <= 4 : y >= 5) {
        add(board, side, from, x - 1, y, moves, target);
        add(board, side, from, x + 1, y, moves, target);
      }
      break;
  }
}

/** Vị trí Tướng của `side`: tìm trong cung trước (hầu như luôn có), chỉ quét cả bàn khi Tướng ra ngoài cung. */
function findKing(board: (Piece | null)[], side: Side): number {
  const top = side === "red" ? 7 : 0;
  for (let y = top; y < top + 3; y++)
    for (let index = y * 9 + 3; index < y * 9 + 6; index++) {
      const piece = board[index];
      if (piece?.type === "king" && piece.side === side) return index;
    }
  for (let index = 0; index < 90; index++) {
    const piece = board[index];
    if (piece?.type === "king" && piece.side === side) return index;
  }
  return -1;
}

/**
 * Kiểm tra xem bên chỉ định (Đỏ hoặc Đen) có đang bị chiếu tướng hay không.
 * Xử lý cả luật hai Tướng đối mặt (lộ mặt tướng trên cùng cột mà không có quân cản ở giữa).
 */
export function isInCheck(position: Position, side: Side): boolean {
  const board = position.board;
  const king = findKing(board, side);
  const enemyKing = findKing(board, side === "red" ? "black" : "red");
  if (king < 0) throw new Error("INVALID_POSITION");
  if (enemyKing >= 0 && king % 9 === enemyKing % 9) {
    let facing = true;
    for (
      let index = Math.min(king, enemyKing) + 9;
      index < Math.max(king, enemyKing);
      index += 9
    ) {
      if (board[index]) {
        facing = false;
        break;
      }
    }
    if (facing) return true;
  }
  const opponent: Side = side === "red" ? "black" : "red";
  const kx = king % 9;
  const ky = (king - kx) / 9;
  // Mỗi quân đối phương chỉ cần được kiểm tra từ phía ô Tướng: cùng luật chặn/cung/sông như pieceMoves.
  for (let direction = 0; direction < 4; direction++) {
    const dx = orthogonal[direction]![0];
    const dy = orthogonal[direction]![1];
    let screened = false;
    for (let tx = kx + dx, ty = ky + dy; onBoard(tx, ty); tx += dx, ty += dy) {
      const piece = board[ty * 9 + tx];
      if (!piece) continue;
      if (!screened) {
        if (piece.side === opponent && piece.type === "rook") return true;
        screened = true;
      } else {
        if (piece.side === opponent && piece.type === "cannon") return true;
        break;
      }
    }
  }
  for (let index = 0; index < 8; index++) {
    const dx = horses[index]![0];
    const dy = horses[index]![1];
    const hx = kx - dx;
    const hy = ky - dy;
    if (!onBoard(hx, hy)) continue;
    const piece = board[hy * 9 + hx];
    if (piece?.side !== opponent || piece.type !== "horse") continue;
    const legX = hx + (Math.abs(dx) === 2 ? Math.sign(dx) : 0);
    const legY = hy + (Math.abs(dy) === 2 ? Math.sign(dy) : 0);
    if (!board[legY * 9 + legX]) return true;
  }
  for (let index = 0; index < 4; index++) {
    const dx = diagonal[index]![0];
    const dy = diagonal[index]![1];
    // Tượng: đứng cách 2 ô chéo, không bị cản mắt và ô Tướng nằm nửa sân của Tượng.
    const ex = kx + 2 * dx;
    const ey = ky + 2 * dy;
    if (onBoard(ex, ey)) {
      const piece = board[ey * 9 + ex];
      if (
        piece?.side === opponent &&
        piece.type === "elephant" &&
        (opponent === "red" ? ky >= 5 : ky <= 4) &&
        !board[(ky + dy) * 9 + kx + dx]
      )
        return true;
    }
    // Sĩ: sát chéo, ô Tướng nằm trong cung của Sĩ.
    const ax = kx + dx;
    const ay = ky + dy;
    if (onBoard(ax, ay) && inPalace(kx, ky, opponent)) {
      const piece = board[ay * 9 + ax];
      if (piece?.side === opponent && piece.type === "advisor") return true;
    }
  }
  if (inPalace(kx, ky, opponent)) {
    for (let index = 0; index < 4; index++) {
      const tx = kx + orthogonal[index]![0];
      const ty = ky + orthogonal[index]![1];
      if (!onBoard(tx, ty)) continue;
      const piece = board[ty * 9 + tx];
      if (piece?.side === opponent && piece.type === "king") return true;
    }
  }
  // Tốt: tiến thẳng, hoặc đi ngang khi đã qua sông.
  const forward = opponent === "red" ? -1 : 1;
  if (onBoard(kx, ky - forward)) {
    const piece = board[(ky - forward) * 9 + kx];
    if (piece?.side === opponent && piece.type === "pawn") return true;
  }
  if (opponent === "red" ? ky <= 4 : ky >= 5) {
    for (let side2 = -1; side2 <= 1; side2 += 2) {
      if (!onBoard(kx + side2, ky)) continue;
      const piece = board[ky * 9 + kx + side2];
      if (piece?.side === opponent && piece.type === "pawn") return true;
    }
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
  const moves = pseudoLegalMoves(position);
  let kept = 0;
  for (const move of moves)
    if (isLegalCandidate(position, move)) moves[kept++] = move;
  moves.length = kept;
  return moves;
}

/**
 * Thử nước đi trực tiếp trên bàn cờ của `position` rồi hoàn tác ngay (đồng bộ, không để lại dấu vết),
 * tránh sao chép bàn cờ cho mỗi nước ứng viên. Không bao giờ nhận nước ăn Tướng.
 */
function isLegalCandidate(position: Position, move: Move): boolean {
  const board = position.board;
  const captured = board[move.to];
  if (captured?.type === "king") return false;
  const moving = board[move.from]!;
  board[move.to] = moving;
  board[move.from] = null;
  try {
    return !isInCheck(position, position.turn);
  } finally {
    board[move.from] = moving;
    board[move.to] = captured ?? null;
  }
}

// Adjudication only needs one legal reply, not every reply's check evaluation.
export function hasLegalMove(position: Position): boolean {
  for (const move of pseudoLegalMoves(position))
    if (isLegalCandidate(position, move)) return true;
  return false;
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
