/**
 * Match deadlines and the scheduler that drives them (spec 03 §"Trạng thái, transaction và
 * deadline", spec 04 Socket.IO). Responsibilities:
 *
 * - clock expiry at the exact persisted deadline → FINISHED / TIMEOUT
 * - one participant offline for 60s → FINISHED / DISCONNECT (the online side wins)
 * - both leases lost before any deadline → INTERRUPTED / BOTH_OFFLINE (winner null)
 * - proposal expiry after 30s → version bump + snapshot push
 * - room FINISHED → CLOSED 10 minutes after `finished_at`, guarded by `current_match_id`
 * - boot recovery of matches owned by a previous boot
 *
 * Every decision is derived from persisted timestamps (`clock.runningSinceEpochMs`,
 * `client_controls.lease_until/disconnected_at`, `rooms.finished_at`), never from callback
 * ordering, and every ending runs through the single `finalizeMatchTx` in the match
 * service. The pure `decide*` helpers are exported so the unit lane can drive them with a
 * fake clock and no database.
 */
import type pg from 'pg';
import { getPool } from '../../db/pool.js';
import { withTransaction } from '../../db/transaction.js';
import type {
  ClockState,
  MatchSnapshot,
  Outcome,
  Proposal,
  Side,
  TimeControl,
} from '@xiangqi/contracts';
import { emitAccessRevoked, emitMatchState, emitPresenceChanged } from '../../realtime/events.js';
import {
  DISCONNECT_GRACE_MS,
  expireControlLeases,
  offlineDetectedAtMs,
  type LeaseTimestamps,
} from '../../realtime/presence.js';
import { settleClock } from './clock.js';
import { finalizeMatchTx, getMatchSnapshotFromClient } from './service.js';
import { endMatchMedia } from '../media/service.js';

export { DISCONNECT_GRACE_MS };
/** Proposal TTL (spec 03 §Undo: expiry 30 giây). */
export const PROPOSAL_TTL_MS = 30000;
/** Room cleanup delay after the match ended (spec 03 §Cleanup sau ván). */
export const ROOM_CLOSE_AFTER_MS = 10 * 60 * 1000;

export interface ParticipantLease {
  userId: string;
  /** null when the user never established a control lease for this match. */
  leaseUntilMs: number | null;
  disconnectedAtMs: number | null;
}

export interface MatchDeadlineFacts {
  status: 'ACTIVE' | 'FINISHED' | 'INTERRUPTED';
  mode: 'ONLINE' | 'AI';
  timeControl: TimeControl;
  clock: ClockState;
  turn: Side;
  redUserId: string | null;
  blackUserId: string | null;
  aiSide: Side | null;
  leases: ParticipantLease[];
  nowMs: number;
}

export type DeadlineOutcome =
  | { kind: 'NONE' }
  | { kind: 'TIMEOUT'; winner: Side }
  | { kind: 'DISCONNECT'; winner: Side }
  | { kind: 'BOTH_OFFLINE' };

/** Persisted deadline of the side to move, or null when the clock is unlimited. */
export function clockDeadlineAtMs(
  clock: ClockState,
  turn: Side,
  timeControl: TimeControl,
): number | null {
  if (!clock || timeControl === 0) return null;
  const remaining = turn === 'RED' ? clock.redMs : clock.blackMs;
  return clock.runningSinceEpochMs + remaining;
}

function participantIds(facts: MatchDeadlineFacts): string[] {
  if (facts.mode === 'AI') {
    const human = facts.aiSide === 'RED' ? facts.blackUserId : facts.redUserId;
    return human ? [human] : [];
  }
  return [facts.redUserId, facts.blackUserId].filter((id): id is string => id !== null);
}

/** A participant whose lease was established and is now known to be lost. */
export interface LostLease extends LeaseTimestamps {
  userId: string;
}

interface LeaseSplit {
  lost: LostLease[];
  /** Participants that never established a lease: no offline instant is known. */
  unknown: number;
}

