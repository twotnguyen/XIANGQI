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
  return {
    ready: () => translate(() => worker.ready()),
    search: (request, settings) =>
      translate(() => worker.search(request, settings)),
    close: () => translate(() => worker.close()),
  };
}
