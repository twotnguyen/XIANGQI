import { parentPort } from "node:worker_threads";
parentPort.on("message", () =>
  parentPort.postMessage({
    result: {
      move: { from: 0, to: 89 },
      terminal: null,
      completedDepth: 2,
      targetDepth: 2,
      elapsedMs: 1,
      nodes: 1,
      timedOut: false,
    },
  }),
);
