const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('https://www.youtube.com/');
  await page.getByRole('combobox', { name: 'Search' }).click();
  await page.getByRole('combobox', { name: 'Search' }).fill('Vegetta777');
  await page.getByRole('combobox', { name: 'Search' }).press('Enter');
  await page.getByRole('link', { name: 'VEGETTA777 Verified @' }).click();
  await page.locator('#page-header').getByRole('button', { name: 'Subscribe' }).click();
  await page.locator('#page-header').getByRole('button', { name: 'Subscribe' }).click();

  // ---------------------
  await context.close();
  await browser.close();
})();