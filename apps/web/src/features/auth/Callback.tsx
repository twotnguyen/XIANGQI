import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '../../lib/supabase.js';

export function Callback() {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Exchange code for session using PKCE
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
          window.location.href,
        );

        // Remove auth code from URL immediately per spec
        window.history.replaceState({}, document.title, window.location.pathname);

        if (exchangeError) {
          setError('Liên kết xác minh không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.');
          return;
        }

        // Check profile
        const res = await fetch('/api/v1/me', {
          headers: {
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
        });
        const data = await res.json();

        // Safe redirect guard: only internal relative paths, never external URLs
        const searchParams = new URLSearchParams(window.location.search);
        const nextParam = searchParams.get('next');
        const isSafeRedirect = nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//') && !nextParam.includes(':');

        if (data.data?.onboardingRequired) {
          navigate('/onboarding');
        } else if (isSafeRedirect) {
          navigate(nextParam);
        } else {
          navigate('/lobby');
        }
      } catch {
        setError('Xác thực thất bại. Vui lòng đăng nhập lại.');
      }
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <main style={{ maxWidth: '400px', margin: '40px auto', padding: '20px' }}>
        <h1>Lỗi xác thực</h1>
        <p role="alert" style={{ color: '#DC3545' }}>{error}</p>
        <a href="/login">Quay lại đăng nhập</a>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: '400px', margin: '40px auto', padding: '20px', textAlign: 'center' }}>
      <h1>Đang xác thực...</h1>
      <p>Vui lòng đợi trong giây lát.</p>
    </main>
  );
}
