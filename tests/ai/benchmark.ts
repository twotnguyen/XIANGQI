/**
 * AI Benchmark suite: Minimax vs Alpha-Beta comparison at a fixed depth.
 *
 * Measures nodes visited, per-position pruning and execution time across the 20-position
 * corpus in `tests/fixtures/ai-corpus.json`. The corpus is validated with the Zod schemas
 * exported by `@xiangqi/contracts` before any search runs, so an invalid corpus fails loudly
 * instead of producing non-finite scores.
 *
 * Reports are written to `artifacts/ai-benchmark/` by default (gitignored). The curated copy in
 * `docs/test-reports/ai/` is only written by the explicit `pnpm run bench:ai:export` script, so
 * `pnpm test:ai` never rewrites tracked files.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { searchBestMove } from '../../packages/ai/src/index.js';
import { makePosition } from '../fixtures/positions.js';
import {
  PieceTypeSchema,
  SideSchema,
  SquareSchema,
  squareToIndex,
} from '../../packages/contracts/src/index.js';
import type { Move, PieceType, Position, Side } from '../../packages/contracts/src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '../..');

export const CORPUS_PATH = path.join(root, 'tests/fixtures/ai-corpus.json');
/** Default report destination — inside the gitignored `/artifacts/` tree. */
export const DEFAULT_REPORT_DIR = path.join(root, 'artifacts/ai-benchmark');
/** Curated, tracked report destination used by `pnpm run bench:ai:export`. */
export const CURATED_REPORT_DIR = path.join(root, 'docs/test-reports/ai');

/** Fixed depth for both algorithms so pruning is isolated from the time budget. */
export const BENCHMARK_DEPTH = 2;
/** Fixed seed for both algorithms — shared search inputs are the fairness contract. */
export const BENCHMARK_SEED = 42;
/** Per-position wall-clock budget; generous enough that a depth-2 search never aborts. */
export const BENCHMARK_DEADLINE_MS = 10_000;

export interface CorpusPiece {
  id: string;
  type: PieceType;
  side: Side;
  x: number;
  y: number;
}

export interface CorpusEntry {
  id: string;
  description: string;
  category: string;
  turn: Side;
  pieces: CorpusPiece[];
}

export interface BenchmarkRow {
  id: string;
  description: string;
  category: string;
  turn: Side;
  depth: number;
  seed: number;
  minimaxScore: number;
  minimaxNodes: number;
  minimaxTimeMs: number;
  minimaxCompletedDepth: number;
  minimaxMove: Move | null;
  alphaBetaScore: number;
  alphaBetaNodes: number;
  alphaBetaTimeMs: number;
  alphaBetaCompletedDepth: number;
  alphaBetaMove: Move | null;
  /** (minimaxNodes - alphaBetaNodes) / minimaxNodes; negative when alpha-beta visited more. */
  pruningRatio: number;
  /** minimaxNodes - alphaBetaNodes; negative when alpha-beta visited more. */
  nodeDelta: number;
  scoresMatch: boolean;
  depthsMatch: boolean;
}

export interface BenchmarkAggregate {
  positions: number;
  totalMinimaxNodes: number;
  totalAlphaBetaNodes: number;
  /**
   * Headline percentage: 100 * (sum(minimaxNodes) - sum(alphaBetaNodes)) / sum(minimaxNodes).
   * It is node-weighted over the whole corpus, NOT the mean of per-position ratios.
   */
  aggregatePruningPercent: number;
  /** Exact definition of `aggregatePruningPercent` so the number cannot be read as an invariant. */
  aggregatePruningDefinition: string;
  /** Positions where alpha-beta visited strictly MORE nodes than minimax (per-position ratio < 0). */
  positionsWhereAlphaBetaVisitedMore: number;
  positionIdsWhereAlphaBetaVisitedMore: string[];
  scoreAgreement: number;
  scoreAgreementPercent: number;
  depthsMatchAll: boolean;
}

// ── Corpus loading (Zod validation from @xiangqi/contracts) ──────────────────

function invalid(corpusPath: string, message: string): never {
  throw new Error(`Invalid AI corpus at ${corpusPath}: ${message}`);
}

function requireNonEmptyString(value: unknown, where: string, corpusPath: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    invalid(corpusPath, `${where} must be a non-empty string`);
  }
  return value;
}

