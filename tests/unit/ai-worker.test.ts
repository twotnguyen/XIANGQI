import { describe, it, expect, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { createApp } from '../../apps/server/src/app.js';
import { createInitialPosition, validateMove } from '@xiangqi/game-rules';
import type { Move, SearchInput, SearchResult } from '@xiangqi/contracts';
import {
  AiSupervisor,
  aiSupervisor,
  isAiSupervisorError,
  TOTAL_CAPACITY,
  MAX_CONCURRENT_WORKERS,
  MAX_QUEUE_SIZE,
  type PoolWorker,
} from '@xiangqi/ai-worker';
import type { SearchJobRequest, WorkerMessage } from '../../apps/ai-worker/src/protocol.js';

const INITIAL_POSITION = createInitialPosition();

/** Supervisors created by this file, shut down so no worker thread keeps the runner alive. */
const supervisors: AiSupervisor[] = [];
const apps: FastifyInstance[] = [];

function track(supervisor: AiSupervisor): AiSupervisor {
  supervisors.push(supervisor);
  return supervisor;
}

async function newApp(): Promise<FastifyInstance> {
  const app = await createApp();
  apps.push(app);
  return app;
}

function searchInput(maxDepth: number, budgetMs: number): SearchInput {
  return {
    position: INITIAL_POSITION,
    repetitionCounts: {},
    maxDepth,
    deadlineMonoMs: performance.now() + budgetMs,
    algorithm: 'ALPHA_BETA',
    seed: 1,
  };
}

const CANNED_MOVE: Move = { from: { x: 1, y: 2 }, to: { x: 1, y: 9 } };

function cannedResult(): SearchResult {
  return {
    move: CANNED_MOVE,
    score: 1,
    nodes: 4,
    completedDepth: 1,
    elapsedMs: 1,
    pv: [CANNED_MOVE],
    aborted: false,
  };
}

/**
 * Resolves the first time a job is handed to a worker, so tests observe races
 * deterministically instead of sleeping.
 */
function dispatchBarrier(): { promise: Promise<void>; onDispatched: () => void } {
  const { promise, resolve } = Promise.withResolvers<void>();
  return { promise, onDispatched: resolve };
}

function nextTick(): Promise<void> {
  const { promise, resolve } = Promise.withResolvers<void>();
  setImmediate(resolve);
  return promise;
}

type FakeBehaviour = 'echo' | 'hang' | 'crash' | 'crash-first' | 'exit-first';

/** Deterministic worker double: places races without real CPU cost (spec 08 ISSUE-021). */
class FakeWorker implements PoolWorker {
  dispatchCount = 0;
  readonly dispatched: SearchJobRequest[] = [];
  behaviour: FakeBehaviour;

  private messageListeners: ((message: WorkerMessage) => void)[] = [];
  private errorListeners: ((error: Error) => void)[] = [];
  private exitListeners: ((code: number) => void)[] = [];
  private terminated = false;

  constructor(behaviour: FakeBehaviour = 'echo') {
    this.behaviour = behaviour;
  }

  postMessage(request: SearchJobRequest): void {
    this.dispatchCount += 1;
    this.dispatched.push(request);
    if (this.behaviour === 'hang') return;
    if (this.behaviour === 'crash' || (this.behaviour === 'crash-first' && this.dispatchCount === 1)) {
      queueMicrotask(() => this.emitError(new Error('worker crash')));
      return;
    }
    if (this.behaviour === 'exit-first' && this.dispatchCount === 1) {
      queueMicrotask(() => this.emitExit(7));
      return;
    }
    queueMicrotask(() =>
      this.emitResult(request.jobId, request.matchId, request.expectedVersion, request.jobVersion),
    );
  }

  on(
    event: 'message' | 'error' | 'exit',
    listener: ((message: WorkerMessage) => void) | ((error: Error) => void) | ((code: number) => void),
  ): unknown {
    if (event === 'message') this.messageListeners.push(listener as (message: WorkerMessage) => void);
    else if (event === 'error') this.errorListeners.push(listener as (error: Error) => void);
    else this.exitListeners.push(listener as (code: number) => void);
    return this;
  }

  terminate(): unknown {
    this.terminated = true;
    return Promise.resolve(0);
  }

  get isTerminated(): boolean {
    return this.terminated;
  }

  emitResult(jobId: string, matchId: string, expectedVersion: number, jobVersion: number): void {
    for (const listener of this.messageListeners) {
      listener({ type: 'RESULT', jobId, matchId, expectedVersion, jobVersion, result: cannedResult() });
    }
  }

  emitError(error: Error): void {
    for (const listener of this.errorListeners) listener(error);
  }

  emitExit(code: number): void {
    for (const listener of this.exitListeners) listener(code);
  }
}

afterAll(async () => {
  await Promise.all(supervisors.map((supervisor) => supervisor.shutdown()));
  await Promise.all(apps.map((app) => app.close()));
});

describe('T021-01: AI Worker Capacity and Reservation', () => {
  it('TOTAL_CAPACITY equals 10 (2 concurrent workers + 8 queue slots)', () => {
    expect(MAX_CONCURRENT_WORKERS).toBe(2);
    expect(MAX_QUEUE_SIZE).toBe(8);
    expect(TOTAL_CAPACITY).toBe(10);
  });

  it('reserves slots up to capacity and rejects subsequent reservations with AI_BUSY', () => {
    const supervisor = track(new AiSupervisor(false));

    // Reserve 10 slots
    for (let i = 0; i < 10; i++) {
      expect(supervisor.reserveSlot(`token-${i}`)).toBe(true);
    }

    // 11th reservation must be rejected
    expect(supervisor.reserveSlot('token-overflow')).toBe(false);

    // Releasing one allows a new one
    supervisor.releaseReservation('token-0');
    expect(supervisor.reserveSlot('token-new')).toBe(true);
  });

  it('T021-01b: the production singleton runs searches on worker threads, not the event loop', () => {
    expect(aiSupervisor.useWorkerThreads).toBe(true);
  });
});

describe('T021-02: AI Match endpoints validation', () => {
  it('POST /api/v1/ai/matches requires auth', async () => {
    const app = await newApp();
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/ai/matches',
      payload: {
        humanSide: 'RED',
        timeControl: 600,
        level: 'MEDIUM',
      },
    });
    expect(res.statusCode).toBe(401);
    expect(res.json().error.code).toBe('UNAUTHENTICATED');
  });

  it('POST /api/v1/ai/matches validates parameters', async () => {
    const app = await newApp();
    // Invalid level
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/ai/matches',
      payload: {
        humanSide: 'RED',
        timeControl: 600,
        level: 'SUPER_HARD', // invalid level
      },
    });
    expect(res.statusCode).toBe(401); // Auth runs before handler
  });
});

