import { test, expect } from '@playwright/test';

test.describe('Friends and User Search UI', () => {
  test('T009-E2E-01: Friends page renders user search and list sections', async ({ page }) => {
    await page.goto('/friends');

    await expect(page.getByRole('heading', { name: 'Bạn bè', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Tìm người dùng' })).toBeVisible();
    await expect(page.getByTestId('user-search-input')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Danh sách bạn bè/ })).toBeVisible();
  });

  test('T009-E2E-02: Search button disabled when input < 3 characters', async ({ page }) => {
    await page.goto('/friends');

    const input = page.getByTestId('user-search-input');
    const submitBtn = page.getByRole('button', { name: 'Tìm kiếm' });

    // Initially empty — disabled
    await expect(submitBtn).toBeDisabled();

    // 2 characters — still disabled
    await input.fill('ab');
    await expect(submitBtn).toBeDisabled();

    // 3 characters — enabled
    await input.fill('abc');
    await expect(submitBtn).toBeEnabled();
  });
});
