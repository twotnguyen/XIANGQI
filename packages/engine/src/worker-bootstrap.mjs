import { workerData } from "node:worker_threads";
import { register } from "tsx/esm/api";
register({ tsconfig: false });
await import(workerData.entry);
