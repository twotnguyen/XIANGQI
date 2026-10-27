import type { GuestPurpose } from "../../account/guest/guest.types.js";
import type {
  MemberRoomAuthorizer,
  MemberRoomRequestProof,
} from "./room-http.service.js";
import {
  GuestRoomAuthorizer,
  type GuestRoomMutationScope,
  type GuestRoomRequestProof,
} from "./guest-room-auth.js";
import { RoomError, type RoomActor } from "./room.types.js";
import type { RoomAuthorization, RoomActorProof } from "./room-transactions.js";

/**
 * Proof duy nhất của một yêu cầu phòng: thành viên tài khoản HOẶC khách, không bao giờ trộn lẫn.
 */
export type RoomRequestProof = MemberRoomRequestProof | GuestRoomRequestProof;

const required = () =>
  new RoomError("AUTH_REQUIRED", "Phiên đăng nhập không hợp lệ", 401);

/**
 * Phân loại proof theo đúng tập khóa. Khóa thừa hoặc thiếu đều bị từ chối,
 * nên một yêu cầu không thể mang cả accessToken lẫn guestCapability.
 */
export function roomProofKind(proof: unknown): "member" | "guest" {
  if (!proof || typeof proof !== "object") throw required();
  const keys = Object.keys(proof).sort().join(",");
  if (keys === "accessToken,appSession") return "member";
  if (keys === "guestCapability") return "guest";
  throw required();
}

/**
 * Bộ xác thực tổng hợp cho phòng: định tuyến proof member/guest tới bộ xác thực tương ứng.
 * - resolve: xác định actor (chỉ đọc, chưa khóa).
 * - authorize: kiểm tra trong transaction đã khóa roster, với purpose và contextId.
 * - finish: hoàn tất sau mutation (dọn phiên khách nếu cần).
 */
export class RoomSessionAuthorizer {
  constructor(
    private readonly member: MemberRoomAuthorizer,
    private readonly guest: GuestRoomAuthorizer,
  ) {}

  resolve(proof: RoomRequestProof): Promise<RoomActor> {
    return roomProofKind(proof) === "guest"
      ? this.guest.resolve(proof as GuestRoomRequestProof)
      : this.member.resolve(proof as MemberRoomRequestProof);
  }

  authorize(
    proof: RoomRequestProof,
    actorProof: RoomActorProof,
    purpose: GuestPurpose = "read",
    contextId?: string,
  ): Promise<RoomAuthorization> {
    return roomProofKind(proof) === "guest"
      ? this.guest.authorize(
          proof as GuestRoomRequestProof,
          actorProof,
          purpose,
          contextId,
        )
      : this.member.authorize(proof as MemberRoomRequestProof, actorProof);
  }

  async finish(
    proof: RoomRequestProof,
    scope: GuestRoomMutationScope,
  ): Promise<void> {
    if (roomProofKind(proof) === "guest")
      await this.guest.finish(proof as GuestRoomRequestProof, scope);
  }

  /** Gọi sau kết quả `ended`: khách hết hạn được dọn và COMMIT trước khi trả 401. */
  async settleEnded(proof: RoomRequestProof): Promise<void> {
    if (roomProofKind(proof) === "guest")
      await this.guest.settleEnded(proof as GuestRoomRequestProof);
  }
}
