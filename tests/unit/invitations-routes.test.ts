import { describe, it, expect } from 'vitest';
import { createApp } from '../../apps/server/src/app.js';
import {
  generateCode,
  generateToken,
} from '../../apps/server/src/modules/invitations/service.js';
import { JoinRoomBodySchema } from '@xiangqi/contracts';

describe('T011-01: Invitations helpers and generators', () => {
  it('generateCode produces 8-char string from unambiguous alphabet', () => {
    const code = generateCode();
    expect(code).toHaveLength(8);
    // Unambiguous alphabet: no 0, O, 1, I
    expect(code).toMatch(/^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{8}$/);
  });

  it('generateToken produces 64-char hex token and sha256 hash', () => {
    const { token, tokenHash } = generateToken();
    expect(token).toHaveLength(64);
    expect(tokenHash).toHaveLength(64);
    expect(token).not.toBe(tokenHash);
  });
});

describe('T011-02: JoinRoomBodySchema validation', () => {
  it('rejects payload with 0 locators', () => {
    const res = JoinRoomBodySchema.safeParse({ role: 'SPECTATOR' });
    expect(res.success).toBe(false);
  });

  it('rejects payload with 2 locators (both roomId and code)', () => {
    const res = JoinRoomBodySchema.safeParse({
      roomId: '550e8400-e29b-41d4-a716-446655440000',
      code: 'ABCD2345',
      role: 'SPECTATOR',
    });
    expect(res.success).toBe(false);
  });

  it('accepts payload with exactly 1 locator (roomId)', () => {
    const res = JoinRoomBodySchema.safeParse({
      roomId: '550e8400-e29b-41d4-a716-446655440000',
      role: 'PLAYER',
    });
    expect(res.success).toBe(true);
  });

  it('accepts payload with exactly 1 locator (code)', () => {
    const res = JoinRoomBodySchema.safeParse({
      code: 'ABCD2345',
      role: 'SPECTATOR',
    });
    expect(res.success).toBe(true);
  });

  it('accepts payload with exactly 1 locator (token)', () => {
    const res = JoinRoomBodySchema.safeParse({
      token: 'sampletokenhex12345',
      role: 'SPECTATOR',
    });
    expect(res.success).toBe(true);
  });
});

describe('T011-03: Invitations endpoints auth check', () => {
  it('POST /api/v1/rooms/:id/invitations requires auth', async () => {
    const app = await createApp();
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/rooms/550e8400-e29b-41d4-a716-446655440000/invitations',
      payload: {},
    });
    expect(res.statusCode).toBe(401);
    expect(res.json().error.code).toBe('UNAUTHENTICATED');
    await app.close();
  });

  it('GET /api/v1/invitations requires auth', async () => {
    const app = await createApp();
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/invitations',
    });
    expect(res.statusCode).toBe(401);
    expect(res.json().error.code).toBe('UNAUTHENTICATED');
    await app.close();
  });

  it('POST /api/v1/rooms/join requires auth', async () => {
    const app = await createApp();
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/rooms/join',
      payload: { role: 'SPECTATOR', code: 'ABCD2345' },
    });
    expect(res.statusCode).toBe(401);
    expect(res.json().error.code).toBe('UNAUTHENTICATED');
    await app.close();
  });
});
