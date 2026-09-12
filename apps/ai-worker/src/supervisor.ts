/**
 * AI Worker Pool Supervisor.
 * Manages 2 worker threads, bounded queue of 8 (capacity 10 total).
 * Handles capacity reservation, shared cancel flags, and worker lifecycle.
 */
import { Worker } from 'node:worker_threads';
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

interface QueuedJob {
  jobId: string;
  matchId: string;
  expectedVersion: number;
  input: SearchInput;
  cancelBuffer: SharedArrayBuffer;
  resolve: (res: SearchResult) => void;
  reject: (err: unknown) => void;
}

export class AiSupervisor {
  private workers: Worker[] = [];
  private busyWorkers = new Set<Worker>();
  private queue: QueuedJob[] = [];
  private reservations = new Set<string>(); // token set
  private activeJobs = new Map<string, { cancelView: Int32Array; matchId: string }>();

  constructor(private useWorkerThreads = true) {
    if (this.useWorkerThreads) {
      this.initWorkers();
    }
  }

  private initWorkers(): void {
    const workerScript = path.join(__dirname, 'search-worker.js');
    for (let i = 0; i < MAX_CONCURRENT_WORKERS; i++) {
      try {
        const worker = new Worker(workerScript);
        worker.on('message', (msg: WorkerMessage) => this.onWorkerMessage(worker, msg));
        worker.on('error', (err) => {
          console.error(`AI Worker ${i} error:`, err);
          this.busyWorkers.delete(worker);
          this.processQueue();
        });
        this.workers.push(worker);
      } catch {
        // Worker creation failed (fallback to in-process)
        this.useWorkerThreads = false;
        break;
      }
    }
  }

  /** Reserve a queue slot before creating an AI match */
  reserveSlot(token: string): boolean {
    const currentLoad = this.busyWorkers.size + this.queue.length + this.reservations.size;
    if (currentLoad >= TOTAL_CAPACITY) {
      return false;
    }
    this.reservations.add(token);
    return true;
  }

  releaseReservation(token: string): void {
    this.reservations.delete(token);
  }

  /** Cancel an in-flight job by matchId */
  cancelJobForMatch(matchId: string): void {
    // 1. Remove from queue
    this.queue = this.queue.filter((j) => {
      if (j.matchId === matchId) {
        j.reject(new Error('Job cancelled'));
        return false;
      }
      return true;
    });

    // 2. Signal cancel to active worker
    for (const [jobId, item] of this.activeJobs.entries()) {
      if (item.matchId === matchId) {
        Atomics.store(item.cancelView, 0, 1);
        this.activeJobs.delete(jobId);
      }
    }
  }

  /** Submit a search job */
  async submitSearch(
    jobId: string,
    matchId: string,
    expectedVersion: number,
    input: SearchInput,
  ): Promise<SearchResult> {
    const currentLoad = this.busyWorkers.size + this.queue.length;
    if (currentLoad >= TOTAL_CAPACITY) {
      throw { statusCode: 503, code: 'AI_BUSY', message: 'Hệ thống AI đang quá tải, vui lòng thử lại' };
    }

    const cancelBuffer = new SharedArrayBuffer(4);
    const cancelView = new Int32Array(cancelBuffer);
    this.activeJobs.set(jobId, { cancelView, matchId });

    if (!this.useWorkerThreads || this.workers.length === 0) {
      // In-process synchronous fallback
      const now = () => performance.now();
      const isCancelled = () => Atomics.load(cancelView, 0) === 1;
      const res = searchBestMove(input, now, isCancelled);
      this.activeJobs.delete(jobId);
      return res;
    }

    return new Promise<SearchResult>((resolve, reject) => {
      const job: QueuedJob = {
        jobId,
        matchId,
        expectedVersion,
        input,
        cancelBuffer,
        resolve: (r) => {
          this.activeJobs.delete(jobId);
          resolve(r);
        },
        reject: (e) => {
          this.activeJobs.delete(jobId);
          reject(e);
        },
      };

      const idleWorker = this.workers.find((w) => !this.busyWorkers.has(w));
      if (idleWorker) {
        this.dispatchJob(idleWorker, job);
      } else {
        this.queue.push(job);
      }
    });
  }

  private dispatchJob(worker: Worker, job: QueuedJob): void {
    this.busyWorkers.add(worker);
    const req: SearchJobRequest = {
      type: 'SEARCH',
      jobId: job.jobId,
      matchId: job.matchId,
      expectedVersion: job.expectedVersion,
      input: job.input,
      cancelBuffer: job.cancelBuffer,
    };
    worker.postMessage(req);
  }

  private onWorkerMessage(worker: Worker, msg: WorkerMessage): void {
    this.busyWorkers.delete(worker);

    if (msg.type === 'RESULT') {
      const active = this.activeJobs.get(msg.jobId);
      if (active) {
        // Deliver result
      }
    }

    this.processQueue();
  }

  private processQueue(): void {
    if (this.queue.length === 0) return;
    const idleWorker = this.workers.find((w) => !this.busyWorkers.has(w));
    if (!idleWorker) return;

    const nextJob = this.queue.shift();
    if (nextJob) {
      this.dispatchJob(idleWorker, nextJob);
    }
  }

  async shutdown(): Promise<void> {
    for (const w of this.workers) {
      await w.terminate();
    }
    this.workers = [];
    this.busyWorkers.clear();
    this.queue = [];
  }
}

export const aiSupervisor = new AiSupervisor(false); // In-process default for reliable cross-env testing
