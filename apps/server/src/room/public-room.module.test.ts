import { afterAll, beforeAll, beforeEach, expect, it, vi } from "vitest";
import { createApp } from "../app.js";
import { LoginError } from "../login/contracts.js";
import { RoomError } from "./contracts.js";
import { PublicRoomModule } from "./public-room.module.js";
import type { PublicRoomService } from "./public-room-service.js";
const roomId = "22222222-2222-4222-8222-222222222222";
const commandId = "33333333-3333-4333-8333-333333333333";
const proof = { accessToken: "synthetic-bearer", appSession: "a".repeat(43) };
const list = vi.fn(async () => ({ rooms: [] }));
const entry = { roomId, version: 2, role: "red" };
const join = vi.fn(async () => entry);
let app: Awaited<ReturnType<typeof createApp>>, base: string;
beforeAll(async () => {
  app = await createApp(
    ["http://localhost:5173"],
    [PublicRoomModule.forRoot({ list, join } as unknown as PublicRoomService)],
  );
  await app.listen(0, "127.0.0.1");
  base = `http://127.0.0.1:${app.getHttpServer().address().port}`;
});
afterAll(() => app.close());
beforeEach(() => {
  list.mockClear();
  join.mockClear();
});
function request(body?: unknown, headers: Record<string, string> = {}) {
  return fetch(
    base +
      (body === undefined ? "/public-rooms" : `/public-rooms/${roomId}/join`),
    {
      method: body === undefined ? "GET" : "POST",
      headers: {
        Authorization: `Bearer ${proof.accessToken}`,
        "X-Xiangqi-Session": proof.appSession,
        Origin: "http://localhost:5173",
        "Content-Type": "application/json",
        ...headers,
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    },
  );
}
it("lists through dual proof with no-store and credentials CORS", async () => {
  const response = await request();
  expect(response.status).toBe(200);
  expect(response.headers.get("cache-control")).toBe("no-store");
  expect(response.headers.get("access-control-allow-credentials")).toBe("true");
  expect(await response.json()).toEqual({ rooms: [] });
  expect(list).toHaveBeenCalledExactlyOnceWith(proof);
});
it.each(["play", "watch"])(
  "joins with the exact public %s input and no invite code",
  async (preference) => {
    const response = await request({ commandId, preference });
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual(entry);
    expect(join).toHaveBeenCalledExactlyOnceWith(proof, roomId, {
      commandId,
      preference,
    });
  },
);
it("uses the HttpOnly session cookie when no capability header exists", async () => {
  const response = await fetch(base + "/public-rooms", {
    headers: {
      Authorization: `Bearer ${proof.accessToken}`,
      Cookie: `xiangqi_session=${proof.appSession}`,
    },
  });
  expect(response.status).toBe(200);
  expect(list).toHaveBeenCalledExactlyOnceWith(proof);
});
it.each([
  { Authorization: "" },
  { Authorization: "Bearer invalid token" },
  { "X-Xiangqi-Session": "bad", Cookie: `xiangqi_session=${proof.appSession}` },
  { "X-Xiangqi-Session": "", Cookie: `xiangqi_session=${proof.appSession}` },
])(
  "denies malformed proof without cookie fallback or service access",
  async (headers) => {
    const response = await request(undefined, headers);
    expect(response.status).toBe(401);
    expect((await response.json()).code).toBe("AUTH_REQUIRED");
    expect(list).not.toHaveBeenCalled();
  },
);
it("rejects duplicate capability cookies", async () => {
  const response = await fetch(base + "/public-rooms", {
    headers: {
      Authorization: `Bearer ${proof.accessToken}`,
      Cookie: `xiangqi_session=${proof.appSession}; xiangqi_session=${proof.appSession}`,
    },
  });
  expect(response.status).toBe(401);
  expect(list).not.toHaveBeenCalled();
});
it.each([
  [],
  {},
  { commandId },
  { commandId, preference: "auto" },
  { commandId, preference: "play", userId: "forged" },
])(
  "rejects malformed or extra join authority before the service",
  async (body) => {
    const response = await request(body);
    expect(response.status).toBe(400);
    expect((await response.json()).code).toBe("ROOM_INPUT_INVALID");
    expect(join).not.toHaveBeenCalled();
  },
);
it("rejects cross-origin joins before service execution", async () => {
  const response = await request(
    { commandId, preference: "play" },
    { Origin: "https://untrusted.example" },
  );
  expect(response.status).toBe(403);
  expect((await response.json()).code).toBe("ORIGIN_DENIED");
  expect(join).not.toHaveBeenCalled();
});
it.each([
  new RoomError("ROOM_FULL", "Phòng đã đầy", 409),
  new LoginError("SESSION_INVALID", "Phiên không hợp lệ", 401),
])("preserves safe domain errors", async (error) => {
  list.mockRejectedValueOnce(error);
  const response = await request();
  expect(response.status).toBe(error.status);
  expect(await response.json()).toEqual({
    code: error.code,
    message: error.message,
  });
});
it("sanitizes unknown failures without exposing provider details", async () => {
  join.mockRejectedValueOnce(Error("PRIVATE_DATABASE_PASSWORD"));
  const response = await request({ commandId, preference: "play" });
  expect(response.status).toBe(503);
  expect(await response.json()).toEqual({
    code: "ROOM_UNAVAILABLE",
    message: "Chức năng phòng chưa sẵn sàng",
  });
});

it("rejects a non-object JSON body at the native parser without service access", async () => {
  const response = await request(null);
  expect(response.status).toBe(400);
  expect(join).not.toHaveBeenCalled();
});
