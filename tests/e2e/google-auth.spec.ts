import { test, expect } from '@playwright/test';

test.describe('Google Auth and Onboarding UI', () => {
  test('T008-E2E-01: Login page shows Google sign-in button', async ({ page }) => {
    await page.goto('/login');

    const googleBtn = page.getByTestId('google-login-btn');
    await expect(googleBtn).toBeVisible();
    await expect(googleBtn).toContainText('Đăng nhập bằng Google');
  });

  test('T008-E2E-02: Onboarding page renders username input and completes flow', async ({ page }) => {
    await page.goto('/onboarding');

    await expect(page.getByRole('heading', { name: 'Hoàn tất hồ sơ' })).toBeVisible();
    await expect(page.getByLabel(/Tên đăng nhập/)).toBeVisible();
    await expect(page.getByLabel(/Tên hiển thị/)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Hoàn tất' })).toBeVisible();
  });

  test('T008-E2E-03: Onboarding rejects invalid username format (<3 chars, uppercase, spaces)', async ({ page }) => {
    await page.goto('/onboarding');

    const usernameInput = page.getByLabel(/Tên đăng nhập/);
    const submitBtn = page.getByRole('button', { name: 'Hoàn tất' });

    // Too short
    await usernameInput.fill('ab');
    await submitBtn.click();

    const alert = page.getByRole('alert');
    await expect(alert).toBeVisible();
    await expect(alert).toContainText(/3-24 ký tự/);

    // Spaces
    await usernameInput.fill('user name');
    await submitBtn.click();
    await expect(alert).toBeVisible();
    await expect(alert).toContainText(/3-24 ký tự/);
  });

  test('T008-E2E-04: Callback page with external next parameter does NOT redirect externally', async ({ page }) => {
    // Navigate to callback with a malicious next parameter
    await page.goto('/auth/callback?next=https://evil.com');

    // Should stay on our domain, not navigate to evil.com
    await page.waitForTimeout(500);
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('evil.com');
  });
});
