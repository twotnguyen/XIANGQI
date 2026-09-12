import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '../../lib/supabase.js';
import type { RoomDTO, Visibility, TimeControl } from '@xiangqi/contracts';

export function Lobby() {
  const [rooms, setRooms] = useState<RoomDTO[]>([]);
  const [roomName, setRoomName] = useState('');
  const [visibility, setVisibility] = useState<Visibility>('PUBLIC');
  const [timeControl, setTimeControl] = useState<TimeControl>(0);
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getHeaders = async () => {
    const session = (await supabase.auth.getSession()).data.session;
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.access_token ?? ''}`,
    };
  };

  const loadRooms = async () => {
    try {
      const headers = await getHeaders();
      const res = await fetch('/api/v1/rooms', { headers });
      const data = await res.json();
      if (data.ok) {
        setRooms(data.data);
      }
    } catch {
      setError('Không thể tải danh sách phòng');
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const headers = await getHeaders();
      const res = await fetch('/api/v1/rooms', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: roomName.trim(),
          visibility,
          timeControl: Number(timeControl),
        }),
      });

      const data = await res.json();
      if (!data.ok) {
        setError(data.error?.message ?? 'Không thể tạo phòng');
        return;
      }

      navigate(`/rooms/${data.data.id}`);
    } catch {
      setError('Lỗi kết nối khi tạo phòng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: '800px', margin: '20px auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Sảnh chờ</h1>
        <button
          onClick={() => setShowCreate(!showCreate)}
          data-testid="create-room-toggle-btn"
          style={{ padding: '8px 16px' }}
        >
          {showCreate ? 'Đóng' : '+ Tạo phòng mới'}
        </button>
      </div>

      {error && (
        <div role="alert" style={{ color: '#DC3545', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {showCreate && (
        <form
          onSubmit={handleCreateRoom}
          style={{
            padding: '16px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            marginBottom: '24px',
          }}
          data-testid="create-room-form"
        >
          <h3>Tạo phòng cờ mới</h3>
          <div style={{ marginBottom: '12px' }}>
            <label htmlFor="roomName">Tên phòng</label>
            <input
              id="roomName"
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="VD: Cờ vui vẻ"
              required
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ marginBottom: '12px', display: 'flex', gap: '16px' }}>
            <div>
              <label htmlFor="visibility">Chế độ phòng</label>
              <select
                id="visibility"
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as Visibility)}
                style={{ display: 'block', padding: '8px', marginTop: '4px' }}
              >
                <option value="PUBLIC">Công khai</option>
                <option value="CODE_ONLY">Mã phòng</option>
                <option value="LOCKED">Khóa (riêng tư)</option>
              </select>
            </div>
            <div>
              <label htmlFor="timeControl">Thời gian mỗi bên</label>
              <select
                id="timeControl"
                value={timeControl}
                onChange={(e) => setTimeControl(Number(e.target.value) as TimeControl)}
                style={{ display: 'block', padding: '8px', marginTop: '4px' }}
              >
                <option value={0}>Không giới hạn</option>
                <option value={300}>5 phút</option>
                <option value={600}>10 phút</option>
                <option value={900}>15 phút</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || !roomName.trim()}
            style={{ padding: '8px 24px' }}
          >
            {loading ? 'Đang tạo...' : 'Xác nhận tạo phòng'}
          </button>
        </form>
      )}

      <h2>Phòng đang mở ({rooms.length})</h2>
      {rooms.length === 0 ? (
        <p>Chưa có phòng công khai nào. Hãy tạo phòng mới để bắt đầu!</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
          {rooms.map((room) => (
            <div
              key={room.id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '16px',
                backgroundColor: '#fff',
              }}
              data-testid={`room-card-${room.id}`}
            >
              <h3 style={{ margin: '0 0 8px 0' }}>{room.name}</h3>
              <p style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>
                Thời gian: {room.timeControl === 0 ? 'Không giới hạn' : `${room.timeControl / 60} phút`}
              </p>
              <p style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>
                Người chơi: {room.members.filter((m) => m.role === 'PLAYER').length}/2
              </p>
              <button
                onClick={() => navigate(`/rooms/${room.id}`)}
                style={{ marginTop: '8px', width: '100%', padding: '8px' }}
              >
                Vào phòng
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
