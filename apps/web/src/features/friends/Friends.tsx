import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase.js';

interface Profile {
  id: string;
  username: string;
  displayName: string | null;
}

interface FriendRelation {
  id: string;
  status: 'PENDING' | 'ACCEPTED';
  requesterId: string;
  recipientId: string;
  user: Profile;
  createdAt: string;
}

export function Friends() {
  const [friends, setFriends] = useState<FriendRelation[]>([]);
  const [incoming, setIncoming] = useState<FriendRelation[]>([]);
  const [outgoing, setOutgoing] = useState<FriendRelation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getHeaders = async () => {
    const session = (await supabase.auth.getSession()).data.session;
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.access_token ?? ''}`,
    };
  };

  const loadFriends = async () => {
    try {
      const headers = await getHeaders();
      const res = await fetch('/api/v1/friends', { headers });
      const data = await res.json();
      if (data.ok) {
        setFriends(data.data.friends);
        setIncoming(data.data.incomingRequests);
        setOutgoing(data.data.outgoingRequests);
      }
    } catch {
      setError('Không thể tải danh sách bạn bè');
    }
  };

  useEffect(() => {
    loadFriends();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.length < 3) return;

    setLoading(true);
    try {
      const headers = await getHeaders();
      const res = await fetch(`/api/v1/users?prefix=${encodeURIComponent(searchQuery)}`, { headers });
      const data = await res.json();
      if (data.ok) {
        setSearchResults(data.data);
      }
    } catch {
      setError('Tìm kiếm thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (recipientId: string) => {
    try {
      const headers = await getHeaders();
      const res = await fetch('/api/v1/friends/requests', {
        method: 'POST',
        headers,
        body: JSON.stringify({ recipientId }),
      });
      const data = await res.json();
      if (data.ok) {
        await loadFriends();
        setSearchResults((prev) => prev.filter((u) => u.id !== recipientId));
      } else {
        setError(data.error?.message ?? 'Không thể gửi yêu cầu');
      }
    } catch {
      setError('Lỗi kết nối');
    }
  };

  const handleRespond = async (requestId: string, accept: boolean) => {
    try {
      const headers = await getHeaders();
      const res = await fetch(`/api/v1/friends/requests/${requestId}/respond`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ accept }),
      });
      const data = await res.json();
      if (data.ok) {
        await loadFriends();
      }
    } catch {
      setError('Lỗi kết nối');
    }
  };

  const handleCancel = async (requestId: string) => {
    try {
      const headers = await getHeaders();
      const res = await fetch(`/api/v1/friends/requests/${requestId}`, {
        method: 'DELETE',
        headers,
      });
      const data = await res.json();
      if (data.ok) {
        await loadFriends();
      }
    } catch {
      setError('Lỗi kết nối');
    }
  };

  const handleUnfriend = async (userId: string) => {
    try {
      const headers = await getHeaders();
      const res = await fetch(`/api/v1/friends/${userId}`, {
        method: 'DELETE',
        headers,
      });
      const data = await res.json();
      if (data.ok) {
        await loadFriends();
      }
    } catch {
      setError('Lỗi kết nối');
    }
  };

  return (
    <main style={{ maxWidth: '600px', margin: '20px auto', padding: '20px' }}>
      <h1>Bạn bè</h1>
      {error && (
        <div role="alert" style={{ color: '#DC3545', marginBottom: '12px' }}>
          {error}
        </div>
      )}

      {/* User search form */}
      <section style={{ marginBottom: '24px' }}>
        <h2>Tìm người dùng</h2>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            placeholder="Nhập ít nhất 3 ký tự..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1, padding: '8px' }}
            data-testid="user-search-input"
          />
          <button type="submit" disabled={loading || searchQuery.length < 3}>
            {loading ? 'Đang tìm...' : 'Tìm kiếm'}
          </button>
        </form>

        {searchResults.length > 0 && (
          <ul style={{ listStyle: 'none', padding: 0, marginTop: '12px' }}>
            {searchResults.map((user) => (
              <li
                key={user.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px',
                  borderBottom: '1px solid #eee',
                }}
              >
                <span>
                  <strong>{user.username}</strong>
                  {user.displayName && ` (${user.displayName})`}
                </span>
                <button
                  onClick={() => handleSendRequest(user.id)}
                  data-testid={`add-friend-${user.username}`}
                >
                  Kết bạn
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Incoming requests */}
      {incoming.length > 0 && (
        <section style={{ marginBottom: '24px' }}>
          <h2>Lời mời kết bạn ({incoming.length})</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {incoming.map((req) => (
              <li
                key={req.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px',
                  backgroundColor: '#f8f9fa',
                  marginBottom: '4px',
                }}
              >
                <span>{req.user.username}</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button onClick={() => handleRespond(req.id, true)}>Đồng ý</button>
                  <button onClick={() => handleRespond(req.id, false)}>Từ chối</button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Outgoing requests */}
      {outgoing.length > 0 && (
        <section style={{ marginBottom: '24px' }}>
          <h2>Đã gửi ({outgoing.length})</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {outgoing.map((req) => (
              <li
                key={req.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px',
                  marginBottom: '4px',
                }}
              >
                <span>{req.user.username} (đang chờ)</span>
                <button onClick={() => handleCancel(req.id)}>Hủy</button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Friends list */}
      <section>
        <h2>Danh sách bạn bè ({friends.length})</h2>
        {friends.length === 0 ? (
          <p>Chưa có bạn bè nào.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {friends.map((fr) => (
              <li
                key={fr.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px',
                  borderBottom: '1px solid #eee',
                }}
              >
                <span>
                  <strong>{fr.user.username}</strong>
                  {fr.user.displayName && ` (${fr.user.displayName})`}
                </span>
                <button onClick={() => handleUnfriend(fr.user.id)}>Hủy bạn</button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
