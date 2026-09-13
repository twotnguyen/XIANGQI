/**
 * AI Match domain service.
 * Manages human-vs-machine games, capacity reservation, the persisted ai_jobs
 * lifecycle, and authoritative move dispatch after the match transaction commits.
 */
import crypto from 'node:crypto';
import type pg from 'pg';
import { getPool } from '../../db/pool.js';
import { withTransaction } from '../../db/transaction.js';
import { aiSupervisor, isAiSupervisorError, AiSupervisorError } from '@xiangqi/ai-worker';
import { getLevelConfig } from '@xiangqi/ai';
import { createInitialPosition } from '@xiangqi/game-rules';
import { submitMove } from '../matches/service.js';
import { loadActiveBranch, parseActiveMoveIds, rebuildEffectiveBranch } from '../matches/undo.js';
import { settleClock, projectClock } from '../matches/clock.js';
import { emitAiStatus, emitMatchState } from '../../realtime/events.js';
import type {
  Side,
  AiLevel,
  TimeControl,
  Position,
  ClockState,
  Outcome,
  SearchInput,
  MatchSnapshot,
} from '@xiangqi/contracts';

export const AI_ACTOR_ID = '00000000-0000-0000-0000-000000000001';

/** Grace on top of the search budget before the supervisor treats a worker as wedged. */
const AI_WATCHDOG_GRACE_MS = 2000;

export type AiJobState = 'IDLE' | 'QUEUED' | 'THINKING' | 'FAILED';

export interface AiJobSnapshot {
  jobId: string | null;
  jobVersion: number;
  state: AiJobState;
}

/** Minimal query surface shared by `pg.Pool` and `pg.PoolClient`. */
interface QueryRunner {
  query(
    text: string,
    values: unknown[],
  ): Promise<{ rows: Record<string, unknown>[]; rowCount: number | null }>;
}

/** State transitions of the single ai_jobs row per AI match (spec 09 §7.2). */
const AI_JOB_STATE_SQL: Record<AiJobState, string> = {
  QUEUED: `UPDATE public.ai_jobs
    SET status = 'QUEUED', started_at = NULL, job_version = job_version + 1, last_error_code = NULL
    WHERE match_id = $1 AND id = $2 AND status = 'THINKING'
    RETURNING job_version`,
  THINKING: `UPDATE public.ai_jobs
    SET status = 'THINKING', started_at = now(), attempts = attempts + 1,
        job_version = job_version + 1, last_error_code = NULL
    WHERE match_id = $1 AND id = $2 AND status = 'QUEUED'
    RETURNING job_version`,
  IDLE: `UPDATE public.ai_jobs
    SET status = 'IDLE', completed_at = now(), job_version = job_version + 1, last_error_code = $3
    WHERE match_id = $1 AND id = $2 AND status IN ('QUEUED', 'THINKING')
    RETURNING job_version`,
  FAILED: `UPDATE public.ai_jobs
    SET status = 'FAILED', completed_at = now(), job_version = job_version + 1, last_error_code = $3
    WHERE match_id = $1 AND id = $2 AND status IN ('QUEUED', 'THINKING')
    RETURNING job_version`,
};

function parseJson<T>(value: unknown): T | null {
  if (value === null || value === undefined) return null;
  return (typeof value === 'string' ? JSON.parse(value) : value) as T;
}

function aiStateFromRow(row: Record<string, unknown>): AiJobSnapshot {
  return {
    jobId: (row['id'] as string | null) ?? null,
    jobVersion: Number(row['job_version'] ?? 0),
    state: (row['status'] as AiJobState) ?? 'IDLE',
  };
}

