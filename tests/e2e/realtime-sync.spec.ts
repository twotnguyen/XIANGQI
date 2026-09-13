/**
 * Two-player realtime sync over the Socket.IO channel (findings F-06, ISSUE-015).
 *
 * Uses two independent browser contexts, both authenticated against the local
 * stack, playing a real online match: a move made by player A must appear on
 * player B's board without a page reload, the clock must run, and a rejected
 * illegal move must leave both boards untouched.
 *
 * Preconditions are asserted, never skipped: the API, the auth service and the
 * socket connection must all be live or this spec fails.
 */
import { test, expect, type APIRequestContext, type Page } from '@playwright/test';
import crypto from 'node:crypto';
import path from 'node:path';

// Local-only environment: `.env.test` wins over `.env` (process.loadEnvFile never overrides).
for (const file of ['.env.test', '.env']) {
  try {
    process.loadEnvFile(path.join(process.cwd(), file));
  } catch {
    // Missing file: the loopback guard below then fails loudly.
  }
}

const API_URL = process.env['VITE_API_URL'] ?? 'http://localhost:3001';
const SUPABASE_URL = process.env['SUPABASE_URL'] ?? '';
const SUPABASE_PUBLISHABLE_KEY = process.env['SUPABASE_PUBLISHABLE_KEY'] ?? '';
const SUPABASE_SECRET_KEY = process.env['SUPABASE_SECRET_KEY'] ?? '';
const PASSWORD = 'LocalTest12345';

if (!/^https?:\/\/(127\.0\.0\.1|localhost|\[::1\])(:|\/|$)/.test(SUPABASE_URL)) {
  throw new Error(
    `[realtime e2e] REFUSING to run: SUPABASE_URL="${SUPABASE_URL}" is not the local loopback stack`,
  );
}

interface SeededUser {
  id: string;
  username: string;
  email: string;
  password: string;
}

interface ControllerLease {
  controllerId: string;
  controlEpoch: number;
}

async function assertStackUp(request: APIRequestContext): Promise<void> {
  const health = await request.get(`${API_URL}/health`);
  expect(health.status(), `API health at ${API_URL}/health`).toBe(200);
  expect((await health.json()).status).toBe('ok');

  const authHealth = await request.get(`${SUPABASE_URL}/auth/v1/health`);
  expect(authHealth.status(), `auth health at ${SUPABASE_URL}/auth/v1/health`).toBe(200);
}

/** Create a real Supabase Auth user (Admin API) whose profile trigger sets the username. */
async function seedUser(runId: string, key: string): Promise<SeededUser> {
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
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { signup_username: username, signup_display_name: `E2E ${key}` },
    }),
  });
  const body = (await res.json().catch(() => null)) as { id?: string } | null;
  if (!res.ok || !body?.id) {
    throw new Error(`[realtime e2e] Admin createUser failed (${res.status}) for ${email}`);
  }
  return { id: body.id, username, email, password: PASSWORD };
}

/** Best-effort cleanup; a leftover local fixture never breaks the next run (unique runId). */
async function deleteUser(user: SeededUser | null): Promise<void> {
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

async function signIn(email: string, password: string): Promise<string> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: SUPABASE_PUBLISHABLE_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const body = (await res.json().catch(() => null)) as { access_token?: string } | null;
  if (!res.ok || !body?.access_token) {
    throw new Error(`[realtime e2e] password sign-in failed (${res.status}) for ${email}`);
  }
  return body.access_token;
}

