import { record, uuid } from "../../match/position-codec.js";
import {
  RoomError,
  type RoomActor,
  type RoomEntry,
  type RoomScope,
} from "../room.types.js";
import {
  roomProofKind,
  type RoomRequestProof,
  type RoomSessionAuthorizer,
} from "../room-session.js";
import type { PublicRoomStore, PublicRoomView } from "./public-room-store.js";
import {
  PublicRoomCatalog,
  type PublicRoomTick,
} from "./public-room-catalog.js";
import type { RoomTransactions } from "../room-transactions.js";
export type PublicRoomJoinInput = {
  commandId: string;
  preference: "play" | "watch";
};
export type PublicRoomEntry = Omit<RoomEntry, "inviteCode">;
/**
 * Nguồn đọc phòng công khai đã xác thực phiên người đọc. Mỗi lần đọc kiểm lại quyền trong
 * giao dịch riêng; các lần đọc cùng `tick` dùng chung một truy vấn catalog.
 */
export type PublicRoomReader = {
  read(tick: PublicRoomTick): Promise<PublicRoomView[]>;
};
/**
 * Dịch vụ xử lý nghiệp vụ tìm kiếm và tham gia phòng chơi cờ công khai (sảnh chờ):
 * Cung cấp danh sách phòng công khai theo thời gian thực và điều phối tham gia phòng từ sảnh.
 */
export class PublicRoomService {
  private readonly catalog: PublicRoomCatalog;
  constructor(
    private readonly store: Pick<PublicRoomStore, "catalog" | "join">,
    private readonly transactions: Pick<RoomTransactions, "withRoom">,
    private readonly authorizer: Pick<
      RoomSessionAuthorizer,
      "resolve" | "authorize" | "settleEnded"
    >,
    private readonly withScope: <T>(
      scope: RoomScope,
      work: () => Promise<T>,
    ) => Promise<T>,
  ) {
    this.catalog = new PublicRoomCatalog((client) =>
      this.store.catalog(client),
    );
  }
  private async resolved(proof: RoomRequestProof) {
    // roomProofKind rejects anything but the exact member or guest key sets.
    roomProofKind(proof);
    // WeakMap-bound authorizers must see this same private, unchanged object on every read.
    const privateProof: RoomRequestProof =
      "accessToken" in proof
        ? Object.freeze({
            accessToken: proof.accessToken,
            appSession: proof.appSession,
          })
        : Object.freeze({ guestCapability: proof.guestCapability });
    const actor = await this.authorizer.resolve(privateProof);
    return { proof: privateProof, actor };
  }
  private async run<T>(
    proof: RoomRequestProof,
    actor: RoomActor,
    roomIds: string[],
    purpose: "read" | "existing-room",
    work: (scope: RoomScope) => Promise<T>,
  ) {
    const result = await this.transactions.withRoom(
      { actor, roomIds },
      (actorProof) =>
        this.authorizer.authorize(proof, actorProof, purpose, roomIds[0]),
      (scope) => this.withScope(scope, () => work(scope)),
    );
    if (result.status === "ended") {
      await this.authorizer.settleEnded(proof);
      throw new RoomError("AUTH_REQUIRED", "Phiên đăng nhập không hợp lệ", 401);
    }
    return result.value;
  }
  /**
   * Mở phiên kết nối nguồn đọc danh sách phòng công khai (dùng cho feed Socket.IO).
   * Mỗi lần `read` vẫn mở giao dịch và kiểm quyền người đọc; chỉ truy vấn catalog được chia sẻ theo `tick`.
   */
  async open(proof: RoomRequestProof): Promise<PublicRoomReader> {
    const trusted = await this.resolved(proof);
    return {
      read: (tick: PublicRoomTick) =>
        this.run(trusted.proof, trusted.actor, [], "read", (scope) =>
          this.catalog.read(tick, scope.client),
        ),
    };
  }
  /**
   * Lấy danh sách các phòng cờ công khai hiện có thông qua truy vấn HTTP.
   */
  async list(proof: RoomRequestProof) {
    return (await this.open(proof)).read({});
  }
  /**
   * Tham gia vào một phòng cờ công khai được chọn từ danh sách sảnh.
   */
  async join(
    proof: RoomRequestProof,
    roomId: string,
    input: PublicRoomJoinInput,
  ): Promise<PublicRoomEntry> {
    if (
      typeof roomId !== "string" ||
      !uuid.test(roomId) ||
      !record(input) ||
      Object.keys(input).length !== 2 ||
      typeof input.commandId !== "string" ||
      !uuid.test(input.commandId) ||
      !["play", "watch"].includes(input.preference)
    )
      throw new RoomError(
        "ROOM_INPUT_INVALID",
        "Thông tin phòng không hợp lệ",
        400,
      );
    const id = roomId.toLowerCase(),
      command = {
        commandId: input.commandId.toLowerCase(),
        preference: input.preference,
      };
    const trusted = await this.resolved(proof);
    return this.run(
      trusted.proof,
      trusted.actor,
      [id],
      "existing-room",
      async (scope) => {
        const entry = await this.store.join(scope, id, command);
        return {
          roomId: entry.roomId,
          version: entry.version,
          role: entry.role,
          ...(entry.notice === undefined ? {} : { notice: entry.notice }),
        };
      },
    );
  }
}
