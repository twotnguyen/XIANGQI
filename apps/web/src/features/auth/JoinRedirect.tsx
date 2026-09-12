import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '../../lib/supabase.js';

export function JoinRedirect() {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleJoin = async () => {
      // Extract fragment parameters: #token=...&role=...
      const hash = window.location.hash.slice(1);
      const params = new URLSearchParams(hash);
      const token = params.get('token') || sessionStorage.getItem('pending_join_token');
      const role = (params.get('role') as 'PLAYER' | 'SPECTATOR') ||
                   (sessionStorage.getItem('pending_join_role') as 'PLAYER' | 'SPECTATOR') ||
                   'SPECTATOR';

      // Clean up hash immediately from URL to protect token from history/referrers
      if (window.location.hash) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      if (!token) {
        setError('Liên kết tham gia không hợp lệ');
        return;
      }

      // Check if user is authenticated
      const session = (await supabase.auth.getSession()).data.session;
      if (!session) {
        // Save token to sessionStorage for this tab, redirect to login
        sessionStorage.setItem('pending_join_token', token);
        sessionStorage.setItem('pending_join_role', role);
        navigate('/login');
        return;
      }

      // Authenticated — consume token to join room
      try {
        const res = await fetch('/api/v1/rooms/join', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ token, role }),
        });

        const data = await res.json();
        sessionStorage.removeItem('pending_join_token');
        sessionStorage.removeItem('pending_join_role');

        if (!data.ok) {
          setError(data.error?.message ?? 'Không thể tham gia phòng');
          return;
        }

        navigate(`/rooms/${data.data.id}`);
      } catch {
        setError('Lỗi kết nối khi tham gia phòng');
      }
    };

    handleJoin();
  }, [navigate]);

  if (error) {
    return (
      <main style={{ maxWidth: '400px', margin: '40px auto', padding: '20px', textAlign: 'center' }}>
        <h2>Không thể tham gia</h2>
        <p role="alert" style={{ color: '#DC3545' }}>{error}</p>
        <button onClick={() => navigate('/lobby')}>Về sảnh chờ</button>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: '400px', margin: '40px auto', padding: '20px', textAlign: 'center' }}>
      <p>Đang xử lý tham gia phòng...</p>
    </main>
  );
}
