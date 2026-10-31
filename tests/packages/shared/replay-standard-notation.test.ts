import { describe, expect, it } from "vitest";
import {
  initialPosition,
  parsePosition,
  playMove,
  serializePosition,
} from "@xiangqi/xiangqi-core";
import { buildPgn, type ReplayExportSource } from "@xiangqi/shared";

// Hằng số FEN chuẩn cờ tướng viết tay, không lấy từ output của hàm đang kiểm (AC-YC4-RV-05).
const START =
  "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1";
const AFTER_CANNON =
  "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C2C4/9/RNBAKABNR b - - 1 1";

describe("FEN và PGN theo ký hiệu chuẩn (AC-YC4-RV-05)", () => {
  it("FEN dùng chữ hoa cho Đỏ, w là Đỏ đi, b là Đen đi", () => {
    expect(serializePosition(initialPosition())).toBe(START);
    const first = playMove(initialPosition(), { from: 70, to: 67 });
    expect(serializePosition(first)).toBe(AFTER_CANNON);
    expect(serializePosition(parsePosition(AFTER_CANNON))).toBe(AFTER_CANNON);
  });

  it("PGN ghi nước bằng ICCS (hàng 0 phía Đỏ), FEN bắt đầu và kết quả", () => {
    const first = playMove(initialPosition(), { from: 70, to: 67 });
    const second = playMove(first, { from: 1, to: 20 });
    const source: ReplayExportSource = {
      id: "g1",
      mode: "AI",
      side: "red",
      positions: [initialPosition(), first, second].map((p) => ({
        fen: serializePosition(p),
        turn: p.turn,
      })),
      moves: [
        { from: 70, to: 67, side: "red" },
        { from: 1, to: 20, side: "black" },
      ],
      result: { reason: "RESIGN", winner: "red" },
    };
    const pgn = buildPgn(source);
    expect(pgn).toContain(`[FEN "${START}"]`);
    expect(pgn).toContain('[Result "1-0"]');
    expect(pgn).toContain("1. h2e2 b9c7");
    expect(pgn.trimEnd().endsWith("1-0")).toBe(true);
  });
});