function splitLeases(facts: MatchDeadlineFacts, ids: string[]): LeaseSplit {
  const byUser = new Map(facts.leases.map((lease) => [lease.userId, lease]));
  const lost: LostLease[] = [];
  let unknown = 0;

  for (const id of ids) {
    const lease = byUser.get(id);
    if (!lease || lease.leaseUntilMs === null) {
      unknown += 1;
      continue;
    }
    if (lease.disconnectedAtMs === null && lease.leaseUntilMs > facts.nowMs) continue;
    lost.push({ userId: id, leaseUntilMs: lease.leaseUntilMs, disconnectedAtMs: lease.disconnectedAtMs });
  }

  return { lost, unknown };
}

/**
 * What the persisted facts say about a match right now.
 *
 * A valid clock deadline that already passed always outranks a disconnect detected later,
 * and an exact tie between the clock deadline and the grace deadline resolves to TIMEOUT
 * (spec 03 §Mất mạng/restart).
 */
export function decideMatchDeadline(facts: MatchDeadlineFacts): DeadlineOutcome {
  if (facts.status !== 'ACTIVE') return { kind: 'NONE' };
  const ids = participantIds(facts);
  if (ids.length === 0) return { kind: 'NONE' };

  const { lost, unknown } = splitLeases(facts, ids);
  const clockAt = clockDeadlineAtMs(facts.clock, facts.turn, facts.timeControl);
  const timeout: DeadlineOutcome | null =
    clockAt !== null ? { kind: 'TIMEOUT', winner: facts.turn === 'RED' ? 'BLACK' : 'RED' } : null;

  if (unknown === 0 && lost.length === ids.length && facts.mode === 'ONLINE') {
    const bothLostAt = Math.max(...lost.map(offlineDetectedAtMs));
    if (bothLostAt <= facts.nowMs) {
      if (clockAt !== null && clockAt <= facts.nowMs && clockAt <= bothLostAt) return timeout!;
      return { kind: 'BOTH_OFFLINE' };
    }
  }

  if (lost.length === 0) {
    return clockAt !== null && clockAt <= facts.nowMs ? timeout! : { kind: 'NONE' };
  }

  const graceAt = Math.min(...lost.map((lease) => offlineDetectedAtMs(lease) + DISCONNECT_GRACE_MS));
  const grace: DeadlineOutcome =
    facts.mode === 'AI'
      ? // One human participant in AI mode: no winner is invented; the loss maps to
        // INTERRUPTED (spec 03 §AI, mapping BOTH_OFFLINE → winner null).
        { kind: 'BOTH_OFFLINE' }
      : {
          kind: 'DISCONNECT',
          winner: facts.redUserId === lost[0]!.userId ? 'BLACK' : 'RED',
        };

  const clockDue = clockAt !== null && clockAt <= facts.nowMs;
  if (clockDue && clockAt <= graceAt) return timeout!;
  return graceAt <= facts.nowMs ? grace : { kind: 'NONE' };
}

/** Nearest persisted instant that could change the decision (scheduler wake-up). */
export function nextDeadlineAtMs(facts: MatchDeadlineFacts): number | null {
  if (facts.status !== 'ACTIVE') return null;
  const ids = participantIds(facts);
  if (ids.length === 0) return null;

  const { lost, unknown } = splitLeases(facts, ids);
  const candidates: number[] = [];

  const clockAt = clockDeadlineAtMs(facts.clock, facts.turn, facts.timeControl);
  if (clockAt !== null) candidates.push(clockAt);
  for (const lease of lost) candidates.push(offlineDetectedAtMs(lease) + DISCONNECT_GRACE_MS);
  if (facts.mode === 'ONLINE' && unknown === 0 && lost.length === ids.length && lost.length > 0) {
    candidates.push(Math.max(...lost.map(offlineDetectedAtMs)));
  }

  const future = candidates.filter((at) => at > facts.nowMs);
  return future.length > 0 ? Math.min(...future) : null;
}

export function decideProposalExpired(proposal: Proposal | null, nowMs: number): boolean {
  return proposal !== null && proposal.expiresAtMs <= nowMs;
}

export function roomCloseAtMs(finishedAtMs: number): number {
  return finishedAtMs + ROOM_CLOSE_AFTER_MS;
}

export function decideRoomClose(input: {
  status: string;
  currentMatchId: string | null;
  finishedAtMs: number | null;
  nowMs: number;
}): boolean {
  if (input.status !== 'FINISHED' || input.currentMatchId === null || input.finishedAtMs === null) {
    return false;
  }
  return roomCloseAtMs(input.finishedAtMs) <= input.nowMs;
}