function authHeader(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

/** Log in through the real login screen so the browser holds a first-class Supabase session. */
async function loginViaUi(page: Page, username: string, password: string): Promise<void> {
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
async function readLease(page: Page): Promise<ControllerLease> {
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
  if (!lease) throw new Error('[realtime e2e] this tab holds no controller lease yet');
  return lease;
}

test.describe('Online match realtime sync', () => {
  test('T015-E2E-04: waiting room follows room:updated and the match start without reload', async ({
    browser,
    request,
  }) => {
    test.setTimeout(90_000);
    await assertStackUp(request);

    const runId = crypto.randomUUID().replace(/-/g, '').slice(0, 10);
    let userA: SeededUser | null = null;
    let userB: SeededUser | null = null;
    const contextA = await browser.newContext();

    try {
      userA = await seedUser(runId, 'a');
      userB = await seedUser(runId, 'b');
      const tokenA = await signIn(userA.email, userA.password);
      const tokenB = await signIn(userB.email, userB.password);

      const created = await request.post(`${API_URL}/api/v1/rooms`, {
        headers: authHeader(tokenA),
        data: { name: `E2E waiting ${runId}`, visibility: 'PUBLIC', timeControl: 300 },
      });
      expect(created.status(), 'POST /rooms').toBe(200);
      const roomId = (await created.json()).data.id as string;

      const pageA = await contextA.newPage();
      await loginViaUi(pageA, userA.username, userA.password);
      await pageA.goto(`/rooms/${roomId}`);
      await expect(pageA.getByTestId('seat-black')).toContainText('Chờ người chơi', {
        timeout: 10_000,
      });
      await pageA.evaluate(() => {
        (window as unknown as { __e2eLoadedOnce?: boolean }).__e2eLoadedOnce = true;
      });

      // Opponent joins over HTTP: the seat must appear from the push, not a re-fetch.
      const joined = await request.post(`${API_URL}/api/v1/rooms/join`, {
        headers: authHeader(tokenB),
        data: { roomId, role: 'PLAYER' },
      });
      expect(joined.status(), 'POST /rooms/join').toBe(200);
      await expect(pageA.getByTestId('seat-black')).toContainText(userB.id.slice(0, 8), {
        timeout: 5_000,
      });

      // Both ready → the room turns PLAYING and this screen follows the new match.
      await pageA.getByTestId('ready-toggle-btn').click();
      await expect(pageA.getByTestId('ready-toggle-btn')).toHaveText(/Hủy sẵn sàng/, {
        timeout: 5_000,
      });
      const readyB = await request.post(`${API_URL}/api/v1/rooms/${roomId}/ready`, {
        headers: authHeader(tokenB),
        data: { ready: true },
      });
      expect(readyB.status(), 'POST /rooms/:id/ready (B)').toBe(200);
      const matchId = (await readyB.json()).data.matchSnapshot?.id as string | undefined;
      expect(matchId).toBeTruthy();
      await pageA.waitForURL(new RegExp(`/matches/${matchId}$`), { timeout: 10_000 });
      expect(
        await pageA.evaluate(
          () => (window as unknown as { __e2eLoadedOnce?: boolean }).__e2eLoadedOnce,
        ),
      ).toBe(true);
    } finally {
      await contextA.close();
      await deleteUser(userA);
      await deleteUser(userB);
    }
  });

  test('T015-E2E-03: move reaches the other player without reload, clock runs, illegal move is rejected safely', async ({
    browser,
    request,
  }) => {
    test.setTimeout(120_000);
    await assertStackUp(request);

    const runId = crypto.randomUUID().replace(/-/g, '').slice(0, 10);
    let userA: SeededUser | null = null;
    let userB: SeededUser | null = null;
    const contextA = await browser.newContext();
    const contextB = await browser.newContext();

    try {
      userA = await seedUser(runId, 'a');
      userB = await seedUser(runId, 'b');
      const tokenA = await signIn(userA.email, userA.password);
      const tokenB = await signIn(userB.email, userB.password);

      // --- Room + match setup through the real API (the UI is asserted, not the setup).
      const created = await request.post(`${API_URL}/api/v1/rooms`, {
        headers: authHeader(tokenA),
        data: { name: `E2E realtime ${runId}`, visibility: 'PUBLIC', timeControl: 300 },
      });
      expect(created.status(), 'POST /rooms').toBe(200);
      const roomId = (await created.json()).data.id as string;

      const joined = await request.post(`${API_URL}/api/v1/rooms/join`, {
        headers: authHeader(tokenB),
        data: { roomId, role: 'PLAYER' },
      });
      expect(joined.status(), 'POST /rooms/join').toBe(200);

      const readyA = await request.post(`${API_URL}/api/v1/rooms/${roomId}/ready`, {
        headers: authHeader(tokenA),
        data: { ready: true },
      });
      expect(readyA.status(), 'POST /rooms/:id/ready (A)').toBe(200);

      const readyB = await request.post(`${API_URL}/api/v1/rooms/${roomId}/ready`, {
        headers: authHeader(tokenB),
        data: { ready: true },
      });
      expect(readyB.status(), 'POST /rooms/:id/ready (B)').toBe(200);
      const matchId = (await readyB.json()).data.matchSnapshot?.id as string | undefined;
      expect(matchId, 'both players ready must start exactly one match').toBeTruthy();

      const snapshot = await request.get(`${API_URL}/api/v1/matches/${matchId}`, {
        headers: authHeader(tokenA),
      });
      const snapshotBody = await snapshot.json();
      expect(snapshotBody.ok).toBe(true);
      const redUserId = snapshotBody.data.redUserId as string;
      // The room creator takes the RED seat, so A moves first.
      expect(redUserId).toBe(userA.id);

      // --- Two independent contexts, both on the match page.
      const pageA = await contextA.newPage();
      const pageB = await contextB.newPage();
      await loginViaUi(pageA, userA.username, userA.password);
      await loginViaUi(pageB, userB.username, userB.password);

      await pageA.goto(`/matches/${matchId}`);
      await pageB.goto(`/matches/${matchId}`);
      await expect(pageA.getByTestId('xiangqi-board')).toBeVisible();
      await expect(pageB.getByTestId('xiangqi-board')).toBeVisible();

      // Socket preconditions: both tabs must be connected (fails if the server has no socket).
      await expect(pageA.getByTestId('realtime-status')).toHaveAttribute('data-status', 'connected', {
        timeout: 20_000,
      });
      await expect(pageB.getByTestId('realtime-status')).toHaveAttribute('data-status', 'connected', {
        timeout: 20_000,
      });

      // Turn state before the move: A is RED and to move, B sees RED's turn.
      await expect(pageA.getByText('Lượt của bạn')).toBeVisible();
      await expect(pageB.getByText('Lượt của Đỏ')).toBeVisible();

      // B must never reload for the sync assertion to mean anything.
      await pageB.evaluate(() => {
        (window as unknown as { __e2eLoadedOnce?: boolean }).__e2eLoadedOnce = true;
      });

      // --- A plays RED pawn (0,3) → (0,4) through the board.
      await pageA.getByTestId('square-0-3').click();
      await expect(pageA.getByTestId('legal-target-0-4')).toBeVisible();
      await pageA.getByTestId('square-0-4').click();

      // A's own board commits the server snapshot.
      await expect(pageA.getByRole('img', { name: /Tốt đỏ, cột 1 hàng 5/ })).toBeVisible({
        timeout: 5_000,
      });

      // B's board follows within a few seconds, with no reload.
      await expect(pageB.getByRole('img', { name: /Tốt đỏ, cột 1 hàng 5/ })).toBeVisible({
        timeout: 5_000,
      });
      await expect(pageB.getByRole('img', { name: /Tốt đỏ, cột 1 hàng 4/ })).toHaveCount(0);
      expect(
        await pageB.evaluate(
          () => (window as unknown as { __e2eLoadedOnce?: boolean }).__e2eLoadedOnce,
        ),
      ).toBe(true);

      // Turn and clock follow the move on the observer's screen.
      await expect(pageB.getByText('Lượt của bạn')).toBeVisible({ timeout: 5_000 });
      const clockBefore = await pageB.getByTestId('clock-black').textContent();
      await pageB.waitForTimeout(2_600);
      const clockAfter = await pageB.getByTestId('clock-black').textContent();
      const toSeconds = (text: string | null): number => {
        const [minutes, seconds] = (text ?? '').split(':').map(Number);
        return minutes * 60 + seconds;
      };
      expect(toSeconds(clockAfter)).toBeLessThan(toSeconds(clockBefore));

      // --- Rejected illegal move: BLACK pawn (0,6) jumping two ranks.
      const lease = await readLease(pageB);
      const versionBefore = (await (
        await request.get(`${API_URL}/api/v1/matches/${matchId}`, { headers: authHeader(tokenB) })
      ).json()).data.version as number;

      const rejected = await request.post(`${API_URL}/api/v1/matches/${matchId}/commands/move`, {
        headers: {
          ...authHeader(tokenB),
          'X-Control-Id': lease.controllerId,
          'X-Control-Epoch': String(lease.controlEpoch),
        },
        data: {
          commandId: crypto.randomUUID(),
          expectedVersion: versionBefore,
          payload: { from: { x: 0, y: 6 }, to: { x: 0, y: 4 } },
        },
      });
      expect(rejected.status(), 'illegal move must be rejected').toBeGreaterThanOrEqual(400);
      expect(rejected.status()).toBeLessThan(500);
      const rejectedBody = await rejected.json();
      expect(rejectedBody.ok).toBe(false);
      expect(['INVALID_MOVE', 'VALIDATION_ERROR', 'NOT_YOUR_TURN']).toContain(rejectedBody.error.code);

      const versionAfter = (await (
        await request.get(`${API_URL}/api/v1/matches/${matchId}`, { headers: authHeader(tokenB) })
      ).json()).data.version as number;
      expect(versionAfter, 'rejected move must not change the match').toBe(versionBefore);

      // Neither board shows a phantom piece, and the UI still works afterwards.
      await expect(pageB.getByRole('img', { name: /Tốt đen, cột 1 hàng 7/ })).toBeVisible();
      await expect(pageB.getByRole('img', { name: /Tốt đen, cột 1 hàng 5/ })).toHaveCount(0);
      await expect(pageA.getByRole('img', { name: /Tốt đen, cột 1 hàng 7/ })).toBeVisible();

      await pageB.getByTestId('square-0-6').click();
      await expect(pageB.getByTestId('legal-target-0-5')).toBeVisible();
      await pageB.getByTestId('square-0-5').click();

      // The legal move after the rejection lands on the opponent's board.
      await expect(pageA.getByRole('img', { name: /Tốt đen, cột 1 hàng 6/ })).toBeVisible({
        timeout: 5_000,
      });

      // --- Chat send goes over `chat:send` with the room lease and reaches the opponent.
      const message = `Xin chào ${runId}`;
      await pageA.getByTestId('chat-input').fill(message);
      await pageA.getByTestId('chat-send-btn').click();
      await expect(pageB.getByTestId('chat-messages-container').getByText(message)).toBeVisible({
        timeout: 5_000,
      });
      await expect(pageA.getByTestId('chat-messages-container').getByText(message)).toBeVisible();
    } finally {
      await contextA.close();
      await contextB.close();
      await deleteUser(userA);
      await deleteUser(userB);
    }
  });
});
