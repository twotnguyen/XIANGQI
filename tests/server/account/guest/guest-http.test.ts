import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "@server/app.js";
import { GuestModule } from "@server/account/guest/guest.module.js";
import { memoryGuests } from "./guest-http.test-helper.js";

const ORIGIN = "http://localhost:5173";
const HOUR = 3600000;
let time = Date.parse("2026-10-11T00:00:00Z");
const now = () => new Date(time);

const insecure = memoryGuests(now);
const secure = memoryGuests(now);
type App = Awaited<ReturnType<typeof createApp>>;
let app: App;
let secureApp: App;
let base: string;
let secureBase: string;

beforeAll(async () => {
  app = await createApp(
    [ORIGIN],
    [GuestModule.forRoot(insecure.service, false)],
  );
  await app.listen(0, "127.0.0.1");
  base = await app.getUrl();
  secureApp = await createApp(
    [ORIGIN],
    [GuestModule.forRoot(secure.service, true)],
  );
  await secureApp.listen(0, "127.0.0.1");
  secureBase = await secureApp.getUrl();
});

afterAll(async () => {
  await app?.close();
  await secureApp?.close();
});

async function call(
  method: "GET" | "POST",
  path: string,
  options: { body?: unknown; cookie?: string; root?: string } = {},
): Promise<Response> {
  const headers: Record<string, string> = { Origin: ORIGIN };
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (options.cookie) headers.Cookie = options.cookie;
  return fetch(`${options.root ?? base}/account/guest${path}`, {
    method,
    headers,
    ...(options.body !== undefined
      ? { body: JSON.stringify(options.body) }
      : {}),
  });
}

function setCookie(response: Response): string | undefined {
  return response.headers
    .getSetCookie()
    .find((value) => value.startsWith("xiangqi_guest="));
}

function pair(cookie: string): string {
  const value = cookie.split(";")[0];
  if (!value) throw new Error("cookie pair missing");
  return value;
}

async function createGuest(name = "Ánh", root?: string) {
  const response = await call("POST", "", {
    body: { displayName: name },
    root,
  });
  const body = (await response.json()) as {
    userId: string;
    capability: string;
    expiresAt: string;
  };
  return { response, body, cookie: setCookie(response) ?? "" };
}

describe("Khách HTTP: tạo và khôi phục phiên", () => {
  it("tạo Khách trả DTO đúng whitelist, no-store và cookie HttpOnly", async () => {
    const { response, body, cookie } = await createGuest("Ánh");
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(Object.keys(body).sort()).toEqual([
      "capability",
      "deferred",
      "displayName",
      "expiresAt",
      "kind",
      "userId",
    ]);
    expect(body).toMatchObject({
      kind: "guest",
      displayName: "Ánh",
      deferred: false,
    });
    expect(body.capability).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(Date.parse(body.expiresAt) - time).toBe(12 * HOUR);
    expect(cookie).toContain(`xiangqi_guest=${body.capability}`);
    expect(cookie).toContain("Path=/");
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Lax");
    expect(cookie).toContain("Max-Age=604800");
    expect(cookie).not.toContain("Secure");
  });

  it("bỏ qua userId, deferred, capability do client gửi lên", async () => {
    const response = await call("POST", "", {
      body: { displayName: "Lan", userId: "forged", deferred: true },
    });
    const body = (await response.json()) as Record<string, unknown>;
    expect(body.userId).not.toBe("forged");
    expect(body.deferred).toBe(false);
  });

  it("từ chối tên không hợp lệ và không đặt cookie", async () => {
    for (const body of [
      { displayName: "" },
      { displayName: "a".repeat(21) },
      { displayName: 42 },
      { displayName: "A\u0000B" },
    ]) {
      const response = await call("POST", "", { body });
      expect(response.status).toBe(400);
      expect(setCookie(response)).toBeUndefined();
    }
  });

  it("khôi phục phiên qua cookie và đặt lại cookie", async () => {
    const { body, cookie } = await createGuest("Minh");
    const response = await call("GET", "/session", { cookie: pair(cookie) });
    expect(response.status).toBe(200);
    const restored = (await response.json()) as { userId: string };
    expect(restored.userId).toBe(body.userId);
    expect(setCookie(response)).toContain(`xiangqi_guest=${body.capability}`);
  });

  it("từ chối cookie thiếu, sai định dạng, trùng lặp hoặc chỉ có trong query", async () => {
    const { body, cookie } = await createGuest("Dũng");
    const cases = [
      undefined,
      "xiangqi_guest=short",
      `${pair(cookie)}; ${pair(cookie)}`,
    ];
    for (const value of cases) {
      const response = await call("GET", "/session", {
        cookie: value,
      });
      expect(response.status).toBe(401);
      expect(((await response.json()) as { code: string }).code).toBe(
        "GUEST_INVALID",
      );
    }
    const query = await fetch(
      `${base}/account/guest/session?capability=${body.capability}`,
      { headers: { Origin: ORIGIN } },
    );
    expect(query.status).toBe(401);
  });

  it("chấp nhận cookie khi có cookie khác đi kèm", async () => {
    const { cookie } = await createGuest("Hà");
    const response = await call("GET", "/session", {
      cookie: `theme=dark; ${pair(cookie)}`,
    });
    expect(response.status).toBe(200);
  });

  it("phiên đang giữ ghế sau 12 giờ vẫn khôi phục được với deferred=true", async () => {
    const { body, cookie } = await createGuest("Bình");
    insecure.rooms.seats.set(body.userId, { kind: "room", roomId: "room-d1" });
    time += 13 * HOUR;
    const response = await call("GET", "/session", { cookie: pair(cookie) });
    expect(response.status).toBe(200);
    const restored = (await response.json()) as {
      deferred: boolean;
      expiresAt: string;
    };
    expect(restored.deferred).toBe(true);
    expect(restored.expiresAt).toBe(body.expiresAt);
    expect(setCookie(response)).toContain("Max-Age=604800");
    insecure.rooms.seats.delete(body.userId);
  });

  it("hết hạn và không giữ ghế: trả GUEST_EXPIRED, xóa cookie và dọn PII", async () => {
    const { body, cookie } = await createGuest("Cường");
    time += 13 * HOUR;
    const response = await call("GET", "/session", { cookie: pair(cookie) });
    expect(response.status).toBe(401);
    expect(((await response.json()) as { code: string }).code).toBe(
      "GUEST_EXPIRED",
    );
    expect(setCookie(response)).toContain("Max-Age=0");
    expect(insecure.rooms.ended).toContain(body.userId);
    expect(
      [...insecure.store.rows.values()].some(
        (row) => row.userId === body.userId,
      ),
    ).toBe(false);
  });

  it("cookie Secure khi cấu hình secure", async () => {
    const { response } = await createGuest("Trang", secureBase);
    expect(setCookie(response)).toContain("Secure");
  });

  it("lỗi tạo phiên trả 503 GUEST_UNAVAILABLE không lộ thông điệp nội bộ", async () => {
    insecure.store.insertFailure = new Error("pg connection refused");
    const response = await call("POST", "", { body: { displayName: "Đức" } });
    insecure.store.insertFailure = undefined;
    expect(response.status).toBe(503);
    const text = await response.text();
    expect(text).toContain("GUEST_UNAVAILABLE");
    expect(text).not.toContain("pg connection refused");
    expect(setCookie(response)).toBeUndefined();
  });
});

