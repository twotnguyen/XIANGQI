import { describe, it, expect } from 'vitest';
import { createApp } from '../../apps/server/src/app.js';

describe('T010-01: Rooms endpoints validation', () => {
  it('GET /api/v1/rooms requires authentication', async () => {
    const app = await createApp();
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/rooms',
    });
    expect(res.statusCode).toBe(401);
    expect(res.json().error.code).toBe('UNAUTHENTICATED');
    await app.close();
  });

  it('POST /api/v1/rooms requires authentication', async () => {
    const app = await createApp();
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/rooms',
      payload: { name: 'Test Room' },
    });
    expect(res.statusCode).toBe(401);
    expect(res.json().error.code).toBe('UNAUTHENTICATED');
    await app.close();
  });

  it('POST /api/v1/control/takeover requires authentication', async () => {
    const app = await createApp();
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/control/takeover',
      payload: { tabId: '550e8400-e29b-41d4-a716-446655440000' },
    });
    expect(res.statusCode).toBe(401);
    expect(res.json().error.code).toBe('UNAUTHENTICATED');
    await app.close();
  });
});
