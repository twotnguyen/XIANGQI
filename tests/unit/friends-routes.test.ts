import { describe, it, expect } from 'vitest';
import { createApp } from '../../apps/server/src/app.js';

describe('T009-02: Friends endpoints validation', () => {
  it('GET /api/v1/users requires authentication', async () => {
    const app = await createApp();
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/users?prefix=test',
    });
    expect(res.statusCode).toBe(401);
    expect(res.json().error.code).toBe('UNAUTHENTICATED');
    await app.close();
  });

  it('GET /api/v1/friends requires authentication', async () => {
    const app = await createApp();
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/friends',
    });
    expect(res.statusCode).toBe(401);
    expect(res.json().error.code).toBe('UNAUTHENTICATED');
    await app.close();
  });

  it('POST /api/v1/friends/requests requires authentication', async () => {
    const app = await createApp();
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/friends/requests',
      payload: { recipientId: '550e8400-e29b-41d4-a716-446655440000' },
    });
    expect(res.statusCode).toBe(401);
    expect(res.json().error.code).toBe('UNAUTHENTICATED');
    await app.close();
  });

  it('POST /api/v1/friends/requests/:id/respond requires authentication', async () => {
    const app = await createApp();
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/friends/requests/550e8400-e29b-41d4-a716-446655440000/respond',
      payload: { accept: true },
    });
    expect(res.statusCode).toBe(401);
    expect(res.json().error.code).toBe('UNAUTHENTICATED');
    await app.close();
  });

  it('DELETE /api/v1/friends/:userId requires authentication', async () => {
    const app = await createApp();
    const res = await app.inject({
      method: 'DELETE',
      url: '/api/v1/friends/550e8400-e29b-41d4-a716-446655440000',
    });
    expect(res.statusCode).toBe(401);
    expect(res.json().error.code).toBe('UNAUTHENTICATED');
    await app.close();
  });
});
