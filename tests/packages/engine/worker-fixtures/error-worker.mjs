import { parentPort } from "node:worker_threads";
parentPort.on("message", () => {
  throw Error("PRIVATE_WORKER_DETAIL");
});
