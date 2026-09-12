import { describe, it, expect } from 'vitest';
import { runLoadTest } from './socket-load.js';

describe('T030: Concurrency and Load Performance Acceptance', () => {
  it('meets p95 latency under 100ms with 70 simulated clients and 2 AI games', async () => {
    const metrics = await runLoadTest();
    expect(metrics.passed).toBe(true);
    expect(metrics.p95Ms).toBeLessThan(100);
    expect(metrics.totalRequests).toBeGreaterThanOrEqual(70);
  });
});
