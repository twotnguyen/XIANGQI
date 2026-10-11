import { afterAll, beforeAll, expect, it, vi } from "vitest";
import { createApp } from "../app.js";
import { RoomError, type RoomScope } from "./contracts.js";
import { RoomModule } from "./room.module.js";
import { RoomHttpService } from "./room-http.service.js";
import type { RoomStore } from "./room-store.js";
import type { RoomTransactions } from "./room-transactions.js";
const actor = {
  userId: "11111111-1111-4111-8111-111111111111",
  kind: "member" as const,
};
const roomId = "22222222-2222-4222-8222-222222222222";
const commandId = "33333333-3333-4333-8333-333333333333";
const proof = { accessToken: "synthetic-bearer", appSession: "a".repeat(43) };
const entry = {
  roomId,
  version: 1,
  role: "red" as const,
  inviteCode: "ABCDEFGH",
};
const create = vi.fn<
  (
    scope: RoomScope,
    input: Parameters<RoomStore["create"]>[1],
  ) => Promise<typeof entry>
>(async () => entry);
const join = vi.fn<
  (
    scope: RoomScope,
    input: Parameters<RoomStore["join"]>[1],
  ) => Promise<typeof entry>
>(async () => entry);
const snapshot = vi.fn<(scope: RoomScope, roomId: string) => Promise<unknown>>(
  async () => ({ roomId, version: 1, room: { name: "Phòng" }, role: "red" }),
);
const switchSeat = vi.fn(async () => ({ roomId, version: 2 }));
const leave = vi.fn(async () => {});
const resolveCode = vi.fn<(client: unknown, code: unknown) => Promise<string>>(
  async () => roomId,
);
const resolve = vi.fn<(proof: typeof proof) => Promise<typeof actor>>(
  async () => actor,
);
const authorize = vi.fn<
  (
    proof: typeof proof,
    actorProof: import("./room-transactions.js").RoomActorProof,
  ) => Promise<import("./room-transactions.js").RoomAuthorization>
