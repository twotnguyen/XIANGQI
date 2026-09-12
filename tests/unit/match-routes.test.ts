import { describe, it, expect } from 'vitest';
import { createApp } from '../../apps/server/src/app.js';
import { hashPayload } from '../../apps/server/src/modules/matches/service.js';
import { matchBroadcaster } from '../../apps/server/src/realtime/broadcast.js';
import type { MatchSnapshot } from '@xiangqi/contracts';

describe('T012-01: Match helpers and validation', () => {
  it('hashPayload produces consistent sha256 hex string', () => {
    const payload = { from: { x: 0, y: 3 }, to: { x: 0, y: 4 } };
    const h1 = hashPayload(payload);
    const h2 = hashPayload(payload);
    expect(h1).toBe(h2);
    expect(h1).toHaveLength(64);

    // Different payload produces different hash
    const h3 = hashPayload({ from: { x: 0, y: 3 }, to: { x: 0, y: 5 } });
    expect(h1).not.toBe(h3);
  });

  it('matchBroadcaster delivers snapshots to subscribers and cleans up on unsubscribe', () => {
    let received: MatchSnapshot | null = null;
    const matchId = '550e8400-e29b-41d4-a716-446655440000';

    const unsubscribe = matchBroadcaster.subscribe(matchId, (snap) => {
      received = snap;
    });

    const mockSnapshot = {
      id: matchId,
      version: 1,
    } as unknown as MatchSnapshot;

    matchBroadcaster.emit(matchId, mockSnapshot);
    expect(received).toBe(mockSnapshot);

    // After unsubscribe, no longer receives
    received = null;
    unsubscribe();
    matchBroadcaster.emit(matchId, mockSnapshot);
    expect(received).toBeNull();
  });
});

describe('T012-02: Matches endpoints authentication and validation', () => {
  it('GET /api/v1/matches/:id requires auth', async () => {
    const app = await createApp();
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/matches/550e8400-e29b-41d4-a716-446655440000',
    });
    expect(res.statusCode).toBe(401);
    expect(res.json().error.code).toBe('UNAUTHENTICATED');
    await app.close();
  });

  it('POST /api/v1/matches/:id/commands/move requires auth', async () => {
    const app = await createApp();
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/matches/550e8400-e29b-41d4-a716-446655440000/commands/move',
      payload: {
        commandId: '550e8400-e29b-41d4-a716-446655440001',
        expectedVersion: 0,
        payload: { from: { x: 0, y: 3 }, to: { x: 0, y: 4 } },
      },
    });
    expect(res.statusCode).toBe(401);
    expect(res.json().error.code).toBe('UNAUTHENTICATED');
    await app.close();
  });

  it('POST /api/v1/matches/:id/commands/resign requires auth', async () => {
    const app = await createApp();
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/matches/550e8400-e29b-41d4-a716-446655440000/commands/resign',
      payload: {
        commandId: '550e8400-e29b-41d4-a716-446655440001',
        expectedVersion: 0,
        payload: {},
      },
    });
    expect(res.statusCode).toBe(401);
    expect(res.json().error.code).toBe('UNAUTHENTICATED');
    await app.close();
  });
});
