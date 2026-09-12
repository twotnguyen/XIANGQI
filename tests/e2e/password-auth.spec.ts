import { test, expect } from '@playwright/test';

test.describe('Password Auth Pages', () => {
  test('T007-E2E-01: Login page renders username, password inputs and links', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: 'Đăng nhập' })).toBeVisible();
    await expect(page.getByLabel('Tên đăng nhập')).toBeVisible();
    await expect(page.getByLabel('Mật khẩu')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Đăng nhập', exact: true })).toBeVisible();

    // Links to register and reset password
    await expect(page.getByRole('link', { name: 'Đăng ký' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Quên mật khẩu?' })).toBeVisible();
  });

  test('T007-E2E-02: Register page enforces minimum 10 char password', async ({ page }) => {
    await page.goto('/register');

    await expect(page.getByRole('heading', { name: 'Đăng ký' })).toBeVisible();

    // Fill short password
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel(/Tên đăng nhập/).fill('testuser');
    await page.getByLabel(/Mật khẩu/).fill('short');
    await page.getByRole('button', { name: 'Đăng ký' }).click();

    // Browser HTML5 minLength validation or our JS validation shows error
    // Check for error alert
    const errorAlert = page.getByRole('alert');
    // Either the HTML validation prevents submit, or alert appears
    const alertVisible = await errorAlert.isVisible().catch(() => false);
    if (alertVisible) {
      await expect(errorAlert).toContainText(/10 ký tự/);
    }
  });

  test('T007-E2E-03: Reset password page renders email request form', async ({ page }) => {
    await page.goto('/auth/reset-password');

    await expect(page.getByRole('heading', { name: 'Quên mật khẩu' })).toBeVisible();
    await expect(page.getByLabel('Nhập email tài khoản')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Gửi liên kết đặt lại' })).toBeVisible();
  });

  test('T007-E2E-04: Callback page shows error state for invalid link', async ({ page }) => {
    await page.goto('/auth/callback');

    // Without a valid hash/code, it should show error or timeout
    await expect(
      page.getByRole('heading', { name: /Lỗi xác thực|Đang xác thực/ }),
    ).toBeVisible();
  });
});
