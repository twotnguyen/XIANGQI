/**
 * Media domain service (spec 06 "Media trực tiếp và quyền theo track").
 *
 * Policy is persisted in `media_policies` with optimistic concurrency on
 * `policy_version` (one counter per user, camera and microphone share it).
 * Transport generations live in `media_transports`; a rotation that cannot get
 * an ack from the SFU leaves the desired policy committed and the state
 * APPLYING, and surfaces MEDIA_UNAVAILABLE instead of a false APPLIED.
 */
import type pg from 'pg';
import { getPool } from '../../db/pool.js';
import { withTransaction } from '../../db/transaction.js';
import { emitMediaPolicy } from '../../realtime/events.js';
import { onAccessRevoked } from '../rooms/spectators.js';
import { requireControlLease } from '../rooms/service.js';
import { buildTransportGrants, type TransportRoom } from './transport.js';
import {
  deleteMatchTransports,
  ensureMatchTransports,
  loadActiveTransports,
  planRotationTargets,
  rotateTransports,
  withMatchMediaLock,
  type TransportKey,
} from './reconciler.js';
import type {
  Audience,
  MediaKind,
  MediaPolicyList,
  MediaSession,
  PolicyState,
} from '@xiangqi/contracts';

export class MediaError extends Error {
  statusCode: number;
  code: string;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

export interface ControlHeaders {
  controlId?: string;
  controlEpoch?: string;
}

interface PolicyRow {
  match_id: string;
  user_id: string;
  camera_audience: Audience;
  microphone_audience: Audience;
  policy_version: number | string;
  applied_camera_audience: Audience;
  applied_microphone_audience: Audience;
  applied_version: number | string;
  status: 'APPLYING' | 'APPLIED';
  epoch: number | string;
}

function toPolicyState(row: PolicyRow): PolicyState {
  return {
    userId: row.user_id,
    policyVersion: Number(row.policy_version),
    appliedVersion: Number(row.applied_version),
    desired: { camera: row.camera_audience, microphone: row.microphone_audience },
    applied: { camera: row.applied_camera_audience, microphone: row.applied_microphone_audience },
    status: row.status,
  };
}

function defaultPolicyState(userId: string): PolicyState {
  return {
    userId,
    policyVersion: 0,
    appliedVersion: 0,
    desired: { camera: 'OFF', microphone: 'OFF' },
    applied: { camera: 'OFF', microphone: 'OFF' },
    status: 'APPLIED',
  };
}

interface MatchContext {
  matchId: string;
  roomId: string;
  mode: 'ONLINE' | 'AI';
  status: 'ACTIVE' | 'FINISHED' | 'INTERRUPTED';
  redUserId: string | null;
  blackUserId: string | null;
  role: 'PLAYER' | 'SPECTATOR' | null;
}

async function loadMatchContext(
  matchId: string,
  userId: string,
  runner: pg.Pool | pg.PoolClient,
): Promise<MatchContext> {
  const res = await runner.query(
    `SELECT m.id, m.room_id, m.mode, m.status, m.red_user_id, m.black_user_id, rm.role
       FROM public.matches m
       LEFT JOIN public.room_members rm ON rm.room_id = m.room_id AND rm.user_id = $2
      WHERE m.id = $1`,
    [matchId, userId],
  );
  if (res.rowCount === 0) {
    throw new MediaError(404, 'NOT_FOUND', 'Không tìm thấy ván đấu');
  }
  const row = res.rows[0];
  return {
    matchId: row.id as string,
    roomId: row.room_id as string,
    mode: row.mode as MatchContext['mode'],
    status: row.status as MatchContext['status'],
    redUserId: (row.red_user_id as string | null) ?? null,
    blackUserId: (row.black_user_id as string | null) ?? null,
    role: (row.role as MatchContext['role']) ?? null,
  };
}

/** Membership of the ONLINE match's room; throws otherwise. */
async function requireOnlineMember(
  matchId: string,
  userId: string,
  runner: pg.Pool | pg.PoolClient,
): Promise<MatchContext & { role: 'PLAYER' | 'SPECTATOR' }> {
  const ctx = await loadMatchContext(matchId, userId, runner);
  if (ctx.mode !== 'ONLINE' || !ctx.roomId) {
    throw new MediaError(403, 'FORBIDDEN', 'Ván này không hỗ trợ media trực tiếp');
  }
  if (!ctx.role) {
    throw new MediaError(403, 'FORBIDDEN', 'Bạn không phải thành viên của phòng này');
  }
  return { ...ctx, role: ctx.role };
}

/**
 * Verify the controller lease headers against `client_controls` (spec 04) via the
 * shared guard in the rooms module, and return the epoch used in the LiveKit
 * identity `<userUUID>-<controlEpoch>`.
 */
async function requireMediaControlLease(
  userId: string,
  matchId: string,
  roomId: string,
  headers: ControlHeaders,
  pool: pg.Pool,
): Promise<number> {
  const lease = await requireControlLease(
    userId,
    headers.controlId,
    headers.controlEpoch,
    { roomId, matchId },
    pool,
  );
  return lease.controlEpoch;
}

async function ensurePolicyRow(
  client: pg.PoolClient,
  matchId: string,
  userId: string,
): Promise<void> {
  await client.query(
    `INSERT INTO public.media_policies (match_id, user_id)
     VALUES ($1, $2)
     ON CONFLICT (match_id, user_id) DO NOTHING`,
    [matchId, userId],
  );
}

async function loadPolicyRow(
  client: pg.PoolClient,
  matchId: string,
  userId: string,
  forUpdate = false,
): Promise<PolicyRow> {
  const res = await client.query(
    `SELECT * FROM public.media_policies WHERE match_id = $1 AND user_id = $2${forUpdate ? ' FOR UPDATE' : ''}`,
    [matchId, userId],
  );
  return res.rows[0] as PolicyRow;
}

async function loadPolicyStates(
  runner: pg.Pool | pg.PoolClient,
  matchId: string,
  players: (string | null)[],
): Promise<PolicyState[]> {
  const res = await runner.query(
    `SELECT * FROM public.media_policies WHERE match_id = $1`,
    [matchId],
  );
  const rows = res.rows as PolicyRow[];
  return players
    .filter((id): id is string => id !== null)
    .map((id) => {
      const row = rows.find((candidate) => candidate.user_id === id);
      return row ? toPolicyState(row) : defaultPolicyState(id);
    });
}

function effectsFromTargets(
  targets: TransportKey[],
  transports: { kind: MediaKind; audience: string; generation: number; roomName: string }[],
): Record<string, unknown>[] {
  return targets.map((target) => {
    const room = transports.find((row) => row.kind === target.kind && row.audience === target.audience);
    return {
      kind: target.kind,
      audience: target.audience,
      generation: room?.generation ?? 0,
      roomName: room?.roomName ?? '',
      identities: [],
      publishRevoked: target.audience === 'WATCH',
      deleteAcknowledged: false,
    };
  });
}

interface JobInput {
  matchId: string;
  desiredVersions: { userId: string; policyVersion: number; epoch: number }[];
  effects: Record<string, unknown>[];
  status: 'PENDING' | 'RUNNING' | 'RETRY' | 'FAILED' | 'SUCCEEDED';
  attempts: number;
  lastError: string | null;
}

/** Idempotent per-match job row: external effects are coalesced, never duplicated. */
async function upsertPolicyJob(client: pg.PoolClient, job: JobInput): Promise<void> {
  const nextAttemptAt = job.status === 'RETRY' ? new Date(Date.now() + 1000) : null;
  await client.query(
    `INSERT INTO public.media_policy_jobs
       (match_id, reason, desired_versions, target_watch_epoch, effects, status, attempts, last_error, next_attempt_at, completed_at, updated_at)
     VALUES ($1, 'POLICY', $2::jsonb, 0, $3::jsonb, $4, $5, $6, $7,
             CASE WHEN $4 = 'SUCCEEDED' THEN now() ELSE NULL END, now())
     ON CONFLICT (match_id) WHERE status <> 'SUCCEEDED'
     DO UPDATE SET
       desired_versions = EXCLUDED.desired_versions,
       effects = EXCLUDED.effects,
       status = EXCLUDED.status,
       attempts = EXCLUDED.attempts,
       last_error = EXCLUDED.last_error,
       next_attempt_at = EXCLUDED.next_attempt_at,
       updated_at = now(),
       completed_at = CASE WHEN EXCLUDED.status = 'SUCCEEDED' THEN now() ELSE NULL END`,
    [
      job.matchId,
      JSON.stringify(job.desiredVersions),
      JSON.stringify(job.effects),
      job.status,
      job.attempts,
      job.lastError,
      nextAttemptAt,
    ],
  );
}

export interface UpdateMediaPolicyParams {
  userId: string;
  matchId: string;
  kind: MediaKind;
  audience: Audience;
  expectedVersion: number;
  headers: ControlHeaders;
  pool?: pg.Pool;
}

export interface UpdateMediaPolicyResult {
  policy: PolicyState;
  mediaUnavailable: boolean;
}

/**
 * `PATCH /media/policy`: commit desired → external SFU effect → APPLIED.
 * A version mismatch is CONFLICT; a failed SFU deletion keeps APPLYING.
 */
export async function updateMediaPolicy(
  params: UpdateMediaPolicyParams,
): Promise<UpdateMediaPolicyResult> {
  const { userId, matchId, kind, audience, expectedVersion, headers } = params;
  const p = params.pool ?? getPool();

  return withMatchMediaLock(
    matchId,
    async () => {
      const ctx = await requireOnlineMember(matchId, userId, p);
      if (ctx.status !== 'ACTIVE') {
        throw new MediaError(409, 'MATCH_ENDED', 'Ván đấu đã kết thúc');
      }
      if (ctx.role !== 'PLAYER') {
        throw new MediaError(403, 'FORBIDDEN', 'Chỉ người chơi mới có quyền đổi chế độ chia sẻ');
      }
      await requireMediaControlLease(userId, matchId, ctx.roomId, headers, p);

      // 1. Commit the desired state under optimistic concurrency.
      const committed = await withTransaction(async (client) => {
        await ensurePolicyRow(client, matchId, userId);
        const before = await loadPolicyRow(client, matchId, userId, true);
        if (Number(before.policy_version) !== expectedVersion) {
          throw new MediaError(409, 'CONFLICT', 'policyVersion đã thay đổi, hãy đọc lại chính sách');
        }
        const nextVersion = expectedVersion + 1;
        const camera = kind === 'CAMERA' ? audience : before.camera_audience;
        const microphone = kind === 'MICROPHONE' ? audience : before.microphone_audience;
        const updated = await client.query(
          `UPDATE public.media_policies
              SET camera_audience = $1,
                  microphone_audience = $2,
                  policy_version = $3,
                  status = 'APPLYING',
                  updated_at = now()
            WHERE match_id = $4 AND user_id = $5 AND policy_version = $6
            RETURNING *`,
          [camera, microphone, nextVersion, matchId, userId, expectedVersion],
        );
        if (updated.rowCount === 0) {
          throw new MediaError(409, 'CONFLICT', 'policyVersion đã thay đổi, hãy đọc lại chính sách');
        }
        const after = updated.rows[0] as PolicyRow;

        const targets = planRotationTargets(toPolicyState(before).applied, kind, audience);
        const active = await loadActiveTransports(matchId, undefined, client);
        await upsertPolicyJob(client, {
          matchId,
          desiredVersions: [{ userId, policyVersion: nextVersion, epoch: Number(after.epoch) }],
          effects: effectsFromTargets(targets, active),
          status: 'RUNNING',
          attempts: 0,
          lastError: null,
        });

        return { before: toPolicyState(before), after: toPolicyState(after), targets };
      }, p);

      // 2. External effect outside the SQL transaction (never inside a lock tx).
      if (committed.targets.length > 0) {
        const outcome = await rotateTransports(matchId, committed.targets, p, { attempts: 1 });
        if (!outcome.ok) {
          const message = outcome.failed.map((f) => `${f.key.kind}/${f.key.audience}: ${f.error}`).join('; ');
          await withTransaction(async (client) => {
            await upsertPolicyJob(client, {
              matchId,
              desiredVersions: [{ userId, policyVersion: committed.after.policyVersion, epoch: 0 }],
              effects: effectsFromTargets(committed.targets, []),
              status: 'RETRY',
              attempts: 1,
              lastError: message.slice(0, 1000),
            });
          }, p);
          return { policy: { ...committed.after, status: 'APPLYING' }, mediaUnavailable: true };
        }
      }

      // 3. SFU ack observed: publish the applied state if this version still stands.
      const final = await withTransaction(async (client) => {
        const row = await loadPolicyRow(client, matchId, userId, true);
        const stillCurrent = Number(row.policy_version) === committed.after.policyVersion;
        if (!stillCurrent) return toPolicyState(row);

        const active = await loadActiveTransports(matchId, undefined, client);
        const rotating = active.some((transport) => transport.status === 'ROTATING');
        if (rotating) return toPolicyState(row);

        const applied = await client.query(
          `UPDATE public.media_policies
              SET applied_camera_audience = camera_audience,
                  applied_microphone_audience = microphone_audience,
                  applied_version = policy_version,
                  status = 'APPLIED',
                  updated_at = now()
            WHERE match_id = $1 AND user_id = $2 AND policy_version = $3
            RETURNING *`,
          [matchId, userId, committed.after.policyVersion],
        );
        await upsertPolicyJob(client, {
          matchId,
          desiredVersions: [{ userId, policyVersion: committed.after.policyVersion, epoch: Number(row.epoch) }],
          effects: [],
          status: 'SUCCEEDED',
          attempts: 0,
          lastError: null,
        });
        return toPolicyState((applied.rows[0] as PolicyRow | undefined) ?? row);
      }, p);

      emitMediaPolicy({ matchId, roomId: ctx.roomId, policy: final });
      return { policy: final, mediaUnavailable: false };
    },
    p,
  );
}

/** `GET /media/policy?matchId=...`: read-only state for members (no controller). */
export async function getMediaPolicies(
  userId: string,
  matchId: string,
  pool?: pg.Pool,
): Promise<MediaPolicyList> {
  const p = pool ?? getPool();
  const ctx = await requireOnlineMember(matchId, userId, p);
  const policies = await loadPolicyStates(p, matchId, [ctx.redUserId, ctx.blackUserId]);
  return { policies };
}

export interface MediaSessionParams {
  userId: string;
  roomId: string;
  matchId: string;
  controllerId: string;
  headers: ControlHeaders;
  pool?: pg.Pool;
}

/** `POST /media/session`: server-derived room names and grants, no-store. */
export async function getMediaSession(params: MediaSessionParams): Promise<MediaSession> {
  const { userId, roomId, matchId, controllerId, headers } = params;
  const p = params.pool ?? getPool();

  const ctx = await requireOnlineMember(matchId, userId, p);
  if (ctx.roomId !== roomId) {
    throw new MediaError(404, 'NOT_FOUND', 'Ván đấu không thuộc phòng này');
  }
  if (ctx.status !== 'ACTIVE') {
    throw new MediaError(409, 'MATCH_ENDED', 'Ván đấu đã kết thúc');
  }
  const controlEpoch = await requireMediaControlLease(userId, matchId, ctx.roomId, headers, p);
  if (headers.controlId !== controllerId) {
    throw new MediaError(403, 'FORBIDDEN', 'controllerId trong body phải khớp X-Control-Id');
  }

  await ensureMatchTransports(matchId, p);
  if (ctx.role === 'PLAYER') {
    await withTransaction(async (client) => {
      await ensurePolicyRow(client, matchId, userId);
    }, p);
  }

  const policies = await loadPolicyStates(p, matchId, [ctx.redUserId, ctx.blackUserId]);
  const ownPolicy = ctx.role === 'PLAYER' ? policies.find((row) => row.userId === userId) ?? null : null;

  const roomsBefore = await loadActiveTransports(matchId, p);
  assertNoRotation(roomsBefore);

  const grants = await buildTransportGrants({
    userId,
    controlEpoch,
    role: ctx.role,
    ownPolicy: ownPolicy?.desired ?? { camera: 'OFF', microphone: 'OFF' },
    rooms: roomsBefore.map(toTransportRoom),
  });

  // Late issuance check: if a rotation started meanwhile, refuse the stale plan.
  const roomsAfter = await loadActiveTransports(matchId, p);
  assertNoRotation(roomsAfter);
  if (roomsAfter.some((row) => !roomsBefore.some((before) => before.roomName === row.roomName))) {
    throw new MediaError(503, 'MEDIA_UNAVAILABLE', 'Phiên media đang được làm mới, hãy thử lại');
  }

  return { ownPolicy, policies, transports: grants };
}

function toTransportRoom(row: {
  kind: MediaKind;
  audience: 'PRIVATE' | 'WATCH';
  generation: number;
  roomName: string;
}): TransportRoom {
  return { kind: row.kind, audience: row.audience, generation: row.generation, roomName: row.roomName };
}

function assertNoRotation(rows: { status: string }[]): void {
  if (rows.some((row) => row.status === 'ROTATING')) {
    throw new MediaError(503, 'MEDIA_UNAVAILABLE', 'Media đang tạm ngừng để thu hồi quyền, hãy thử lại');
  }
}

export interface EndMediaParams {
  userId: string;
  matchId: string;
  headers: ControlHeaders;
  pool?: pg.Pool;
}

/** `POST /media/end`: stop only the caller's own sources. */
export async function endOwnMedia(
  params: EndMediaParams,
): Promise<{ stopped: true; mediaUnavailable: boolean }> {
  const { userId, matchId, headers } = params;
  const p = params.pool ?? getPool();

  return withMatchMediaLock(
    matchId,
    async () => {
      const ctx = await requireOnlineMember(matchId, userId, p);
      await requireMediaControlLease(userId, matchId, ctx.roomId, headers, p);
      if (ctx.role !== 'PLAYER') {
        return { stopped: true as const, mediaUnavailable: false };
      }

      const committed = await withTransaction(async (client) => {
        await ensurePolicyRow(client, matchId, userId);
        const before = await loadPolicyRow(client, matchId, userId, true);
        const applied = toPolicyState(before);
        if (applied.desired.camera === 'OFF' && applied.desired.microphone === 'OFF') {
          return { skipped: true, before: applied, version: applied.policyVersion, targets: [] as TransportKey[] };
        }
        const nextVersion = Number(before.policy_version) + 1;
        const updated = await client.query(
          `UPDATE public.media_policies
              SET camera_audience = 'OFF',
                  microphone_audience = 'OFF',
                  policy_version = $1,
                  status = 'APPLYING',
                  updated_at = now()
            WHERE match_id = $2 AND user_id = $3 AND policy_version = $4
            RETURNING *`,
          [nextVersion, matchId, userId, Number(before.policy_version)],
        );
        if (updated.rowCount === 0) {
          throw new MediaError(409, 'CONFLICT', 'Chính sách media vừa thay đổi, hãy thử lại');
        }
        const targets = [
          ...planRotationTargets(applied.applied, 'CAMERA', 'OFF'),
          ...planRotationTargets(applied.applied, 'MICROPHONE', 'OFF'),
        ];
        return { skipped: false, before: applied, version: nextVersion, targets };
      }, p);

      if (committed.skipped) {
        return { stopped: true as const, mediaUnavailable: false };
      }

      if (committed.targets.length > 0) {
        const outcome = await rotateTransports(matchId, committed.targets, p, { attempts: 1 });
        if (!outcome.ok) {
          return { stopped: true as const, mediaUnavailable: true };
        }
      }

      const final = await withTransaction(async (client) => {
        const applied = await client.query(
          `UPDATE public.media_policies
              SET applied_camera_audience = camera_audience,
                  applied_microphone_audience = microphone_audience,
                  applied_version = policy_version,
                  status = 'APPLIED',
                  updated_at = now()
            WHERE match_id = $1 AND user_id = $2 AND policy_version = $3
            RETURNING *`,
          [matchId, userId, committed.version],
        );
        await upsertPolicyJob(client, {
          matchId,
          desiredVersions: [{ userId, policyVersion: committed.version, epoch: 0 }],
          effects: [],
          status: 'SUCCEEDED',
          attempts: 0,
          lastError: null,
        });
        return applied.rows[0] as PolicyRow | undefined;
      }, p);

      if (final) emitMediaPolicy({ matchId, roomId: ctx.roomId, policy: toPolicyState(final) });
      return { stopped: true as const, mediaUnavailable: false };
    },
    p,
  );
}

/** Rotation helper for revocations driven by other modules (logout/takeover/end). */
export async function rotateMatchTransports(
  matchId: string,
  targets: TransportKey[],
  pool?: pg.Pool,
): Promise<void> {
  const p = pool ?? getPool();
  await withMatchMediaLock(
    matchId,
    async () => {
      await rotateTransports(matchId, targets, p);
    },
    p,
  );
}

/** Match end: delete all four transports, never create a new generation. */
export async function endMatchMedia(matchId: string, pool?: pg.Pool): Promise<void> {
  const p = pool ?? getPool();
  await withMatchMediaLock(matchId, () => deleteMatchTransports(matchId, p).then(() => undefined), p);
}

/**
 * Reconcile jobs left PENDING/RETRY by an SFU outage (spec 06 §Network partition).
 * Desired stays restrictive, the generation only advances after an ack, and the
 * job is marked FAILED after 4 attempts so an operator can see it.
 *
 * A scheduler (or an operator) is expected to call this; there is no timer in
 * the server today, the same gap as the match deadline scheduler.
 */
export async function retryPendingMediaJobs(
  pool?: pg.Pool,
): Promise<{ processed: number; applied: number; failed: number }> {
  const p = pool ?? getPool();
  const jobs = await p.query(
    `SELECT j.match_id, j.attempts, m.room_id
       FROM public.media_policy_jobs j
       JOIN public.matches m ON m.id = j.match_id
      WHERE j.status IN ('PENDING', 'RETRY')
      ORDER BY j.created_at`,
  );
  let applied = 0;
  let failed = 0;

  for (const job of jobs.rows) {
    const matchId = job.match_id as string;
    const roomId = job.room_id as string | null;
    const attempts = Number(job.attempts);

    const succeeded = await withMatchMediaLock(
      matchId,
      async () => {
        const rowsRes = await p.query(`SELECT * FROM public.media_policies WHERE match_id = $1`, [matchId]);
        const targets: TransportKey[] = [];
        const seen: Record<string, true> = {};
        for (const row of rowsRes.rows as PolicyRow[]) {
          const state = toPolicyState(row);
          for (const kind of ['CAMERA', 'MICROPHONE'] as MediaKind[]) {
            const desired = kind === 'CAMERA' ? state.desired.camera : state.desired.microphone;
            for (const target of planRotationTargets(state.applied, kind, desired)) {
              const key = `${target.kind}:${target.audience}`;
              if (!seen[key]) {
                seen[key] = true;
                targets.push(target);
              }
            }
          }
        }

        const outcome =
          targets.length > 0
            ? await rotateTransports(matchId, targets, p)
            : { ok: true, rotated: [], failed: [] };
        if (!outcome.ok) {
          const message = outcome.failed
            .map((entry) => `${entry.key.kind}/${entry.key.audience}: ${entry.error}`)
            .join('; ')
            .slice(0, 1000);
          await withTransaction(async (client) => {
            await upsertPolicyJob(client, {
              matchId,
              desiredVersions: [],
              effects: effectsFromTargets(targets, []),
              status: attempts + 1 >= 4 ? 'FAILED' : 'RETRY',
              attempts: Math.min(attempts + 1, 4),
              lastError: message,
            });
          }, p);
          return false;
        }

        const finished = await withTransaction(async (client) => {
          const res = await client.query(
            `UPDATE public.media_policies
                SET applied_camera_audience = camera_audience,
                    applied_microphone_audience = microphone_audience,
                    applied_version = policy_version,
                    status = 'APPLIED',
                    updated_at = now()
              WHERE match_id = $1 AND status = 'APPLYING'
              RETURNING *`,
            [matchId],
          );
          await upsertPolicyJob(client, {
            matchId,
            desiredVersions: [],
            effects: [],
            status: 'SUCCEEDED',
            attempts,
            lastError: null,
          });
          return res.rows as PolicyRow[];
        }, p);
        for (const row of finished) {
          emitMediaPolicy({ matchId, roomId, policy: toPolicyState(row) });
        }
        return true;
      },
      p,
    );

    if (succeeded) applied += 1;
    else failed += 1;
  }

  return { processed: jobs.rowCount ?? 0, applied, failed };
}

// Spectator eviction / room lock rotates both WATCH rooms (spec 06 "thu hồi").
onAccessRevoked(({ roomId }) => {
  void (async () => {
    try {
      const p = getPool();
      const res = await p.query(
        `SELECT id FROM public.matches WHERE room_id = $1 AND status = 'ACTIVE' LIMIT 1`,
        [roomId],
      );
      const matchId = res.rows[0]?.id as string | undefined;
      if (!matchId) return;
      await rotateMatchTransports(matchId, [
        { kind: 'CAMERA', audience: 'WATCH' },
        { kind: 'MICROPHONE', audience: 'WATCH' },
      ]);
    } catch {
      // Revocation stays owned by the media job/retry path; never throw here.
    }
  })();
});
