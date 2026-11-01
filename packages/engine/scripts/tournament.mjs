#!/usr/bin/env node
// YC8: twenty balanced games per difficulty pair, using the same ten published starts.
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { cpus, platform, arch, release } from "node:os";
import { execFileSync } from "node:child_process";
import process from "node:process";
import { URL } from "node:url";
import { performance } from "node:perf_hooks";
import console from "node:console";
import { EngineWorker, ENGINE_LIMITS } from "../dist/index.js";
import {
  parsePosition,
  playMove,
  serializePosition,
  ending,
  legalMoves,
} from "@xiangqi/xiangqi-core";
const args = process.argv.slice(2);
const flag = (key, fallback) =>
  args.includes(key) ? args[args.indexOf(key) + 1] : fallback;
const pair = flag("--pair", "easy,medium").split(",");
assert(
  pair.length === 2 &&
    pair[0] !== pair[1] &&
    pair.every((level) => Object.hasOwn(ENGINE_LIMITS, level)),
);
const output = flag("--out", "");
assert(output, "Provide --out to retain individual games");
const fixtures = JSON.parse(
  await readFile(
    new URL("../fixtures/midgames-50.json", import.meta.url),
    "utf8",
  ),
).positions.slice(0, 10);
assert.equal(fixtures.length, 10);
const worker = new EngineWorker();
const report = {
  generatedAt: new Date().toISOString(),
  revision: execFileSync("git", ["rev-parse", "HEAD"], {
    encoding: "utf8",
  }).trim(),
  environment: {
    node: process.version,
    cpu: cpus()[0]?.model,
    platform: platform(),
    arch: arch(),
    os: release(),
  },
  method:
    "20 games/pair: same ten independently verified published midgames, reverse level colours at each start; deterministic search, normal core endings, max4000 additional plies; a cap is INCOMPLETE not a draw. Includes the source halfmove counter; no fabricated prior repetition history.",
  pair,
  games: [],
  status: "RUNNING",
};
try {
  await worker.ready();
  for (const fixture of fixtures) {
    for (const swapped of [false, true]) {
      const levels = {
        red: pair[swapped ? 1 : 0],
        black: pair[swapped ? 0 : 1],
      };
      let position = parsePosition(fixture.fen);
      const history = [position],
        fens = [serializePosition(position)],
        moves = [];
      let outcome = ending(history);
      const started = performance.now();
      for (let ply = 0; !outcome && ply < 4000; ply++) {
        const before = performance.now();
        const result = await worker.search({
          position: fens.at(-1),
          side: position.turn,
          level: levels[position.turn],
          history: fens,
        });
        const wallMs = performance.now() - before;
        assert(
          result.move && !result.terminal,
          "A live game must return a move",
        );
        assert(
          legalMoves(position).some(
            (move) =>
              move.from === result.move.from && move.to === result.move.to,
          ),
          "Illegal engine move",
        );
        moves.push({
          side: position.turn,
          level: levels[position.turn],
          ...result,
          wallMs,
        });
        position = playMove(position, result.move);
        history.push(position);
        fens.push(serializePosition(position));
        outcome = ending(history);
      }
      const game = {
        id: `${fixture.id}-${swapped ? "reverse" : "forward"}`,
        start: fixture.fen,
        levels,
        outcome,
        status: outcome ? "FINISHED" : "INCOMPLETE",
        winnerLevel: outcome?.winner ? levels[outcome.winner] : null,
        elapsedMs: performance.now() - started,
        final: fens.at(-1),
        moves,
      };
      report.games.push(game);
      await writeFile(output, JSON.stringify(report, null, 2) + "\n");
      console.log(
        JSON.stringify({
          id: game.id,
          outcome,
          winnerLevel: game.winnerLevel,
          plies: moves.length,
          elapsedMs: game.elapsedMs,
        }),
      );
    }
  }
  report.wins = Object.fromEntries(
    pair.map((level) => [
      level,
      report.games.filter((game) => game.winnerLevel === level).length,
    ]),
  );
  report.draws = report.games.filter(
    (game) => game.outcome?.winner === null,
  ).length;
  report.incomplete = report.games.filter((game) => !game.outcome).length;
  report.status = report.incomplete
    ? "BLOCKED"
    : report.wins[pair[1]] > 10
      ? "PASS"
      : "FAIL";
  assert.equal(report.games.length, 20);
  await writeFile(output, JSON.stringify(report, null, 2) + "\n");
  console.log(
    JSON.stringify({
      pair,
      status: report.status,
      wins: report.wins,
      draws: report.draws,
      incomplete: report.incomplete,
    }),
  );
} finally {
  await worker.close();
}
