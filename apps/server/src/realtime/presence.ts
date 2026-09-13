/**
 * Presence and control leases (spec 03 §"Mất mạng/restart", spec 04 Socket.IO).
 *
 * Presence is derived from `public.client_controls` — the row that already carries the
 * controller context (room/match), the lease and the disconnect marker. The in-memory
 * `PresenceTracker` below is kept as a cheap local mirror for DTOs that cannot read the
 * DB (room member lists); the authoritative source is `client_controls`.
 *
 * Lease duration 30s, heartbeat expected every 10s. A known disconnect is stamped
 * immediately; otherwise the lease is stamped when it expires, and the 60s grace runs
 * from that stamped instant.
 */
import type pg from 'pg';
import { getPool } from '../db/pool.js';

/** Controller lease duration (spec 03: lease 30 giây). */
export const LEASE_DURATION_MS = 30000;
/** Client heartbeat cadence (spec 03: heartbeat ứng dụng 10 giây). */
export const HEARTBEAT_INTERVAL_MS = 10000;
/** Disconnect grace before a match is lost (spec 03: khoảng 60 giây). */
export const DISCONNECT_GRACE_MS = 60000;

/** Minimal query surface shared by pg.Pool and pg.PoolClient. */
export interface QueryRunner {
  query(text: string, values?: unknown[]): Promise<{ rows: unknown[]; rowCount: number | null }>;
}

export interface ControlLease {
  userId: string;
  roomId: string | null;
  matchId: string | null;
  controllerId: string;
  controllerTabId: string;
  controlEpoch: number;
  leaseUntilMs: number;
  disconnectedAtMs: number | null;
}

export interface PresenceEntryDTO {
  userId: string;
  online: boolean;
  disconnectDeadlineMs: number | null;
}

const LEASE_COLUMNS = `
  user_id, room_id, match_id, controller_id, controller_tab_id, control_epoch,
  (EXTRACT(EPOCH FROM lease_until) * 1000)::bigint AS lease_until_ms,
  CASE WHEN disconnected_at IS NULL THEN NULL
       ELSE (EXTRACT(EPOCH FROM disconnected_at) * 1000)::bigint END AS disconnected_at_ms`;

function mapLeaseRow(row: Record<string, unknown>): ControlLease {
  return {
    userId: row['user_id'] as string,
    roomId: (row['room_id'] as string | null) ?? null,
    matchId: (row['match_id'] as string | null) ?? null,
    controllerId: row['controller_id'] as string,
    controllerTabId: row['controller_tab_id'] as string,
    controlEpoch: Number(row['control_epoch']),
    leaseUntilMs: Number(row['lease_until_ms']),
    disconnectedAtMs:
      row['disconnected_at_ms'] === null || row['disconnected_at_ms'] === undefined
        ? null
        : Number(row['disconnected_at_ms']),
  };
}

function controlRequired(message = 'Cần quyền điều khiển hợp lệ'): never {
  throw { statusCode: 403, code: 'CONTROL_REQUIRED', message };
}

/** The caller's lease row, or null when the user has no control context yet. */
export async function loadControlLease(
  userId: string,
  pool?: pg.Pool | pg.PoolClient,
): Promise<ControlLease | null> {
  const runner = pool ?? getPool();
  const res = await runner.query(
    `SELECT ${LEASE_COLUMNS} FROM public.client_controls WHERE user_id = $1`,
    [userId],
  );
  const row = res.rows[0] as Record<string, unknown> | undefined;
  return row ? mapLeaseRow(row) : null;
}

/**
 * Refresh the authenticated controller tab's lease (`presence:heartbeat`).
 *
 * Only the tab that owns the controller lease may refresh it (spec 03: an observer tab of
 * the same player is not "ready to play"). Rejects with CONTROL_REQUIRED for a stale tab.
 */
export async function refreshControlLease(
  userId: string,
  tabId: string,
  nowMs: number = Date.now(),
  pool?: pg.Pool | pg.PoolClient,
): Promise<ControlLease> {
  const runner = pool ?? getPool();
  const existing = await loadControlLease(userId, runner);
  if (!existing) {
    throw { statusCode: 409, code: 'CONFLICT', message: 'Bạn chưa có ngữ cảnh phòng hoặc ván' };
  }
  if (existing.controllerTabId !== tabId) controlRequired('Tab này không giữ quyền điều khiển');

  const res = await runner.query(
    `UPDATE public.client_controls
        SET lease_until = to_timestamp($2::double precision / 1000.0),
            disconnected_at = NULL,
            updated_at = now()
      WHERE user_id = $1 AND controller_tab_id = $3
      RETURNING ${LEASE_COLUMNS}`,
    [userId, nowMs + LEASE_DURATION_MS, tabId],
  );
  const row = res.rows[0] as Record<string, unknown> | undefined;
  if (!row) controlRequired();
  return mapLeaseRow(row);
}

/**
 * Mark a controller tab as disconnected (socket closed). Only the tab that holds the
 * lease counts; a closed observer tab changes nothing (spec 03).
 * Returns the stored transition so the caller can emit `presence:changed` once.
 */
export async function markControllerDisconnected(
  userId: string,
  tabId: string,
  nowMs: number = Date.now(),
  pool?: pg.Pool | pg.PoolClient,
): Promise<ControlLease | null> {
  const runner = pool ?? getPool();
  const existing = await loadControlLease(userId, runner);
  if (!existing || existing.controllerTabId !== tabId) return null;
  const alreadyOffline = existing.disconnectedAtMs !== null;
  const res = await runner.query(
    `UPDATE public.client_controls
        SET disconnected_at = COALESCE(disconnected_at, to_timestamp($3::double precision / 1000.0)),
            updated_at = now()
      WHERE user_id = $1 AND controller_tab_id = $2
      RETURNING ${LEASE_COLUMNS}`,
    [userId, tabId, nowMs],
  );
  const row = res.rows[0] as Record<string, unknown> | undefined;
  if (!row) return null;
  const lease = mapLeaseRow(row);
  return alreadyOffline ? null : lease;
}

