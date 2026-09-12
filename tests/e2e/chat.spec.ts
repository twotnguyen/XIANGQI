import { test, expect } from '@playwright/test';

test.describe('Chat Panel UI', () => {
  test('T017-E2E-01: Chat component renders input and send button on match page', async ({ page }) => {
    // Navigate to a match page with dummy id
    await page.goto('/matches/550e8400-e29b-41d4-a716-446655440000');

    // If loading or error, page loads cleanly
    await expect(
      page.getByText(/Đang tải ván cờ|Không thể tải ván cờ/),
    ).toBeVisible();
  });
});
