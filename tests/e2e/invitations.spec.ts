import { test, expect } from '@playwright/test';

test.describe('Invitations and Join Flow UI', () => {
  test('T011-E2E-01: /join without token shows error message', async ({ page }) => {
    await page.goto('/join');

    await expect(page.getByRole('heading', { name: 'Không thể tham gia' })).toBeVisible();
    await expect(page.getByRole('alert')).toContainText(/không hợp lệ/);
    await expect(page.getByRole('button', { name: 'Về sảnh chờ' })).toBeVisible();
  });

  test('T011-E2E-02: Fragment token is immediately cleaned from URL on /join', async ({ page }) => {
    await page.goto('/join#token=sampletoken12345&role=SPECTATOR');

    // Wait for effect to run
    await page.waitForTimeout(300);

    // Hash should be removed from URL (security: token not in history/logs)
    expect(page.url()).not.toContain('#token=');
  });
});
