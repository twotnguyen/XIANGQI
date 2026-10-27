import type { PoolClient } from "pg";
import { expect, test, vi } from "vitest";
import { PublicRoomService } from "@server/game/room/public/public-room-service.js";
import {
  RoomError,
  type RoomEntry,
  type RoomScope,
} from "@server/game/room/room.types.js";
import type { MemberRoomRequestProof } from "@server/game/room/room-http.service.js";
import type {
  RoomActorProof,
  RoomAuthorization,
  RoomTransactions,
} from "@server/game/room/room-transactions.js";
import type { PublicRoomView } from "@server/game/room/public/public-room-store.js";
const actor = {
  userId: "11111111-1111-4111-8111-111111111111",
  kind: "member" as const,
};
const roomId = "22222222-2222-4222-8222-222222222222",
  commandId = "33333333-3333-4333-8333-333333333333";
const proof = () => ({
  accessToken: "synthetic-bearer",
  appSession: "a".repeat(43),
});
function fixture() {
  const client = {} as PoolClient; // Native seam only; this is not a SQL client test.
  const order: string[] = [];
  const scope: RoomScope = {
    client,
    actor,
    lockedActorIds: new Set([actor.userId]),
    lockedRoomIds: new Set([roomId]),
  };
  const resolve = vi.fn<
    (proof: MemberRoomRequestProof) => Promise<typeof actor>
  >(async () => {
    order.push("resolve");
    return actor;
  });
  const authorize = vi.fn<
    (
      proof: MemberRoomRequestProof,
      actorProof: RoomActorProof,
    ) => Promise<RoomAuthorization>
  >(async () => {
    order.push("authorize");
    return { status: "active", actor };
  });
  const catalog = vi.fn<(client: unknown) => Promise<PublicRoomView[]>>(
    async () => {
      order.push("catalog");
      return [];
    },
  );
  const join = vi.fn<
    (
      scope: RoomScope,
      roomId: string,
      input: { commandId: string; preference: "play" | "watch" },
    ) => Promise<RoomEntry>
  >(async () => {
    order.push("join");
    return {
      roomId,
      version: 4,
      role: "spectator" as const,
      inviteCode: "PRIVATE",
      notice: "Đã vào phòng",
    };
  });
  const inputs = vi.fn();
  const transactions: Pick<RoomTransactions, "withRoom"> = {
    async withRoom(input, auth, work) {
      order.push("transaction");
      inputs(input);
      const actorProof: RoomActorProof = {
        client,
        actor: input.actor,
        roomIds: input.roomIds,
        lockedActorIds: scope.lockedActorIds,
      };
      const first = await auth(actorProof);
      if (first.status === "ended") return first;
      order.push("room-locks");
      const second = await auth(actorProof);
      if (second.status === "ended") return second;
      return { status: "active", value: await work(scope) };
    },
  };
  const scoped = vi.fn();
  async function withScope<T>(
    value: RoomScope,
    work: () => Promise<T>,
  ): Promise<T> {
    scoped(value);
    order.push("scope");
    return work();
  }
  return {
    service: new PublicRoomService(
      { catalog, join },
      transactions,
      { resolve, authorize },
      withScope,
    ),
    resolve,
    authorize,
    catalog,
    join,
    scope,
    order,
    inputs,
    scoped,
  };
}
test("open owns unchanged private proof; resolveonce then same-client reauthorization on every read", async () => {
  const f = fixture(),
    incoming = proof();
  const source = await f.service.open(incoming);
  const privateProof = f.resolve.mock.calls[0]![0];
  expect(privateProof).not.toBe(incoming);
  expect(privateProof).toEqual(proof());
  incoming.accessToken = "changed";
  incoming.appSession = "changed";
  await source.read({});
  await source.read({});
  expect(f.resolve).toHaveBeenCalledTimes(1);
  expect(f.authorize).toHaveBeenCalledTimes(4);
  for (const [received, actorProof] of f.authorize.mock.calls) {
    expect(received).toBe(privateProof);
    expect(received).toEqual(proof());
    expect(actorProof.client).toBe(f.scope.client);
  }
  expect(f.catalog.mock.calls.map((c) => c[0])).toEqual([
    f.scope.client,
    f.scope.client,
  ]);
  expect(f.scoped).toHaveBeenCalledTimes(2);
  expect(f.inputs.mock.calls.map((c) => c[0])).toEqual([
    { actor, roomIds: [] },
    { actor, roomIds: [] },
  ]);
  expect(f.order.slice(0, 7)).toEqual([
    "resolve",
    "transaction",
    "authorize",
    "room-locks",
    "authorize",
    "scope",
    "catalog",
  ]);
});
test("HTTP list uses a resolved member and returns store authoritative array", async () => {
  const f = fixture();
  expect(await f.service.list(proof())).toEqual([]);
  expect(f.resolve).toHaveBeenCalledTimes(1);
  expect(f.authorize).toHaveBeenCalledTimes(2);
  expect(f.catalog).toHaveBeenCalledTimes(1);
});
test("join locks exact target, preserves scope/client and redacts invitation/extra fields", async () => {
  const f = fixture();
  expect(
    await f.service.join(proof(), roomId, { commandId, preference: "watch" }),
  ).toEqual({ roomId, version: 4, role: "spectator", notice: "Đã vào phòng" });
  expect(f.inputs).toHaveBeenCalledWith({ actor, roomIds: [roomId] });
  expect(f.join).toHaveBeenCalledWith(f.scope, roomId, {
    commandId,
    preference: "watch",
  });
  expect(f.resolve).toHaveBeenCalledTimes(1);
  expect(f.authorize).toHaveBeenCalledTimes(2);
  expect(f.scoped).toHaveBeenCalledWith(f.scope);
});
test.each([
  ["invalid room", "not-uuid", { commandId, preference: "play" }],
  ["invalid command", roomId, { commandId: "bad", preference: "play" }],
  ["auto intent", roomId, { commandId, preference: "auto" }],
  ["missing preference", roomId, { commandId }],
  [
    "authority injection",
    roomId,
    { commandId, preference: "play", userId: actor.userId },
  ],
])("join rejects %s before resolving auth", async (_label, id, input) => {
  const f = fixture();
  await expect(
    f.service.join(
      proof(),
      id,
      input as { commandId: string; preference: "play" },
    ),
  ).rejects.toMatchObject({ code: "ROOM_INPUT_INVALID", status: 400 });
  expect(f.resolve).not.toHaveBeenCalled();
  expect(f.inputs).not.toHaveBeenCalled();
});
test("guest identity cannot enter member-only public service", async () => {
  const f = fixture();
  f.resolve.mockResolvedValue({
    userId: actor.userId,
    kind: "guest",
  } as unknown as typeof actor);
  await expect(f.service.open(proof())).rejects.toMatchObject({
    code: "ROOM_MEMBER_REQUIRED",
    status: 403,
  });
  expect(f.inputs).not.toHaveBeenCalled();
});
test("ended transaction maps401 and never reads", async () => {
  const f = fixture();
  const source = await f.service.open(proof());
  f.authorize.mockResolvedValue({ status: "ended" });
  await expect(source.read({})).rejects.toMatchObject({
    code: "AUTH_REQUIRED",
    status: 401,
  });
  expect(f.catalog).not.toHaveBeenCalled();
  expect(f.scoped).not.toHaveBeenCalled();
});
test("expiry after room-lock wait blocks work, without second provider resolve", async () => {
  const f = fixture();
  const source = await f.service.open(proof());
  f.authorize
    .mockResolvedValueOnce({ status: "active", actor })
    .mockRejectedValueOnce(
      new RoomError("AUTH_REQUIRED", "Phiên đăng nhập không hợp lệ", 401),
    );
  await expect(source.read({})).rejects.toMatchObject({ status: 401 });
  expect(f.catalog).not.toHaveBeenCalled();
  expect(f.resolve).toHaveBeenCalledTimes(1);
});
test("SQL auth outage propagates sanitized503; subsequent read can recover", async () => {
  const f = fixture();
  const source = await f.service.open(proof());
  const error = new RoomError(
    "AUTH_UNAVAILABLE",
    "Chưa thể xác thực phiên đăng nhập",
    503,
  );
  f.authorize.mockRejectedValueOnce(error);
  await expect(source.read({})).rejects.toBe(error);
  expect(f.catalog).not.toHaveBeenCalled();
  await expect(source.read({})).resolves.toEqual([]);
  expect(f.resolve).toHaveBeenCalledTimes(1);
});
test("canonical UUIDs are forwarded to coordinator and store, not opaque authority fields", async () => {
  const f = fixture(),
    id = "AAAAAAAA-AAAA-4AAA-8AAA-AAAAAAAAAAAA",
    command = "BBBBBBBB-BBBB-4BBB-8BBB-BBBBBBBBBBBB";
  await f.service.join(proof(), id, { commandId: command, preference: "play" });
  expect(f.inputs).toHaveBeenCalledWith({ actor, roomIds: [id.toLowerCase()] });
  expect(f.join).toHaveBeenCalledWith(f.scope, id.toLowerCase(), {
    commandId: command.toLowerCase(),
    preference: "play",
  });
});
test("resolve failure does not enter transaction or expose credentials", async () => {
  const f = fixture();
  f.resolve.mockRejectedValue(
    new RoomError("AUTH_REQUIRED", "Phiên đăng nhập không hợp lệ", 401),
  );
  await expect(f.service.list(proof())).rejects.toMatchObject({
    code: "AUTH_REQUIRED",
    status: 401,
  });
  expect(f.inputs).not.toHaveBeenCalled();
  expect(f.catalog).not.toHaveBeenCalled();
});
test("readers sharing one tick share one catalog query while each still authorizes its own transaction", async () => {
  const f = fixture();
  const a = await f.service.open(proof());
  const b = await f.service.open(proof());
  const tick = {};
  await expect(Promise.all([a.read(tick), b.read(tick)])).resolves.toEqual([
    [],
    [],
  ]);
  expect(f.catalog).toHaveBeenCalledTimes(1);
  expect(f.authorize).toHaveBeenCalledTimes(4);
});
test("a revoked reader in a shared tick gets auth failure and never receives catalog rows", async () => {
  const f = fixture();
  f.authorize.mockImplementation(async (p) =>
    p.appSession === "revoked"
      ? { status: "ended" }
      : { status: "active", actor },
  );
  const live = await f.service.open({
    accessToken: "live",
    appSession: "live",
  });
  const revoked = await f.service.open({
    accessToken: "revoked",
    appSession: "revoked",
  });
  const tick = {};
  const results = await Promise.allSettled([
    revoked.read(tick),
    live.read(tick),
  ]);
  expect(results[0]).toMatchObject({
    status: "rejected",
    reason: { code: "AUTH_REQUIRED", status: 401 },
  });
  expect(results[1]).toEqual({ status: "fulfilled", value: [] });
  expect(f.catalog).toHaveBeenCalledTimes(1);
});
test("a catalog failure is shared only by its tick, is not an auth error, and the next tick reloads", async () => {
  const f = fixture();
  const failure = Object.assign(Error("private-database"), { status: 503 });
  f.catalog.mockRejectedValueOnce(failure);
  const a = await f.service.open(proof());
  const b = await f.service.open(proof());
  const tick = {};
  const results = await Promise.allSettled([a.read(tick), b.read(tick)]);
  expect(results.map((r) => r.status)).toEqual(["rejected", "rejected"]);
  expect(f.catalog).toHaveBeenCalledTimes(1);
  await expect(b.read({})).resolves.toEqual([]);
  expect(f.catalog).toHaveBeenCalledTimes(2);
});
