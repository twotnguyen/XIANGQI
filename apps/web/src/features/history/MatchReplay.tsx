import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { supabase } from '../../lib/supabase.js';
import { Board } from '../../components/board/Board.js';
import type { Position, Move, Outcome } from '@xiangqi/contracts';

interface ReplayPly {
  ply: number;
  move: Move | null;
  position: Position;
}

interface ReplayData {
  id: string;
  mode: 'ONLINE' | 'AI';
  redUserId: string | null;
  blackUserId: string | null;
  outcome: Outcome | null;
  plies: ReplayPly[];
}

export function MatchReplay() {
  const { id: matchId } = useParams<{ id: string }>();
  const [replay, setReplay] = useState<ReplayData | null>(null);
  const [currentPlyIndex, setCurrentPlyIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const session = (await supabase.auth.getSession()).data.session;
        const res = await fetch(`/api/v1/matches/${matchId}/replay`, {
          headers: {
            Authorization: `Bearer ${session?.access_token ?? ''}`,
          },
        });
        const data = await res.json();
        if (data.ok) {
          setReplay(data.data);
          setCurrentPlyIndex(0);
        } else {
          setError(data.error?.message ?? 'Không thể tải ván cờ xem lại');
        }
      } catch {
        setError('Lỗi kết nối máy chủ');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [matchId]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '60px', fontFamily: 'system-ui, sans-serif' }}>
        <p>Đang tải dữ liệu ván cờ...</p>
      </div>
    );
  }

  if (error || !replay) {
    return (
      <div style={{ maxWidth: '400px', margin: '60px auto', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
        <h2 style={{ color: '#DC3545' }}>Lỗi xem lại</h2>
        <p>{error ?? 'Không tìm thấy ván cờ'}</p>
        <Link to="/history" style={{ color: '#155E75' }}>← Trở về danh sách</Link>
      </div>
    );
  }

  const currentPly = replay.plies[currentPlyIndex];
  const totalPlies = replay.plies.length - 1;

  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '16px',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div style={{ width: '100%', maxWidth: '560px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <Link to="/history" style={{ color: '#155E75', fontSize: '14px' }}>← Lịch sử</Link>
        <span style={{ fontSize: '13px', color: '#666' }}>
          Nước: {currentPlyIndex} / {totalPlies}
        </span>
      </div>

      {/* Board in replay mode (interactive false) */}
      {currentPly && (
        <Board
          position={currentPly.position}
          orientation="RED"
          interactive={false}
          legalMoves={[]}
          onMove={() => {}}
        />
      )}

      {/* Controls: First, Prev, Next, Last */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          marginTop: '16px',
        }}
        data-testid="replay-controls"
      >
        <button
          onClick={() => setCurrentPlyIndex(0)}
          disabled={currentPlyIndex === 0}
          style={{ padding: '8px 16px', fontSize: '14px' }}
          data-testid="replay-start-btn"
        >
          ⏮ Về đầu
        </button>

        <button
          onClick={() => setCurrentPlyIndex((p) => Math.max(0, p - 1))}
          disabled={currentPlyIndex === 0}
          style={{ padding: '8px 16px', fontSize: '14px' }}
          data-testid="replay-prev-btn"
        >
          ◀ Lùi 1 nước
        </button>

        <button
          onClick={() => setCurrentPlyIndex((p) => Math.min(totalPlies, p + 1))}
          disabled={currentPlyIndex >= totalPlies}
          style={{ padding: '8px 16px', fontSize: '14px' }}
          data-testid="replay-next-btn"
        >
          Tiến 1 nước ▶
        </button>

        <button
          onClick={() => setCurrentPlyIndex(totalPlies)}
          disabled={currentPlyIndex >= totalPlies}
          style={{ padding: '8px 16px', fontSize: '14px' }}
          data-testid="replay-end-btn"
        >
          Đến cuối ⏭
        </button>
      </div>
    </main>
  );
}
