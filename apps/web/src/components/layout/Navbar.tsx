import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { supabase } from '../../lib/supabase.js';

export function Navbar() {
  const [sessionUser, setSessionUser] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSessionUser(data.session?.user?.id ?? null);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionUser(session?.user?.id ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const navItems = [
    { to: '/lobby', label: 'Sảnh chờ' },
    { to: '/ai/new', label: 'Đánh với máy' },
    { to: '/friends', label: 'Bạn bè' },
    { to: '/history', label: 'Lịch sử' },
  ];

  return (
    <header
      style={{
        backgroundColor: '#704525',
        color: '#F5E8CC',
        padding: '10px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        flexWrap: 'wrap',
        gap: '8px',
      }}
      data-testid="main-navbar"
    >
      <Link
        to="/lobby"
        style={{
          color: '#F5E8CC',
          textDecoration: 'none',
          fontWeight: 'bold',
          fontSize: '18px',
          letterSpacing: '1px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <span>象棋</span>
        <span>XIANGQI</span>
      </Link>

      <nav style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              style={{
                color: isActive ? '#fff' : '#F5E8CC',
                backgroundColor: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                padding: '6px 10px',
                borderRadius: '4px',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: isActive ? 'bold' : 'normal',
                transition: 'background-color 0.2s',
              }}
            >
              {item.label}
            </Link>
          );
        })}

        {sessionUser ? (
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = '/login';
            }}
            style={{
              padding: '6px 12px',
              backgroundColor: 'transparent',
              color: '#F5E8CC',
              border: '1px solid #F5E8CC',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
            data-testid="nav-logout-btn"
          >
            Đăng xuất
          </button>
        ) : (
          <Link
            to="/login"
            style={{
              padding: '6px 12px',
              backgroundColor: '#D8AE72',
              color: '#28221C',
              borderRadius: '4px',
              textDecoration: 'none',
              fontSize: '12px',
              fontWeight: 'bold',
            }}
          >
            Đăng nhập
          </Link>
        )}
      </nav>
    </header>
  );
}
