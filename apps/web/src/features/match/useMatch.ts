import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../lib/supabase.js';
import type { MatchSnapshot, Move } from '@xiangqi/contracts';

export function useMatch(matchId: string | undefined) {
  const [snapshot, setSnapshot] = useState<MatchSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const currentVersionRef = useRef<number>(0);

  const getHeaders = useCallback(async () => {
    const session = (await supabase.auth.getSession()).data.session;
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.access_token ?? ''}`,
    };
  }, []);

  const fetchSnapshot = useCallback(async () => {
    if (!matchId) return;
    try {
      const headers = await getHeaders();
      const res = await fetch(`/api/v1/matches/${matchId}`, { headers });
      const data = await res.json();
      if (data.ok) {
        setSnapshot(data.data);
        currentVersionRef.current = data.data.version;
      } else {
        setError(data.error?.message ?? 'Không thể tải ván cờ');
      }
    } catch {
      // Network hiccup — keep existing snapshot
    }
  }, [matchId, getHeaders]);

  // Initial fetch + periodic sync (1.5s interval for active match)
  useEffect(() => {
    fetchSnapshot();
    const interval = setInterval(() => {
      if (snapshot?.status === 'ACTIVE' || !snapshot) {
        fetchSnapshot();
      }
    }, 1500);
    return () => clearInterval(interval);
  }, [fetchSnapshot, snapshot?.status]);

  const makeMove = useCallback(
    async (move: Move) => {
      if (!matchId || isPending) return;
      setIsPending(true);
      setError(null);

      const commandId = crypto.randomUUID();
      try {
        const headers = await getHeaders();
        const res = await fetch(`/api/v1/matches/${matchId}/commands/move`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            commandId,
            expectedVersion: Number(currentVersionRef.current),
            payload: move,
          }),
        });

        const data = await res.json();
        if (data.ok) {
          setSnapshot(data.data.snapshot);
          currentVersionRef.current = data.data.snapshot.version;
        } else {
          setError(data.error?.message ?? 'Nước đi không hợp lệ');
          // Re-sync on conflict
          await fetchSnapshot();
        }
      } catch {
        setError('Lỗi kết nối khi gửi nước đi');
      } finally {
        setIsPending(false);
      }
    },
    [matchId, isPending, getHeaders, fetchSnapshot],
  );

  const propose = useCallback(
    async (kind: 'DRAW' | 'UNDO') => {
      if (!matchId) return;
      const commandId = crypto.randomUUID();
      try {
        const headers = await getHeaders();
        const res = await fetch(`/api/v1/matches/${matchId}/commands/propose`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            commandId,
            expectedVersion: currentVersionRef.current,
            payload: { kind },
          }),
        });
        const data = await res.json();
        if (data.ok) {
          setSnapshot(data.data.snapshot);
          currentVersionRef.current = data.data.snapshot.version;
        } else {
          setError(data.error?.message ?? 'Không thể gửi đề nghị');
        }
      } catch {
        setError('Lỗi kết nối');
      }
    },
    [matchId, getHeaders],
  );

  const respond = useCallback(
    async (proposalId: string, accept: boolean) => {
      if (!matchId) return;
      const commandId = crypto.randomUUID();
      try {
        const headers = await getHeaders();
        const res = await fetch(`/api/v1/matches/${matchId}/commands/respond`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            commandId,
            expectedVersion: currentVersionRef.current,
            payload: { proposalId, accept },
          }),
        });
        const data = await res.json();
        if (data.ok) {
          setSnapshot(data.data.snapshot);
          currentVersionRef.current = data.data.snapshot.version;
        } else {
          setError(data.error?.message ?? 'Không thể phản hồi');
        }
      } catch {
        setError('Lỗi kết nối');
      }
    },
    [matchId, getHeaders],
  );

  const resign = useCallback(async () => {
    if (!matchId) return;
    const commandId = crypto.randomUUID();
    try {
      const headers = await getHeaders();
      const res = await fetch(`/api/v1/matches/${matchId}/commands/resign`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          commandId,
          expectedVersion: currentVersionRef.current,
          payload: {},
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setSnapshot(data.data.snapshot);
        currentVersionRef.current = data.data.snapshot.version;
      } else {
        setError(data.error?.message ?? 'Không thể đầu hàng');
      }
    } catch {
      setError('Lỗi kết nối');
    }
  }, [matchId, getHeaders]);

  return {
    snapshot,
    error,
    isPending,
    makeMove,
    propose,
    respond,
    resign,
    refresh: fetchSnapshot,
  };
}
