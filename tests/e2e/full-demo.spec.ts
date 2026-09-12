import { test, expect } from '@playwright/test';

test.describe('Full End-to-End Acceptance Journey', () => {
  test('T030-E2E-01: Full user navigation through core features', async ({ page }) => {
    // 1. Visit Home
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Cờ Tướng Online' })).toBeVisible();

    // 2. Navigate to Lobby via Navbar
    await page.getByTestId('main-navbar').getByRole('link', { name: 'Sảnh chờ' }).click();
    await expect(page.getByRole('heading', { name: 'Sảnh chờ' })).toBeVisible();

    // 3. Navigate to AI Match Setup via Navbar
    await page.getByTestId('main-navbar').getByRole('link', { name: 'Đánh với máy' }).click();
    await expect(page.getByRole('heading', { name: 'Chơi với máy (AI)' })).toBeVisible();

    // 4. Navigate to History via Navbar
    await page.getByTestId('main-navbar').getByRole('link', { name: 'Lịch sử' }).click();
    await expect(page.getByRole('heading', { name: /Lịch sử ván đấu|Đăng nhập/ })).toBeVisible();

    // 5. Navigate to Dev Board
    await page.goto('/dev/board');
    await expect(page.getByRole('region', { name: /bàn cờ/i })).toBeVisible();
  });
});
