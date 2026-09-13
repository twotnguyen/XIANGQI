/**
 * Authoritative match service.
 * Pipeline: lock order (room → match) → receipts → turn/version check → move validate/apply → terminal → commit → broadcast.
 */
import crypto from 'node:crypto';
import type pg from 'pg';
import { getPool } from '../../db/pool.js';
import { withTransaction } from '../../db/transaction.js';
import {
  createInitialPosition,
  validateMove,
  applyMove,
  getTerminalOutcome,
  positionKey,
} from '@xiangqi/game-rules';
import type {
  MatchSnapshot,
  CommandResult,
  MatchCommand,
  Move,
  Outcome,
  Position,
  Side,
  TimeControl,
  ClockState,
} from '@xiangqi/contracts';
import { squareToIndex } from '@xiangqi/contracts';
import { matchBroadcaster } from '../../realtime/broadcast.js';
import { loadMatchPresence } from '../../realtime/presence.js';
import { emitMatchState, emitRoomUpdated } from '../../realtime/events.js';
import { getRoom } from '../rooms/service.js';
import { endMatchMedia } from '../media/service.js';
import { settleClock, projectClock } from './clock.js';
import { settleMatchDeadlines } from './deadlines.js';
import {
  loadActiveBranch,
  parseActiveMoveIds,
  rebuildFromAncestry,
} from './undo.js';

const AI_ACTOR_ID = '00000000-0000-0000-0000-000000000001';

/** Structural board comparison: jsonb key order makes JSON.stringify unusable here. */
function samePosition(a: Position, b: Position): boolean {
  if (a.turn !== b.turn || a.board.length !== b.board.length) return false;
  for (let i = 0; i < a.board.length; i++) {
    const x = a.board[i];
    const y = b.board[i];
    if (x === null || y === null) {
      if (x !== y) return false;
      continue;
    }
    if (x.id !== y.id || x.type !== y.type || x.side !== y.side) return false;
  }
  return true;
}

