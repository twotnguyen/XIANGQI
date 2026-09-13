/**
 * T021 integration: human-vs-AI match over the real local stack (Postgres + Fastify)
 * with the real worker-thread supervisor.
 *
 * Harness: `tests/fixtures/integration.ts` (`createTestContext`) owns the app, the
 * seeded users and the cleanup; this suite only drives HTTP + direct DB assertions.
 *
 * Requires: `supabase start` (loopback only) AND a fresh `pnpm build`, because
 * `@xiangqi/ai-worker` resolves through its package exports (dist) inside this lane.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createInitialPosition, getLegalMoves } from '@xiangqi/game-rules';
import type { MatchSnapshot, SearchInput } from '@xiangqi/contracts';
import { AiSupervisor, aiSupervisor, TOTAL_CAPACITY } from '@xiangqi/ai-worker';
import { onRealtimeEvent, type RealtimeEventMap } from '../../apps/server/src/realtime/events.js';
import { createTestContext, type TestContext } from '../fixtures/integration.js';

let ctx: TestContext;
let unsubscribeEvents: () => void = () => {};
const aiStatusEvents: RealtimeEventMap['ai:status'][] = [];
const matchStateEvents: RealtimeEventMap['match:state'][] = [];
const tempFiles: string[] = [];

// Same gate as tests/integration/database.test.ts: the unit lane also collects
// tests/integration/**, so without a configured database this suite skips instead of
// failing the unit lane. Run it with `pnpm test:integration` and a live local stack.
const hasDatabase = Boolean(process.env['DATABASE_URL']);

function delay(ms: number): Promise<void> {
  const { promise, resolve } = Promise.withResolvers<void>();
  setTimeout(resolve, ms);
  return promise;
}

interface ApiEnvelope<T> {
  ok: boolean;
  data: T;
  error?: { code: string; message: string };
}

async function readMatch(headers: Record<string, string>, matchId: string): Promise<MatchSnapshot> {
  const res = await ctx.app.inject({ method: 'GET', url: `/api/v1/matches/${matchId}`, headers });
  expect(res.statusCode, res.body).toBe(200);
  return (res.json() as ApiEnvelope<MatchSnapshot>).data;
}

async function waitForMatch(
  headers: Record<string, string>,
  matchId: string,
  predicate: (snapshot: MatchSnapshot) => boolean,
  label: string,
  timeoutMs = 15000,
): Promise<MatchSnapshot> {
  const deadline = Date.now() + timeoutMs;
  let snapshot = await readMatch(headers, matchId);
  while (!predicate(snapshot) && Date.now() < deadline) {
    await delay(100);
    snapshot = await readMatch(headers, matchId);
  }
  expect(predicate(snapshot), `${label}: ${JSON.stringify(snapshot)}`).toBe(true);
  return snapshot;
}

async function createAiMatch(
  headers: Record<string, string>,
  humanSide: 'RED' | 'BLACK',
  level: 'EASY' | 'MEDIUM' | 'HARD',
): Promise<MatchSnapshot> {
  const res = await ctx.app.inject({
    method: 'POST',
    url: '/api/v1/ai/matches',
    headers,
    payload: { humanSide, timeControl: 300, level },
  });
  expect(res.statusCode, res.body).toBe(200);
  return (res.json() as ApiEnvelope<MatchSnapshot>).data;
}

async function playHumanMove(
  headers: Record<string, string>,
  snapshot: MatchSnapshot,
): Promise<MatchSnapshot> {
  const move = getLegalMoves(snapshot.position)[0];
  expect(move, 'the human side must have a legal move').toBeDefined();
  const res = await ctx.app.inject({
    method: 'POST',
    url: `/api/v1/matches/${snapshot.id}/commands/move`,
    headers,
    payload: {
      commandId: crypto.randomUUID(),
      expectedVersion: snapshot.version,
      payload: move,
    },
  });
  expect(res.statusCode, res.body).toBe(200);
  return (res.json() as ApiEnvelope<{ snapshot: MatchSnapshot }>).data.snapshot;
}

async function undoAi(headers: Record<string, string>, snapshot: MatchSnapshot): Promise<MatchSnapshot> {
  const res = await ctx.app.inject({
    method: 'POST',
    url: `/api/v1/matches/${snapshot.id}/commands/undo-ai`,
    headers,
    payload: { commandId: crypto.randomUUID(), expectedVersion: snapshot.version, payload: {} },
  });
  expect(res.statusCode, res.body).toBe(200);
  return (res.json() as ApiEnvelope<{ snapshot: MatchSnapshot }>).data.snapshot;
}

/** Reserve every pool slot so the next AI dispatch hits capacity; caller releases. */
function saturatePool(prefix: string): string[] {
  const held: string[] = [];
  for (let i = 0; i < TOTAL_CAPACITY; i++) {
    const token = `it-${prefix}-${ctx.runId}-${i}`;
    if (aiSupervisor.reserveSlot(token)) held.push(token);
  }
  return held;
}

