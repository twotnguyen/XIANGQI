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
    // No default: production must configure APP_ORIGIN explicitly (spec 05).
    appOrigin: process.env['APP_ORIGIN'],
  };
}

/** Vite dev-server origins accepted only outside production (spec 05). */
export const LOCAL_DEV_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173'];

/**
 * CORS allowlist for the BFF.
 *
 * Production allows exactly APP_ORIGIN; a missing or malformed value aborts
 * startup with a message that names the variable and never prints a value.
 * Non-production additionally accepts the local Vite origins so the dev SPA
 * works without configuration.
 */
export function resolveAllowedOrigins(
  appOrigin: string | undefined,
  nodeEnv: string | undefined,
): string[] {
  const isProduction = nodeEnv === 'production';
  const configured = appOrigin?.trim() ? normalizeOrigin(appOrigin.trim()) : null;

  if (isProduction) {
    if (!configured) {
      throw new Error('Missing required environment variable: APP_ORIGIN');
    }
    return [configured];
  }

  return configured ? [...new Set([...LOCAL_DEV_ORIGINS, configured])] : [...LOCAL_DEV_ORIGINS];
}

function normalizeOrigin(value: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(
      'Invalid APP_ORIGIN: expected an absolute http(s) origin such as https://app.example.com',
    );
  }
  if (
    (url.protocol !== 'http:' && url.protocol !== 'https:') ||
    url.pathname !== '/' ||
    url.search !== '' ||
    url.hash !== ''
  ) {
    throw new Error(
      'Invalid APP_ORIGIN: expected scheme + host + optional port only (no path, query or fragment)',
    );
  }
  return url.origin;
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
