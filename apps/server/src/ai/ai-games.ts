import { randomInt, randomUUID } from "node:crypto";
import {
  EngineError,
  ENGINE_LIMITS,
  type EngineLevel,
  type EngineWorker,
} from "@xiangqi/engine";
import {
  ending,
  initialPosition,
  parsePosition,
  playMove,
  serializePosition,
  type MatchEnding,
  type Move,
  type Side,
} from "@xiangqi/xiangqi-core";
export type AiOutcome =
  | MatchEnding
  | { reason: "RESIGN"; winner: Side }
  | { reason: "ENGINE_FAILURE"; winner: null };
export interface AiSnapshot {
  id: string;
  ownerId: string;
  requestedSide: Side | "random";
  actualSide: Side;
  level: EngineLevel;
  position: string;
  history: string[];
  version: number;
  status: "ACTIVE" | "FINALIZING" | "FINISHED" | "ABANDONED";
  engineState: "IDLE" | "THINKING" | "RETRY";
  engineError: "ENGINE_TIMEOUT" | "ENGINE_BUSY" | null;
  outcome: AiOutcome | null;
}
export interface AiLifecycle {
  /** Root owns atomic global seat reservation. Failure must leave no reservation. */
  reserve(input: { gameId: string; ownerId: string }): Promise<void>;
  /** Required idempotent atomic durable history + seat release, keyed by game ID. */
  finish(snapshot: AiSnapshot): Promise<void>;
}
export interface AiOptions {
  engine: Pick<EngineWorker, "ready" | "search">;
  lifecycle: AiLifecycle;
  randomSide?: () => Side;
}
export class AiError extends Error {
  constructor(
    readonly code:
      | "AI_NOT_READY"
      | "AI_UNAVAILABLE"
      | "AI_CLOSED"
      | "AI_INPUT_INVALID"
      | "AI_FORBIDDEN"
      | "AI_NOT_FOUND"
      | "AI_ALREADY_PLAYING"
      | "AI_VERSION_CONFLICT"
      | "AI_ILLEGAL_MOVE"
      | "AI_NOT_YOUR_TURN"
      | "AI_FINISHED"
      | "AI_BUSY",
  ) {
    super(
      code === "AI_UNAVAILABLE"
        ? "Ván với máy chưa sẵn sàng"
        : "Không thể thực hiện thao tác ván với máy",
    );
  }
}
type Game = {
  snapshot: AiSnapshot;
  epoch: number;
  abort?: AbortController;
  job?: Promise<void>;
  terminalStatus?: "FINISHED" | "ABANDONED";
};
/** Internal foundation only: callers still need real session/tab authority. No HTTP exposure here. */
export class AiGames {
  private readonly games = new Map<string, Game>();
  private readonly active = new Map<string, string>();
  private readonly owners = new Map<string, Promise<unknown>>();
  private prepared = false;
  private closed = false;
  constructor(private readonly options: AiOptions) {
    if (
      !options.engine ||
      !options.lifecycle?.reserve ||
      !options.lifecycle.finish
    )
      throw new AiError("AI_INPUT_INVALID");
  }
  async ready(): Promise<void> {
    if (this.closed) throw new AiError("AI_CLOSED");
    try {
      await this.options.engine.ready();
    } catch {
      throw new AiError("AI_UNAVAILABLE");
    }
    if (this.closed) throw new AiError("AI_CLOSED");
    this.prepared = true;
  }
  private async locked<T>(owner: string, work: () => Promise<T>): Promise<T> {
    const previous = this.owners.get(owner) ?? Promise.resolve();
    const pending = previous.catch(() => {}).then(work);
    this.owners.set(owner, pending);
    try {
      return await pending;
    } finally {
      if (this.owners.get(owner) === pending) this.owners.delete(owner);
    }
  }
  private find(owner: string, id: string): Game {
    const game = this.games.get(id);
    if (!game) throw new AiError("AI_NOT_FOUND");
    if (game.snapshot.ownerId !== owner) throw new AiError("AI_FORBIDDEN");
    return game;
  }
  private copy(game: Game): AiSnapshot {
    return structuredClone(game.snapshot);
  }
  read(owner: string, id: string): AiSnapshot {
    return this.copy(this.find(owner, id));
  }
  private check(game: Game, version: number): void {
    if (this.closed) throw new AiError("AI_CLOSED");
    if (!Number.isSafeInteger(version) || game.snapshot.version !== version)
      throw new AiError("AI_VERSION_CONFLICT");
  }
  private async createLocked(
    owner: string,
    input: { requestedSide: Side | "random"; level: EngineLevel },
    actualSide?: Side,
  ): Promise<AiSnapshot> {
    if (this.closed) throw new AiError("AI_CLOSED");
    if (!this.prepared) throw new AiError("AI_NOT_READY");
    if (
      !owner ||
      !["red", "black", "random"].includes(input.requestedSide) ||
      !Object.hasOwn(ENGINE_LIMITS, input.level)
    )
      throw new AiError("AI_INPUT_INVALID");
    if (this.active.has(owner)) throw new AiError("AI_ALREADY_PLAYING");
    const side =
      actualSide ??
      (input.requestedSide === "random"
        ? (this.options.randomSide?.() ??
          (randomInt(2) === 0 ? "red" : "black"))
        : input.requestedSide);
    if (side !== "red" && side !== "black")
      throw new AiError("AI_INPUT_INVALID");
    // Cancellation can retire the borrowed worker; prepare before claiming a seat.
    await this.ready();
    const id = randomUUID();
    try {
      await this.options.lifecycle.reserve({ gameId: id, ownerId: owner });
    } catch {
      throw new AiError("AI_UNAVAILABLE");
    }
    // Root boot-lease cleanup owns any successful reservation during shutdown.
    if (this.closed) throw new AiError("AI_CLOSED");
    const position = serializePosition(initialPosition());
    const game: Game = {
      epoch: 0,
      snapshot: {
        id,
        ownerId: owner,
        requestedSide: input.requestedSide,
        actualSide: side,
        level: input.level,
        position,
        history: [position],
        version: 1,
        status: "ACTIVE",
        engineState: "IDLE",
        engineError: null,
        outcome: null,
      },
    };
    this.games.set(id, game);
    this.active.set(owner, id);
    if (side === "black" && !this.closed) this.launch(game);
    return this.copy(game);
  }
  create(
    owner: string,
    input: { requestedSide: Side | "random"; level: EngineLevel },
  ): Promise<AiSnapshot> {
    return this.locked(owner, () => this.createLocked(owner, input));
  }
  private cancel(game: Game): void {
    game.epoch++;
    game.abort?.abort();
    game.abort = undefined;
  }
  private async finish(
    game: Game,
    outcome: AiOutcome,
    status: "FINISHED" | "ABANDONED",
  ): Promise<void> {
    this.cancel(game);
    game.snapshot.status = "FINALIZING";
    game.snapshot.outcome = outcome;
    game.snapshot.engineState = "IDLE";
    game.snapshot.engineError = null;
    game.snapshot.version++;
    game.terminalStatus = status;
    await this.commitFinish(game);
  }
  private async commitFinish(game: Game): Promise<void> {
    const terminal = this.copy(game);
    terminal.status = game.terminalStatus!;
    try {
      await this.options.lifecycle.finish(terminal);
    } catch {
      throw new AiError("AI_UNAVAILABLE");
    }
    game.snapshot.status = terminal.status;
    if (this.active.get(terminal.ownerId) === terminal.id)
      this.active.delete(terminal.ownerId);
  }
  move(
    owner: string,
    id: string,
    input: { version: number; move: Move },
  ): Promise<AiSnapshot> {
    return this.locked(owner, async () => {
      const game = this.find(owner, id);
      this.check(game, input.version);
      if (game.snapshot.status !== "ACTIVE") throw new AiError("AI_FINISHED");
      if (
        game.snapshot.engineState !== "IDLE" ||
        parsePosition(game.snapshot.position).turn !== game.snapshot.actualSide
      )
        throw new AiError("AI_NOT_YOUR_TURN");
      let next;
      try {
        next = playMove(parsePosition(game.snapshot.position), input.move);
      } catch {
        throw new AiError("AI_ILLEGAL_MOVE");
      }
      this.apply(game, serializePosition(next));
      const outcome = ending(game.snapshot.history.map(parsePosition));
      if (outcome) await this.finish(game, outcome, "FINISHED");
      else this.launch(game);
      return this.copy(game);
    });
  }
  private apply(game: Game, position: string): void {
    game.snapshot.history.push(position);
    game.snapshot.position = position;
    game.snapshot.version++;
  }
  private launch(game: Game): void {
    const epoch = ++game.epoch,
      version = game.snapshot.version,
      abort = new AbortController();
    game.abort = abort;
    const deadline = performance.now() + 10000;
    game.snapshot.engineState = "THINKING";
    game.snapshot.engineError = null;
    const request = {
      position: game.snapshot.position,
      side: parsePosition(game.snapshot.position).turn,
      level: game.snapshot.level,
      history: [...game.snapshot.history],
    };
    const current = () =>
      !this.closed &&
      this.games.get(game.snapshot.id) === game &&
      game.epoch === epoch &&
      game.snapshot.version === version &&
      game.snapshot.status === "ACTIVE";
    const valid = () => current() && !abort.signal.aborted;
    const job = (async () => {
      let timer: ReturnType<typeof setTimeout> | undefined;
      let onAbort!: () => void;
      const interrupted = new Promise<never>((_resolve, reject) => {
        onAbort = () => reject(new EngineError("ENGINE_CANCELLED"));
        abort.signal.addEventListener("abort", onAbort, { once: true });
        // One whole-turn deadline, including replacement-worker preparation.
        timer = setTimeout(() => {
          reject(new EngineError("ENGINE_TIMEOUT"));
          abort.abort();
        }, 10000);
      });
      try {
        let result;
        try {
          result = await Promise.race([
            (async () => {
              await this.options.engine.ready();
              if (!valid()) return null;
              if (performance.now() >= deadline)
                throw new EngineError("ENGINE_TIMEOUT");
              const response = await this.options.engine.search(request, {
                signal: abort.signal,
              });
              if (performance.now() >= deadline)
                throw new EngineError("ENGINE_TIMEOUT");
              return response;
            })(),
            interrupted,
          ]);
        } finally {
          if (timer) clearTimeout(timer);
          abort.signal.removeEventListener("abort", onAbort);
        }
        await this.locked(game.snapshot.ownerId, async () => {
          if (!valid()) return;
          if (!result?.move || result.terminal)
            throw new EngineError("ENGINE_FAILED");
          let next;
          try {
            next = playMove(parsePosition(game.snapshot.position), result.move);
          } catch {
            throw new EngineError("ENGINE_FAILED");
          }
          this.apply(game, serializePosition(next));
          game.snapshot.engineState = "IDLE";
          const outcome = ending(game.snapshot.history.map(parsePosition));
          if (outcome) await this.finish(game, outcome, "FINISHED");
        });
      } catch (error) {
        await this.locked(game.snapshot.ownerId, async () => {
          if (!current()) return;
          if (
            error instanceof EngineError &&
            (error.code === "ENGINE_TIMEOUT" || error.code === "ENGINE_BUSY")
          ) {
            if (error.code === "ENGINE_TIMEOUT") abort.abort();
            game.snapshot.engineState = "RETRY";
            game.snapshot.engineError = error.code;
            game.snapshot.version++;
          } else {
            await this.finish(
              game,
              { reason: "ENGINE_FAILURE", winner: null },
              "ABANDONED",
            );
          }
        }).catch(() => {
          /* Finalizing state remains retryable; never erase the reservation. */
        });
      }
    })();
    game.job = job;
    void job.finally(() => {
      if (game.job === job) {
        game.job = undefined;
        game.abort = undefined;
      }
    });
  }
  resign(
    owner: string,
    id: string,
    input: { version: number },
  ): Promise<AiSnapshot> {
    return this.locked(owner, async () => {
      const game = this.find(owner, id);
      this.check(game, input.version);
      if (game.snapshot.status !== "ACTIVE") throw new AiError("AI_FINISHED");
      await this.finish(
        game,
        {
          reason: "RESIGN",
          winner: game.snapshot.actualSide === "red" ? "black" : "red",
        },
        "FINISHED",
      );
      return this.copy(game);
    });
  }
  retry(
    owner: string,
    id: string,
    input: { version: number },
  ): Promise<AiSnapshot> {
    return this.locked(owner, async () => {
      const game = this.find(owner, id);
      this.check(game, input.version);
      if (game.snapshot.status === "FINALIZING") {
        await this.commitFinish(game);
        return this.copy(game);
      }
      if (game.snapshot.status === "ABANDONED") {
        await this.ready();
        return this.createLocked(
          owner,
          {
            requestedSide: game.snapshot.requestedSide,
            level: game.snapshot.level,
          },
          game.snapshot.actualSide,
        );
      }
      if (game.snapshot.status !== "ACTIVE") throw new AiError("AI_FINISHED");
      if (game.snapshot.engineState !== "RETRY" || game.job)
        throw new AiError("AI_BUSY");
      this.launch(game);
      return this.copy(game);
    });
  }
  /** Internal observation seam, not authority or a production route. */
  async waitForEngine(owner: string, id: string): Promise<void> {
    await this.find(owner, id).job;
  }
  async close(): Promise<void> {
    this.closed = true;
    for (const game of this.games.values()) this.cancel(game);
    await Promise.allSettled([...this.games.values()].map((game) => game.job));
    await Promise.allSettled([...this.owners.values()]);
    // Worker/pool/reservations are borrowed. Root shutdown/recovery owns them.
  }
}
