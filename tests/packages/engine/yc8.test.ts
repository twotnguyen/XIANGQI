import { expect, it } from "vitest";
import {
  initialPosition,
  serializePosition,
  parsePosition,
  legalMoves,
} from "@xiangqi/xiangqi-core";
import { searchPosition } from "@engine/search.js";
import { EngineWorker } from "@engine/engine-worker.js";
import type { EngineProgress } from "@engine/contracts.js";
import mates from "../../../packages/engine/fixtures/mates.json";
import diverseMates from "../../../packages/engine/fixtures/yc8-mates.json";

it.each(["easy", "medium", "hard"] as const)(
  "varies equal opening choices reproducibly without changing legality at %s",
  (level) => {
    const input = {
      position: serializePosition(initialPosition()),
      side: "red" as const,
      level,
    };
    const moves = new Set<string>();
    for (const randomSeed of [1, 42, 12345, 98765, 2147483647]) {
      const request = { ...input, randomSeed };
      const a = searchPosition(request, { depth: 2, now: () => 0 });
      const b = searchPosition(request, { depth: 2, now: () => 0 });
      expect(a.move).toEqual(b.move);
      expect(legalMoves(initialPosition())).toContainEqual(a.move);
      moves.add(JSON.stringify(a.move));
    }
    expect(moves.size).toBeGreaterThan(1);
  },
);

it.each([...mates.cases, ...diverseMates.cases])(
  "does not randomize away a forced mating key: $id",
  (fixture) => {
    const position = parsePosition(fixture.fen);
    for (const randomSeed of [1, 42, 98765]) {
      const result = searchPosition(
        {
          position: fixture.fen,
          side: position.turn,
          level: "hard",
          randomSeed,
        },
        { depth: fixture.mateInPlies, now: () => 0 },
      );
      expect(fixture.winningKeys.map((key) => key.move)).toContainEqual(
        result.move,
      );
    }
  },
);

it("reports worker compute progress without future moves and finishes with matching metrics", async () => {
  const worker = new EngineWorker();
  const progress: EngineProgress[] = [];
  try {
    await worker.ready();
    const result = await worker.search(
      {
        position: serializePosition(initialPosition()),
        side: "red",
        level: "easy",
        randomSeed: 42,
      },
      { onProgress: (sample) => progress.push(sample) },
    );
    expect(progress.length).toBeGreaterThan(0);
    let previousNodes = 0;
    for (const sample of progress) {
      expect(Object.keys(sample).sort()).toEqual([
        "completedDepth",
        "elapsedMs",
        "nodes",
        "targetDepth",
      ]);
      expect(sample.completedDepth).toBeGreaterThan(0);
      expect(sample.nodes).toBeGreaterThanOrEqual(previousNodes);
      expect(sample.nodes).toBeLessThanOrEqual(result.nodes);
      expect(sample.elapsedMs).toBeLessThanOrEqual(result.elapsedMs);
      previousNodes = sample.nodes;
    }
    expect(progress.at(-1)!.completedDepth).toBe(result.completedDepth);
  } finally {
    await worker.close();
  }
});
