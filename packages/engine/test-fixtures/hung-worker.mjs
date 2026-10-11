import { parentPort } from "node:worker_threads";
parentPort.on("message", () => {
  while (true) {
    /* Intentionally stalls until watchdog termination. */
  }
});
