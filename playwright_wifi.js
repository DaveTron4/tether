const { chromium } = require('playwright');
require('dotenv').config();

(async () => {
  const browser = await chromium.launch({
    headless: false
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(process.env.VIDAPAY_LOGIN_URL);
  await page.locator('[data-test-id="AccountId"]').click();
  await page.locator('[data-test-id="AccountId"]').fill(process.env.VIDAPAY_ACCOUNT_ID);
  await page.locator('[data-test-id="Username"]').click();
  await page.locator('[data-test-id="Username"]').fill(process.env.VIDAPAY_USERNAME);
  await page.locator('[data-test-id="Password"]').click();
  await page.locator('[data-test-id="Password"]').fill(process.env.VIDAPAY_PASSWORD);
  await page.locator('[data-test-id="SignInButton"]').click();
  await page.locator('[data-test-id="verify"]').click();
  await page.getByRole('button', { name: 'Payments' }).click();
  await page.getByRole('button', { name: 'All Carriers' }).click();
  await page.getByRole('button', { name: 'xfinity xfinity' }).click();
  await page.getByRole('button', { name: 'SELECT A PLAN ' }).click();
  await page.getByRole('button', { name: '$ 45 Xfinity Prepaid Internet' }).click();

  // ---------------------
  await context.close();
  await browser.close();
})();