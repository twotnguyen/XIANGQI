import { RoomError, type RoomScope } from "../room/contracts.js";
import type {
  MemberRoomAuthorizer,
  MemberRoomRequestProof,
} from "../room/room-http.service.js";
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
  authorizer: MemberRoomAuthorizer;
  reservations: AiReservations;
  history: AiHistoryStore;
  bootId: string;
  control: AiHumanControl;
}
function denied(code: string, status = 409): never {
  throw new RoomError(code, "Ván với máy chưa sẵn sàng", status);
}

/** Required SQL runner. Engine jobs use internal origins, never expired bearer tokens. */
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
  private async internal(proof: RoomActorProof): Promise<RoomAuthorization> {
    if (
      proof.actor.kind !== "member" ||
      !proof.lockedActorIds.has(proof.actor.userId)
    )
      denied("AUTH_REQUIRED", 401);
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
  /** Private reads share the mutation gate, but do not manufacture a live game slot. */
  async read<T>(
    proof: MemberRoomRequestProof,
    work: (scope: RoomScope, ownerId: string) => Promise<T>,
  ): Promise<T> {
    const { coordinator, authorizer } = this.options;
    const actor = await authorizer.resolve(proof);
    if (actor.kind !== "member") denied("AUTH_REQUIRED", 401);
    const authorize = (p: RoomActorProof) => authorizer.authorize(proof, p);
    let release: (() => void) | undefined;
    try {
      const result = await coordinator.withRoom(
        { actor, roomIds: [] },
        authorize,
        async (scope) => {
          release = await this.gate(actor.userId);
          try {
            const actorProof: RoomActorProof = {
              client: scope.client,
              actor: scope.actor,
              roomIds: [...scope.lockedRoomIds],
              lockedActorIds: scope.lockedActorIds,
            };
            if (
              (await coordinator.reauthorize(actorProof, authorize)).status !==
              "active"
            )
              denied("AUTH_REQUIRED", 401);
            const value = await work(scope, actor.userId);
            if (
              (await coordinator.reauthorize(actorProof, authorize)).status !==
              "active"
            )
              denied("AUTH_REQUIRED", 401);
            return value;
          } catch (error) {
            release();
            release = undefined;
            throw error;
          }
        },
      );
      if (result.status !== "active") denied("AUTH_REQUIRED", 401);
      return result.value;
    } finally {
      release?.();
    }
  }
  async run<T>(
    ownerId: string,
    origin: AiOrigin,
    work: (tx: AiTransaction) => Promise<AiCommit<T>>,
  ): Promise<T> {
    if (origin.kind !== "human" && origin.kind !== "internal")
      denied("AI_AUTHORITY_REQUIRED", 403);
    const { coordinator, authorizer, reservations, history, bootId, control } =
      this.options;
    const actor =
      origin.kind === "human"
        ? await authorizer.resolve(origin.proof)
        : { userId: ownerId, kind: "member" as const };
    if (actor.kind !== "member" || actor.userId !== ownerId)
      denied("AI_FORBIDDEN", 403);
    const authorize = (proof: RoomActorProof) =>
      origin.kind === "human"
        ? authorizer.authorize(origin.proof, proof)
        : this.internal(proof);
    let release: (() => void) | undefined;
    try {
      const result = await coordinator.withRoom(
        { actor, roomIds: [] },
        authorize,
        async (scope) => {
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
            if (origin.kind === "human") await control.authorize(scope, origin);
          };
          let authorized = false;
          const liveGames = new Set<string>();
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
                if (snapshot.ownerId !== ownerId) denied("AI_FORBIDDEN", 403);
                await history.finish(scope, snapshot, bootId);
                authorized = true;
                liveGames.delete(snapshot.id);
              },
            });
            if (!authorized) denied("AI_AUTHORITY_REQUIRED", 503);
            await reauthorize();
            // Fresh clock after arbitrary callback awaits, including unchanged locked rows.
            for (const gameId of liveGames) await check(gameId);
            return staged;
          } catch (error) {
            // RoomTransactions can retry a roster change. Release this attempt before it does.
            release();
            release = undefined;
            throw error;
          }
        },
      );
      if (result.status !== "active") denied("AUTH_REQUIRED", 401);
      // withRoom has COMMITted; keep the owner gate held until canonical RAM is installed.
      result.value.install();
      return result.value.value;
    } finally {
      release?.();
    }
  }
}
