import type { IncomingMessage, ServerResponse } from "node:http";

/**
 * Giới hạn tần suất theo IP cho các POST công khai (đăng nhập, đăng ký, khôi phục, tạo Khách).
 * Chỉ chặn lạm dụng nặng: giới hạn theo tài khoản (khóa đăng nhập, OTP) vẫn nằm ở service.
 */
export interface RequestLimitRule {
  name: string;
  matches(path: string): boolean;
  max: number;
  windowMs: number;
}

export const PUBLIC_POST_RULES: readonly RequestLimitRule[] = [
  {
    name: "login",
    matches: (path) => path === "/auth/login",
    max: 30,
    windowMs: 60_000,
  },
  {
    name: "guest",
    matches: (path) => path === "/account/guest",
    max: 30,
    windowMs: 60_000,
  },
  {
    name: "auth",
    matches: (path) => path.startsWith("/auth/") && path !== "/auth/login",
    max: 60,
    windowMs: 60_000,
  },
];

// shortcut: bộ đếm trong bộ nhớ, đúng vì chỉ một instance chạy (khóa runtime); cần kho chung khi chạy nhiều instance.
const SWEEP_AT = 10_000;
const HARD_CAP = 100_000;

function normalize(address: string): string {
  // IPv4 gắn trong IPv6, và IPv6 gộp theo /64 để một mạng không tự sinh vô hạn khóa.
  const v4 = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/i.exec(address);
  if (v4) return v4[1]!;
  if (address.includes(":"))
    return address.toLowerCase().split(":").slice(0, 4).join(":");
  return address;
}

/**
 * IP máy khách. `trustedProxyHops` = số proxy tin cậy phía trước server: lấy phần tử thứ n từ cuối
 * của X-Forwarded-For (phần đầu do máy khách tự gửi nên không tin). Bằng 0 thì dùng địa chỉ socket.
 */
export function clientAddress(
  request: Pick<IncomingMessage, "headers" | "socket">,
  trustedProxyHops: number,
): string {
  const socketAddress = request.socket.remoteAddress ?? "unknown";
  if (trustedProxyHops <= 0) return normalize(socketAddress);
  const header = request.headers["x-forwarded-for"];
  const chain = (Array.isArray(header) ? header.join(",") : (header ?? ""))
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  return normalize(chain[chain.length - trustedProxyHops] ?? socketAddress);
}

export interface RequestLimiter {
  /** Trả số giây phải chờ nếu request bị chặn, ngược lại null. */
  check(request: IncomingMessage): number | null;
  middleware(
    request: IncomingMessage,
    response: ServerResponse,
    next: () => void,
  ): void;
}

export function createRequestLimiter(options: {
  trustedProxyHops: number;
  rules?: readonly RequestLimitRule[];
  now?: () => number;
}): RequestLimiter {
  const rules = options.rules ?? PUBLIC_POST_RULES;
  const now = options.now ?? Date.now;
  const windows = new Map<string, { count: number; resetAt: number }>();

  function sweep(at: number) {
    for (const [key, entry] of windows)
      if (entry.resetAt <= at) windows.delete(key);
    // Vượt trần sau khi quét: bỏ các khóa cũ nhất (Map giữ thứ tự chèn).
    for (const key of windows.keys()) {
      if (windows.size <= HARD_CAP) break;
      windows.delete(key);
    }
  }

  function check(request: IncomingMessage): number | null {
    if (request.method !== "POST") return null;
    const path = (request.url ?? "").split("?", 1)[0]!;
    const rule = rules.find((candidate) => candidate.matches(path));
    if (!rule) return null;
    const at = now();
    if (windows.size >= SWEEP_AT) sweep(at);
    const key = `${rule.name}|${clientAddress(request, options.trustedProxyHops)}`;
    const entry = windows.get(key);
    if (!entry || entry.resetAt <= at) {
      windows.set(key, { count: 1, resetAt: at + rule.windowMs });
      return null;
    }
    entry.count += 1;
    return entry.count > rule.max
      ? Math.max(1, Math.ceil((entry.resetAt - at) / 1000))
      : null;
  }

  return {
    check,
    middleware(request, response, next) {
      const wait = check(request);
      if (wait === null) {
        next();
        return;
      }
      response.writeHead(429, {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        "Retry-After": String(wait),
      });
      response.end(
        JSON.stringify({
          code: "RATE_LIMITED",
          message: "Bạn thao tác quá nhanh, vui lòng thử lại sau ít phút",
        }),
      );
    },
  };
}
