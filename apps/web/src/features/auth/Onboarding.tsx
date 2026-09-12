import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '../../lib/supabase.js';

export function Onboarding() {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const normalized = username.toLowerCase().trim();
    if (!/^[a-z0-9_]{3,24}$/.test(normalized)) {
      setError('Tên đăng nhập phải gồm 3-24 ký tự thường, số hoặc gạch dưới');
      return;
    }

    setLoading(true);

    try {
      const session = (await supabase.auth.getSession()).data.session;
      if (!session) {
        setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        navigate('/login');
        return;
      }

      const res = await fetch('/api/v1/auth/complete-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          username: normalized,
          displayName: displayName.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!data.ok) {
        setError(data.error?.message ?? 'Không thể hoàn tất hồ sơ');
        setLoading(false);
        return;
      }

      navigate('/lobby');
    } catch {
      setError('Lỗi kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: '400px', margin: '40px auto', padding: '20px' }}>
      <h1>Hoàn tất hồ sơ</h1>
      <p>Chào mừng bạn! Vui lòng chọn tên đăng nhập để bắt đầu chơi cờ.</p>
      {error && (
        <div role="alert" style={{ color: '#DC3545', marginBottom: '16px' }}>
          {error}
        </div>
      )}
      <form onSubmit={handleComplete}>
        <div style={{ marginBottom: '12px' }}>
          <label htmlFor="username">Tên đăng nhập (3-24 ký tự thường, số, _)</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label htmlFor="displayName">Tên hiển thị (tùy chọn)</label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: '10px' }}
        >
          {loading ? 'Đang lưu...' : 'Hoàn tất'}
        </button>
      </form>
    </main>
  );
}