interface ActiveMatchRow {
  id: string;
  mode: 'ONLINE' | 'AI';
  clock: unknown;
  proposal: unknown;
  time_control: number;
  turn: Side;
  red_user_id: string | null;
  black_user_id: string | null;
  ai_side: Side | null;
  leases: { userId: string; leaseUntilMs: number | null; disconnectedAtMs: number | null }[];
}

function parseJson<T>(value: unknown): T | null {
  if (value === null || value === undefined) return null;
  return (typeof value === 'string' ? JSON.parse(value) : value) as T;
}

export interface ActiveMatchDeadline {
  matchId: string;
  proposal: Proposal | null;
  facts: MatchDeadlineFacts;
}

function factsFromRow(row: ActiveMatchRow, nowMs: number): MatchDeadlineFacts {
  return {
    status: 'ACTIVE',
    mode: row.mode,
    timeControl: Number(row.time_control) as TimeControl,
    clock: parseJson<ClockState>(row.clock),
    turn: row.turn,
    redUserId: row.red_user_id,
    blackUserId: row.black_user_id,
    aiSide: row.ai_side,
    leases: (row.leases ?? []).map((lease) => ({
      userId: lease.userId,
      leaseUntilMs: lease.leaseUntilMs === null ? null : Number(lease.leaseUntilMs),
      disconnectedAtMs:
        lease.disconnectedAtMs === null || lease.disconnectedAtMs === undefined
          ? null
          : Number(lease.disconnectedAtMs),
    })),
    nowMs,
  };
}

/** Facts for a single match read inside the caller's transaction (authoritative, locked). */
async function loadFactsFromClient(
  client: pg.PoolClient,
  match: Record<string, unknown>,
  nowMs: number,
): Promise<MatchDeadlineFacts> {
  const ids = [match['red_user_id'], match['black_user_id']].filter(
    (id): id is string => typeof id === 'string',
  );
  const leaseRes = await client.query(
    `SELECT user_id,
            (EXTRACT(EPOCH FROM lease_until) * 1000)::bigint AS lease_until_ms,
            CASE WHEN disconnected_at IS NULL THEN NULL
                 ELSE (EXTRACT(EPOCH FROM disconnected_at) * 1000)::bigint END AS disconnected_at_ms
       FROM public.client_controls
      WHERE user_id = ANY($1::uuid[])`,
    [ids],
  );
  return factsFromRow(
    {
      id: match['id'] as string,
      mode: match['mode'] as 'ONLINE' | 'AI',
      clock: match['clock'],
      proposal: match['proposal'],
      time_control: Number(match['time_control']),
      turn: (
        typeof match['position'] === 'string' ? JSON.parse(match['position']) : match['position']
      ).turn as Side,
      red_user_id: (match['red_user_id'] as string | null) ?? null,
      black_user_id: (match['black_user_id'] as string | null) ?? null,
      ai_side: (match['ai_side'] as Side | null) ?? null,
      leases: leaseRes.rows.map((lease) => ({
        userId: lease.user_id as string,
        leaseUntilMs: lease.lease_until_ms === null ? null : Number(lease.lease_until_ms),
        disconnectedAtMs:
          lease.disconnected_at_ms === null ? null : Number(lease.disconnected_at_ms),
      })),
    },
    nowMs,
  );
}

export interface SettleMatchResult {
  finalized: boolean;
  outcome: Outcome | null;
  proposalExpired: boolean;
  snapshot: MatchSnapshot | null;
}

/**
 * Settle one match at `nowEpochMs`: clock expiry, lost leases and proposal expiry, all
 * decided from persisted timestamps under the room → match lock order. Idempotent: a
 * second call on a settled match is a no-op. After commit the fresh snapshot is pushed and
 * (on a terminal outcome) the media cleanup hook runs.
 */
