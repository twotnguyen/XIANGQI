import React, { useState } from 'react';
import { Link } from 'react-router';
import { supabase } from '../../lib/supabase.js';

export function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    // Password validation per spec: >= 10 chars
    if (password.length < 10) {
      setError('Mật khẩu phải có ít nhất 10 ký tự');
      return;
    }

    // Username regex: 3-24 chars lowercase alphanumeric/underscore
    const normalizedUsername = username.toLowerCase().trim();
    if (!/^[a-z0-9_]{3,24}$/.test(normalizedUsername)) {
      setError('Tên đăng nhập phải gồm 3-24 ký tự thường, số hoặc gạch dưới');
      return;
    }

    setLoading(true);

    try {
      const appOrigin = window.location.origin;
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            signup_username: normalizedUsername,
            signup_display_name: displayName || normalizedUsername,
          },
          emailRedirectTo: `${appOrigin}/auth/callback`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
      } else {
        setMessage(
          'Đăng ký thành công! Vui lòng kiểm tra hộp thư để xác minh tài khoản trước khi đăng nhập.',
        );
      }
    } catch {
      setError('Đăng ký thất bại. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: '400px', margin: '40px auto', padding: '20px' }}>
      <h1>Đăng ký</h1>
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
      <form onSubmit={handleRegister}>
        <div style={{ marginBottom: '12px' }}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
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
        <div style={{ marginBottom: '12px' }}>
          <label htmlFor="displayName">Tên hiển thị</label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label htmlFor="password">Mật khẩu (tối thiểu 10 ký tự)</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={10}
            autoComplete="new-password"
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: '10px' }}
        >
          {loading ? 'Đang đăng ký...' : 'Đăng ký'}
        </button>
      </form>
      <p style={{ marginTop: '16px', textAlign: 'center' }}>
        Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
      </p>
    </main>
  );
}