describe('T021-03: real worker pool result path', () => {
  it('RESULT from a real worker thread resolves the pending job with a legal move', async () => {
    const supervisor = track(new AiSupervisor(true));
    const barrier = dispatchBarrier();

    const promise = supervisor.submitSearch('job-real', 'match-real', 0, searchInput(2, 2000), {
      jobVersion: 7,
      onDispatched: barrier.onDispatched,
    });
    await barrier.promise;

    const result = await promise;
    expect(result.move).not.toBeNull();
    expect(validateMove(INITIAL_POSITION, result.move!)).toEqual({ valid: true });
    expect(result.nodes).toBeGreaterThan(0);
  }, 20000);

  it('T021-03b: a HARD search does not block the server event loop', async () => {
    const app = await newApp();
    const supervisor = track(new AiSupervisor(true));
    const barrier = dispatchBarrier();

    let searchSettled = false;
    const search = supervisor
      .submitSearch('job-hard', 'match-hard', 0, searchInput(6, 3000), {
        jobVersion: 1,
        onDispatched: barrier.onDispatched,
      })
      .then(
        (result) => {
          searchSettled = true;
          return result;
        },
        (err: unknown) => {
          searchSettled = true;
          throw err;
        },
      );
    await barrier.promise;

    // The HARD search is running in the worker; an unrelated HTTP request still completes.
    const startedAt = performance.now();
    const health = await app.inject({ method: 'GET', url: '/health' });
    const latencyMs = performance.now() - startedAt;

    expect(health.statusCode).toBe(200);
    expect(latencyMs).toBeLessThan(500);
    expect(searchSettled).toBe(false);

    supervisor.cancelJobForMatch('match-hard');
    await expect(search).rejects.toMatchObject({ name: 'AiSupervisorError', code: 'AI_CANCELLED' });
  }, 20000);

  it('cancelJobForMatch stops a mid-search job and the pool keeps serving new jobs', async () => {
    const supervisor = track(new AiSupervisor(true));
    const barrier = dispatchBarrier();

    const search = supervisor.submitSearch('job-cancel', 'match-cancel', 0, searchInput(6, 3000), {
      jobVersion: 2,
      onDispatched: barrier.onDispatched,
    });
    await barrier.promise;

    expect(supervisor.cancelJobForMatch('match-cancel')).toBe(1);
    await expect(search).rejects.toMatchObject({ name: 'AiSupervisorError', code: 'AI_CANCELLED' });

    // The cancelled worker reads the shared flag and returns; the pool stays usable.
    const followUp = await supervisor.submitSearch('job-after-cancel', 'match-after-cancel', 0, searchInput(2, 2000), {
      jobVersion: 3,
    });
    expect(followUp.move).not.toBeNull();
  }, 20000);
});

