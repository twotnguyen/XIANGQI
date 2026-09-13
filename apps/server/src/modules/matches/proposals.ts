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
  Side,
} from '@xiangqi/contracts';
import { loadActiveBranch, parseActiveMoveIds, rebuildEffectiveBranch } from './undo.js';
import { settleClock } from './clock.js';
import { finalizeMatchTx, getMatchSnapshotFromClient, hashPayload } from './service.js';
import { matchBroadcaster } from '../../realtime/broadcast.js';
import { PROPOSAL_TTL_MS } from './deadlines.js';
import { endMatchMedia } from '../media/service.js';

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
    const newVersion = Number(match.version) + 1;
    const userSide: Side = match.red_user_id === userId ? 'RED' : 'BLACK';
    const proposal: Proposal = {
      id: proposalId,
      kind: command.payload.kind,
      requesterId: userId,
      basePly: Number(match.ply),
      createdVersion: newVersion,
      expiresAtMs: nowMs + PROPOSAL_TTL_MS,
    };

    const dbProposal = {
      ...proposal,
      requester: userSide,
    };

    lastProposalTimes.set(rateLimitKey, nowMs);

    // Save proposal and bump version
    await client.query(
      `UPDATE public.matches
       SET proposal = $1, version = $2, updated_at = now()
       WHERE id = $3`,
      [JSON.stringify(dbProposal), newVersion, matchId],
    );

    // Record event
    await client.query(
      `INSERT INTO public.match_events (match_id, version, type, payload)
       VALUES ($1, $2, 'PROPOSAL_CREATED', $3)`,
      [matchId, newVersion, JSON.stringify(proposal)],
    );

    const snapshot = await getMatchSnapshotFromClient(client, matchId);
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
  let expiredSnapshot: MatchSnapshot | null = null;

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

    const proposal = match.proposal
      ? (typeof match.proposal === 'string' ? JSON.parse(match.proposal) : match.proposal)
      : null;

    if (!proposal || proposal.id !== command.payload.proposalId) {
      throw { statusCode: 404, code: 'NOT_FOUND', message: 'Đề nghị không tồn tại' };
    }

    const nowMs = Date.now();
    if (proposal.expiresAtMs <= nowMs) {
      // Spec 03: a timed-out proposal is resolved in a transaction — version bump, event,
      // cleared proposal and a snapshot push — and only then does the request fail. It is
      // the one refused validation that still commits.
      const expiredVersion = match.version + 1;
      await client.query(
        'UPDATE public.matches SET proposal = NULL, version = $1, updated_at = now() WHERE id = $2',
        [expiredVersion, matchId],
      );
      await client.query(
        `INSERT INTO public.match_events (match_id, version, type, payload)
         VALUES ($1, $2, 'PROPOSAL_RESOLVED', $3)`,
        [matchId, expiredVersion, JSON.stringify({ proposalId: proposal.id, resolution: 'EXPIRED' })],
      );
      expiredSnapshot = await getMatchSnapshotFromClient(client, matchId);
      return { appliedVersion: expiredVersion, snapshot: expiredSnapshot };
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
         VALUES ($1, $2, 'PROPOSAL_RESOLVED', $3)`,
        [
          matchId,
          newVersion,
          JSON.stringify({ proposalId: proposal.id, resolution: 'REJECTED', actorId: userId }),
        ],
      );
    } else if (proposal.kind === 'DRAW') {
      // ── ACCEPT DRAW ── the shared finalizer owns version/event/room release.
      const outcome: Outcome = { winner: null, reason: 'AGREED_DRAW' };
      await finalizeMatchTx(client, match, outcome, roomId, { actorKey: userId });
    } else if (proposal.kind === 'UNDO') {
      // ── ACCEPT UNDO ──
      // Rebuild the effective branch from match_moves ancestry. Audit rows (the abandoned
      // branch) are never deleted; only the active prefix + caches are rewritten (spec 09).
      // Settle clock first — preserve remaining times, NEVER refund time per spec.
      const currentPos = (typeof match.position === 'string' ? JSON.parse(match.position) : match.position) as Position;
      const currentClock = match.clock ? (typeof match.clock === 'string' ? JSON.parse(match.clock) : match.clock) : null;
      const settled = settleClock(currentClock, currentPos.turn, nowMs);

      const branch = await loadActiveBranch(
        client,
        matchId,
        parseActiveMoveIds(match.active_move_ids),
      );
      const requesterSide: Side = proposal.requester === 'RED' || proposal.requester === 'BLACK'
        ? proposal.requester
        : (match.red_user_id === proposal.requesterId ? 'RED' : 'BLACK');

      // Target ply: rewind past the requester's last move of the effective branch.
      let requesterLastIndex = -1;
      for (let i = branch.length - 1; i >= 0; i--) {
        if (branch[i]!.side === requesterSide) {
          requesterLastIndex = i;
          break;
        }
      }
      const targetPly = requesterLastIndex >= 0 ? requesterLastIndex : 0;
      const rebuilt = rebuildEffectiveBranch(branch, targetPly);
      const removedMoveIds = branch.slice(targetPly).map((m) => m.id);

      const clockJson = settled?.clock ? JSON.stringify(settled.clock) : null;
      await client.query(
        `UPDATE public.matches
         SET position = $1, version = $2, ply = $3, clock = $4, proposal = NULL,
             active_move_ids = $5::jsonb, repetition_counts = $6::jsonb, updated_at = now()
         WHERE id = $7`,
        [
          JSON.stringify(rebuilt.position),
          newVersion,
          rebuilt.activeMoveIds.length,
          clockJson,
          JSON.stringify(rebuilt.activeMoveIds),
          JSON.stringify(rebuilt.repetitionCounts),
          matchId,
        ],
      );

      await client.query(
        `INSERT INTO public.match_events (match_id, version, type, payload)
         VALUES ($1, $2, 'UNDO', $3)`,
        [
          matchId,
          newVersion,
          JSON.stringify({
            removedMoveIds,
            targetPly: rebuilt.activeMoveIds.length,
            requester: proposal.requesterId,
            approver: userId,
          }),
        ],
      );
    }

    const snapshot = await getMatchSnapshotFromClient(client, matchId);
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

  if (expiredSnapshot) {
    matchBroadcaster.emit(matchId, expiredSnapshot);
    throw { statusCode: 409, code: 'PROPOSAL_EXPIRED', message: 'Đề nghị đã hết hạn' };
  }

  const broadcastSnapshot = snapshotToBroadcast as MatchSnapshot | null;
  if (broadcastSnapshot) {
    matchBroadcaster.emit(matchId, broadcastSnapshot);
    // An accepted DRAW ends the match: retire its media transports after commit.
    if (broadcastSnapshot.status !== 'ACTIVE') {
      void endMatchMedia(matchId).catch(() => undefined);
    }
  }

  return result;
}
