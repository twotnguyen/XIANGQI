import { test, expect } from '@playwright/test';

const ROUTES = [
  { path: '/lobby', name: 'Lobby' },
  { path: '/ai/new', name: 'New AI Match' },
  { path: '/friends', name: 'Friends' },
  { path: '/history', name: 'History' },
  { path: '/login', name: 'Login' },
  { path: '/dev/board', name: 'Dev Board' },
];

test.describe('Responsive Layout: No Horizontal Overflow at 360px', () => {
  test.use({ viewport: { width: 360, height: 800 } });

  for (const route of ROUTES) {
    test(`T028-E2E-01: ${route.name} (${route.path}) has no horizontal overflow at 360px`, async ({ page }) => {
      await page.goto(route.path);
      // Wait for page load
      await page.waitForLoadState('domcontentloaded');

      const isOverflowing = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });

      expect(isOverflowing).toBe(false);
    });
  }
});

test.describe('Responsive Layout: Desktop 1366px Integrity', () => {
  test.use({ viewport: { width: 1366, height: 768 } });

  test('T028-E2E-02: Navbar renders brand, nav items and logout/login', async ({ page }) => {
    await page.goto('/lobby');
    const navbar = page.getByTestId('main-navbar');
    await expect(navbar).toBeVisible();
    await expect(navbar.getByText('XIANGQI')).toBeVisible();
    await expect(navbar.getByRole('link', { name: 'Sảnh chờ' })).toBeVisible();
    await expect(navbar.getByRole('link', { name: 'Đánh với máy' })).toBeVisible();
  });

  test('T028-E2E-03: Dev board renders centered without scroll at 1366px', async ({ page }) => {
    await page.goto('/dev/board');
    await expect(page.getByRole('region', { name: /bàn cờ/i })).toBeVisible();

    const isOverflowing = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });

    expect(isOverflowing).toBe(false);
  });
});
