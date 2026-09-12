/**
 * Coordinate mapping between canonical board coordinates and view coordinates.
 *
 * Canonical:
 *   x: 0..8 (left to right from RED's perspective)
 *   y: 0..9 (bottom to top from RED's perspective; RED palace y=0..2, BLACK palace y=7..9)
 *
 * View:
 *   When orientation = 'RED':
 *     viewX = canonicalX, viewY = 9 - canonicalY (SVG top-left origin: y=0 is top)
 *   When orientation = 'BLACK':
 *     viewX = 8 - canonicalX, viewY = canonicalY
 */
import type { Square, Side } from '@xiangqi/contracts';

/** Convert canonical square to SVG grid coordinates (col 0..8, row 0..9 from top) */
export function canonicalToView(sq: Square, orientation: Side): { col: number; row: number } {
  if (orientation === 'RED') {
    return {
      col: sq.x,
      row: 9 - sq.y, // y=9 (BLACK back rank) at top (row 0), y=0 (RED back rank) at bottom (row 9)
    };
  } else {
    return {
      col: 8 - sq.x, // flipped horizontally
      row: sq.y,     // y=0 (RED back rank) at top (row 0), y=9 at bottom (row 9)
    };
  }
}

/** Convert SVG grid coordinates back to canonical square */
export function viewToCanonical(col: number, row: number, orientation: Side): Square {
  if (orientation === 'RED') {
    return {
      x: col,
      y: 9 - row,
    };
  } else {
    return {
      x: 8 - col,
      y: row,
    };
  }
}
