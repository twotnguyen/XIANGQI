/**
 * Media reconciler: persisted transport generations + acknowledged SFU deletion.
 *
 * `media_transports` keeps one row per generation. A tuple is ROTATING while the
 * old room is being deleted; it is retired only after the SFU ack, and the new
 * generation is inserted in the same transaction. A failed `deleteRoom` never
 * bumps the generation: the tuple stays ROTATING (so no grant is issued) and the
 * caller reports MEDIA_UNAVAILABLE (spec 06 §Thu hồi luồng ứng dụng).
 */
import crypto from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';
import type pg from 'pg';
import { RoomServiceClient } from 'livekit-server-sdk';
import { getPool } from '../../db/pool.js';
import { withTransaction } from '../../db/transaction.js';
import { getLivekitConfig } from './transport.js';
import type {
  Audience,
  MediaKind,
  SourcePolicy,
  TransportAudience,
} from '@xiangqi/contracts';

export interface TransportRow {
  matchId: string;
  kind: MediaKind;
  audience: TransportAudience;
  generation: number;
  roomName: string;
  status: 'READY' | 'ROTATING' | 'RETIRED';
}

export interface TransportKey {
  kind: MediaKind;
  audience: TransportAudience;
}

/** The four independent transports every ONLINE match owns. */
export const TRANSPORT_TUPLES: readonly TransportKey[] = [
  { kind: 'CAMERA', audience: 'PRIVATE' },
  { kind: 'MICROPHONE', audience: 'PRIVATE' },
  { kind: 'CAMERA', audience: 'WATCH' },
  { kind: 'MICROPHONE', audience: 'WATCH' },
];

/** Minimal SFU room-admin surface (real client by default, fake in tests). */
export interface SfuRoomAdmin {
  deleteRoom(roomName: string): Promise<unknown>;
}

let injectedRoomAdmin: SfuRoomAdmin | null = null;
let defaultRoomAdmin: RoomServiceClient | null = null;

/** Test seam: inject a failing/recording SFU admin (no product bypass). */
export function setSfuRoomAdmin(admin: SfuRoomAdmin | null): void {
  injectedRoomAdmin = admin;
}

function roomAdmin(): SfuRoomAdmin {
  if (injectedRoomAdmin) return injectedRoomAdmin;
  if (!defaultRoomAdmin) {
    const config = getLivekitConfig();
    defaultRoomAdmin = new RoomServiceClient(config.url, config.apiKey, config.apiSecret);
  }
  return defaultRoomAdmin;
}

/** Opaque, never-reused room name carrying a 128-bit nonce (spec 06). */
export function createRoomName(matchId: string, kind: MediaKind, audience: TransportAudience, nonce?: string): string {
  const value = nonce ?? crypto.randomBytes(16).toString('hex');
  return `mq-${matchId}-${kind}-${audience}-${value}`;
}

/**
 * Serialize every media mutation of one match on a single session-level advisory
 * lock. Held across SFU calls on purpose (spec 06: serialize jobs per match) —
 * it is not a SQL transaction lock.
 */
export async function withMatchMediaLock<T>(
  matchId: string,
  fn: () => Promise<T>,
  pool?: pg.Pool,
): Promise<T> {
  const p = pool ?? getPool();
  const client = await p.connect();
  try {
    await client.query('SELECT pg_advisory_lock(hashtext($1), hashtext($2))', [
      'xiangqi_media',
      matchId,
    ]);
    return await fn();
  } finally {
    try {
      await client.query('SELECT pg_advisory_unlock(hashtext($1), hashtext($2))', [
        'xiangqi_media',
        matchId,
      ]);
    } finally {
      client.release();
    }
  }
}

function mapTransportRow(row: Record<string, unknown>): TransportRow {
  return {
    matchId: row['match_id'] as string,
    kind: row['kind'] as MediaKind,
    audience: row['audience'] as TransportAudience,
    generation: Number(row['generation']),
    roomName: row['room_name'] as string,
    status: row['status'] as TransportRow['status'],
  };
}

/** Active (READY or ROTATING) transports of a match. */
export async function loadActiveTransports(
  matchId: string,
  pool?: pg.Pool,
  client?: pg.PoolClient,
): Promise<TransportRow[]> {
  const runner = client ?? (pool ?? getPool());
  const res = await runner.query(
    `SELECT match_id, kind, audience, generation, room_name, status
       FROM public.media_transports
      WHERE match_id = $1 AND status IN ('READY', 'ROTATING')
      ORDER BY kind, audience`,
    [matchId],
  );
  return res.rows.map(mapTransportRow);
}

