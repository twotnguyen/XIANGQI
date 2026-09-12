import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { searchBestMove } from '@xiangqi/ai';
import { makePosition } from '../fixtures/positions.js';
import type { PieceType, Side } from '@xiangqi/contracts';

interface CorpusEntry {
  id: string;
  description: string;
  category: string;
  turn: Side;
  pieces: { id: string; type: PieceType; side: Side; x: number; y: number }[];
}

const corpusPath = path.resolve(__dirname, '../fixtures/ai-corpus.json');
const corpus: CorpusEntry[] = JSON.parse(fs.readFileSync(corpusPath, 'utf8'));

describe('T023-01: AI Corpus integrity', () => {
  it('contains exactly 20 validated benchmark positions', () => {
    expect(corpus.length).toBe(20);
  });

  it('all positions have valid structure and both generals', () => {
    for (const c of corpus) {
      expect(c.pieces.length).toBeGreaterThan(1);
      const pos = makePosition(c.pieces, c.turn);
      expect(pos.turn).toBe(c.turn);
    }
  });
});

describe('T023-02: Fixed-depth pruning efficiency (Alpha-Beta vs Minimax)', () => {
  it('Alpha-Beta visits fewer or equal nodes than Minimax across sample positions', () => {
    // Test first 5 tactical/endgame positions
    for (const entry of corpus.slice(0, 5)) {
      const pos = makePosition(entry.pieces, entry.turn);

      const mm = searchBestMove(
        {
          position: pos,
          repetitionCounts: {},
          maxDepth: 2,
          deadlineMonoMs: performance.now() + 10000,
          algorithm: 'MINIMAX',
          seed: 42,
        },
        () => performance.now(),
        () => false,
      );

      const ab = searchBestMove(
        {
          position: pos,
          repetitionCounts: {},
          maxDepth: 2,
          deadlineMonoMs: performance.now() + 10000,
          algorithm: 'ALPHA_BETA',
          seed: 42,
        },
        () => performance.now(),
        () => false,
      );

      // Invariant: Alpha-Beta must visit <= nodes compared to brute Minimax
      expect(ab.nodes).toBeLessThanOrEqual(mm.nodes);
    }
  });

  it('Reproducibility: same seed and depth produces identical results', () => {
    const entry = corpus[1]; // mate in 1
    const pos = makePosition(entry.pieces, entry.turn);

    const run1 = searchBestMove(
      {
        position: pos,
        repetitionCounts: {},
        maxDepth: 2,
        deadlineMonoMs: performance.now() + 5000,
        algorithm: 'ALPHA_BETA',
        seed: 12345,
      },
      () => performance.now(),
      () => false,
    );

    const run2 = searchBestMove(
      {
        position: pos,
        repetitionCounts: {},
        maxDepth: 2,
        deadlineMonoMs: performance.now() + 5000,
        algorithm: 'ALPHA_BETA',
        seed: 12345,
      },
      () => performance.now(),
      () => false,
    );

    expect(run1.score).toBe(run2.score);
    expect(run1.nodes).toBe(run2.nodes);
    expect(run1.move).toEqual(run2.move);
  });
});