export async function settleMatchDeadlines(
  matchId: string,
  nowEpochMs: number = Date.now(),
  pool?: pg.Pool,
): Promise<SettleMatchResult> {
  const p = pool ?? getPool();
  const empty: SettleMatchResult = {
    finalized: false,
    outcome: null,
    proposalExpired: false,
    snapshot: null,
  };

  const result = await withTransaction(async (client) => {
    const matchLookup = await client.query('SELECT room_id FROM public.matches WHERE id = $1', [
      matchId,
    ]);
    if (matchLookup.rowCount === 0) return empty;
    const roomId = matchLookup.rows[0]!.room_id as string | null;

    if (roomId) {
      await client.query('SELECT id FROM public.rooms WHERE id = $1 FOR UPDATE', [roomId]);
    }
    const matchRes = await client.query('SELECT * FROM public.matches WHERE id = $1 FOR UPDATE', [
      matchId,
    ]);
    if (matchRes.rowCount === 0) return empty;
    const match = matchRes.rows[0] as Record<string, unknown>;
    if (match['status'] !== 'ACTIVE') return empty;

    const facts = await loadFactsFromClient(client, match, nowEpochMs);
    const decision = decideMatchDeadline(facts);

    if (decision.kind !== 'NONE') {
      const outcome: Outcome =
        decision.kind === 'BOTH_OFFLINE'
          ? { winner: null, reason: 'BOTH_OFFLINE' }
          : { winner: decision.winner, reason: decision.kind };
      // Freeze the clock at its remaining balance; a terminal match never runs a timer.
      const settled = settleClock(facts.clock, facts.turn, nowEpochMs);
      await finalizeMatchTx(client, { id: matchId, version: Number(match['version']) }, outcome, roomId, {
        clock: settled ? settled.clock : null,
      });
      const snapshot = await getMatchSnapshotFromClient(client, matchId);
      return { finalized: true, outcome, proposalExpired: false, snapshot };
    }

    const proposal = parseJson<Proposal>(match['proposal']);
    if (decideProposalExpired(proposal, nowEpochMs)) {
      const newVersion = Number(match['version']) + 1;
      await client.query(
        'UPDATE public.matches SET proposal = NULL, version = $1, updated_at = now() WHERE id = $2',
        [newVersion, matchId],
      );
      await client.query(
        `INSERT INTO public.match_events (match_id, version, type, payload)
         VALUES ($1, $2, 'PROPOSAL_RESOLVED', $3)`,
        [matchId, newVersion, JSON.stringify({ proposalId: proposal!.id, resolution: 'EXPIRED' })],
      );
      const snapshot = await getMatchSnapshotFromClient(client, matchId);
      return { finalized: false, outcome: null, proposalExpired: true, snapshot };
    }

    return empty;
  }, p);

  if (result.snapshot) {
    // After commit only: a failed broadcast never rolls back committed state (spec 03).
    emitMatchState({ matchId, snapshot: result.snapshot });
    if (result.finalized) {
      void endMatchMedia(matchId).catch((err: unknown) => {
        console.error('Media cleanup after match end failed:', err);
      });
    }
  }

  return result;
}

/** Candidate ACTIVE matches with their persisted facts, for one scheduler tick. */
export async function collectActiveMatchDeadlines(
  nowMs: number = Date.now(),
  pool?: pg.Pool,
): Promise<ActiveMatchDeadline[]> {
  const p = pool ?? getPool();
  const res = await p.query(
    `SELECT m.id, m.mode, m.clock, m.proposal, m.time_control,
            m.position->>'turn' AS turn, m.red_user_id, m.black_user_id, m.ai_side,
            COALESCE((
              SELECT jsonb_agg(jsonb_build_object(
                       'userId', cc.user_id,
                       'leaseUntilMs', (EXTRACT(EPOCH FROM cc.lease_until) * 1000)::bigint,
                       'disconnectedAtMs', CASE WHEN cc.disconnected_at IS NULL THEN NULL
                         ELSE (EXTRACT(EPOCH FROM cc.disconnected_at) * 1000)::bigint END))
                FROM public.client_controls cc
               WHERE cc.match_id = m.id
            ), '[]'::jsonb) AS leases
       FROM public.matches m
      WHERE m.status = 'ACTIVE'`,
  );
  return (res.rows as ActiveMatchRow[]).map((row) => ({
    matchId: row.id,
    proposal: parseJson<Proposal>(row.proposal),
    facts: factsFromRow(row, nowMs),
  }));
}

