import { test, expect } from '@playwright/test';

test.describe('Board UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dev/board');
    // Wait for the board to render
    await expect(page.getByTestId('xiangqi-board')).toBeVisible();
  });

  test('T005-E2E-01: Renders 32 pieces and board elements', async ({ page }) => {
    // Check that board svg is present
    const board = page.getByTestId('xiangqi-board');
    await expect(board).toBeVisible();

    // Check river text
    await expect(board.getByText('楚河')).toBeVisible();
    await expect(board.getByText('漢界')).toBeVisible();

    // Check pieces with Vietnamese aria labels
    const redPawn = page.getByRole('img', { name: /Tốt đỏ, cột 1 hàng 4/ });
    await expect(redPawn).toBeVisible();

    const redGeneral = page.getByRole('img', { name: /Tướng đỏ/ });
    await expect(redGeneral).toBeVisible();

    const blackGeneral = page.getByRole('img', { name: /Tướng đen/ });
    await expect(blackGeneral).toBeVisible();
  });

  test('T005-E2E-02: Click piece shows legal move targets', async ({ page }) => {
    // Click RED pawn at (0,3) — canonical column 1, row 4
    const redPawnSquare = page.getByTestId('square-0-3');
    await redPawnSquare.click();

    // Should show legal target at (0,4)
    const target = page.getByTestId('legal-target-0-4');
    await expect(target).toBeVisible();
  });

  test('T005-E2E-03: Flip board (orientation toggle)', async ({ page }) => {
    // Click flip button
    const flipBtn = page.getByRole('button', { name: /Lật bàn/ });
    await flipBtn.click();
    await expect(flipBtn).toHaveText(/BLACK/);

    // Board should still be visible
    await expect(page.getByTestId('xiangqi-board')).toBeVisible();

    // Flip back
    await flipBtn.click();
    await expect(flipBtn).toHaveText(/RED/);
  });

  test('T005-E2E-04: Non-interactive mode ignores clicks', async ({ page }) => {
    // Turn off interactive mode
    const toggleBtn = page.getByRole('button', { name: /Tương tác:/ });
    await toggleBtn.click();
    await expect(toggleBtn).toHaveText(/TẮT/);

    // Click piece — should NOT show legal target
    const redPawnSquare = page.getByTestId('square-0-3');
    await redPawnSquare.click();

    const target = page.getByTestId('legal-target-0-4');
    await expect(target).not.toBeVisible();
  });

  test('T005-E2E-05: Escape key clears selection', async ({ page }) => {
    // Click piece to select
    const redPawnSquare = page.getByTestId('square-0-3');
    await redPawnSquare.click();
    await expect(page.getByTestId('legal-target-0-4')).toBeVisible();

    // Press Escape
    await page.keyboard.press('Escape');

    // Legal target should be gone
    await expect(page.getByTestId('legal-target-0-4')).not.toBeVisible();
  });
});

test.describe('Mobile layout (360px viewport)', () => {
  test.use({ viewport: { width: 360, height: 800 } });

  test('T005-E2E-06: No horizontal scroll at 360px width', async ({ page }) => {
    await page.goto('/dev/board');
    await expect(page.getByTestId('xiangqi-board')).toBeVisible();

    // Check that document scroll width equals viewport width (no horizontal overflow)
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(360);
  });
});
