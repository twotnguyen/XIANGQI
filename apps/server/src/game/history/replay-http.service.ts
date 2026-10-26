import { buildPgn, fenAt } from "@xiangqi/shared";
import { RoomError } from "../room/room.types.js";
import type {
  MemberRoomAuthorizer,
  MemberRoomRequestProof,
} from "../room/room-http.service.js";
import type { RoomTransactions } from "../room/room-transactions.js";
import { uuid } from "../match/position-codec.js";
import type { ReplayRecord, ReplayStore } from "./replay-store.js";
const errors: Record<string, { status: number; message: string }> = {
  AUTH_REQUIRED: { status: 401, message: "Phiên đăng nhập không hợp lệ" },
  AUTH_UNAVAILABLE: {
    status: 503,
    message: "Chưa thể xác thực phiên đăng nhập",
  },
  REPLAY_INPUT_INVALID: { status: 400, message: "Định danh ván không hợp lệ" },
  REPLAY_FORBIDDEN: {
    status: 403,
    message: "Chỉ người chơi của ván được xem lại",
  },
  REPLAY_NOT_FOUND: { status: 404, message: "Không tìm thấy ván để xem lại" },
  REPLAY_CORRUPT: { status: 409, message: "Lịch sử ván không nhất quán" },
  ROOM_ROSTER_UNSTABLE: {
    status: 409,
    message: "Phòng đang thay đổi, vui lòng thử lại",
  },
};
/**
 * Chuyển đổi lỗi nội bộ thành đối tượng RoomError an toàn khi xem lại ván đấu.
 */
export function replayHttpError(error: unknown): RoomError {
  const known =
    error instanceof RoomError && Object.hasOwn(errors, error.code)
      ? errors[error.code]
      : undefined;
  return known && error instanceof RoomError && error.status === known.status
    ? new RoomError(error.code, known.message, known.status)
    : new RoomError("REPLAY_UNAVAILABLE", "Chưa thể đọc lại ván đấu", 503);
}
/**
 * Service xử lý logic HTTP cho việc xem lại và xuất dữ liệu ván đấu của thành viên.
 */
export class ReplayHttpService {
  constructor(
    private readonly store: Pick<ReplayStore, "read">,
    private readonly transactions: Pick<RoomTransactions, "withRoom">,
    private readonly authorizer: MemberRoomAuthorizer,
  ) {}
  /**
   * Đọc dữ liệu xem lại ván đấu sau khi xác thực quyền sở hữu của thành viên.
   */
  async read(proof: MemberRoomRequestProof, id: string): Promise<ReplayRecord> {
    try {
      if (typeof id !== "string" || !uuid.test(id))
        throw new RoomError(
          "REPLAY_INPUT_INVALID",
          "Định danh ván không hợp lệ",
          400,
        );
      if (
        !proof ||
        typeof proof.accessToken !== "string" ||
        !proof.accessToken ||
        /\s/.test(proof.accessToken) ||
        typeof proof.appSession !== "string" ||
        !/^[A-Za-z0-9_-]{43}$/.test(proof.appSession)
      )
        throw new RoomError(
          "AUTH_REQUIRED",
          "Phiên đăng nhập không hợp lệ",
          401,
        );
      const privateProof = Object.freeze({
          accessToken: proof.accessToken,
          appSession: proof.appSession,
        }),
        actor = await this.authorizer.resolve(privateProof);
      if (actor.kind !== "member")
        throw new RoomError(
          "REPLAY_FORBIDDEN",
          "Chỉ người chơi của ván được xem lại",
          403,
        );
      const result = await this.transactions.withRoom(
        { actor, roomIds: [] },
        (actorProof) => this.authorizer.authorize(privateProof, actorProof),
        async (scope) => {
          const record = await this.store.read(scope, id.toLowerCase());
          // Reuse held locks and the resolved proof; a deadline can pass during the read.
          const authorization = await this.authorizer.authorize(privateProof, {
            ...scope,
            roomIds: [...scope.lockedRoomIds],
          });
          if (
            authorization.status === "ended" ||
            authorization.actor.userId !== scope.actor.userId ||
            authorization.actor.kind !== "member"
          )
            throw new RoomError(
              "AUTH_REQUIRED",
              "Phiên đăng nhập không hợp lệ",
              401,
            );
          return record;
        },
      );
      if (result.status === "ended")
        throw new RoomError(
          "AUTH_REQUIRED",
          "Phiên đăng nhập không hợp lệ",
          401,
        );
      return result.value;
    } catch (error) {
      throw replayHttpError(error);
    }
  }
  /**
   * Xuất trạng thái ván cờ sang định dạng FEN (ở nước đi chỉ định) và toàn bộ biên bản PGN.
   */
  async export(
    proof: MemberRoomRequestProof,
    id: string,
    ply?: number,
  ): Promise<{ fen: string; pgn: string }> {
    const record = await this.read(proof, id);
    const requested = ply === undefined ? record.moves.length : ply;
    try {
      return { fen: fenAt(record, requested), pgn: buildPgn(record) };
    } catch {
      throw new RoomError("REPLAY_INPUT_INVALID", "Mốc nước không hợp lệ", 400);
    }
  }
}