describe("Khách HTTP: đăng xuất", () => {
  it("từ chối confirmedResign không phải boolean với 400", async () => {
    const { cookie } = await createGuest("Em");
    for (const body of [{}, { confirmedResign: "yes" }]) {
      const response = await call("POST", "/logout", {
        body,
        cookie: pair(cookie),
      });
      expect(response.status).toBe(400);
      expect(((await response.json()) as { code: string }).code).toBe(
        "GUEST_INPUT_INVALID",
      );
    }
  });

  it("ván đang diễn ra cần xác nhận: 409 và giữ nguyên cookie", async () => {
    const { body, cookie } = await createGuest("Giang");
    insecure.rooms.seats.set(body.userId, { kind: "room", roomId: "room-l1" });
    insecure.rooms.liveGames.add(body.userId);
    const response = await call("POST", "/logout", {
      body: { confirmedResign: false },
      cookie: pair(cookie),
    });
    expect(response.status).toBe(409);
    expect(((await response.json()) as { code: string }).code).toBe(
      "GUEST_RESIGN_CONFIRM_REQUIRED",
    );
    expect(setCookie(response)).toBeUndefined();
    const still = await call("GET", "/session", { cookie: pair(cookie) });
    expect(still.status).toBe(200);
  });

  it("xác nhận đầu hàng: 200, xóa cookie, phiên không còn hợp lệ", async () => {
    const { body, cookie } = await createGuest("Hoa");
    insecure.rooms.seats.set(body.userId, { kind: "room", roomId: "room-l2" });
    insecure.rooms.liveGames.add(body.userId);
    const response = await call("POST", "/logout", {
      body: { confirmedResign: true },
      cookie: pair(cookie),
    });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ended: true });
    expect(setCookie(response)).toContain("Max-Age=0");
    const after = await call("GET", "/session", { cookie: pair(cookie) });
    expect(after.status).toBe(401);
  });

  it("lỗi dọn dẹp: 503 không lộ lỗi và giữ cookie", async () => {
    const { cookie } = await createGuest("Khang");
    insecure.rooms.failure = new Error("pg deadlock detected");
    const response = await call("POST", "/logout", {
      body: { confirmedResign: true },
      cookie: pair(cookie),
    });
    insecure.rooms.failure = undefined;
    expect(response.status).toBe(503);
    const text = await response.text();
    expect(text).toContain("GUEST_UNAVAILABLE");
    expect(text).not.toContain("pg deadlock");
    expect(setCookie(response)).toBeUndefined();
    const still = await call("GET", "/session", { cookie: pair(cookie) });
    expect(still.status).toBe(200);
  });
});
