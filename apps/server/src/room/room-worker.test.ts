import { expect, it, vi } from "vitest";
import type { RoomScope } from "./contracts.js";
import type { RoomStore } from "./room-store.js";
import { RoomWorker } from "./room-worker.js";

it("continues healthy due rooms and committed publication after one room transaction fails", async () => {
  const started = vi.fn();
  const delivered = vi.fn();
  const marked = vi.fn();
  const worker = new RoomWorker(
    {
      expireDisconnected: async () => false,
      startDue: started,
    } as unknown as RoomStore,
    {
      dueRooms: async () => ["failed-room", "healthy-room"],
      withRoom: async (id, work) => {
        if (id === "failed-room") throw new Error("transaction rolled back");
        await work({} as RoomScope);
      },
      pendingEvents: async () => [
        {
          id: "committed-event",
          roomId: "healthy-room",
          version: 1,
          type: "room.members-changed",
          payload: {},
        },
      ],
      markDelivered: marked,
      markFailed: async () => {},
    },
    { deliver: delivered },
  );
  const failure = await worker.tick().catch((error) => error);
  expect(started).toHaveBeenCalledWith({}, "healthy-room");
  expect(delivered).toHaveBeenCalledOnce();
  expect(marked).toHaveBeenCalledWith("committed-event");
  expect(failure).toBeInstanceOf(AggregateError);
});

it("continues later outbox events when recording a successful delivery fails", async () => {
  const delivered = vi.fn();
  const marked = vi.fn(async (id: string) => {
    if (id === "retry-event") throw new Error("ack transaction rolled back");
  });
  const worker = new RoomWorker(
    {} as RoomStore,
    {
      dueRooms: async () => [],
      withRoom: async () => {},
      pendingEvents: async () =>
        ["retry-event", "later-event"].map((id) => ({
          id,
          roomId: "room",
          version: 1,
          type: "room.members-changed",
          payload: {},
        })),
      markDelivered: marked,
      markFailed: async () => {},
    },
    { deliver: delivered },
  );
  const failure = await worker.tick().catch((error) => error);
  expect(delivered).toHaveBeenCalledTimes(2);
  expect(marked).toHaveBeenCalledWith("later-event");
  expect(failure).toBeInstanceOf(AggregateError);
});
