import { describe, it, expect } from 'vitest';
import { getPool, closePool } from '../../apps/server/src/db/pool.js';
import { withTransaction } from '../../apps/server/src/db/transaction.js';
import { MockPgPool } from '../fixtures/integration.js';

describe('T006-TS-01: Pool lifecycle', () => {
  it('closePool on uninitialized pool does not throw', async () => {
    await expect(closePool()).resolves.toBeUndefined();
  });

  it('getPool throws naming DATABASE_URL when not configured', () => {
    const orig = process.env['DATABASE_URL'];
    delete process.env['DATABASE_URL'];
    try {
      expect(() => getPool()).toThrow('DATABASE_URL');
    } finally {
      if (orig !== undefined) process.env['DATABASE_URL'] = orig;
    }
  });

  it('getPool returns same instance with explicit connection string', () => {
    const p1 = getPool('postgresql://localhost/dummy1');
    const p2 = getPool('postgresql://localhost/dummy2');
    expect(p1).toBe(p2); // singleton
    // clean up
    closePool();
  });
});

describe('T006-TS-02: withTransaction behavior', () => {
  it('commits transaction on success', async () => {
    const mockPool = new MockPgPool();
    const result = await withTransaction(async (client) => {
      await client.query('SELECT 1');
      return 'done';
    }, mockPool as unknown as import('pg').Pool);

    expect(result).toBe('done');
    expect(mockPool.client.queries).toEqual(['BEGIN', 'SELECT 1', 'COMMIT']);
    expect(mockPool.client.released).toBe(true);
  });

  it('rolls back and rethrows on error', async () => {
    const mockPool = new MockPgPool();
    await expect(
      withTransaction(async (client) => {
        await client.query('INSERT INTO foo VALUES (1)');
        throw new Error('boom');
      }, mockPool as unknown as import('pg').Pool),
    ).rejects.toThrow('boom');

    expect(mockPool.client.queries).toEqual([
      'BEGIN',
      'INSERT INTO foo VALUES (1)',
      'ROLLBACK',
    ]);
    expect(mockPool.client.released).toBe(true);
  });

  it('releases client even if ROLLBACK fails', async () => {
    const mockPool = new MockPgPool();
    // Override query to fail on ROLLBACK
    const origQuery = mockPool.client.query.bind(mockPool.client);
    mockPool.client.query = async (sql: string, params?: unknown[]) => {
      if (sql === 'ROLLBACK') throw new Error('rollback failed');
      return origQuery(sql, params);
    };

    await expect(
      withTransaction(async () => {
        throw new Error('original error');
      }, mockPool as unknown as import('pg').Pool),
    ).rejects.toThrow();

    expect(mockPool.client.released).toBe(true);
  });
});