function releaseAll(tokens: string[]): void {
  for (const token of tokens) aiSupervisor.releaseReservation(token);
}

describe.skipIf(!hasDatabase)('T021 integration: AI worker and authority', () => {
  beforeAll(async () => {
    ctx = await createTestContext({ seed: true });
    unsubscribeEvents = onRealtimeEvent({
      publish(event, payload) {
        if (event === 'ai:status') aiStatusEvents.push(payload as RealtimeEventMap['ai:status']);
        if (event === 'match:state') matchStateEvents.push(payload as RealtimeEventMap['match:state']);
      },
    });
  });

  afterAll(async () => {
    unsubscribeEvents();
    for (const file of tempFiles) fs.rmSync(file, { force: true });
    if (ctx) await ctx.dispose();
  });

  it('T021-I1: human BLACK — the AI (RED) plays its first move through the server authority', async () => {
    const headers = ctx.authAs('A');
    const created = await createAiMatch(headers, 'BLACK', 'MEDIUM');

    expect(created.mode).toBe('AI');
    expect(created.status).toBe('ACTIVE');
    expect(created.aiSide).toBe('RED');
    expect(created.aiState?.state).toBe('QUEUED');
    expect(created.aiState?.jobId).toBeTruthy();

    // The AI turn is armed after commit; the move lands through the same authority as a human move.
    // (aiState on GET /matches/:id comes from the match-model snapshot builder, so the job's
    // lifecycle is asserted below from the ai:status stream and the ai_jobs row instead.)
    const moved = await waitForMatch(headers, created.id, (s) => s.version >= 1, 'AI first move');
    expect(moved.ply).toBe(1);
    expect(moved.position.turn).toBe('BLACK');
    expect(moved.status).toBe('ACTIVE');

    // ai:status is emitted per state transition with a monotonic jobVersion.
    const statuses = aiStatusEvents.filter((event) => event.matchId === created.id);
    const states = statuses.map((event) => event.state);
    expect(states).toContain('QUEUED');
    expect(states).toContain('THINKING');
    expect(states.at(-1)).toBe('IDLE');
    const versions = statuses.map((event) => event.jobVersion);
    expect([...versions].sort((a, b) => a - b)).toEqual(versions);
    expect(new Set(versions).size).toBe(versions.length);

    // Snapshot pushes carry the applied move (fresh snapshot after commit).
    const pushed = matchStateEvents.filter((event) => event.matchId === created.id);
    expect(pushed.some((event) => event.snapshot.version >= 1)).toBe(true);

    // Persisted job row: one row per AI match, retired to IDLE (spec 09 §7.2).
    const jobRows = await ctx.pool.query(
      'SELECT id, status, expected_version, job_version FROM public.ai_jobs WHERE match_id = $1',
      [created.id],
    );
    expect(jobRows.rowCount).toBe(1);
    expect(jobRows.rows[0]!.status).toBe('IDLE');
    expect(Number(jobRows.rows[0]!.job_version)).toBeGreaterThanOrEqual(3);
  }, 30000);

  it('T021-I2: undo-ai cancels a pending search and the stale move is never applied', async () => {
    const headers = ctx.authAs('B');
    const created = await createAiMatch(headers, 'RED', 'HARD');
    expect(created.aiState).toEqual({ jobId: null, jobVersion: 0, state: 'IDLE' });

    // Human plays, the AI starts a HARD search (3s budget), undo lands while it is thinking.
    const afterHumanMove = await playHumanMove(headers, created);
    expect(afterHumanMove.version).toBe(1);
    expect(afterHumanMove.position.turn).toBe('BLACK');

    const afterUndo = await undoAi(headers, afterHumanMove);
    expect(afterUndo.ply).toBe(0);
    expect(afterUndo.position.turn).toBe('RED');
    expect(afterUndo.aiState?.state).toBe('IDLE');
    const undoneVersion = afterUndo.version;

    // Outlive the cancelled search budget: the stale result must never become a move.
    // Real clock on purpose — the HARD budget lives inside a worker thread's monotonic
    // clock, which fake timers cannot drive; this asserts the real deadline behavior.
    await delay(4000);
    const settled = await readMatch(headers, afterUndo.id);
    expect(settled.version).toBe(undoneVersion);
    expect(settled.ply).toBe(0);
    expect(settled.position.turn).toBe('RED');
  }, 30000);

  it('T021-I3: capacity saturation rejects a new AI match with AI_BUSY (503) before creating it', async () => {
    const held: string[] = [];
    try {
      held.push(...saturatePool('cap'));
      const probe = `it-cap-${ctx.runId}-probe`;
      const probeAccepted = aiSupervisor.reserveSlot(probe);
      if (probeAccepted) held.push(probe);
      expect(probeAccepted, 'the pool must be saturated for this case').toBe(false);

      const blocked = await ctx.app.inject({
        method: 'POST',
        url: '/api/v1/ai/matches',
        headers: ctx.authAs('S2'),
        payload: { humanSide: 'RED', timeControl: 300, level: 'EASY' },
      });
      expect(blocked.statusCode).toBe(503);
      expect((blocked.json() as ApiEnvelope<never>).error?.code).toBe('AI_BUSY');

      // No match row was created for the rejected request.
      const rows = await ctx.pool.query(
        'SELECT count(*)::int AS n FROM public.matches WHERE red_user_id = $1 OR black_user_id = $1',
        [ctx.users.S2.id],
      );
      expect(rows.rows[0]!.n).toBe(0);
    } finally {
      releaseAll(held);
    }
  }, 30000);

  it('T021-I4: a faulted AI job finalizes INTERRUPTED/AI_UNAVAILABLE and the API keeps answering', async () => {
    // The match exists while the pool still has room; the AI turn is faulted by saturating capacity.
    const headers = ctx.authAs('S1');
    const created = await createAiMatch(headers, 'RED', 'EASY');

    const held: string[] = [];
    try {
      held.push(...saturatePool('fault'));

      const afterHumanMove = await playHumanMove(headers, created);
      expect(afterHumanMove.position.turn).toBe('BLACK');

      const faulted = await waitForMatch(
        headers,
        created.id,
        (s) => s.status !== 'ACTIVE',
        'AI fault finalization',
        10000,
      );
      expect(faulted.status).toBe('INTERRUPTED');
      expect(faulted.outcome).toEqual({ winner: null, reason: 'AI_UNAVAILABLE' });

      // The HTTP API stays responsive around the fault.
      const health = await ctx.app.inject({ method: 'GET', url: '/health' });
      expect(health.statusCode).toBe(200);
      const stillReadable = await readMatch(headers, created.id);
      expect(stillReadable.status).toBe('INTERRUPTED');

      // The job row records the failure code; the human is never marked the loser.
      const jobRows = await ctx.pool.query(
        'SELECT status, last_error_code FROM public.ai_jobs WHERE match_id = $1',
        [created.id],
      );
      expect(jobRows.rowCount).toBe(1);
      expect(jobRows.rows[0]!.status).toBe('FAILED');
      expect(jobRows.rows[0]!.last_error_code).toBe('AI_UNAVAILABLE');
    } finally {
      releaseAll(held);
    }
  }, 30000);

  it('T021-I5: a valid clock expiry keeps priority over the AI fault (TIMEOUT wins)', async () => {
    const headers = ctx.authAs('S3');
    const created = await createAiMatch(headers, 'RED', 'EASY');

    // The AI side (BLACK) has no time left: its next settle must expire.
    await ctx.pool.query('UPDATE public.matches SET clock = $2::jsonb WHERE id = $1', [
      created.id,
      JSON.stringify({ redMs: 300000, blackMs: 0, runningSinceEpochMs: Date.now() }),
    ]);

    const held: string[] = [];
    try {
      held.push(...saturatePool('timeout'));

      const afterHumanMove = await playHumanMove(headers, created);
      expect(afterHumanMove.position.turn).toBe('BLACK');

      const finished = await waitForMatch(
        headers,
        created.id,
        (s) => s.status !== 'ACTIVE',
        'clock expiry beats the AI fault',
        10000,
      );
      expect(finished.status).toBe('FINISHED');
      expect(finished.outcome).toEqual({ winner: 'RED', reason: 'TIMEOUT' });
    } finally {
      releaseAll(held);
    }
  }, 30000);

  it('T021-I6: a crashed real child worker surfaces AI_UNAVAILABLE without hanging the API', async () => {
    const crashScript = path.join(os.tmpdir(), `xiangqi-crash-worker-${ctx.runId}.mjs`);
    fs.writeFileSync(crashScript, 'process.exit(7);\n');
    tempFiles.push(crashScript);

    const local = new AiSupervisor({ workerScript: crashScript, maxWorkers: 1, maxQueue: 2 });
    const input: SearchInput = {
      position: createInitialPosition(),
      repetitionCounts: {},
      maxDepth: 2,
      deadlineMonoMs: performance.now() + 1000,
      algorithm: 'ALPHA_BETA',
      seed: 1,
    };

    try {
      const search = local.submitSearch('job-child-crash', 'match-child-crash', 0, input, {
        jobVersion: 1,
      });
      // While the child pool is crashing, the HTTP API still answers.
      const health = await ctx.app.inject({ method: 'GET', url: '/health' });
      expect(health.statusCode).toBe(200);

      await expect(search).rejects.toMatchObject({ code: 'AI_UNAVAILABLE' });

      const stillAlive = await ctx.app.inject({ method: 'GET', url: '/health' });
      expect(stillAlive.statusCode).toBe(200);
    } finally {
      await local.shutdown();
    }
  }, 30000);
});