function toAiMatchSnapshot(
  row: Record<string, unknown>,
  aiState: AiJobSnapshot,
  presence: MatchSnapshot['presence'],
): MatchSnapshot {
  const position = parseJson<Position>(row['position'])!;
  const storedClock = parseJson<ClockState>(row['clock']);
  const nowMs = Date.now();
  const status = row['status'] as MatchSnapshot['status'];
  return {
    id: row['id'] as string,
    roomId: (row['room_id'] as string | null) ?? null,
    mode: 'AI',
    status,
    position,
    version: Number(row['version']),
    ply: Number(row['ply']),
    ruleSetVersion: 'xiangqi-simple-v1',
    redUserId: (row['red_user_id'] as string | null) ?? null,
    blackUserId: (row['black_user_id'] as string | null) ?? null,
    aiSide: (row['ai_side'] as Side | null) ?? null,
    aiLevel: (row['ai_level'] as AiLevel | null) ?? null,
    timeControl: Number(row['time_control']) as TimeControl,
    // Live snapshot projects the clock to serverNowMs without writing (spec 03 §Finalizer).
    clock: status === 'ACTIVE' && storedClock ? projectClock(storedClock, position.turn, nowMs) : storedClock,
    outcome: parseJson<Outcome>(row['outcome']),
    // Effective branch ids come from the authoritative column (spec 09 §6.1: length = ply).
    activeMoveIds: parseActiveMoveIds(row['active_move_ids']),
    proposal: parseJson<MatchSnapshot['proposal']>(row['proposal']),
    serverNowMs: nowMs,
    aiState,
    presence,
  };
}

/** Update the ai_jobs row state; returns the new job_version, or null when no row matched. */
async function setAiJobState(
  runner: QueryRunner,
  matchId: string,
  jobId: string,
  state: AiJobState,
  errorCode: string | null = null,
): Promise<number | null> {
  // QUEUED/THINKING statements reference only $1/$2: the bind message must match exactly.
  const params =
    state === 'IDLE' || state === 'FAILED' ? [matchId, jobId, errorCode] : [matchId, jobId];
  const res = await runner.query(AI_JOB_STATE_SQL[state], params);
  return res.rowCount === 1 ? Number(res.rows[0]['job_version']) : null;
}

/**
 * Queue a job after the match transaction committed; bumps job_version across turns.
 * Both timestamps come from the database clock (`now()` + the caller's budget) so the
 * `deadline_at >= queued_at` check can never be broken by host/container clock skew.
 */
async function queueAiJob(
  pool: pg.Pool,
  matchId: string,
  jobId: string,
  expectedVersion: number,
  budgetMs: number,
): Promise<number> {
  const res = await pool.query(
    `INSERT INTO public.ai_jobs (match_id, id, expected_version, status, job_version, attempts, queued_at, deadline_at)
     VALUES ($1, $2, $3, 'QUEUED', 1, 0, now(), now() + make_interval(secs => $4::double precision / 1000))
     ON CONFLICT (match_id) DO UPDATE SET
       id = EXCLUDED.id,
       expected_version = EXCLUDED.expected_version,
       status = 'QUEUED',
       job_version = CASE WHEN public.ai_jobs.id = EXCLUDED.id
                          THEN public.ai_jobs.job_version ELSE public.ai_jobs.job_version + 1 END,
       attempts = 0,
       queued_at = CASE WHEN public.ai_jobs.id = EXCLUDED.id
                        THEN public.ai_jobs.queued_at ELSE EXCLUDED.queued_at END,
       started_at = CASE WHEN public.ai_jobs.id = EXCLUDED.id
                         THEN public.ai_jobs.started_at ELSE NULL END,
       completed_at = NULL,
       deadline_at = CASE WHEN public.ai_jobs.id = EXCLUDED.id
                          THEN public.ai_jobs.deadline_at ELSE EXCLUDED.deadline_at END,
       last_error_code = NULL
     RETURNING job_version`,
    [matchId, jobId, expectedVersion, budgetMs],
  );
  return Number(res.rows[0]['job_version']);
}

/**
 * A search result may only be applied while it still matches the job row *and* the match:
 * jobId/expectedVersion/job_status, match version/status/mode, and the AI side to move.
 */
