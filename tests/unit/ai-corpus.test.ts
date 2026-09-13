import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { searchBestMove } from '@xiangqi/ai';
import { getLegalMoves } from '@xiangqi/game-rules';
import {
  BENCHMARK_DEPTH,
  BENCHMARK_SEED,
  CORPUS_PATH,
  loadCorpus,
  parseCorpus,
} from '../ai/benchmark.js';
import { makePosition } from '../fixtures/positions.js';

/** Minimal valid corpus entry used as the base for the corruption cases below. */
function validCorpus(): unknown[] {
  return [
    {
      id: 'case-1',
      description: 'mô tả',
      category: 'TACTIC',
      turn: 'RED',
      pieces: [
        { id: 'rk', type: 'GENERAL', side: 'RED', x: 4, y: 0 },
        { id: 'bk', type: 'GENERAL', side: 'BLACK', x: 4, y: 9 },
      ],
    },
  ];
}

type MutableCorpus = {
  id: string;
  description: string;
  category: string;
  turn: string;
  pieces: { id: string; type: string; side: string; x: number; y: number }[];
}[];

describe('T023-01: AI corpus integrity (Zod validation at load time)', () => {
  it('loads exactly 20 structurally valid positions with both generals and legal moves', () => {
    const corpus = loadCorpus();

    expect(corpus).toHaveLength(20);
    expect(new Set(corpus.map((e) => e.id)).size).toBe(20);

    for (const entry of corpus) {
      // makePosition re-checks duplicate square/id and both-generals presence.
      const position = makePosition(entry.pieces, entry.turn);
      expect(position.turn).toBe(entry.turn);
      // A benchmark position must not be terminal for the side to move, otherwise
      // `searchBestMove` returns `move: null` and the comparison is meaningless.
      expect(getLegalMoves(position).length).toBeGreaterThan(0);
      expect(entry.description.trim().length).toBeGreaterThan(0);
    }
  });

  const corruptions: { name: string; patch: (corpus: MutableCorpus) => void; expected: RegExp }[] = [
    {
      name: 'unknown piece type (CHARIOT)',
      patch: (corpus) => {
        corpus[0]!.pieces[0]!.type = 'CHARIOT';
      },
      expected: /unknown type/,
    },
    {
      name: 'unknown side',
      patch: (corpus) => {
        corpus[0]!.pieces[0]!.side = 'GREEN';
      },
      expected: /unknown side/,
    },
    {
      name: 'out-of-range square (x = 9)',
      patch: (corpus) => {
        corpus[0]!.pieces[0]!.x = 9;
      },
      expected: /invalid square/,
    },
    {
      name: 'non-integer square (y = 1.5)',
      patch: (corpus) => {
        corpus[0]!.pieces[0]!.y = 1.5;
      },
      expected: /invalid square/,
    },
    {
      name: 'two pieces on one square',
      patch: (corpus) => {
        corpus[0]!.pieces[1]!.x = 4;
        corpus[0]!.pieces[1]!.y = 0;
      },
      expected: /two pieces on square/,
    },
    {
      name: 'duplicate piece id',
      patch: (corpus) => {
        corpus[0]!.pieces[1]!.id = 'rk';
      },
      expected: /duplicate piece id/,
    },
    {
      name: 'missing RED general',
      patch: (corpus) => {
        corpus[0]!.pieces = corpus[0]!.pieces.filter((p) => p.side !== 'RED');
      },
      expected: /missing the RED GENERAL/,
    },
    {
      name: 'missing BLACK general',
      patch: (corpus) => {
        corpus[0]!.pieces = corpus[0]!.pieces.filter((p) => p.side !== 'BLACK');
      },
      expected: /missing the BLACK GENERAL/,
    },
    {
      name: 'duplicate entry id',
      patch: (corpus) => {
        corpus.push(structuredClone(corpus[0]!));
      },
      expected: /duplicate entry id/,
    },
    {
      name: 'unknown turn',
      patch: (corpus) => {
        corpus[0]!.turn = 'WHITE';
      },
      expected: /unknown side/,
    },
    {
      name: 'empty pieces array',
      patch: (corpus) => {
        corpus[0]!.pieces = [];
      },
      expected: /non-empty array/,
    },
  ];

  it.each(corruptions)('rejects a deliberately corrupted corpus: $name', ({ patch, expected }) => {
    const corpus = structuredClone(validCorpus()) as MutableCorpus;
    patch(corpus);
    expect(() => parseCorpus(corpus, '<test>')).toThrow(expected);
  });

  it('rejects a non-array root document', () => {
    expect(() => parseCorpus({ positions: [] }, '<test>')).toThrow(/must be a JSON array/);
  });

  it('loadCorpus throws a clear error for a corrupted corpus file on disk', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'xiangqi-corpus-'));
    try {
      const badPath = path.join(dir, 'ai-corpus.json');
      const broken = structuredClone(validCorpus()) as MutableCorpus;
      broken[0]!.pieces[0]!.type = 'SOLDIER';
      fs.writeFileSync(badPath, JSON.stringify(broken), 'utf8');

      expect(() => loadCorpus(badPath)).toThrow(/Invalid AI corpus/);
      expect(() => loadCorpus(badPath)).toThrow(/unknown type/);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('ships the corpus at the documented path', () => {
    expect(fs.existsSync(CORPUS_PATH)).toBe(true);
    expect(fs.readFileSync(CORPUS_PATH, 'utf8')).toContain('ROOK');
    expect(fs.readFileSync(CORPUS_PATH, 'utf8')).not.toContain('CHARIOT');
    expect(fs.readFileSync(CORPUS_PATH, 'utf8')).not.toContain('SOLDIER');
  });
});

describe('T023-01b: Reproducibility (same seed and depth)', () => {
  it('returns identical score, node count, move and depth on repeated runs', () => {
    const entry = loadCorpus()[1]!; // tactical position
    const position = makePosition(entry.pieces, entry.turn);
    const input = {
      position,
      repetitionCounts: {},
      maxDepth: BENCHMARK_DEPTH,
      deadlineMonoMs: performance.now() + 10_000,
      algorithm: 'ALPHA_BETA' as const,
      seed: BENCHMARK_SEED,
    };

    const run1 = searchBestMove(input, () => performance.now(), () => false);
    const run2 = searchBestMove(input, () => performance.now(), () => false);

    expect(run1.score).toBe(run2.score);
    expect(run1.nodes).toBe(run2.nodes);
    expect(run1.move).toEqual(run2.move);
    expect(run1.completedDepth).toBe(run2.completedDepth);
  });
});
