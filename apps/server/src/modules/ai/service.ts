/**
 * AI Match domain service.
 * Manages human-vs-machine games, capacity reservation, and authoritative move dispatch.
 */
import crypto from 'node:crypto';
import type pg from 'pg';
import { getPool } from '../../db/pool.js';
import { withTransaction } from '../../db/transaction.js';
import { aiSupervisor } from '@xiangqi/ai-worker';
import { getLevelConfig } from '@xiangqi/ai';
import { createInitialPosition } from '@xiangqi/game-rules';
import { submitMove } from '../matches/service.js';
import { rebuildActiveBranch } from '../matches/undo.js';
import type {
  Side,
  AiLevel,
  TimeControl,
  Position,
  ClockState,
  MatchSnapshot,
} from '@xiangqi/contracts';

export const AI_ACTOR_ID = '00000000-0000-0000-0000-000000000001';

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
    throw { statusCode: 503, code: 'AI_BUSY', message: 'Hệ thống AI đang quá tải, vui lòng thử lại sau' };
  }

  const p = pool ?? getPool();

  try {
    return await withTransaction(async (client) => {
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
      const aiSide = humanSide === 'RED' ? 'BLACK' : 'RED';
      const dbRedUserId = humanSide === 'RED' ? userId : null;
      const dbBlackUserId = humanSide === 'BLACK' ? userId : null;
      const redUserId = humanSide === 'RED' ? userId : AI_ACTOR_ID;
      const blackUserId = humanSide === 'BLACK' ? userId : AI_ACTOR_ID;

      const clock: ClockState | null = timeControl > 0 ? {
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
          clock ? JSON.stringify(clock) : null,
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
        [matchId, JSON.stringify({ position: initialPos, clock })],
      );

      const snapshot: MatchSnapshot = {
        id: matchId,
        roomId: null,
        mode: 'AI',
        status: 'ACTIVE',
        position: initialPos,
        version: 0,
        ply: 0,
        ruleSetVersion: 'xiangqi-simple-v1',
        redUserId,
        blackUserId,
        aiSide: humanSide === 'RED' ? 'BLACK' : 'RED',
        aiLevel: level,
        timeControl,
        clock: clock ?? { redMs: 0, blackMs: 0, runningSinceEpochMs: 0 },
        outcome: null,
        activeMoveIds: [],
        proposal: null,
        serverNowMs: Date.now(),
        aiState: {
          jobId: null,
          jobVersion: 0,
          state: humanSide === 'BLACK' ? 'QUEUED' : 'IDLE',
        },
        presence: [
          { userId, online: true, disconnectDeadlineMs: null },
        ],
      };

      // 5. If AI is RED, trigger AI first move asynchronously after transaction commits
      if (humanSide === 'BLACK') {
        setImmediate(() => {
          triggerAiTurn(matchId, initialPos, 0, level, clock, {});
        });
      }

      return snapshot;
    }, p);
  } finally {
    aiSupervisor.releaseReservation(reservationToken);
  }
}

/**
 * Triggers AI search in worker, then commits move to match pipeline.
 * Discards stale results if match version changed (e.g. human undo).
 */
export async function triggerAiTurn(
  matchId: string,
  position: Position,
  expectedVersion: number,
  level: AiLevel,
  clock: ClockState | null,
  repetitionCounts: Record<string, number>,
): Promise<void> {
  const jobId = crypto.randomUUID();
  const levelConfig = getLevelConfig(level);

  // Budget: min(levelBudget, remainingMs - 50), floor 0
  let budgetMs = levelConfig.timeBudgetMs;
  if (clock) {
    const remaining = position.turn === 'RED' ? clock.redMs : clock.blackMs;
    const safeRemaining = Math.max(0, remaining - 50);
    budgetMs = Math.min(budgetMs, safeRemaining);
  }

  const deadlineMonoMs = performance.now() + budgetMs;

  try {
    const searchRes = await aiSupervisor.submitSearch(
      jobId,
      matchId,
      expectedVersion,
      {
        position,
        repetitionCounts,
        maxDepth: levelConfig.maxDepth,
        deadlineMonoMs,
        algorithm: 'ALPHA_BETA',
        seed: Date.now(),
      },
    );

    if (!searchRes.move) {
      console.warn(`AI found no move for match ${matchId}`);
      return;
    }

    // Submit move via authoritative pipeline
    await submitMove(
      AI_ACTOR_ID,
      matchId,
      {
        commandId: crypto.randomUUID(),
        expectedVersion,
        payload: searchRes.move,
      },
    );
  } catch (err: unknown) {
    // If version changed (e.g. human undo during search), submitMove will throw VERSION_CONFLICT -> discard stale safely
    console.info(`AI move for match ${matchId} completed or discarded:`, (err as Error)?.message ?? err);
  }
}

