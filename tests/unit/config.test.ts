import { describe, it, expect } from 'vitest';
import { loadConfig, requireDatabaseUrl } from '../../apps/server/src/config.js';

describe('Config validation', () => {
  it('requireDatabaseUrl throws naming the variable when DATABASE_URL missing', () => {
    const config = loadConfig();
    // Ensure DATABASE_URL is not set for this test
    const original = process.env['DATABASE_URL'];
    delete process.env['DATABASE_URL'];
    const cfg = { ...config, databaseUrl: undefined };
    try {
      expect(() => requireDatabaseUrl(cfg)).toThrow('DATABASE_URL');
    } finally {
      if (original !== undefined) {
        process.env['DATABASE_URL'] = original;
      }
    }
  });

  it('error message does not contain the actual secret value', () => {
    const cfg = { port: 3001, databaseUrl: undefined };
    let errorMsg = '';
    try {
      requireDatabaseUrl(cfg);
    } catch (e) {
      errorMsg = (e as Error).message;
    }
    // Should mention variable name but not any actual value
    expect(errorMsg).toContain('DATABASE_URL');
    expect(errorMsg).not.toContain('postgresql://');
  });
});
