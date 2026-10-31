export type RoomCommandKind =
  "create" | "switchSeat" | "ready" | "start" | "swap";

const MAX = 60;
const WINDOW_MS = 60_000;
const SWEEP_AT = 10_000;

/**
 * Trần kỹ thuật 60 lệnh/phút cho mỗi loại lệnh phòng của một tài khoản (Khách tính theo phiên).
 */
// shortcut: bộ đếm trong bộ nhớ, đúng vì chỉ một instance chạy (khóa runtime); cần kho chung khi chạy nhiều instance.
export class CommandLimiter {
  private readonly windows = new Map<
    string,
    { count: number; resetAt: number }
  >();
  private nextSweep = 0;
  constructor(private readonly now: () => number = Date.now) {}
  allow(userId: string, kind: RoomCommandKind): boolean {
    const at = this.now();
    // Chỉ quét tối đa một lần mỗi cửa sổ để lệnh khi Map đầy vẫn O(1).
    if (this.windows.size >= SWEEP_AT && at >= this.nextSweep) {
      this.nextSweep = at + WINDOW_MS;
      for (const [key, w] of this.windows)
        if (w.resetAt <= at) this.windows.delete(key);
    }
    const key = `${kind}|${userId}`;
    const w = this.windows.get(key);
    if (!w || w.resetAt <= at) {
      this.windows.set(key, { count: 1, resetAt: at + WINDOW_MS });
      return true;
    }
    w.count += 1;
    return w.count <= MAX;
  }
}
