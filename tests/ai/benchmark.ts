/**
 * AI Benchmark suite: Minimax vs Alpha-Beta comparison.
 * Measures nodes visited, pruning efficiency, and execution time across the 20-position corpus.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { searchBestMove } from '../../packages/ai/src/index.js';
import { makePosition } from '../fixtures/positions.js';
import type { Position, PieceType, Side } from '../../packages/contracts/src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '../..');

interface CorpusEntry {
  id: string;
  description: string;
  category: string;
  turn: Side;
  pieces: { id: string; type: PieceType; side: Side; x: number; y: number }[];
}

export interface BenchmarkRow {
  id: string;
  description: string;
  depth: number;
  minimaxScore: number;
  minimaxNodes: number;
  minimaxTimeMs: number;
  alphaBetaScore: number;
  alphaBetaNodes: number;
  alphaBetaTimeMs: number;
  pruningRatio: number;
  scoresMatch: boolean;
}

export function runBenchmark(depth = 2): BenchmarkRow[] {
  const corpusPath = path.join(root, 'tests/fixtures/ai-corpus.json');
  const corpus: CorpusEntry[] = JSON.parse(fs.readFileSync(corpusPath, 'utf8'));

  const results: BenchmarkRow[] = [];

  for (const entry of corpus) {
    const position: Position = makePosition(entry.pieces, entry.turn);

    // 1. Run Minimax baseline
    const now1 = () => performance.now();
    const mmRes = searchBestMove(
      {
        position,
        repetitionCounts: {},
        maxDepth: depth,
        deadlineMonoMs: performance.now() + 60000,
        algorithm: 'MINIMAX',
        seed: 42,
      },
      now1,
      () => false,
    );

    // 2. Run Alpha-Beta with iterative deepening
    const now2 = () => performance.now();
    const abRes = searchBestMove(
      {
        position,
        repetitionCounts: {},
        maxDepth: depth,
        deadlineMonoMs: performance.now() + 60000,
        algorithm: 'ALPHA_BETA',
        seed: 42,
      },
      now2,
      () => false,
    );

    const pruningRatio = mmRes.nodes > 0 ? (mmRes.nodes - abRes.nodes) / mmRes.nodes : 0;
    const scoresMatch = mmRes.score === abRes.score;

    results.push({
      id: entry.id,
      description: entry.description,
      depth,
      minimaxScore: mmRes.score,
      minimaxNodes: mmRes.nodes,
      minimaxTimeMs: mmRes.elapsedMs,
      alphaBetaScore: abRes.score,
      alphaBetaNodes: abRes.nodes,
      alphaBetaTimeMs: abRes.elapsedMs,
      pruningRatio,
      scoresMatch,
    });
  }

  return results;
}

export function exportReports(results: BenchmarkRow[]): void {
  const outDir = path.join(root, 'docs/test-reports/ai');
  fs.mkdirSync(outDir, { recursive: true });

  // 1. JSON report
  fs.writeFileSync(
    path.join(outDir, 'benchmark-results.json'),
    JSON.stringify(results, null, 2),
    'utf8',
  );

  // 2. CSV report
  const headers = [
    'ID',
    'Description',
    'Depth',
    'Minimax Score',
    'Minimax Nodes',
    'Minimax Time (ms)',
    'AlphaBeta Score',
    'AlphaBeta Nodes',
    'AlphaBeta Time (ms)',
    'Pruning Ratio (%)',
    'Scores Match',
  ];

  const rows = results.map((r) => [
    r.id,
    `"${r.description}"`,
    r.depth,
    r.minimaxScore,
    r.minimaxNodes,
    r.minimaxTimeMs.toFixed(1),
    r.alphaBetaScore,
    r.alphaBetaNodes,
    r.alphaBetaTimeMs.toFixed(1),
    (r.pruningRatio * 100).toFixed(1),
    r.scoresMatch ? 'YES' : 'NO',
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  fs.writeFileSync(path.join(outDir, 'benchmark-results.csv'), csv, 'utf8');

  // Summary
  const totalMmNodes = results.reduce((acc, r) => acc + r.minimaxNodes, 0);
  const totalAbNodes = results.reduce((acc, r) => acc + r.alphaBetaNodes, 0);
  const avgPruning = ((totalMmNodes - totalAbNodes) / totalMmNodes) * 100;
  const matchCount = results.filter((r) => r.scoresMatch).length;

  console.log('=== AI BENCHMARK SUMMARY ===');
  console.log(`Positions tested: ${results.length}`);
  console.log(`Total Minimax Nodes: ${totalMmNodes}`);
  console.log(`Total Alpha-Beta Nodes: ${totalAbNodes}`);
  console.log(`Aggregate Pruning Efficiency: ${avgPruning.toFixed(2)}% reduction`);
  console.log(`Score Agreement: ${matchCount}/${results.length} (${((matchCount / results.length) * 100).toFixed(1)}%)`);
}

// Run standalone
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const results = runBenchmark(2);
  exportReports(results);
}
