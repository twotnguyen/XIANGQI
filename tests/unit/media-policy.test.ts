import { describe, it, expect } from 'vitest';
import { createApp } from '../../apps/server/src/app.js';
import { UpdateMediaPolicyBodySchema } from '@xiangqi/contracts';
import {
  getRoomGeneration,
  rotateRoomGeneration,
} from '../../apps/server/src/modules/media/reconciler.js';

describe('T025-01: Media Schema Validation', () => {
  it('accepts valid track and scope', () => {
    const res = UpdateMediaPolicyBodySchema.safeParse({
      track: 'camera',
      scope: 'OPPONENT_ONLY',
    });
    expect(res.success).toBe(true);
  });

  it('rejects invalid track name', () => {
    const res = UpdateMediaPolicyBodySchema.safeParse({
      track: 'screen',
      scope: 'PUBLIC',
    });
    expect(res.success).toBe(false);
  });

  it('rejects invalid scope name', () => {
    const res = UpdateMediaPolicyBodySchema.safeParse({
      track: 'microphone',
      scope: 'ALL',
    });
    expect(res.success).toBe(false);
  });
});

describe('T025-02: Media Endpoints Authorization', () => {
  it('GET /api/v1/rooms/:id/media/session requires auth', async () => {
    const app = await createApp();
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/rooms/550e8400-e29b-41d4-a716-446655440000/media/session',
    });
    expect(res.statusCode).toBe(401);
    expect(res.json().error.code).toBe('UNAUTHENTICATED');
    await app.close();
  });

  it('POST /api/v1/rooms/:id/media/policy requires auth', async () => {
    const app = await createApp();
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/rooms/550e8400-e29b-41d4-a716-446655440000/media/policy',
      payload: {
        track: 'camera',
        scope: 'PUBLIC',
      },
    });
    expect(res.statusCode).toBe(401);
    expect(res.json().error.code).toBe('UNAUTHENTICATED');
    await app.close();
  });
});

describe('T025-03: Generation Rotation on SFU', () => {
  it('increments room generation monotonically', async () => {
    const roomId = 'test-rotate-room-1';
    const gen1 = getRoomGeneration(roomId);
    expect(gen1).toBe(1);

    const gen2 = await rotateRoomGeneration(roomId);
    expect(gen2).toBe(2);

    const gen3 = await rotateRoomGeneration(roomId);
    expect(gen3).toBe(3);
  });
});
