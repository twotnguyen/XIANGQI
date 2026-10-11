import { URL } from "node:url";
import { copyFile } from "node:fs/promises";
await copyFile(
  new URL("../src/worker-bootstrap.mjs", import.meta.url),
  new URL("../dist/worker-bootstrap.mjs", import.meta.url),
);
