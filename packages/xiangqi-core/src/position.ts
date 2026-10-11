export type Side = "red" | "black";
export type PieceType =
  "king" | "advisor" | "elephant" | "horse" | "rook" | "cannon" | "pawn";

export interface Piece {
  side: Side;
  type: PieceType;
}

/** Index = y * 9 + x; black starts at y=0 and red at y=9. */
export interface Position {
  board: (Piece | null)[];
  turn: Side;
  halfmove: number;
  fullmove: number;
}

export interface Move {
  from: number;
  to: number;
}

const pieceLetters: Record<PieceType, string> = {
  king: "k",
  advisor: "a",
  elephant: "b",
  horse: "n",
  rook: "r",
  cannon: "c",
  pawn: "p",
};

const letterPieces: Record<string, PieceType> = {
  k: "king",
  a: "advisor",
  b: "elephant",
  n: "horse",
  r: "rook",
  c: "cannon",
  p: "pawn",
};

const initialFen =
  "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1";

export function initialPosition(): Position {
  return parsePosition(initialFen);
}

/** Xiangqi FEN: n=horse, b=elephant, uppercase=red, w=red to move. */
export function parsePosition(fen: string): Position {
  const fields = fen.trim().split(/\s+/);
  const [placement, turn, castling, enPassant, halfmove, fullmove] = fields;
  if (
    fields.length !== 6 ||
    !placement ||
    (turn !== "w" && turn !== "b") ||
    castling !== "-" ||
    enPassant !== "-" ||
    !halfmove ||
    !fullmove ||
    !/^\d+$/.test(halfmove) ||
    !/^\d+$/.test(fullmove) ||
    !Number.isSafeInteger(Number(halfmove)) ||
    !Number.isSafeInteger(Number(fullmove)) ||
    Number(fullmove) < 1
  ) {
    throw new Error("INVALID_POSITION");
  }
  const rows = placement.split("/");
  const board: (Piece | null)[] = [];
  const kings = { red: 0, black: 0 };
  if (rows.length !== 10) throw new Error("INVALID_POSITION");
  for (const row of rows) {
    const rowStart = board.length;
    for (const symbol of row) {
      if (/^[1-9]$/.test(symbol)) {
        board.push(...Array<null>(Number(symbol)).fill(null));
      } else {
        const type = letterPieces[symbol.toLowerCase()];
        if (!type) throw new Error("INVALID_POSITION");
        const side = symbol === symbol.toUpperCase() ? "red" : "black";
        board.push({ side, type });
        if (type === "king") kings[side] += 1;
      }
    }
    if (board.length - rowStart !== 9) throw new Error("INVALID_POSITION");
  }
  if (kings.red !== 1 || kings.black !== 1) {
    throw new Error("INVALID_POSITION");
  }
  return {
    board,
    turn: turn === "w" ? "red" : "black",
    halfmove: Number(halfmove),
    fullmove: Number(fullmove),
  };
}

export function serializePosition(position: Position): string {
  const rows: string[] = [];
  for (let y = 0; y < 10; y += 1) {
    let row = "";
    let empty = 0;
    for (let x = 0; x < 9; x += 1) {
      const piece = position.board[y * 9 + x];
      if (!piece) {
        empty += 1;
      } else {
        if (empty) row += empty;
        empty = 0;
        const letter = pieceLetters[piece.type];
        row += piece.side === "red" ? letter.toUpperCase() : letter;
      }
    }
    if (empty) row += empty;
    rows.push(row);
  }
  return `${rows.join("/")} ${position.turn === "red" ? "w" : "b"} - - ${position.halfmove} ${position.fullmove}`;
}
