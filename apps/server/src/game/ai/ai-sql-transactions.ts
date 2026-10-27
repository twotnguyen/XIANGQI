import type { Pool } from "pg";
import { RoomError, type RoomScope } from "../room/room.types.js";
import type {
  RoomRequestProof,
  RoomSessionAuthorizer,
} from "../room/room-session.js";
import type { GuestCommitEffect } from "../../account/guest/guest.types.js";
import type { GuestService } from "../../account/guest/guest.service.js";
import {
  type RoomActorProof,
  type RoomAuthorization,
  RoomTransactions,
} from "../room/room-transactions.js";
import type { AiHistoryStore } from "./ai-history-store.js";
import type { AiReservations } from "./ai-reservations.js";
import type {
  AiCommit,
  AiOrigin,
  AiTransaction,
  AiTransactions,
} from "./ai-transactions.js";

export interface AiHumanControl {
  /** Must check server-owned current tab/connection/generation on scope.client. */
  authorize(
    scope: RoomScope,
    origin: Extract<AiOrigin, { kind: "human" }>,
  ): Promise<void>;
  bindGame(
    scope: RoomScope,
    gameId: string,
    origin: Extract<AiOrigin, { kind: "human" }>,
  ): Promise<void>;
  assertRetained(scope: RoomScope, gameId: string): Promise<void>;
}
interface Options {
  coordinator: RoomTransactions;
  authorizer: RoomSessionAuthorizer;
  pool: Pick<Pool, "connect">;
  guests: GuestService;
  withScope: <T>(scope: RoomScope, work: () => Promise<T>) => Promise<T>;
  reservations: AiReservations;
  history: AiHistoryStore;
  bootId: string;
  control: AiHumanControl;
}
function denied(code: string, status = 409): never {
  throw new RoomError(code, "Ván với máy chưa sẵn sàng", status);
}

/**
 * Bộ điều phối giao dịch SQL an toàn cho chế độ chơi với AI:
 * - Bảo vệ bằng actor-first lock và hàng đợi gate theo người dùng.
 * - Bảo đảm cập nhật bộ nhớ RAM chỉ diễn ra sau khi SQL COMMIT thành công.
 */
