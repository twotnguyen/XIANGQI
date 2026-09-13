/**
 * Keyboard operability for the board (finding F-21, spec 07 "Escape bỏ chọn,
 * arrows + Enter cho keyboard board").
 *
 * Preconditions are asserted, not skipped: if the local API is down the spec
 * fails here instead of silently passing on a stale dev server.
 */
import { test, expect, type APIRequestContext, type Page } from '@playwright/test';

const API_URL = process.env['VITE_API_URL'] ?? 'http://localhost:3001';

/** RED rook at canonical (0,0): the first piece of the side to move, i.e. the tab stop. */
const FIRST_TAB_STOP = 'square-0-0';

async function assertStackUp(request: APIRequestContext): Promise<void> {
  const health = await request.get(`${API_URL}/health`);
  expect(health.status(), `API health at ${API_URL}/health`).toBe(200);
  expect((await health.json()).status).toBe('ok');
}

/** Tab from the page into the board; returns the focused intersection testid. */
async function tabIntoBoard(page: Page): Promise<string> {
  for (let i = 0; i < 40; i += 1) {
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => {
      const active = document.activeElement;
      return active && 'getAttribute' in active
        ? (active.getAttribute('data-testid') ?? '')
        : '';
    });
    if (focused.startsWith('square-')) return focused;
  }
  throw new Error('Tab never reached a board intersection');
}

async function tabStops(page: Page): Promise<string[]> {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll('[data-testid^="square-"][tabindex="0"]'))
      .map((el) => el.getAttribute('data-testid') ?? ''),
  );
}

/** RED's forward is +y, which is "up" on an unflipped screen: (0,0) → (0,3) is three ArrowUp. */
async function moveCursorToRedPawn(page: Page): Promise<void> {
  for (let i = 0; i < 3; i += 1) await page.keyboard.press('ArrowUp');
  await expect(page.getByTestId('square-0-3')).toBeFocused();
}

test.describe('Board keyboard navigation', () => {
  test.beforeEach(async ({ request }) => {
    await assertStackUp(request);
  });

  test('T005-E2E-07: Tab reaches the board, Enter selects and arrows+Enter move', async ({ page }) => {
    await page.goto('/dev/board');
    await expect(page.getByTestId('xiangqi-board')).toBeVisible();

    // Reachability: one keyboard stop, on the first movable piece.
    const reached = await tabIntoBoard(page);
    expect(reached).toBe(FIRST_TAB_STOP);

    // Arrows walk the cursor to the RED pawn, Enter selects it.
    await moveCursorToRedPawn(page);
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('legal-target-0-4')).toBeVisible();

    // Enter on the target square plays the move.
    await page.keyboard.press('ArrowUp');
    await expect(page.getByTestId('square-0-4')).toBeFocused();
    await page.keyboard.press('Enter');

    await expect(page.getByTestId('dev-last-move')).toHaveText(
      /Nước đã chọn: \(0,3\) → \(0,4\)/,
    );
    // Selection cleared after the move.
    await expect(page.getByTestId('legal-target-0-4')).not.toBeVisible();
  });

  test('T005-E2E-08: Escape clears the keyboard selection', async ({ page }) => {
    await page.goto('/dev/board');
    await tabIntoBoard(page);
    await moveCursorToRedPawn(page);

    await page.keyboard.press('Space');
    await expect(page.getByTestId('legal-target-0-4')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.getByTestId('legal-target-0-4')).not.toBeVisible();
  });

  test('T005-E2E-09: Roving tabindex keeps one reachable intersection and follows the cursor', async ({ page }) => {
    await page.goto('/dev/board');
    await expect(page.getByTestId('xiangqi-board')).toBeVisible();

    // All 90 intersections exist, exactly one is in the tab order.
    const intersections = await page.locator('[data-testid^="square-"]').count();
    expect(intersections).toBe(90);
    expect(await tabStops(page)).toEqual([FIRST_TAB_STOP]);

    await tabIntoBoard(page);
    await page.keyboard.press('ArrowRight');
    await expect(page.getByTestId('square-1-0')).toBeFocused();
    expect(await tabStops(page)).toEqual(['square-1-0']);
    await expect(page.getByTestId('square-0-0')).toHaveAttribute('tabindex', '-1');
  });

  test('T005-E2E-10: Arrow keys follow the board orientation', async ({ page }) => {
    await page.goto('/dev/board');
    await page.getByRole('button', { name: /Lật bàn/ }).click();
    await expect(page.getByRole('button', { name: /Lật bàn/ })).toHaveText(/BLACK/);

    await tabIntoBoard(page);
    // Flipped: "left" on screen is canonical x+1 for BLACK orientation.
    await page.keyboard.press('ArrowLeft');
    await expect(page.getByTestId('square-1-0')).toBeFocused();
    await page.keyboard.press('ArrowDown');
    // "down" on screen is canonical y+1 in the flipped view.
    await expect(page.getByTestId('square-1-1')).toBeFocused();
  });

  test('T005-E2E-11: Non-interactive board is not tab-reachable and ignores keys', async ({ page }) => {
    await page.goto('/dev/board');
    await page.getByRole('button', { name: /Tương tác:/ }).click();
    await expect(page.getByRole('button', { name: /Tương tác:/ })).toHaveText(/TẮT/);

    expect(await tabStops(page)).toEqual([]);
    await expect(page.getByTestId('square-0-3')).toHaveAttribute('tabindex', '-1');
    await expect(page.getByTestId('dev-last-move')).toHaveText(/chưa có/);
  });
});
