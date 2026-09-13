import { chromium } from 'playwright-core';
import { mkdir, readFile } from 'node:fs/promises';

const baseUrl = process.env.QA_BASE_URL || 'http://127.0.0.1:4321';
const executablePath = process.env.CHROME_PATH || 'C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe';
const outputDirectory = new URL('../qa/', import.meta.url);

const registry = JSON.parse(await readFile(new URL('../src/affiliate/product-registry.generated.json', import.meta.url), 'utf8'));
const pilotExpectedHref = registry['obdlink-cx'].specialLink;
const checks = [
  ['home-1440', '/', 1440, 900],
  ['home-1366', '/', 1366, 768],
  ['home-1024', '/', 1024, 768],
  ['home-390-emulated', '/', 390, 844],
  ['home-375-emulated', '/', 375, 812],
  ['home-360-emulated', '/', 360, 800],
  ['research-1024-emulated', '/research/', 1024, 768],
  ['research-390-emulated', '/research/', 390, 844],
  ['methodology-375-emulated', '/methodology/', 375, 812],
  ['affiliate-pilot-bimmerlink-pricing-1280', '/guides/bimmerlink-pricing/', 1280, 900],
  ['affiliate-pilot-bimmerlink-pricing-320', '/guides/bimmerlink-pricing/', 320, 720],
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
  let pilotResult = null;
  if (name.startsWith('affiliate-pilot-')) {
    const card = page.locator('[data-affiliate-unit]');
    await card.scrollIntoViewIfNeeded();
    await page.waitForTimeout(350);
    pilotResult = await page.evaluate((expectedHref) => {
      const units = [...document.querySelectorAll('[data-affiliate-unit]')];
      const unit = units[0];
      const link = unit?.querySelector('a[data-affiliate-link]');
      const image = unit?.querySelector('img');
      const disclosure = document.querySelector('.affiliate-disclosure');
      return {
        unitCount: units.length,
        hrefExact: link?.getAttribute('href') === expectedHref,
        relExact: link?.getAttribute('rel') === 'sponsored nofollow noopener',
        productNameExact: unit?.querySelector('h2, h3')?.textContent?.trim() === 'OBDLink CX',
        contextualRecommendation: unit?.textContent?.includes('For the BimmerLink setup described here') ?? false,
        attributionExact: unit?.querySelector('.affiliate-product-card__attribution')?.textContent?.trim() === 'Product image: OBDLink.',
        imageLoaded: Boolean(image?.complete && image.naturalWidth > 0),
        disclosureBeforeCard: Boolean(disclosure && unit && (disclosure.compareDocumentPosition(unit) & Node.DOCUMENT_POSITION_FOLLOWING))
      };
    }, pilotExpectedHref);
    if (pilotResult.unitCount !== 1 || !pilotResult.hrefExact || !pilotResult.relExact || !pilotResult.productNameExact || !pilotResult.contextualRecommendation || !pilotResult.attributionExact || !pilotResult.imageLoaded || !pilotResult.disclosureBeforeCard) failed = true;
  }
  await page.screenshot({ path: new URL(`${name}.png`, outputDirectory).pathname.slice(1), fullPage: false, animations: 'disabled', timeout: 60_000 });
  if (name === 'home-1440') {
    const componentShots = [['latest-guides', '.article-grid--featured'], ['categories-3d', '.category-index']];
    for (const [shotName, selector] of componentShots) {
      const component = page.locator(selector);
      await component.scrollIntoViewIfNeeded();
      await page.waitForTimeout(350);
      await component.screenshot({ path: new URL(`${shotName}.png`, outputDirectory).pathname.slice(1), animations: 'disabled', timeout: 60_000 });
    }
  }
  const overflow = layout.scrollWidth > layout.clientWidth + 1;
  if (overflow || consoleErrors.length) failed = true;
  console.log(JSON.stringify({ name, viewport: `${width}x${height}`, overflow, ...layout, consoleErrors, pilotResult }));
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
const emptySearchStatus = await interactionPage.locator('[data-search-status]').textContent();
const interactionResult = { menuAriaHiddenAfterOpen, searchResultsForF30, emptySearchStatus, pageErrors: interactionErrors };
console.log(JSON.stringify({ name: 'mobile-interactions', ...interactionResult }));
if (menuAriaHiddenAfterOpen !== 'false' || searchResultsForF30 !== 0 || !emptySearchStatus?.startsWith('No exact match.') || interactionErrors.length) failed = true;
await interactionContext.close();

await browser.close();
if (failed) process.exitCode = 1;