export class SqlAiTransactions implements AiTransactions {
  private readonly gates = new Map<string, Promise<void>>();
  constructor(private readonly options: Options) {
    if (
      !options.control?.authorize ||
      !options.control.bindGame ||
      !options.control.assertRetained
    )
      denied("AI_AUTHORITY_REQUIRED", 503);
  }
  private async gate(owner: string): Promise<() => void> {
    const previous = this.gates.get(owner) ?? Promise.resolve();
    let unlock!: () => void;
    const current = new Promise<void>((resolve) => (unlock = resolve));
    this.gates.set(owner, current);
    await previous;
    return () => {
      if (this.gates.get(owner) === current) this.gates.delete(owner);
      unlock();
    };
  }
  private async kindOf(ownerId: string): Promise<"member" | "guest"> {
    const client = await this.options.pool.connect();
    try {
      const row = (
        await client.query<{ kind: string }>(
          "SELECT kind FROM xiangqi_auth.principals WHERE id=$1",
          [ownerId],
        )
      ).rows[0];
      if (row?.kind === "member" || row?.kind === "guest") return row.kind;
    } finally {
      client.release();
    }
    denied("AUTH_REQUIRED", 401);
  }
  /** Ghế đang giữ (ai_game_id) làm ngữ cảnh xác thực guest existing-ai; không có ghế thì undefined. */
  private async humanAuthorize(
    proof: RoomRequestProof,
    actorProof: RoomActorProof,
  ): Promise<RoomAuthorization> {
    const held = (
      await actorProof.client.query<{ ai_game_id: string | null }>(
        "SELECT ai_game_id FROM public.active_players WHERE user_id=$1",
        [actorProof.actor.userId],
      )
    ).rows[0]?.ai_game_id;
    return this.options.authorizer.authorize(
      proof,
      actorProof,
      "existing-ai",
      held ?? undefined,
    );
  }
  private async internal(proof: RoomActorProof): Promise<RoomAuthorization> {
    if (
      (proof.actor.kind !== "member" && proof.actor.kind !== "guest") ||
      !proof.lockedActorIds.has(proof.actor.userId)
    )
      denied("AUTH_REQUIRED", 401);
    if (proof.actor.kind === "guest") {
      // Guest background work needs only the live guest session; expiry is handled by GuestService.
      const guest = (
        await proof.client.query<{ active: boolean }>(
          `SELECT EXISTS(SELECT 1 FROM xiangqi_auth.principals n JOIN xiangqi_auth.guest_sessions s ON s.guest_id=n.id AND s.ended_at IS NULL WHERE n.id=$1 AND n.kind='guest') AS active`,
          [proof.actor.userId],
        )
      ).rows[0];
      if (!guest?.active) denied("AUTH_REQUIRED", 401);
      return { status: "active", actor: proof.actor };
    }
    const row = (
      await proof.client.query<{ active: boolean }>(
        `SELECT (n.kind='member' AND n.auth_user_id=a.id AND a.email_confirmed_at IS NOT NULL
        AND p.completed_at IS NOT NULL AND NOT p.registration_pending) AS active
       FROM xiangqi_auth.principals n JOIN xiangqi_auth.accounts a ON a.id=n.id
       JOIN public.profiles p ON p.user_id=n.id WHERE n.id=$1 FOR UPDATE OF p`,
        [proof.actor.userId],
      )
    ).rows[0];
    if (!row?.active) denied("AUTH_REQUIRED", 401);
    return { status: "active", actor: proof.actor };
  }
  /**
   * Quét nền dọn reservation/ván của boot đã hết hạn. Owner có thể đã inactive (email/hồ sơ thay đổi),
   * nên không yêu cầu principal active; chỉ cần actor đã được khóa đúng theo thứ tự. Việc thu hồi vẫn
   * bị chặn bởi điều kiện lease hết hạn trong SQL (reclaimExpired/dueExpired).
   */
  private async sweepAuthorize(
    proof: RoomActorProof,
  ): Promise<RoomAuthorization> {
    if (
      (proof.actor.kind !== "member" && proof.actor.kind !== "guest") ||
      !proof.lockedActorIds.has(proof.actor.userId)
    )
      denied("AUTH_REQUIRED", 401);
    return { status: "active", actor: proof.actor };
  }
  /**
   * Thực thi thao tác đọc chỉ đọc trong giao dịch có xác thực người dùng.
   */
  async read<T>(
    proof: RoomRequestProof,
    work: (scope: RoomScope, ownerId: string) => Promise<T>,
  ): Promise<T> {
    const { coordinator, authorizer } = this.options;
    const actor = await authorizer.resolve(proof);
    const authorize = (p: RoomActorProof) => authorizer.authorize(proof, p);
    let release: (() => void) | undefined;
    try {
      const result = await coordinator.withRoom(
        { actor, roomIds: [] },
        authorize,
        (scope) =>
          this.options.withScope(scope, async () => {
            release = await this.gate(actor.userId);
            try {
              const actorProof: RoomActorProof = {
                client: scope.client,
                actor: scope.actor,
                roomIds: [...scope.lockedRoomIds],
                lockedActorIds: scope.lockedActorIds,
              };
              if (
                (await coordinator.reauthorize(actorProof, authorize))
                  .status !== "active"
              )
                denied("AUTH_REQUIRED", 401);
              const value = await work(scope, actor.userId);
              if (
                (await coordinator.reauthorize(actorProof, authorize))
                  .status !== "active"
              )
                denied("AUTH_REQUIRED", 401);
              return value;
            } catch (error) {
              release();
              release = undefined;
              throw error;
            }
          }),
      );
      if (result.status !== "active") denied("AUTH_REQUIRED", 401);
      return result.value;
    } finally {
      release?.();
    }
  }
  /**
   * Thực thi tác vụ thay đổi trạng thái ván cờ AI trong giao dịch CSDL với kiểm tra quyền và khóa an toàn.
   */
  async run<T>(
    ownerId: string,
    origin: AiOrigin,
    work: (tx: AiTransaction) => Promise<AiCommit<T>>,
  ): Promise<T> {
    if (
      origin.kind !== "human" &&
      origin.kind !== "internal" &&
      origin.kind !== "sweep"
    )
      denied("AI_AUTHORITY_REQUIRED", 403);
    const { coordinator, authorizer, reservations, history, bootId, control } =
      this.options;
    const actor =
      origin.kind === "human"
        ? await authorizer.resolve(origin.proof)
        : { userId: ownerId, kind: await this.kindOf(ownerId) };
    if (actor.userId !== ownerId) denied("AI_FORBIDDEN", 403);
    const authorize = (proof: RoomActorProof) =>
      origin.kind === "human"
        ? this.humanAuthorize(origin.proof, proof)
        : origin.kind === "sweep"
          ? this.sweepAuthorize(proof)
          : this.internal(proof);
    let release: (() => void) | undefined;
    try {
      const result = await coordinator.withRoom(
        { actor, roomIds: [] },
        authorize,
        (scope) =>
          this.options.withScope(scope, async () => {
            // Never acquire SQL actors/rooms while holding this process-local owner gate.
            release = await this.gate(ownerId);
            const reauthorize = async () => {
              const proof: RoomActorProof = {
                client: scope.client,
                actor: scope.actor,
                roomIds: [...scope.lockedRoomIds],
                lockedActorIds: scope.lockedActorIds,
              };
              if (
                (await coordinator.reauthorize(proof, authorize)).status !==
                "active"
              )
                denied("AUTH_REQUIRED", 401);
              if (origin.kind === "human")
                await control.authorize(scope, origin);
            };
            let authorized = false;
            const liveGames = new Set<string>();
            let finalizeGuest = false;
            const check = async (gameId: string) => {
              await reservations.check(scope, { gameId, bootId });
              await control.assertRetained(scope, gameId);
              authorized = true;
              liveGames.add(gameId);
            };
            try {
              await reauthorize();
              const staged = await work({
                reserve: async (gameId) => {
                  if (origin.kind !== "human")
                    denied("AI_ADMISSION_REQUIRED", 403);
                  await reservations.reserve(scope, { gameId, bootId });
                  await control.bindGame(scope, gameId, origin);
                  await check(gameId);
                },
                check,
                finish: async (snapshot) => {
                  if (origin.kind === "sweep")
                    denied("AI_AUTHORITY_REQUIRED", 403);
                  if (snapshot.ownerId !== ownerId) denied("AI_FORBIDDEN", 403);
                  await history.finish(scope, snapshot, bootId);
                  finalizeGuest = true;
                  authorized = true;
                  liveGames.delete(snapshot.id);
                },
                drop: async (gameId) => {
                  await reservations.release(scope, { gameId, bootId });
                  finalizeGuest = true;
                  authorized = true;
                  liveGames.delete(gameId);
                },
                reclaim: async (gameId, expiredBootId) => {
                  if (origin.kind !== "sweep")
                    denied("AI_AUTHORITY_REQUIRED", 403);
                  authorized = true;
                  return reservations.reclaimExpired(scope, {
                    gameId,
                    bootId: expiredBootId,
                  });
                },
              });
              if (!authorized) denied("AI_AUTHORITY_REQUIRED", 503);
              // After a guest's final release an expired session is legitimately seatless; the lock held since the first authorization still proves it.
              if (finalizeGuest && scope.actor.kind === "guest") {
                if (origin.kind === "human")
                  await control.authorize(scope, origin);
              } else await reauthorize();
              // Fresh clock after arbitrary callback awaits, including unchanged locked rows.
              for (const gameId of liveGames) await check(gameId);
              // Guest cleanup deletes its session, so it runs only after the final reauth and checks.
              if (finalizeGuest) {
                if (origin.kind === "human")
                  await authorizer.finish(origin.proof, scope);
                else if (scope.actor.kind === "guest")
                  await this.options.guests.expireIfDue(scope.client, ownerId);
              }
              return staged;
            } catch (error) {
              // RoomTransactions can retry a roster change. Release this attempt before it does.
              release();
              release = undefined;
              throw error;
            }
          }),
      );
      if (result.status !== "active") denied("AUTH_REQUIRED", 401);
      // withRoom has COMMITted; keep the owner gate held until canonical RAM is installed.
      result.value.install();
      return result.value.value;
    } finally {
      release?.();
    }
  }
  /**
   * Chuẩn bị kết thúc ván AI của khách trong scope đã khóa: chỉ giải phóng ghế SQL và giữ owner gate
   * đến khi commit/rollback. RAM do lớp transport drop sau COMMIT; không tạo transaction lồng nhau.
   */
  async prepareGuestTermination(
    scope: RoomScope,
    input: { guestId: string; aiGameId: string; reason: "expiry" | "logout" },
  ): Promise<GuestCommitEffect> {
    if (
      scope.actor.kind !== "guest" ||
      scope.actor.userId !== input.guestId ||
      !scope.lockedActorIds.has(input.guestId)
    )
      denied("AI_FORBIDDEN", 403);
    const unlock = await this.gate(input.guestId);
    let open = true;
    const settle = () => {
      if (open) {
        open = false;
        unlock();
      }
    };
    try {
      await this.options.reservations.release(scope, {
        gameId: input.aiGameId,
        bootId: this.options.bootId,
      });
    } catch (error) {
      settle();
      throw error;
    }
    return { commit: settle, rollback: settle };
  }
}
