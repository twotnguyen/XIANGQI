/**
 * Integration test fixtures and helpers.
 * Provides mock/isolated helpers for database tests.
 */
import type pg from 'pg';

export interface TestApp {
  close: () => Promise<void>;
}

/** Mock pg client for unit testing transaction behavior without live DB */
export class MockPgClient {
  public queries: string[] = [];
  public released = false;

  async query(sql: string): Promise<{ rows: unknown[]; rowCount: number }> {
    this.queries.push(sql);
    return { rows: [], rowCount: 0 };
  }

  release(): void {
    this.released = true;
  }
}

/** Mock pg Pool that returns MockPgClient */
export class MockPgPool {
  public client = new MockPgClient();
  public ended = false;

  async connect(): Promise<pg.PoolClient> {
    return this.client as unknown as pg.PoolClient;
  }

  async end(): Promise<void> {
    this.ended = true;
  }
}
