/**
 * Match history and replay service.
 * Enforces participant-only access and effective move ancestry reconstruction.
 */
import type pg from 'pg';
import { getPool } from '../../db/pool.js';
import { createInitialPosition, applyMove } from '@xiangqi/game-rules';
import type { Position, Move, Outcome } from '@xiangqi/contracts';
import { loadActiveBranch, parseActiveMoveIds } from '../matches/undo.js';

export interface MatchSummaryDTO {
  id: string;
  roomId: string | null;
  mode: 'ONLINE' | 'AI';
  status: string;
  redUserId: string | null;
  blackUserId: string | null;
  redUsername?: string;
  blackUsername?: string;
  outcome: Outcome | null;
  ply: number;
  createdAt: string;
  finishedAt: string | null;
}

export interface ReplayPly {
  ply: number;
  move: Move | null;
  position: Position;
}

export interface MatchReplayDTO {
  id: string;
  mode: 'ONLINE' | 'AI';
  redUserId: string | null;
  blackUserId: string | null;
  outcome: Outcome | null;
  /** Initial position persisted by the START event (spec 09 §11). */
  initialPosition: Position;
  /** Moves of the effective branch in ply order (spec 04 replay payload). */
  effectiveMoves: Move[];
  /** Number of UNDO events committed for this match. */
  undoCount: number;
  /** Derived ply-by-ply projection consumed by the existing replay UI. */
  plies: ReplayPly[];
}

function readStoredInitialPosition(payload: unknown): Position | null {
  const parsed: unknown = typeof payload === 'string' ? JSON.parse(payload) : payload;
  if (!parsed || typeof parsed !== 'object' || !('initialPosition' in parsed)) return null;
  const candidate: unknown = parsed.initialPosition;
  if (!candidate || typeof candidate !== 'object') return null;
  if (!('board' in candidate) || !('turn' in candidate)) return null;
  const board: unknown = candidate.board;
  const turn: unknown = candidate.turn;
  if (!Array.isArray(board) || board.length !== 90) return null;
  if (turn !== 'RED' && turn !== 'BLACK') return null;
  // Shape validated above (90 board slots + legal turn); the cast only names it.
  return candidate as Position;
}

/**
 * Get matches participated in by the user.
 * Stranger cannot view private history (participant-only per spec).
 */
export async function getMatchHistory(
  userId: string,
  limit = 20,
  pool?: pg.Pool,
): Promise<MatchSummaryDTO[]> {
  const p = pool ?? getPool();
  const client = await p.connect();

  try {
    const res = await client.query(
      `SELECT m.id, m.room_id, m.mode, m.status, m.red_user_id, m.black_user_id,
              m.outcome, m.ply, m.created_at, m.updated_at,
              pr.username as red_username, pb.username as black_username
       FROM public.matches m
       LEFT JOIN public.profiles pr ON pr.id = m.red_user_id
       LEFT JOIN public.profiles pb ON pb.id = m.black_user_id
       WHERE m.red_user_id = $1 OR m.black_user_id = $1
       ORDER BY m.created_at DESC
       LIMIT $2`,
      [userId, limit],
    );

    return res.rows.map((r) => ({
      id: r.id,
      roomId: r.room_id,
      mode: r.mode,
      status: r.status,
      redUserId: r.red_user_id,
      blackUserId: r.black_user_id,
      redUsername: r.red_username,
      blackUsername: r.black_username,
      outcome: r.outcome ? (typeof r.outcome === 'string' ? JSON.parse(r.outcome) : r.outcome) : null,
      ply: r.ply,
      createdAt: r.created_at,
      finishedAt: r.status === 'FINISHED' ? r.updated_at : null,
    }));
  } finally {
    client.release();
  }
}

/**
 * Reconstruct match replay plies.
 * Only reconstructs effective moves (excluding moves purged by undo).
 */
export async function getMatchReplay(
  userId: string,
  matchId: string,
  pool?: pg.Pool,
): Promise<MatchReplayDTO> {
  const p = pool ?? getPool();
  const client = await p.connect();

  try {
    // 1. Fetch match and verify participant or viewer access
    const matchRes = await client.query(
      'SELECT * FROM public.matches WHERE id = $1',
      [matchId],
    );
    if (matchRes.rowCount === 0) {
      throw { statusCode: 404, code: 'NOT_FOUND', message: 'Ván cờ không tồn tại' };
    }

    const m = matchRes.rows[0];
    const isParticipant = m.red_user_id === userId || m.black_user_id === userId;

    // If room match, check if user was a spectator in that room
    if (!isParticipant && m.room_id) {
      const memberRes = await client.query(
        'SELECT 1 FROM public.room_members WHERE room_id = $1 AND user_id = $2',
        [m.room_id, userId],
      );
      if (memberRes.rowCount === 0) {
        throw { statusCode: 403, code: 'FORBIDDEN', message: 'Bạn không có quyền xem lại ván cờ này' };
      }
    } else if (!isParticipant) {
      throw { statusCode: 403, code: 'FORBIDDEN', message: 'Bạn không có quyền xem lại ván cờ này' };
    }

    // 2. Initial position comes from the START event so an old match replays with the
    //    board/rules it was created under (spec 09 §11).
    const startRes = await client.query(
      `SELECT payload FROM public.match_events
       WHERE match_id = $1 AND type = 'START'
       ORDER BY version ASC LIMIT 1`,
      [matchId],
    );
    const initialPosition =
      (startRes.rowCount ?? 0) > 0
        ? readStoredInitialPosition(startRes.rows[0].payload) ?? createInitialPosition()
        : createInitialPosition();

    // 3. Effective branch only: walk match_moves ancestry from the active tip, so replay
    //    never shows a branch abandoned by undo (F-02b/F-18, ISSUE-027).
    const branch = await loadActiveBranch(
      client,
      matchId,
      parseActiveMoveIds(m.active_move_ids),
    );
    const effectiveMoves: Move[] = branch.map((entry) => entry.move);

    const undoRes = await client.query(
      `SELECT count(*)::int AS undo_count FROM public.match_events
       WHERE match_id = $1 AND type = 'UNDO'`,
      [matchId],
    );

    // 4. Ply-by-ply projection derived from the same effective branch (replay UI).
    let currentPos = initialPosition;
    const plies: ReplayPly[] = [
      { ply: 0, move: null, position: currentPos },
    ];

    for (const move of effectiveMoves) {
      currentPos = applyMove(currentPos, move);
      plies.push({
        ply: plies.length,
        move,
        position: currentPos,
      });
    }

    return {
      id: matchId,
      mode: m.mode,
      redUserId: m.red_user_id,
      blackUserId: m.black_user_id,
      outcome: m.outcome ? (typeof m.outcome === 'string' ? JSON.parse(m.outcome) : m.outcome) : null,
      initialPosition,
      effectiveMoves,
      undoCount: undoRes.rows[0].undo_count,
      plies,
    };
  } finally {
    client.release();
  }
}
