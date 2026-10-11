import process from "node:process";
import { setTimeout } from "node:timers";
import { parentPort } from "node:worker_threads";
parentPort.on("message", () => {
  parentPort.postMessage({
    result: {
      move: { from: 54, to: 45 },
      terminal: null,
      completedDepth: 2,
      targetDepth: 2,
      elapsedMs: 1,
      nodes: 1,
      timedOut: false,
    },
  });
  setTimeout(() => process.exit(0), 20);
});
