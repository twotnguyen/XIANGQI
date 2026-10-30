import type { RoomEvent, RoomEventSink, RoomScope } from "./room.types.js";
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
/**
 * Worker chạy nền quản lý các tiến trình theo chu kỳ thời gian của phòng cờ:
 * Xử lý phòng đến hạn, ngắt kết nối quá hạn, đếm ngược bắt đầu ván và gửi sự kiện outbox.
 */
export class RoomWorker {
  constructor(
    private readonly rooms: RoomStore,
    private readonly port: RoomWorkerPort,
    private readonly sink: RoomEventSink,
  ) {}

  /**
   * Thực hiện một chu kỳ quét: xử lý hết hạn người chơi, đếm ngược ván đấu và chuyển tiếp sự kiện outbox.
   */
  async tick() {
    const failures: unknown[] = [];
    for (const id of await this.port.dueRooms()) {
      try {
        await this.port.withRoom(id, async (scope) => {
          const closed = await this.rooms.expireDisconnected(scope, id);
          await this.rooms.expireSwapOffers(scope, id);
          await this.rooms.expireRematchOffers(scope, id);
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
