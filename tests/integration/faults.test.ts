import { describe, it, expect } from 'vitest';
import { createApp } from '../../apps/server/src/app.js';
import { hashPayload } from '../../apps/server/src/modules/matches/service.js';

describe('T030: Fault Injection and Recovery Acceptance', () => {
  it('T030-01: Idempotent Command Hash Verification protects against payload mutation', () => {
    const payloadA = { from: { x: 0, y: 0 }, to: { x: 0, y: 1 } };
    const payloadB = { from: { x: 0, y: 0 }, to: { x: 0, y: 2 } };

    const hashA1 = hashPayload(payloadA);
    const hashA2 = hashPayload(payloadA);
    const hashB = hashPayload(payloadB);

    // Same payload produces exact same hash
    expect(hashA1).toBe(hashA2);
    // Altered payload produces different hash (prevents command ID reuse attack)
    expect(hashA1).not.toBe(hashB);
  });

  it('T030-02: Unauthenticated fault injection is rejected with 401', async () => {
    const app = await createApp();
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/matches/550e8400-e29b-41d4-a716-446655440000/commands/move',
      payload: {
        commandId: '550e8400-e29b-41d4-a716-446655440001',
        expectedVersion: 0,
        payload: { from: { x: 0, y: 0 }, to: { x: 0, y: 1 } },
      },
    });

    expect(res.statusCode).toBe(401);
    await app.close();
  });
});
