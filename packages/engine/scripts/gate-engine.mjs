#!/usr/bin/env node
/**
 * Đo GATE-ENGINE/NFR-03 ở môi trường local (T59/XIAN-95).
 *
 * Chạy trên runtime đã biên dịch (`@xiangqi/engine/compiled`) đúng như máy chủ dùng.
 * Đầu ra: JSON (raw) + tóm tắt dạng người đọc.
 *
 * Cách dùng:
 *   pnpm --filter @xiangqi/engine build
 *   node packages/engine/scripts/gate-engine.mjs [--out <file.json>] [--levels easy,medium,hard]
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { URL } from "node:url";
import { cpus, release } from "node:os";
import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";
import { parsePosition, legalMoves } from "@xiangqi/xiangqi-core";

const here = path.dirname(new URL(import.meta.url).pathname);
const packageRoot = path.resolve(here, "..");

const args = process.argv.slice(2);
const readFlag = (name, fallback) => {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};
const outPath = readFlag("--out", "");
const levels = readFlag("--levels", "easy,medium,hard")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

const midgames = JSON.parse(
  await readFile(
    path.join(packageRoot, "fixtures", "midgames-50.json"),
    "utf8",
  ),
).positions;
const mateCases = [];
for (const name of ["mates.json", "yc8-mates.json"]) {
  const suite = JSON.parse(
    await readFile(path.join(packageRoot, "fixtures", name), "utf8"),
  );
  mateCases.push(...suite.cases);
}

/** Suy ra bên đi từ FEN xiangqi: 'w' = đỏ, 'b' = đen. */
function sideFromFen(fen) {
  const turn = fen.trim().split(/\s+/)[1];
  if (turn === "w") return "red";
  if (turn === "b") return "black";
  throw new Error(`FEN thiếu lượt hợp lệ: ${fen}`);
}

function percentile(values, p) {
  const sorted = [...values].sort((a, b) => a - b);
  if (sorted.length === 0) return null;
  const rank = Math.ceil((p / 100) * sorted.length);
  return sorted[Math.min(sorted.length - 1, Math.max(0, rank - 1))];
}
const mean = (values) =>
  values.length ? values.reduce((sum, v) => sum + v, 0) / values.length : null;

const distEntry = path.join(packageRoot, "dist", "index.js");
try {
  await readFile(distEntry);
} catch {
  process.stderr.write(
    `Thiếu runtime biên dịch: ${distEntry}. Chạy: pnpm --filter @xiangqi/engine build\n`,
  );
  process.exit(2);
}
const { EngineWorker, ENGINE_LIMITS } = await import(distEntry);

const worker = new EngineWorker();
await worker.ready();

const levelsOut = {};
for (const level of levels) {
  if (!ENGINE_LIMITS[level]) throw new Error(`Cấp không hợp lệ: ${level}`);
  const limitMs = ENGINE_LIMITS[level].milliseconds;
  const runs = [];
  for (const position of midgames) {
    const started = performance.now();
    const result = await worker.search({
      position: position.fen,
      side: sideFromFen(position.fen),
      level,
    });
    const wallMs = performance.now() - started;
    assert(
      result.move &&
        legalMoves(parsePosition(position.fen)).some(
          (move) =>
            move.from === result.move.from && move.to === result.move.to,
        ),
      `Illegal result: ${level}/${position.id}`,
    );
    runs.push({
      id: position.id,
      elapsedMs: result.elapsedMs,
      wallMs,
      move: result.move,
      completedDepth: result.completedDepth,
      targetDepth: result.targetDepth,
      nodes: result.nodes,
      timedOut: result.timedOut,
      terminal: result.terminal ? result.terminal.reason : null,
    });
  }
  const elapsed = runs.map((run) => run.elapsedMs);
  const depths = runs.map((run) => run.completedDepth);
  levelsOut[level] = {
    limitMs,
    wallP95Ms: percentile(
      runs.map((run) => run.wallMs),
      95,
    ),
    positions: runs.length,
    elapsedMs: {
      p50: percentile(elapsed, 50),
      p95: percentile(elapsed, 95),
      max: Math.max(...elapsed),
      mean: mean(elapsed),
    },
    withinBudget: elapsed.filter((ms) => ms <= limitMs).length,
    timedOut: runs.filter((run) => run.timedOut).length,
    completedDepth: {
      min: Math.min(...depths),
      median: percentile(depths, 50),
      max: Math.max(...depths),
      target: ENGINE_LIMITS[level].depth,
    },
    nodesTotal: runs.reduce((sum, run) => sum + run.nodes, 0),
    runs,
  };
}

// Strength: cấp Khó phải giải bộ chiếu hết ngắn đã xác minh.
const matesOut = [];
if (levels.includes("hard")) {
  for (const expected of mateCases) {
    const fixture = expected;
    const result = await worker.search({
      position: fixture.fen,
      side: fixture.attacker,
      level: "hard",
    });
    const chosen = result.move
      ? `${result.move.from}->${result.move.to}`
      : null;
    const winning = expected.winningKeys.map(
      (key) => `${key.move.from}->${key.move.to}`,
    );
    matesOut.push({
      id: expected.id,
      mateInPlies: expected.mateInPlies,
      chosen,
      winningMoves: winning,
      solved: chosen !== null && winning.includes(chosen),
      completedDepth: result.completedDepth,
      elapsedMs: result.elapsedMs,
      terminal: result.terminal ? result.terminal.reason : null,
    });
  }
}
await worker.close();

const report = {
  generatedAt: new Date().toISOString(),
  revision: execFileSync("git", ["rev-parse", "HEAD"], {
    encoding: "utf8",
  }).trim(),
  method:
    "Prepared worker, deterministic search, 50 published midgames/level in source order; compute=worker search, wall=full await engine.search including host validation+IPC. Nearest-rank p95 ceil(.95*N); no discarded samples. Other process load is not controlled.",
  environment: {
    platform: process.platform,
    arch: process.arch,
    node: process.version,
    cpu: cpus()[0]?.model ?? "unknown",
    os: release(),
    runtime: "packages/engine/dist (compiled)",
  },
  inputs: {
    midgames: midgames.length,
    mateCases: mateCases.length,
    mateSuiteStatus:
      "Eight independently verified cases: six composed material families plus published mate2 and its mate1 derivative",
  },
  levels: levelsOut,
  mates: matesOut,
  thresholds: {
    NFR03: { easy: 300, medium: 1000, hard: 3000 },
    hardMateSolveRate: 1,
  },
};
report.status =
  levels.some(
    (level) =>
      levelsOut[level].elapsedMs.p95 > ENGINE_LIMITS[level].milliseconds ||
      levelsOut[level].wallP95Ms > ENGINE_LIMITS[level].milliseconds ||
      (level === "hard" &&
        levelsOut[level].runs.some((run) => run.completedDepth < 6)),
  ) || matesOut.some((run) => !run.solved)
    ? "BLOCKED"
    : "PASS";

const pretty = JSON.stringify(report, null, 2);
if (outPath) await writeFile(outPath, `${pretty}\n`);
process.stdout.write(`${pretty}\n`);
