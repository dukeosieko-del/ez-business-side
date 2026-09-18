import { test, expect } from '@playwright/test';

test.describe('Hero Section Visual Tests', () => {
  test('verify hero section on desktop', async ({ page }) => {
    await page.goto('https://business.janjez.social');

    const heroSection = page.locator('section:has-text("Build Your Social Media Business on Kenya"), div:has-text("Build Your Social Media Business on Kenya"), h1:has-text("Build Your Social Media Business on Kenya")').first();
    await expect(heroSection).toBeVisible({ timeout: 10000 });

    const zIndex = await heroSection.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.zIndex;
    });
    console.log('Hero z-index:', zIndex);

    const hasPosition = await heroSection.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.position !== 'static';
    });
    console.log('Hero has explicit position:', hasPosition);

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.screenshot({ path: 'screenshots/desktop-hero.png', fullPage: false });

    const heroText = await heroSection.textContent();
    console.log('Hero text:', heroText);

    const pageText = await page.textContent('body');
    const keyStrings = ['Janjez Business Side', 'Reseller', 'Child Panel', 'Affiliate', 'How It Works'];
    for (const str of keyStrings) {
      expect(pageText).toContain(str);
      console.log(`Found key string: "${str}"`);
    }
  });

  test('verify hero section on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('https://business.janjez.social');

    const heroSection = page.locator('section:has-text("Build Your Social Media Business on Kenya"), div:has-text("Build Your Social Media Business on Kenya"), h1:has-text("Build Your Social Media Business on Kenya")').first();
    await expect(heroSection).toBeVisible({ timeout: 10000 });

    await page.screenshot({ path: 'screenshots/mobile-hero.png', fullPage: false });
    console.log('Mobile hero screenshot saved');

    const pageText = await page.textContent('body');
    const keyStrings = ['Janjez Business Side', 'Reseller', 'Child Panel', 'Affiliate', 'How It Works'];
    for (const str of keyStrings) {
      expect(pageText).toContain(str);
      console.log(`Found key string: "${str}"`);
    }
  });
});