async function isAiResultCurrent(
  runner: QueryRunner,
  matchId: string,
  jobId: string,
  expectedVersion: number,
): Promise<boolean> {
  const res = await runner.query(
    `SELECT m.status AS match_status, m.version AS match_version, m.mode, m.ai_side, m.position,
            j.id AS job_id, j.status AS job_status, j.expected_version AS job_expected_version
     FROM public.matches m
     JOIN public.ai_jobs j ON j.match_id = m.id
     WHERE m.id = $1`,
    [matchId],
  );
  if (res.rowCount !== 1) return false;
  const row = res.rows[0];
  const position = parseJson<Position>(row['position']);
  return (
    row['match_status'] === 'ACTIVE' &&
    row['mode'] === 'AI' &&
    Number(row['match_version']) === expectedVersion &&
    row['job_id'] === jobId &&
    row['job_status'] === 'THINKING' &&
    Number(row['job_expected_version']) === expectedVersion &&
    position?.turn === row['ai_side']
  );
}

interface AiFaultResult {
  snapshot: MatchSnapshot | null;
  jobVersion: number;
  state: AiJobState;
}

/**
 * Worker fault with no retry left: finalize INTERRUPTED/AI_UNAVAILABLE (never a human loss).
 * A valid clock expiry keeps priority and becomes TIMEOUT instead (spec 03 §AI).
 */
async function finalizeAiFault(
  pool: pg.Pool,
  matchId: string,
  jobId: string,
): Promise<AiFaultResult | null> {
  return withTransaction(async (client) => {
    const res = await client.query('SELECT * FROM public.matches WHERE id = $1 FOR UPDATE', [matchId]);
    if (res.rowCount === 0) return null;
    const m = res.rows[0];
    const position = parseJson<Position>(m.position)!;

    if (m.status !== 'ACTIVE' || m.mode !== 'AI') {
      // The match already ended: retire the job row without touching match state.
      const retired = await setAiJobState(client, matchId, jobId, 'IDLE', 'MATCH_ENDED');
      return retired === null ? null : { snapshot: null, jobVersion: retired, state: 'IDLE' as AiJobState };
    }

    const settled = settleClock(parseJson<ClockState>(m.clock), position.turn, Date.now());
    const expired = settled?.expired ?? false;
    const outcome: Outcome = expired
      ? { winner: position.turn === 'RED' ? 'BLACK' : 'RED', reason: 'TIMEOUT' }
      : { winner: null, reason: 'AI_UNAVAILABLE' };
    const newVersion = Number(m.version) + 1;

    await client.query(
      `UPDATE public.matches
       SET status = $1, outcome = $2, version = $3, proposal = NULL, ended_at = now(), updated_at = now()
       WHERE id = $4`,
      [expired ? 'FINISHED' : 'INTERRUPTED', JSON.stringify(outcome), newVersion, matchId],
    );
    await client.query(
      `INSERT INTO public.match_events (match_id, version, type, payload)
       VALUES ($1, $2, 'RESULT', $3)`,
      [matchId, newVersion, JSON.stringify({ outcome, actorKey: null })],
    );
    await client.query('DELETE FROM public.active_players WHERE match_id = $1', [matchId]);

    const jobVersion = await setAiJobState(client, matchId, jobId, expired ? 'IDLE' : 'FAILED', 'AI_UNAVAILABLE');
    const humanId = (m.red_user_id ?? m.black_user_id) as string | null;
    return {
      snapshot: toAiMatchSnapshot(
        { ...m, status: expired ? 'FINISHED' : 'INTERRUPTED', outcome, version: newVersion },
        { jobId, jobVersion: jobVersion ?? 0, state: expired ? 'IDLE' : 'FAILED' },
        humanId ? [{ userId: humanId, online: true, disconnectDeadlineMs: null }] : [],
      ),
      jobVersion: jobVersion ?? 0,
      state: expired ? ('IDLE' as AiJobState) : ('FAILED' as AiJobState),
    };
  }, pool);
}

