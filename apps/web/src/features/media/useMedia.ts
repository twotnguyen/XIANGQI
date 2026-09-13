/**
 * Media controller hook (spec 06/04 + ISSUE-026).
 *
 * - CONSUMES the tab controller lease owned by `lib/realtime` (spec 03/04: one
 *   controllerId per user/tab) and sends it as `X-Control-Id`/`X-Control-Epoch`.
 *   Media never calls `POST /control/takeover`: a second owner in the same tab
 *   would bump `control_epoch` and revoke the game client's lease.
 * - Fetches one server-derived session (`POST /media/session`) and obeys it: the
 *   client connects only where it was granted a room and publishes only the
 *   source the grant allows. Camera and microphone stay independent.
 * - Writes policy through `PATCH /media/policy` with the expected `policyVersion`;
 *   a 503 MEDIA_UNAVAILABLE keeps the desired state and surfaces APPLYING.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase.js';
import { realtime, type ControllerGrant } from '../../lib/realtime.js';
import { localTrackManager, type CaptureKind } from './track-manager.js';
import { SfuConnection, type RemoteMedia, type SfuState } from './lib/sfu-client.js';
import type {
  Audience,
  MediaKind,
  MediaSession,
  PolicyState,
  TransportGrant,
} from '@xiangqi/contracts';

const SESSION_RETRY_DELAYS_MS = [1000, 2000, 4000];
const POLICY_WATCH_INTERVAL_MS = 10_000;

export interface MediaControllerState {
  ownPolicy: PolicyState | null;
  policies: PolicyState[];
  cameraScope: Audience;
  micScope: Audience;
  remote: RemoteMedia[];
  status: SfuState | 'IDLE';
  applying: boolean;
  mediaUnavailable: boolean;
  error: string | null;
}

export interface MediaController extends MediaControllerState {
  updatePolicy(kind: MediaKind, audience: Audience): Promise<void>;
  retry(): void;
}

interface ApiEnvelope<T> {
  ok: boolean;
  data?: T;
  error?: { code: string; message: string };
}

async function authToken(): Promise<string> {
  const session = (await supabase.auth.getSession()).data.session;
  return session?.access_token ?? '';
}

async function delay(ms: number): Promise<void> {
  const { promise, resolve } = Promise.withResolvers<void>();
  setTimeout(resolve, ms);
  return promise;
}

function grantKey(grant: TransportGrant): string {
  return `${grant.kind}:${grant.audience}`;
}

function captureKindFor(source: MediaKind): CaptureKind {
  return source === 'CAMERA' ? 'camera' : 'microphone';
}

/** The tab's current lease, preferring the match scope over the room scope. */
function currentLease(): ControllerGrant | null {
  return realtime.getController('match') ?? realtime.getController();
}

