/**
 * AI Worker Pool Supervisor.
 * Owns 2 worker threads and a bounded queue of 8 (capacity 10 including reservations).
 *
 * Searches never run on the caller's event loop in the default configuration: the
 * in-process path exists only as an explicit option for unit tests. A worker that
 * dies mid-job is replaced (bounded) and the job gets one retry before it surfaces
 * `AI_UNAVAILABLE`, so a dead pool can never leave a job pending forever.
 */
import { Worker } from 'node:worker_threads';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { SearchInput, SearchResult } from '@xiangqi/contracts';
import { searchBestMove } from '@xiangqi/ai';
import type { SearchJobRequest, WorkerMessage } from './protocol.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const MAX_CONCURRENT_WORKERS = 2;
export const MAX_QUEUE_SIZE = 8;
export const TOTAL_CAPACITY = MAX_CONCURRENT_WORKERS + MAX_QUEUE_SIZE; // 10
/** Dispatch attempts per job: the original attempt plus one bounded crash retry (spec 03 §AI). */
export const MAX_JOB_ATTEMPTS = 2;
/** A crash-looping pool stops respawning workers after this many replacements. */
export const MAX_WORKER_REPLACEMENTS = 4;

export type AiSupervisorErrorCode = 'AI_BUSY' | 'AI_UNAVAILABLE' | 'AI_CANCELLED';

/** Failure that crosses the supervisor boundary; carries the HTTP mapping used by routes. */
export class AiSupervisorError extends Error {
  readonly code: AiSupervisorErrorCode;
  readonly statusCode: number;

  constructor(code: AiSupervisorErrorCode, message: string, statusCode = 503) {
    super(message);
    this.name = 'AiSupervisorError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export function isAiSupervisorError(err: unknown, code?: AiSupervisorErrorCode): err is AiSupervisorError {
  return err instanceof AiSupervisorError && (code === undefined || err.code === code);
}

/** Minimal worker surface, so tests can inject fake workers to place races (spec 08 ISSUE-021). */
export interface PoolWorker {
  postMessage(message: SearchJobRequest): void;
  on(event: 'message', listener: (message: WorkerMessage) => void): unknown;
  on(event: 'error', listener: (error: Error) => void): unknown;
  on(event: 'exit', listener: (code: number) => void): unknown;
  terminate(): unknown;
}

export type WorkerFactory = () => PoolWorker;

export interface AiSupervisorOptions {
  useWorkerThreads?: boolean;
  maxWorkers?: number;
  maxQueue?: number;
  maxWorkerReplacements?: number;
  /** Test seam: inject fake workers to place races deterministically. */
  workerFactory?: WorkerFactory;
  /** Test seam: spawn a crashing child instead of the real search worker. */
  workerScript?: string;
}

export interface SubmitSearchOptions {
  /** `public.ai_jobs.job_version` captured when the job was queued. */
  jobVersion?: number;
  /**
   * Watchdog for a wedged worker. The worker's own search loop honours the search
   * deadline, so this only fires when a worker stops answering entirely; the job then
   * fails with AI_UNAVAILABLE and the worker is replaced.
   */
  timeoutMs?: number;
  /** Resolves once the job is handed to a worker (or starts in-process). */
  onDispatched?: () => void | Promise<void>;
  /** Resolves when a crashed job is requeued for its single bounded retry. */
  onRetry?: (attempt: number) => void | Promise<void>;
}

interface JobRecord {
  jobId: string;
  matchId: string;
  expectedVersion: number;
  jobVersion: number;
  input: SearchInput;
  cancelBuffer: SharedArrayBuffer;
  cancelView: Int32Array;
  /** Dispatch attempts started so far. */
  attempts: number;
  /** Promise already resolved/rejected (cancelled or delivered). */
  settled: boolean;
  timeoutMs: number | null;
  timer: ReturnType<typeof setTimeout> | null;
  options: SubmitSearchOptions;
  resolve: (result: SearchResult) => void;
  reject: (err: unknown) => void;
}

function resolveDefaultWorkerScript(): string {
  const compiled = path.join(__dirname, 'search-worker.js');
  if (fs.existsSync(compiled)) return compiled;
  // Running from source (vitest alias): Node 24 strips types, so the TS entry works.
  const source = path.join(__dirname, 'search-worker.ts');
  if (fs.existsSync(source)) return source;
  throw new Error(`Không tìm thấy worker script của AI: ${compiled}`);
}

export class AiSupervisor {
  /** True when searches run on worker threads. Production default; false is a unit-test-only mode. */
  readonly useWorkerThreads: boolean;

  private readonly maxWorkers: number;
  private readonly maxQueue: number;
  private readonly maxWorkerReplacements: number;
  private readonly workerFactory: WorkerFactory;

