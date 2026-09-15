const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const results = {};
  const screenshotsDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });

  // ---- Desktop 1440x900 ----
  const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const desktopPage = await desktopContext.newPage();
  await desktopPage.goto('http://localhost:3002/', { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(2000);

  const desktopMeasure = await desktopPage.evaluate(() => {
    const panel = document.querySelector('[data-hero-panel]');
    if (!panel) return { error: 'panel not found' };
    const rect = panel.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const topEl = document.elementFromPoint(cx, cy);
    const style = getComputedStyle(panel);
    const hero = panel.closest('[class*="relative"]');
    const heroStyle = hero ? getComputedStyle(hero) : null;
    return {
      panelFound: true,
      isOnTop: panel.contains(topEl) || panel === topEl,
      topElementTag: topEl ? topEl.tagName : null,
      topElementIsPanelDescendant: panel.contains(topEl),
      position: style.position,
      zIndex: style.zIndex,
      display: style.display,
      visibility: style.visibility,
      opacity: style.opacity,
      rect: { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right, width: rect.width, height: rect.height },
      inViewport: rect.top < window.innerHeight && rect.bottom > 0,
      heroPosition: heroStyle ? heroStyle.position : null,
      heroZIndex: heroStyle ? heroStyle.zIndex : null,
    };
  });

  await desktopPage.screenshot({ path: path.join(screenshotsDir, 'desktop-1440x900.png'), fullPage: false });

  // ---- Mobile 390x844 ----
  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:3002/', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(2000);

  const mobileMeasure = await mobilePage.evaluate(() => {
    const panel = document.querySelector('[data-hero-panel]');
    if (!panel) return { error: 'panel not found' };
    const rect = panel.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const topEl = document.elementFromPoint(cx, cy);
    const style = getComputedStyle(panel);
    const hero = panel.closest('[class*="relative"]');
    const heroStyle = hero ? getComputedStyle(hero) : null;
    return {
      panelFound: true,
      isOnTop: panel.contains(topEl) || panel === topEl,
      topElementTag: topEl ? topEl.tagName : null,
      topElementIsPanelDescendant: panel.contains(topEl),
      position: style.position,
      zIndex: style.zIndex,
      display: style.display,
      visibility: style.visibility,
      opacity: style.opacity,
      rect: { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right, width: rect.width, height: rect.height },
      inViewport: rect.top < window.innerHeight && rect.bottom > 0,
      heroPosition: heroStyle ? heroStyle.position : null,
      heroZIndex: heroStyle ? heroStyle.zIndex : null,
    };
  });

  await mobilePage.screenshot({ path: path.join(screenshotsDir, 'mobile-390x844.png'), fullPage: false });

  // ---- Scroll test on desktop ----
  await desktopPage.evaluate(() => window.scrollTo(0, window.innerHeight));
  await desktopPage.waitForTimeout(1000);

  const scrollMeasure = await desktopPage.evaluate(() => {
    const panel = document.querySelector('[data-hero-panel]');
    if (!panel) return { error: 'panel not found' };
    const rect = panel.getBoundingClientRect();
    return {
      inViewport: rect.top < window.innerHeight && rect.bottom > 0,
      rect: { top: rect.top, bottom: rect.bottom },
    };
  });

  results.desktop = desktopMeasure;
  results.mobile = mobileMeasure;
  results.scroll = scrollMeasure;
  results.screenshots = {
    desktop: path.join(screenshotsDir, 'desktop-1440x900.png'),
    mobile: path.join(screenshotsDir, 'mobile-390x844.png'),
  };

  console.log(JSON.stringify(results, null, 2));

  await desktopContext.close();
  await mobileContext.close();
  await browser.close();
})();
