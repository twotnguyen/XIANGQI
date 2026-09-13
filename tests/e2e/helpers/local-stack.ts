/**
 * Shared local-stack helpers for the browser specs.
 *
 * Every spec that drives the real app needs the same three things: the loopback
 * environment, real Supabase Auth users, and a precondition that fails loudly
 * when the stack is down. Keeping one copy here means a spec can never quietly
 * pass against a missing backend.
 */
import { expect } from '@playwright/test';
import type { APIRequestContext, Page } from '@playwright/test';
import path from 'node:path';

// Local-only environment: `.env.test` wins over `.env` (process.loadEnvFile never overrides).
for (const file of ['.env.test', '.env']) {
  try {
    process.loadEnvFile(path.join(process.cwd(), file));
  } catch {
    // Missing file: the loopback guard below then fails loudly.
  }
}

export const API_URL = process.env['VITE_API_URL'] ?? 'http://localhost:3001';
export const SUPABASE_URL = process.env['SUPABASE_URL'] ?? '';
export const SUPABASE_PUBLISHABLE_KEY = process.env['SUPABASE_PUBLISHABLE_KEY'] ?? '';
export const SUPABASE_SECRET_KEY = process.env['SUPABASE_SECRET_KEY'] ?? '';
export const TEST_PASSWORD = 'LocalTest12345';

if (!/^https?:\/\/(127\.0\.0\.1|localhost|\[::1\])(:|\/|$)/.test(SUPABASE_URL)) {
  throw new Error(
    `[e2e] REFUSING to run: SUPABASE_URL="${SUPABASE_URL}" is not the local loopback stack`,
  );
}

export interface SeededUser {
  id: string;
  username: string;
  email: string;
  password: string;
}

/** The API and the auth service must answer, or the spec fails instead of skipping. */
export async function assertStackUp(request: APIRequestContext): Promise<void> {
  const health = await request.get(`${API_URL}/health`);
  expect(health.status(), `API health at ${API_URL}/health`).toBe(200);
  expect((await health.json()).status).toBe('ok');

  const authHealth = await request.get(`${SUPABASE_URL}/auth/v1/health`);
  expect(authHealth.status(), `auth health at ${SUPABASE_URL}/auth/v1/health`).toBe(200);
}

/** Create a real Supabase Auth user (Admin API) whose profile trigger sets the username. */
export async function seedUser(runId: string, key: string): Promise<SeededUser> {
  const username = `e2e${runId}${key}`;
  const email = `${username}@example.test`;
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_SECRET_KEY,
      Authorization: `Bearer ${SUPABASE_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password: TEST_PASSWORD,
      email_confirm: true,
      user_metadata: { signup_username: username, signup_display_name: `E2E ${key}` },
    }),
  });
  const body = (await res.json().catch(() => null)) as { id?: string } | null;
  if (!res.ok || !body?.id) {
    throw new Error(`[e2e] Admin createUser failed (${res.status}) for ${email}`);
  }
  return { id: body.id, username, email, password: TEST_PASSWORD };
}

/** Best-effort cleanup; a leftover local fixture never breaks the next run (unique runId). */
export async function deleteUser(user: SeededUser | null): Promise<void> {
  if (!user) return;
  try {
    await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${user.id}`, {
      method: 'DELETE',
      headers: { apikey: SUPABASE_SECRET_KEY, Authorization: `Bearer ${SUPABASE_SECRET_KEY}` },
    });
  } catch {
    // Ignored on purpose: the local DB keeps, at worst, one more fixture row.
  }
}

/** Real Supabase password grant — the same flow the login screen proxies. */
export async function signIn(email: string, password: string): Promise<string> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: SUPABASE_PUBLISHABLE_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const body = (await res.json().catch(() => null)) as { access_token?: string } | null;
  if (!res.ok || !body?.access_token) {
    throw new Error(`[e2e] password sign-in failed (${res.status}) for ${email}`);
  }
  return body.access_token;
}

export function authHeader(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

/** Log in through the real login screen so the browser holds a first-class Supabase session. */
export async function loginViaUi(page: Page, username: string, password: string): Promise<void> {
  await page.goto('/login');
  await page.getByLabel('Tên đăng nhập').fill(username);
  await page.getByLabel('Mật khẩu').fill(password);
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  await page.waitForURL(/\/lobby/, { timeout: 15_000 });

  // Guard: the app under test must be bound to the local Supabase project.
  const storageKeys = await page.evaluate(() => Object.keys(window.localStorage));
  expect(
    storageKeys.some((key) => key.startsWith('sb-127') || key.startsWith('sb-localhost')),
    `web app must point at the local Supabase stack (session keys: ${storageKeys.join(', ')})`,
  ).toBe(true);
}

export interface ControllerLease {
  controllerId: string;
  controlEpoch: number;
}

/**
 * Read the private controller lease this tab holds.
 *
 * The lease lives in the client's module state (never in the DOM, by design), so
 * the test reads it from the dev-server module graph. A static import is
 * impossible here: the module only exists in the browser bundle served by
 * `vite dev` (playwright.config.ts webServer), and its URL is runtime-selected —
 * Vite serves changed modules as `/src/lib/realtime.ts?t=<hmr stamp>`, and a
 * plain path would create a second, unconnected instance.
 */
export async function readLease(page: Page): Promise<ControllerLease> {
  const lease = await page.evaluate(async () => {
    interface ClientModule {
      realtime?: {
        getController(scope: string): { controllerId: string; controlEpoch: number } | null;
      };
    }
    const candidates = performance
      .getEntriesByType('resource')
      .map((entry) => entry.name)
      .filter((name) => name.includes('/src/lib/realtime.ts'));
    candidates.push('/src/lib/realtime.ts');

    for (const url of candidates) {
      let mod: ClientModule;
      try {
        mod = (await import(url)) as ClientModule;
      } catch {
        continue;
      }
      const grant = mod.realtime?.getController('match') ?? mod.realtime?.getController() ?? null;
      if (grant) return { controllerId: grant.controllerId, controlEpoch: grant.controlEpoch };
    }
    return null;
  });
  if (!lease) throw new Error('[e2e] this tab holds no controller lease yet');
  return lease;
}
