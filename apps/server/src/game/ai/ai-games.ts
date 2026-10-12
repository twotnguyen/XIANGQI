import { RoomError } from "../room/contracts.js";
import type {
  AiTransactions,
  AiTransaction,
  AiCommit,
  AiOrigin,
} from "./ai-transactions.js";
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
export interface AiOptions {
  engine: Pick<EngineWorker, "ready" | "search">;
  transactions: AiTransactions;
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
/** Internal foundation: production boundary supplies human proof; autonomous jobs are server-only. */
export class AiGames {
  private readonly games = new Map<string, Game>();
  private readonly active = new Map<string, string>();
  private readonly operations = new Set<Promise<unknown>>();
  private prepared = false;
  private closed = false;
  constructor(private readonly options: AiOptions) {
    if (!options.engine || !options.transactions?.run)
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
  private track<T>(promise: Promise<T>): Promise<T> {
    this.operations.add(promise);
    void promise.then(
      () => this.operations.delete(promise),
      () => this.operations.delete(promise),
    );
    return promise;
  }
  private run<T>(
    owner: string,
    origin: AiOrigin,
    work: (tx: AiTransaction) => Promise<AiCommit<T>>,
  ): Promise<T> {
    return this.track(
      this.options.transactions
        .run(owner, origin, async (tx) => {
          if (this.closed) throw new AiError("AI_CLOSED");
          const staged = await work(tx);
          return {
            value: staged.value,
            install: () => {
              if (this.closed) throw new AiError("AI_CLOSED");
              staged.install();
            },
          };
        })
        .catch((error) => {
          if (error instanceof AiError || error instanceof RoomError)
            throw error;
          throw new AiError("AI_UNAVAILABLE");
        }),
    );
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
    if (!Number.isSafeInteger(version) || game.snapshot.version !== version)
      throw new AiError("AI_VERSION_CONFLICT");
  }
  private staged(
    game: Game,
    snapshot: AiSnapshot,
    epoch = game.epoch,
  ): AiCommit<AiSnapshot> {
    return {
      value: structuredClone(snapshot),
      install: () => {
        game.snapshot = snapshot;
        game.epoch = epoch;
      },
    };
  }
  private thinking(snapshot: AiSnapshot): void {
    snapshot.engineState = "THINKING";
    snapshot.engineError = null;
  }
  private finalizing(snapshot: AiSnapshot, outcome: AiOutcome): void {
    snapshot.status = "FINALIZING";
    snapshot.outcome = outcome;
    snapshot.engineState = "IDLE";
    snapshot.engineError = null;
    snapshot.version++;
  }
  private apply(snapshot: AiSnapshot, position: string): void {
    snapshot.history.push(position);
    snapshot.position = position;
    snapshot.version++;
  }
  private async createGame(
    owner: string,
    input: { requestedSide: Side | "random"; level: EngineLevel },
    origin: AiOrigin,
    prior?: { id: string; version: number },
  ): Promise<AiSnapshot> {
    if (this.closed) throw new AiError("AI_CLOSED");
    if (!this.prepared) throw new AiError("AI_NOT_READY");
    if (
      !owner ||
      !["red", "black", "random"].includes(input.requestedSide) ||
      !Object.hasOwn(ENGINE_LIMITS, input.level)
    )
      throw new AiError("AI_INPUT_INVALID");
    // Preparation is admission work, outside both SQL and the owner gate.
    await this.ready();
    const result = await this.run(owner, origin, async (tx) => {
      if (this.active.has(owner)) throw new AiError("AI_ALREADY_PLAYING");
      const old = prior ? this.find(owner, prior.id) : undefined;
      if (old) {
        this.check(old, prior!.version);
        if (old.snapshot.status !== "ABANDONED")
          throw new AiError("AI_FINISHED");
      }
      const side =
        old?.snapshot.actualSide ??
        (input.requestedSide === "random"
          ? (this.options.randomSide?.() ??
            (randomInt(2) === 0 ? "red" : "black"))
          : input.requestedSide);
      if (side !== "red" && side !== "black")
        throw new AiError("AI_INPUT_INVALID");
      const id = randomUUID();
      await tx.reserve(id);
      await tx.check(id);
      if (this.closed) throw new AiError("AI_CLOSED");
      const position = serializePosition(initialPosition());
      const game: Game = {
        epoch: side === "black" ? 1 : 0,
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
          engineState: side === "black" ? "THINKING" : "IDLE",
          engineError: null,
          outcome: null,
        },
      };
      return {
        value: this.copy(game),
        install: () => {
          this.games.set(id, game);
          this.active.set(owner, id);
        },
      };
    });
    if (result.engineState === "THINKING" && !this.closed)
      this.launch(this.find(owner, result.id));
    return result;
  }
  create(
    owner: string,
    input: { requestedSide: Side | "random"; level: EngineLevel },
    origin: AiOrigin = { kind: "internal" },
  ): Promise<AiSnapshot> {
    return this.track(this.createGame(owner, input, origin));
  }
  private cancel(game: Game): void {
    game.abort?.abort();
    game.abort = undefined;
  }
  private async commitFinish(
    owner: string,
    id: string,
    origin: AiOrigin,
    expectedVersion?: number,
  ): Promise<AiSnapshot> {
    return this.run(owner, origin, async (tx) => {
      const game = this.find(owner, id);
      if (expectedVersion !== undefined) this.check(game, expectedVersion);
      if (game.snapshot.status !== "FINALIZING")
        throw new AiError("AI_FINISHED");
      const terminal = this.copy(game);
      terminal.status = game.terminalStatus!;
      // Writer checks live exact slot, or exact previously committed terminal dedup.
      await tx.finish(terminal);
      return {
        value: structuredClone(terminal),
        install: () => {
          game.snapshot = terminal;
          if (this.active.get(owner) === id) this.active.delete(owner);
        },
      };
    });
  }
  private async afterTransition(
    owner: string,
    result: AiSnapshot,
    origin: AiOrigin,
  ): Promise<AiSnapshot> {
    const game = this.find(owner, result.id);
    if (result.status === "FINALIZING") {
      this.cancel(game);
      return this.commitFinish(owner, result.id, origin);
    }
    if (result.engineState === "THINKING" && !this.closed) this.launch(game);
    return result;
  }
  move(
    owner: string,
    id: string,
    input: { version: number; move: Move },
    origin: AiOrigin = { kind: "internal" },
  ): Promise<AiSnapshot> {
    return this.track(
      (async () => {
        const result = await this.run(owner, origin, async (tx) => {
          const game = this.find(owner, id);
          this.check(game, input.version);
          if (game.snapshot.status !== "ACTIVE")
            throw new AiError("AI_FINISHED");
          await tx.check(id);
          if (
            game.snapshot.engineState !== "IDLE" ||
            parsePosition(game.snapshot.position).turn !==
              game.snapshot.actualSide
          )
            throw new AiError("AI_NOT_YOUR_TURN");
          let next;
          try {
            next = playMove(parsePosition(game.snapshot.position), input.move);
          } catch {
            throw new AiError("AI_ILLEGAL_MOVE");
          }
          const draft = this.copy(game);
          this.apply(draft, serializePosition(next));
          const outcome = ending(draft.history.map(parsePosition));
          if (outcome) this.finalizing(draft, outcome);
          else this.thinking(draft);
          const staged = this.staged(game, draft, game.epoch + 1);
          return {
            ...staged,
            install: () => {
              staged.install();
              if (outcome) game.terminalStatus = "FINISHED";
            },
          };
        });
        return this.afterTransition(owner, result, origin);
      })(),
    );
  }
  private launch(game: Game): void {
    // Canonical THINKING and epoch were already committed; this is operational bookkeeping.
    if (
      this.closed ||
      game.snapshot.status !== "ACTIVE" ||
      game.snapshot.engineState !== "THINKING"
    )
      return;
    const epoch = game.epoch,
      version = game.snapshot.version,
      abort = new AbortController();
    game.abort = abort;
    const deadline = performance.now() + 10000;
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
      const interrupted = new Promise<never>((_, reject) => {
        onAbort = () => reject(new EngineError("ENGINE_CANCELLED"));
        abort.signal.addEventListener("abort", onAbort, { once: true });
        timer = setTimeout(() => {
          reject(new EngineError("ENGINE_TIMEOUT"));
          abort.abort();
        }, 10000);
      });
      let nextPosition: string | undefined;
      let engineError: unknown;
      try {
        const result = await Promise.race([
          (async () => {
            await this.options.engine.ready();
            if (!valid()) return null;
            if (performance.now() >= deadline)
              throw new EngineError("ENGINE_TIMEOUT");
            const result = await this.options.engine.search(request, {
              signal: abort.signal,
            });
            if (performance.now() >= deadline)
              throw new EngineError("ENGINE_TIMEOUT");
            return result;
          })(),
          interrupted,
        ]);
        if (!valid()) return;
        if (!result?.move || result.terminal)
          throw new EngineError("ENGINE_FAILED");
        try {
          nextPosition = serializePosition(
            playMove(parsePosition(request.position), result.move),
          );
        } catch {
          throw new EngineError("ENGINE_FAILED");
        }
      } catch (error) {
        engineError = error;
      } finally {
        if (timer) clearTimeout(timer);
        abort.signal.removeEventListener("abort", onAbort);
      }
      // Authority failures below are discarded, never classified as engine failures.
      try {
        const result = await this.run(
          game.snapshot.ownerId,
          { kind: "internal" },
          async (tx) => {
            if (!current()) return { value: null, install: () => {} };
            await tx.check(game.snapshot.id);
            if (!current()) return { value: null, install: () => {} };
            const draft = this.copy(game);
            let terminalStatus: Game["terminalStatus"];
            if (engineError) {
              if (
                engineError instanceof EngineError &&
                (engineError.code === "ENGINE_TIMEOUT" ||
                  engineError.code === "ENGINE_BUSY")
              ) {
                draft.engineState = "RETRY";
                draft.engineError = engineError.code;
                draft.version++;
              } else {
                this.finalizing(draft, {
                  reason: "ENGINE_FAILURE",
                  winner: null,
                });
                terminalStatus = "ABANDONED";
              }
            } else {
              this.apply(draft, nextPosition!);
              draft.engineState = "IDLE";
              const outcome = ending(draft.history.map(parsePosition));
              if (outcome) {
                this.finalizing(draft, outcome);
                terminalStatus = "FINISHED";
              }
            }
            const staged = this.staged(
              game,
              draft,
              terminalStatus ? game.epoch + 1 : game.epoch,
            );
            return {
              ...staged,
              install: () => {
                staged.install();
                if (terminalStatus) game.terminalStatus = terminalStatus;
              },
            };
          },
        );
        if (result?.status === "FINALIZING") {
          this.cancel(game);
          await this.commitFinish(result.ownerId, result.id, {
            kind: "internal",
          });
        }
      } catch {
        /* Lost authority or failed persistence: no additional canonical transition. */
      }
    })();
    game.job = job;
    void job.finally(() => {
      if (game.job === job) {
        game.job = undefined;
        if (game.abort === abort) game.abort = undefined;
      }
    });
  }
  resign(
    owner: string,
    id: string,
    input: { version: number },
    origin: AiOrigin = { kind: "internal" },
  ): Promise<AiSnapshot> {
    return this.track(
      (async () => {
        const result = await this.run(owner, origin, async (tx) => {
          const game = this.find(owner, id);
          this.check(game, input.version);
          if (game.snapshot.status !== "ACTIVE")
            throw new AiError("AI_FINISHED");
          await tx.check(id);
          const draft = this.copy(game);
          this.finalizing(draft, {
            reason: "RESIGN",
            winner: draft.actualSide === "red" ? "black" : "red",
          });
          const staged = this.staged(game, draft, game.epoch + 1);
          return {
            ...staged,
            install: () => {
              staged.install();
              game.terminalStatus = "FINISHED";
            },
          };
        });
        return this.afterTransition(owner, result, origin);
      })(),
    );
  }
  retry(
    owner: string,
    id: string,
    input: { version: number },
    origin: AiOrigin = { kind: "internal" },
  ): Promise<AiSnapshot> {
    return this.track(
      (async () => {
        // Read immutable side/level for admission preparation only; authoritative recheck is inside runner.
        const prior = this.find(owner, id);
        if (prior.snapshot.status === "FINALIZING")
          return this.commitFinish(owner, id, origin, input.version);
        if (prior.snapshot.status === "ABANDONED")
          return this.createGame(
            owner,
            {
              requestedSide: prior.snapshot.requestedSide,
              level: prior.snapshot.level,
            },
            origin,
            { id, version: input.version },
          );
        const result = await this.run(owner, origin, async (tx) => {
          const game = this.find(owner, id);
          this.check(game, input.version);
          if (game.snapshot.status !== "ACTIVE")
            throw new AiError("AI_FINISHED");
          await tx.check(id);
          if (game.snapshot.engineState !== "RETRY" || game.job)
            throw new AiError("AI_BUSY");
          const draft = this.copy(game);
          this.thinking(draft);
          return this.staged(game, draft, game.epoch + 1);
        });
        return this.afterTransition(owner, result, origin);
      })(),
    );
  }
  async waitForEngine(owner: string, id: string): Promise<void> {
    await this.find(owner, id).job;
  }
  async close(): Promise<void> {
    this.closed = true;
    for (const game of this.games.values()) this.cancel(game);
    await Promise.allSettled([...this.games.values()].map((game) => game.job));
    await Promise.allSettled([...this.operations]);
  }
}
