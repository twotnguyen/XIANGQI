import { describe, it, expect, beforeAll } from 'vitest';
import path from 'node:path';
import {
  BENCHMARK_DEPTH,
  BENCHMARK_SEED,
  exportReports,
  loadCorpus,
  runBenchmark,
  summarize,
  type BenchmarkRow,
} from './benchmark.js';
import { makePosition } from '../fixtures/positions.js';
import { validateMove } from '@xiangqi/game-rules';

describe('T023-02: Fixed-depth Minimax vs Alpha-Beta benchmark (20 positions)', () => {
  const corpus = loadCorpus();
  const byId = new Map(corpus.map((entry) => [entry.id, entry]));
  let results: BenchmarkRow[] = [];
  const exportDir = process.env['AI_BENCH_EXPORT_DIR'];

  beforeAll(() => {
    results = runBenchmark();
  });

  it('runs every corpus position with identical search inputs and equal completed depth', () => {
    expect(results.map((r) => r.id)).toEqual(corpus.map((e) => e.id));

    // Fair comparison: same position, depth, seed and deadline. Both search paths share the same
    // evaluation function (a single `evaluate` import in the AI package), so identical scores at
    // equal completed depth are the observable proof that evaluation is shared.
    const inputMismatches = results
      .filter((r) => r.depth !== BENCHMARK_DEPTH || r.seed !== BENCHMARK_SEED)
      .map((r) => r.id);
    const depthMismatches = results
      .filter((r) => !r.depthsMatch)
      .map((r) => `${r.id} (minimax@${r.minimaxCompletedDepth} vs alphaBeta@${r.alphaBetaCompletedDepth})`);

    expect(inputMismatches).toEqual([]);
    expect(depthMismatches).toEqual([]);
  });

  it('both algorithms return a legal move and a finite score for every position', () => {
    const noMove: string[] = [];
    const nonFinite: string[] = [];
    const illegal: string[] = [];

    for (const row of results) {
      const entry = byId.get(row.id);
      if (!entry) throw new Error(`benchmark row ${row.id} has no corpus entry`);
      const position = makePosition(entry.pieces, entry.turn);

      for (const [algorithm, move, score] of [
        ['MINIMAX', row.minimaxMove, row.minimaxScore],
        ['ALPHA_BETA', row.alphaBetaMove, row.alphaBetaScore],
      ] as const) {
        if (move === null) {
          noMove.push(`${row.id}:${algorithm}`);
          continue;
        }
        if (!Number.isFinite(score)) {
          nonFinite.push(`${row.id}:${algorithm}=${String(score)}`);
        }
        const verdict = validateMove(position, move);
        if (!verdict.valid) {
          illegal.push(
            `${row.id}:${algorithm} ${move.from.x},${move.from.y}->${move.to.x},${move.to.y} (${verdict.reason})`,
          );
        }
      }
    }

    expect(nonFinite).toEqual([]);
    expect(noMove).toEqual([]);
    expect(illegal).toEqual([]);
  });

  it('scores agree for every position at the same completed depth', () => {
    const mismatches = results
      .filter((row) => !row.scoresMatch)
      .map(
        (row) =>
          `${row.id}: minimax=${row.minimaxScore} (nodes=${row.minimaxNodes}) vs alphaBeta=${row.alphaBetaScore} (nodes=${row.alphaBetaNodes})`,
      );
    expect(mismatches).toEqual([]);
  });

  it('reports aggregate pruning together with positions where alpha-beta visits more nodes', () => {
    const totalMinimax = results.reduce((acc, r) => acc + r.minimaxNodes, 0);
    const totalAlphaBeta = results.reduce((acc, r) => acc + r.alphaBetaNodes, 0);
    const worseIds = results
      .filter((r) => r.alphaBetaNodes > r.minimaxNodes)
      .map((r) => r.id)
      .sort();
    const aggregate = summarize(results);

    // Aggregate (node-weighted) claim only; per-position node counts are NOT monotone because
    // alpha-beta runs iterative deepening plus PV ordering.
    expect(totalAlphaBeta).toBeLessThan(totalMinimax);
    expect(aggregate.totalMinimaxNodes).toBe(totalMinimax);
    expect(aggregate.totalAlphaBetaNodes).toBe(totalAlphaBeta);
    // F-25 guard: the summary must expose, not hide, the positions that favor minimax.
    expect(aggregate.positionsWhereAlphaBetaVisitedMore).toBe(worseIds.length);
    expect([...aggregate.positionIdsWhereAlphaBetaVisitedMore].sort()).toEqual(worseIds);
  });

  it('exports the curated report only when explicitly requested', () => {
    if (!exportDir) return;
    const aggregate = exportReports(results, path.resolve(process.cwd(), exportDir));
    expect(aggregate.positions).toBe(20);
    expect(aggregate.depthsMatchAll).toBe(true);
    expect(aggregate.scoreAgreement).toBe(20);
  });
});
