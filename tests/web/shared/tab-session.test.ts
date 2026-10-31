// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";

afterEach(() => {
  sessionStorage.clear();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  Reflect.deleteProperty(navigator, "locks");
  vi.resetModules();
});

it("stores only a public selector, attaches it to requests, and retains the source across reload without Web Locks", async () => {
  const request = vi.fn().mockResolvedValue(new Response("{}"));
  vi.stubGlobal("fetch", request);
  const first = await import("@web/shared/tab-session.js");
  await first.tabSessionFetch("/api/auth/refresh", { method: "POST" });
  const headers = new Headers(request.mock.calls[0]![1].headers);
  const id = headers.get("X-Xiangqi-Tab")!;
  expect(id).toMatch(/^[a-f0-9-]{36}$/);
  expect(headers.get("X-Xiangqi-Tab-Source")).toBe("last");
  expect(sessionStorage.getItem("xiangqi.tab")).toBe(id);
  first.settleTabSession();
  await first.tabSessionFetch("/api/profile", {
    headers: { Authorization: "Bearer synthetic" },
  });
  expect(
    new Headers(request.mock.calls[1]![1].headers).get("X-Xiangqi-Tab-Source"),
  ).toBeNull();
  expect(
    new Headers(request.mock.calls[1]![1].headers).get("Authorization"),
  ).toBe("Bearer synthetic");
  vi.resetModules();
  const reloaded = await import("@web/shared/tab-session.js");
  await reloaded.tabSessionFetch("/api/auth/refresh", { method: "POST" });
  const next = new Headers(request.mock.calls[2]![1].headers);
  expect(next.get("X-Xiangqi-Tab")).not.toBe(id);
  expect(next.get("X-Xiangqi-Tab-Source")).toBe(id);
});

it("gives duplicated tabs a new selector when the stored selector is already locked", async () => {
  const old = "aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa";
  sessionStorage.setItem("xiangqi.tab", old);
  Object.defineProperty(navigator, "locks", {
    configurable: true,
    value: {
      request: vi
        .fn()
        .mockImplementationOnce(
          async (
            _name: string,
            _options: unknown,
            work: (lock: object | null) => unknown,
          ) => work(null),
        )
        .mockImplementation(
          async (
            _name: string,
            _options: unknown,
            work: (lock: object | null) => unknown,
          ) => work({}),
        ),
    },
  });
  const request = vi.fn().mockResolvedValue(new Response("{}"));
  vi.stubGlobal("fetch", request);
  const transport = await import("@web/shared/tab-session.js");
  await transport.tabSessionFetch("/api/auth/refresh", { method: "POST" });
  const headers = new Headers(request.mock.calls[0]![1].headers);
  expect(headers.get("X-Xiangqi-Tab")).not.toBe(old);
  expect(headers.get("X-Xiangqi-Tab-Source")).toBe(old);
  Reflect.deleteProperty(navigator, "locks");
});
