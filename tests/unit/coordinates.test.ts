import { describe, it, expect } from 'vitest';
import { canonicalToView, viewToCanonical } from '../../apps/web/src/components/board/coordinates.js';
import type { Square } from '@xiangqi/contracts';

describe('T005-01: Coordinate mapping', () => {
  it('RED orientation round-trip for all 90 squares', () => {
    for (let x = 0; x <= 8; x++) {
      for (let y = 0; y <= 9; y++) {
        const sq: Square = { x, y };
        const view = canonicalToView(sq, 'RED');
        const back = viewToCanonical(view.col, view.row, 'RED');
        expect(back).toEqual(sq);
      }
    }
  });

  it('BLACK orientation round-trip for all 90 squares', () => {
    for (let x = 0; x <= 8; x++) {
      for (let y = 0; y <= 9; y++) {
        const sq: Square = { x, y };
        const view = canonicalToView(sq, 'BLACK');
        const back = viewToCanonical(view.col, view.row, 'BLACK');
        expect(back).toEqual(sq);
      }
    }
  });

  it('RED orientation places RED palace (y=0..2) at bottom (rows 7..9)', () => {
    const redGeneral = canonicalToView({ x: 4, y: 0 }, 'RED');
    expect(redGeneral.col).toBe(4);
    expect(redGeneral.row).toBe(9); // bottom row

    const blackGeneral = canonicalToView({ x: 4, y: 9 }, 'RED');
    expect(blackGeneral.col).toBe(4);
    expect(blackGeneral.row).toBe(0); // top row
  });

  it('BLACK orientation flips board: BLACK palace at bottom, columns reversed', () => {
    // When looking from BLACK perspective:
    // BLACK general at canonical (4,9) should be at view bottom
    const blackGeneral = canonicalToView({ x: 4, y: 9 }, 'BLACK');
    expect(blackGeneral.row).toBe(9); // at bottom
    expect(blackGeneral.col).toBe(4); // 8 - 4 = 4

    // RED general at canonical (4,0) should be at view top
    const redGeneral = canonicalToView({ x: 4, y: 0 }, 'BLACK');
    expect(redGeneral.row).toBe(0); // at top

    // Leftmost column (x=0 from RED) becomes rightmost (col=8) from BLACK
    const leftPiece = canonicalToView({ x: 0, y: 0 }, 'BLACK');
    expect(leftPiece.col).toBe(8);
  });

  it('Acceptance: flipped board emits canonical coordinates', () => {
    // When orientation is BLACK, clicking view (col=8, row=3)
    // corresponds to canonical:
    // x = 8 - 8 = 0, y = 3
    const canonical = viewToCanonical(8, 3, 'BLACK');
    expect(canonical).toEqual({ x: 0, y: 3 });
    // This proves the server coordinates are NOT flipped
  });
});
