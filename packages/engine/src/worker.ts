import { parentPort } from "node:worker_threads";
import { searchPosition } from "./search.js";
import type { EngineRequest } from "./contracts.js";
/**
 * Điểm thực thi bên trong luồng con (Worker Thread) của engine AI:
 * Lắng nghe thông điệp từ tiến trình chính qua `parentPort`, thực thi thuật toán tìm kiếm `searchPosition`
 * với đồng hồ thời gian thực `process.hrtime.bigint()`, liên tục gửi tiến độ độ sâu (iteration)
 * và trả về kết quả nước đi tối ưu hoặc báo lỗi về luồng chính.
 */
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
parentPort.postMessage({ ready: true });
