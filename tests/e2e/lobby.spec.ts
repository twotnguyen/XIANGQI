import { test, expect } from '@playwright/test';

test.describe('Lobby and Room Creation UI', () => {
  test('T010-E2E-01: Lobby renders title and create room toggle button', async ({ page }) => {
    await page.goto('/lobby');

    await expect(page.getByRole('heading', { name: 'Sảnh chờ' })).toBeVisible();
    await expect(page.getByTestId('create-room-toggle-btn')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Phòng đang mở/ })).toBeVisible();
  });

  test('T010-E2E-02: Clicking create toggle reveals room creation form', async ({ page }) => {
    await page.goto('/lobby');

    const toggleBtn = page.getByTestId('create-room-toggle-btn');
    await toggleBtn.click();

    await expect(page.getByTestId('create-room-form')).toBeVisible();
    await expect(page.getByLabel('Tên phòng')).toBeVisible();
    await expect(page.getByLabel('Chế độ phòng')).toBeVisible();
    await expect(page.getByLabel('Thời gian mỗi bên')).toBeVisible();

    // Toggle close
    await toggleBtn.click();
    await expect(page.getByTestId('create-room-form')).not.toBeVisible();
  });

  test('T010-E2E-03: Room form options match spec (visibility and time control)', async ({ page }) => {
    await page.goto('/lobby');
    await page.getByTestId('create-room-toggle-btn').click();

    // Check visibility options
    const visSelect = page.getByLabel('Chế độ phòng');
    await expect(visSelect).toContainText('Công khai');
    await expect(visSelect).toContainText('Mã phòng');
    await expect(visSelect).toContainText('Khóa');

    // Check time control options: 0 (unlimited), 300 (5m), 600 (10m), 900 (15m)
    const tcSelect = page.getByLabel('Thời gian mỗi bên');
    await expect(tcSelect).toContainText('Không giới hạn');
    await expect(tcSelect).toContainText('5 phút');
    await expect(tcSelect).toContainText('10 phút');
    await expect(tcSelect).toContainText('15 phút');
  });
});
