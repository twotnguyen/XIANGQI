/**
 * Database connection pool using `pg`.
 * Isolated connection management for Fastify game server.
 */
import pg from 'pg';
import { loadConfig, requireDatabaseUrl } from '../config.js';

const { Pool } = pg;

// Parse PostgreSQL int8 (bigint) columns as JavaScript numbers
pg.types.setTypeParser(20, (val) => parseInt(val, 10));

let poolInstance: pg.Pool | null = null;

export function getPool(connectionString?: string): pg.Pool {
  if (!poolInstance) {
    const connStr = connectionString ?? requireDatabaseUrl(loadConfig());
    poolInstance = new Pool({
      connectionString: connStr,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }
  return poolInstance;
}

export async function closePool(): Promise<void> {
  if (poolInstance) {
    await poolInstance.end();
    poolInstance = null;
  }
}
