import { record, uuid } from "../../match/position-codec.js";
import {
  RoomError,
  type RoomActor,
  type RoomEntry,
  type RoomScope,
} from "../room.types.js";
import type {
  MemberRoomAuthorizer,
  MemberRoomRequestProof,
} from "../room-http.service.js";
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
    private readonly authorizer: MemberRoomAuthorizer,
    private readonly withScope: <T>(
      scope: RoomScope,
      work: () => Promise<T>,
    ) => Promise<T>,
  ) {
    this.catalog = new PublicRoomCatalog((client) =>
      this.store.catalog(client),
    );
  }
  private async resolved(proof: MemberRoomRequestProof) {
    if (
      !proof ||
      typeof proof.accessToken !== "string" ||
      typeof proof.appSession !== "string"
    )
      throw new RoomError("AUTH_REQUIRED", "Phiên đăng nhập không hợp lệ", 401);
    // WeakMap-bound authorizers must see this same private, unchanged object on every read.
    const privateProof = Object.freeze({
      accessToken: proof.accessToken,
      appSession: proof.appSession,
    });
    const actor = await this.authorizer.resolve(privateProof);
    if (actor.kind !== "member")
      throw new RoomError(
        "ROOM_MEMBER_REQUIRED",
        "Phiên thành viên là bắt buộc",
        403,
      );
    return { proof: privateProof, actor };
  }
  private async run<T>(
    proof: MemberRoomRequestProof,
    actor: RoomActor,
    roomIds: string[],
    work: (scope: RoomScope) => Promise<T>,
  ) {
    const result = await this.transactions.withRoom(
      { actor, roomIds },
      (actorProof) => this.authorizer.authorize(proof, actorProof),
      (scope) => this.withScope(scope, () => work(scope)),
    );
    if (result.status === "ended")
      throw new RoomError("AUTH_REQUIRED", "Phiên đăng nhập không hợp lệ", 401);
    return result.value;
  }
  /**
   * Mở phiên kết nối nguồn đọc danh sách phòng công khai (dùng cho feed Socket.IO).
   * Mỗi lần `read` vẫn mở giao dịch và kiểm quyền người đọc; chỉ truy vấn catalog được chia sẻ theo `tick`.
   */
  async open(proof: MemberRoomRequestProof): Promise<PublicRoomReader> {
    const trusted = await this.resolved(proof);
    return {
      read: (tick: PublicRoomTick) =>
        this.run(trusted.proof, trusted.actor, [], (scope) =>
          this.catalog.read(tick, scope.client),
        ),
    };
  }
  /**
   * Lấy danh sách các phòng cờ công khai hiện có thông qua truy vấn HTTP.
   */
  async list(proof: MemberRoomRequestProof) {
    return (await this.open(proof)).read({});
  }
  /**
   * Tham gia vào một phòng cờ công khai được chọn từ danh sách sảnh.
   */
  async join(
    proof: MemberRoomRequestProof,
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
    return this.run(trusted.proof, trusted.actor, [id], async (scope) => {
      const entry = await this.store.join(scope, id, command);
      return {
        roomId: entry.roomId,
        version: entry.version,
        role: entry.role,
        ...(entry.notice === undefined ? {} : { notice: entry.notice }),
      };
    });
  }
}