export async function createAiMatch(
  userId: string,
  humanSide: Side,
  timeControl: TimeControl,
  level: AiLevel,
  pool?: pg.Pool,
): Promise<MatchSnapshot> {
  const reservationToken = crypto.randomUUID();
  const reserved = aiSupervisor.reserveSlot(reservationToken);
  if (!reserved) {
    throw new AiSupervisorError('AI_BUSY', 'Hệ thống AI đang quá tải, vui lòng thử lại sau');
  }

  const p = pool ?? getPool();

  try {
    const aiFirst = humanSide === 'BLACK';
    const jobId = aiFirst ? crypto.randomUUID() : null;
    const budgetMs = getLevelConfig(level).timeBudgetMs;

    const { snapshot, position, clock } = await withTransaction(async (client) => {
      // 1. Check user has no active match/room
      const activeCheck = await client.query(
        'SELECT 1 FROM public.active_players WHERE user_id = $1',
        [userId],
      );
      if (activeCheck.rowCount! > 0) {
        throw { statusCode: 409, code: 'USER_IN_ACTIVE_ROOM', message: 'Bạn đang trong một ván hoặc phòng khác' };
      }

      const matchId = crypto.randomUUID();
      const initialPos = createInitialPosition();
      const aiSide: Side = humanSide === 'RED' ? 'BLACK' : 'RED';
      const dbRedUserId = humanSide === 'RED' ? userId : null;
      const dbBlackUserId = humanSide === 'BLACK' ? userId : null;
      const redUserId = humanSide === 'RED' ? userId : AI_ACTOR_ID;
      const blackUserId = humanSide === 'BLACK' ? userId : AI_ACTOR_ID;

      const initialClock: ClockState | null = timeControl > 0 ? {
        redMs: timeControl * 1000,
        blackMs: timeControl * 1000,
        runningSinceEpochMs: Date.now(),
      } : null;

      // 2. Insert matches row
      await client.query(
        `INSERT INTO public.matches (
           id, room_id, mode, status, position, version, ply,
           red_user_id, black_user_id, ai_side, ai_level, time_control, clock
         ) VALUES ($1, NULL, 'AI', 'ACTIVE', $2, 0, 0, $3, $4, $5, $6, $7, $8)`,
        [
          matchId,
          JSON.stringify(initialPos),
          dbRedUserId,
          dbBlackUserId,
          aiSide,
          level,
          timeControl,
          initialClock ? JSON.stringify(initialClock) : null,
        ],
      );

      // 3. Insert into active_players
      await client.query(
        'INSERT INTO public.active_players (user_id, match_id, created_at) VALUES ($1, $2, now())',
        [userId, matchId],
      );

      // 4. Initial match event
      await client.query(
        `INSERT INTO public.match_events (match_id, version, type, payload)
         VALUES ($1, 0, 'START', $2)`,
        [matchId, JSON.stringify({ position: initialPos, clock: initialClock })],
      );

      // 5. Persist the AI job row in the same transaction as the match.
      const jobRes = aiFirst
        ? await client.query(
            `INSERT INTO public.ai_jobs (match_id, id, expected_version, status, job_version, attempts, queued_at, deadline_at)
             VALUES ($1, $2, 0, 'QUEUED', 1, 0, now(), now() + make_interval(secs => $3::double precision / 1000))
             RETURNING id, status, job_version`,
            [matchId, jobId, budgetMs],
          )
        : await client.query(
            `INSERT INTO public.ai_jobs (match_id, status, job_version, attempts)
             VALUES ($1, 'IDLE', 0, 0)
             RETURNING id, status, job_version`,
            [matchId],
          );

      const row = {
        id: matchId,
        room_id: null,
        mode: 'AI',
        status: 'ACTIVE',
        position: initialPos,
        version: 0,
        ply: 0,
        red_user_id: redUserId,
        black_user_id: blackUserId,
        ai_side: aiSide,
        ai_level: level,
        time_control: timeControl,
        clock: initialClock,
        outcome: null,
        active_move_ids: [],
        proposal: null,
      };

      return {
        snapshot: toAiMatchSnapshot(row, aiStateFromRow(jobRes.rows[0]), [
          { userId, online: true, disconnectDeadlineMs: null },
        ]),
        position: initialPos,
        clock: initialClock,
      };
    }, p);

    // After commit: publish the snapshot, then dispatch the first search (never inside the
    // transaction). The QUEUED ai:status is emitted by triggerAiTurn, which owns the job row.
    emitMatchState({ matchId: snapshot.id, snapshot });
    if (aiFirst && jobId) {
      setImmediate(() => {
        void triggerAiTurn(snapshot.id, position, 0, level, clock, {}, { jobId }).catch((err: unknown) => {
          console.error('Không chạy được lượt AI đầu tiên:', err);
        });
      });
    }

    return snapshot;
  } finally {
    aiSupervisor.releaseReservation(reservationToken);
  }
}

