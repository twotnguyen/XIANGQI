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
} from '@xiangqi/contracts';
import { squareToIndex } from '@xiangqi/contracts';
import { matchBroadcaster } from '../../realtime/broadcast.js';
import { settleClock, projectClock } from './clock.js';

const AI_ACTOR_ID = '00000000-0000-0000-0000-000000000001';

export function hashPayload(payload: unknown): string {
  return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

export async function startMatchFromRoom(
  roomId: string,
  pool?: pg.Pool,
): Promise<MatchSnapshot> {
  const p = pool ?? getPool();

  return withTransaction(async (client) => {
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

    return getMatchSnapshotFromClient(client, matchId);
  }, p);
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
      // Clock ran out! Reject move and finalize as TIMEOUT
      const winningSide: Side = pos.turn === 'RED' ? 'BLACK' : 'RED';
      const timeoutOutcome: Outcome = { winner: winningSide, reason: 'TIMEOUT' };
      const newVersion = Number(match.version) + 1;

      await finalizeMatch(client, match, timeoutOutcome, roomId);
      await client.query(
        `UPDATE public.matches
         SET status = 'FINISHED', outcome = $1, version = $2, proposal = NULL, ended_at = now()
         WHERE id = $3`,
        [JSON.stringify(timeoutOutcome), newVersion, matchId],
      );

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

    // 7. Apply move to get next position
    const nextPos = applyMove(pos, command.payload);
    const nextKey = positionKey(nextPos);

    // 8. Count occurrences for threefold repetition
    // Count past occurrences of this key from match_events
    const eventsRes = await client.query(
      'SELECT payload FROM public.match_events WHERE match_id = $1 ORDER BY version ASC',
      [matchId],
    );
    let occurrences = 1; // current position counts as 1
    for (const ev of eventsRes.rows) {
      const p = typeof ev.payload === 'string' ? JSON.parse(ev.payload) : ev.payload;
      if (p.key === nextKey) occurrences++;
    }

    // 9. Check terminal outcome
    const outcome: Outcome | null = getTerminalOutcome(nextPos, occurrences);
    const newVersion = match.version + 1;
    const newPly = match.ply + 1;

    // 10. Record move in `moves` table
    const fromIdx = squareToIndex(command.payload.from);
    const toIdx = squareToIndex(command.payload.to);
    const moverPiece = pos.board[fromIdx]!;
    const capturedPiece = pos.board[toIdx];

    await client.query(
      `INSERT INTO public.moves (
         match_id, move_number, player_id, side,
         from_x, from_y, to_x, to_y, piece_type, captured_type
       ) VALUES (
         $1, $2, $3, $4,
         $5, $6, $7, $8, $9, $10
       )`,
      [
        matchId,
        newPly,
        isAiTurn ? null : userId,
        moverPiece.side,
        command.payload.from.x,
        command.payload.from.y,
        command.payload.to.x,
        command.payload.to.y,
        moverPiece.type,
        capturedPiece?.type ?? null,
      ],
    );

    // 11. Record event
    const moveId = crypto.randomUUID();
    await client.query(
      `INSERT INTO public.match_events (match_id, version, type, payload)
       VALUES ($1, $2, 'MOVE', $3)`,
      [
        matchId,
        newVersion,
        JSON.stringify({
          moveId,
          side: moverPiece.side,
          move: command.payload,
          key: nextKey,
        }),
      ],
    );

    // 12. If terminal: finalize match
    if (outcome) {
      await finalizeMatch(client, match, outcome, roomId);
      await client.query(
        `UPDATE public.matches
         SET position = $1, version = $2, ply = $3, outcome = $4, status = 'FINISHED',
             proposal = NULL,
             active_move_ids = active_move_ids || jsonb_build_array($6::text),
             ended_at = now()
         WHERE id = $5`,
        [JSON.stringify(nextPos), newVersion, newPly, JSON.stringify(outcome), matchId, moveId],
      );
    } else {
      const clockJson = settled?.clock ? JSON.stringify(settled.clock) : null;
      // Per spec: any new move automatically invalidates pending proposal
      await client.query(
        `UPDATE public.matches
         SET position = $1, version = $2, ply = $3, clock = $4, proposal = NULL,
             active_move_ids = active_move_ids || jsonb_build_array($6::text),
             updated_at = now()
         WHERE id = $5`,
        [JSON.stringify(nextPos), newVersion, newPly, clockJson, matchId, moveId],
      );
    }

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

    // If AI match and next turn belongs to AI: trigger AI turn
    if (
      snap.mode === 'AI' &&
      snap.status === 'ACTIVE' &&
      snap.aiSide === snap.position.turn &&
      snap.aiLevel
    ) {
      const { triggerAiTurn } = await import('../ai/service.js');
      triggerAiTurn(
        matchId,
        snap.position,
        snap.version,
        snap.aiLevel,
        snap.clock,
        {},
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
    const newVersion = Number(match.version) + 1;

    // Finalize match and release slots
    await finalizeMatch(client, match, outcome, roomId);
    await client.query(
      `UPDATE public.matches
       SET status = 'FINISHED', outcome = $1, version = $2, proposal = NULL, ended_at = now()
       WHERE id = $3`,
      [JSON.stringify(outcome), newVersion, matchId],
    );

    // Event
    await client.query(
      `INSERT INTO public.match_events (match_id, version, type, payload)
       VALUES ($1, $2, 'RESULT', $3)`,
      [matchId, newVersion, JSON.stringify({ outcome, actorKey: userId })],
    );

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
  }

  return result;
}

async function finalizeMatch(
  client: pg.PoolClient,
  match: { id: string },
  outcome: Outcome,
  roomId: string | null,
): Promise<void> {
  // 1. Release active_players for both participants
  await client.query(
    'DELETE FROM public.active_players WHERE match_id = $1 OR (room_id IS NOT NULL AND room_id = $2)',
    [match.id, roomId],
  );

  if (roomId) {
    // 2. Set room status to FINISHED
    await client.query(
      `UPDATE public.rooms
       SET status = 'FINISHED', finished_at = now(), updated_at = now()
       WHERE id = $1`,
      [roomId],
    );
  }
}

export async function getMatchSnapshot(
  matchId: string,
  userId: string,
  pool?: pg.Pool,
): Promise<MatchSnapshot> {
  const p = pool ?? getPool();
  const client = await p.connect();
  try {
    // Check permission: participant or spectator
    const matchRes = await client.query('SELECT * FROM public.matches WHERE id = $1', [matchId]);
    if (matchRes.rowCount === 0) {
      throw { statusCode: 404, code: 'NOT_FOUND', message: 'Ván cờ không tồn tại' };
    }
    return getMatchSnapshotFromClient(client, matchId);
  } finally {
    client.release();
  }
}

async function getMatchSnapshotFromClient(
  client: pg.PoolClient,
  matchId: string,
): Promise<MatchSnapshot> {
  const matchRes = await client.query('SELECT * FROM public.matches WHERE id = $1', [matchId]);
  if (matchRes.rowCount === 0) {
    throw { statusCode: 404, code: 'NOT_FOUND', message: 'Ván cờ không tồn tại' };
  }
  const m = matchRes.rows[0];

  const pos = typeof m.position === 'string' ? JSON.parse(m.position) : m.position;
  const clockRaw = m.clock ? (typeof m.clock === 'string' ? JSON.parse(m.clock) : m.clock) : null;
  const nowMs = Date.now();
  // Project clock forward to current moment if game is still active
  const clock = m.status === 'ACTIVE' && clockRaw
    ? projectClock(clockRaw, pos.turn, nowMs)
    : clockRaw;
  const outcome = m.outcome ? (typeof m.outcome === 'string' ? JSON.parse(m.outcome) : m.outcome) : null;
  const proposal = m.proposal ? (typeof m.proposal === 'string' ? JSON.parse(m.proposal) : m.proposal) : null;

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
    activeMoveIds: [],
    proposal,
    serverNowMs: Date.now(),
    aiState: null,
    presence: [],
  };
}
