import { describe, expect, it } from "vitest";
import type { RoomScope } from "../room/contracts.js";
import { RoomError } from "../room/contracts.js";
import type { MemberRoomAuthorizer } from "../room/room-http.service.js";
import type { RoomTransactions } from "../room/room-transactions.js";
import { HistoryHttpService } from "./history-http.service.js";
const owner = "11111111-1111-4111-8111-111111111111";
const proof = () => ({
  accessToken: "synthetic-bearer",
  appSession: "c".repeat(43),
});
function fixture(
  options: { ended?: boolean; failure?: Error; kind?: "member" | "guest" } = {},
) {
  let currentProof: ReturnType<typeof proof> | undefined;
  let underLocks = false;
  const sequence: string[] = [];
  const actor = { userId: owner, kind: options.kind ?? "member" };
  const authorizer: MemberRoomAuthorizer = {
    async resolve(privateProof) {
      sequence.push("resolve");
      expect(underLocks).toBe(false);
      expect(Object.isFrozen(privateProof)).toBe(true);
      currentProof = privateProof;
      return actor;
    },
    async authorize(privateProof, actorProof) {
      sequence.push("authorize");
      expect(privateProof).toBe(currentProof);
      expect(privateProof.accessToken).toBe("synthetic-bearer");
      expect(actorProof.actor).toEqual(actor);
      return options.ended ? { status: "ended" } : { status: "active", actor };
    },
  };
  const transactions: Pick<RoomTransactions, "withRoom"> = {
    async withRoom(input, authorize, work) {
      expect(input.roomIds).toEqual([]);
      underLocks = true;
      const scope = {
        actor,
        lockedActorIds: new Set([owner]),
        lockedRoomIds: new Set(),
      } as RoomScope;
      try {
        const auth = await authorize({ ...scope, roomIds: [] });
        if (auth.status === "ended") return { status: "ended" };
        const value = await work(scope);
        return { status: "active", value };
      } finally {
        underLocks = false;
      }
    },
  };
  const store = {
    async list(scope: RoomScope) {
      sequence.push("read");
      expect(underLocks).toBe(true);
      expect(scope.actor.userId).toBe(owner);
      if (options.failure) throw options.failure;
      return { items: [], nextCursor: null };
    },
    async rankedSummary(): Promise<never> {
      throw new RoomError(
        "HISTORY_RANKED_UNAVAILABLE",
        "private SQL metadata",
        503,
      );
    },
  };
  return {
    service: new HistoryHttpService(store, transactions, authorizer),
    sequence,
  };
}
describe("member history HTTP transaction service", () => {
  it("resolves fresh frozen request proof outside SQL and passes that exact object to guarded reads", async () => {
    const { service, sequence } = fixture(),
      original = proof();
    const pending = service.list(original);
    original.accessToken = "caller-mutated";
    expect(await pending).toEqual({ items: [], nextCursor: null });
    expect(sequence).toEqual(["resolve", "authorize", "read"]);
  });
  it("denies ended authorization rather than returning a successful empty history", async () => {
    await expect(
      fixture({ ended: true }).service.list(proof()),
    ).rejects.toMatchObject({ code: "AUTH_REQUIRED", status: 401 });
  });
  it("rejects Guest actors before entering a history transaction", async () => {
    await expect(
      fixture({ kind: "guest" }).service.list(proof()),
    ).rejects.toMatchObject({ code: "HISTORY_FORBIDDEN", status: 403 });
  });
  it("sanitizes unknown provider/store failures and typed error metadata", async () => {
    for (const error of [
      new Error("secret cap and SQL"),
      new RoomError("unknown", "secret cap and SQL", 400),
    ]) {
      const rejection = await fixture({ failure: error })
        .service.list(proof())
        .catch((e: unknown) => e);
      expect(rejection).toMatchObject({
        code: "HISTORY_UNAVAILABLE",
        status: 503,
      });
      expect(String(rejection)).not.toContain("secret");
    }
    const rejected = await fixture()
      .service.rankedSummary(proof())
      .catch((e: unknown) => e);
    expect(rejected).toMatchObject({
      code: "HISTORY_RANKED_UNAVAILABLE",
      status: 503,
    });
    expect(String(rejected)).not.toContain("private SQL");
  });
});
