import { useState, useEffect, useCallback, useRef } from 'react';
import type { MatchSnapshot, Move } from '@xiangqi/contracts';
import { realtime, type ControllerGrant, type RealtimeStatus } from '../../lib/realtime.js';
import { supabase } from '../../lib/supabase.js';

/** Spec 03: cheap `match:sync` while the match is active (not a poll loop). */
const ACTIVE_RESYNC_MS = 15_000;
/** Read-only tabs re-claim the lease this often until they hold it. */
const CLAIM_RETRY_MS = 2_000;

/**
 * Authoritative match state for one screen.
 *
 * Snapshots arrive over the socket (`match:subscribe` ack + `match:state`
 * pushes). Resync runs on connect, on `VERSION_CONFLICT`, when a pushed version
 * jumps, and every 15s while the match is ACTIVE — always a cheap `match:sync`,
 * never a full polling loop. HTTP `GET /matches/:id` remains only as the
 * first-paint/offline fallback.
 */
export function useMatch(matchId: string | undefined) {
  const [snapshot, setSnapshot] = useState<MatchSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [status, setStatus] = useState<RealtimeStatus>(realtime.getStatus());
  const [controller, setController] = useState<ControllerGrant | null>(null);

  const snapshotRef = useRef<MatchSnapshot | null>(null);
  const pendingRef = useRef(false);

  const applySnapshot = useCallback((incoming: MatchSnapshot) => {
    const current = snapshotRef.current;
    if (current && current.id === incoming.id) {
      // Older version → drop. Same version with an older server clock → drop.
      // Same version with a newer serverNowMs still updates clock/presence.
      if (incoming.version < current.version) return;
      if (incoming.version === current.version && incoming.serverNowMs <= current.serverNowMs) return;
    }
    snapshotRef.current = incoming;
    setSnapshot(incoming);
  }, []);

  const syncNow = useCallback(async () => {
    if (!matchId) return;
    const lastVersion = snapshotRef.current?.version ?? 0;
    const res = await realtime.syncMatch(matchId, lastVersion);
    if (res.ok) {
      applySnapshot(res.data);
      setError(null);
    } else if (res.error.code !== 'OFFLINE' && res.error.code !== 'ACK_TIMEOUT') {
      setError(res.error.message);
    }
  }, [matchId, applySnapshot]);

  /** HTTP fallback for first paint and for when the socket is unavailable. */
  const fetchSnapshot = useCallback(async () => {
    if (!matchId) return;
    try {
      const session = (await supabase.auth.getSession()).data.session;
      const res = await fetch(`/api/v1/matches/${matchId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token ?? ''}`,
        },
      });
      const data = await res.json();
      if (data.ok) {
        applySnapshot(data.data as MatchSnapshot);
      } else {
        setError(data.error?.message ?? 'Không thể tải ván cờ');
      }
    } catch {
      // Network hiccup — keep whatever the socket already delivered.
    }
  }, [matchId, applySnapshot]);

  useEffect(() => {
    if (!matchId) return;
    snapshotRef.current = null;
    setSnapshot(null);
    setError(null);

    const offMatchState = realtime.subscribe('match:state', (payload) => {
      if (payload.matchId !== matchId) return;
      const previousVersion = snapshotRef.current?.version ?? -1;
      applySnapshot(payload.snapshot);
      // A version jump means we missed pushes → resync from the server.
      if (previousVersion >= 0 && payload.snapshot.version > previousVersion + 1) {
        void syncNow();
      }
    });
    const offStatus = realtime.onStatus((next) => {
      setStatus(next);
      if (next === 'connected') void syncNow();
    });
    const offController = realtime.onController('match', setController);

    const unsubscribe = realtime.subscribeMatch(matchId, { claimControl: true });
    void fetchSnapshot();

    const interval = setInterval(() => {
      if (snapshotRef.current?.status === 'ACTIVE') void syncNow();
    }, ACTIVE_RESYNC_MS);

    // A participant tab without the lease (first claim raced the session, or the
    // server rotated it) re-claims instead of staying read-only for the whole match.
    const claimTimer = setInterval(() => {
      const current = snapshotRef.current;
      if (!current || current.status !== 'ACTIVE') return;
      if (realtime.getController('match')) return;
      void realtime.claimController('match', matchId, current);
    }, CLAIM_RETRY_MS);

    return () => {
      offMatchState();
      offStatus();
      offController();
      unsubscribe();
      clearInterval(interval);
      clearInterval(claimTimer);
    };
  }, [matchId, applySnapshot, syncNow, fetchSnapshot]);

  const sendCommand = useCallback(
    async (request: () => Promise<{ ok: true; snapshot: MatchSnapshot } | { ok: false; code: string; message: string }>) => {
      if (pendingRef.current) return;
      pendingRef.current = true;
      setIsPending(true);
      setError(null);
      try {
        const result = await request();
        if (result.ok) {
          applySnapshot(result.snapshot);
          return;
        }
        // The UI never keeps an unconfirmed move: any rejection — including
        // VERSION_CONFLICT, which the spec requires a resync for — re-reads the
        // authoritative snapshot first, then surfaces the server's reason.
        await syncNow();
        setError(
          result.code === 'CONTROL_REQUIRED' ? 'Tab này không giữ quyền điều khiển' : result.message,
        );
      } finally {
        pendingRef.current = false;
        setIsPending(false);
      }
    },
    [applySnapshot, syncNow],
  );

  const submitHttpCommand = useCallback(
    async (path: string, payload: Record<string, unknown>) => {
      const current = snapshotRef.current;
      if (!matchId || !current) return;
      await sendCommand(async () => {
        try {
          const session = (await supabase.auth.getSession()).data.session;
          const res = await fetch(`/api/v1/matches/${matchId}/commands/${path}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session?.access_token ?? ''}`,
              ...realtime.controlHeaders('match'),
            },
            body: JSON.stringify({
              commandId: crypto.randomUUID(),
              expectedVersion: current.version,
              payload,
            }),
          });
          const data = await res.json();
          if (data.ok) return { ok: true as const, snapshot: data.data.snapshot as MatchSnapshot };
          return {
            ok: false as const,
            code: (data.error?.code ?? 'UNKNOWN') as string,
            message: (data.error?.message ?? 'Lệnh không được chấp nhận') as string,
          };
        } catch {
          return { ok: false as const, code: 'NETWORK', message: 'Lỗi kết nối khi gửi lệnh' };
        }
      });
    },
    [matchId, sendCommand],
  );

  /**
   * Moves go over the socket (spec 04) and fall back to the HTTP command adapter
   * when the socket is not usable — both call the same authoritative service and
   * carry the same controller lease, so the move is never silently dropped.
   */
  const makeMove = useCallback(
    async (move: Move) => {
      const current = snapshotRef.current;
      if (!matchId || !current || current.status !== 'ACTIVE') return;
      if (realtime.getStatus() === 'connected') {
        await sendCommand(async () => {
          const res = await realtime.sendMove(matchId, move, current.version);
          if (res.ok) return { ok: true as const, snapshot: res.data.snapshot };
          return { ok: false as const, code: res.error.code, message: res.error.message };
        });
        return;
      }
      await submitHttpCommand('move', move as unknown as Record<string, unknown>);
    },
    [matchId, sendCommand, submitHttpCommand],
  );

  const propose = useCallback(
    (kind: 'DRAW' | 'UNDO') => submitHttpCommand('propose', { kind }),
    [submitHttpCommand],
  );

  const respond = useCallback(
    (proposalId: string, accept: boolean) => submitHttpCommand('respond', { proposalId, accept }),
    [submitHttpCommand],
  );

  const resign = useCallback(() => submitHttpCommand('resign', {}), [submitHttpCommand]);

  const undoAi = useCallback(() => submitHttpCommand('undo-ai', {}), [submitHttpCommand]);

  /**
   * Only the tab that holds the controller lease on a live socket may mutate
   * (spec 03: a second tab is read-only). The board uses this to stay honest
   * instead of accepting a click that the server will refuse.
   */
  const canMutate =
    snapshot?.status === 'ACTIVE' && status === 'connected' && controller !== null;

  return {
    snapshot,
    error,
    isPending,
    status,
    controller,
    canMutate,
    makeMove,
    propose,
    respond,
    resign,
    undoAi,
  };
}
