import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '../../lib/supabase.js';
import type { Side, AiLevel, TimeControl } from '@xiangqi/contracts';

export function NewAiMatch() {
  const [side, setSide] = useState<Side>('RED');
  const [level, setLevel] = useState<AiLevel>('MEDIUM');
  const [timeControl, setTimeControl] = useState<TimeControl>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const session = (await supabase.auth.getSession()).data.session;
      const res = await fetch('/api/v1/ai/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token ?? ''}`,
        },
        body: JSON.stringify({
          humanSide: side,
          level,
          timeControl,
        }),
      });

      const data = await res.json();
      if (data.ok) {
        navigate(`/matches/${data.data.id}`);
      } else {
        if (data.error?.code === 'AI_BUSY') {
          setError('Hệ thống AI đang bận xử lý các ván khác. Vui lòng thử lại sau giây lát.');
        } else {
          setError(data.error?.message ?? 'Không thể khởi tạo ván cờ với AI');
        }
      }
    } catch {
      setError('Lỗi kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: '480px', margin: '40px auto', padding: '24px', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Chơi với máy (AI)</h1>

      {error && (
        <div
          role="alert"
          style={{
            padding: '12px',
            backgroundColor: '#F8D7DA',
            color: '#721C24',
            borderRadius: '4px',
            marginBottom: '16px',
            fontSize: '14px',
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleStart} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label htmlFor="side-select" style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>
            Bên chơi
          </label>
          <select
            id="side-select"
            aria-label="Bên chơi"
            value={side}
            onChange={(e) => setSide(e.target.value as Side)}
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          >
            <option value="RED">Đỏ (đi trước)</option>
            <option value="BLACK">Đen (đi sau)</option>
          </select>
        </div>

        <div>
          <label htmlFor="level-select" style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>
            Cấp độ máy
          </label>
          <select
            id="level-select"
            aria-label="Cấp độ máy"
            value={level}
            onChange={(e) => setLevel(e.target.value as AiLevel)}
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          >
            <option value="EASY">Dễ (tìm kiếm nhanh)</option>
            <option value="MEDIUM">Trung bình (chuẩn)</option>
            <option value="HARD">Khó (tính sâu)</option>
          </select>
        </div>

        <div>
          <label htmlFor="time-select" style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>
            Thời gian
          </label>
          <select
            id="time-select"
            aria-label="Thời gian"
            value={timeControl}
            onChange={(e) => setTimeControl(Number(e.target.value) as TimeControl)}
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          >
            <option value={0}>Không giới hạn</option>
            <option value={300}>5 phút</option>
            <option value={600}>10 phút</option>
            <option value={900}>15 phút</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: '8px',
            padding: '12px',
            backgroundColor: '#A51F25',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Đang khởi tạo...' : 'Bắt đầu ván đấu'}
        </button>
      </form>
    </main>
  );
}
