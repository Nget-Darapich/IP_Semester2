import { test, expect } from '@playwright/test';

test('locked user cannot login', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');

  await page.getByPlaceholder('Username').fill('locked_out_user');
  await page.getByPlaceholder('Password').fill('secret_sauce');
  await page.getByRole('button', { name: /login/i }).click();

  await expect(page.locator('[data-test="error"]'))
    .toContainText('Sorry, this user has been locked out');
});