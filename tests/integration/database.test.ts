/**
 * Database integration test against live PostgreSQL.
 * Skipped if DATABASE_URL is not set or unreachable.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import pg from 'pg';
import { getPool, closePool } from '../../apps/server/src/db/pool.js';
import { withTransaction } from '../../apps/server/src/db/transaction.js';

const DB_URL = process.env['DATABASE_URL'];

describe.skipIf(!DB_URL)('Database live integration tests', () => {
  let pool: pg.Pool;

  beforeAll(async () => {
    pool = getPool(DB_URL);
  });

  afterAll(async () => {
    await closePool();
  });

  it('can connect and query 1', async () => {
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT 1 as val');
      expect(res.rows[0].val).toBe(1);
    } finally {
      client.release();
    }
  });

  it('withTransaction rolls back on error in live DB', async () => {
    // Create a temp table, insert, then throw
    const client = await pool.connect();
    try {
      await client.query('CREATE TEMP TABLE test_rollback (id int)');
    } finally {
      client.release();
    }

    await expect(
      withTransaction(async (tx) => {
        await tx.query('INSERT INTO test_rollback VALUES (42)');
        throw new Error('test rollback');
      }, pool),
    ).rejects.toThrow('test rollback');

    const checkClient = await pool.connect();
    try {
      const res = await checkClient.query('SELECT COUNT(*) FROM test_rollback');
      expect(Number(res.rows[0].count)).toBe(0);
    } finally {
      checkClient.release();
    }
  });
});
