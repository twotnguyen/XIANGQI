import { afterAll, beforeAll, beforeEach, expect, it, vi } from "vitest";
import type { PoolClient } from "pg";
import { createApp } from "../app.js";
import {
  RoomError,
  type RoomActor,
  type RoomScope,
  type RoomView,
} from "./contracts.js";
import { RoomHttpService } from "./room-http.service.js";
import { RoomModule } from "./room.module.js";
import type { RoomStore } from "./room-store.js";
import type {
  RoomActorProof,
  RoomAuthorization,
  RoomAuthorize,
  RoomTransactionInput,
  RoomTransactions,
} from "./room-transactions.js";
const actor: RoomActor = {
  userId: "11111111-1111-4111-8111-111111111111",
  kind: "member",
};
const roomId = "22222222-2222-4222-8222-2222222222ab";
const proof = { accessToken: "synthetic-bearer", appSession: "a".repeat(43) };
const client = {} as PoolClient;
const scope: RoomScope = {
  client,
  actor,
  lockedActorIds: new Set([actor.userId]),
  lockedRoomIds: new Set([roomId]),
};
const view: RoomView = {
  serverNow: "2026-10-11T00:00:00Z",
  roomId,
  version: 9,
  role: "red",
  room: {
    name: "Phòng",
    status: "WAITING",
    hostId: actor.userId,
    visibility: "PUBLIC",
    inviteCode: "ABCDEFGH",
    timeMinutes: 10,
    viewerLimit: 5,
    seats: { red: actor.userId, black: null },
    ready: { red: false, black: false },
    connected: { red: true, black: false },
    graceUntil: { red: null, black: null },
    countdown: null,
  },
};
const changeVisibility = vi.fn(
  async (
    _scope: RoomScope,
    _roomId: string,
    _version: number,
    visibility: RoomView["room"]["visibility"],
  ): Promise<RoomView> => ({ ...view, room: { ...view.room, visibility } }),
);
const resolve = vi.fn<(input: typeof proof) => Promise<RoomActor>>(
  async () => actor,
);
const authorize = vi.fn<
  (
    input: typeof proof,
    actorProof: RoomActorProof,
  ) => Promise<RoomAuthorization>
