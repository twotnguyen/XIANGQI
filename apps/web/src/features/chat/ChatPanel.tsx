import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../lib/supabase.js';
import { realtime } from '../../lib/realtime.js';
import type { ChatMessageDTO, ChatChannel } from '@xiangqi/contracts';

interface ChatPanelProps {
  roomId: string;
}

const CHANNEL_LABEL: Record<ChatChannel, string> = {
  PLAYERS: 'Người chơi',
  SPECTATORS: 'Khán giả',
};

function appendUnique(list: ChatMessageDTO[], incoming: ChatMessageDTO): ChatMessageDTO[] {
  if (list.some((m) => m.id === incoming.id)) return list;
  return [...list, incoming];
}

/** Prepend an older page, dropping ids already rendered (live pushes can overlap a page). */
function prependOlder(older: ChatMessageDTO[], current: ChatMessageDTO[]): ChatMessageDTO[] {
  const known = new Set(current.map((m) => m.id));
  return [...older.filter((m) => !known.has(m.id)), ...current];
}

export function ChatPanel({ roomId }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessageDTO[]>([]);
  const [channel, setChannel] = useState<ChatChannel>('PLAYERS');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<ChatChannel>('PLAYERS');
  /** Kept so a retry of the same draft reuses the same `clientMessageId`. */
  const pendingRef = useRef<{ clientMessageId: string; content: string } | null>(null);

  /** HTTP history page (keyset cursor walks backwards to older messages). */
  const loadHistory = useCallback(
    async (cursor?: string) => {
      try {
        const session = (await supabase.auth.getSession()).data.session;
        const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : '';
        const res = await fetch(`/api/v1/rooms/${roomId}/chat${query}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token ?? ''}`,
          },
        });
        const data = await res.json();
        if (!data.ok) return;
        const nextChannel = data.data.channel as ChatChannel;
        channelRef.current = nextChannel;
        setChannel(nextChannel);
        const page = data.data.messages as ChatMessageDTO[];
        setMessages((prev) => prependOlder(page, prev));
        setNextCursor((data.data.nextCursor as string | null) ?? null);
      } catch {
        // History stays as-is; live messages still arrive over the socket.
      }
    },
    [roomId],
  );

  const handleLoadOlder = useCallback(async () => {
    if (!nextCursor || loadingOlder) return;
    const container = containerRef.current;
    const previousHeight = container?.scrollHeight ?? 0;
    setLoadingOlder(true);
    await loadHistory(nextCursor);
    setLoadingOlder(false);
    // Keep the reader anchored on the message they were looking at.
    requestAnimationFrame(() => {
      if (container) container.scrollTop += container.scrollHeight - previousHeight;
    });
  }, [nextCursor, loadingOlder, loadHistory]);

  // History over HTTP (cursor-paged by the server) + live `chat:message` pushes.
  useEffect(() => {
    channelRef.current = 'PLAYERS';
    setMessages([]);
    setNextCursor(null);
    void loadHistory();

    // Joining the room is what makes the server push this tab's chat channels.
    const unsubscribeRoom = realtime.subscribeRoom(roomId);
    const offChat = realtime.subscribe('chat:message', (payload) => {
      if (payload.roomId !== roomId) return;
      if (payload.channel !== channelRef.current) return;
      setMessages((prev) => appendUnique(prev, payload.message));
    });

    return () => {
      offChat();
      unsubscribeRoom();
    };
  }, [roomId, loadHistory]);

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

    // Same draft → same clientMessageId, so a lost ack retries idempotently.
    const pending = pendingRef.current;
    const clientMessageId =
      pending && pending.content === trimmed ? pending.clientMessageId : crypto.randomUUID();
    pendingRef.current = { clientMessageId, content: trimmed };

    const res = await realtime.sendChat(roomId, clientMessageId, trimmed);
    if (res.ok) {
      pendingRef.current = null;
      setContent('');
      setMessages((prev) => appendUnique(prev, res.data));
    } else {
      setError(res.error.message);
    }
    setLoading(false);
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
        <span>Trò chuyện ({CHANNEL_LABEL[channel]})</span>
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
        {nextCursor && (
          <div style={{ padding: '4px 12px 0' }}>
            <button
              type="button"
              onClick={handleLoadOlder}
              disabled={loadingOlder}
              style={{ fontSize: '12px', padding: '2px 8px' }}
              data-testid="chat-load-older"
            >
              {loadingOlder ? 'Đang tải...' : 'Tải tin nhắn cũ hơn'}
            </button>
          </div>
        )}
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