  private workers: PoolWorker[] = [];
  private busyWorkers = new Set<PoolWorker>();
  /** The job currently occupying each worker (kept until its attempt ends). */
  private workerJobs = new Map<PoolWorker, JobRecord>();
  /** Every job holding a capacity slot: queued or running. */
  private jobs = new Map<string, JobRecord>();
  private queue: JobRecord[] = [];
  private reservations = new Set<string>();
  private deadWorkers = new Set<PoolWorker>();
  private replacements = 0;
  private unavailable = false;
  private disposed = false;

  constructor(options: boolean | AiSupervisorOptions = {}) {
    const opts: AiSupervisorOptions = typeof options === 'boolean' ? { useWorkerThreads: options } : options;
    this.useWorkerThreads = opts.useWorkerThreads ?? true;
    this.maxWorkers = opts.maxWorkers ?? MAX_CONCURRENT_WORKERS;
    this.maxQueue = opts.maxQueue ?? MAX_QUEUE_SIZE;
    this.maxWorkerReplacements = opts.maxWorkerReplacements ?? MAX_WORKER_REPLACEMENTS;
    const script = opts.workerScript;
    this.workerFactory =
      opts.workerFactory ?? (() => new Worker(script ?? resolveDefaultWorkerScript()) as unknown as PoolWorker);
  }

  /** Total capacity load: queued/running jobs plus pre-commit reservations. */
  private currentLoad(): number {
    return this.jobs.size + this.reservations.size;
  }

  private idleWorker(): PoolWorker | null {
    for (const worker of this.workers) {
      if (!this.busyWorkers.has(worker)) return worker;
    }
    return null;
  }

  /** Spawn workers lazily so importing the module never leaks threads. */
  private ensureWorkers(): void {
    if (!this.useWorkerThreads || this.disposed || this.unavailable) return;
    while (this.workers.length < this.maxWorkers) {
      if (!this.spawnWorker()) {
        this.unavailable = true;
        return;
      }
    }
  }

  private spawnWorker(): PoolWorker | null {
    let worker: PoolWorker;
    try {
      worker = this.workerFactory();
    } catch (err) {
      console.error('Không tạo được AI worker:', err);
      return null;
    }
    worker.on('message', (msg) => this.onWorkerMessage(worker, msg));
    worker.on('error', (err) => this.onWorkerFailure(worker, err));
    worker.on('exit', (code) => {
      if (this.disposed || this.deadWorkers.has(worker)) return;
      this.onWorkerFailure(worker, new Error(`AI worker thoát với mã ${code}`));
    });
    this.workers.push(worker);
    return worker;
  }

  /** Replace exactly one dead worker; stops after the bounded replacement budget. */
  private replaceWorker(): void {
    if (this.disposed || this.unavailable) return;
    if (this.replacements >= this.maxWorkerReplacements) {
      console.error('AI worker vượt hạn thay thế; pool tạm thời không khả dụng');
      this.unavailable = true;
      return;
    }
    this.replacements += 1;
    if (!this.spawnWorker()) this.unavailable = true;
  }

  private removeWorker(worker: PoolWorker): void {
    this.deadWorkers.add(worker);
    this.workers = this.workers.filter((w) => w !== worker);
    this.workerJobs.delete(worker);
    this.busyWorkers.delete(worker);
    void worker.terminate();
  }

  /** Reserve a queue slot before creating an AI match; released on commit or rollback. */
  reserveSlot(token: string): boolean {
    if (this.currentLoad() >= this.maxWorkers + this.maxQueue) {
      return false;
    }
    this.reservations.add(token);
    return true;
  }

  releaseReservation(token: string): void {
    this.reservations.delete(token);
  }

  /**
   * Cancel every in-flight job of a match (undo-ai, match end, restart).
   * The shared cancel flag is read by the worker's CPU loop, so the search stops early.
   * Returns the number of cancelled jobs.
   */
  cancelJobForMatch(matchId: string): number {
    let cancelled = 0;
    for (const record of [...this.jobs.values()]) {
      if (record.matchId !== matchId) continue;
      Atomics.store(record.cancelView, 0, 1);
      // A queued job never reaches a worker: free its slot immediately.
      this.queue = this.queue.filter((job) => {
        if (job !== record) return true;
        this.jobs.delete(record.jobId);
        return false;
      });
      this.settleReject(record, new AiSupervisorError('AI_CANCELLED', 'Job AI đã bị hủy', 409));
      cancelled += 1;
    }
    return cancelled;
  }

