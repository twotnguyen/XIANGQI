import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { supabase } from '../../lib/supabase.js';

interface MatchSummary {
  id: string;
  roomId: string | null;
  mode: 'ONLINE' | 'AI';
  status: string;
  redUserId: string | null;
  blackUserId: string | null;
  redUsername?: string;
  blackUsername?: string;
  outcome: { winner: 'RED' | 'BLACK' | null; reason: string } | null;
  ply: number;
  createdAt: string;
  finishedAt: string | null;
}

export function HistoryList() {
  const [matches, setMatches] = useState<MatchSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const session = (await supabase.auth.getSession()).data.session;
        if (!session) {
          navigate('/login');
          return;
        }
        setCurrentUserId(session.user.id);

        const res = await fetch('/api/v1/history', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        const data = await res.json();
        if (data.ok) {
          setMatches(data.data);
        } else {
          setError(data.error?.message ?? 'Không thể tải lịch sử đấu');
        }
      } catch {
        setError('Lỗi kết nối máy chủ');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [navigate]);

  return (
    <main style={{ maxWidth: '640px', margin: '40px auto', padding: '16px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', margin: 0 }}>Lịch sử ván đấu</h1>
        <Link to="/lobby" style={{ fontSize: '14px', color: '#155E75' }}>← Về sảnh chờ</Link>
      </div>

      {error && (
        <div role="alert" style={{ padding: '12px', backgroundColor: '#F8D7DA', color: '#721C24', borderRadius: '4px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {loading ? (
        <p style={{ textAlign: 'center', color: '#666' }}>Đang tải lịch sử...</p>
      ) : matches.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#666', marginTop: '40px' }}>
          Bạn chưa chơi ván cờ nào. Hãy vào <Link to="/lobby">Sảnh chờ</Link> hoặc <Link to="/ai/new">Đánh với máy</Link>!
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} data-testid="history-list">
          {matches.map((m) => {
            const isRed = m.redUserId === currentUserId;
            const won = m.outcome?.winner ? (m.outcome.winner === (isRed ? 'RED' : 'BLACK')) : false;
            const draw = m.outcome?.winner === null;

            return (
              <div
                key={m.id}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '16px',
                  backgroundColor: '#fff',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
                data-testid="history-item"
              >
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '15px', marginBottom: '4px' }}>
                    {m.mode === 'AI' ? '🤖 Đấu với Máy' : '⚔️ Trực tuyến'} • {m.ply} nước
                  </div>
                  <div style={{ fontSize: '13px', color: '#555' }}>
                    Phe: {isRed ? '🔴 Đỏ' : '⚫ Đen'} • Kết quả:{' '}
                    <strong style={{ color: won ? '#28A745' : draw ? '#6C757D' : '#DC3545' }}>
                      {draw ? 'Hòa' : won ? 'Thắng' : 'Thua'}
                    </strong>
                    {m.outcome && ` (${m.outcome.reason})`}
                  </div>
                  <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>
                    {new Date(m.createdAt).toLocaleString('vi-VN')}
                  </div>
                </div>

                <Link
                  to={`/matches/${m.id}/replay`}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#155E75',
                    color: '#fff',
                    borderRadius: '4px',
                    textDecoration: 'none',
                    fontSize: '13px',
                    fontWeight: 'bold',
                  }}
                  data-testid="replay-btn"
                >
                  Xem lại
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
