import { test, expect, type Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Skip guard — must be at file top so the whole suite skips cleanly when no
// browser binary is installed, instead of erroring on launch.
let browserAvailable = true;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { chromium } = require('@playwright/test');
  const probe = chromium.executablePath();
  if (!probe || !fs.existsSync(probe)) {
    browserAvailable = false;
  }
} catch {
  browserAvailable = false;
}

test.skip(
  !browserAvailable,
  'Playwright browsers not installed. Run: npx playwright install --with-deps chromium'
);

const PANEL_SELECTOR = '[class*="inset-x-0"][class*="bottom-0"]';

async function getPanel(page: Page) {
  return page.locator(PANEL_SELECTOR).first();
}

test.describe('hero bottom panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('panel is rendered and visible', async ({ page }) => {
    const panel = await getPanel(page);
    await expect(panel).toBeVisible();
    await expect(panel).toBeInViewport();
  });

  test('panel is not hidden by CSS', async ({ page }) => {
    const panel = await getPanel(page);
    const style = await panel.evaluate((el) => {
      const cs = getComputedStyle(el);
      return {
        display: cs.display,
        visibility: cs.visibility,
        opacity: cs.opacity,
        position: cs.position,
      };
    });

    expect(style.display).not.toBe('none');
    expect(style.visibility).not.toBe('hidden');
    expect(style.opacity).not.toBe('0');
  });

  test('panel is not buried behind another element (bcace6d guard)', async ({ page }) => {
    const panel = await getPanel(page);
    const box = await panel.boundingBox();
    if (!box) throw new Error('panel has no bounding box');

    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;

    const topElement = await page.evaluate(
      ({ cx, cy }) => {
        const el = document.elementFromPoint(cx, cy) as HTMLElement | null;
        if (!el) return null;
        // Walk up to find whether this element is inside the panel.
        let node: HTMLElement | null = el;
        while (node) {
          if (node.getAttribute('class') && node.getAttribute('class')!.includes('inset-x-0') && node.getAttribute('class')!.includes('bottom-0')) {
            return 'panel';
          }
          node = node.parentElement;
        }
        return el.tagName + '.' + (el.getAttribute('class') || '');
      },
      { cx, cy }
    );

    expect(topElement).toBe('panel');
  });

  test('panel is hero-anchored, not viewport-pinned', async ({ page }) => {
    const panel = await getPanel(page);

    const position = await panel.evaluate((el) => getComputedStyle(el).position);
    expect(position).not.toBe('fixed');

    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await expect(panel).not.toBeInViewport();
  });

  test('CTA and category pills route to correct destinations', async ({ page }) => {
    const cta = page.getByRole('link', { name: 'Get Started — Free' });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute('href', '/auth/sign-in');

    const panel = await getPanel(page);
    const pills = panel.locator('a[href]');
    const count = await pills.count();
    const hrefs: string[] = [];
    for (let i = 0; i < count; i++) {
      const href = await pills.nth(i).getAttribute('href');
      if (href) hrefs.push(href);
    }

    expect(hrefs).toContain('#categories');
    expect(hrefs).toContain('#how-it-works');
    expect(hrefs).toContain('#product');
    expect(hrefs).toContain('https://janjez.social');

    const unique = new Set(hrefs);
    expect(unique.size).toBe(hrefs.length);
  });

  test('screenshot baseline — desktop', async ({ page }, testInfo) => {
    if (testInfo.project.name !== 'desktop-chromium') return;
    const panel = await getPanel(page);
    await expect(panel).toHaveScreenshot('hero-desktop.png');
  });

  test('screenshot baseline — mobile', async ({ page }, testInfo) => {
    if (testInfo.project.name !== 'mobile-chromium') return;
    const panel = await getPanel(page);
    await expect(panel).toHaveScreenshot('hero-mobile.png');
  });
});