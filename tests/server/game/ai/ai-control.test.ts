import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { Server, type Socket } from "socket.io";
import { io, type Socket as ClientSocket } from "socket.io-client";
import { afterAll, beforeAll, beforeEach, expect, it, vi } from "vitest";
import { RoomError, type RoomScope } from "@server/game/room/room.types.js";
import { AiControl } from "@server/game/ai/ai-control.js";
import type { AiOrigin } from "@server/game/ai/ai-transactions.js";
import type { MemberRoomRequestProof } from "@server/game/room/room-http.service.js";
type MemberOrigin = Omit<Extract<AiOrigin, { kind: "human" }>, "proof"> & {
  proof: MemberRoomRequestProof;
};
const owner = randomUUID(),
  tabId = randomUUID(),
  cap = "a".repeat(43),
  gameId = randomUUID();
const scope = {
  actor: { userId: owner, kind: "member" },
  lockedActorIds: new Set([owner]),
  lockedRoomIds: new Set(),
} as unknown as RoomScope;
const authorize = vi.fn(async () => {}),
  bindGame = vi.fn(async () => {}),
  assertRetained = vi.fn(async () => {});
const control = new AiControl({ authorize, bindGame, assertRetained });
const http = createServer(),
  server = new Server(http, { transports: ["websocket"] });
let base: string, client: ClientSocket, socket: Socket, origin: MemberOrigin;
// Native Socket is real; provider/SQL ownership is a controlled boundary in these transport tests.
beforeAll(async () => {
  await new Promise<void>((resolve) => http.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${(http.address() as { port: number }).port}`;
});
beforeEach(async () => {
  client?.disconnect();
  socket?.disconnect(true);
  vi.clearAllMocks();
  authorize.mockResolvedValue();
  bindGame.mockResolvedValue();
  const admitted = new Promise<Socket>((resolve) =>
    server.once("connection", resolve),
  );
  client = io(base, {
    transports: ["websocket"],
    forceNew: true,
    reconnection: false,
  });
  socket = await admitted;
  origin = {
    kind: "human",
    proof: { accessToken: "synthetic-token", appSession: cap },
    tab: { tabId, connectionId: socket.id, generation: 2 },
  };
  control.bind(socket, owner, origin.proof, tabId, 2);
});
afterAll(async () => {
  client?.disconnect();
  socket?.disconnect(true);
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
});
it("accepts only a bound connected physical Socket and matching SQL controller", async () => {
  expect(await control.inspect(scope, origin)).toEqual({
    mode: "controller",
    reason: null,
    generation: 2,
  });
  await control.authorize(scope, origin);
  expect(authorize).toHaveBeenCalledWith(scope, origin);
});
it.each([
  "connection",
  "tab",
  "generation",
  "session",
  "owner",
  "guest",
  "lock",
])("denies forged %s before SQL authorization", async (field) => {
  const supplied = structuredClone(origin);
  let actorScope = scope;
  if (field === "connection") supplied.tab.connectionId = "forged-socket";
  if (field === "tab") supplied.tab.tabId = randomUUID();
  if (field === "generation") supplied.tab.generation++;
  if (field === "session") supplied.proof.appSession = "b".repeat(43);
  if (field === "owner")
    actorScope = { ...scope, actor: { userId: randomUUID(), kind: "member" } };
  if (field === "guest")
    actorScope = { ...scope, actor: { userId: owner, kind: "guest" } };
  if (field === "lock") actorScope = { ...scope, lockedActorIds: new Set() };
  await expect(control.inspect(actorScope, supplied)).rejects.toMatchObject({
    code: "AI_AUTHORITY_REQUIRED",
    status: 403,
  });
  expect(authorize).not.toHaveBeenCalled();
});
it("allows a superseded connected tab to read while keeping mutations denied", async () => {
  authorize.mockRejectedValue(new RoomError("TAB_READ_ONLY", "synthetic"));
  expect(await control.inspect(scope, origin)).toEqual({
    mode: "readonly",
    reason: "other_tab",
    generation: 2,
  });
  await expect(control.authorize(scope, origin)).rejects.toMatchObject({
    code: "TAB_READ_ONLY",
  });
});
it("denies commands immediately when the actual physical Socket disconnects", async () => {
  socket.disconnect(true);
  await expect(control.authorize(scope, origin)).rejects.toMatchObject({
    code: "AI_AUTHORITY_REQUIRED",
  });
  expect(authorize).not.toHaveBeenCalled();
});
it("rechecks a disconnect that occurs during SQL authority validation", async () => {
  authorize.mockImplementationOnce(async () => {
    socket.disconnect(true);
  });
  await expect(control.authorize(scope, origin)).rejects.toMatchObject({
    code: "AI_AUTHORITY_REQUIRED",
  });
});
it("rejects late proof when the same physical Socket binding is refreshed during SQL read", async () => {
  authorize.mockImplementationOnce(async () => {
    control.bind(
      socket,
      owner,
      { accessToken: "synthetic-token", appSession: "b".repeat(43) },
      tabId,
      3,
    );
  });
  await expect(control.inspect(scope, origin)).rejects.toMatchObject({
    code: "AI_AUTHORITY_REQUIRED",
  });
});
it("unbind invalidates a live connection independently of its Socket status", async () => {
  control.unbind(socket);
  expect(socket.connected).toBe(true);
  await expect(control.inspect(scope, origin)).rejects.toMatchObject({
    code: "AI_AUTHORITY_REQUIRED",
  });
});
it("binds a game only while the exact physical authority remains live", async () => {
  await control.bindGame(scope, gameId, origin);
  expect(bindGame).toHaveBeenCalledWith(scope, gameId, origin);
  bindGame.mockImplementationOnce(async () => {
    control.unbind(socket);
  });
  await expect(control.bindGame(scope, gameId, origin)).rejects.toMatchObject({
    code: "AI_AUTHORITY_REQUIRED",
  });
});
it("keeps server-only retention checks independent of a human's physical connection", async () => {
  control.unbind(socket);
  await control.assertRetained(scope, gameId);
  expect(assertRetained).toHaveBeenCalledWith(scope, gameId);
});

it("does not downgrade a failed SQL authority check into read-only access", async () => {
  authorize.mockRejectedValueOnce(
    new RoomError("TAB_READ_ONLY", "synthetic backend failure", 503),
  );
  await expect(control.inspect(scope, origin)).rejects.toMatchObject({
    code: "TAB_READ_ONLY",
    status: 503,
  });
});
