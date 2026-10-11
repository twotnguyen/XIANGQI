import { afterAll, beforeAll, beforeEach, expect, it, vi } from "vitest";
import { initialPosition, serializePosition } from "@xiangqi/xiangqi-core";
import { createApp } from "../app.js";
import { RoomError } from "../room/contracts.js";
import { AiError, type AiSnapshot } from "./ai-games.js";
import { AiModule, type AiHttpApi } from "./ai.module.js";

const gameId = "11111111-1111-4111-8111-111111111111";
const tabId = "22222222-2222-4222-8222-222222222222";
const proof = { accessToken: "synthetic-bearer", appSession: "a".repeat(43) };
const tab = { tabId, connectionId: "synthetic_socket-1", generation: 3 };
const origin = { kind: "human" as const, proof, tab };
const snapshot: AiSnapshot = {
  id: gameId,
  ownerId: "PRIVATE_OWNER_ID",
  requestedSide: "random",
  actualSide: "red",
  level: "easy",
  position: serializePosition(initialPosition()),
  history: [serializePosition(initialPosition())],
  version: 1,
  status: "ACTIVE",
  engineState: "IDLE",
  engineError: null,
  outcome: null,
};
const result = {
  snapshot,
  serverNow: "2026-10-11T04:00:00.000Z",
  control: { mode: "controller" as const, reason: null, generation: 3 },
};
const current = vi.fn(async () => ({ gameId }));
const read = vi.fn(async () => result);
const create = vi.fn(async () => result);
const move = vi.fn(async () => result);
const resign = vi.fn(async () => result);
const retry = vi.fn(async () => result);
const service: AiHttpApi = { current, read, create, move, resign, retry };
let app: Awaited<ReturnType<typeof createApp>>, base: string;
beforeAll(async () => {
  app = await createApp(["http://localhost:5173"], [AiModule.forRoot(service)]);
  await app.listen(0, "127.0.0.1");
  base = `http://127.0.0.1:${app.getHttpServer().address().port}`;
});
afterAll(async () => {
  if (app) await app.close();
});
beforeEach(() => vi.clearAllMocks());
function request(
  path: string,
  body?: unknown,
  headers: Record<string, string> = {},
) {
  return fetch(base + path, {
    method: body === undefined ? "GET" : "POST",
    headers: {
      Authorization: `Bearer ${proof.accessToken}`,
      "X-Xiangqi-Session": proof.appSession,
      "X-AI-Tab": tabId,
      "X-AI-Connection": tab.connectionId,
      "X-AI-Generation": "3",
      "Content-Type": "application/json",
      Origin: "http://localhost:5173",
      ...headers,
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}
it("reads current position with dual proof without granting tab authority", async () => {
  const response = await request("/ai/current", undefined, {
    "X-AI-Tab": "",
    "X-AI-Connection": "",
    "X-AI-Generation": "",
  });
  expect(response.status).toBe(200);
  expect(response.headers.get("cache-control")).toBe("no-store");
  expect(await response.json()).toEqual({ gameId });
  expect(current).toHaveBeenCalledExactlyOnceWith(proof);
  expect(read).not.toHaveBeenCalled();
});
it("reads canonical state and excludes owner or extra internal fields", async () => {
  read.mockResolvedValueOnce({
    ...result,
    snapshot: { ...snapshot, providerSecret: "PRIVATE_PROVIDER" },
    bootId: "PRIVATE_BOOT",
  } as typeof result);
  const response = await request(`/ai/${gameId}`);
  expect(response.status).toBe(200);
  expect(read).toHaveBeenCalledExactlyOnceWith(origin, gameId);
  const value = await response.json();
  expect(value).toEqual({
    snapshot: Object.fromEntries(
      Object.entries(snapshot).filter(([key]) => key !== "ownerId"),
    ),
    serverNow: result.serverNow,
    control: result.control,
  });
  expect(JSON.stringify(value)).not.toContain("PRIVATE");
});
it("creates from setup without accepting client owner, FEN or actual side", async () => {
  const input = { level: "easy", requestedSide: "random" };
  const response = await request("/ai", input);
  expect(response.status).toBe(200);
  expect(create).toHaveBeenCalledExactlyOnceWith(origin, input);
});
it.each([
  {},
  { level: "expert", requestedSide: "red" },
  { level: "easy", requestedSide: "blue" },
  { level: "easy", requestedSide: "red", ownerId: gameId },
  { level: "easy", requestedSide: "red", actualSide: "black" },
  { level: "easy", requestedSide: "red", position: snapshot.position },
])("rejects invalid or forged setup before service admission", async (body) => {
  const response = await request("/ai", body);
  expect(response.status).toBe(400);
  expect(create).not.toHaveBeenCalled();
});
it("passes only safe version and canonical square indexes to move", async () => {
  const input = { version: 1, move: { from: 54, to: 45 } };
  const response = await request(`/ai/${gameId}/move`, input);
  expect(response.status).toBe(200);
  expect(move).toHaveBeenCalledExactlyOnceWith(origin, gameId, input);
});
it.each([
  { version: 1, move: { from: -1, to: 45 } },
  { version: 1, move: { from: 54, to: 90 } },
  { version: 1, move: { from: 54, to: 54 } },
  { version: 1, move: { from: 54.5, to: 45 } },
  { version: "1", move: { from: 54, to: 45 } },
  { version: Number.MAX_SAFE_INTEGER + 1, move: { from: 54, to: 45 } },
  { version: 1, move: { from: 54, to: 45, side: "red" } },
  { version: 1, move: { from: 54, to: 45 }, ownerId: gameId },
])("rejects malformed move/CAS before service invocation", async (body) => {
  const response = await request(`/ai/${gameId}/move`, body);
  expect(response.status).toBe(400);
  expect(move).not.toHaveBeenCalled();
});
it.each(["resign", "retry"] as const)(
  "passes %s exact version",
  async (action) => {
    const response = await request(`/ai/${gameId}/${action}`, { version: 1 });
    expect(response.status).toBe(200);
    expect(service[action]).toHaveBeenCalledExactlyOnceWith(origin, gameId, 1);
  },
);
it.each([
  { "X-AI-Tab": "forged" },
  { "X-AI-Connection": "socket with spaces" },
  { "X-AI-Generation": "0" },
  { "X-AI-Generation": "03" },
  { "X-AI-Generation": "3, 4" },
  { "X-AI-Generation": "9007199254740992" },
] as Record<string, string>[])(
  "rejects malformed physical proof before read",
  async (headers) => {
    const response = await request(`/ai/${gameId}`, undefined, headers);
    expect(response.status).toBe(400);
    expect(read).not.toHaveBeenCalled();
  },
);
it.each([
  { Authorization: "" },
  { "X-Xiangqi-Session": "bad", Cookie: `xiangqi_session=${proof.appSession}` },
] as Record<string, string>[])(
  "rejects invalid dual proof without fallback",
  async (headers) => {
    const response = await request("/ai/current", undefined, headers);
    expect(response.status).toBe(401);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(current).not.toHaveBeenCalled();
  },
);
it("accepts HttpOnly session cookie when no session header is supplied", async () => {
  const response = await fetch(base + "/ai/current", {
    headers: {
      Authorization: `Bearer ${proof.accessToken}`,
      Cookie: `xiangqi_session=${proof.appSession}`,
    },
  });
  expect(response.status).toBe(200);
  expect(current).toHaveBeenCalledExactlyOnceWith(proof);
});
it("rejects wrong game ID and query identity without service access", async () => {
  expect((await request("/ai/not-a-uuid")).status).toBe(400);
  expect((await request(`/ai/${gameId}?ownerId=forged`)).status).toBe(400);
  expect(read).not.toHaveBeenCalled();
});
it("preserves readonly control for a correctly authorized view", async () => {
  read.mockResolvedValueOnce({
    ...result,
    control: { mode: "readonly", reason: "other_tab", generation: 4 },
  } as unknown as typeof result);
  const response = await request(`/ai/${gameId}`);
  expect((await response.json()).control).toEqual({
    mode: "readonly",
    reason: "other_tab",
    generation: 4,
  });
});
it("returns CAS conflict without replaying the move", async () => {
  move.mockRejectedValueOnce(new AiError("AI_VERSION_CONFLICT"));
  const response = await request(`/ai/${gameId}/move`, {
    version: 1,
    move: { from: 54, to: 45 },
  });
  expect(response.status).toBe(409);
  expect((await response.json()).code).toBe("AI_VERSION_STALE");
  expect(move).toHaveBeenCalledTimes(1);
});
it("sanitizes typed authority messages and unknown infrastructure errors", async () => {
  read.mockRejectedValueOnce(
    new RoomError("TAB_READ_ONLY", "PRIVATE_EMAIL", 409),
  );
  const denial = await request(`/ai/${gameId}`);
  expect(denial.status).toBe(409);
  expect(denial.headers.get("cache-control")).toBe("no-store");
  expect((await denial.json()).code).toBe("TAB_READ_ONLY");
  read.mockRejectedValueOnce(Error("PRIVATE_DATABASE_PASSWORD"));
  const unavailable = await request(`/ai/${gameId}`);
  expect(unavailable.status).toBe(503);
  expect(JSON.stringify(await unavailable.json())).not.toContain("PRIVATE");
});
it("denies a cross-origin mutation before admission", async () => {
  const response = await request(
    "/ai",
    { level: "easy", requestedSide: "red" },
    {
      Origin: "https://untrusted.example",
    },
  );
  expect(response.status).toBe(403);
  expect(create).not.toHaveBeenCalled();
});
it("does not expose a private value in an unknown typed error code", async () => {
  read.mockRejectedValueOnce(
    new RoomError("PRIVATE_SESSION_CAPABILITY", "private", 401),
  );
  const response = await request(`/ai/${gameId}`);
  expect(response.status).toBe(503);
  expect((await response.json()).code).toBe("AI_UNAVAILABLE");
});
it("sanitizes malformed JSON before controller execution and disables caching", async () => {
  const response = await fetch(base + "/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "PRIVATE_SESSION_CAPABILITY",
  });
  expect(response.status).toBe(400);
  expect(response.headers.get("cache-control")).toBe("no-store");
  expect((await response.json()).code).toBe("AI_INPUT_INVALID");
  expect(create).not.toHaveBeenCalled();
});
