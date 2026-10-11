import { createServer } from "node:http";
import { afterEach, expect, it } from "vitest";
import {
  initialPosition,
  legalMoves,
  parsePosition,
  serializePosition,
} from "@xiangqi/xiangqi-core";
import { EngineWorker } from "./engine-worker.js";
import { historyCases } from "./history.test-helper.js";
const workers: EngineWorker[] = [];
afterEach(async () => {
  await Promise.all(workers.map((worker) => worker.close()));
  workers.length = 0;
});
const request = () => ({
  position: serializePosition(initialPosition()),
  side: "red" as const,
  level: "easy" as const,
});
function create(options?: ConstructorParameters<typeof EngineWorker>[0]) {
  const worker = new EngineWorker(options);
  workers.push(worker);
  return worker;
}
function delayedBootstrap() {
  const bootstrap = new URL("./worker-bootstrap.mjs", import.meta.url).href;
  return new URL(
    "data:text/javascript," +
      encodeURIComponent(
        `await new Promise(resolve => setTimeout(resolve, 400)); await import(${JSON.stringify(bootstrap)});`,
      ),
  );
}
it("initializes once before serving search and keeps the startup busy fence", async () => {
  const worker = create({ workerURL: delayedBootstrap() });
  const started = performance.now();
  const warming = worker.ready();
  const alsoWarming = worker.ready();
  await expect(worker.search(request())).rejects.toMatchObject({
    code: "ENGINE_BUSY",
  });
  await Promise.all([warming, alsoWarming]);
  expect(performance.now() - started).toBeGreaterThanOrEqual(400);
  const result = await worker.search(request());
  expect(result.completedDepth).toBeGreaterThanOrEqual(1);
  expect(result.targetDepth).toBe(2);
  expect(legalMoves(parsePosition(request().position))).toContainEqual(
    result.move,
  );
});
it("still counts delayed cold startup against a direct search deadline", async () => {
  const result = await create({ workerURL: delayedBootstrap() }).search(
    request(),
  );
  expect(result.completedDepth).toBe(0);
  expect(result.nodes).toBe(0);
  expect(result.timedOut).toBe(true);
  expect(result.elapsedMs).toBeGreaterThanOrEqual(400);
  expect(legalMoves(parsePosition(request().position))).toContainEqual(
    result.move,
  );
});
it("close drains initialization and rejects future readiness", async () => {
  const worker = create({ workerURL: delayedBootstrap() });
  const handled = worker.ready().catch((error) => error);
  await worker.close();
  expect((await handled).code).toBe("ENGINE_CLOSED");
  await expect(worker.ready()).rejects.toMatchObject({ code: "ENGINE_CLOSED" });
});
it("bounds and drains a hung startup before permitting another initialization", async () => {
  const worker = create({
    workerURL: new URL("../test-fixtures/hung-worker.mjs", import.meta.url),
    watchdogMs: 100,
  });
  await expect(worker.ready()).rejects.toMatchObject({
    code: "ENGINE_TIMEOUT",
  });
  await expect(worker.ready()).rejects.toMatchObject({
    code: "ENGINE_TIMEOUT",
  });
});
it("sanitizes initialization crashes", async () => {
  await expect(
    create({
      workerURL: new URL(
        "data:text/javascript,throw%20Error(%22PRIVATE_STARTUP_DETAIL%22)",
      ),
    }).ready(),
  ).rejects.toMatchObject({ code: "ENGINE_FAILED", message: "ENGINE_FAILED" });
});
it("runs actual search in a worker and returns a legal immutable result", async () => {
  const worker = create(),
    input = Object.freeze(request()),
    before = JSON.stringify(input);
  await worker.ready();
  const result = await worker.search(input);
  expect(legalMoves(parsePosition(input.position))).toContainEqual(result.move);
  expect(result.completedDepth).toBeGreaterThanOrEqual(1);
  expect(result.completedDepth).toBeLessThanOrEqual(2);
  expect(result.targetDepth).toBe(2);
  expect(JSON.stringify(input)).toBe(before);
  expect(result.nodes).toBeGreaterThan(0);
});
it("counts input validation against the original host deadline", async () => {
  const input = request(),
    fen = input.position;
  let reads = 0;
  Object.defineProperty(input, "position", {
    enumerable: true,
    get() {
      if (reads++ === 0) {
        const until = performance.now() + 350;
        while (performance.now() < until) {
          /* Deliberately slow boundary input. */
        }
      }
      return fen;
    },
  });
  const result = await create().search(input);
  expect(result.completedDepth).toBe(0);
  expect(result.timedOut).toBe(true);
  expect(result.elapsedMs).toBeGreaterThanOrEqual(350);
  expect(legalMoves(parsePosition(fen))).toContainEqual(result.move);
});
it("serializes only engine fields and ignores unrelated non-cloneable properties", async () => {
  const input = { ...request(), unrelated: () => "private value" };
  const result = await create().search(input);
  expect(legalMoves(parsePosition(input.position))).toContainEqual(result.move);
});
it.each(historyCases())(
  "transports legal $name history to the actual worker",
  async ({ input, terminal }) => {
    const result = await create().search(input);
    expect(result.move).toBeNull();
    expect(result.terminal).toEqual(terminal);
    expect(result.completedDepth).toBe(0);
  },
);
it("keeps native HTTP health responsive during actual hard search", async () => {
  const server = createServer((_req, res) => res.end("healthy"));
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    const worker = create(),
      input = { ...request(), level: "hard" as const },
      controller = new AbortController();
    let iteration!: () => void;
    const started = new Promise<void>((resolve) => {
      iteration = resolve;
    });
    let finished = false;
    const pending = worker
      .search(input, {
        signal: controller.signal,
        onIteration: () => iteration(),
      })
      .finally(() => {
        finished = true;
      });
    const handled = pending.catch((error) => error);
    await Promise.race([
      started,
      pending.then(() => {
        throw new Error("No completed iteration reported");
      }),
    ]);
    const address = server.address() as { port: number };
    for (let index = 0; index < 4; index++) {
      await new Promise((resolve) => setTimeout(resolve, 20));
      expect(
        await (await fetch(`http://127.0.0.1:${address.port}/health`)).text(),
      ).toBe("healthy");
    }
    expect(finished).toBe(false);
    controller.abort();
    expect((await handled).code).toBe("ENGINE_CANCELLED");
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});
it("rejects a second request while active and cancellation permits a new worker search", async () => {
  const worker = create(),
    controller = new AbortController();
  const pending = worker
    .search({ ...request(), level: "hard" }, { signal: controller.signal })
    .catch((error) => error);
  await expect(worker.search(request())).rejects.toMatchObject({
    code: "ENGINE_BUSY",
  });
  controller.abort();
  expect((await pending).code).toBe("ENGINE_CANCELLED");
  expect((await worker.search(request())).move).not.toBeNull();
});
it("closing drains active work and rejects future requests", async () => {
  const worker = create(),
    pending = worker
      .search({ ...request(), level: "hard" })
      .catch((error) => error);
  await worker.close();
  expect((await pending).code).toBe("ENGINE_CLOSED");
  await expect(worker.search(request())).rejects.toMatchObject({
    code: "ENGINE_CLOSED",
  });
});
it("rejects an already-aborted search without starting work", async () => {
  const controller = new AbortController();
  controller.abort();
  await expect(
    create().search(request(), { signal: controller.signal }),
  ).rejects.toMatchObject({ code: "ENGINE_CANCELLED" });
});
it("fails closed on illegal output from an actual worker", async () => {
  await expect(
    create({
      workerURL: new URL(
        "../test-fixtures/illegal-worker.mjs",
        import.meta.url,
      ),
    }).search(request()),
  ).rejects.toMatchObject({ code: "ENGINE_FAILED" });
});
it("sanitizes worker crashes", async () => {
  await expect(
    create({
      workerURL: new URL("../test-fixtures/error-worker.mjs", import.meta.url),
    }).search(request()),
  ).rejects.toMatchObject({ code: "ENGINE_FAILED", message: "ENGINE_FAILED" });
});
it("bounds a hung worker, terminates it and preserves the original request", async () => {
  const input = request(),
    before = JSON.stringify(input);
  await expect(
    create({
      workerURL: new URL("../test-fixtures/hung-worker.mjs", import.meta.url),
      watchdogMs: 100,
    }).search(input),
  ).rejects.toMatchObject({ code: "ENGINE_TIMEOUT" });
  expect(JSON.stringify(input)).toBe(before);
});
it("replaces an idle worker which exited after a successful result", async () => {
  const worker = create({
    workerURL: new URL("../test-fixtures/exit-worker.mjs", import.meta.url),
    watchdogMs: 200,
  });
  expect((await worker.search(request())).move).toEqual({ from: 54, to: 45 });
  await new Promise((resolve) => setTimeout(resolve, 60));
  expect((await worker.search(request())).move).toEqual({ from: 54, to: 45 });
});
it("sanitizes synchronous worker startup failures", async () => {
  await expect(
    create({ workerURL: new URL("https://invalid.example/worker.mjs") }).search(
      request(),
    ),
  ).rejects.toMatchObject({ code: "ENGINE_FAILED", message: "ENGINE_FAILED" });
});
