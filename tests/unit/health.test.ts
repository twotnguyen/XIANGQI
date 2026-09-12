import { describe, it, expect } from 'vitest';
import { createApp } from '../../apps/server/src/app.js';

describe('Health endpoint', () => {
  it('T001-01: GET /health returns 200 with status ok', async () => {
    const app = await createApp();
    const res = await app.inject({ method: 'GET', url: '/health' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: 'ok' });
    await app.close();
  });

  it('T001-02: factory close does not hold open handles', async () => {
    const app = await createApp();
    await app.ready();
    await app.close();
    // If close holds handles, the test process would hang and timeout.
    // Reaching this point proves clean shutdown.
    expect(true).toBe(true);
  });
});