export interface CloseRoomsResult {
  closedRooms: number;
}

/**
 * Close rooms whose match ended more than 10 minutes ago (spec 03 §Cleanup sau ván).
 * `current_match_id` + `status = 'FINISHED'` are re-checked under the room lock, so a
 * rematch that already cleared `finished_at` is never closed.
 */
export async function closeExpiredRooms(
  nowEpochMs: number = Date.now(),
  pool?: pg.Pool,
): Promise<CloseRoomsResult> {
  const p = pool ?? getPool();

  const closed = await withTransaction(async (client) => {
    const dueRes = await client.query(
      `SELECT id, current_match_id, room_version
         FROM public.rooms
        WHERE status = 'FINISHED'
          AND finished_at IS NOT NULL
          AND finished_at <= to_timestamp($1::double precision / 1000.0) - ($2::bigint * interval '1 millisecond')
        FOR UPDATE`,
      [nowEpochMs, ROOM_CLOSE_AFTER_MS],
    );

    const notices: {
      roomId: string;
      roomVersion: number;
      userIds: string[];
      matchId: string | null;
    }[] = [];

    for (const room of dueRes.rows) {
      const roomId = room.id as string;
      const matchId = (room.current_match_id as string | null) ?? null;
      const members = await client.query(
        'SELECT user_id FROM public.room_members WHERE room_id = $1',
        [roomId],
      );
      const closedRes = await client.query(
        `UPDATE public.rooms
            SET status = 'CLOSED',
                closed_at = now(),
                room_version = room_version + 1,
                updated_at = now()
          WHERE id = $1 AND status = 'FINISHED' AND current_match_id = $2
          RETURNING room_version`,
        [roomId, matchId],
      );
      if (closedRes.rowCount === 0) continue;

      // Close revokes invitations/memberships/chat subscriptions and media grants; match
      // history stays (spec 03 §Cleanup sau ván).
      await client.query(
        `UPDATE public.invitations SET status = 'REVOKED'
          WHERE room_id = $1 AND status = 'PENDING'`,
        [roomId],
      );
      await client.query('DELETE FROM public.room_members WHERE room_id = $1', [roomId]);
      await client.query('DELETE FROM public.active_players WHERE room_id = $1', [roomId]);
      await client.query('DELETE FROM public.room_rematch_votes WHERE room_id = $1', [roomId]);

      notices.push({
        roomId,
        roomVersion: Number(closedRes.rows[0]!.room_version),
        userIds: members.rows.map((member) => member.user_id as string),
        matchId,
      });
    }

    return notices;
  }, p);

  for (const notice of closed) {
    emitAccessRevoked({
      roomId: notice.roomId,
      reason: 'ROOM_CLOSED',
      roomVersion: notice.roomVersion,
      userIds: notice.userIds,
    });
    if (notice.matchId) {
      void endMatchMedia(notice.matchId).catch(() => undefined);
    }
  }

  return { closedRooms: closed.length };
}

export interface SchedulerTickResult {
  settledMatches: number;
  finalizedMatches: number;
  expiredProposals: number;
  closedRooms: number;
  presenceTransitions: number;
  nextWakeAtMs: number | null;
}

export interface DeadlineSchedulerOptions {
  pool?: pg.Pool;
  /** Injectable clock (epoch ms); tests drive it with fake time. */
  now?: () => number;
  /** Upper bound between ticks, in ms (default 1000). */
  intervalMs?: number;
  onError?: (err: unknown) => void;
}

/**
 * Drives every persisted deadline. Wakes at the nearest deadline (bounded by
 * `intervalMs` so a lease that expires between deadlines is still noticed); all decisions
 * are re-derived from timestamps inside `settleMatchDeadlines`, so a late wake can never
 * produce a different outcome than an exact one.
 */
export class DeadlineScheduler {
  private timer: NodeJS.Timeout | null = null;
  private ticking = false;
  private readonly now: () => number;
  private readonly intervalMs: number;

  constructor(private readonly options: DeadlineSchedulerOptions = {}) {
    this.now = options.now ?? (() => Date.now());
    this.intervalMs = options.intervalMs ?? 1000;
  }

  get isRunning(): boolean {
    return this.timer !== null;
  }

