import { chromium } from 'playwright-core';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const baseUrl = process.env.QA_BASE_URL || 'http://127.0.0.1:4321';
const executablePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outputDirectory = new URL('../qa/affiliate-rollout/', import.meta.url);
const mappings = JSON.parse(await readFile(new URL('../src/affiliate/article-mappings.generated.json', import.meta.url), 'utf8'));
const slugs = Object.keys(mappings).sort();
const formerlyHold = new Set([
  'bmw-frm-module-diagnostic-tool', 'bmw-icom-vs-enet', 'bmw-icom-vs-k-dcan',
  'bmw-transfer-case-adaptation-reset-tool', 'ista-vs-bimmerlink', 'k-dcan-vs-enet-cable',
  'obdlink-ex-vs-enet-cable', 'protool-pricing', 'protool-vs-ista'
]);
const representative = new Set([...formerlyHold, 'carly-vs-foxwell-nt530', 'obdlink-cx-vs-mx-plus', 'bimmerlink-adapter', 'bimmercode-pricing', 'obd-app-vs-handheld-scanner']);
const widths = [320, 390, 768, 1440];
const viewportHeight = (width) => (width <= 480 ? 720 : width <= 820 ? 1024 : 900);
const results = [];
let failed = false;

await mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch({ executablePath, headless: true });
for (const width of widths) {
  const context = await browser.newContext({ viewport: { width, height: viewportHeight(width) }, deviceScaleFactor: 1 });
  for (const slug of slugs) {
    const page = await context.newPage();
    const consoleErrors = [];
    page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    page.on('pageerror', (error) => consoleErrors.push(error.message));
    await page.goto(baseUrl + '/guides/' + slug + '/', { waitUntil: 'networkidle' });
    const check = await page.evaluate(() => {
      const documentWidth = document.documentElement.clientWidth;
      const units = [...document.querySelectorAll('[data-affiliate-unit]')];
      const links = [...document.querySelectorAll('a[data-affiliate-link]')];
      // Product cards carry an image; the restrained inline/text CTA is image-free by design.
      const cardUnits = units.filter((unit) => unit.querySelector('img'));
      const inlineUnits = units.filter((unit) => unit.classList.contains('affiliate-inline-cta'));
      const images = cardUnits.map((unit) => unit.querySelector('img'));
      const firstLink = links[0];
      const disclosure = document.querySelector('.affiliate-disclosure');
      const offenders = [...document.querySelectorAll('body *')].flatMap((element) => {
        const style = getComputedStyle(element);
        if (style.position === 'fixed' || style.visibility === 'hidden' || style.display === 'none') return [];
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && (rect.right > documentWidth + 1 || rect.left < -1)
          ? [{ tag: element.tagName.toLowerCase(), className: String(element.className).slice(0, 80), left: Math.round(rect.left), right: Math.round(rect.right) }]
          : [];
      }).slice(0, 8);
      return {
        units: units.length,
        cardUnits: cardUnits.length,
        inlineUnits: inlineUnits.length,
        links: links.length,
        allImagesLoaded: images.length > 0 && images.every((image) => image && image.complete && image.naturalWidth > 0 && Boolean(image.alt)),
        inlineCtasHaveLink: inlineUnits.every((unit) => unit.querySelector('a[data-affiliate-link]')),
        allRelExact: links.length > 0 && links.every((link) => link.getAttribute('rel') === 'sponsored nofollow noopener' && link.getAttribute('target') === '_blank'),
        disclosureBeforeLink: Boolean(disclosure && firstLink && (disclosure.compareDocumentPosition(firstLink) & Node.DOCUMENT_POSITION_FOLLOWING)),
        overflow: document.documentElement.scrollWidth > documentWidth + 1,
        offenders
      };
    });
    const passed = check.units >= 1 && check.links >= 1 && check.allImagesLoaded && check.inlineCtasHaveLink && check.allRelExact && check.disclosureBeforeLink && !check.overflow && consoleErrors.length === 0;
    if (!passed) failed = true;
    const result = { slug, width, passed, ...check, consoleErrors };
    results.push(result);
    if (representative.has(slug)) {
      await page.locator('[data-affiliate-unit]').first().scrollIntoViewIfNeeded();
      await page.waitForTimeout(150);
      await page.screenshot({ path: fileURLToPath(new URL(slug + '-' + width + '.png', outputDirectory)), fullPage: false, animations: 'disabled', timeout: 60_000 });
    }
    await page.close();
  }
  await context.close();
}
await browser.close();
const summary = {
  pages: slugs.length,
  viewports: widths,
  checks: results.length,
  passed: results.filter((result) => result.passed).length,
  failed: results.filter((result) => !result.passed).length,
  screenshotPages: [...representative].sort(),
  screenshots: representative.size * widths.length,
  formerHoldPagesCovered: [...formerlyHold].every((slug) => results.some((result) => result.slug === slug && result.passed))
};
await writeFile(new URL('visual-qa-results.json', outputDirectory), JSON.stringify({ summary, results }, null, 2) + '\n');
console.log(JSON.stringify(summary));
if (failed) process.exitCode = 1;
