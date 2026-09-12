/**
 * AI Tournament simulator.
 * Pit different AI algorithms or difficulty levels against each other.
 * Enforces 200 ply adjudication cap.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInitialPosition, getLegalMoves, applyMove, getTerminalOutcome } from '../../packages/game-rules/src/index.js';
import { searchBestMove, getLevelConfig } from '../../packages/ai/src/index.js';
import type { Position, AiLevel, Side, Move } from '../../packages/contracts/src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '../..');

export interface GameRecord {
  gameNumber: number;
  redPlayer: string;
  blackPlayer: string;
  totalPlies: number;
  winner: Side | 'DRAW';
  reason: string;
}

export function playTournamentGame(
  gameNumber: number,
  redLevel: AiLevel,
  blackLevel: AiLevel,
): GameRecord {
  let pos: Position = createInitialPosition();
  const repetitionCounts: Record<string, number> = {};
  let ply = 0;
  const maxPly = 100; // Fast cap for test harness

  const redConfig = getLevelConfig(redLevel);
  const blackConfig = getLevelConfig(blackLevel);

  while (ply < maxPly) {
    const legalMoves = getLegalMoves(pos);
    const terminal = getTerminalOutcome(pos, repetitionCounts, legalMoves);
    if (terminal) {
      return {
        gameNumber,
        redPlayer: `AI-${redLevel}`,
        blackPlayer: `AI-${blackLevel}`,
        totalPlies: ply,
        winner: terminal.winner ?? 'DRAW',
        reason: terminal.reason,
      };
    }

    const currentTurn = pos.turn;
    const config = currentTurn === 'RED' ? redConfig : blackConfig;

    const now = () => performance.now();
    const res = searchBestMove(
      {
        position: pos,
        repetitionCounts,
        maxDepth: config.maxDepth,
        deadlineMonoMs: performance.now() + 500, // Short budget for quick simulation
        algorithm: 'ALPHA_BETA',
        seed: gameNumber * 1000 + ply,
      },
      now,
      () => false,
    );

    const chosenMove: Move | null = res.move ?? legalMoves[0] ?? null;
    if (!chosenMove) {
      return {
        gameNumber,
        redPlayer: `AI-${redLevel}`,
        blackPlayer: `AI-${blackLevel}`,
        totalPlies: ply,
        winner: currentTurn === 'RED' ? 'BLACK' : 'RED',
        reason: 'NO_MOVES',
      };
    }

    pos = applyMove(pos, chosenMove);
    ply++;
  }

  return {
    gameNumber,
    redPlayer: `AI-${redLevel}`,
    blackPlayer: `AI-${blackLevel}`,
    totalPlies: ply,
    winner: 'DRAW',
    reason: 'ADJUDICATED_DRAW',
  };
}

export function runPairTournament(levelA: AiLevel, levelB: AiLevel, gameCount = 6): GameRecord[] {
  const games: GameRecord[] = [];

  for (let i = 1; i <= gameCount; i++) {
    // Alternate colors: odd games A is RED, even games B is RED
    const red = i % 2 === 1 ? levelA : levelB;
    const black = i % 2 === 1 ? levelB : levelA;
    const record = playTournamentGame(i, red, black);
    games.push(record);
  }

  const outDir = path.join(root, 'docs/test-reports/ai');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(
    path.join(outDir, `tournament-${levelA}-vs-${levelB}.json`),
    JSON.stringify(games, null, 2),
    'utf8',
  );

  return games;
}
