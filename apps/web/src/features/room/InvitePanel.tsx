import React, { useState } from 'react';
import { supabase } from '../../lib/supabase.js';

interface InvitePanelProps {
  roomId: string;
  isOwner: boolean;
}

export function InvitePanel({ roomId, isOwner }: InvitePanelProps) {
  const [playCode, setPlayCode] = useState<string | null>(null);
  const [playLink, setPlayLink] = useState<string | null>(null);
  const [watchCode, setWatchCode] = useState<string | null>(null);
  const [watchLink, setWatchLink] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getHeaders = async () => {
    const session = (await supabase.auth.getSession()).data.session;
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.access_token ?? ''}`,
    };
  };

  const handleCreatePlayInvite = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = await getHeaders();
      const res = await fetch(`/api/v1/rooms/${roomId}/invitations`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ role: 'PLAYER' }),
      });
      const data = await res.json();
      if (data.ok) {
        setPlayCode(data.data.code);
        if (data.data.rawToken) {
          const origin = window.location.origin;
          setPlayLink(`${origin}/join#token=${data.data.rawToken}&role=PLAYER`);
        }
      } else {
        setError(data.error?.message ?? 'Không thể tạo lời mời');
      }
    } catch {
      setError('Lỗi kết nối');
    } finally {
      setLoading(false);
    }
  };

  const handleGetWatchCode = async (rotate = false) => {
    setLoading(true);
    setError(null);
    try {
      const headers = await getHeaders();
      const res = await fetch(`/api/v1/rooms/${roomId}/watch-code`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ rotate }),
      });
      const data = await res.json();
      if (data.ok) {
        setWatchCode(data.data.code);
        const origin = window.location.origin;
        setWatchLink(`${origin}/join#token=${data.data.token}&role=SPECTATOR`);
      } else {
        setError(data.error?.message ?? 'Không thể tạo mã xem');
      }
    } catch {
      setError('Lỗi kết nối');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div
      style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '16px',
        backgroundColor: '#fdfbf7',
        marginTop: '16px',
      }}
      data-testid="invite-panel"
    >
      <h3 style={{ margin: '0 0 12px 0' }}>Mời tham gia phòng</h3>
      {error && (
        <div role="alert" style={{ color: '#DC3545', marginBottom: '8px', fontSize: '14px' }}>
          {error}
        </div>
      )}

      {/* Play Invite */}
      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Mời chơi (1 lần dùng)</h4>
        {playCode ? (
          <div>
            <p style={{ margin: '4px 0', fontSize: '14px' }}>
              Mã phòng: <strong data-testid="play-code">{playCode}</strong>
            </p>
            {playLink && (
              <button
                onClick={() => copyToClipboard(playLink, 'playLink')}
                style={{ padding: '6px 12px', fontSize: '12px' }}
              >
                {copied === 'playLink' ? 'Đã chép link!' : 'Chép link mời chơi'}
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={handleCreatePlayInvite}
            disabled={loading}
            data-testid="create-play-invite-btn"
            style={{ padding: '6px 16px', fontSize: '13px' }}
          >
            Tạo mã/link mời chơi
          </button>
        )}
      </div>

      {/* Watch Code (Owner only) */}
      {isOwner && (
        <div>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Mã người xem (tối đa 5 người)</h4>
          {watchCode ? (
            <div>
              <p style={{ margin: '4px 0', fontSize: '14px' }}>
                Mã xem: <strong data-testid="watch-code">{watchCode}</strong>
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                {watchLink && (
                  <button
                    onClick={() => copyToClipboard(watchLink, 'watchLink')}
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                  >
                    {copied === 'watchLink' ? 'Đã chép!' : 'Chép link xem'}
                  </button>
                )}
                <button
                  onClick={() => handleGetWatchCode(true)}
                  disabled={loading}
                  style={{ padding: '6px 12px', fontSize: '12px', backgroundColor: '#e2e3e5' }}
                >
                  Đổi mã mới
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => handleGetWatchCode(false)}
              disabled={loading}
              data-testid="get-watch-code-btn"
              style={{ padding: '6px 16px', fontSize: '13px' }}
            >
              Lấy mã xem phòng
            </button>
          )}
        </div>
      )}
    </div>
  );
}