export interface TriggerAiTurnOptions {
  /** Job already queued inside the create-match transaction; dispatch only after commit. */
  jobId?: string;
}

/**
 * Triggers AI search in the worker pool, then commits the move through the same
 * authoritative pipeline as human moves. Stale results are discarded, a worker
 * fault finalizes INTERRUPTED/AI_UNAVAILABLE, and a valid clock expiry keeps
 * priority (TIMEOUT) per spec 03 §AI.
 */
export async function triggerAiTurn(
  matchId: string,
  position: Position,
  expectedVersion: number,
  level: AiLevel,
  clock: ClockState | null,
  repetitionCounts: Record<string, number>,
  options: TriggerAiTurnOptions = {},
  pool?: pg.Pool,
): Promise<void> {
  const p = pool ?? getPool();
  const levelConfig = getLevelConfig(level);

  // Budget: min(level budget, remainingMs - 50), floor 0.
  let budgetMs = levelConfig.timeBudgetMs;
  if (clock) {
    const remaining = position.turn === 'RED' ? clock.redMs : clock.blackMs;
    budgetMs = Math.min(budgetMs, Math.max(0, remaining - 50));
  }

  const input: SearchInput = {
    position,
    repetitionCounts,
    maxDepth: levelConfig.maxDepth,
    deadlineMonoMs: performance.now() + budgetMs,
    algorithm: 'ALPHA_BETA',
    seed: Date.now(),
  };

  const jobId = options.jobId ?? crypto.randomUUID();
  let jobVersion: number;
  try {
    jobVersion = await queueAiJob(p, matchId, jobId, expectedVersion, budgetMs);
  } catch (err: unknown) {
    console.error(`Không ghi được ai_jobs cho ván ${matchId}:`, err);
    const finalized = await finalizeAiFault(p, matchId, jobId);
    if (finalized?.snapshot) emitMatchState({ matchId, snapshot: finalized.snapshot });
    return;
  }
  emitAiStatus({ matchId, jobId, jobVersion, state: 'QUEUED' });

  try {
    const searchRes = await aiSupervisor.submitSearch(jobId, matchId, expectedVersion, input, {
      jobVersion,
      timeoutMs: budgetMs + AI_WATCHDOG_GRACE_MS,
      onDispatched: async () => {
        const next = await setAiJobState(p, matchId, jobId, 'THINKING');
        if (next !== null) emitAiStatus({ matchId, jobId, jobVersion: next, state: 'THINKING' });
      },
      onRetry: async () => {
        // One bounded retry keeps the same id/expected_version (spec 09 §7.2).
        const next = await setAiJobState(p, matchId, jobId, 'QUEUED');
        if (next !== null) emitAiStatus({ matchId, jobId, jobVersion: next, state: 'QUEUED' });
      },
    });

    if (!searchRes.move) {
      const finalized = await finalizeAiFault(p, matchId, jobId);
      if (finalized) {
        emitAiStatus({ matchId, jobId, jobVersion: finalized.jobVersion, state: finalized.state });
        if (finalized.snapshot) emitMatchState({ matchId, snapshot: finalized.snapshot });
      }
      return;
    } else if (!(await isAiResultCurrent(p, matchId, jobId, expectedVersion))) {
      const retired = await setAiJobState(p, matchId, jobId, 'IDLE', 'STALE_RESULT');
      if (retired !== null) emitAiStatus({ matchId, jobId, jobVersion: retired, state: 'IDLE' });
      console.info(`Bỏ nước AI không còn hợp lệ cho ván ${matchId}`);
      return;
    } else {
      const applied = await submitMove(AI_ACTOR_ID, matchId, {
        commandId: crypto.randomUUID(),
        expectedVersion,
        payload: searchRes.move,
      });
      const retired = await setAiJobState(p, matchId, jobId, 'IDLE', null);
      if (retired !== null) emitAiStatus({ matchId, jobId, jobVersion: retired, state: 'IDLE' });
      emitMatchState({ matchId, snapshot: applied.snapshot });
      return;
    }
  } catch (err: unknown) {
    if (isAiSupervisorError(err, 'AI_CANCELLED')) {
      // undo-ai cancelled this search: retire the job row, never apply the late move.
      const retired = await setAiJobState(p, matchId, jobId, 'IDLE', 'AI_CANCELLED');
      if (retired !== null) emitAiStatus({ matchId, jobId, jobVersion: retired, state: 'IDLE' });
      console.info(`Job AI của ván ${matchId} đã bị hủy`);
      return;
    }
    if (isAiSupervisorError(err, 'AI_BUSY') || isAiSupervisorError(err, 'AI_UNAVAILABLE')) {
      const finalized = await finalizeAiFault(p, matchId, jobId);
      if (finalized) {
        emitAiStatus({ matchId, jobId, jobVersion: finalized.jobVersion, state: finalized.state });
        if (finalized.snapshot) emitMatchState({ matchId, snapshot: finalized.snapshot });
      }
      return;
    } else {
      const code = (err as { code?: string })?.code ?? 'DISCARDED';
      const retired = await setAiJobState(p, matchId, jobId, 'IDLE', code);
      if (retired !== null) emitAiStatus({ matchId, jobId, jobVersion: retired, state: 'IDLE' });
      console.info(`Nước AI cho ván ${matchId} bị bỏ:`, (err as Error)?.message ?? err);
      return;
    }
  }

}

