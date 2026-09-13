/**
 * Chat domain service.
 * Separates PLAYERS and SPECTATORS into isolated channels.
 * Prevents XSS, enforces 5 msgs / 10s rate limit, dedupes clientMessageId.
 */
import crypto from 'node:crypto';
import type pg from 'pg';
import { getPool } from '../../db/pool.js';
import type { ChatMessageDTO, ChatChannel } from '@xiangqi/contracts';

// In-memory rate limiter: Map<userId, timestamp[]>
const userMessageTimestamps = new Map<string, number[]>();

type ChatListener = (message: ChatMessageDTO) => void;
const channelListeners = new Map<string, Set<ChatListener>>();

export function subscribeChat(key: string, listener: ChatListener): () => void {
  let set = channelListeners.get(key);
  if (!set) {
    set = new Set();
    channelListeners.set(key, set);
  }
  set.add(listener);
  return () => {
    set?.delete(listener);
    if (set?.size === 0) channelListeners.delete(key);
  };
}

export function emitChatMessage(message: ChatMessageDTO): void {
  const key = `${message.matchId}:${message.channel}`;
  const set = channelListeners.get(key);
  if (!set) return;
  for (const listener of set) {
    try {
      listener(message);
    } catch (err) {
      console.error('Chat broadcast error:', err);
    }
  }
}

export async function sendMessage(
  userId: string,
  roomId: string,
  clientMessageId: string,
  content: string,
  pool?: pg.Pool,
): Promise<{ message: ChatMessageDTO; isDuplicate: boolean }> {
  // Rate limit: max 5 messages per 10s
  const now = Date.now();
  const timestamps = userMessageTimestamps.get(userId) ?? [];
  const recent = timestamps.filter((t) => now - t < 10000);
  if (recent.length >= 5) {
    throw { statusCode: 429, code: 'RATE_LIMITED', message: 'Bạn gửi tin nhắn quá nhanh (tối đa 5 tin/10 giây)' };
  }
  recent.push(now);
  userMessageTimestamps.set(userId, recent);

  const p = pool ?? getPool();
  const client = await p.connect();

  try {
    // 1. Fetch room & current_match_id
    const roomRes = await client.query(
      'SELECT current_match_id, status FROM public.rooms WHERE id = $1',
      [roomId],
    );
    if (roomRes.rowCount === 0) {
      throw { statusCode: 404, code: 'NOT_FOUND', message: 'Phòng không tồn tại' };
    }
    const matchId = roomRes.rows[0].current_match_id;
    if (!matchId) {
      throw { statusCode: 409, code: 'CONFLICT', message: 'Chưa có ván cờ đang hoạt động' };
    }

    // 2. Check membership and derive channel
    const memberRes = await client.query(
      'SELECT role FROM public.room_members WHERE room_id = $1 AND user_id = $2',
      [roomId, userId],
    );
    if (memberRes.rowCount === 0) {
      throw { statusCode: 403, code: 'FORBIDDEN', message: 'Bạn không phải thành viên phòng' };
    }

    const role = memberRes.rows[0].role as 'PLAYER' | 'SPECTATOR';
    // Server DERIVES channel — client cannot forge or select channel
    const channel: ChatChannel = role === 'PLAYER' ? 'PLAYERS' : 'SPECTATORS';

    // 3. Check duplicate clientMessageId (idempotent retry per spec)
    const existing = await client.query(
      `SELECT cm.*, p.username, p.display_name
       FROM public.chat_messages cm
       JOIN public.profiles p ON p.id = cm.sender_id
       WHERE cm.match_id = $1 AND cm.sender_id = $2 AND cm.client_message_id = $3`,
      [matchId, userId, clientMessageId],
    );

    if (existing.rowCount! > 0) {
      const row = existing.rows[0];
      return {
        message: {
          id: row.id,
          matchId: row.match_id,
          channel: row.channel,
          senderId: row.sender_id,
          senderUsername: row.username,
          senderDisplayName: row.display_name,
          clientMessageId: row.client_message_id,
          content: row.content,
          createdAt: row.created_at,
        },
        isDuplicate: true,
      };
    }

    // 4. Fetch sender profile
    const profileRes = await client.query(
      'SELECT username, display_name FROM public.profiles WHERE id = $1',
      [userId],
    );
    const profile = profileRes.rows[0];

    // 5. Insert message
    const id = crypto.randomUUID();
    const insertRes = await client.query(
      `INSERT INTO public.chat_messages (
         id, room_id, match_id, channel, sender_id, client_message_id, content
       ) VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [id, roomId, matchId, channel, userId, clientMessageId, content],
    );

    const row = insertRes.rows[0];
    const dto: ChatMessageDTO = {
      id: row.id,
      matchId: row.match_id,
      channel: row.channel,
      senderId: row.sender_id,
      senderUsername: profile.username,
      senderDisplayName: profile.display_name,
      clientMessageId: row.client_message_id,
      content: row.content,
      createdAt: row.created_at,
    };

    // Emit to channel subscribers
    emitChatMessage(dto);

    return { message: dto, isDuplicate: false };
  } finally {
    client.release();
  }
}

export async function getChatHistory(
  userId: string,
  roomId: string,
  pool?: pg.Pool,
): Promise<{ channel: ChatChannel; messages: ChatMessageDTO[] }> {
  const p = pool ?? getPool();
  const client = await p.connect();

  try {
    // 1. Fetch room & current_match_id
    const roomRes = await client.query(
      'SELECT current_match_id FROM public.rooms WHERE id = $1',
      [roomId],
    );
    if (roomRes.rowCount === 0) {
      throw { statusCode: 404, code: 'NOT_FOUND', message: 'Phòng không tồn tại' };
    }
    const matchId = roomRes.rows[0].current_match_id;
    if (!matchId) {
      return { channel: 'PLAYERS', messages: [] };
    }

    // 2. Check membership & derive authorized channel
    const memberRes = await client.query(
      'SELECT role FROM public.room_members WHERE room_id = $1 AND user_id = $2',
      [roomId, userId],
    );
    if (memberRes.rowCount === 0) {
      throw { statusCode: 403, code: 'FORBIDDEN', message: 'Bạn không phải thành viên phòng' };
    }

    const role = memberRes.rows[0].role as 'PLAYER' | 'SPECTATOR';
    const channel: ChatChannel = role === 'PLAYER' ? 'PLAYERS' : 'SPECTATORS';

    // 3. Fetch up to 50 messages strictly matching the user's channel
    const msgsRes = await client.query(
      `SELECT cm.*, p.username, p.display_name
       FROM public.chat_messages cm
       JOIN public.profiles p ON p.id = cm.sender_id
       WHERE cm.match_id = $1 AND cm.channel = $2
       ORDER BY cm.created_at ASC
       LIMIT 50`,
      [matchId, channel],
    );

    const messages = msgsRes.rows.map((row) => ({
      id: row.id,
      matchId: row.match_id,
      channel: row.channel,
      senderId: row.sender_id,
      senderUsername: row.username,
      senderDisplayName: row.display_name,
      clientMessageId: row.client_message_id,
      content: row.content,
      createdAt: row.created_at,
    }));

    return { channel, messages };
  } finally {
    client.release();
  }
}
