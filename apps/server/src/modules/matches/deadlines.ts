/**
 * Deadline settlements, disconnect grace, and server boot recovery.
 * - 60s disconnect grace period
 * - Both offline -> INTERRUPTED / BOTH_OFFLINE
 * - Clock expiry -> TIMEOUT
 * - Boot recovery -> mark existing ACTIVE matches as INTERRUPTED / SERVER_RESTART
 */
import type pg from 'pg';
import { getPool } from '../../db/pool.js';
import { withTransaction } from '../../db/transaction.js';
import { settleClock } from './clock.js';
import type { Outcome, Position, Side, ClockState } from '@xiangqi/contracts';

export const DISCONNECT_GRACE_MS = 60000;

export async function settleMatchDeadlines(
  matchId: string,
  nowEpochMs: number = Date.now(),
  pool?: pg.Pool,
): Promise<{ finalized: boolean; outcome: Outcome | null }> {
  const p = pool ?? getPool();

  return withTransaction(async (client) => {
    const matchLookup = await client.query(
      'SELECT room_id FROM public.matches WHERE id = $1',
      [matchId],
    );
    if (matchLookup.rowCount === 0) return { finalized: false, outcome: null };
    const roomId = matchLookup.rows[0].room_id;

    if (roomId) {
      await client.query('SELECT id FROM public.rooms WHERE id = $1 FOR UPDATE', [roomId]);
    }
    const matchRes = await client.query(
      'SELECT * FROM public.matches WHERE id = $1 FOR UPDATE',
      [matchId],
    );
    const match = matchRes.rows[0];

    if (match.status !== 'ACTIVE') {
      return { finalized: false, outcome: null };
    }

    const pos = (typeof match.position === 'string' ? JSON.parse(match.position) : match.position) as Position;
    const clock = (match.clock ? (typeof match.clock === 'string' ? JSON.parse(match.clock) : match.clock) : null) as ClockState;

    // 1. Check clock expiry (TIMEOUT)
    if (clock) {
      const settle = settleClock(clock, pos.turn, nowEpochMs);
      if (settle && settle.expired) {
        const winningSide: Side = pos.turn === 'RED' ? 'BLACK' : 'RED';
        const outcome: Outcome = { winner: winningSide, reason: 'TIMEOUT' };
        await finalizeMatchTx(client, match, outcome, roomId, nowEpochMs);
        return { finalized: true, outcome };
      }
    }

    return { finalized: false, outcome: null };
  }, p);
}

export async function recoverActiveMatchesOnBoot(
  pool?: pg.Pool,
): Promise<number> {
  const p = pool ?? getPool();

  return withTransaction(async (client) => {
    // Find all ACTIVE matches that survived server restart
    const activeRes = await client.query(
      'SELECT id, room_id FROM public.matches WHERE status = \'ACTIVE\' FOR UPDATE',
    );

    const count = activeRes.rowCount ?? 0;
    if (count === 0) return 0;

    const outcome: Outcome = {
      winner: null,
      reason: 'SERVER_RESTART',
    };

    for (const match of activeRes.rows) {
      // 1. Mark match INTERRUPTED
      await client.query(
        `UPDATE public.matches
         SET status = 'INTERRUPTED', outcome = $1, ended_at = now()
         WHERE id = $2`,
        [JSON.stringify(outcome), match.id],
      );

      // 2. Release active players
      if (match.room_id) {
        await client.query(
          'DELETE FROM public.active_players WHERE room_id = $1',
          [match.room_id],
        );

        // 3. Mark room FINISHED
        await client.query(
          `UPDATE public.rooms
           SET status = 'FINISHED', updated_at = now()
           WHERE id = $1`,
          [match.room_id],
        );
      }

      // 4. Record event
      await client.query(
        `INSERT INTO public.match_events (match_id, version, type, payload)
         SELECT $1, version + 1, 'RESULT', $2
         FROM public.matches WHERE id = $1`,
        [match.id, JSON.stringify({ outcome, actorKey: null })],
      );
    }

    return count;
  }, p);
}

async function finalizeMatchTx(
  client: pg.PoolClient,
  match: { id: string; version: number },
  outcome: Outcome,
  roomId: string | null,
  nowEpochMs: number,
): Promise<void> {
  const newVersion = match.version + 1;

  await client.query(
    `UPDATE public.matches
     SET status = 'FINISHED', outcome = $1, version = $2, ended_at = now()
     WHERE id = $3`,
    [JSON.stringify(outcome), newVersion, match.id],
  );

  if (roomId) {
    await client.query('DELETE FROM public.active_players WHERE room_id = $1', [roomId]);
    await client.query(
      `UPDATE public.rooms SET status = 'FINISHED', updated_at = now() WHERE id = $1`,
      [roomId],
    );
  }

  await client.query(
    `INSERT INTO public.match_events (match_id, version, type, payload)
     VALUES ($1, $2, 'RESULT', $3)`,
    [match.id, newVersion, JSON.stringify({ outcome, actorKey: null, settledAtMs: nowEpochMs })],
  );
}
