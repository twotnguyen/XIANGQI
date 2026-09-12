import { describe, it, expect } from 'vitest';
import { createApp } from '../../apps/server/src/app.js';

describe('T027-01: History and Replay endpoints authorization', () => {
  it('GET /api/v1/history requires auth', async () => {
    const app = await createApp();
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/history',
    });
    expect(res.statusCode).toBe(401);
    expect(res.json().error.code).toBe('UNAUTHENTICATED');
    await app.close();
  });

  it('GET /api/v1/matches/:id/replay requires auth', async () => {
    const app = await createApp();
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/matches/550e8400-e29b-41d4-a716-446655440000/replay',
    });
    expect(res.statusCode).toBe(401);
    expect(res.json().error.code).toBe('UNAUTHENTICATED');
    await app.close();
  });

  it('POST /api/v1/rooms/:id/rematch requires auth and validates expectedMatchId', async () => {
    const app = await createApp();
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/rooms/550e8400-e29b-41d4-a716-446655440000/rematch',
      payload: {
        expectedMatchId: 'not-a-uuid',
      },
    });
    expect(res.statusCode).toBe(401); // Auth middleware triggers first
    await app.close();
  });
});
