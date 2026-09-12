import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase.js';
import type { ChatMessageDTO, ChatChannel } from '@xiangqi/contracts';

interface ChatPanelProps {
  roomId: string;
}

export function ChatPanel({ roomId }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessageDTO[]>([]);
  const [channel, setChannel] = useState<ChatChannel>('PLAYERS');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const getHeaders = async () => {
    const session = (await supabase.auth.getSession()).data.session;
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.access_token ?? ''}`,
    };
  };

  const loadHistory = async () => {
    try {
      const headers = await getHeaders();
      const res = await fetch(`/api/v1/rooms/${roomId}/chat`, { headers });
      const data = await res.json();
      if (data.ok) {
        setChannel(data.data.channel);
        setMessages(data.data.messages);
      }
    } catch {
      // Background poll failure is non-fatal
    }
  };

  // Initial load + periodic poll (2s)
  useEffect(() => {
    loadHistory();
    const interval = setInterval(loadHistory, 2000);
    return () => clearInterval(interval);
  }, [roomId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || trimmed.length > 1000 || loading) return;

    setLoading(true);
    setError(null);

    const clientMessageId = crypto.randomUUID();
    try {
      const headers = await getHeaders();
      const res = await fetch(`/api/v1/rooms/${roomId}/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          clientMessageId,
          content: trimmed,
        }),
      });

      const data = await res.json();
      if (data.ok) {
        setContent('');
        setMessages((prev) => [...prev, data.data]);
      } else {
        setError(data.error?.message ?? 'Không thể gửi tin nhắn');
      }
    } catch {
      setError('Lỗi kết nối');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        height: '300px',
        margin: '12px 0',
      }}
      data-testid="chat-panel"
    >
      {/* Header */}
      <div
        style={{
          padding: '8px 12px',
          borderBottom: '1px solid #eee',
          fontSize: '13px',
          fontWeight: 'bold',
          color: '#666',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span>Trò chuyện ({channel === 'PLAYERS' ? 'Người chơi' : 'Khán giả'})</span>
        <span style={{ fontSize: '11px', color: '#999' }}>Tối đa 1000 ký tự</span>
      </div>

      {error && (
        <div role="alert" style={{ color: '#DC3545', padding: '4px 12px', fontSize: '12px' }}>
          {error}
        </div>
      )}

      {/* Messages list */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '8px 12px',
          fontSize: '13px',
        }}
        data-testid="chat-messages-container"
      >
        {messages.length === 0 ? (
          <p style={{ color: '#999', textAlign: 'center', margin: '20px 0' }}>
            Chưa có tin nhắn nào.
          </p>
        ) : (
          messages.map((m) => (
            <div key={m.id} style={{ marginBottom: '6px' }} data-testid="chat-message-item">
              <strong style={{ color: '#155E75' }}>
                {m.senderDisplayName || m.senderUsername}:{' '}
              </strong>
              {/* Plain text with whitespace preserved to prevent XSS */}
              <span style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {m.content}
              </span>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input form */}
      <form
        onSubmit={handleSend}
        style={{
          display: 'flex',
          borderTop: '1px solid #eee',
          padding: '6px',
          gap: '6px',
        }}
      >
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Nhập tin nhắn..."
          maxLength={1000}
          disabled={loading}
          style={{ flex: 1, padding: '6px 8px', fontSize: '13px', boxSizing: 'border-box' }}
          data-testid="chat-input"
        />
        <button
          type="submit"
          disabled={loading || !content.trim()}
          style={{ padding: '6px 16px', fontSize: '13px' }}
          data-testid="chat-send-btn"
        >
          Gửi
        </button>
      </form>
    </div>
  );
}
