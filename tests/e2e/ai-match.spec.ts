import { test, expect } from '@playwright/test';

test.describe('AI Match Creation and Game UI', () => {
  test('T022-E2E-01: /ai/new renders options with defaults RED, MEDIUM, unlimited', async ({ page }) => {
    await page.goto('/ai/new');

    await expect(page.getByRole('heading', { name: 'Chơi với máy (AI)' })).toBeVisible();

    const sideSelect = page.getByLabel('Bên chơi');
    await expect(sideSelect).toHaveValue('RED');

    const levelSelect = page.getByLabel('Cấp độ máy');
    await expect(levelSelect).toHaveValue('MEDIUM');

    const timeSelect = page.getByLabel('Thời gian');
    await expect(timeSelect).toHaveValue('0');

    await expect(page.getByRole('button', { name: 'Bắt đầu ván đấu' })).toBeVisible();
  });

  test('T022-E2E-02: User can select BLACK side', async ({ page }) => {
    await page.goto('/ai/new');

    const sideSelect = page.getByLabel('Bên chơi');
    await sideSelect.selectOption('BLACK');
    await expect(sideSelect).toHaveValue('BLACK');
  });
});
