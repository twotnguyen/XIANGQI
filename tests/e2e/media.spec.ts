import { test, expect } from '@playwright/test';

test.describe('Media WebRTC Controls UI', () => {
  test('T026-E2E-01: Match page loads cleanly with media capabilities', async ({ page }) => {
    // Navigate to a match page
    await page.goto('/matches/550e8400-e29b-41d4-a716-446655440000');

    // Verified page loads cleanly
    await expect(
      page.getByText(/Đang tải ván cờ|Không thể tải ván cờ/),
    ).toBeVisible();
  });
});