function parseSide(value: unknown, where: string, corpusPath: string): Side {
  const parsed = SideSchema.safeParse(value);
  if (!parsed.success) {
    invalid(
      corpusPath,
      `${where} has unknown side ${JSON.stringify(value)}; expected one of ${SideSchema.options.join(', ')}`,
    );
  }
  return parsed.data;
}

function parsePiece(
  value: unknown,
  entryId: string,
  pieceIndex: number,
  corpusPath: string,
): CorpusPiece {
  const where = `entry "${entryId}" piece[${pieceIndex}]`;
  if (
    typeof value !== 'object' ||
    value === null ||
    Array.isArray(value) ||
    !('id' in value && 'type' in value && 'side' in value && 'x' in value && 'y' in value)
  ) {
    invalid(corpusPath, `${where} must be an object with id, type, side, x, y`);
  }

  const id = requireNonEmptyString(value['id'], `${where}.id`, corpusPath);

  const typeResult = PieceTypeSchema.safeParse(value['type']);
  if (!typeResult.success) {
    invalid(
      corpusPath,
      `${where} (id "${id}") has unknown type ${JSON.stringify(value['type'])}; ` +
        `expected one of ${PieceTypeSchema.options.join(', ')}`,
    );
  }

  const side = parseSide(value['side'], `${where} (id "${id}").side`, corpusPath);

  const square = SquareSchema.safeParse({ x: value['x'], y: value['y'] });
  if (!square.success) {
    const issue = square.error.issues[0];
    invalid(
      corpusPath,
      `${where} (id "${id}") has invalid square ` +
        `(x=${JSON.stringify(value['x'])}, y=${JSON.stringify(value['y'])}): ${issue?.message ?? 'out of range'}`,
    );
  }

  return { id, type: typeResult.data, side, x: square.data.x, y: square.data.y };
}

/**
 * Parse and validate a corpus document. Throws a descriptive `Error` on the first problem:
 * unknown piece type or side, out-of-range square, duplicate square, duplicate piece/entry id,
 * or a missing GENERAL for either side.
 */
export function parseCorpus(raw: unknown, corpusPath: string = CORPUS_PATH): CorpusEntry[] {
  if (!Array.isArray(raw)) invalid(corpusPath, 'root must be a JSON array of positions');

  const entries: CorpusEntry[] = [];
  const seenEntryIds = new Set<string>();

  raw.forEach((item, index) => {
    const where = `entry[${index}]`;
    if (
      typeof item !== 'object' ||
      item === null ||
      Array.isArray(item) ||
      !(
        'id' in item &&
        'description' in item &&
        'category' in item &&
        'turn' in item &&
        'pieces' in item
      )
    ) {
      invalid(corpusPath, `${where} must be an object with id, description, category, turn, pieces`);
    }

    const id = requireNonEmptyString(item['id'], `${where}.id`, corpusPath);
    if (seenEntryIds.has(id)) invalid(corpusPath, `duplicate entry id "${id}"`);
    seenEntryIds.add(id);

    const description = requireNonEmptyString(
      item['description'],
      `entry "${id}".description`,
      corpusPath,
    );
    const category = requireNonEmptyString(item['category'], `entry "${id}".category`, corpusPath);
    const turn = parseSide(item['turn'], `entry "${id}".turn`, corpusPath);

    const piecesRaw = item['pieces'];
    if (!Array.isArray(piecesRaw) || piecesRaw.length === 0) {
      invalid(corpusPath, `entry "${id}".pieces must be a non-empty array`);
    }

    const usedSquares = new Set<number>();
    const usedIds = new Set<string>();
    const pieces: CorpusPiece[] = piecesRaw.map((piece, pieceIndex) => {
      const parsed = parsePiece(piece, id, pieceIndex, corpusPath);
      const squareIndex = squareToIndex({ x: parsed.x, y: parsed.y });
      if (usedSquares.has(squareIndex)) {
        invalid(corpusPath, `entry "${id}" places two pieces on square (${parsed.x},${parsed.y})`);
      }
      usedSquares.add(squareIndex);
      if (usedIds.has(parsed.id)) {
        invalid(corpusPath, `entry "${id}" has duplicate piece id "${parsed.id}"`);
      }
      usedIds.add(parsed.id);
      return parsed;
    });

    const generals = pieces.filter((p) => p.type === 'GENERAL');
    if (!generals.some((g) => g.side === 'RED')) {
      invalid(corpusPath, `entry "${id}" is missing the RED GENERAL`);
    }
    if (!generals.some((g) => g.side === 'BLACK')) {
      invalid(corpusPath, `entry "${id}" is missing the BLACK GENERAL`);
    }

    entries.push({ id, description, category, turn, pieces });
  });

  return entries;
}