>(async () => ({ status: "active", actor }));
const trace: string[] = [];
const withRoom = vi.fn(
  async (
    input: RoomTransactionInput,
    auth: RoomAuthorize,
    work: (scope: RoomScope) => Promise<unknown>,
  ) => {
    trace.push("transaction");
    const actorProof = {
      client,
      actor: input.actor,
      roomIds: input.roomIds,
      lockedActorIds: scope.lockedActorIds,
    };
    // Synthetic coordinator models its actual pre/post-room reauthorization seam.
    const before = await auth(actorProof);
    if (before.status === "ended") return before;
    const after = await auth(actorProof);
    if (after.status === "ended") return after;
    trace.push("work");
    return { status: "active", value: await work(scope) };
  },
);
const service = new RoomHttpService(
  { changeVisibility } as unknown as RoomStore,
  { withRoom } as unknown as RoomTransactions,
  { resolve, authorize },
);
let app: Awaited<ReturnType<typeof createApp>>, base: string;
beforeAll(async () => {
  app = await createApp(
    ["http://localhost:5174"],
    [RoomModule.forRoot(service)],
  );
  await app.listen(0, "127.0.0.1");
  base = `http://127.0.0.1:${app.getHttpServer().address().port}`;
});
afterAll(() => app.close());
beforeEach(() => {
  vi.clearAllMocks();
  trace.length = 0;
  resolve.mockImplementation(async () => {
    trace.push("resolve");
    return actor;
  });
});
async function request(
  body: unknown = { expectedVersion: 8, visibility: "PUBLIC" },
  headers: Record<string, string> = {},
  id = roomId,
) {
  return fetch(`${base}/rooms/${id}/visibility`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${proof.accessToken}`,
      "X-Xiangqi-Session": proof.appSession,
      "Content-Type": "application/json",
      Origin: "http://localhost:5174",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}
it.each(["PUBLIC", "CODE_ONLY", "LOCKED"] as const)(
  "delegates %s with trusted actor, exact CAS and same-client proof, ignoring forged body authority",
  async (visibility) => {
    const response = await request({
      visibility,
      expectedVersion: 8,
      userId: roomId,
      kind: "guest",
      ownerId: roomId,
      accessToken: "forged",
      appSession: "forged",
    });
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("access-control-allow-origin")).toBe(
      "http://localhost:5174",
    );
    expect(await response.json()).toEqual({
      ...view,
      room: { ...view.room, visibility },
    });
    expect(resolve).toHaveBeenCalledExactlyOnceWith(proof);
    expect(trace).toEqual(["resolve", "transaction", "work"]);
    expect(withRoom.mock.calls[0]?.[0]).toEqual({ actor, roomIds: [roomId] });
    expect(authorize).toHaveBeenCalledTimes(2);
    expect(authorize.mock.calls[0]?.[0]).toBe(authorize.mock.calls[1]?.[0]);
    expect(authorize.mock.calls[0]?.[1]).toMatchObject({
      client,
      actor,
      roomIds: [roomId],
    });
    expect(changeVisibility).toHaveBeenCalledExactlyOnceWith(
      scope,
      roomId,
      8,
      visibility,
    );
  },
);
it.each(
  [undefined, null, false, [], {}, "public", "PRIVATE", ["PUBLIC"]].map(
    (value) => [value],
  ),
)(
  "rejects malformed visibility %j before resolver or transaction",
  async (visibility) => {
    const response = await request({ expectedVersion: 8, visibility });
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ code: "ROOM_INPUT_INVALID" });
    expect(resolve).not.toHaveBeenCalled();
    expect(withRoom).not.toHaveBeenCalled();
  },
);
it.each([undefined, null, -1, 1.5, "8", 9007199254740992])(
  "rejects unsafe/missing CAS %j before authorization",
  async (expectedVersion) => {
    expect(
      (await request({ expectedVersion, visibility: "PUBLIC" })).status,
    ).toBe(400);
    expect(resolve).not.toHaveBeenCalled();
    expect(changeVisibility).not.toHaveBeenCalled();
  },
);
it("accepts zero CAS and canonicalizes the target UUID; refuses malformed target/body", async () => {
  expect(
    (
      await request(
        { expectedVersion: 0, visibility: "CODE_ONLY" },
        {},
        roomId.toUpperCase(),
      )
    ).status,
  ).toBe(200);
  expect(changeVisibility).toHaveBeenCalledWith(scope, roomId, 0, "CODE_ONLY");
  resolve.mockClear();
  changeVisibility.mockClear();
  expect(
    (
      await request(
        { expectedVersion: 8, visibility: "PUBLIC" },
        {},
        "bad-room",
      )
    ).status,
  ).toBe(400);
  expect((await request(["PUBLIC", 8])).status).toBe(400);
  expect(resolve).not.toHaveBeenCalled();
  expect(changeVisibility).not.toHaveBeenCalled();
});
it("requires both proofs and never falls back to cookie for a malformed explicit capability header", async () => {
  for (const headers of [
    { Authorization: "" },
    { "X-Xiangqi-Session": "" },
    {
      "X-Xiangqi-Session": "bad",
      Cookie: `xiangqi_session=${proof.appSession}`,
    },
  ]) {
    expect((await request(undefined, headers)).status).toBe(401);
  }
  expect(resolve).not.toHaveBeenCalled();
  expect(changeVisibility).not.toHaveBeenCalled();
  const response = await fetch(`${base}/rooms/${roomId}/visibility`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${proof.accessToken}`,
      Cookie: `xiangqi_session=${proof.appSession}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ visibility: "PUBLIC", expectedVersion: 8 }),
  });
  expect(response.status).toBe(200);
  expect(resolve).toHaveBeenLastCalledWith(proof);
});
it("does not mutate when the session ends during post-room authorization", async () => {
  authorize
    .mockResolvedValueOnce({ status: "active", actor })
    .mockResolvedValueOnce({ status: "ended" });
  const response = await request();
  expect(response.status).toBe(401);
  expect(await response.json()).toMatchObject({ code: "AUTH_REQUIRED" });
  expect(changeVisibility).not.toHaveBeenCalled();
});
it("rejects guest identities before entering the member coordinator", async () => {
  resolve.mockResolvedValueOnce({ ...actor, kind: "guest" });
  expect((await request()).status).toBe(403);
  expect(withRoom).not.toHaveBeenCalled();
  expect(changeVisibility).not.toHaveBeenCalled();
});
it.each([
  ["ROOM_HOST_REQUIRED", 403],
  ["VERSION_STALE", 409],
  ["ROOM_LOCK_REQUIRES_PLAYERS", 409],
  ["ROOM_UNAVAILABLE", 503],
] as const)(
  "preserves known domain failure %s and status %i",
  async (code, status) => {
    changeVisibility.mockRejectedValueOnce(
      new RoomError(code, "Thông báo nghiệp vụ", status),
    );
    const response = await request();
    expect(response.status).toBe(status);
    expect(await response.json()).toEqual({
      code,
      message: "Thông báo nghiệp vụ",
    });
  },
);
it.each(["resolve", "authorize", "store"] as const)(
  "sanitizes unknown %s outage without exposing proof or provider detail",
  async (boundary) => {
    const error = new Error(
      `PRIVATE_PROVIDER ${proof.accessToken} ${proof.appSession}`,
    );
    if (boundary === "resolve") resolve.mockRejectedValueOnce(error);
    else if (boundary === "authorize") authorize.mockRejectedValueOnce(error);
    else changeVisibility.mockRejectedValueOnce(error);
    const response = await request();
    expect(response.status).toBe(503);
    const body = await response.text();
    expect(JSON.parse(body)).toEqual({
      code: "ROOM_UNAVAILABLE",
      message: "Chức năng phòng chưa sẵn sàng",
    });
    expect(body).not.toContain("PRIVATE_PROVIDER");
    expect(body).not.toContain(proof.accessToken);
    expect(body).not.toContain(proof.appSession);
    if (boundary !== "store") expect(changeVisibility).not.toHaveBeenCalled();
  },
);