  /** Submit a search job; resolves with the worker result or rejects with a typed failure. */
  async submitSearch(
    jobId: string,
    matchId: string,
    expectedVersion: number,
    input: SearchInput,
    options: SubmitSearchOptions = {},
  ): Promise<SearchResult> {
    if (this.disposed) {
      throw new AiSupervisorError('AI_UNAVAILABLE', 'AI supervisor đã dừng');
    }
    if (this.jobs.has(jobId)) {
      throw new AiSupervisorError('AI_BUSY', 'Job AI đã tồn tại trong hàng đợi');
    }
    if (this.currentLoad() >= this.maxWorkers + this.maxQueue) {
      throw new AiSupervisorError('AI_BUSY', 'Hệ thống AI đang quá tải, vui lòng thử lại');
    }

    const cancelBuffer = new SharedArrayBuffer(4);
    const cancelView = new Int32Array(cancelBuffer);

    if (!this.useWorkerThreads) {
      // Explicit in-process mode (unit tests only): blocking the caller's loop by design.
      const record = this.createRecord(jobId, matchId, expectedVersion, input, cancelBuffer, cancelView, options);
      this.jobs.set(jobId, record);
      try {
        await options.onDispatched?.();
        const result = searchBestMove(input, () => performance.now(), () => Atomics.load(cancelView, 0) === 1);
        this.finishRecord(record);
        this.settleResolve(record, result);
        return result;
      } catch (err: unknown) {
        this.finishRecord(record);
        this.settleReject(record, err);
        throw err;
      }
    }

    this.ensureWorkers();
    if (this.unavailable || this.workers.length === 0) {
      throw new AiSupervisorError('AI_UNAVAILABLE', 'AI worker không khả dụng');
    }

    const { promise, resolve, reject } = Promise.withResolvers<SearchResult>();
    const record = this.createRecord(jobId, matchId, expectedVersion, input, cancelBuffer, cancelView, options, resolve, reject);
    this.jobs.set(jobId, record);
    const worker = this.idleWorker();
    if (worker) {
      void this.dispatchJob(worker, record);
    } else {
      this.queue.push(record);
    }
    return promise;
  }

  private createRecord(
    jobId: string,
    matchId: string,
    expectedVersion: number,
    input: SearchInput,
    cancelBuffer: SharedArrayBuffer,
    cancelView: Int32Array,
    options: SubmitSearchOptions,
    resolve: (result: SearchResult) => void = () => {},
    reject: (err: unknown) => void = () => {},
  ): JobRecord {
    return {
      jobId,
      matchId,
      expectedVersion,
      jobVersion: options.jobVersion ?? 0,
      input,
      cancelBuffer,
      cancelView,
      attempts: 0,
      settled: false,
      timeoutMs: options.timeoutMs ?? null,
      timer: null,
      options,
      resolve,
      reject,
    };
  }

  private clearTimer(record: JobRecord): void {
    if (record.timer === null) return;
    clearTimeout(record.timer);
    record.timer = null;
  }

  /** A worker answered nothing within the declared budget: fail the job and replace it. */
  private onJobTimeout(record: JobRecord): void {
    record.timer = null;
    if (record.settled || this.disposed) return;
    Atomics.store(record.cancelView, 0, 1);
    const wedged = [...this.workerJobs.entries()].find(([, job]) => job === record)?.[0] ?? null;
    if (wedged) {
      this.removeWorker(wedged);
      this.replaceWorker();
    }
    this.finishRecord(record);
    this.settleReject(
      record,
      new AiSupervisorError('AI_UNAVAILABLE', `AI worker không trả kết quả trong ${record.timeoutMs ?? 0}ms`),
    );
    this.processQueue();
  }

  private settleResolve(record: JobRecord, result: SearchResult): void {
    if (record.settled) return;
    record.settled = true;
    this.clearTimer(record);
    record.resolve(result);
  }

  private settleReject(record: JobRecord, err: unknown): void {
    if (record.settled) return;
    record.settled = true;
    this.clearTimer(record);
    record.reject(err);
  }

  /** The job's attempt ended: release its capacity slot. */
  private finishRecord(record: JobRecord): void {
    this.jobs.delete(record.jobId);
  }

  private endAttempt(worker: PoolWorker): JobRecord | null {
    const record = this.workerJobs.get(worker) ?? null;
    this.workerJobs.delete(worker);
    this.busyWorkers.delete(worker);
    if (record) this.clearTimer(record);
    return record;
  }