describe('T021-04: worker faults, stale results and capacity overflow', () => {
  it('a stale result identity is discarded and the job still resolves from the valid result', async () => {
    const worker = new FakeWorker('hang');
    const supervisor = track(new AiSupervisor({ workerFactory: () => worker, maxWorkers: 1, maxQueue: 4 }));
    const barrier = dispatchBarrier();

    let settled = false;
    const search = supervisor
      .submitSearch('job-stale', 'match-stale', 3, searchInput(2, 500), {
        jobVersion: 5,
        onDispatched: barrier.onDispatched,
      })
      .then(
        (result) => {
          settled = true;
          return result;
        },
        (err: unknown) => {
          settled = true;
          throw err;
        },
      );
    await barrier.promise;
    const request = worker.dispatched[0];

    // Wrong expectedVersion: never applied to the pending job.
    worker.emitResult(request.jobId, request.matchId, 99, request.jobVersion);
    await nextTick();
    expect(settled).toBe(false);

    // Correct identity: delivered.
    worker.emitResult(request.jobId, request.matchId, request.expectedVersion, request.jobVersion);
    await expect(search).resolves.toMatchObject({ move: CANNED_MOVE });
  });

  it('a result delivered after cancel is discarded (no double delivery)', async () => {
    const worker = new FakeWorker('hang');
    const supervisor = track(new AiSupervisor({ workerFactory: () => worker, maxWorkers: 1, maxQueue: 4 }));
    const barrier = dispatchBarrier();

    const search = supervisor.submitSearch('job-late', 'match-late', 0, searchInput(2, 500), {
      jobVersion: 1,
      onDispatched: barrier.onDispatched,
    });
    await barrier.promise;
    const request = worker.dispatched[0];

    expect(supervisor.cancelJobForMatch('match-late')).toBe(1);
    await expect(search).rejects.toMatchObject({ name: 'AiSupervisorError', code: 'AI_CANCELLED' });

    // Late RESULT for the cancelled job: ignored, and the worker is freed again.
    worker.emitResult(request.jobId, request.matchId, request.expectedVersion, request.jobVersion);
    await nextTick();
    worker.behaviour = 'echo';
    const followUp = await supervisor.submitSearch('job-late-next', 'match-late-next', 0, searchInput(2, 500), {
      jobVersion: 2,
    });
    expect(followUp.move).not.toBeNull();
  });

  it('an 11th job is rejected with AI_BUSY and shutdown never leaves a job pending', async () => {
    const workers = [new FakeWorker('hang'), new FakeWorker('hang')];
    let created = 0;
    const supervisor = track(
      new AiSupervisor({ workerFactory: () => workers[created++]!, maxWorkers: 2, maxQueue: 8 }),
    );

    const pending: Promise<unknown>[] = [];
    for (let job = 1; job <= TOTAL_CAPACITY; job++) {
      pending.push(
        supervisor
          .submitSearch(`job-cap-${job}`, `match-cap-${job}`, 0, searchInput(2, 500), { jobVersion: job })
          .catch((err: unknown) => err),
      );
    }

    await expect(
      supervisor.submitSearch('job-cap-11', 'match-cap-11', 0, searchInput(2, 500), { jobVersion: 11 }),
    ).rejects.toMatchObject({ name: 'AiSupervisorError', code: 'AI_BUSY', statusCode: 503 });

    // Capacity counted 2 running + 8 queued; the 11th never entered the pool.
    await supervisor.shutdown();
    const outcomes = await Promise.all(pending);
    expect(outcomes).toHaveLength(TOTAL_CAPACITY);
    expect(outcomes.every((outcome) => isAiSupervisorError(outcome, 'AI_UNAVAILABLE'))).toBe(true);
    expect(workers[0]!.isTerminated).toBe(true);
  });

  it('a crashing worker gets exactly one retry, then the job surfaces AI_UNAVAILABLE', async () => {
    const workers: FakeWorker[] = [];
    const supervisor = track(
      new AiSupervisor({
        workerFactory: () => {
          const worker = new FakeWorker('crash');
          workers.push(worker);
          return worker;
        },
        maxWorkers: 1,
        maxQueue: 4,
      }),
    );
    const retries: number[] = [];

    const search = supervisor.submitSearch('job-crash', 'match-crash', 0, searchInput(2, 500), {
      jobVersion: 1,
      onRetry: (attempt) => {
        retries.push(attempt);
      },
    });

    await expect(search).rejects.toMatchObject({ name: 'AiSupervisorError', code: 'AI_UNAVAILABLE' });
    // Two dispatch attempts (original + one retry), on the original worker and its replacement.
    expect(workers).toHaveLength(3); // original + 2 bounded replacements
    expect(workers.reduce((total, worker) => total + worker.dispatchCount, 0)).toBe(2);
    expect(retries).toEqual([2]); // retried once, never twice
    expect(workers[0]!.isTerminated).toBe(true);
  });

  it('a worker that crashes once is replaced and the retried job still succeeds', async () => {
    const first = new FakeWorker('crash-first');
    const replacement = new FakeWorker('echo');
    let created = 0;
    const supervisor = track(
      new AiSupervisor({
        workerFactory: () => (created++ === 0 ? first : replacement),
        maxWorkers: 1,
        maxQueue: 4,
      }),
    );

    const result = await supervisor.submitSearch('job-recover', 'match-recover', 0, searchInput(2, 500), {
      jobVersion: 3,
    });
    expect(result.move).toEqual(CANNED_MOVE);
    expect(first.dispatchCount).toBe(1);
    expect(replacement.dispatchCount).toBe(1);
  });

  it('a wedged worker is timed out: job surfaces AI_UNAVAILABLE, worker replaced, no retry', async () => {
    const workers: FakeWorker[] = [];
    const supervisor = track(
      new AiSupervisor({
        workerFactory: () => {
          const worker = new FakeWorker('hang');
          workers.push(worker);
          return worker;
        },
        maxWorkers: 1,
        maxQueue: 2,
      }),
    );

    const search = supervisor.submitSearch('job-wedged', 'match-wedged', 0, searchInput(2, 2000), {
      jobVersion: 1,
      timeoutMs: 60,
    });

    await expect(search).rejects.toMatchObject({ name: 'AiSupervisorError', code: 'AI_UNAVAILABLE' });
    // The wedged worker is terminated and replaced, and a wedged search is not retried.
    expect(workers[0]!.isTerminated).toBe(true);
    expect(workers.length).toBeGreaterThanOrEqual(2);
    expect(workers.reduce((total, worker) => total + worker.dispatchCount, 0)).toBe(1);
  });

  it("a worker 'exit' is treated as a crash: replaced and retried once", async () => {
    const first = new FakeWorker('exit-first');
    const replacement = new FakeWorker('echo');
    let created = 0;
    const supervisor = track(
      new AiSupervisor({
        workerFactory: () => (created++ === 0 ? first : replacement),
        maxWorkers: 1,
        maxQueue: 4,
      }),
    );

    const result = await supervisor.submitSearch('job-exit', 'match-exit', 0, searchInput(2, 500), {
      jobVersion: 4,
    });
    expect(result.move).toEqual(CANNED_MOVE);
    expect(first.isTerminated).toBe(true);
  });
});

describe('T021-05: explicit in-process option (unit tests only)', () => {
  it('runs the search inline and returns a legal move', async () => {
    const supervisor = track(new AiSupervisor(false));
    const result = await supervisor.submitSearch('job-inline', 'match-inline', 0, searchInput(2, 2000), {
      jobVersion: 1,
    });
    expect(result.move).not.toBeNull();
    expect(validateMove(INITIAL_POSITION, result.move!)).toEqual({ valid: true });
  }, 20000);
});
