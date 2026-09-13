import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import crypto from 'node:crypto';
import {
  assertStackUp,
  authHeader,
  deleteUser,
  loginViaUi,
  readLease,
  seedUser,
  signIn,
  API_URL,
  type SeededUser,
} from './helpers/local-stack.js';

/**
 * Wait until this tab may mutate (control lease + live socket), and on failure
 * report the tab's real state instead of a bare attribute timeout.
 */
async function expectBoardInteractive(page: Page, timeout = 20_000): Promise<void> {
  try {
    await expect(page.getByTestId('xiangqi-board')).toHaveAttribute('data-interactive', 'true', {
      timeout,
    });
  } catch (error) {
    const state = await page.evaluate(async () => {
      const url = '/src/lib/realtime.ts';
      const mod = (await import(/* @vite-ignore */ url)) as {
        realtime?: { getStatus(): string; getController(scope?: string): unknown };
      };
      const alert = document.querySelector('[data-testid="match-error"]');
      return {
        status: mod.realtime?.getStatus() ?? 'unknown',
        matchLease: Boolean(mod.realtime?.getController('match')),
        roomLease: Boolean(mod.realtime?.getController()),
        alert: alert?.textContent ?? null,
        bodyText: document.body.innerText.replace(/\s+/g, ' ').slice(0, 200),
      };
    });
    throw new Error(
      `board never became interactive: ${JSON.stringify(state)} (${error instanceof Error ? error.message.split('\n')[0] : String(error)})`,
      { cause: error },
    );
  }
}

/**
 * Wait for a piece to appear, but fail with the on-screen reason when the client
 * rejected the move instead of timing out silently (CI-only races are otherwise
 * impossible to diagnose from the report).
 */
async function expectPieceMoved(page: Page, name: RegExp, timeout = 30_000): Promise<void> {
  const piece = page.getByRole('img', { name });
  // Only the match-level error counts: the media panel has its own alert.
  const alert = page.getByTestId('match-error');
  try {
    await Promise.race([
      piece.waitFor({ state: 'visible', timeout }),
      alert.waitFor({ state: 'visible', timeout }).then(async () => {
        throw new Error(`client rejected the move: ${(await alert.textContent()) ?? ''}`);
      }),
    ]);
  } catch (error) {
    const state = await page.evaluate(async () => {
      const url = '/src/lib/realtime.ts';
      const mod = (await import(/* @vite-ignore */ url)) as {
        realtime?: { getStatus(): string };
      };
      return {
        status: mod.realtime?.getStatus() ?? 'unknown',
        alert: document.querySelector('[data-testid="match-error"]')?.textContent ?? null,
      };
    });
    throw new Error(
      `piece ${name} never appeared: ${JSON.stringify(state)} (${error instanceof Error ? error.message.split('\n')[0] : String(error)})`,
      { cause: error },
    );
  }
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
      await expect(pageA.getByTestId('realtime-status')).toHaveAttribute('data-status', 'connected', {
        timeout: 20_000,
      });

      // Opponent joins over HTTP: the seat must appear from the push, not a re-fetch.
      const joined = await request.post(`${API_URL}/api/v1/rooms/join`, {
        headers: authHeader(tokenB),
        data: { roomId, role: 'PLAYER' },
      });
      expect(joined.status(), 'POST /rooms/join').toBe(200);
      await expect(pageA.getByTestId('seat-black')).toContainText(userB.id.slice(0, 8), {
        timeout: 15_000,
      });

      // Both ready → the room turns PLAYING and this screen follows the new match.
      await pageA.getByTestId('ready-toggle-btn').click();
      await expect(pageA.getByTestId('ready-toggle-btn')).toHaveText(/Hủy sẵn sàng/, {
        timeout: 15_000,
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
      // The board only accepts input once this tab holds the control lease on a live
      // socket (spec 03/04), so wait for that instead of racing the subscribe ack.
      await expectBoardInteractive(pageA);
      await pageA.getByTestId('square-0-3').click();
      await expect(pageA.getByTestId('legal-target-0-4')).toBeVisible();
      await pageA.getByTestId('square-0-4').click();

      // A's own board commits the server snapshot.
      await expectPieceMoved(pageA, /Tốt đỏ, cột 1 hàng 5/);

      // B's board follows within a few seconds, with no reload.
      await expectPieceMoved(pageB, /Tốt đỏ, cột 1 hàng 5/);
      await expect(pageB.getByRole('img', { name: /Tốt đỏ, cột 1 hàng 4/ })).toHaveCount(0);
      expect(
        await pageB.evaluate(
          () => (window as unknown as { __e2eLoadedOnce?: boolean }).__e2eLoadedOnce,
        ),
      ).toBe(true);

      // Turn and clock follow the move on the observer's screen.
      await expect(pageB.getByText('Lượt của bạn')).toBeVisible({ timeout: 15_000 });
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
      expect(['INVALID_MOVE', 'VALIDATION_ERROR', 'NOT_YOUR_TURN', 'CONTROL_REQUIRED']).toContain(
        rejectedBody.error.code,
      );
      const versionAfter = (await (
        await request.get(`${API_URL}/api/v1/matches/${matchId}`, { headers: authHeader(tokenB) })
      ).json()).data.version as number;
      expect(versionAfter, 'rejected move must not change the match').toBe(versionBefore);

      // Neither board shows a phantom piece, and the UI still works afterwards.
      await expect(pageB.getByRole('img', { name: /Tốt đen, cột 1 hàng 7/ })).toBeVisible();
      await expect(pageB.getByRole('img', { name: /Tốt đen, cột 1 hàng 5/ })).toHaveCount(0);
      await expect(pageA.getByRole('img', { name: /Tốt đen, cột 1 hàng 7/ })).toBeVisible();

      await expectBoardInteractive(pageB);
      await pageB.getByTestId('square-0-6').click();
      await expect(pageB.getByTestId('legal-target-0-5')).toBeVisible();
      await pageB.getByTestId('square-0-5').click();

      // The legal move after the rejection lands on the opponent's board.
      await expectPieceMoved(pageA, /Tốt đen, cột 1 hàng 6/);

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
