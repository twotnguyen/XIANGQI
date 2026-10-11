import { parentPort } from "node:worker_threads";
import { searchPosition } from "./search.js";
import type { EngineRequest } from "./contracts.js";
if (!parentPort) throw new Error("ENGINE_FAILED");
parentPort.on(
  "message",
  ({ request, deadline }: { request: EngineRequest; deadline: number }) => {
    try {
      parentPort!.postMessage({
        result: searchPosition(request, {
          now: () => Number(process.hrtime.bigint()) / 1e6,
          deadline,
          onIteration: (depth) => parentPort!.postMessage({ iteration: depth }),
        }),
      });
    } catch {
      parentPort!.postMessage({ error: "ENGINE_FAILED" });
    }
  },
);
