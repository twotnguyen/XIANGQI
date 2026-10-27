import { RoomError } from "../room/room.types.js";
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
  /** Số lần undo đã dùng trong ván; tối đa `MAX_UNDO`. */
  undoUsed: number;
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
      | "AI_BUSY"
      | "AI_UNDO_UNAVAILABLE"
      | "AI_UNDO_EXHAUSTED",
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
  /** Timer for a computed engine completion whose SQL commit failed transiently. */
  timer?: NodeJS.Timeout;
};
/** Engine output retained for a deferred commit; the engine is never searched again for it. */
type Completion = { position: string } | { error: unknown };
type Pending = {
  epoch: number;
  version: number;
  attempt: number;
  completion: Completion;
};
/** Terminal games stay readable for the active-seat grace window; at most one per owner. */
const terminalGraceMilliseconds = 30 * 60 * 1000;
/** Transient commit retries back off from 1s, doubling, capped here. */
const commitRetryCapMilliseconds = 30000;
/** Số lần undo tối đa trong một ván (BA 6.3). */
const MAX_UNDO = 3;
/**
 * Lớp điều phối cốt lõi quản lý các ván đấu với máy cờ AI (khởi tạo, đi cờ, tìm nước đi, đầu hàng và thử lại).
 */
export class AiGames {
  private readonly games = new Map<string, Game>();
  private readonly active = new Map<string, string>();
  private readonly terminals = new Map<
    string,
    { id: string; retiredAt: number }
  >();
  private readonly operations = new Set<Promise<unknown>>();
  private prepared = false;
  private closed = false;
  constructor(private readonly options: AiOptions) {
    if (!options.engine || !options.transactions?.run)
      throw new AiError("AI_INPUT_INVALID");
  }
  /**
   * Khởi động và chuẩn bị engine AI sẵn sàng phục vụ tìm kiếm nước đi.
   */
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
  /**
   * Đọc ảnh chụp trạng thái ván cờ với AI hiện tại của người chơi.
   */
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
          undoUsed: 0,
        },
      };
      return {
        value: this.copy(game),
        install: () => {
          this.evictTerminal(owner);
          this.games.set(id, game);
          this.active.set(owner, id);
        },
      };
    });
    if (result.engineState === "THINKING" && !this.closed)
      this.launch(this.find(owner, result.id));
    return result;
  }
  /**
   * Tạo mới một ván cờ với AI theo phe yêu cầu và cấp độ máy mong muốn.
   */
  create(
    owner: string,
    input: { requestedSide: Side | "random"; level: EngineLevel },
    origin: AiOrigin = { kind: "internal" },
  ): Promise<AiSnapshot> {
    return this.track(this.createGame(owner, input, origin));
  }
  /**
   * Bỏ trạng thái RAM của ván P1 khi hết ân hạn 30 phút hoặc boot hết hạn.
   * Không ghi lịch sử: huỷ job đang chạy và fence callback cũ bằng epoch.
   */
  drop(owner: string, id: string): void {
    const game = this.games.get(id);
    if (!game || game.snapshot.ownerId !== owner) return;
    this.cancel(game);
    game.epoch++;
    this.games.delete(id);
    if (this.active.get(owner) === id) this.active.delete(owner);
    if (this.terminals.get(owner)?.id === id) this.terminals.delete(owner);
  }
  /**
   * Bỏ các ván kết thúc đã quá ân hạn 30 phút. Ván ACTIVE/FINALIZING không bao giờ bị bỏ ở đây.
   */
  prune(now = performance.now()): void {
    for (const [owner, terminal] of this.terminals) {
      if (now - terminal.retiredAt < terminalGraceMilliseconds) continue;
      this.terminals.delete(owner);
      this.games.delete(terminal.id);
    }
  }
  /** A terminal game is superseded by the owner's next game or next terminal. */
  private evictTerminal(owner: string): void {
    const prior = this.terminals.get(owner);
    if (!prior) return;
    this.terminals.delete(owner);
    this.games.delete(prior.id);
  }
  /** Fence for one engine turn: same live game, epoch and version, still ACTIVE and not closed. */
  private current(game: Game, epoch: number, version: number): boolean {
    return (
      !this.closed &&
      this.games.get(game.snapshot.id) === game &&
      game.epoch === epoch &&
      game.snapshot.version === version &&
      game.snapshot.status === "ACTIVE"
    );
  }
  private cancel(game: Game): void {
    game.abort?.abort();
    game.abort = undefined;
    clearTimeout(game.timer);
    game.timer = undefined;
  }
  /**
   * Commits one completed engine turn after a fresh SQL authority check. Transient SQL failure keeps the
   * computed completion for a backoff retry; lost authority (RoomError, fenced turn) discards it.
   */
  private async settle(game: Game, pending: Pending): Promise<void> {
    const { epoch, version, completion } = pending;
    try {
      const result = await this.run(
        game.snapshot.ownerId,
        { kind: "internal" },
        async (tx) => {
          if (!this.current(game, epoch, version))
            return { value: null, install: () => {} };
          await tx.check(game.snapshot.id);
          if (!this.current(game, epoch, version))
            return { value: null, install: () => {} };
          const draft = this.copy(game);
          if ("error" in completion) {
            const error = completion.error;
            if (
              error instanceof EngineError &&
              (error.code === "ENGINE_TIMEOUT" || error.code === "ENGINE_BUSY")
            ) {
              draft.engineState = "RETRY";
              draft.engineError = error.code;
              draft.version++;
            } else {
              this.finalizing(draft, {
                reason: "ENGINE_FAILURE",
                winner: null,
              });
            }
          } else {
            this.apply(draft, completion.position);
            draft.engineState = "IDLE";
            const outcome = ending(draft.history.map(parsePosition));
            if (outcome) this.finalizing(draft, outcome);
          }
          return this.staged(
            game,
            draft,
            draft.status === "FINALIZING" ? game.epoch + 1 : game.epoch,
          );
        },
      );
      if (result?.status === "FINALIZING") {
        this.cancel(game);
        await this.commitFinish(result.ownerId, result.id, {
          kind: "internal",
        });
      }
    } catch (error) {
      // Only transient SQL on a still-current turn retries; other failures are authority, never engine state.
      if (
        error instanceof AiError &&
        error.code === "AI_UNAVAILABLE" &&
        this.current(game, epoch, version)
      )
        this.defer(game, {
          epoch,
          version,
          attempt: pending.attempt,
          completion,
        });
    }
  }
  /** `pending.attempt` counts failed commits so far: the first retry waits 1s, then 2s, 4s, … capped at 30s. */
  private defer(game: Game, pending: Pending): void {
    const timer = setTimeout(
      () => {
        if (game.timer === timer) game.timer = undefined;
        void this.track(
          this.settle(game, { ...pending, attempt: pending.attempt + 1 }),
        );
      },
      Math.min(1000 * 2 ** pending.attempt, commitRetryCapMilliseconds),
    );
    timer.unref?.();
    game.timer = timer;
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
      // FINALIZING outcome decides terminal status: engine failure abandons, any other outcome finishes.
      terminal.status =
        game.snapshot.outcome?.reason === "ENGINE_FAILURE"
          ? "ABANDONED"
          : "FINISHED";
      // Writer checks live exact slot, or exact previously committed terminal dedup.
      await tx.finish(terminal);
      return {
        value: structuredClone(terminal),
        install: () => {
          game.snapshot = terminal;
          if (this.active.get(owner) === id) this.active.delete(owner);
          this.evictTerminal(owner);
          this.terminals.set(owner, { id, retiredAt: performance.now() });
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
  /**
   * Người chơi thực hiện một nước đi cờ, kiểm tra luật và kích hoạt engine AI suy nghĩ nước đáp trả nếu ván chưa kết thúc.
   */
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
          return this.staged(game, draft, game.epoch + 1);
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
    const valid = () =>
      this.current(game, epoch, version) && !abort.signal.aborted;
    const job = (async () => {
      let reject!: (error: unknown) => void;
      const interrupted = new Promise<never>((_, rej) => {
        reject = rej;
      });
      const onAbort = () => reject(new EngineError("ENGINE_CANCELLED"));
      abort.signal.addEventListener("abort", onAbort, { once: true });
      const timer = setTimeout(() => {
        reject(new EngineError("ENGINE_TIMEOUT"));
        abort.abort();
      }, 10000);
      let completion!: Completion;
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
          completion = {
            position: serializePosition(
              playMove(parsePosition(request.position), result.move),
            ),
          };
        } catch {
          throw new EngineError("ENGINE_FAILED");
        }
      } catch (error) {
        completion = { error };
      } finally {
        clearTimeout(timer);
        abort.signal.removeEventListener("abort", onAbort);
      }
      await this.settle(game, { epoch, version, attempt: 0, completion });
    })();
    game.job = job;
    void job.finally(() => {
      if (game.job === job) {
        game.job = undefined;
        if (game.abort === abort) game.abort = undefined;
      }
    });
  }
  /**
   * Người chơi đầu hàng (chịu thua) trước máy cờ AI.
   */
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
          return this.staged(game, draft, game.epoch + 1);
        });
        return this.afterTransition(owner, result, origin);
      })(),
    );
  }
  /**
   * Undo theo 6.3: tối đa 3 lần/ván. Khi máy đang nghĩ/retry thì hủy lượt đó và lùi nước đi của người;
   * khi đến lượt người thì lùi 2 nước (nước máy + nước người). Không áp dụng sau khi ván kết thúc.
   */
  undo(
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
          if (game.snapshot.undoUsed >= MAX_UNDO)
            throw new AiError("AI_UNDO_EXHAUSTED");
          const waiting = game.snapshot.engineState !== "IDLE";
          const plies = waiting ? 1 : 2;
          if (game.snapshot.history.length - 1 < plies)
            throw new AiError("AI_UNDO_UNAVAILABLE");
          const draft = this.copy(game);
          draft.history.splice(-plies);
          draft.position = draft.history[draft.history.length - 1]!;
          draft.engineState = "IDLE";
          draft.engineError = null;
          draft.undoUsed++;
          draft.version++;
          const staged = this.staged(game, draft, game.epoch + 1);
          return {
            ...staged,
            install: () => {
              staged.install();
              if (waiting) this.cancel(game);
            },
          };
        });
        return result;
      })(),
    );
  }
  /**
   * Thử lại lượt đi của engine AI nếu lượt đi trước bị timeout hoặc bận.
   */
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
  /**
   * Chờ lượt tìm kiếm nước đi hiện tại của máy hoàn tất.
   */
  async waitForEngine(owner: string, id: string): Promise<void> {
    await this.find(owner, id).job;
  }
  /**
   * Dừng toàn bộ các ván đấu đang diễn ra và hủy các tác vụ tìm kiếm nước đi của engine.
   */
  async close(): Promise<void> {
    this.closed = true;
    for (const game of this.games.values()) this.cancel(game);
    await Promise.allSettled([...this.games.values()].map((game) => game.job));
    await Promise.allSettled([...this.operations]);
  }
}