  start(): void {
    if (this.timer !== null) return;
    this.schedule(0);
  }

  stop(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private schedule(delayMs: number): void {
    this.timer = setTimeout(() => {
      this.timer = null;
      void this.run();
    }, Math.max(0, delayMs));
    // Never keep the process alive on the scheduler alone.
    this.timer.unref?.();
  }

  private async run(): Promise<void> {
    if (this.ticking) return;
    this.ticking = true;
    try {
      const result = await this.tick();
      const waitMs =
        result.nextWakeAtMs === null
          ? this.intervalMs
          : Math.min(this.intervalMs, Math.max(0, result.nextWakeAtMs - this.now()));
      this.schedule(waitMs);
    } catch (err) {
      (this.options.onError ?? ((error: unknown) => console.error('Deadline scheduler error:', error)))(err);
      this.schedule(this.intervalMs);
    } finally {
      this.ticking = false;
    }
  }

  /** One pass; public so tests can drive the scheduler with a fake clock and no sleeps. */
  async tick(): Promise<SchedulerTickResult> {
    const pool = this.options.pool ?? getPool();
    const now = this.now();

    const transitions = await expireControlLeases(now, pool);
    for (const lease of transitions) {
      emitPresenceChanged({ userId: lease.userId, online: false, roomId: lease.roomId ?? undefined });
    }

    const deadlines = await collectActiveMatchDeadlines(now, pool);
    let settledMatches = 0;
    let finalizedMatches = 0;
    let expiredProposals = 0;
    const wakeCandidates: number[] = [];

    for (const entry of deadlines) {
      const due =
        decideMatchDeadline(entry.facts).kind !== 'NONE' ||
        decideProposalExpired(entry.proposal, now);
      if (due) {
        const settled = await settleMatchDeadlines(entry.matchId, now, pool);
        if (settled.finalized || settled.proposalExpired) settledMatches += 1;
        if (settled.finalized) finalizedMatches += 1;
        if (settled.proposalExpired) expiredProposals += 1;
      }
      const next = nextDeadlineAtMs(entry.facts);
      if (next !== null) wakeCandidates.push(next);
    }

    const roomsRes = await pool.query(
      `SELECT (EXTRACT(EPOCH FROM (finished_at + ($1::bigint * interval '1 millisecond'))) * 1000)::bigint AS close_at_ms
         FROM public.rooms
        WHERE status = 'FINISHED' AND finished_at IS NOT NULL
        ORDER BY finished_at ASC
        LIMIT 1`,
      [ROOM_CLOSE_AFTER_MS],
    );
    if (roomsRes.rowCount) wakeCandidates.push(Number(roomsRes.rows[0]!.close_at_ms));

    const closeResult = await closeExpiredRooms(now, pool);

    return {
      settledMatches,
      finalizedMatches,
      expiredProposals,
      closedRooms: closeResult.closedRooms,
      presenceTransitions: transitions.length,
      nextWakeAtMs: wakeCandidates.length > 0 ? Math.min(...wakeCandidates) : null,
    };
  }
}

export function createDeadlineScheduler(options: DeadlineSchedulerOptions = {}): DeadlineScheduler {
  return new DeadlineScheduler(options);
}

export async function recoverActiveMatchesOnBoot(pool?: pg.Pool): Promise<number> {
  const p = pool ?? getPool();

  return withTransaction(async (client) => {
    const activeRes = await client.query(
      "SELECT id, room_id, version FROM public.matches WHERE status = 'ACTIVE' FOR UPDATE",
    );
    const count = activeRes.rowCount ?? 0;
    if (count === 0) return 0;

    const outcome: Outcome = { winner: null, reason: 'SERVER_RESTART' };

    for (const match of activeRes.rows) {
      const roomId = (match.room_id as string | null) ?? null;
      // One shared terminal path: status INTERRUPTED, ended_at, RESULT event, slot release
      // and (guarded) room FINISHED. The stale leases of the previous boot are dropped.
      await finalizeMatchTx(client, { id: match.id as string, version: Number(match.version) }, outcome, roomId, {
        actorKey: null,
      });
      await client.query('DELETE FROM public.client_controls WHERE match_id = $1', [match.id]);
    }

    return count;
  }, p);
}
