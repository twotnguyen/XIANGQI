/**
 * Room Rematch Service.
 * Handles rematch voting, side swapping, and clean match recreation.
 */
import crypto from 'node:crypto';
import type pg from 'pg';
import { getPool } from '../../db/pool.js';
import { withTransaction } from '../../db/transaction.js';
import { createInitialPosition } from '@xiangqi/game-rules';
import type { MatchSnapshot, ClockState } from '@xiangqi/contracts';

export async function voteRematch(
  userId: string,
  roomId: string,
  expectedMatchId: string,
  pool?: pg.Pool,
): Promise<{ voted: boolean; bothAccepted: boolean; newMatchSnapshot?: MatchSnapshot }> {
  const p = pool ?? getPool();

  return withTransaction(async (client) => {
    // 1. Lock room FOR UPDATE
    const roomRes = await client.query(
      'SELECT * FROM public.rooms WHERE id = $1 FOR UPDATE',
      [roomId],
    );
    if (roomRes.rowCount === 0) {
      throw { statusCode: 404, code: 'NOT_FOUND', message: 'Phòng không tồn tại' };
    }

    const room = roomRes.rows[0];
    if (room.current_match_id !== expectedMatchId) {
      throw { statusCode: 409, code: 'MATCH_ID_MISMATCH', message: 'Mã ván đấu không khớp' };
    }

    // 2. Fetch old match
    const oldMatchRes = await client.query(
      'SELECT * FROM public.matches WHERE id = $1',
      [expectedMatchId],
    );
    if (oldMatchRes.rowCount === 0) {
      throw { statusCode: 404, code: 'NOT_FOUND', message: 'Ván đấu không tồn tại' };
    }
    const oldMatch = oldMatchRes.rows[0];
    if (oldMatch.status !== 'FINISHED') {
      throw { statusCode: 409, code: 'MATCH_NOT_FINISHED', message: 'Ván đấu chưa kết thúc' };
    }

    // Check caller is a player in this match
    if (oldMatch.red_user_id !== userId && oldMatch.black_user_id !== userId) {
      throw { statusCode: 403, code: 'FORBIDDEN', message: 'Chỉ người chơi mới có quyền yêu cầu tái đấu' };
    }

    // 3. Record vote in room_rematch_votes (columns: room_id, match_id, user_id, created_at)
    await client.query(
      `INSERT INTO public.room_rematch_votes (room_id, match_id, user_id, created_at)
       VALUES ($1, $2, $3, now())
       ON CONFLICT (room_id, match_id, user_id) DO UPDATE SET created_at = now()`,
      [roomId, expectedMatchId, userId],
    );

    // 4. Check if both players accepted
    const votesRes = await client.query(
      'SELECT user_id FROM public.room_rematch_votes WHERE room_id = $1 AND match_id = $2',
      [roomId, expectedMatchId],
    );

    const voters = new Set(votesRes.rows.map((r) => r.user_id));
    const bothAccepted = voters.has(oldMatch.red_user_id) && voters.has(oldMatch.black_user_id);

    if (!bothAccepted) {
      return { voted: true, bothAccepted: false };
    }

    // 5. Both accepted! Create new match with swapped sides
    const newMatchId = crypto.randomUUID();
    const newRedUserId = oldMatch.black_user_id;
    const newBlackUserId = oldMatch.red_user_id;
    const initialPos = createInitialPosition();

    const timeControl = room.time_control;
    const clock: ClockState | null = timeControl > 0 ? {
      redMs: timeControl * 1000,
      blackMs: timeControl * 1000,
      runningSinceEpochMs: Date.now(),
    } : null;

    // 6. Insert new match
    await client.query(
      `INSERT INTO public.matches (
         id, room_id, mode, status, position, version, ply,
         red_user_id, black_user_id, time_control, clock
       ) VALUES ($1, $2, 'ONLINE', 'ACTIVE', $3, 0, 0, $4, $5, $6, $7)`,
      [
        newMatchId,
        roomId,
        JSON.stringify(initialPos),
        newRedUserId,
        newBlackUserId,
        timeControl,
        clock ? JSON.stringify(clock) : null,
      ],
    );

    // 7. Initial match event
    await client.query(
      `INSERT INTO public.match_events (match_id, version, type, payload)
       VALUES ($1, 0, 'INITIAL', $2)`,
      [newMatchId, JSON.stringify({ position: initialPos, clock })],
    );

    // 8. Update room: set current_match_id to newMatchId, status PLAYING
    await client.query(
      `UPDATE public.rooms
       SET current_match_id = $1, status = 'PLAYING', updated_at = now()
       WHERE id = $2`,
      [newMatchId, roomId],
    );

    // 9. Swap sides in room_members
    await client.query(
      `UPDATE public.room_members
       SET side = CASE WHEN user_id = $1 THEN 'RED' ELSE 'BLACK' END,
           ready = false
       WHERE room_id = $2 AND role = 'PLAYER'`,
      [newRedUserId, roomId],
    );

    // 10. Clear rematch votes
    await client.query(
      'DELETE FROM public.room_rematch_votes WHERE room_id = $1',
      [roomId],
    );

    // 11. Put both players back into active_players
    await client.query(
      `INSERT INTO public.active_players (user_id)
       VALUES ($1), ($2)
       ON CONFLICT (user_id) DO NOTHING`,
      [newRedUserId, newBlackUserId],
    );

    const newSnapshot: MatchSnapshot = {
      id: newMatchId,
      roomId,
      mode: 'ONLINE',
      status: 'ACTIVE',
      position: initialPos,
      version: 0,
      ply: 0,
      ruleSetVersion: 'xiangqi-simple-v1',
      redUserId: newRedUserId,
      blackUserId: newBlackUserId,
      aiSide: null,
      aiLevel: null,
      timeControl,
      clock: clock ?? { redMs: 0, blackMs: 0, runningSinceEpochMs: 0 },
      outcome: null,
      activeMoveIds: [],
      proposal: null,
      serverNowMs: Date.now(),
      aiState: null,
      presence: [
        { userId: newRedUserId, online: true, disconnectDeadlineMs: null },
        { userId: newBlackUserId, online: true, disconnectDeadlineMs: null },
      ],
    };

    return {
      voted: true,
      bothAccepted: true,
      newMatchSnapshot: newSnapshot,
    };
  }, p);
}
