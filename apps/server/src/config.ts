/**
 * Environment configuration with validation.
 * Config validation must name the missing variable without printing secrets.
 */
export interface ServerConfig {
  port: number;
  databaseUrl?: string;
  supabaseUrl?: string;
  supabaseSecretKey?: string;
  supabasePublishableKey?: string;
  appOrigin?: string;
}

export function loadConfig(): ServerConfig {
  return {
    port: Number(process.env['PORT'] ?? 3001),
    databaseUrl: process.env['DATABASE_URL'],
    supabaseUrl: process.env['SUPABASE_URL'],
    supabaseSecretKey: process.env['SUPABASE_SECRET_KEY'],
    supabasePublishableKey: process.env['SUPABASE_PUBLISHABLE_KEY'],
    appOrigin: process.env['APP_ORIGIN'] ?? 'http://localhost:5173',
  };
}

export function requireDatabaseUrl(config: ServerConfig): string {
  if (!config.databaseUrl) {
    throw new Error('Missing required environment variable: DATABASE_URL');
  }
  return config.databaseUrl;
}

export function requireSupabaseConfig(config: ServerConfig): {
  url: string;
  secretKey: string;
} {
  if (!config.supabaseUrl) {
    throw new Error('Missing required environment variable: SUPABASE_URL');
  }
  if (!config.supabaseSecretKey) {
    throw new Error('Missing required environment variable: SUPABASE_SECRET_KEY');
  }
  return {
    url: config.supabaseUrl,
    secretKey: config.supabaseSecretKey,
  };
}