/** Read and validate a corpus file. Throws a descriptive error for I/O, JSON or schema problems. */
export function loadCorpus(corpusPath: string = CORPUS_PATH): CorpusEntry[] {
  let text: string;
  try {
    text = fs.readFileSync(corpusPath, 'utf8');
  } catch (err) {
    throw new Error(`Cannot read AI corpus at ${corpusPath}: ${(err as Error).message}`, { cause: err });
  }

  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch (err) {
    throw new Error(`AI corpus at ${corpusPath} is not valid JSON: ${(err as Error).message}`, { cause: err });
  }

  return parseCorpus(raw, corpusPath);
}

// ── Benchmark ───────────────────────────────────────────────────────────────

/**
 * Run both algorithms over every corpus position with identical search inputs
 * (same position, depth, seed and per-position deadline) so pruning is the only variable.
 */
export function runBenchmark(depth: number = BENCHMARK_DEPTH): BenchmarkRow[] {
  const corpus = loadCorpus();
  const results: BenchmarkRow[] = [];

  for (const entry of corpus) {
    const position: Position = makePosition(entry.pieces, entry.turn);
    // Shared inputs — only `algorithm` differs between the two runs.
    const deadlineMonoMs = performance.now() + BENCHMARK_DEADLINE_MS;
    const shared = {
      position,
      repetitionCounts: {} as Record<string, number>,
      maxDepth: depth,
      deadlineMonoMs,
      seed: BENCHMARK_SEED,
    };

    const minimax = searchBestMove(
      { ...shared, algorithm: 'MINIMAX' as const },
      () => performance.now(),
      () => false,
    );
    const alphaBeta = searchBestMove(
      { ...shared, algorithm: 'ALPHA_BETA' as const },
      () => performance.now(),
      () => false,
    );

    const pruningRatio =
      minimax.nodes > 0 ? (minimax.nodes - alphaBeta.nodes) / minimax.nodes : 0;

    results.push({
      id: entry.id,
      description: entry.description,
      category: entry.category,
      turn: entry.turn,
      depth,
      seed: BENCHMARK_SEED,
      minimaxScore: minimax.score,
      minimaxNodes: minimax.nodes,
      minimaxTimeMs: minimax.elapsedMs,
      minimaxCompletedDepth: minimax.completedDepth,
      minimaxMove: minimax.move,
      alphaBetaScore: alphaBeta.score,
      alphaBetaNodes: alphaBeta.nodes,
      alphaBetaTimeMs: alphaBeta.elapsedMs,
      alphaBetaCompletedDepth: alphaBeta.completedDepth,
      alphaBetaMove: alphaBeta.move,
      pruningRatio,
      nodeDelta: minimax.nodes - alphaBeta.nodes,
      scoresMatch: minimax.score === alphaBeta.score,
      depthsMatch: minimax.completedDepth === alphaBeta.completedDepth,
    });
  }

  return results;
}

/** Aggregate the rows. Never hides positions where alpha-beta visited more nodes. */
export function summarize(results: BenchmarkRow[]): BenchmarkAggregate {
  const totalMinimaxNodes = results.reduce((acc, r) => acc + r.minimaxNodes, 0);
  const totalAlphaBetaNodes = results.reduce((acc, r) => acc + r.alphaBetaNodes, 0);
  const aggregatePruningPercent =
    totalMinimaxNodes > 0
      ? ((totalMinimaxNodes - totalAlphaBetaNodes) / totalMinimaxNodes) * 100
      : 0;
  const worseForAlphaBeta = results.filter((r) => r.alphaBetaNodes > r.minimaxNodes);
  const scoreAgreement = results.filter((r) => r.scoresMatch).length;

  return {
    positions: results.length,
    totalMinimaxNodes,
    totalAlphaBetaNodes,
    aggregatePruningPercent,
    aggregatePruningDefinition:
      '100 * (sum(minimaxNodes) - sum(alphaBetaNodes)) / sum(minimaxNodes) — node-weighted over all positions; per-position ratios can be negative when alpha-beta visits more nodes',
    positionsWhereAlphaBetaVisitedMore: worseForAlphaBeta.length,
    positionIdsWhereAlphaBetaVisitedMore: worseForAlphaBeta.map((r) => r.id),
    scoreAgreement,
    scoreAgreementPercent: results.length > 0 ? (scoreAgreement / results.length) * 100 : 0,
    depthsMatchAll: results.every((r) => r.depthsMatch),
  };
}