>(async () => ({ status: "active", actor }));
const order: string[] = [];
const client = {};
const scope = {
  client,
  actor,
  lockedActorIds: new Set([actor.userId]),
  lockedRoomIds: new Set([roomId]),
} as RoomScope;
const withRoom = vi.fn(
  async (
    input: import("./room-transactions.js").RoomTransactionInput,
    auth: import("./room-transactions.js").RoomAuthorize,
    work: (scope: RoomScope) => Promise<unknown>,
  ) => {
    order.push("transaction");
    const result = await auth({
      client,
      actor: input.actor,
      roomIds: input.roomIds,
      lockedActorIds: scope.lockedActorIds,
    });
    if (result.status === "ended") return result;
    return { status: "active", value: await work(scope) };
  },
);
const service = new RoomHttpService(
  {
    create,
    join,
    snapshot,
    resolveCode,
    switchSeat,
    leave,
  } as unknown as RoomStore,
  { withRoom } as unknown as RoomTransactions,
  { resolve, authorize },
);
let app: Awaited<ReturnType<typeof createApp>>;
let base: string;
beforeAll(async () => {
  app = await createApp(
    ["http://localhost:5173"],
    [RoomModule.forRoot(service)],
  );
  await app.listen(0, "127.0.0.1");
  base = `http://127.0.0.1:${app.getHttpServer().address().port}`;
});
afterAll(() => app.close());
async function request(
  path: string,
  body?: unknown,
  headers: Record<string, string> = {},
) {
  return fetch(base + path, {
    method: body === undefined ? "GET" : "POST",
    headers: {
      Authorization: `Bearer ${proof.accessToken}`,
      "X-Xiangqi-Session": proof.appSession,
      "Content-Type": "application/json",
      Origin: "http://localhost:5173",
      ...headers,
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}
it("creates with dual proof, whitelist fields and no-store, ignoring forged actor/settings", async () => {
  const response = await request("/rooms", {
    commandId,
    name: "Phòng",
    timeMinutes: 5,
    viewerLimit: 0,
    userId: roomId,
    kind: "guest",
    visibility: "PUBLIC",
  });
  expect(response.status).toBe(200);
  expect(response.headers.get("cache-control")).toBe("no-store");
  expect(await response.json()).toEqual(entry);
  expect(resolve).toHaveBeenLastCalledWith(proof);
  expect(create).toHaveBeenLastCalledWith(scope, {
    commandId,
    name: "Phòng",
    timeMinutes: 5,
    viewerLimit: 0,
  });
  expect(authorize.mock.calls.at(-1)?.[1]).toMatchObject({ client, actor });
});
it("uses fixed session cookie only when the capability header is absent", async () => {
  const response = await fetch(base + "/rooms/" + roomId, {
    headers: {
      Authorization: "Bearer synthetic-bearer",
      Cookie: `xiangqi_session=${proof.appSession}`,
    },
  });
  expect(response.status).toBe(200);
  expect(resolve).toHaveBeenLastCalledWith(proof);
  expect(snapshot).toHaveBeenLastCalledWith(scope, roomId);
});
it("rejects malformed/missing dual proof and malformed or duplicate cookies before auth", async () => {
  for (const headers of [
    { Authorization: "", "X-Xiangqi-Session": proof.appSession },
    { Authorization: "Basic abc", "X-Xiangqi-Session": proof.appSession },
    {
      Authorization: "Bearer two tokens",
      "X-Xiangqi-Session": proof.appSession,
    },
    {
      Authorization: "Bearer synthetic-bearer",
      "X-Xiangqi-Session": "bad",
      Cookie: `xiangqi_session=${proof.appSession}`,
    },
    {
      Authorization: "Bearer synthetic-bearer",
      Cookie: `xiangqi_session=${proof.appSession}; xiangqi_session=${proof.appSession}`,
    },
  ]) {
    const calls = resolve.mock.calls.length;
    const response = await fetch(base + "/rooms/" + roomId, { headers });
    expect(response.status).toBe(401);
    expect(resolve.mock.calls.length).toBe(calls);
  }
});
it("resolves code privately and rechecks it under the target room transaction", async () => {
  const response = await request("/rooms/join", {
    commandId,
    code: "ABCDEFGH",
    preference: "watch",
    expectedVersion: 1,
    userId: actor.userId,
    roomId: actor.userId,
  });
  expect(response.status).toBe(200);
  expect(resolveCode).toHaveBeenLastCalledWith(client, "ABCDEFGH");
  expect(withRoom.mock.calls.at(-1)?.[0]).toEqual({ actor, roomIds: [roomId] });
  expect(join).toHaveBeenLastCalledWith(scope, {
    commandId,
    roomId,
    intent: "watch",
    expectedVersion: 1,
  });
});
it("rejects malformed bodies/UUID and unsupported input types with400", async () => {
  for (const body of [
    [],
    null,
    { commandId, name: 1 },
    { commandId, name: "Phòng", timeMinutes: "5" },
    { commandId, name: "Phòng", viewerLimit: false },
  ]) {
    expect((await request("/rooms", body)).status).toBe(400);
  }
  expect((await request("/rooms/not-a-uuid")).status).toBe(400);
  expect(
    (
      await request("/rooms/join", {
        commandId,
        code: ["ABCDEFGH"],
        preference: "watch",
      })
    ).status,
  ).toBe(400);
});
it("preserves known errors and sanitizes unknown provider/SQL payloads", async () => {
  for (const status of [400, 403, 409, 503]) {
    create.mockRejectedValueOnce(
      new RoomError("ROOM_TEST", "Thông báo hợp lệ", status),
    );
    const response = await request("/rooms", { commandId, name: "Phòng" });
    expect(response.status).toBe(status);
    expect(await response.json()).toEqual({
      code: "ROOM_TEST",
      message: "Thông báo hợp lệ",
    });
  }
  create.mockRejectedValueOnce(new Error("password=private provider payload"));
  const response = await request("/rooms", { commandId, name: "Phòng" });
  expect(response.status).toBe(503);
  expect(await response.text()).not.toContain("private");
});
it("fails closed for Guest or ended authorization before store work", async () => {
  resolve.mockResolvedValueOnce({ ...actor, kind: "guest" } as never);
  const calls = create.mock.calls.length;
  expect((await request("/rooms", { commandId, name: "Phòng" })).status).toBe(
    403,
  );
  expect(create.mock.calls.length).toBe(calls);
  authorize.mockResolvedValueOnce({ status: "ended" } as never);
  expect((await request("/rooms", { commandId, name: "Phòng" })).status).toBe(
    401,
  );
  expect(create.mock.calls.length).toBe(calls);
});
it("authenticates before entering SQL coordinator and rejects cross-origin writes", async () => {
  order.length = 0;
  resolve.mockImplementationOnce(async () => {
    order.push("resolve");
    return actor;
  });
  await request("/rooms", { commandId, name: "Phòng" });
  expect(order).toEqual(["resolve", "transaction"]);
  const calls = create.mock.calls.length;
  expect(
    (
      await request(
        "/rooms",
        { commandId, name: "Phòng" },
        { Origin: "https://untrusted.invalid" },
      )
    ).status,
  ).toBe(403);
  expect(create.mock.calls.length).toBe(calls);
});

it("defaults preference to auto and preserves authoritative spectator fallback/notice", async () => {
  join.mockResolvedValueOnce({
    roomId,
    version: 2,
    role: "spectator",
    notice: "Ghế vừa có người, bạn đang xem trận",
  } as never);
  const response = await request("/rooms/join", {
    commandId,
    code: "ABCDEFGH",
    acceptViewerFallback: false,
  });
  expect(response.status).toBe(200);
  expect(await response.json()).toMatchObject({
    role: "spectator",
    notice: "Ghế vừa có người, bạn đang xem trận",
  });
  expect(join).toHaveBeenLastCalledWith(scope, {
    commandId,
    roomId,
    intent: "auto",
  });
});

it("rejects a changed code target during the second transaction without joining", async () => {
  resolveCode.mockResolvedValueOnce(roomId).mockResolvedValueOnce(actor.userId);
  const calls = join.mock.calls.length;
  const response = await request("/rooms/join", {
    commandId,
    code: "ABCDEFGH",
  });
  expect(response.status).toBe(409);
  expect(join.mock.calls.length).toBe(calls);
});

it("keeps private snapshots behind fresh auth and same-client authorization", async () => {
  const calls = snapshot.mock.calls.length;
  authorize.mockRejectedValueOnce(
    new RoomError("AUTH_REQUIRED", "Phiên đăng nhập không hợp lệ", 401),
  );
  const response = await request("/rooms/" + roomId);
  expect(response.status).toBe(401);
  expect(snapshot.mock.calls.length).toBe(calls);
  resolve.mockRejectedValueOnce(new Error("private token/provider details"));
  const unavailable = await request("/rooms/" + roomId);
  expect(unavailable.status).toBe(503);
  expect(await unavailable.text()).not.toContain("private");
  expect(snapshot.mock.calls.length).toBe(calls);
});

it("switches seats only within fresh authorized matching room version", async () => {
  const response = await request(`/rooms/${roomId}/switch-seat`, {
    expectedVersion: 1,
    userId: roomId,
  });
  expect(response.status).toBe(200);
  expect(response.headers.get("cache-control")).toBe("no-store");
  expect(switchSeat).toHaveBeenLastCalledWith(scope, roomId);
  const calls = switchSeat.mock.calls.length;
  const stale = await request(`/rooms/${roomId}/switch-seat`, {
    expectedVersion: 0,
  });
  expect(stale.status).toBe(409);
  expect(switchSeat.mock.calls.length).toBe(calls);
  for (const expectedVersion of [undefined, -1, "1", 1.5]) {
    expect(
      (await request(`/rooms/${roomId}/switch-seat`, { expectedVersion }))
        .status,
    ).toBe(400);
  }
});
it("leaves only the authenticated actor and preserves lifecycle errors", async () => {
  const response = await request(`/rooms/${roomId}/leave`, {
    expectedVersion: 1,
    userId: roomId,
  });
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ roomId, left: true });
  expect(leave).toHaveBeenLastCalledWith(scope, roomId);
  leave.mockRejectedValueOnce(
    new RoomError(
      "MATCH_LIFECYCLE_UNAVAILABLE",
      "Chưa thể xử lý kết quả ván",
      503,
    ),
  );
  const playing = await request(`/rooms/${roomId}/leave`, {
    expectedVersion: 1,
  });
  expect(playing.status).toBe(503);
  const calls = leave.mock.calls.length;
  authorize.mockRejectedValueOnce(
    new RoomError("AUTH_REQUIRED", "Phiên đăng nhập không hợp lệ", 401),
  );
  expect(
    (await request(`/rooms/${roomId}/leave`, { expectedVersion: 1 })).status,
  ).toBe(401);
  expect(leave.mock.calls.length).toBe(calls);
});
