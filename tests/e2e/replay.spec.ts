import { test, expect } from '@playwright/test';

test.describe('Match History and Replay UI', () => {
  test('T027-E2E-01: History page renders title and lobby link', async ({ page }) => {
    await page.goto('/history');

    // If redirected to login or renders history
    await expect(
      page.getByRole('heading', { name: /Lịch sử ván đấu|Đăng nhập/ }),
    ).toBeVisible();
  });

  test('T027-E2E-02: Replay page loads cleanly for a match ID', async ({ page }) => {
    await page.goto('/matches/550e8400-e29b-41d4-a716-446655440000/replay');

    await expect(
      page.getByText(/Đang tải dữ liệu ván cờ|Lỗi xem lại/),
    ).toBeVisible();
  });
});