/**
 * Ensure the four tuples exist for a match, generating a fresh READY generation
 * when none is active (first session, or after restart retired the old ones).
 * Never reuses a retired room name; generation numbers keep increasing.
 */
export async function ensureMatchTransports(
  matchId: string,
  pool?: pg.Pool,
): Promise<TransportRow[]> {
  return withTransaction(async (client) => {
    // Generation numbers come from MAX(generation)+1, so two concurrent sessions for the
    // same match would insert the same primary key (23505). Serialize per match.
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [`media:${matchId}`]);
    const active = await loadActiveTransports(matchId, undefined, client);
    const have: Record<string, true> = {};
    for (const row of active) have[`${row.kind}:${row.audience}`] = true;

    for (const tuple of TRANSPORT_TUPLES) {
      if (have[`${tuple.kind}:${tuple.audience}`]) continue;
      const maxRes = await client.query(
        `SELECT COALESCE(MAX(generation), 0)::bigint AS max_gen
           FROM public.media_transports
          WHERE match_id = $1 AND kind = $2 AND audience = $3`,
        [matchId, tuple.kind, tuple.audience],
      );
      const generation = Number(maxRes.rows[0].max_gen) + 1;
      await client.query(
        `INSERT INTO public.media_transports (match_id, kind, audience, generation, room_name, status)
         VALUES ($1, $2, $3, $4, $5, 'READY')
         ON CONFLICT (match_id, kind, audience, generation) DO NOTHING`,
        [matchId, tuple.kind, tuple.audience, generation, createRoomName(matchId, tuple.kind, tuple.audience)],
      );
    }

    return loadActiveTransports(matchId, undefined, client);
  }, pool);
}

function isRoomMissing(err: unknown): boolean {
  const e = err as { code?: string; message?: string; metadata?: Record<string, string> };
  const code = e?.code ?? e?.metadata?.['twirp_code'] ?? '';
  const message = e?.message ?? '';
  return /not_found|not found|does not exist|no such room/i.test(`${code} ${message}`);
}

const RETRY_DELAYS_MS = [1000, 2000, 5000];

/** Delete a room and wait for the SFU ack; retries 1/2/5s (spec 06). */
async function deleteRoomAcknowledged(
  roomName: string,
  maxAttempts = RETRY_DELAYS_MS.length + 1,
): Promise<{ ok: boolean; error?: string }> {
  let lastError = 'unknown SFU error';
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      await roomAdmin().deleteRoom(roomName);
      return { ok: true };
    } catch (err) {
      if (isRoomMissing(err)) return { ok: true };
      lastError = err instanceof Error ? err.message : String(err);
      const waitMs = RETRY_DELAYS_MS[attempt];
      if (waitMs !== undefined && attempt + 1 < maxAttempts) {
        await delay(waitMs);
      }
    }
  }
  return { ok: false, error: lastError };
}

/** Which transport tuples a policy change must rotate (spec 06). */
export function planRotationTargets(
  applied: SourcePolicy,
  kind: MediaKind,
  nextAudience: Audience,
): TransportKey[] {
  const previous = kind === 'CAMERA' ? applied.camera : applied.microphone;
  const targets: TransportKey[] = [];
  if (nextAudience === 'OFF' && previous !== 'OFF') {
    // An old publish token must not keep feeding the room the opponent uses.
    targets.push({ kind, audience: 'PRIVATE' });
  }
  if (previous === 'OPPONENT_AND_SPECTATORS' && nextAudience !== 'OPPONENT_AND_SPECTATORS') {
    // Both publishers' WATCH rooms rotate so spectators lose the source now.
    targets.push({ kind, audience: 'WATCH' });
  }
  return targets;
}

export interface RotationOutcome {
  ok: boolean;
  rotated: TransportRow[];
  failed: { key: TransportKey; error: string }[];
}

export interface RotationOptions {
  /** Max `deleteRoom` attempts per tuple; the HTTP path fails fast with 1. */
  attempts?: number;
}

/**
 * Rotate the given tuples: mark ROTATING, delete the old room, then retire it and
 * publish a fresh generation. Failure leaves the tuple ROTATING (grants blocked)
 * and reports the error instead of pretending success.
 *
 * Callers MUST already hold the match media lock (`withMatchMediaLock`).
 */