/**
 * Write `benchmark-results.json` + `benchmark-results.csv` to `outDir`
 * (default: gitignored `artifacts/ai-benchmark/`) and print the summary.
 */
export function exportReports(
  results: BenchmarkRow[],
  outDir: string = DEFAULT_REPORT_DIR,
): BenchmarkAggregate {
  const aggregate = summarize(results);
  fs.mkdirSync(outDir, { recursive: true });

  const meta = {
    corpus: path.relative(root, CORPUS_PATH),
    depth: results[0]?.depth ?? BENCHMARK_DEPTH,
    seed: BENCHMARK_SEED,
    deadlineMsPerPosition: BENCHMARK_DEADLINE_MS,
    algorithmNotes:
      'MINIMAX = single-pass negamax; ALPHA_BETA = alpha-beta negamax with iterative deepening and PV move ordering',
    aggregatePruningDefinition: aggregate.aggregatePruningDefinition,
  };

  fs.writeFileSync(
    path.join(outDir, 'benchmark-results.json'),
    JSON.stringify({ meta, aggregate, rows: results }, null, 2),
    'utf8',
  );

  const headers = [
    'ID',
    'Description',
    'Category',
    'Turn',
    'Depth',
    'Seed',
    'Minimax Score',
    'Minimax Nodes',
    'Minimax Time (ms)',
    'Minimax Depth',
    'AlphaBeta Score',
    'AlphaBeta Nodes',
    'AlphaBeta Time (ms)',
    'AlphaBeta Depth',
    'Pruning Ratio (%)',
    'Node Delta (MM-AB)',
    'Scores Match',
    'Depths Match',
  ];

  const rows = results.map((r) => [
    r.id,
    `"${r.description.replace(/"/g, '""')}"`,
    r.category,
    r.turn,
    r.depth,
    r.seed,
    r.minimaxScore,
    r.minimaxNodes,
    r.minimaxTimeMs.toFixed(1),
    r.minimaxCompletedDepth,
    r.alphaBetaScore,
    r.alphaBetaNodes,
    r.alphaBetaTimeMs.toFixed(1),
    r.alphaBetaCompletedDepth,
    (r.pruningRatio * 100).toFixed(1),
    r.nodeDelta,
    r.scoresMatch ? 'YES' : 'NO',
    r.depthsMatch ? 'YES' : 'NO',
  ]);

  fs.writeFileSync(
    path.join(outDir, 'benchmark-results.csv'),
    [headers.join(','), ...rows.map((r) => r.join(','))].join('\n'),
    'utf8',
  );

  console.log('=== AI BENCHMARK SUMMARY ===');
  console.log(`Positions tested: ${aggregate.positions}`);
  console.log(`Total Minimax Nodes: ${aggregate.totalMinimaxNodes}`);
  console.log(`Total Alpha-Beta Nodes: ${aggregate.totalAlphaBetaNodes}`);
  console.log(
    `Aggregate Pruning: ${aggregate.aggregatePruningPercent.toFixed(2)}% reduction ` +
      '(node-weighted: 100*(sum(MM)-sum(AB))/sum(MM))',
  );
  console.log(
    `Positions where Alpha-Beta visited MORE nodes: ${aggregate.positionsWhereAlphaBetaVisitedMore} ` +
      `[${aggregate.positionIdsWhereAlphaBetaVisitedMore.join(', ')}]`,
  );
  console.log(
    `Score Agreement: ${aggregate.scoreAgreement}/${aggregate.positions} ` +
      `(${aggregate.scoreAgreementPercent.toFixed(1)}%)`,
  );
  console.log(`Same completed depth for both algorithms: ${aggregate.depthsMatchAll ? 'YES' : 'NO'}`);
  console.log(`Reports written to: ${path.relative(root, outDir)}`);

  return aggregate;
}

// Run standalone (e.g. `pnpm exec tsx tests/ai/benchmark.ts [--export-docs]`).
// `pnpm test:ai` never reaches this branch, so it cannot rewrite tracked files.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const exportDocs = process.argv.includes('--export-docs');
  exportReports(runBenchmark(), exportDocs ? CURATED_REPORT_DIR : DEFAULT_REPORT_DIR);
}
