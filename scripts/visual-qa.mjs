import { chromium } from 'playwright-core';
import { mkdir } from 'node:fs/promises';

const baseUrl = process.env.QA_BASE_URL || 'http://127.0.0.1:4321';
const executablePath = process.env.CHROME_PATH || 'C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe';
const outputDirectory = new URL('../qa/', import.meta.url);

const checks = [
  ['home-1440', '/', 1440, 900],
  ['home-1366', '/', 1366, 768],
  ['home-1024', '/', 1024, 768],
  ['home-390-emulated', '/', 390, 844],
  ['home-375-emulated', '/', 375, 812],
  ['home-360-emulated', '/', 360, 800],
  ['research-1024-emulated', '/research/', 1024, 768],
  ['research-390-emulated', '/research/', 390, 844],
  ['article-375-emulated', '/research/best-adapter-for-bimmercode/', 375, 812],
  ['contact-390-emulated', '/contact/', 390, 844]
];

await mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch({ executablePath, headless: true });
let failed = false;

for (const [name, path, width, height] of checks) {
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('pageerror', (error) => consoleErrors.push(error.message));
  await page.goto(`${baseUrl}${path}`, { waitUntil: 'networkidle' });
  const layout = await page.evaluate(() => {
    const width = document.documentElement.clientWidth;
    const offenders = [...document.querySelectorAll('body *')].flatMap((element) => {
      const style = getComputedStyle(element);
      if (style.position === 'fixed' || style.visibility === 'hidden' || style.display === 'none') return [];
      const rect = element.getBoundingClientRect();
      if (rect.width > 0 && (rect.right > width + 1 || rect.left < -1)) {
        return [{ tag: element.tagName.toLowerCase(), className: String(element.className).slice(0, 80), left: Math.round(rect.left), right: Math.round(rect.right), width: Math.round(rect.width) }];
      }
      return [];
    }).slice(0, 12);
    return { clientWidth: width, scrollWidth: document.documentElement.scrollWidth, offenders };
  });
  await page.screenshot({ path: new URL(`${name}.png`, outputDirectory).pathname.slice(1), fullPage: false });
  if (name === 'home-1440') {
    const componentShots = [['stories-3d', '.story-rail'], ['categories-3d', '.category-index'], ['tools-3d', '.tool-rail'], ['articles-3d', '.article-grid']];
    for (const [shotName, selector] of componentShots) {
      const component = page.locator(selector);
      await component.scrollIntoViewIfNeeded();
      await page.waitForTimeout(350);
      await component.screenshot({ path: new URL(`${shotName}.png`, outputDirectory).pathname.slice(1) });
    }
  }
  const overflow = layout.scrollWidth > layout.clientWidth + 1;
  if (overflow || consoleErrors.length) failed = true;
  console.log(JSON.stringify({ name, viewport: `${width}x${height}`, overflow, ...layout, consoleErrors }));
  await context.close();
}

const interactionContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
const interactionPage = await interactionContext.newPage();
const interactionErrors = [];
interactionPage.on('pageerror', (error) => interactionErrors.push(error.message));
await interactionPage.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
await interactionPage.locator('[data-menu-open]').click();
const menuAriaHiddenAfterOpen = await interactionPage.locator('[data-menu]').getAttribute('aria-hidden');
await interactionPage.locator('[data-menu-close]').click();
await interactionPage.locator('[data-search-open]').first().click();
await interactionPage.locator('[data-search-input]').fill('F30');
await interactionPage.waitForTimeout(100);
const searchResultsForF30 = await interactionPage.locator('[data-search-results] a').count();
const interactionResult = { menuAriaHiddenAfterOpen, searchResultsForF30, pageErrors: interactionErrors };
console.log(JSON.stringify({ name: 'mobile-interactions', ...interactionResult }));
if (menuAriaHiddenAfterOpen !== 'false' || searchResultsForF30 < 1 || interactionErrors.length) failed = true;
await interactionContext.close();

await browser.close();
if (failed) process.exitCode = 1;
