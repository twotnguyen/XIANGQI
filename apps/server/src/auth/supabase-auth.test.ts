import { afterEach, describe, expect, it, vi } from "vitest";
import { SupabaseAuth } from "./supabase-auth.js";
import { createServer } from "node:http";

afterEach(() => vi.unstubAllGlobals());

it("exchanges Google credential and raw nonce at the configured provider only", async () => {
  let requestBody: unknown;
  let requestPath: string | undefined;
  const server = createServer(async (request, response) => {
    requestPath = request.url;
    let raw = "";
    for await (const chunk of request) raw += String(chunk);
    requestBody = JSON.parse(raw);
    response.setHeader("Content-Type", "application/json");
    response.end(
      JSON.stringify({
        access_token: "synthetic-access",
        refresh_token: "synthetic-refresh",
        expires_in: 3600,
        user: { id: "synthetic-user" },
      }),
    );
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    const address = server.address();
    if (!address || typeof address === "string")
      throw new Error("Fixture address");
    const auth = new SupabaseAuth(
      `http://127.0.0.1:${address.port}`,
      "fixture-public",
      "fixture-secret",
    );
    await expect(
      auth.exchangeIDToken("synthetic-google-token", "synthetic-raw-nonce"),
    ).resolves.toMatchObject({ access_token: "synthetic-access" });
    expect(requestPath).toBe("/auth/v1/token?grant_type=id_token");
    expect(requestBody).toEqual({
      provider: "google",
      id_token: "synthetic-google-token",
      nonce: "synthetic-raw-nonce",
    });
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});

it.each([307, 308])(
  "does not forward credentials or provider keys through HTTP redirect %s",
  async (status) => {
    let forwarded = 0;
    const target = createServer((_request, response) => {
      forwarded++;
      response.end("{}");
    });
    await new Promise<void>((resolve) =>
      target.listen(0, "127.0.0.1", resolve),
    );
    const address = target.address();
    if (!address || typeof address === "string")
      throw new Error("Fixture address");
    const source = createServer((_request, response) => {
      response.writeHead(status, {
        Location: `http://127.0.0.1:${address.port}/redirect-target`,
      });
      response.end();
    });
    await new Promise<void>((resolve) =>
      source.listen(0, "127.0.0.1", resolve),
    );
    try {
      const origin = source.address();
      if (!origin || typeof origin === "string")
        throw new Error("Fixture address");
      const auth = new SupabaseAuth(
        `http://127.0.0.1:${origin.port}`,
        "fixture-public",
        "fixture-secret",
      );
      await expect(
        auth.signInPassword("synthetic@example.invalid", "test-only-password"),
      ).rejects.toMatchObject({ status: 503 });
      expect(forwarded).toBe(0);
    } finally {
      for (const server of [source, target]) {
        server.closeAllConnections();
        await new Promise<void>((resolve) => server.close(() => resolve()));
      }
    }
  },
);

it("aborts the actual password-provider HTTP request when its caller deadline aborts", async () => {
  let received!: () => void;
  let closed!: () => void;
  let payload = "";
  let path: string | undefined;
  const requestReceived = new Promise<void>((resolve) => {
    received = resolve;
  });
  const responseClosed = new Promise<void>((resolve) => {
    closed = resolve;
  });
  const server = createServer((request, response) => {
    path = request.url;
    request.setEncoding("utf8");
    request.on("data", (chunk: string) => {
      payload += chunk;
    });
    request.on("end", received);
    response.on("close", closed);
    // A local, deliberately stalled provider: no response is sent.
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    const address = server.address();
    if (!address || typeof address === "string")
      throw new Error("Invalid fixture address");
    const auth = new SupabaseAuth(
      `http://127.0.0.1:${address.port}`,
      "fixture-public",
      "fixture-secret",
    );
    const deadline = new AbortController();
    const outcome = expect(
      auth.signInPassword(
        "synthetic@example.invalid",
        "test-only-password",
        deadline.signal,
      ),
    ).rejects.toMatchObject({ code: "AUTH_PROVIDER_ERROR", status: 503 });
    await requestReceived;
    deadline.abort();
    await outcome;
    await responseClosed;
    expect(path).toBe("/auth/v1/token?grant_type=password");
    expect(JSON.parse(payload)).toEqual({
      email: "synthetic@example.invalid",
      password: "test-only-password",
    });
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
});

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
  it.each([401, 403])(
    "treats rejected user tokens as invalid sessions (%s)",
    async (status) => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(new Response("", { status })),
      );
      await expect(auth.getUser("synthetic-token")).rejects.toMatchObject({
        code: "SESSION_INVALID",
        status: 401,
      });
    },
  );
  it("refreshes provider tokens without issuing a new application deadline", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        access_token: "next-access",
        refresh_token: "next-refresh",
        expires_in: 3600,
        user: { id: "synthetic-user" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    await expect(auth.refreshSession("old-refresh")).resolves.toMatchObject({
      access_token: "next-access",
      refresh_token: "next-refresh",
    });
    const [url, options] = fetchMock.mock.calls[0]!;
    expect(url).toBe(
      "https://auth.example.test/auth/v1/token?grant_type=refresh_token",
    );
    expect(JSON.parse(options.body)).toEqual({ refresh_token: "old-refresh" });
  });
  it("rejects an invalid refresh token without exposing provider data", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response("private provider response", { status: 400 }),
        ),
    );
    await expect(auth.refreshSession("invalid-refresh")).rejects.toMatchObject({
      code: "SESSION_INVALID",
      status: 401,
    });
  });
});
