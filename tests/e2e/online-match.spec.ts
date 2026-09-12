import { test, expect } from '@playwright/test';

test.describe('Online Match UI Components', () => {
  test('T015-E2E-01: MatchPage shows loading or error state for non-existent match', async ({ page }) => {
    await page.goto('/matches/00000000-0000-0000-0000-000000000000');
    await expect(
      page.getByText(/Đang tải ván cờ|Không thể tải ván cờ/),
    ).toBeVisible();
  });

  test('T015-E2E-02: Board renders on dev route with controls and flip', async ({ page }) => {
    await page.goto('/dev/board');
    await expect(page.getByTestId('xiangqi-board')).toBeVisible();

    // Verify pieces
    const redGeneral = page.getByRole('img', { name: /Tướng đỏ/ });
    await expect(redGeneral).toBeVisible();

    // Flip board
    const flipBtn = page.getByRole('button', { name: /Lật bàn/ });
    await flipBtn.click();
    await expect(flipBtn).toContainText('BLACK');

    // Board still rendered after flip
    await expect(page.getByTestId('xiangqi-board')).toBeVisible();
  });
});
