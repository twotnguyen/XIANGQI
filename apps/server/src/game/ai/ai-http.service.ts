import type { EngineLevel } from "@xiangqi/engine";
import type { Move, Side } from "@xiangqi/xiangqi-core";
import type { RoomScope } from "../room/room.types.js";
import type { MemberRoomRequestProof } from "../room/room-http.service.js";
import type { AiGames, AiSnapshot } from "./ai-games.js";
import type { AiHttpApi, AiHttpResult } from "./ai.controller.js";
import { sessionNotReady } from "./ai-presence.js";
import type { AiReservations } from "./ai-reservations.js";
import type { SqlAiTransactions } from "./ai-sql-transactions.js";
import type { AiOrigin } from "./ai-transactions.js";
type Human = Extract<AiOrigin, { kind: "human" }>;
interface Options {
  games: Pick<AiGames, "read" | "create" | "move" | "resign" | "retry">;
  transactions: Pick<SqlAiTransactions, "read">;
  reservations: Pick<AiReservations, "check" | "held">;
  bootId: string;
  control: {
    /** Inspect a server-owned live physical connection and SQL generation. Never attach/take over on GET. */
    inspect(scope: RoomScope, origin: Human): Promise<AiHttpResult["control"]>;
    assertRetained(scope: RoomScope, gameId: string): Promise<void>;
  };
}
function originCopy(origin: Human): Human {
  return Object.freeze({
    kind: "human",
    proof: Object.freeze({ ...origin.proof }),
    tab: Object.freeze({ ...origin.tab }),
  });
}
/** Human mutations use SqlAiTransactions again inside AiGames; preparation runs outside SQL locks. */
export class AiHttpService implements AiHttpApi {
  constructor(private readonly options: Options) {}
  async current(
    proof: MemberRoomRequestProof,
  ): Promise<{ gameId: string | null }> {
    const privateProof = Object.freeze({ ...proof });
    return this.options.transactions.read(
      privateProof,
      async (scope, owner) => {
        const held = await this.options.reservations.held(scope, owner);
        if (!held.gameId) return { gameId: null };
        if (held.bootId !== this.options.bootId)
          sessionNotReady("AI_RESERVATION_LOST");
        await this.options.reservations.check(scope, {
          gameId: held.gameId,
          bootId: this.options.bootId,
        });
        this.options.games.read(owner, held.gameId);
        return { gameId: held.gameId };
      },
    );
  }
  private result(origin: Human, id: string): Promise<AiHttpResult> {
    return this.options.transactions.read(
      origin.proof,
      async (scope, owner) => {
        await this.options.control.inspect(scope, origin);
        const snapshot = this.options.games.read(owner, id);
        if (snapshot.status === "ACTIVE" || snapshot.status === "FINALIZING") {
          await this.options.reservations.check(scope, {
            gameId: id,
            bootId: this.options.bootId,
          });
          await this.options.control.assertRetained(scope, id);
        }
        const control = await this.options.control.inspect(scope, origin);
        return { snapshot, control, serverNow: new Date().toISOString() };
      },
    );
  }
  read(origin: Human, gameId: string): Promise<AiHttpResult> {
    return this.result(originCopy(origin), gameId);
  }
  private async mutate(
    supplied: Human,
    work: (owner: string, origin: Human) => Promise<AiSnapshot>,
  ): Promise<AiHttpResult> {
    const origin = originCopy(supplied);
    const owner = await this.options.transactions.read(
      origin.proof,
      async (scope, owner) => {
        const control = await this.options.control.inspect(scope, origin);
        if (control.mode !== "controller") sessionNotReady("TAB_READ_ONLY");
        return owner;
      },
    );
    const committed = await work(owner, origin);
    // Reauthorize the response and read canonical RAM; never return a captured pre-commit board.
    return this.result(origin, committed.id);
  }
  create(
    origin: Human,
    input: { level: EngineLevel; requestedSide: Side | "random" },
  ): Promise<AiHttpResult> {
    const setup = { level: input.level, requestedSide: input.requestedSide };
    return this.mutate(origin, (owner, proof) =>
      this.options.games.create(owner, setup, proof),
    );
  }
  move(
    origin: Human,
    gameId: string,
    input: { version: number; move: Move },
  ): Promise<AiHttpResult> {
    const command = {
      version: input.version,
      move: { from: input.move.from, to: input.move.to },
    };
    return this.mutate(origin, (owner, proof) =>
      this.options.games.move(owner, gameId, command, proof),
    );
  }
  resign(
    origin: Human,
    gameId: string,
    version: number,
  ): Promise<AiHttpResult> {
    return this.mutate(origin, (owner, proof) =>
      this.options.games.resign(owner, gameId, { version }, proof),
    );
  }
  retry(origin: Human, gameId: string, version: number): Promise<AiHttpResult> {
    return this.mutate(origin, (owner, proof) =>
      this.options.games.retry(owner, gameId, { version }, proof),
    );
  }
}