/**
 * Stamp every lease that ran out without a heartbeat, using the lease expiry itself as the
 * detection instant (spec 03: unknown disconnect is only known when the lease ends).
 * Returns the rows that transitioned online → offline exactly once.
 */
export async function expireControlLeases(
  nowMs: number = Date.now(),
  pool?: pg.Pool,
): Promise<ControlLease[]> {
  const p = pool ?? getPool();
  const res = await p.query(
    `UPDATE public.client_controls
        SET disconnected_at = lease_until, updated_at = now()
      WHERE disconnected_at IS NULL
        AND lease_until <= to_timestamp($1::double precision / 1000.0)
      RETURNING ${LEASE_COLUMNS}`,
    [nowMs],
  );
  return res.rows.map((row) => mapLeaseRow(row as Record<string, unknown>));
}

function isOnline(lease: ControlLease, nowMs: number): boolean {
  return lease.disconnectedAtMs === null && lease.leaseUntilMs > nowMs;
}

/** Lease timestamps shared by the persisted lease and the deadline facts. */
export interface LeaseTimestamps {
  leaseUntilMs: number;
  disconnectedAtMs: number | null;
}

/** Instant a lease was detected offline (known disconnect, else lease expiry). */
export function offlineDetectedAtMs(lease: LeaseTimestamps): number {
  return lease.disconnectedAtMs ?? lease.leaseUntilMs;
}

/**
 * Presence list for a match snapshot: one entry per participant, derived from the real
 * lease rows. `disconnectDeadlineMs` is the instant the 60s grace runs out, or null while
 * the participant is online (spec 04 `MatchSnapshot.presence`).
 */
export async function loadMatchPresence(
  runner: QueryRunner,
  participants: (string | null)[],
  nowMs: number,
): Promise<PresenceEntryDTO[]> {
  const ids = participants.filter((id): id is string => id !== null);
  if (ids.length === 0) return [];

  const res = await runner.query(
    `SELECT ${LEASE_COLUMNS} FROM public.client_controls WHERE user_id = ANY($1::uuid[])`,
    [ids],
  );
  const leases = new Map<string, ControlLease>(
    res.rows.map((row) => {
      const lease = mapLeaseRow(row as Record<string, unknown>);
      return [lease.userId, lease];
    }),
  );

  return ids.map((userId) => {
    const lease = leases.get(userId);
    const online = lease !== undefined && isOnline(lease, nowMs);
    return {
      userId,
      online,
      disconnectDeadlineMs:
        lease && !online ? offlineDetectedAtMs(lease) + DISCONNECT_GRACE_MS : null,
    };
  });
}

/**
 * In-memory presence tracker.
 * Tracks connected tabs per user, leases, and heartbeat.
 * Multiple tabs from the same user = 1 online user.
 */
export class PresenceTracker {
  // Map<userId, Map<tabId, expiresAtMonoMs>>
  private userTabs = new Map<string, Map<string, number>>();

  /**
   * Heartbeat or connect from a tab.
   * Extends the lease for this specific tab.
   */
  heartbeat(userId: string, tabId: string, nowMonoMs: number): boolean {
    let tabs = this.userTabs.get(userId);
    const wasOnline = this.isUserOnline(userId, nowMonoMs);

    if (!tabs) {
      tabs = new Map();
      this.userTabs.set(userId, tabs);
    }

    tabs.set(tabId, nowMonoMs + LEASE_DURATION_MS);
    const isOnline = true;

    // Return true if online state transitioned from false to true
    return !wasOnline && isOnline;
  }

  /**
   * Tab disconnects.
   * Returns true if user transitioned from online to offline.
   */
  disconnect(userId: string, tabId: string, nowMonoMs: number): boolean {
    const tabs = this.userTabs.get(userId);
    if (!tabs) return false;

    const wasOnline = this.isUserOnline(userId, nowMonoMs);
    tabs.delete(tabId);

    if (tabs.size === 0) {
      this.userTabs.delete(userId);
    }

    const isOnline = this.isUserOnline(userId, nowMonoMs);
    return wasOnline && !isOnline;
  }

  /**
   * Check if a user is currently online (has at least 1 active tab lease).
   */
  isUserOnline(userId: string, nowMonoMs: number): boolean {
    const tabs = this.userTabs.get(userId);
    if (!tabs || tabs.size === 0) return false;

    // Check if any tab has a non-expired lease
    for (const [tabId, expiresAt] of tabs.entries()) {
      if (expiresAt > nowMonoMs) {
        return true;
      } else {
        // Lazy cleanup of expired tab
        tabs.delete(tabId);
      }
    }

    if (tabs.size === 0) {
      this.userTabs.delete(userId);
    }

    return false;
  }

  /**
   * Prune all expired leases across all users.
   */
  prune(nowMonoMs: number): string[] {
    const becameOffline: string[] = [];

    for (const [userId, tabs] of this.userTabs.entries()) {
      for (const [tabId, expiresAt] of tabs.entries()) {
        if (expiresAt <= nowMonoMs) {
          tabs.delete(tabId);
        }
      }
      if (tabs.size === 0) {
        this.userTabs.delete(userId);
        becameOffline.push(userId);
      }
    }

    return becameOffline;
  }
}

export const defaultPresence = new PresenceTracker();
