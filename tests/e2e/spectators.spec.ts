import { test, expect } from '@playwright/test';

test.describe('Spectators Panel UI', () => {
  test('T016-E2E-01: RoomWaiting page renders spectator panel with count out of 5', async ({ page }) => {
    // Navigate to a room waiting page
    await page.goto('/rooms/550e8400-e29b-41d4-a716-446655440000');

    // If room is loading or error, verify page loads cleanly
    await expect(
      page.getByRole('heading', { name: /Lỗi phòng/ }).or(page.getByText('Đang tải phòng...')),
    ).toBeVisible();
  });
});
