import type { GuestCommitEffect } from "../../account/guest/guest.types.js";
import {
  LoginError,
  type SessionSeatPort,
  type AppSession,
} from "../../account/login/login.types.js";
import type { AiSessionTermination } from "./guest-room-port.js";
import type { RoomScope } from "./room.types.js";
import type { RoomStore } from "./room-store.js";
import type { RoomTransactions } from "./room-transactions.js";
import type { SessionSeatStore } from "./session-seat-store.js";

/** RoomTransactions discovers memberships and locks the complete roster before ending seats. */
export class RoomSessionSeats implements SessionSeatPort {
  private aiTermination: AiSessionTermination | null = null;

  constructor(
    private readonly coordinator: RoomTransactions,
    private readonly rooms: RoomStore,
    private readonly store: SessionSeatStore,
    private readonly withScope: <T>(
      scope: RoomScope,
      work: () => Promise<T>,
    ) => Promise<T>,
  ) {}

  attachAiTermination(port: AiSessionTermination) {
    this.aiTermination = port;
  }

  async endSeats(input: {
    userId: string;
    at: Date;
    confirmed: boolean;
    sessionHash?: string;
    replacement?: AppSession;
  }): Promise<{ displaced: boolean }> {
    const staged: GuestCommitEffect[] = [];
    let result;
    try {
      result = await this.coordinator.withRoom(
        { actor: { userId: input.userId, kind: "member" }, roomIds: [] },
        async (proof) => {
          if (
            input.sessionHash !== undefined &&
            !(await this.store.sessionActive(
              proof.client,
              input.userId,
              input.sessionHash,
            ))
          )
            throw new LoginError(
              "SESSION_EXPIRED",
              "Phiên đăng nhập đã hết hạn",
              401,
            );
          if (!(await this.store.accountActive(proof.client, input.userId)))
            throw new LoginError(
              "ACCOUNT_PENDING",
              "Tài khoản chưa xác minh hoặc chưa hoàn tất",
              403,
            );
          return { status: "active", actor: proof.actor };
        },
        async (scope) => {
          const memberships = await this.store.memberships(
            scope.client,
            input.userId,
          );
          const aiGameId = await this.store.aiGameId(
            scope.client,
            input.userId,
          );
          const displaced =
            memberships.some((m) => m.role === "PLAYER") || aiGameId !== null;
          if (
            !input.confirmed &&
            (aiGameId !== null ||
              memberships.some(
                (m) => m.role === "PLAYER" && m.status === "PLAYING",
              ))
          )
            throw new LoginError(
              "LOGOUT_CONFIRM_REQUIRED",
              "Đang trong ván, cần xác nhận đầu hàng",
              409,
            );
          if (aiGameId !== null) {
            if (!this.aiTermination)
              throw new LoginError(
                "LOGIN_UNAVAILABLE",
                "Chưa thể kết thúc ván với máy",
                503,
              );
            staged.push(
              await this.aiTermination.terminate(scope, {
                ownerId: input.userId,
                aiGameId,
                reason: "logout",
              }),
            );
          }
          for (const membership of memberships)
            await this.withScope(scope, () =>
              this.rooms.leave(scope, membership.room_id),
            );
          if (input.replacement)
            await this.store.replace(scope.client, input.replacement);
          else await this.store.revokeAll(scope.client, input.userId, input.at);
          return { displaced };
        },
      );
    } catch (error) {
      for (const effect of staged) effect.rollback();
      throw error;
    }
    if (result.status === "ended")
      throw new LoginError(
        "LOGIN_UNAVAILABLE",
        "Chưa thể cập nhật ghế phòng",
        503,
      );
    for (const effect of staged) effect.commit();
    return result.value;
  }
}
