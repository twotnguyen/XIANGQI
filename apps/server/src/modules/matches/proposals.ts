/**
 * Proposals service: Draw proposals and Undo proposals.
 * Enforces:
 * - 30s TTL
 * - Rate limit: 1 proposal per 10s per user
 * - Opponent only can respond (self-approval -> FORBIDDEN)
 * - Undo preserves clock remaining (no time refund) and bumps version
 */
import crypto from 'node:crypto';
import type pg from 'pg';
import { getPool } from '../../db/pool.js';
import { withTransaction } from '../../db/transaction.js';
import type {
  MatchSnapshot,
  CommandResult,
  MatchCommand,
  Proposal,
  Outcome,
  Position,
} from '@xiangqi/contracts';
import { rebuildActiveBranch } from './undo.js';
import { settleClock } from './clock.js';
import { hashPayload } from './service.js';
import { matchBroadcaster } from '../../realtime/broadcast.js';

// In-memory rate limiter: Map<`${matchId}:${userId}`, lastProposalEpochMs>
const lastProposalTimes = new Map<string, number>();

export async function submitProposal(
  userId: string,
  matchId: string,
  command: MatchCommand<{ kind: 'DRAW' | 'UNDO' }>,
  pool?: pg.Pool,
): Promise<CommandResult> {
  const p = pool ?? getPool();
  let snapshotToBroadcast: MatchSnapshot | null = null;

  const result = await withTransaction(async (client) => {
    // 1. Lock room and match
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
        receipt.command_type === 'PROPOSE' &&
        receipt.expected_version === command.expectedVersion &&
        receipt.payload_hash === payloadHash
      ) {
        return {
          appliedVersion: receipt.applied_version,
          snapshot: await getMatchSnapshotClient(client, matchId),
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

    // Verify user is a participant
    if (match.red_user_id !== userId && match.black_user_id !== userId) {
      throw { statusCode: 403, code: 'FORBIDDEN', message: 'Chỉ người chơi mới có thể đề nghị' };
    }

    // Rate limit check: 1 proposal per 10s per user per spec
    const rateLimitKey = `${matchId}:${userId}`;
    const nowMs = Date.now();
    const lastTime = lastProposalTimes.get(rateLimitKey) ?? 0;
    if (nowMs - lastTime < 10000) {
      throw { statusCode: 429, code: 'RATE_LIMITED', message: 'Bạn chỉ có thể gửi đề nghị mỗi 10 giây' };
    }

    // Check if there is already an active (unexpired) proposal
    const existingProposal = match.proposal
      ? (typeof match.proposal === 'string' ? JSON.parse(match.proposal) : match.proposal)
      : null;

    if (existingProposal && existingProposal.expiresAtMs > nowMs) {
      throw { statusCode: 409, code: 'CONFLICT', message: 'Đang có một đề nghị chờ xử lý' };
    }

    // Create proposal: 30s TTL
    const proposalId = crypto.randomUUID();
    const newVersion = match.version + 1;
    const proposal: Proposal = {
      id: proposalId,
      kind: command.payload.kind,
      requesterId: userId,
      basePly: match.ply,
      createdVersion: newVersion,
      expiresAtMs: nowMs + 30000,
    };

    lastProposalTimes.set(rateLimitKey, nowMs);

    // Save proposal and bump version
    await client.query(
      `UPDATE public.matches
       SET proposal = $1, version = $2, updated_at = now()
       WHERE id = $3`,
      [JSON.stringify(proposal), newVersion, matchId],
    );

    // Record event
    await client.query(
      `INSERT INTO public.match_events (match_id, version, type, payload)
       VALUES ($1, $2, 'PROPOSAL_CREATED', $3)`,
      [matchId, newVersion, JSON.stringify(proposal)],
    );

    const snapshot = await getMatchSnapshotClient(client, matchId);
    await client.query(
      `INSERT INTO public.command_receipts (
         match_id, command_id, command_type, expected_version,
         payload_hash, applied_version, response_snapshot
       ) VALUES ($1, $2, 'PROPOSE', $3, $4, $5, $6)`,
      [matchId, command.commandId, command.expectedVersion, payloadHash, newVersion, JSON.stringify(snapshot)],
    );

    snapshotToBroadcast = snapshot;
    return {
      appliedVersion: newVersion,
      snapshot,
    };
  }, p);

  if (snapshotToBroadcast) {
    matchBroadcaster.emit(matchId, snapshotToBroadcast);
  }

  return result;
}

export async function respondToProposal(
  userId: string,
  matchId: string,
  command: MatchCommand<{ proposalId: string; accept: boolean }>,
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
        receipt.command_type === 'RESPOND' &&
        receipt.expected_version === command.expectedVersion &&
        receipt.payload_hash === payloadHash
      ) {
        return {
          appliedVersion: receipt.applied_version,
          snapshot: await getMatchSnapshotClient(client, matchId),
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

    const proposal = match.proposal
      ? (typeof match.proposal === 'string' ? JSON.parse(match.proposal) : match.proposal)
      : null;

    if (!proposal || proposal.id !== command.payload.proposalId) {
      throw { statusCode: 404, code: 'NOT_FOUND', message: 'Đề nghị không tồn tại' };
    }

    const nowMs = Date.now();
    if (proposal.expiresAtMs <= nowMs) {
      throw { statusCode: 409, code: 'PROPOSAL_EXPIRED', message: 'Đề nghị đã hết hạn' };
    }

    // Acceptance condition: requester CANNOT approve own proposal
    if (proposal.requesterId === userId) {
      throw { statusCode: 403, code: 'FORBIDDEN', message: 'Không thể tự chấp nhận đề nghị của chính mình' };
    }

    const newVersion = match.version + 1;

    if (!command.payload.accept) {
      // ── REJECT ──
      // Clear proposal, bump version, keep board state
      await client.query(
        `UPDATE public.matches
         SET proposal = NULL, version = $1, updated_at = now()
         WHERE id = $2`,
        [newVersion, matchId],
      );

      await client.query(
        `INSERT INTO public.match_events (match_id, version, type, payload)
         VALUES ($1, $2, 'PROPOSAL_REJECTED', $3)`,
        [matchId, newVersion, JSON.stringify({ proposalId: proposal.id, actorId: userId })],
      );
    } else if (proposal.kind === 'DRAW') {
      // ── ACCEPT DRAW ──
      const outcome: Outcome = { winner: null, reason: 'AGREED_DRAW' };

      // Finalize
      if (roomId) {
        await client.query('DELETE FROM public.active_players WHERE room_id = $1', [roomId]);
        await client.query(
          `UPDATE public.rooms SET status = 'FINISHED', updated_at = now() WHERE id = $1`,
          [roomId],
        );
      }

      await client.query(
        `UPDATE public.matches
         SET status = 'FINISHED', outcome = $1, proposal = NULL, version = $2, ended_at = now()
         WHERE id = $3`,
        [JSON.stringify(outcome), newVersion, matchId],
      );

      await client.query(
        `INSERT INTO public.match_events (match_id, version, type, payload)
         VALUES ($1, $2, 'RESULT', $3)`,
        [matchId, newVersion, JSON.stringify({ outcome, actorKey: userId })],
      );
    } else if (proposal.kind === 'UNDO') {
      // ── ACCEPT UNDO ──
      // Target ply: revert before requester's last move.
      // Settle clock first — preserve remaining times, NEVER refund time per spec
      const currentPos = (typeof match.position === 'string' ? JSON.parse(match.position) : match.position) as Position;
      const currentClock = match.clock ? (typeof match.clock === 'string' ? JSON.parse(match.clock) : match.clock) : null;
      const settled = settleClock(currentClock, currentPos.turn, nowMs);

      // Fetch all recorded moves to replay
      const movesRes = await client.query(
        `SELECT id, move_number, player_id, side, from_x, from_y, to_x, to_y
         FROM public.moves
         WHERE match_id = $1
         ORDER BY move_number ASC`,
        [matchId],
      );

      const allMoves = movesRes.rows.map((r) => ({
        id: r.id,
        moveNumber: r.move_number,
        playerId: r.player_id,
        side: r.side,
        fromX: r.from_x,
        fromY: r.from_y,
        toX: r.to_x,
        toY: r.to_y,
      }));

      // Find requester's last move to revert before it
      const requesterMoves = allMoves.filter((m) => m.playerId === proposal.requesterId);
      const targetPly = requesterMoves.length > 0
        ? requesterMoves[requesterMoves.length - 1]!.moveNumber - 1
        : 0;

      const rebuilt = rebuildActiveBranch(allMoves, targetPly);

      // Update match with rebuilt position, target ply, settled clock, cleared proposal
      const clockJson = settled?.clock ? JSON.stringify(settled.clock) : null;
      await client.query(
        `UPDATE public.matches
         SET position = $1, version = $2, ply = $3, clock = $4, proposal = NULL, updated_at = now()
         WHERE id = $5`,
        [JSON.stringify(rebuilt.position), newVersion, targetPly, clockJson, matchId],
      );

      await client.query(
        `INSERT INTO public.match_events (match_id, version, type, payload)
         VALUES ($1, $2, 'UNDO_APPLIED', $3)`,
        [
          matchId,
          newVersion,
          JSON.stringify({
            proposalId: proposal.id,
            targetPly,
            activeMoveIds: rebuilt.activeMoveIds,
          }),
        ],
      );
    }

    const snapshot = await getMatchSnapshotClient(client, matchId);
    await client.query(
      `INSERT INTO public.command_receipts (
         match_id, command_id, command_type, expected_version,
         payload_hash, applied_version, response_snapshot
       ) VALUES ($1, $2, 'RESPOND', $3, $4, $5, $6)`,
      [matchId, command.commandId, command.expectedVersion, payloadHash, newVersion, JSON.stringify(snapshot)],
    );

    snapshotToBroadcast = snapshot;
    return {
      appliedVersion: newVersion,
      snapshot,
    };
  }, p);

  if (snapshotToBroadcast) {
    matchBroadcaster.emit(matchId, snapshotToBroadcast);
  }

  return result;
}

async function getMatchSnapshotClient(
  client: pg.PoolClient,
  matchId: string,
): Promise<MatchSnapshot> {
  const matchRes = await client.query('SELECT * FROM public.matches WHERE id = $1', [matchId]);
  const m = matchRes.rows[0];

  const pos = typeof m.position === 'string' ? JSON.parse(m.position) : m.position;
  const clock = m.clock ? (typeof m.clock === 'string' ? JSON.parse(m.clock) : m.clock) : null;
  const outcome = m.outcome ? (typeof m.outcome === 'string' ? JSON.parse(m.outcome) : m.outcome) : null;
  const proposal = m.proposal ? (typeof m.proposal === 'string' ? JSON.parse(m.proposal) : m.proposal) : null;

  return {
    id: m.id,
    roomId: m.room_id,
    mode: m.mode,
    status: m.status,
    position: pos,
    version: m.version,
    ply: m.ply,
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
