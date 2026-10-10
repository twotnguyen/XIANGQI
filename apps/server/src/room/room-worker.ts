import type { RoomEvent, RoomEventSink, RoomScope } from "./contracts.js";
import type { RoomStore } from "./room-store.js";
export interface RoomWorkerPort {
  dueRooms(): Promise<string[]>;
  withRoom(
    roomId: string,
    work: (scope: RoomScope) => Promise<void>,
  ): Promise<void>;
  pendingEvents(): Promise<RoomEvent[]>;
  markDelivered(id: string): Promise<void>;
  markFailed(id: string): Promise<void>;
}
export class RoomWorker {
  constructor(
    private readonly rooms: RoomStore,
    private readonly port: RoomWorkerPort,
    private readonly sink: RoomEventSink,
  ) {}
  async tick() {
    const failures: unknown[] = [];
    for (const id of await this.port.dueRooms()) {
      try {
        await this.port.withRoom(id, async (scope) => {
          const closed = await this.rooms.expireDisconnected(scope, id);
          if (!closed) await this.rooms.startDue(scope, id);
        });
      } catch (error) {
        failures.push(error);
      }
    }
    for (const event of await this.port.pendingEvents()) {
      try {
        try {
          await this.sink.deliver(event);
        } catch {
          await this.port.markFailed(event.id);
          continue;
        }
        await this.port.markDelivered(event.id);
      } catch (error) {
        failures.push(error);
      }
    }
    if (failures.length)
      throw new AggregateError(failures, "Room batch transactions failed");
  }
}
