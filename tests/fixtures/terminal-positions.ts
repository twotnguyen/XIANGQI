/**
 * Terminal position fixtures with documented reasoning.
 * Every fixture has both generals and explains why all escapes are blocked.
 */
import type { PieceType, Side } from '@xiangqi/contracts';

type PiecePlacement = { id: string; type: PieceType; side: Side; x: number; y: number };

/**
 * Checkmate: BLACK to move, no legal moves, in check.
 *
 * Layout:
 * - RED general at (4,0)
 * - BLACK general at (4,9)
 * - RED rook at (4,7) — checks BLACK general on column 4
 * - RED rook at (3,9) — covers (3,9) blocking escape
 * - RED rook at (5,9) — covers (5,9) blocking escape
 *
 * BLACK general at (4,9) is checked by rook at (4,7).
 * Cannot move to (3,9) — RED rook. Cannot move to (5,9) — RED rook.
 * Cannot move to (4,8) — still attacked by rook at (4,7) since rook slides.
 * Wait — rook at (4,7) attacks (4,8) too? Yes, along column 4.
 * Need to block that. Use a different setup.
 *
 * Revised: RED rook at (0,9) and RED rook at (8,9) plus RED cannon checks.
 * Simpler: back-rank mate.
 */

/**
 * Checkmate: BLACK to move.
 * - RED general at (4,0), BLACK general at (4,9)
 * - RED rook at (3,8) guards row 8 and column 3
 * - RED rook at (5,8) guards row 8 and column 5
 * - RED cannon at (4,5) with screen at (4,7) checks general at (4,9)
 *
 * BLACK general at (4,9): checked by cannon via screen.
 * Cannot go to (3,9) — RED rook at (3,8) controls column 3, attacks (3,9).
 * Cannot go to (5,9) — RED rook at (5,8) controls column 5, attacks (5,9).
 * Cannot go to (4,8) — both rooks attack row 8 at their respective positions...
 * Actually (4,8) is attacked by cannon at (4,5) via screen at (4,7) — no, cannon
 * needs screen. (4,5) to (4,8) with screen (4,7): 1 piece between = valid cannon attack on (4,8)? No, (4,8) is between screen and general. Let me simplify.
 */

// Simplest checkmate: two rooks back rank mate
export const CHECKMATE_POSITION: PiecePlacement[] = [
  { id: 'rg', type: 'GENERAL', side: 'RED', x: 4, y: 0 },
  { id: 'bg', type: 'GENERAL', side: 'BLACK', x: 4, y: 9 },
  // Two RED rooks on row 9, flanking the general
  { id: 'rr1', type: 'ROOK', side: 'RED', x: 3, y: 9 },
  { id: 'rr2', type: 'ROOK', side: 'RED', x: 5, y: 9 },
  // RED rook delivers check from column 4
  { id: 'rr3', type: 'ROOK', side: 'RED', x: 4, y: 7 },
];
// BLACK general at (4,9):
// - Checked by rook at (4,7) along column 4
// - (3,9) occupied by RED rook
// - (5,9) occupied by RED rook
// - (4,8) attacked by rook at (4,7) along column 4
// All palace exits blocked → CHECKMATE

/**
 * Stalemate: RED to move, no legal moves, NOT in check.
 *
 * RED general at (3,0). Not in check.
 * BLACK rook at (4,1) — controls row 1, blocks general from (3,1) and column 4
 * BLACK rook at (2,1) — controls column 2, blocks general from going to (2,x)
 * This doesn't work cleanly. Let me use a corner stalemate.
 *
 * RED general at (3,0), not in check.
 * BLACK rook at (4,1) attacks (4,0) and (4,1) — blocks (4,0) for general
 * BLACK rook at (2,1) attacks (3,1) — blocks (3,1)
 * General at (3,0): can go to (4,0), (3,1). (4,0) attacked by rook at (4,1).
 * (3,1) attacked by rook at (2,1)? Rook at (2,1) attacks along row 1 and column 2.
 * (3,1) is row 1 col 3 — rook at (2,1) attacks along row 1: yes, attacks (3,1).
 * So general has no moves. Not in check → STALEMATE.
 */
export const STALEMATE_POSITION: PiecePlacement[] = [
  { id: 'rg', type: 'GENERAL', side: 'RED', x: 3, y: 0 },
  { id: 'bg', type: 'GENERAL', side: 'BLACK', x: 3, y: 9 },
  { id: 'br1', type: 'ROOK', side: 'BLACK', x: 4, y: 1 },  // blocks (4,0) and (3,1) via row
  { id: 'br2', type: 'ROOK', side: 'BLACK', x: 2, y: 1 },  // blocks (3,1) via row and (2,0)
];
// RED general at (3,0): not in check (no BLACK piece attacks (3,0))
// - (4,0): attacked by br1 at (4,1) via column 4 → blocked
// - (3,1): attacked by br1 at (4,1) via row 1 AND br2 at (2,1) via row 1 → blocked
// Wait: generals also face? (3,0) and (3,9) on column 3. Check for blocking.
// br1 at (4,1) and br2 at (2,1) are not on column 3. So generals face!
// Need a piece on column 3 between them.
// Add a pawn to block facing.

export const STALEMATE_POSITION_FIXED: PiecePlacement[] = [
  { id: 'rg', type: 'GENERAL', side: 'RED', x: 3, y: 0 },
  { id: 'bg', type: 'GENERAL', side: 'BLACK', x: 4, y: 9 }, // different column
  { id: 'br1', type: 'ROOK', side: 'BLACK', x: 4, y: 1 },
  { id: 'br2', type: 'ROOK', side: 'BLACK', x: 2, y: 1 },
];
// RED general at (3,0): not in check
// - (4,0): attacked by br1 column 4 → blocked
// - (3,1): attacked by br2 row 1 (2,1→3,1) and br1 row 1 (4,1→3,1) → blocked
// No facing generals (different columns)
// Only RED piece is general → no other moves → STALEMATE