export function hashPayload(payload: unknown): string {
  return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

export async function startMatchFromRoom(
  roomId: string,
  pool?: pg.Pool,
): Promise<MatchSnapshot> {
  const p = pool ?? getPool();

  const result = await withTransaction(async (client) => {
    // 1. Lock room
    const roomRes = await client.query(
      'SELECT * FROM public.rooms WHERE id = $1 FOR UPDATE',
      [roomId],
    );
    if (roomRes.rowCount === 0) {
      throw { statusCode: 404, code: 'NOT_FOUND', message: 'Phòng không tồn tại' };
    }
    const room = roomRes.rows[0];

    // 2. Verify 2 ready players
    const membersRes = await client.query(
      'SELECT user_id, side, ready FROM public.room_members WHERE room_id = $1 AND role = \'PLAYER\'',
      [roomId],
    );
    if (membersRes.rowCount !== 2) {
      throw { statusCode: 409, code: 'CONFLICT', message: 'Cần đủ 2 người chơi' };
    }

    const redMember = membersRes.rows.find((m) => m.side === 'RED' && m.ready);
    const blackMember = membersRes.rows.find((m) => m.side === 'BLACK' && m.ready);

    if (!redMember || !blackMember) {
      throw { statusCode: 409, code: 'CONFLICT', message: 'Cả hai người chơi phải sẵn sàng' };
    }

    const matchId = crypto.randomUUID();
    const initialPos = createInitialPosition();
    const timeControl = room.time_control as TimeControl;
    const initialKey = positionKey(initialPos);

    // Initial clock
    const clock = timeControl > 0 ? {
      redMs: timeControl * 1000,
      blackMs: timeControl * 1000,
      runningSinceEpochMs: Date.now(),
    } : null;

    // 3. Insert matches row (status ACTIVE, version 0, ply 0)
    await client.query(
      `INSERT INTO public.matches (
         id, room_id, mode, status, position, version, ply,
         rule_set_version, red_user_id, black_user_id, time_control,
         clock, server_now_ms
       ) VALUES (
         $1, $2, 'ONLINE', 'ACTIVE', $3, 0, 0,
         'xiangqi-simple-v1', $4, $5, $6,
         $7, $8
       )`,
      [
        matchId,
        roomId,
        JSON.stringify(initialPos),
        redMember.user_id,
        blackMember.user_id,
        timeControl,
        clock ? JSON.stringify(clock) : null,
        Date.now(),
      ],
    );

    // 4. Update room: status PLAYING, current_match_id
    await client.query(
      `UPDATE public.rooms
       SET status = 'PLAYING', current_match_id = $1, room_version = room_version + 1, updated_at = now()
       WHERE id = $2`,
      [matchId, roomId],
    );

    // 5. Insert initial match_event version 0
    await client.query(
      `INSERT INTO public.match_events (match_id, version, type, payload)
       VALUES ($1, 0, 'START', $2)`,
      [matchId, JSON.stringify({ initialPosition: initialPos, key: initialKey })],
    );

    // 6. Point both players' control context at the new match in the same transaction
    //    (spec 03 §AI job và control lifecycle): presence/deadline rows must cover the
    //    ACTIVE match, not just the room.
    await client.query(
      `UPDATE public.client_controls
          SET match_id = $1, room_id = $2, updated_at = now()
        WHERE user_id = ANY($3::uuid[])`,
      [matchId, roomId, [redMember.user_id, blackMember.user_id]],
    );

    return {
      snapshot: await getMatchSnapshotFromClient(client, matchId),
      starterId: redMember.user_id as string,
    };
  }, p);

  // After commit: the room is PLAYING with a fresh current_match_id, so members can
  // transition from the waiting screen without polling. A failed push is recovered by the
  // next `room:subscribe`/sync read.
  try {
    emitRoomUpdated({ roomId, room: await getRoom(roomId, result.starterId) });
  } catch {
    // The match is committed; the room push is best-effort.
  }
  emitMatchState({ matchId: result.snapshot.id, snapshot: result.snapshot });
  return result.snapshot;
}

export async function submitMove(
  userId: string,
  matchId: string,
  command: MatchCommand<Move>,
  headers?: { controlId?: string; controlEpoch?: string },
  pool?: pg.Pool,
): Promise<CommandResult> {
  const p = pool ?? getPool();
  let snapshotToBroadcast: MatchSnapshot | null = null;
  let countsToBroadcast: Record<string, number> | null = null;

  const result = await withTransaction(async (client) => {
    // 1. Determine room_id first to establish lock order
    const matchLookup = await client.query(
      'SELECT room_id FROM public.matches WHERE id = $1',
      [matchId],
    );
    if (matchLookup.rowCount === 0) {
      throw { statusCode: 404, code: 'NOT_FOUND', message: 'Ván cờ không tồn tại' };
    }
    const roomId = matchLookup.rows[0].room_id;

    // Lock order: room FOR UPDATE → match FOR UPDATE per spec
    if (roomId) {
      await client.query('SELECT id FROM public.rooms WHERE id = $1 FOR UPDATE', [roomId]);
    }
    const matchRes = await client.query(
      'SELECT * FROM public.matches WHERE id = $1 FOR UPDATE',
      [matchId],
    );
    const match = matchRes.rows[0];

    // 2. Check command_receipts for deduplication
    const payloadHash = hashPayload(command.payload);
    const receiptRes = await client.query(
      'SELECT * FROM public.command_receipts WHERE match_id = $1 AND command_id = $2',
      [matchId, command.commandId],
    );

    if (receiptRes.rowCount! > 0) {
      const receipt = receiptRes.rows[0];
      // Check if exact same command
      if (
        receipt.command_type === 'MOVE' &&
        receipt.expected_version === command.expectedVersion &&
        receipt.payload_hash === payloadHash
      ) {
        // Idempotent retry: return original appliedVersion + fresh snapshot projection
        const currentSnapshot = await getMatchSnapshotFromClient(client, matchId);
        return {
          appliedVersion: receipt.applied_version,
          snapshot: currentSnapshot,
        };
      }
      // Different payload or parameters with same commandId → COMMAND_ID_REUSED
      throw { statusCode: 409, code: 'COMMAND_ID_REUSED', message: 'Mã lệnh đã được sử dụng với nội dung khác' };
    }

    // 3. Match status must be ACTIVE
    if (match.status !== 'ACTIVE') {
      throw { statusCode: 409, code: 'MATCH_ENDED', message: 'Ván cờ đã kết thúc' };
    }

    // 4. Expected version must match current match version
    if (command.expectedVersion !== Number(match.version)) {
      throw { statusCode: 409, code: 'VERSION_CONFLICT', message: 'Trạng thái ván cờ đã thay đổi, vui lòng đồng bộ lại' };
    }

    // 5. Turn check: verify current turn matches user
    const pos = (typeof match.position === 'string' ? JSON.parse(match.position) : match.position) as Position;
    const expectedUser = pos.turn === 'RED' ? match.red_user_id : match.black_user_id;

    const isAiTurn = match.mode === 'AI' && match.ai_side === pos.turn;
    const isAuthorized = isAiTurn ? userId === AI_ACTOR_ID : expectedUser === userId;

    if (!isAuthorized) {
      throw { statusCode: 403, code: 'NOT_YOUR_TURN', message: 'Chưa tới lượt đi của bạn' };
    }

    const nowMs = Date.now();

    // 5b. Settle clock for side-to-move
    const currentClock = match.clock
      ? (typeof match.clock === 'string' ? JSON.parse(match.clock) : match.clock)
      : null;
    const settled = settleClock(currentClock, pos.turn, nowMs);

    if (settled && settled.expired) {
      // Clock ran out! Reject move and finalize as TIMEOUT through the shared finalizer.
      const winningSide: Side = pos.turn === 'RED' ? 'BLACK' : 'RED';
      const timeoutOutcome: Outcome = { winner: winningSide, reason: 'TIMEOUT' };
      const newVersion = await finalizeMatchTx(client, match, timeoutOutcome, roomId, {
        clock: settled.clock,
      });

      const finalSnapshot = await getMatchSnapshotFromClient(client, matchId);
      snapshotToBroadcast = finalSnapshot;
      return {
        appliedVersion: newVersion,
        snapshot: finalSnapshot,
      };
    }

    // 6. Validate move using pure game-rules
    const moveValidation = validateMove(pos, command.payload);
    if (!moveValidation.valid) {
      throw { statusCode: 400, code: 'INVALID_MOVE', message: moveValidation.reason };
    }

    // 7. Rebuild the effective branch (spec 09 §6.3 ancestry) and verify it against the
    //    persisted snapshot. Repetition is counted on this branch only — never by scanning
    //    match_events, because abandoned branches stay in the log as audit (F-02).
    const activeIds = parseActiveMoveIds(match.active_move_ids);
    const branch = await loadActiveBranch(client, matchId, activeIds);
    const effective = rebuildFromAncestry(branch);

    if (
      effective.activeMoveIds.length !== Number(match.ply) ||
      !samePosition(effective.position, pos)
    ) {
      throw {
        statusCode: 409,
        code: 'CONFLICT',
        message: 'Nhánh nước đi hiệu lực không khớp với snapshot ván cờ',
      };
    }

    // 8. Apply the move on the verified effective branch
    const nextPos = applyMove(effective.position, command.payload);
    const nextKey = positionKey(nextPos);
    const occurrences = (effective.repetitionCounts[nextKey] ?? 0) + 1;
    const outcome: Outcome | null = getTerminalOutcome(nextPos, occurrences);
    const newVersion = match.version + 1;
    const parentMoveId =
      effective.activeMoveIds.length > 0
        ? effective.activeMoveIds[effective.activeMoveIds.length - 1]!
        : null;

    // 9. Snapshot of the resulting branch: append the new move to the active prefix
    const moveId = crypto.randomUUID();
    const nextActiveIds = [...effective.activeMoveIds, moveId];
    const nextCounts = { ...effective.repetitionCounts, [nextKey]: occurrences };
    const moverPiece = effective.position.board[squareToIndex(command.payload.from)]!;

    // 10. Append exactly one immutable MOVE event carrying the move ancestry, then the
    //     canonical match_moves row (event_version FK is deferred to commit).
    await client.query(
      `INSERT INTO public.match_events (match_id, version, type, payload)
       VALUES ($1, $2, 'MOVE', $3)`,
      [
        matchId,
        newVersion,
        JSON.stringify({
          moveId,
          parentMoveId,
          side: moverPiece.side,
          move: command.payload,
          ...(outcome ? { outcome } : {}),
        }),
      ],
    );

    await client.query(
      `INSERT INTO public.match_moves (id, match_id, parent_move_id, event_version, side, move)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        moveId,
        matchId,
        parentMoveId,
        newVersion,
        moverPiece.side,
        JSON.stringify(command.payload),
      ],
    );

    // 11. Update the snapshot: position/ply/activeMoveIds/repetition cache move together.
    //     A terminal move writes its MOVE event (above, carrying the outcome) and lets the
    //     shared finalizer own the terminal columns/version — never a second finalizer, and
    //     never two version bumps.
    const clockJson = settled?.clock ? JSON.stringify(settled.clock) : null;

    if (outcome) {
      await finalizeMatchTx(client, match, outcome, roomId, {
        position: nextPos,
        ply: nextActiveIds.length,
        clock: settled?.clock ?? null,
        activeMoveIds: nextActiveIds,
        repetitionCounts: nextCounts,
        appendResultEvent: false,
      });
    } else {
      // Per spec: any new move automatically invalidates pending proposal
      await client.query(
        `UPDATE public.matches
         SET position = $1, version = $2, ply = $3, clock = $4, proposal = NULL,
             active_move_ids = $5::jsonb, repetition_counts = $6::jsonb, updated_at = now()
         WHERE id = $7`,
        [
          JSON.stringify(nextPos),
          newVersion,
          nextActiveIds.length,
          clockJson,
          JSON.stringify(nextActiveIds),
          JSON.stringify(nextCounts),
          matchId,
        ],
      );
    }

    countsToBroadcast = nextCounts;

    // 13. Record command receipt
    const finalSnapshot = await getMatchSnapshotFromClient(client, matchId);
    await client.query(
      `INSERT INTO public.command_receipts (
         match_id, command_id, command_type, expected_version,
         payload_hash, applied_version, response_snapshot
       ) VALUES ($1, $2, 'MOVE', $3, $4, $5, $6)`,
      [
        matchId,
        command.commandId,
        command.expectedVersion,
        payloadHash,
        newVersion,
        JSON.stringify(finalSnapshot),
      ],
    );

    snapshotToBroadcast = finalSnapshot;
    return {
      appliedVersion: newVersion,
      snapshot: finalSnapshot,
    };
  }, p);

  // 14. Emit broadcast after commit (outside transaction)
  if (snapshotToBroadcast) {
    const snap = snapshotToBroadcast as MatchSnapshot;
    matchBroadcaster.emit(matchId, snap);
    if (snap.status !== 'ACTIVE') releaseMatchMedia(matchId);

    // If AI match and next turn belongs to AI: trigger AI turn
    if (
      snap.mode === 'AI' &&
      snap.status === 'ACTIVE' &&
      snap.aiSide === snap.position.turn &&
      snap.aiLevel
    ) {
      // Static import would create a matches/service ⇄ ai/service module cycle.
      const { triggerAiTurn } = await import('../ai/service.js');
      triggerAiTurn(
        matchId,
        snap.position,
        snap.version,
        snap.aiLevel,
        snap.clock,
        countsToBroadcast ?? {},
      ).catch((err) => console.error('AI turn trigger error:', err));
    }
  }

  return result;
}

export async function resignMatch(
  userId: string,
  matchId: string,
  command: MatchCommand<Record<string, never>>,
  pool?: pg.Pool,
): Promise<CommandResult> {
  const p = pool ?? getPool();
  let snapshotToBroadcast: MatchSnapshot | null = null;

  const result = await withTransaction(async (client) => {
    const matchLookup = await client.query(
      'SELECT room_id FROM public.matches WHERE id = $1',
      [matchId],
    );
    if (matchLookup.rowCount === 0) {
      throw { statusCode: 404, code: 'NOT_FOUND', message: 'Ván cờ không tồn tại' };
    }
    const roomId = matchLookup.rows[0].room_id;

    if (roomId) {
      await client.query('SELECT id FROM public.rooms WHERE id = $1 FOR UPDATE', [roomId]);
    }
    const matchRes = await client.query(
      'SELECT * FROM public.matches WHERE id = $1 FOR UPDATE',
      [matchId],
    );
    const match = matchRes.rows[0];

    // Check receipts
    const payloadHash = hashPayload(command.payload);
    const receiptRes = await client.query(
      'SELECT * FROM public.command_receipts WHERE match_id = $1 AND command_id = $2',
      [matchId, command.commandId],
    );
    if (receiptRes.rowCount! > 0) {
      const receipt = receiptRes.rows[0];
      if (
        receipt.command_type === 'RESIGN' &&
        receipt.expected_version === command.expectedVersion &&
        receipt.payload_hash === payloadHash
      ) {
        return {
          appliedVersion: receipt.applied_version,
          snapshot: await getMatchSnapshotFromClient(client, matchId),
        };
      }
      throw { statusCode: 409, code: 'COMMAND_ID_REUSED', message: 'Mã lệnh đã được sử dụng' };
    }

    if (match.status !== 'ACTIVE') {
      throw { statusCode: 409, code: 'MATCH_ENDED', message: 'Ván cờ đã kết thúc' };
    }

    if (command.expectedVersion !== match.version) {
      throw { statusCode: 409, code: 'VERSION_CONFLICT', message: 'Trạng thái ván cờ đã thay đổi' };
    }

    // Determine who is resigning
    const resigningSide: Side = match.red_user_id === userId ? 'RED' : 'BLACK';
    const winningSide: Side = resigningSide === 'RED' ? 'BLACK' : 'RED';
    const outcome: Outcome = { winner: winningSide, reason: 'RESIGN' };

    // Finalize match and release slots through the shared terminal path.
    const newVersion = await finalizeMatchTx(client, match, outcome, roomId, { actorKey: userId });

    const finalSnapshot = await getMatchSnapshotFromClient(client, matchId);
    await client.query(
      `INSERT INTO public.command_receipts (
         match_id, command_id, command_type, expected_version,
         payload_hash, applied_version, response_snapshot
       ) VALUES ($1, $2, 'RESIGN', $3, $4, $5, $6)`,
      [
        matchId,
        command.commandId,
        command.expectedVersion,
        payloadHash,
        newVersion,
        JSON.stringify(finalSnapshot),
      ],
    );

    snapshotToBroadcast = finalSnapshot;
    return {
      appliedVersion: newVersion,
      snapshot: finalSnapshot,
    };
  }, p);

  if (snapshotToBroadcast) {
    matchBroadcaster.emit(matchId, snapshotToBroadcast);
    releaseMatchMedia(matchId);
  }

  return result;
}

/**
 * After an ONLINE match reaches a terminal status, its media transports are retired
 * (spec 06 §Cleanup). Fire-and-forget: the committed result is never rolled back by an
 * SFU failure, and a failed deletion leaves the tuple ROTATING for the media retry job.
 */
function releaseMatchMedia(matchId: string): void {
  void endMatchMedia(matchId).catch(() => undefined);
}

export interface FinalizeMatchExtras {
  /** Terminal match columns written in the same statement as the terminal status. */
  position?: Position;
  ply?: number;
  clock?: ClockState | null;
  activeMoveIds?: string[];
  repetitionCounts?: Record<string, number>;
  /** false when the caller already appended the terminal event (a terminal MOVE). */
  appendResultEvent?: boolean;
  actorKey?: string | null;
}

/**
 * The single match finalizer (spec 03 §"Finalizer chung"): status, outcome, version bump,
 * `ended_at`, proposal clear, terminal event, `active_players` release and the guarded
 * `rooms.status = FINISHED`. Callers must already hold the room → match locks (AI: match
 * only) and pass the `MatchCommand`/deadline-specific columns through `extras`.
 */
export async function finalizeMatchTx(
  client: pg.PoolClient,
  match: { id: string; version: number | string },
  outcome: Outcome,
  roomId: string | null,
  extras: FinalizeMatchExtras = {},
): Promise<number> {
  const newVersion = Number(match.version) + 1;
  const interrupted =
    outcome.reason === 'BOTH_OFFLINE' ||
    outcome.reason === 'SERVER_RESTART' ||
    outcome.reason === 'AI_UNAVAILABLE';

  await client.query(
    `UPDATE public.matches
        SET status = $1, outcome = $2, version = $3, ended_at = now(), proposal = NULL,
            position = COALESCE($4::jsonb, position),
            ply = COALESCE($5::int, ply),
            clock = CASE WHEN $6::boolean THEN $7::jsonb ELSE clock END,
            active_move_ids = COALESCE($8::jsonb, active_move_ids),
            repetition_counts = COALESCE($9::jsonb, repetition_counts),
            updated_at = now()
      WHERE id = $10`,
    [
      interrupted ? 'INTERRUPTED' : 'FINISHED',
      JSON.stringify(outcome),
      newVersion,
      extras.position ? JSON.stringify(extras.position) : null,
      extras.ply ?? null,
      extras.clock !== undefined,
      extras.clock === undefined || extras.clock === null ? null : JSON.stringify(extras.clock),
      extras.activeMoveIds ? JSON.stringify(extras.activeMoveIds) : null,
      extras.repetitionCounts ? JSON.stringify(extras.repetitionCounts) : null,
      match.id,
    ],
  );

  // 1. Release active_players for both participants
  await client.query(
    'DELETE FROM public.active_players WHERE match_id = $1 OR (room_id IS NOT NULL AND room_id = $2)',
    [match.id, roomId],
  );

  if (roomId) {
    // 2. Set room status to FINISHED — only for the room that owns this match. A room whose
    //    current_match_id is NULL/another match must not be forced to FINISHED: it violates
    //    rooms_status_invariants and aborts the whole terminal transaction.
    await client.query(
      `UPDATE public.rooms
       SET status = 'FINISHED', finished_at = now(), updated_at = now()
       WHERE id = $1 AND current_match_id = $2`,
      [roomId, match.id],
    );
  }

  // 3. The match context is over: leases fall back to the room (spec 03 §Cleanup sau ván).
  await client.query(
    'UPDATE public.client_controls SET match_id = NULL, updated_at = now() WHERE match_id = $1',
    [match.id],
  );

  // 4. One terminal event per version: RESULT unless the terminal MOVE already wrote it.
  if (extras.appendResultEvent !== false) {
    await client.query(
      `INSERT INTO public.match_events (match_id, version, type, payload)
       VALUES ($1, $2, 'RESULT', $3)`,
      [match.id, newVersion, JSON.stringify({ outcome, actorKey: extras.actorKey ?? null })],
    );
  }

  return newVersion;
}

export async function getMatchSnapshot(
  matchId: string,
  userId: string,
  pool?: pg.Pool,
): Promise<MatchSnapshot> {
  const p = pool ?? getPool();
  const nowMs = Date.now();

  // A snapshot read settles overdue deadlines first (spec 03: "Read snapshot settle/check
  // overdue qua service, không trả match ACTIVE hết giờ mãi mãi"). The scheduler is the
  // primary driver; this is only the read-side safety net for a stalled timer.
  await settleMatchDeadlines(matchId, nowMs, p);

  const client = await p.connect();
  try {
    const matchRes = await client.query(
      'SELECT mode, room_id, red_user_id, black_user_id FROM public.matches WHERE id = $1',
      [matchId],
    );
    if (matchRes.rowCount === 0) {
      throw { statusCode: 404, code: 'NOT_FOUND', message: 'Ván cờ không tồn tại' };
    }
    const match = matchRes.rows[0];
    const isParticipant = match.red_user_id === userId || match.black_user_id === userId;

    if (match.mode === 'ONLINE') {
      // ONLINE access is room membership: players and admitted spectators alike, and a
      // revoked spectator loses read access the moment the row is gone (F-07).
      const memberRes = await client.query(
        'SELECT 1 FROM public.room_members WHERE room_id = $1 AND user_id = $2',
        [match.room_id, userId],
      );
      if (memberRes.rowCount === 0) {
        throw { statusCode: 403, code: 'FORBIDDEN', message: 'Bạn không có quyền xem ván này' };
      }
    } else if (!isParticipant) {
      throw { statusCode: 403, code: 'FORBIDDEN', message: 'Bạn không có quyền xem ván này' };
    }

    return getMatchSnapshotFromClient(client, matchId, nowMs);
  } finally {
    client.release();
  }
}

export async function getMatchSnapshotFromClient(
  client: pg.PoolClient,
  matchId: string,
  nowMs: number = Date.now(),
): Promise<MatchSnapshot> {
  const matchRes = await client.query('SELECT * FROM public.matches WHERE id = $1', [matchId]);
  if (matchRes.rowCount === 0) {
    throw { statusCode: 404, code: 'NOT_FOUND', message: 'Ván cờ không tồn tại' };
  }
  const m = matchRes.rows[0];

  const pos = typeof m.position === 'string' ? JSON.parse(m.position) : m.position;
  const clockRaw = m.clock ? (typeof m.clock === 'string' ? JSON.parse(m.clock) : m.clock) : null;
  // Project clock forward to current moment if game is still active
  const clock = m.status === 'ACTIVE' && clockRaw
    ? projectClock(clockRaw, pos.turn, nowMs)
    : clockRaw;
  const outcome = m.outcome ? (typeof m.outcome === 'string' ? JSON.parse(m.outcome) : m.outcome) : null;
  const proposal = m.proposal ? (typeof m.proposal === 'string' ? JSON.parse(m.proposal) : m.proposal) : null;

  // Presence comes from the real control leases, not from room membership (spec 03).
  const participants =
    m.mode === 'AI'
      ? [m.ai_side === 'RED' ? m.black_user_id : m.red_user_id]
      : [m.red_user_id, m.black_user_id];
  const presence = await loadMatchPresence(client, participants, nowMs);

  return {
    id: m.id,
    roomId: m.room_id,
    mode: m.mode,
    status: m.status,
    position: pos,
    version: Number(m.version),
    ply: Number(m.ply),
    ruleSetVersion: 'xiangqi-simple-v1',
    redUserId: m.red_user_id,
    blackUserId: m.black_user_id,
    aiSide: m.ai_side,
    aiLevel: m.ai_level,
    timeControl: m.time_control,
    clock,
    outcome,
    activeMoveIds: parseActiveMoveIds(m.active_move_ids),
    proposal,
    serverNowMs: Date.now(),
    aiState: null,
    presence,
  };
}
