/**
 * Transaction helper with automatic rollback on error.
 * Uses client checkout from Pool, runs callback, commits or rolls back.
 */
import type pg from 'pg';
import { getPool } from './pool.js';

export async function withTransaction<T>(
  fn: (client: pg.PoolClient) => Promise<T>,
  pool?: pg.Pool,
): Promise<T> {
  const p = pool ?? getPool();
  const client = await p.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
