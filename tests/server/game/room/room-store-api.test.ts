import { describe, expect, it } from "vitest";
import { RoomStore } from "@server/game/room/room-store.js";
import { RoomStoreCore } from "@server/game/room/room-store-core.js";
import { RoomSwapStore } from "@server/game/room/room-store-swap.js";
import { RoomViewerStore } from "@server/game/room/room-store-viewers.js";
import { MatchStore } from "@server/game/match/match-store.js";
import { MatchStoreCore } from "@server/game/match/match-store-core.js";
import { MatchDrawStore } from "@server/game/match/match-store-draw.js";

// Public surface that callers (runtime, workers, HTTP service) rely on.
const roomApi = [
  "resolveCode",
  "dueRooms",
  "pendingEvents",
  "markDelivered",
  "markFailed",
  "create",
  "authorize",
  "snapshot",
  "changeVisibility",
  "join",
  "switchSeat",
  "toSpectator",
  "moveToSpectator",
  "inviteDown",
  "respondDown",
  "kickViewer",
  "proposeSwap",
  "withdrawSwap",
  "respondSwap",
  "expireSwapOffers",
  "ready",
  "presence",
  "startDue",
  "onMatchEnded",
  "leave",
  "expireDisconnected",
  "recoverWaiting",
] as const;

const matchApi = [
  "start",
  "snapshot",
  "move",
  "drawSnapshot",
  "offerDraw",
  "withdrawDraw",
  "respondDraw",
  "expireDrawOffers",
  "resign",
  "finish",
] as const;

describe("store split keeps the public API", () => {
  it.each(roomApi)("RoomStore.%s is a method", (name) => {
    expect(typeof new RoomStore()[name]).toBe("function");
  });

  it.each(matchApi)("MatchStore.%s is a method", (name) => {
    const store = new MatchStore(undefined, { end: async () => {} } as never);
    expect(typeof store[name]).toBe("function");
  });

  it("layers RoomStore over core, swap and viewer classes", () => {
    const store = new RoomStore();
    expect(store).toBeInstanceOf(RoomViewerStore);
    expect(store).toBeInstanceOf(RoomSwapStore);
    expect(store).toBeInstanceOf(RoomStoreCore);
  });

  it("layers MatchStore over core and draw classes", () => {
    const store = new MatchStore(undefined, { end: async () => {} } as never);
    expect(store).toBeInstanceOf(MatchDrawStore);
    expect(store).toBeInstanceOf(MatchStoreCore);
  });

  it("defines each command in exactly one layer", () => {
    const own = (c: { prototype: object }) =>
      Object.getOwnPropertyNames(c.prototype).filter(
        (n) => n !== "constructor",
      );
    const layers = [RoomStoreCore, RoomSwapStore, RoomViewerStore, RoomStore];
    const seen = new Map<string, number>();
    for (const layer of layers)
      for (const name of own(layer)) seen.set(name, (seen.get(name) ?? 0) + 1);
    expect([...seen].filter(([, count]) => count > 1)).toEqual([]);
    const matchLayers = [MatchStoreCore, MatchDrawStore, MatchStore];
    const matchSeen = new Map<string, number>();
    for (const layer of matchLayers)
      for (const name of own(layer))
        matchSeen.set(name, (matchSeen.get(name) ?? 0) + 1);
    expect([...matchSeen].filter(([, count]) => count > 1)).toEqual([]);
  });
});
