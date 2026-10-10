import { afterEach, describe, expect, it, vi } from "vitest";
import { SupabaseAuth } from "./supabase-auth.js";

afterEach(() => vi.unstubAllGlobals());

describe("Supabase OTP error classification", () => {
  const auth = new SupabaseAuth(
    "https://auth.example.test",
    "public",
    "secret",
  );

  it.each([500, 503, 401])(
    "preserves provider failures (%s)",
    async (status) => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(new Response("", { status })),
      );
      await expect(
        auth.verify("test@example.test", "123456"),
      ).rejects.toMatchObject({
        code: "AUTH_PROVIDER_ERROR",
        status: 503,
      });
    },
  );

  it("preserves network failures and malformed successful responses", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
    await expect(
      auth.verify("test@example.test", "123456"),
    ).rejects.toMatchObject({
      code: "AUTH_PROVIDER_ERROR",
      status: 503,
    });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({})));
    await expect(
      auth.verify("test@example.test", "123456"),
    ).rejects.toMatchObject({
      code: "AUTH_PROVIDER_ERROR",
      status: 503,
    });
  });

  it.each([400, 403])("maps invalid or expired codes (%s)", async (status) => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("", { status })),
    );
    await expect(
      auth.verify("test@example.test", "123456"),
    ).rejects.toMatchObject({
      code: "OTP_INVALID",
      status: 400,
    });
  });

  it("preserves rate limits", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("", { status: 429 })),
    );
    await expect(
      auth.verify("test@example.test", "123456"),
    ).rejects.toMatchObject({
      code: "OTP_RATE_LIMIT",
      status: 429,
    });
  });
});
