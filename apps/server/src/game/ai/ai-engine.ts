import {
  EngineError,
  type EngineWorker,
  type EngineWorkerOptions,
} from "@xiangqi/engine";

export type AiEngine = Pick<EngineWorker, "ready" | "search" | "close">;
/**
 * Tải và khởi tạo engine cờ tướng AI biên dịch sẵn (`@xiangqi/engine/compiled`).
 * Bọc lỗi của engine về kiểu `EngineError` chuẩn.
 */
export async function createCompiledAiEngine(
  options: EngineWorkerOptions = {},
): Promise<AiEngine> {
  const compiled = await import("@xiangqi/engine/compiled");
  async function translate<T>(work: () => Promise<T>): Promise<T> {
    try {
      return await work();
    } catch (error) {
      if (error instanceof compiled.EngineError)
        throw new EngineError(error.code);
      throw error;
    }
  }
  const worker = await translate(
    async () => new compiled.EngineWorker(options),
  );
  // shortcut: một worker chạy lần lượt (FIFO) cho mọi ván AI; nhiều ván cùng nghĩ thì xếp hàng, cần pool worker khi chờ vượt ngân sách 10 giây.
  let tail: Promise<unknown> = Promise.resolve();
  return {
    ready: () => translate(() => worker.ready()),
    search: (request, settings) => {
      const run = tail.then(() =>
        translate(() => worker.search(request, settings)),
      );
      tail = run.catch(() => {});
      return run;
    },
    close: () => translate(() => worker.close()),
  };
}
