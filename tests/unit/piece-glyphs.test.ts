import { describe, it, expect } from 'vitest';
import { GLYPHS, VI_NAMES } from '../../apps/web/src/components/board/Piece.js';
import type { PieceType, Side } from '@xiangqi/contracts';

describe('T005-02: Piece glyphs and Vietnamese names', () => {
  const types: PieceType[] = [
    'GENERAL', 'ADVISOR', 'ELEPHANT', 'HORSE', 'ROOK', 'CANNON', 'PAWN',
  ];

  it('RED uses traditional red Han characters', () => {
    expect(GLYPHS.RED.GENERAL).toBe('帥');
    expect(GLYPHS.RED.ADVISOR).toBe('仕');
    expect(GLYPHS.RED.ELEPHANT).toBe('相');
    expect(GLYPHS.RED.HORSE).toBe('傌');
    expect(GLYPHS.RED.ROOK).toBe('俥');
    expect(GLYPHS.RED.CANNON).toBe('炮');
    expect(GLYPHS.RED.PAWN).toBe('兵');
  });

  it('BLACK uses traditional black Han characters', () => {
    expect(GLYPHS.BLACK.GENERAL).toBe('將');
    expect(GLYPHS.BLACK.ADVISOR).toBe('士');
    expect(GLYPHS.BLACK.ELEPHANT).toBe('象');
    expect(GLYPHS.BLACK.HORSE).toBe('馬');
    expect(GLYPHS.BLACK.ROOK).toBe('車');
    expect(GLYPHS.BLACK.CANNON).toBe('砲');
    expect(GLYPHS.BLACK.PAWN).toBe('卒');
  });

  it('all 14 piece variants have Vietnamese names', () => {
    for (const side of ['RED', 'BLACK'] as Side[]) {
      for (const t of types) {
        expect(VI_NAMES[side][t]).toBeDefined();
        expect(VI_NAMES[side][t].length).toBeGreaterThan(3);
      }
    }
  });

  it('red and black characters are distinct for every type', () => {
    for (const t of types) {
      expect(GLYPHS.RED[t]).not.toBe(GLYPHS.BLACK[t]);
    }
  });
});
