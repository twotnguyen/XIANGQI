// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
afterEach(() => {
  document
    .querySelectorAll('script[src="https://accounts.google.com/gsi/client"]')
    .forEach((s) => s.remove());
  Reflect.deleteProperty(window, "google");
  vi.resetModules();
  vi.unstubAllGlobals();
});
it("loads one exact trusted GIS script for concurrent callers", async () => {
  const { loadGoogleIdentity } = await import("./google-gis.js");
  const first = loadGoogleIdentity(),
    second = loadGoogleIdentity();
  expect(document.querySelectorAll("script")).toHaveLength(1);
  const script = document.querySelector("script")!;
  expect(script.src).toBe("https://accounts.google.com/gsi/client");
  const identity = { initialize: vi.fn(), renderButton: vi.fn() };
  Object.assign(window, { google: { accounts: { id: identity } } });
  script.dispatchEvent(new Event("load"));
  expect(await first).toBe(identity);
  expect(await second).toBe(identity);
});
it("allows retry after a failed trusted-script load", async () => {
  const { loadGoogleIdentity } = await import("./google-gis.js");
  const failed = loadGoogleIdentity();
  document.querySelector("script")!.dispatchEvent(new Event("error"));
  await expect(failed).rejects.toThrow();
  const retried = loadGoogleIdentity();
  const identity = { initialize: vi.fn(), renderButton: vi.fn() };
  Object.assign(window, { google: { accounts: { id: identity } } });
  document.querySelector("script")!.dispatchEvent(new Event("load"));
  expect(await retried).toBe(identity);
});
it("validates readiness and sanitizes Google API errors without exposing payloads", async () => {
  const { googleAvailable, googleRequest } = await import("./google-gis.js");
  const request = vi
    .fn()
    .mockResolvedValueOnce(
      new Response(JSON.stringify({ google: false, guest: false })),
    )
    .mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          code: "EMAIL_TAKEN",
          message: "private fixture token",
        }),
        { status: 409 },
      ),
    );
  vi.stubGlobal("fetch", request);
  expect(await googleAvailable()).toBe(false);
  await expect(
    googleRequest("authenticate", {
      credential: "opaque-fixture",
      remember: false,
    }),
  ).rejects.toThrow("Email này đã được đăng ký");
  expect(request.mock.calls[1]![1]).toMatchObject({
    credentials: "include",
    redirect: "error",
    cache: "no-store",
  });
});