export function useMedia(
  roomId: string | null,
  matchId: string | null,
  isPlayer: boolean,
): MediaController {
  const [ownPolicy, setOwnPolicy] = useState<PolicyState | null>(null);
  const [policies, setPolicies] = useState<PolicyState[]>([]);
  const [remote, setRemote] = useState<RemoteMedia[]>([]);
  const [status, setStatus] = useState<SfuState | 'IDLE'>('IDLE');
  const [applying, setApplying] = useState(false);
  const [mediaUnavailable, setMediaUnavailable] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Mirror of the realtime-owned lease, used only to notice epoch changes. */
  const leaseRef = useRef<ControllerGrant | null>(null);
  const connectionsRef = useRef<Map<string, SfuConnection>>(new Map());
  const connectionStatesRef = useRef<Map<string, SfuState>>(new Map());
  const publishedRef = useRef<Map<string, CaptureKind>>(new Map());
  const grantsRef = useRef<Map<string, TransportGrant>>(new Map());
  const ownPolicyRef = useRef<PolicyState | null>(null);
  const policiesRef = useRef<PolicyState[]>([]);
  const epochRef = useRef(0);
  const mountedRef = useRef(true);
  const busyRef = useRef(false);

  const setPoliciesSynced = useCallback((next: PolicyState[]) => {
    policiesRef.current = next;
    setPolicies(next);
  }, []);

  const setOwnPolicySynced = useCallback((next: PolicyState | null) => {
    ownPolicyRef.current = next;
    setOwnPolicy(next);
  }, []);

  /** Aggregate per-connection SFU state so one room cannot mask another. */
  const recomputeStatus = useCallback(() => {
    const states = [...connectionStatesRef.current.values()];
    if (states.length === 0) setStatus('IDLE');
    else if (states.some((state) => state === 'ERROR')) setStatus('ERROR');
    else if (states.every((state) => state === 'LIVE')) setStatus('LIVE');
    else setStatus('CONNECTING');
  }, []);

  const applySession = useCallback(
    async (session: MediaSession, epoch: number) => {
      if (epoch !== epochRef.current) return;
      setOwnPolicySynced(session.ownPolicy);
      setPoliciesSynced(session.policies);

      const wanted = new Map(session.transports.map((grant) => [grantKey(grant), grant]));
      const previous = grantsRef.current;

      // Drop connections whose room rotated or that are no longer granted.
      for (const [key, connection] of [...connectionsRef.current]) {
        const next = wanted.get(key);
        const current = previous.get(key);
        if (next && current && current.roomName === next.roomName) continue;
        connectionStatesRef.current.delete(key);
        await connection.disconnect();
        connectionsRef.current.delete(key);
        const kind = publishedRef.current.get(key);
        if (kind) {
          publishedRef.current.delete(key);
          localTrackManager.release(kind);
        }
      }

      // Connect and publish strictly what each grant allows.
      for (const grant of session.transports) {
        if (epoch !== epochRef.current) return;
        const key = grantKey(grant);
        let connection = connectionsRef.current.get(key);
        if (!connection) {
          connection = new SfuConnection(grant, {
            onRemoteAdded: (media) => {
              if (!mountedRef.current) return;
              setRemote((prev) => (prev.some((item) => item.key === media.key) ? prev : [...prev, media]));
            },
            onRemoteRemoved: (removedKey) => {
              if (!mountedRef.current) return;
              setRemote((prev) => prev.filter((item) => item.key !== removedKey));
            },
            onState: (state, detail) => {
              connectionStatesRef.current.set(key, state);
              if (state === 'ERROR' && detail && mountedRef.current) setError(detail);
              recomputeStatus();
            },
          });
          connectionsRef.current.set(key, connection);
          try {
            await connection.connect();
          } catch {
            connectionsRef.current.delete(key);
            connectionStatesRef.current.delete(key);
            recomputeStatus();
            if (mountedRef.current) setError('Không kết nối được phòng media');
            continue;
          }
        }

        if (grant.canPublish && grant.publishSource && !publishedRef.current.has(key)) {
          const kind = captureKindFor(grant.publishSource);
          try {
            const source = await localTrackManager.acquire(kind);
            await connection.publish(source);
            publishedRef.current.set(key, kind);
          } catch {
            if (mountedRef.current) {
              setError(`Không thể chia sẻ ${kind === 'camera' ? 'camera' : 'microphone'}`);
            }
          }
        }
      }

      // Release captures no grant publishes any more (OFF stops hardware).
      for (const kind of ['camera', 'microphone'] as CaptureKind[]) {
        const stillPublished = [...publishedRef.current.values()].includes(kind);
        const granted = session.transports.some(
          (grant) => grant.canPublish && grant.publishSource === (kind === 'camera' ? 'CAMERA' : 'MICROPHONE'),
        );
        if (!stillPublished && !granted) localTrackManager.stop(kind);
      }

      grantsRef.current = wanted;
    },
    [recomputeStatus, setOwnPolicySynced, setPoliciesSynced],
  );

  const fetchSession = useCallback(
    async (epoch: number): Promise<MediaSession | null> => {
      if (!roomId || !matchId) return null;
      // No lease yet (subscribe ack still in flight): stay silent, the controller
      // effect below refetches as soon as `realtime` reports one.
      const lease = currentLease();
      if (!lease) return null;

      for (let attempt = 0; attempt <= SESSION_RETRY_DELAYS_MS.length; attempt += 1) {
        if (epoch !== epochRef.current) return null;
        const res = await fetch('/api/v1/media/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await authToken()}`,
            'X-Control-Id': lease.controllerId,
            'X-Control-Epoch': String(lease.controlEpoch),
          },
          body: JSON.stringify({ roomId, matchId, controllerId: lease.controllerId }),
        });
        const body = (await res.json().catch(() => null)) as ApiEnvelope<MediaSession> | null;
        if (res.ok && body?.ok && body.data) return body.data;

        const code = body?.error?.code ?? 'INTERNAL_ERROR';
        if (code === 'MEDIA_UNAVAILABLE' && attempt < SESSION_RETRY_DELAYS_MS.length) {
          await delay(SESSION_RETRY_DELAYS_MS[attempt]);
          continue;
        }
        if (code === 'CONTROL_REQUIRED') {
          // Another tab took the lease over; only `realtime` may re-claim it.
          if (mountedRef.current) setError('Tab này đã mất quyền điều khiển');
          return null;
        }
        if (code !== 'MATCH_ENDED' && mountedRef.current) {
          setError(body?.error?.message ?? 'Không lấy được phiên media');
        }
        return null;
      }
      return null;
    },
    [roomId, matchId],
  );

  const fetchPolicies = useCallback(async (): Promise<PolicyState[] | null> => {
    if (!roomId || !matchId) return null;
    const res = await fetch(`/api/v1/media/policy?matchId=${matchId}`, {
      headers: { Authorization: `Bearer ${await authToken()}` },
    });
    const body = (await res.json().catch(() => null)) as ApiEnvelope<{ policies: PolicyState[] }> | null;
    return res.ok && body?.ok && body.data ? body.data.policies : null;
  }, [roomId, matchId]);

  const refreshPoliciesOnly = useCallback(async (): Promise<boolean> => {
    const next = await fetchPolicies();
    if (!next) return false;
    const changed = JSON.stringify(next) !== JSON.stringify(policiesRef.current);
    if (!changed) return false;
    setPoliciesSynced(next);
    const mine = next.find((policy) => policy.userId === ownPolicyRef.current?.userId);
    if (mine) {
      setOwnPolicySynced(mine);
      setMediaUnavailable(mine.status === 'APPLYING');
    }
    return true;
  }, [fetchPolicies, setOwnPolicySynced, setPoliciesSynced]);

  const refreshSession = useCallback(
    async (epoch: number) => {
      const session = await fetchSession(epoch);
      if (session) await applySession(session, epoch);
    },
    [applySession, fetchSession],
  );

  // The tab lease belongs to `lib/realtime`; media only asks it to claim one when
  // this tab has none (spec 04 subscribe ack / one takeover per tab) and follows
  // every change. A spectator is not a match participant, so the ROOM subscribe is
  // what gives a viewer the tab controller lease the media routes require.
  useEffect(() => {
    if (!roomId || !matchId) return;
    const releaseMatch = realtime.subscribeMatch(matchId, { claimControl: true });
    const releaseRoom = realtime.subscribeRoom(roomId, { claimControl: true });

    const onGrant = (grant: ControllerGrant | null) => {
      const next = grant ?? currentLease();
      const previous = leaseRef.current;
      leaseRef.current = next;
      if (!next) {
        if (previous && mountedRef.current) setError('Tab này đã mất quyền điều khiển');
        return;
      }
      if (!previous || previous.controlEpoch !== next.controlEpoch) {
        void refreshSession(epochRef.current);
      }
    };

    const offMatch = realtime.onController('match', onGrant);
    const offRoom = realtime.onController('room', onGrant);
    return () => {
      offMatch();
      offRoom();
      releaseMatch();
      releaseRoom();
    };
  }, [roomId, matchId, refreshSession]);

  const teardown = useCallback(async () => {
    for (const connection of connectionsRef.current.values()) {
      await connection.disconnect();
    }
    connectionsRef.current.clear();
    connectionStatesRef.current.clear();
    publishedRef.current.clear();
    grantsRef.current.clear();
    localTrackManager.stopAll();
    if (mountedRef.current) {
      setRemote([]);
      setStatus('IDLE');
    }
  }, []);

  // Connect for the current room/match; clean up on unmount and on rematch.
  useEffect(() => {
    mountedRef.current = true;
    if (!roomId || !matchId) return;
    const epoch = (epochRef.current += 1);
    void (async () => {
      setError(null);
      const session = await fetchSession(epoch);
      if (session) await applySession(session, epoch);
    })();
    return () => {
      epochRef.current += 1;
      void teardown();
    };
  }, [roomId, matchId, fetchSession, applySession, teardown]);

  useEffect(
    () => () => {
      mountedRef.current = false;
    },
    [],
  );

  // Bounded read-only reconciliation: no token is minted here, it only notices
  // the opponent's changes / a rotation and refetches the plan when needed.
  useEffect(() => {
    if (!roomId || !matchId) return;
    const timer = setInterval(() => {
      if (busyRef.current) return;
      void (async () => {
        const changed = await refreshPoliciesOnly();
        if (changed) await refreshSession(epochRef.current);
      })();
    }, POLICY_WATCH_INTERVAL_MS);
    const onFocus = () => {
      void refreshPoliciesOnly();
    };
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', onFocus);
    };
  }, [roomId, matchId, refreshPoliciesOnly, refreshSession]);

  const updatePolicy = useCallback(
    async (kind: MediaKind, audience: Audience) => {
      if (!roomId || !matchId || !isPlayer) return;
      setApplying(true);
      setError(null);
      busyRef.current = true;
      const epoch = epochRef.current;
      const captureKind = captureKindFor(kind);
      const label = kind === 'CAMERA' ? 'camera' : 'microphone';

      try {
        if (audience !== 'OFF') {
          try {
            await localTrackManager.ensureCapture(captureKind);
          } catch {
            setError(`Không thể truy cập ${label} (quyền bị từ chối hoặc thiết bị không có)`);
            return;
          }
        }

        const lease = currentLease();
        if (!lease) {
          setError('Tab này chưa giữ quyền điều khiển để đổi media');
          return;
        }
        // First interaction may race the session bootstrap: read the current
        // version instead of sending a stale 0 (which the server rejects 409).
        if (!ownPolicyRef.current) await refreshPoliciesOnly();
        const expectedVersion = ownPolicyRef.current?.policyVersion ?? 0;

        const res = await fetch('/api/v1/media/policy', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await authToken()}`,
            'X-Control-Id': lease.controllerId,
            'X-Control-Epoch': String(lease.controlEpoch),
          },
          body: JSON.stringify({ matchId, kind, audience, policyVersion: expectedVersion }),
        });
        const body = (await res.json().catch(() => null)) as ApiEnvelope<PolicyState> | null;

        if (res.ok && body?.ok && body.data) {
          setOwnPolicySynced(body.data);
          setMediaUnavailable(false);
          await refreshSession(epoch);
          return;
        }

        const code = body?.error?.code ?? 'INTERNAL_ERROR';
        if (code === 'MEDIA_UNAVAILABLE') {
          setMediaUnavailable(true);
          setError('Đang ngừng chia sẻ trên SFU; chính sách đang chờ áp dụng (APPLYING)');
          await refreshPoliciesOnly();
          await refreshSession(epoch);
          return;
        }
        if (code === 'CONFLICT') {
          setError('Chính sách vừa thay đổi, hãy chọn lại');
          await refreshPoliciesOnly();
          return;
        }
        if (code === 'CONTROL_REQUIRED') {
          setError('Tab này đã mất quyền điều khiển, hãy thao tác lại');
          return;
        }
        setError(body?.error?.message ?? 'Cập nhật chính sách thất bại');
      } finally {
        busyRef.current = false;
        if (mountedRef.current) setApplying(false);
      }
    },
    [roomId, matchId, isPlayer, refreshSession, refreshPoliciesOnly, setOwnPolicySynced],
  );

  const retry = useCallback(() => {
    void refreshSession(epochRef.current);
  }, [refreshSession]);

  return useMemo<MediaController>(
    () => ({
      ownPolicy,
      policies,
      cameraScope: ownPolicy?.desired.camera ?? 'OFF',
      micScope: ownPolicy?.desired.microphone ?? 'OFF',
      remote,
      status,
      applying,
      mediaUnavailable,
      error,
      updatePolicy,
      retry,
    }),
    [ownPolicy, policies, remote, status, applying, mediaUnavailable, error, updatePolicy, retry],
  );
}