export async function rotateTransports(
  matchId: string,
  targets: TransportKey[],
  pool?: pg.Pool,
  options?: RotationOptions,
): Promise<RotationOutcome> {
  const rotated: TransportRow[] = [];
  const failed: RotationOutcome['failed'] = [];

  for (const target of targets) {
    const { kind, audience } = target;
    // 1. Claim the active generation as ROTATING (durable, survives a crash).
    const claimed = await withTransaction(async (client) => {
      await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [`media:${matchId}`]);
      const res = await client.query(
        `SELECT match_id, kind, audience, generation, room_name, status
           FROM public.media_transports
          WHERE match_id = $1 AND kind = $2 AND audience = $3
            AND status IN ('READY', 'ROTATING')
          FOR UPDATE`,
        [matchId, kind, audience],
      );
      if (res.rowCount === 0) return null;
      const row = mapTransportRow(res.rows[0]);
      if (row.status === 'READY') {
        await client.query(
          `UPDATE public.media_transports SET status = 'ROTATING'
            WHERE match_id = $1 AND kind = $2 AND audience = $3 AND generation = $4`,
          [matchId, kind, audience, row.generation],
        );
      }
      return row;
    }, pool);

    if (!claimed) continue;

    // 2. External effect outside any SQL transaction.
    const ack = await deleteRoomAcknowledged(claimed.roomName, options?.attempts);
    if (!ack.ok) {
      failed.push({ key: target, error: ack.error ?? 'SFU deleteRoom failed' });
      continue;
    }

    // 3. ACK observed: retire the old name and publish the next generation.
    const next = await withTransaction(async (client) => {
      await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [`media:${matchId}`]);
      await client.query(
        `UPDATE public.media_transports
            SET status = 'RETIRED', retired_at = now()
          WHERE match_id = $1 AND kind = $2 AND audience = $3 AND generation = $4`,
        [matchId, kind, audience, claimed.generation],
      );
      const generation = claimed.generation + 1;
      await client.query(
        `INSERT INTO public.media_transports (match_id, kind, audience, generation, room_name, status)
         VALUES ($1, $2, $3, $4, $5, 'READY')
         ON CONFLICT (match_id, kind, audience, generation) DO NOTHING`,
        [matchId, kind, audience, generation, createRoomName(matchId, kind, audience)],
      );
      const active = await loadActiveTransports(matchId, undefined, client);
      return active.find((row) => row.kind === kind && row.audience === audience) ?? null;
    }, pool);

    if (next) rotated.push(next);
  }

  return { ok: failed.length === 0, rotated, failed };
}

/** Delete every transport of a match (match end): no new generation is created. */
export async function deleteMatchTransports(
  matchId: string,
  pool?: pg.Pool,
): Promise<{ retired: number; failed: { key: TransportKey; error: string }[] }> {
  const active = await loadActiveTransports(matchId, pool);
  const failed: { key: TransportKey; error: string }[] = [];
  let retired = 0;

  for (const row of active) {
    const ack = await deleteRoomAcknowledged(row.roomName);
    if (!ack.ok) {
      failed.push({ key: { kind: row.kind, audience: row.audience }, error: ack.error ?? 'SFU deleteRoom failed' });
      continue;
    }
    await withTransaction(async (client) => {
      await client.query(
        `UPDATE public.media_transports
            SET status = 'RETIRED', retired_at = now()
          WHERE match_id = $1 AND kind = $2 AND audience = $3 AND generation = $4`,
        [matchId, row.kind, row.audience, row.generation],
      );
    }, pool);
    retired += 1;
  }

  return { retired, failed };
}

/**
 * Boot recovery (spec 06 §Restart): every desired policy returns to OFF, every
 * surviving generation is retired on the SFU before a new session may mint
 * grants. Idempotent; the next session creates generation N+1.
 */
export async function recoverMediaOnBoot(
  pool?: pg.Pool,
): Promise<{ policiesReset: number; transportsRetired: number; failed: number }> {
  const p = pool ?? getPool();

  const policiesReset = await withTransaction(async (client) => {
    const res = await client.query(
      `UPDATE public.media_policies
          SET camera_audience = 'OFF',
              microphone_audience = 'OFF',
              applied_camera_audience = 'OFF',
              applied_microphone_audience = 'OFF',
              policy_version = policy_version + 1,
              applied_version = policy_version + 1,
              status = 'APPLIED',
              epoch = epoch + 1,
              updated_at = now()
        WHERE camera_audience <> 'OFF'
           OR microphone_audience <> 'OFF'
           OR status = 'APPLYING'`,
    );
    return res.rowCount ?? 0;
  }, p);

  const matchRes = await p.query(
    `SELECT DISTINCT match_id FROM public.media_transports WHERE status IN ('READY', 'ROTATING')`,
  );
  let transportsRetired = 0;
  let failed = 0;
  for (const row of matchRes.rows) {
    const matchId = row.match_id as string;
    const outcome = await withMatchMediaLock(matchId, () => deleteMatchTransports(matchId, p), p);
    transportsRetired += outcome.retired;
    failed += outcome.failed.length;
  }

  return { policiesReset, transportsRetired, failed };
}
