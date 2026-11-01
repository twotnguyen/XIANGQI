import { Worker } from "node:worker_threads";
import { ending, legalMoves } from "@xiangqi/xiangqi-core";
import {
  EngineError,
  type EngineRequest,
  type EngineResult,
  type EngineProgress,
} from "./contracts.js";
import { readRequest } from "./search.js";
export interface EngineWorkerOptions {
  workerURL?: URL;
  watchdogMs?: number;
}
/**
 * Quản lý vòng đời tiến trình tính toán AI chạy trong Node.js `worker_threads`.
 * Đảm bảo các tác vụ tìm kiếm nước đi nặng nề không làm nghẽn Event Loop của máy chủ.
 * Cung cấp cơ chế khởi động trước (ready/warm-up), hủy bỏ an toàn (AbortSignal),
 * watchdog chống treo và tự động dọn dẹp tiến trình khi đóng.
 */
export class EngineWorker {
  private worker: Worker | null = null;
  private pending: {
    stop: (code: EngineError["code"]) => Promise<void>;
  } | null = null;
  private closed = false;
  private closing: Promise<void> | null = null;
  private workerReady = false;
  private warming: Promise<void> | null = null;
  constructor(private readonly options: EngineWorkerOptions = {}) {
    if (
      options.watchdogMs !== undefined &&
      (!Number.isFinite(options.watchdogMs) || options.watchdogMs <= 0)
    )
      throw new EngineError("ENGINE_INPUT_INVALID");
  }

  /**
   * Khởi động trước (warm-up) tiến trình worker để sẵn sàng nhận lệnh.
   */
  ready(): Promise<void> {
    if (this.closed) return Promise.reject(new EngineError("ENGINE_CLOSED"));
    if (this.warming) return this.warming;
    if (this.worker && this.workerReady) return Promise.resolve();
    if (this.pending) return Promise.reject(new EngineError("ENGINE_BUSY"));
    let worker: Worker;
    try {
      worker = this.acquireWorker();
    } catch {
      return Promise.reject(new EngineError("ENGINE_FAILED"));
    }
    worker.ref();
    this.warming = new Promise<void>((resolve, reject) => {
      let settled = false,
        draining: Promise<void> | null = null;
      const cleanup = () => {
        clearTimeout(watchdog);
        worker.off("message", message);
        worker.off("error", error);
        worker.off("exit", error);
      };
      const stop = (code: EngineError["code"]) => {
        if (draining) return draining;
        if (settled) return Promise.resolve();
        settled = true;
        cleanup();
        if (this.worker === worker) {
          this.worker = null;
          this.workerReady = false;
        }
        draining = worker
          .terminate()
          .then(
            () => {},
            () => {},
          )
          .then(() => {
            this.pending = null;
            this.warming = null;
            reject(new EngineError(code));
          });
        return draining;
      };
      const error = () => {
        void stop("ENGINE_FAILED");
      };
      const message = (value: unknown) => {
        if (
          settled ||
          !value ||
          typeof value !== "object" ||
          !("ready" in value) ||
          value.ready !== true
        )
          return;
        settled = true;
        cleanup();
        this.pending = null;
        this.warming = null;
        worker.unref();
        resolve();
      };
      const watchdog = setTimeout(() => {
        void stop("ENGINE_TIMEOUT");
      }, this.options.watchdogMs ?? 10000);
      this.pending = { stop };
      worker.on("message", message);
      worker.on("error", error);
      worker.on("exit", error);
    });
    return this.warming;
  }
  private acquireWorker(): Worker {
    if (this.worker) return this.worker;
    const worker = new Worker(
      this.options.workerURL ??
        new URL("./worker-bootstrap.mjs", import.meta.url),
      {
        workerData: {
          entry: new URL(
            import.meta.url.endsWith(".ts") ? "./worker.ts" : "./worker.js",
            import.meta.url,
          ).href,
        },
        execArgv: [],
        resourceLimits: { maxOldGenerationSizeMb: 128 },
      },
    );
    this.worker = worker;
    this.workerReady = false;
    const discard = () => {
      if (this.worker === worker) {
        this.worker = null;
        this.workerReady = false;
      }
    };
    worker.on("message", (value: unknown) => {
      if (
        this.worker === worker &&
        value &&
        typeof value === "object" &&
        "ready" in value &&
        value.ready === true
      )
        this.workerReady = true;
    });
    // Idle exits/errors must not leave a dead cached worker or an unhandled error.
    worker.on("error", discard);
    worker.on("exit", discard);
    return worker;
  }

