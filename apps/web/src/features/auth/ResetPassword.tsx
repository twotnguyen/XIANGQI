import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { supabase } from '../../lib/supabase.js';

export function ResetPassword() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState<'REQUEST' | 'UPDATE'>('REQUEST');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    // If arriving with recovery token in hash/session, switch to UPDATE step
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setStep('UPDATE');
      }
    });
  }, []);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const appOrigin = window.location.origin;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${appOrigin}/auth/reset-password`,
      });

      if (resetError) {
        setError(resetError.message);
      } else {
        setMessage('Nếu email tồn tại trong hệ thống, bạn sẽ nhận được liên kết đặt lại mật khẩu.');
      }
    } catch {
      setError('Yêu cầu thất bại. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPassword.length < 10) {
      setError('Mật khẩu mới phải có ít nhất 10 ký tự');
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      // Per spec: after password reset, force logout ALL sessions
      const session = (await supabase.auth.getSession()).data.session;
      if (session) {
        await fetch('/api/v1/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ scope: 'ALL' }),
        });
      }

      await supabase.auth.signOut({ scope: 'global' });
      navigate('/login');
    } catch {
      setError('Cập nhật mật khẩu thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: '400px', margin: '40px auto', padding: '20px' }}>
      <h1>{step === 'REQUEST' ? 'Quên mật khẩu' : 'Đặt mật khẩu mới'}</h1>
      {error && (
        <div role="alert" style={{ color: '#DC3545', marginBottom: '16px' }}>
          {error}
        </div>
      )}
      {message && (
        <div role="status" style={{ color: '#28A745', marginBottom: '16px' }}>
          {message}
        </div>
      )}

      {step === 'REQUEST' ? (
        <form onSubmit={handleRequest}>
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="email">Nhập email tài khoản</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '10px' }}
          >
            {loading ? 'Đang gửi...' : 'Gửi liên kết đặt lại'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleUpdate}>
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="newPassword">Mật khẩu mới (tối thiểu 10 ký tự)</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={10}
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '10px' }}
          >
            {loading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
          </button>
        </form>
      )}

      <p style={{ marginTop: '16px', textAlign: 'center' }}>
        <Link to="/login">Quay lại đăng nhập</Link>
      </p>
    </main>
  );
}
