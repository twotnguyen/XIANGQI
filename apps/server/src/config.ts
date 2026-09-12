/**
 * Environment configuration with validation.
 * DATABASE_URL required when DB module is loaded (ISSUE-006+).
 * Config validation must name the missing variable without printing secrets.
 */
export interface ServerConfig {
  port: number;
  databaseUrl?: string;
}

export function loadConfig(): ServerConfig {
  return {
    port: Number(process.env['PORT'] ?? 3001),
    databaseUrl: process.env['DATABASE_URL'],
  };
}

/**
 * Validate that required DB config is present.
 * Called when DB pool is initialized, not at app startup.
 * Throws with variable name, never prints the value.
 */
export function requireDatabaseUrl(config: ServerConfig): string {
  if (!config.databaseUrl) {
    throw new Error('Missing required environment variable: DATABASE_URL');
  }
  return config.databaseUrl;
}