  /**
   * Gửi yêu cầu tìm kiếm nước đi tới worker thread.
   * Hỗ trợ AbortSignal để hủy ngang, giám sát watchdog timeout, và kiểm tra tính hợp lệ của nước đi trả về.
   */
  async search(
    request: EngineRequest,
    options: {
      signal?: AbortSignal;
      onProgress?: (progress: EngineProgress) => void;
    } = {},
  ): Promise<EngineResult> {
    if (this.closed) throw new EngineError("ENGINE_CLOSED");
    if (this.pending) throw new EngineError("ENGINE_BUSY");
    if (options.signal?.aborted) throw new EngineError("ENGINE_CANCELLED");
    // Search compute time comes from the worker; callers measure full await latency separately.
    const hostStarted = Number(process.hrtime.bigint()) / 1e6;
    const { current, history, limits, input } = readRequest(request);
    const deadline = hostStarted + limits.milliseconds - 5;
    let worker: Worker;
    try {
      worker = this.acquireWorker();
    } catch {
      throw new EngineError("ENGINE_FAILED");
    }
    worker.ref();
    return new Promise<EngineResult>((resolve, reject) => {
      let settled = false,
        draining: Promise<void> | null = null;
      const cleanup = () => {
        clearTimeout(watchdog);
        options.signal?.removeEventListener("abort", abort);
        worker.off("message", message);
        worker.off("error", error);
        worker.off("exit", exit);
      };
      const stop = (code: EngineError["code"]) => {
        if (draining) return draining;
        if (settled) return Promise.resolve();
        settled = true;
        cleanup();
        if (this.worker === worker) this.worker = null;
        // Retain the busy fence until termination actually drains the computation.
        draining = worker
          .terminate()
          .then(
            () => {},
            () => {},
          )
          .then(() => {
            this.pending = null;
            reject(new EngineError(code));
          });
        return draining;
      };
      const abort = () => {
        void stop("ENGINE_CANCELLED");
      };
      const error = () => {
        void stop("ENGINE_FAILED");
      };
      const exit = () => {
        void stop("ENGINE_FAILED");
      };
      const message = (value: unknown) => {
        if (settled) return;
        try {
          if (!value || typeof value !== "object") throw Error();
          if ("ready" in value && value.ready === true) return;
          if ("progress" in value) {
            const sample = (value as { progress: EngineProgress }).progress;
            if (
              !sample ||
              sample.targetDepth !== limits.depth ||
              !Number.isInteger(sample.completedDepth) ||
              sample.completedDepth < 1 ||
              sample.completedDepth > limits.depth ||
              !Number.isSafeInteger(sample.nodes) ||
              sample.nodes < 0 ||
              !Number.isFinite(sample.elapsedMs) ||
              sample.elapsedMs < 0
            )
              throw Error();
            options.onProgress?.({
              completedDepth: sample.completedDepth,
              targetDepth: sample.targetDepth,
              nodes: sample.nodes,
              elapsedMs: sample.elapsedMs,
            });
            return;
          }
          if (!("result" in value)) throw Error();
          const result = (value as { result: EngineResult }).result;
          const terminal = ending(history);
          if (
            !result ||
            result.targetDepth !== limits.depth ||
            !Number.isInteger(result.completedDepth) ||
            result.completedDepth < 0 ||
            result.completedDepth > limits.depth ||
            !Number.isSafeInteger(result.nodes) ||
            result.nodes < 0 ||
            !Number.isFinite(result.elapsedMs) ||
            result.elapsedMs < 0 ||
            typeof result.timedOut !== "boolean" ||
            JSON.stringify(result.terminal) !== JSON.stringify(terminal)
          )
            throw Error();
          if (
            terminal
              ? result.move !== null
              : !result.move ||
                !legalMoves(current).some(
                  (move) =>
                    move.from === result.move!.from &&
                    move.to === result.move!.to,
                )
          )
            throw Error();
          settled = true;
          cleanup();
          this.pending = null;
          worker.unref();
          resolve(result);
        } catch {
          void stop("ENGINE_FAILED");
        }
      };
      const watchdog = setTimeout(() => {
        void stop("ENGINE_TIMEOUT");
      }, this.options.watchdogMs ?? 10000);
      this.pending = { stop };
      worker.on("message", message);
      worker.on("error", error);
      worker.on("exit", exit);
      options.signal?.addEventListener("abort", abort, { once: true });
      if (options.signal?.aborted) abort();
      else {
        try {
          worker.postMessage({ request: input, deadline });
        } catch {
          void stop("ENGINE_FAILED");
        }
      }
    });
  }

  /**
   * Đóng và hủy bỏ tiến trình worker an toàn, dọn dẹp tài nguyên hệ thống.
   */
  close(): Promise<void> {
    if (this.closing) return this.closing;
    this.closed = true;
    this.closing = (async () => {
      if (this.pending) await this.pending.stop("ENGINE_CLOSED");
      if (this.worker) {
        const worker = this.worker;
        this.worker = null;
        await worker.terminate();
      }
    })();
    return this.closing;
  }
}