/**
 * Undo move in VS_AI match:
 * Reverts to position before human's last move.
 * Cancels active AI search.
 */
export async function undoAiMatch(
  userId: string,
  matchId: string,
  pool?: pg.Pool,
): Promise<MatchSnapshot> {
  // 1. Cancel in-flight AI job
  aiSupervisor.cancelJobForMatch(matchId);

  const p = pool ?? getPool();

  return withTransaction(async (client) => {
    // 2. Lock match
    const matchRes = await client.query(
      'SELECT * FROM public.matches WHERE id = $1 FOR UPDATE',
      [matchId],
    );
    if (matchRes.rowCount === 0) {
      throw { statusCode: 404, code: 'NOT_FOUND', message: 'Ván cờ không tồn tại' };
    }

    const m = matchRes.rows[0];
    if (m.mode !== 'VS_AI') {
      throw { statusCode: 400, code: 'BAD_REQUEST', message: 'Lệnh này chỉ dùng cho ván cờ với AI' };
    }
    if (m.status !== 'ACTIVE') {
      throw { statusCode: 409, code: 'MATCH_ENDED', message: 'Ván cờ đã kết thúc' };
    }

    const humanSide: Side = m.red_user_id === userId ? 'RED' : 'BLACK';
    const pos = m.position as Position;

    // 3. Fetch moves
    const movesRes = await client.query(
      'SELECT * FROM public.moves WHERE match_id = $1 ORDER BY move_number ASC',
      [matchId],
    );
    const moves = movesRes.rows;
    if (moves.length === 0) {
      throw { statusCode: 400, code: 'NO_MOVES_TO_UNDO', message: 'Chưa có nước đi nào để xin lại' };
    }

    // Target ply calculation:
    // If current turn is AI's turn (human just moved) -> revert 1 ply
    // If current turn is human's turn (AI responded) -> revert 2 plies
    const targetPly = pos.turn !== humanSide ? Math.max(0, m.ply - 1) : Math.max(0, m.ply - 2);

    const { position: revertedPos } = rebuildActiveBranch(moves, targetPly);

    const newVersion = m.version + 1;

    // 4. Update matches
    await client.query(
      `UPDATE public.matches
       SET position = $1, version = $2, ply = $3, updated_at = now()
       WHERE id = $4`,
      [JSON.stringify(revertedPos), newVersion, targetPly, matchId],
    );

    // 5. Delete undone moves
    await client.query(
      'DELETE FROM public.moves WHERE match_id = $1 AND move_number > $2',
      [matchId, targetPly],
    );

    // 6. Record match event
    await client.query(
      `INSERT INTO public.match_events (match_id, version, type, payload)
       VALUES ($1, $2, 'UNDO', $3)`,
      [matchId, newVersion, JSON.stringify({ targetPly, position: revertedPos })],
    );

    return {
      id: matchId,
      roomId: null,
      mode: 'AI',
      status: 'ACTIVE',
      position: revertedPos,
      version: newVersion,
      ply: targetPly,
      ruleSetVersion: 'xiangqi-simple-v1',
      redUserId: m.red_user_id,
      blackUserId: m.black_user_id,
      aiSide: m.red_user_id === AI_ACTOR_ID ? 'RED' : 'BLACK',
      aiLevel: m.ai_level,
      timeControl: m.time_control,
      clock: m.clock,
      outcome: null,
      activeMoveIds: [],
      proposal: null,
      serverNowMs: Date.now(),
      aiState: {
        jobId: null,
        jobVersion: newVersion,
        state: 'IDLE',
      },
      presence: [
        { userId, online: true, disconnectDeadlineMs: null },
      ],
    };
  }, p);
}