  private async dispatchJob(worker: PoolWorker, record: JobRecord): Promise<void> {
    if (record.settled || this.disposed || this.deadWorkers.has(worker)) return;
    record.attempts += 1;
    this.busyWorkers.add(worker);
    this.workerJobs.set(worker, record);

    // Persist the THINKING transition before the CPU starts burning (spec 09 §7.2).
    try {
      await record.options.onDispatched?.();
    } catch (err) {
      console.error(`Không cập nhật được trạng thái job AI ${record.jobId}:`, err);
    }
    if (record.settled || this.disposed || this.deadWorkers.has(worker)) {
      this.endAttempt(worker);
      this.finishRecord(record);
      this.processQueue();
      return;
    }

    const request: SearchJobRequest = {
      type: 'SEARCH',
      jobId: record.jobId,
      matchId: record.matchId,
      expectedVersion: record.expectedVersion,
      jobVersion: record.jobVersion,
      input: record.input,
      cancelBuffer: record.cancelBuffer,
    };
    if (record.timeoutMs !== null) {
      const timer = setTimeout(() => this.onJobTimeout(record), record.timeoutMs);
      // Never hold the process open for a watchdog.
      (timer as { unref?: () => void }).unref?.();
      record.timer = timer;
    }
    worker.postMessage(request);
  }

  private onWorkerMessage(worker: PoolWorker, msg: WorkerMessage): void {
    this.endAttempt(worker);

    const record = this.jobs.get(msg.jobId) ?? null;
    if (!record) {
      // Delivered after cancel/settlement: discard, never apply a stale move.
      console.info(`Bỏ qua kết quả AI không còn chờ: job ${msg.jobId}`);
      this.processQueue();
      return;
    }

    if (record.expectedVersion !== msg.expectedVersion || record.jobVersion !== msg.jobVersion) {
      // Result of an out-of-date attempt: discard it, keep the job bounded by MAX_JOB_ATTEMPTS.
      console.info(`Bỏ qua kết quả AI không khớp (job ${msg.jobId}, expectedVersion ${msg.expectedVersion})`);
      if (record.attempts >= MAX_JOB_ATTEMPTS || this.unavailable) {
        this.finishRecord(record);
        this.settleReject(record, new AiSupervisorError('AI_UNAVAILABLE', 'Kết quả AI không khớp với job hiện hành'));
      } else {
        this.queue.push(record);
      }
      this.processQueue();
      return;
    }

    this.finishRecord(record);
    if (msg.type === 'RESULT') {
      // A delivered result proves the pool is healthy: give the replacement budget back.
      this.replacements = 0;
      this.settleResolve(record, msg.result);
    } else {
      this.settleReject(record, new AiSupervisorError('AI_UNAVAILABLE', msg.error));
    }
    this.processQueue();
  }

  /** A worker died: replace it, then retry its job once or fail the job (never a pending hang). */
  private onWorkerFailure(worker: PoolWorker, err: unknown): void {
    if (this.disposed || this.deadWorkers.has(worker)) return;
    const record = this.endAttempt(worker);
    this.removeWorker(worker);
    this.replaceWorker();

    if (record) {
      if (!record.settled && record.attempts < MAX_JOB_ATTEMPTS && !this.unavailable) {
        // Requeue the same jobId/expectedVersion so a late result can never become a second move.
        this.queue.push(record);
        const notify = record.options.onRetry;
        if (notify) {
          Promise.resolve(notify(record.attempts + 1)).catch((hookErr: unknown) => {
            console.error(`Không cập nhật được trạng thái retry job ${record.jobId}:`, hookErr);
          });
        }
      } else {
        this.finishRecord(record);
        if (!record.settled) {
          this.settleReject(
            record,
            new AiSupervisorError(
              'AI_UNAVAILABLE',
              `AI worker gặp lỗi: ${err instanceof Error ? err.message : String(err)}`,
            ),
          );
        }
      }
    }
    this.processQueue();
  }

  private processQueue(): void {
    if (this.queue.length === 0) return;
    if (this.unavailable || this.workers.length === 0) {
      // No worker can ever pick these up: fail them instead of leaving them pending.
      for (const record of this.queue.splice(0, this.queue.length)) {
        this.finishRecord(record);
        this.settleReject(record, new AiSupervisorError('AI_UNAVAILABLE', 'AI worker không khả dụng'));
      }
      return;
    }
    while (this.queue.length > 0) {
      const worker = this.idleWorker();
      if (!worker) return;
      const next = this.queue.shift();
      if (!next) return;
      void this.dispatchJob(worker, next);
    }
  }

  async shutdown(): Promise<void> {
    this.disposed = true;
    const pending = [...this.jobs.values()];
    this.jobs.clear();
    this.queue = [];
    for (const record of pending) {
      this.settleReject(record, new AiSupervisorError('AI_UNAVAILABLE', 'AI supervisor đã dừng'));
    }
    const workers = this.workers;
    this.workers = [];
    this.busyWorkers.clear();
    this.workerJobs.clear();
    for (const worker of workers) {
      this.deadWorkers.add(worker);
      await worker.terminate();
    }
  }
}

/** Production singleton: real worker threads outside the server event loop. */
export const aiSupervisor = new AiSupervisor();