/**
 * Undo move in VS_AI match:
 * Reverts to position before human's last move and cancels the in-flight AI search.
 */
export async function undoAiMatch(
  userId: string,
  matchId: string,
  pool?: pg.Pool,
): Promise<MatchSnapshot> {
  const p = pool ?? getPool();

  const { snapshot, aiState } = await withTransaction(async (client) => {
    // 1. Lock match
    const matchRes = await client.query(
      'SELECT * FROM public.matches WHERE id = $1 FOR UPDATE',
      [matchId],
    );
    if (matchRes.rowCount === 0) {
      throw { statusCode: 404, code: 'NOT_FOUND', message: 'Ván cờ không tồn tại' };
    }

    const m = matchRes.rows[0];
    if (m.mode !== 'AI' && m.mode !== 'VS_AI') {
      throw { statusCode: 400, code: 'BAD_REQUEST', message: 'Lệnh này chỉ dùng cho ván cờ với AI' };
    }
    if (m.status !== 'ACTIVE') {
      throw { statusCode: 409, code: 'MATCH_ENDED', message: 'Ván cờ đã kết thúc' };
    }

    const humanSide: Side = m.red_user_id === userId ? 'RED' : 'BLACK';
    const pos = parseJson<Position>(m.position)!;

    // 2. Effective branch from the canonical ancestry log (spec 09 §6.3). Audit rows of an
    // abandoned branch are never deleted here — only the active prefix and caches are rewritten.
    const branch = await loadActiveBranch(client, matchId, parseActiveMoveIds(m.active_move_ids));
    if (branch.length === 0) {
      throw { statusCode: 400, code: 'NO_MOVES_TO_UNDO', message: 'Chưa có nước đi nào để xin lại' };
    }

    // Target ply: rewind past the human's last move of the effective branch (the AI's reply
    // is dropped too when it already moved).
    let humanLastIndex = -1;
    for (let i = branch.length - 1; i >= 0; i--) {
      if (branch[i]!.side === humanSide) {
        humanLastIndex = i;
        break;
      }
    }
    const targetPly = humanLastIndex >= 0 ? humanLastIndex : 0;
    const rebuilt = rebuildEffectiveBranch(branch, targetPly);
    const removedMoveIds = branch.slice(targetPly).map((entry) => entry.id);

    const newVersion = Number(m.version) + 1;
    // Settle then keep the remaining times: undo never refunds clock (spec 03 §Undo).
    const settled = settleClock(parseJson<ClockState>(m.clock), pos.turn, Date.now());

    // 3. Update matches: position, active prefix and repetition cache together.
    await client.query(
      `UPDATE public.matches
       SET position = $1, version = $2, ply = $3, clock = $4,
           active_move_ids = $5::jsonb, repetition_counts = $6::jsonb, updated_at = now()
       WHERE id = $7`,
      [
        JSON.stringify(rebuilt.position),
        newVersion,
        rebuilt.activeMoveIds.length,
        settled?.clock ? JSON.stringify(settled.clock) : null,
        JSON.stringify(rebuilt.activeMoveIds),
        JSON.stringify(rebuilt.repetitionCounts),
        matchId,
      ],
    );

    // 4. Record the undo audit event (the abandoned branch stays in match_moves).
    await client.query(
      `INSERT INTO public.match_events (match_id, version, type, payload)
       VALUES ($1, $2, 'UNDO', $3)`,
      [
        matchId,
        newVersion,
        JSON.stringify({
          removedMoveIds,
          targetPly: rebuilt.activeMoveIds.length,
          requester: userId,
          approver: null,
        }),
      ],
    );

    // 6. Cancel/retire the AI job so the client stops showing a running search.
    const jobRes = await client.query(
      `UPDATE public.ai_jobs
       SET status = 'IDLE', completed_at = now(), job_version = job_version + 1, last_error_code = 'AI_CANCELLED'
       WHERE match_id = $1 AND status IN ('QUEUED', 'THINKING')
       RETURNING id, status, job_version`,
      [matchId],
    );
    let aiState: AiJobSnapshot;
    if (jobRes.rowCount === 1) {
      aiState = aiStateFromRow(jobRes.rows[0]);
    } else {
      const current = await client.query(
        'SELECT id, status, job_version FROM public.ai_jobs WHERE match_id = $1',
        [matchId],
      );
      aiState = current.rowCount === 1
        ? aiStateFromRow(current.rows[0])
        : { jobId: null, jobVersion: newVersion, state: 'IDLE' };
    }

    return {
      snapshot: toAiMatchSnapshot(
        {
          ...m,
          position: rebuilt.position,
          version: newVersion,
          ply: rebuilt.activeMoveIds.length,
          active_move_ids: rebuilt.activeMoveIds,
          clock: settled?.clock ?? m.clock,
        },
        aiState,
        [{ userId, online: true, disconnectDeadlineMs: null }],
      ),
      aiState,
    };
  }, p);

  // Only a committed undo cancels the search (a rejected undo must not strand the AI turn).
  // The shared cancel flag stops the worker's CPU loop; the version bump above already makes
  // any result that raced past the cancel stale.
  aiSupervisor.cancelJobForMatch(matchId);

  emitAiStatus({ matchId, jobId: aiState.jobId, jobVersion: aiState.jobVersion, state: aiState.state });
  emitMatchState({ matchId, snapshot });
  return snapshot;
}
