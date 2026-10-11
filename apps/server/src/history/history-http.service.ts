import { RoomError, type RoomScope } from "../room/contracts.js";
import type {
  MemberRoomAuthorizer,
  MemberRoomRequestProof,
} from "../room/room-http.service.js";
import type { RoomTransactions } from "../room/room-transactions.js";
import type {
  HistoryInput,
  HistoryPage,
  HistoryStore,
} from "./history-store.js";
const errors: Record<string, { status: number; message: string }> = {
  AUTH_REQUIRED: { status: 401, message: "Phiên đăng nhập không hợp lệ" },
  AUTH_UNAVAILABLE: {
    status: 503,
    message: "Chưa thể xác thực phiên đăng nhập",
  },
  HISTORY_FORBIDDEN: {
    status: 403,
    message: "Lịch sử chỉ dành cho tài khoản chính thức của ván",
  },
  HISTORY_INPUT_INVALID: {
    status: 400,
    message: "Bộ lọc lịch sử không hợp lệ",
  },
  HISTORY_CORRUPT: { status: 409, message: "Lịch sử ván không nhất quán" },
  HISTORY_RANKED_UNAVAILABLE: {
    status: 503,
    message: "Lịch sử Đánh Hạng chưa sẵn sàng",
  },
  ROOM_ROSTER_UNSTABLE: {
    status: 409,
    message: "Phòng đang thay đổi, vui lòng thử lại",
  },
};
export function historyHttpError(error: unknown): RoomError {
  const known =
    error instanceof RoomError && Object.hasOwn(errors, error.code)
      ? errors[error.code]
      : undefined;
  return known && error instanceof RoomError && error.status === known.status
    ? new RoomError(error.code, known.message, known.status)
    : new RoomError("HISTORY_UNAVAILABLE", "Chưa thể đọc lịch sử ván đấu", 503);
}
/** Member-only HTTP port. Runtime supplies the actual member authorizer and coordinator. */
export class HistoryHttpService {
  constructor(
    private readonly store: Pick<HistoryStore, "list" | "rankedSummary">,
    private readonly transactions: Pick<RoomTransactions, "withRoom">,
    private readonly authorizer: MemberRoomAuthorizer,
  ) {}
  private async run<T>(
    proof: MemberRoomRequestProof,
    work: (scope: RoomScope) => Promise<T>,
  ): Promise<T> {
    try {
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
      });
      const actor = await this.authorizer.resolve(privateProof);
      if (actor.kind !== "member")
        throw new RoomError(
          "HISTORY_FORBIDDEN",
          "Lịch sử chỉ dành cho tài khoản chính thức",
          403,
        );
      const result = await this.transactions.withRoom(
        { actor, roomIds: [] },
        (actorProof) => this.authorizer.authorize(privateProof, actorProof),
        work,
      );
      if (result.status === "ended")
        throw new RoomError(
          "AUTH_REQUIRED",
          "Phiên đăng nhập không hợp lệ",
          401,
        );
      return result.value;
    } catch (error) {
      throw historyHttpError(error);
    }
  }
  list(
    proof: MemberRoomRequestProof,
    input: HistoryInput = {},
  ): Promise<HistoryPage> {
    return this.run(proof, (scope) => this.store.list(scope, input));
  }
  rankedSummary(proof: MemberRoomRequestProof): Promise<never> {
    return this.run(proof, (scope) => this.store.rankedSummary(scope));
  }
}
