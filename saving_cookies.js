const { chromium } = require('playwright');
require('dotenv').config();
const fs = require('fs');

const AUTH_FILE = 'auth.json';

(async () => {
  const browser = await chromium.launch({ headless: false });
  
  // Check if we have saved cookies
  let context;
  if (fs.existsSync(AUTH_FILE)) {
    context = await browser.newContext({ storageState: AUTH_FILE });
  } else {
    context = await browser.newContext();
  }
  
  const page = await context.newPage();
  await page.goto(process.env.VIDAPAY_LOGIN_URL);
  
  // Check if we're already logged in
  try {
    await page.waitForURL(process.env.VIDAPAY_DASHBOARD_URL, { timeout: 5000 });
    console.log('✅ Already logged in with saved cookies!');
  } catch {
    // Need to login
    console.log('🔐 Performing fresh login...');
    await page.locator('[data-test-id="AccountId"]').fill(process.env.VIDAPAY_ACCOUNT_ID);
    await page.locator('[data-test-id="Username"]').fill(process.env.VIDAPAY_USERNAME);
    await page.locator('[data-test-id="Password"]').fill(process.env.VIDAPAY_PASSWORD);
    await page.locator('[data-test-id="SignInButton"]').click();
    
    // Handle reCAPTCHA
    await page.locator('iframe[name="a-sdafbu1jfsa9"]').contentFrame().getByRole('checkbox', { name: 'I\'m not a robot' }).click();
    await page.locator('[data-test-id="verify"]').click();
    
    // Save cookies for next time
    await context.storageState({ path: AUTH_FILE });
    console.log('💾 Cookies saved for future runs!');
  }
  
  // Continue with your test
  await page.getByRole('button', { name: 'Payments' }).click();
  // ... rest of your automation
  
  await context.close();
  await browser.close();
})();