import { describe, it, expect } from 'vitest';
import { createApp } from '../../apps/server/src/app.js';
import { SendMessageBodySchema } from '@xiangqi/contracts';
import { subscribeChat, emitChatMessage } from '../../apps/server/src/modules/chat/service.js';

describe('T017-01: Chat schema validation', () => {
  it('rejects empty message content', () => {
    const res = SendMessageBodySchema.safeParse({
      clientMessageId: '550e8400-e29b-41d4-a716-446655440000',
      content: '',
    });
    expect(res.success).toBe(false);
  });

  it('rejects message exceeding 1000 characters', () => {
    const res = SendMessageBodySchema.safeParse({
      clientMessageId: '550e8400-e29b-41d4-a716-446655440000',
      content: 'a'.repeat(1001),
    });
    expect(res.success).toBe(false);
  });

  it('accepts valid message with newlines preserved', () => {
    const res = SendMessageBodySchema.safeParse({
      clientMessageId: '550e8400-e29b-41d4-a716-446655440000',
      content: 'Dòng 1\nDòng 2',
    });
    expect(res.success).toBe(true);
  });
});

describe('T017-02: Chat endpoints authentication', () => {
  it('GET /api/v1/rooms/:id/chat requires auth', async () => {
    const app = await createApp();
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/rooms/550e8400-e29b-41d4-a716-446655440000/chat',
    });
    expect(res.statusCode).toBe(401);
    expect(res.json().error.code).toBe('UNAUTHENTICATED');
    await app.close();
  });

  it('POST /api/v1/rooms/:id/chat requires auth', async () => {
    const app = await createApp();
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/rooms/550e8400-e29b-41d4-a716-446655440000/chat',
      payload: {
        clientMessageId: '550e8400-e29b-41d4-a716-446655440000',
        content: 'Xin chào',
      },
    });
    expect(res.statusCode).toBe(401);
    expect(res.json().error.code).toBe('UNAUTHENTICATED');
    await app.close();
  });
});

describe('T017-03: Chat broadcaster isolation by channel', () => {
  it('delivers message only to correct channel subscriber', () => {
    const matchId = '550e8400-e29b-41d4-a716-446655440000';
    let playerReceived = 0;
    let spectatorReceived = 0;

    const unsubPlayer = subscribeChat(`${matchId}:PLAYERS`, () => {
      playerReceived++;
    });
    const unsubSpectator = subscribeChat(`${matchId}:SPECTATORS`, () => {
      spectatorReceived++;
    });

    // Emit message to PLAYERS channel
    emitChatMessage({
      id: '550e8400-e29b-41d4-a716-446655440001',
      matchId,
      channel: 'PLAYERS',
      senderId: '550e8400-e29b-41d4-a716-446655440002',
      senderUsername: 'alice',
      senderDisplayName: null,
      clientMessageId: '550e8400-e29b-41d4-a716-446655440003',
      content: 'tin rieng cho player',
      createdAt: new Date().toISOString(),
    });

    expect(playerReceived).toBe(1);
    // Spectator MUST NOT receive player message per spec
    expect(spectatorReceived).toBe(0);

    unsubPlayer();
    unsubSpectator();
  });
});
