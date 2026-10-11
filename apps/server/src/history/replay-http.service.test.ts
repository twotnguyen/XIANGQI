import { describe, expect, it, vi } from "vitest";
import { RoomError, type RoomScope } from "../room/contracts.js";
import type {
  MemberRoomAuthorizer,
  MemberRoomRequestProof,
} from "../room/room-http.service.js";
import type { RoomTransactions } from "../room/room-transactions.js";
import type { ReplayRecord } from "./replay-store.js";
import { ReplayHttpService, replayHttpError } from "./replay-http.service.js";
const id = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  owner = "22222222-2222-4222-8222-222222222222";
const proof = () => ({
  accessToken: "synthetic-bearer",
  appSession: "a".repeat(43),
});
function fixture(
  options: {
    kind?: "member" | "guest";
    ended?: boolean;
    failure?: Error;
    authFailure?: Error;
    postEnded?: boolean;
    postFailure?: Error;
  } = {},
) {
  let locked = false,
    privateProof: MemberRoomRequestProof | undefined;
  const events: string[] = [];
  const actor = { userId: owner, kind: options.kind ?? "member" };
  const scope = {
    client: { synthetic: true },
    actor,
    lockedActorIds: new Set([owner]),
    lockedRoomIds: new Set(),
  } as unknown as RoomScope;
  const result: ReplayRecord = {
    id,
    mode: "CASUAL",
    side: "red",
    positions: [
      {
        fen: "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1",
        turn: "red",
      },
    ],
    moves: [],
  };
  const authorizer: MemberRoomAuthorizer = {
    async resolve(p) {
      events.push("resolve");
      expect(locked).toBe(false);
      expect(Object.isFrozen(p)).toBe(true);
      privateProof = p;
      if (options.authFailure) throw options.authFailure;
      return actor;
    },
    async authorize(p, actorProof) {
      events.push("authorize");
      expect(locked).toBe(true);
      expect(p).toBe(privateProof);
      expect(p.accessToken).toBe("synthetic-bearer");
      expect(actorProof.client).toBe(scope.client);
      if (events.includes("read") && options.postFailure)
        throw options.postFailure;
      if (options.ended || (events.includes("read") && options.postEnded))
        return { status: "ended" };
      return { status: "active", actor };
    },
  };
  const transactions: Pick<RoomTransactions, "withRoom"> = {
    async withRoom(input, authorize, work) {
      expect(input).toEqual({ actor, roomIds: [] });
      locked = true;
      try {
        const first = await authorize({ ...scope, roomIds: [] });
        if (first.status === "ended") return { status: "ended" };
        const second = await authorize({ ...scope, roomIds: [] });
        if (second.status === "ended") return { status: "ended" };
        const value = await work(scope);
        return { status: "active", value };
      } finally {
        locked = false;
      }
    },
  };
  const store = {
    read: vi.fn(async (s: RoomScope, gameId: string) => {
      events.push("read");
      expect(locked).toBe(true);
      expect(s).toBe(scope);
      expect(gameId).toBe(id);
      if (options.failure) throw options.failure;
      return result;
    }),
  };
  return {
    service: new ReplayHttpService(store, transactions, authorizer),
    store,
    events,
    result,
  };
}
describe("Replay HTTP authenticated read port (native seams, no SQL)", () => {
  it("rechecks every read without cached proof or snapshot", async () => {
    const f = fixture();
    await f.service.read(proof(), id);
    await f.service.read(proof(), id);
    expect(f.events.filter((e) => e === "resolve")).toHaveLength(2);
    expect(f.events.filter((e) => e === "authorize")).toHaveLength(6);
    expect(f.store.read).toHaveBeenCalledTimes(2);
  });
  it("resolves frozen proof before locks and reads exact same-client scope without tab/socket proof", async () => {
    const f = fixture(),
      input = proof(),
      pending = f.service.read(input, id);
    input.accessToken = "caller-mutated";
    expect(await pending).toEqual(f.result);
    expect(f.events).toEqual([
      "resolve",
      "authorize",
      "authorize",
      "read",
      "authorize",
    ]);
    expect(f.store.read).toHaveBeenCalledTimes(1);
  });
  it.each([
    { postEnded: true },
    { postFailure: new RoomError("AUTH_REQUIRED", "revoked cap private", 401) },
  ])(
    "denies private response when deadline/revocation changes during SQL read",
    async (options) => {
      const f = fixture(options);
      await expect(f.service.read(proof(), id)).rejects.toMatchObject({
        code: "AUTH_REQUIRED",
        status: 401,
      });
      expect(f.events).toEqual([
        "resolve",
        "authorize",
        "authorize",
        "read",
        "authorize",
      ]);
    },
  );
  it("returns auth401 if coordinator reports ended instead of successful empty replay", async () => {
    const f = fixture({ ended: true });
    await expect(f.service.read(proof(), id)).rejects.toMatchObject({
      code: "AUTH_REQUIRED",
      status: 401,
    });
    expect(f.store.read).not.toHaveBeenCalled();
  });
  it("denies Guest before transaction", async () => {
    const f = fixture({ kind: "guest" });
    await expect(f.service.read(proof(), id)).rejects.toMatchObject({
      code: "REPLAY_FORBIDDEN",
      status: 403,
    });
    expect(f.events).toEqual(["resolve"]);
  });
  it("validates UUID before resolve and lowercases public ID", async () => {
    const f = fixture();
    await expect(f.service.read(proof(), "bad")).rejects.toMatchObject({
      code: "REPLAY_INPUT_INVALID",
      status: 400,
    });
    expect(f.events).toEqual([]);
    await f.service.read(proof(), id.toUpperCase());
    expect(f.store.read).toHaveBeenCalledTimes(1);
  });
  it.each([
    null,
    {},
    { accessToken: "", appSession: "a".repeat(43) },
    { accessToken: "has whitespace", appSession: "a".repeat(43) },
    { accessToken: "bearer", appSession: "bad" },
  ])(
    "denies missing or malformed dual proof before provider",
    async (input) => {
      const f = fixture();
      await expect(f.service.read(input as never, id)).rejects.toMatchObject({
        code: "AUTH_REQUIRED",
        status: 401,
      });
      expect(f.events).toEqual([]);
    },
  );
  it.each([
    ["REPLAY_NOT_FOUND", 404],
    ["REPLAY_FORBIDDEN", 403],
    ["REPLAY_CORRUPT", 409],
    ["AUTH_REQUIRED", 401],
    ["AUTH_UNAVAILABLE", 503],
    ["ROOM_ROSTER_UNSTABLE", 409],
  ] as const)(
    "preserves only known %s/status and replaces private messages",
    async (code, status) => {
      const f = fixture({
        failure: new RoomError(code, "secret private email", status),
      });
      const error = await f.service.read(proof(), id).catch((e: unknown) => e);
      expect(error).toMatchObject({ code, status });
      expect(String(error)).not.toContain("secret");
      expect(f.store.read).toHaveBeenCalledTimes(1);
    },
  );
  it.each([
    Error("private SQL cap"),
    new RoomError("private-capability", "secret", 401),
    new RoomError("REPLAY_NOT_FOUND", "secret", 500),
  ])("sanitizes unknown/provider failures without retry", async (failure) => {
    const f = fixture({ failure });
    await expect(f.service.read(proof(), id)).rejects.toMatchObject({
      code: "REPLAY_UNAVAILABLE",
      status: 503,
    });
    expect(f.store.read).toHaveBeenCalledTimes(1);
  });
  it("sanitizes provider outage before transaction and error prototype names", async () => {
    const f = fixture({ authFailure: Error("provider secret") });
    await expect(f.service.read(proof(), id)).rejects.toMatchObject({
      code: "REPLAY_UNAVAILABLE",
      status: 503,
    });
    expect(f.events).toEqual(["resolve"]);
    expect(
      replayHttpError(new RoomError("__proto__", "secret", 403)),
    ).toMatchObject({ code: "REPLAY_UNAVAILABLE", status: 503 });
  });
});
