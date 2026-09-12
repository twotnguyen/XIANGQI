import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { supabase } from '../../lib/supabase.js';
import { InvitePanel } from './InvitePanel.js';
import type { RoomDTO } from '@xiangqi/contracts';

export function RoomWaiting() {
  const { id: roomId } = useParams<{ id: string }>();
  const [room, setRoom] = useState<RoomDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  const getHeaders = async () => {
    const session = (await supabase.auth.getSession()).data.session;
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.access_token ?? ''}`,
    };
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setCurrentUserId(session.user.id);
    });
  }, []);

  const loadRoom = async () => {
    if (!roomId) return;
    try {
      const headers = await getHeaders();
      const res = await fetch(`/api/v1/rooms/${roomId}`, { headers });
      const data = await res.json();
      if (data.ok) {
        setRoom(data.data);
      } else {
        setError(data.error?.message ?? 'Không thể tải thông tin phòng');
      }
    } catch {
      setError('Lỗi kết nối máy chủ');
    }
  };

  useEffect(() => {
    loadRoom();
  }, [roomId]);

  const handleToggleReady = async () => {
    if (!roomId || !room) return;
    const currentMember = room.members.find((m) => m.userId === currentUserId);
    const newReady = !currentMember?.ready;

    try {
      const headers = await getHeaders();
      const res = await fetch(`/api/v1/rooms/${roomId}/ready`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ ready: newReady }),
      });
      const data = await res.json();
      if (data.ok) {
        setRoom(data.data.room);
      }
    } catch {
      setError('Không thể cập nhật trạng thái');
    }
  };

  const handleLeave = async () => {
    if (!roomId) return;
    try {
      const headers = await getHeaders();
      await fetch(`/api/v1/rooms/${roomId}/leave`, {
        method: 'POST',
        headers,
      });
      navigate('/lobby');
    } catch {
      navigate('/lobby');
    }
  };

  if (error) {
    return (
      <main style={{ maxWidth: '600px', margin: '40px auto', padding: '20px' }}>
        <h2>Lỗi phòng</h2>
        <p role="alert" style={{ color: '#DC3545' }}>{error}</p>
        <button onClick={() => navigate('/lobby')}>Về sảnh chờ</button>
      </main>
    );
  }

  if (!room) {
    return (
      <main style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', textAlign: 'center' }}>
        <p>Đang tải phòng...</p>
      </main>
    );
  }

  const redPlayer = room.members.find((m) => m.role === 'PLAYER' && m.side === 'RED');
  const blackPlayer = room.members.find((m) => m.role === 'PLAYER' && m.side === 'BLACK');
  const currentMember = room.members.find((m) => m.userId === currentUserId);
  const isPlayer = currentMember?.role === 'PLAYER';

  return (
    <main style={{ maxWidth: '600px', margin: '20px auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>{room.name}</h1>
        <button onClick={handleLeave} style={{ padding: '8px 16px' }}>
          Rời phòng
        </button>
      </div>

      <p style={{ color: '#666' }}>
        Trạng thái: {room.status} | Thời gian:{' '}
        {room.timeControl === 0 ? 'Không giới hạn' : `${room.timeControl / 60} phút`}
      </p>

      {/* Seats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', margin: '24px 0' }}>
        {/* Red Seat */}
        <div
          style={{
            border: '2px solid #A51F25',
            borderRadius: '8px',
            padding: '16px',
            textAlign: 'center',
            backgroundColor: '#fff',
          }}
          data-testid="seat-red"
        >
          <h3 style={{ color: '#A51F25', margin: '0 0 8px 0' }}>Bên Đỏ (Đi trước)</h3>
          {redPlayer ? (
            <div>
              <p style={{ fontWeight: 'bold' }}>{redPlayer.userId.slice(0, 8)}...</p>
              <span
                style={{
                  display: 'inline-block',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  backgroundColor: redPlayer.ready ? '#28A745' : '#FFC107',
                  color: '#fff',
                }}
              >
                {redPlayer.ready ? 'SẴN SÀNG' : 'CHƯA SẴN SÀNG'}
              </span>
            </div>
          ) : (
            <p style={{ color: '#999' }}>Ghế trống</p>
          )}
        </div>

        {/* Black Seat */}
        <div
          style={{
            border: '2px solid #28221C',
            borderRadius: '8px',
            padding: '16px',
            textAlign: 'center',
            backgroundColor: '#fff',
          }}
          data-testid="seat-black"
        >
          <h3 style={{ color: '#28221C', margin: '0 0 8px 0' }}>Bên Đen (Đi sau)</h3>
          {blackPlayer ? (
            <div>
              <p style={{ fontWeight: 'bold' }}>{blackPlayer.userId.slice(0, 8)}...</p>
              <span
                style={{
                  display: 'inline-block',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  backgroundColor: blackPlayer.ready ? '#28A745' : '#FFC107',
                  color: '#fff',
                }}
              >
                {blackPlayer.ready ? 'SẴN SÀNG' : 'CHƯA SẴN SÀNG'}
              </span>
            </div>
          ) : (
            <p style={{ color: '#999' }}>Chờ người chơi...</p>
          )}
        </div>
      </div>

      {/* Player controls */}
      {isPlayer && (
        <div style={{ textAlign: 'center', margin: '20px 0' }}>
          <button
            onClick={handleToggleReady}
            data-testid="ready-toggle-btn"
            style={{
              padding: '12px 32px',
              fontSize: '16px',
              fontWeight: 'bold',
              backgroundColor: currentMember?.ready ? '#6c757d' : '#28A745',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {currentMember?.ready ? 'Hủy sẵn sàng' : 'SẴN SÀNG'}
          </button>
        </div>
      )}

      {/* Invite panel */}
      {room.status === 'WAITING' && (
        <InvitePanel
          roomId={room.id}
          isOwner={room.ownerId === currentUserId}
        />
      )}
    </main>
  );
}
