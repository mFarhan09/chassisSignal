import { chromium } from 'playwright-core';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { getPlacementPlan, selectRenderedPlacements } from '../src/affiliate/placement-plan.ts';

const baseUrl = process.env.QA_BASE_URL || 'http://127.0.0.1:4321';
const executablePath = process.env.CHROME_PATH || '/opt/pw-browsers/chromium';
const outputDirectory = new URL('../qa/affiliate-rollout/', import.meta.url);
const mappings = JSON.parse(await readFile(new URL('../src/affiliate/article-mappings.generated.json', import.meta.url), 'utf8'));
const slugs = Object.keys(mappings).sort();
// The five guides monetized by the 2026-09-25 portfolio policy change: always screenshotted.
const formerlyUnmonetized = new Set([
  'bmw-parking-sensor-diagnostic-tool', 'icarsoft-bmm-v3-vs-foxwell-nt530',
  'obdlink-cx-vs-unicarscan-ucsi-2100', 'foxwell-nt710-vs-autel-mk900-bmw',
  'autel-mk900-bmw-compatibility'
]);
// One of each article architecture, plus the guides whose mapping changed shape.
const representative = new Set([
  ...formerlyUnmonetized,
  'mini-diagnostic-app',                 // short article (two placements)
  'bimmercode-vs-carly',                 // long article (three placements)
  'obdlink-cx-vs-mx-plus',               // comparison article
  'bmw-f-series-vs-g-series-obd-adapter',// compatibility article
  'bmw-scanner-abs-airbag-codes',        // scanner guide
  'bimmerlink-adapter',                  // alternative-bearing article
  // 2026-09-26 batch: exact product + labelled alternative on one comparison card.
  'foxwell-nt710-vs-nt809bt-bmw',
  'launch-x431-pro-elite-vs-foxwell-nt710-bmw'
]);
const widths = [375, 390, 430, 768, 1024, 1440];
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
    // Third-party resource failures (e.g. the Google Fonts stylesheet blocked by a sandboxed
    // TLS-intercepting proxy) are environment noise, not page defects. They are recorded
    // separately and reported, but only FIRST-PARTY errors fail the check.
    const externalResourceFailures = [];
    page.on('requestfailed', (request) => {
      const url = request.url();
      if (!url.startsWith(baseUrl)) externalResourceFailures.push(`${url.slice(0, 120)} ${request.failure()?.errorText ?? ''}`.trim());
    });
    page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    page.on('pageerror', (error) => consoleErrors.push(error.message));
    await page.goto(baseUrl + '/guides/' + slug + '/', { waitUntil: 'load' });
    // Affiliate cards sit below the fold and use loading="lazy", so their images never load in a
    // headless viewport. Force those images to load eagerly, then wait (bounded) for them to
    // finish before asserting. This deterministically validates the image resource without
    // depending on scroll timing; a genuinely broken image still fails allImagesLoaded.
    await page.evaluate(() => {
      for (const image of document.querySelectorAll('[data-affiliate-unit] img')) {
        image.loading = 'eager';
        if (!image.complete) { const src = image.src; image.src = ''; image.src = src; }
      }
    });
    await page.waitForFunction(
      () => [...document.querySelectorAll('[data-affiliate-unit] img')].every((image) => image.complete && image.naturalWidth > 0),
      null,
      { timeout: 15_000 },
    ).catch(() => {});
    const check = await page.evaluate((expected) => {
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
      const firstHeading = document.querySelector('article.prose > h2');
      const firstUnit = units[0];
      const afterEditorialHeading = Boolean(firstHeading && firstUnit
        && (firstHeading.compareDocumentPosition(firstUnit) & Node.DOCUMENT_POSITION_FOLLOWING));
      const renderedKeys = links.map((link) => link.dataset.productKey).sort();

      return {
        units: units.length,
        cardUnits: cardUnits.length,
        inlineUnits: inlineUnits.length,
        links: links.length,
        matchesExpectedProducts: units.length === expected.length
          && JSON.stringify(renderedKeys) === JSON.stringify(expected) && new Set(renderedKeys).size === renderedKeys.length,
        afterEditorialHeading,
        disclosureCount: document.querySelectorAll('.affiliate-disclosure').length,
        allImagesLoaded: images.length > 0 && images.every((image) => image && image.complete && image.naturalWidth > 0 && Boolean(image.alt)),
        inlineCtasHaveLink: inlineUnits.every((unit) => unit.querySelector('a[data-affiliate-link]')),
        allRelExact: links.length > 0 && links.every((link) => link.getAttribute('rel') === 'sponsored nofollow noopener' && link.getAttribute('target') === '_blank'),
        disclosureBeforeLink: Boolean(disclosure && firstLink && (disclosure.compareDocumentPosition(firstLink) & Node.DOCUMENT_POSITION_FOLLOWING)),
        overflow: document.documentElement.scrollWidth > documentWidth + 1,
        offenders
      };
    }, selectRenderedPlacements(getPlacementPlan(slug)).flatMap((placement) => placement.productKeys).sort());
    // A generic "failed to load resource" console line that pairs with a third-party request
    // failure is sandbox noise; everything else is a genuine first-party page error.
    const pageErrors = consoleErrors.filter((text) =>
      !(externalResourceFailures.length > 0 && /Failed to load resource/i.test(text)));
    const hasPlacements = check.units > 0;
    const affiliatePassed = hasPlacements
      ? check.allImagesLoaded && check.inlineCtasHaveLink && check.allRelExact && check.disclosureBeforeLink
        && check.disclosureCount === 1 && check.afterEditorialHeading
      : check.disclosureCount === 0;
    const passed = check.matchesExpectedProducts && affiliatePassed && !check.overflow && pageErrors.length === 0;
    if (!passed) failed = true;
    const result = { slug, width, passed, ...check, consoleErrors: pageErrors, externalResourceFailures };
    results.push(result);
    if (representative.has(slug)) {
      if (hasPlacements) await page.locator('[data-affiliate-unit]').first().scrollIntoViewIfNeeded();
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
  formerlyUnmonetizedPagesCovered: [...formerlyUnmonetized].every((slug) => results.some((result) => result.slug === slug && result.passed)),
  pagesWithZeroUnits: [...new Set(results.filter((result) => result.units === 0).map((result) => result.slug))],
  editorialPlacementFailures: [...new Set(results.filter((result) => result.units > 0 && !result.afterEditorialHeading).map((result) => result.slug))],
  externalResourceFailureCount: results.filter((result) => result.externalResourceFailures.length).length,
  overflowFailures: [...new Set(results.filter((result) => result.overflow).map((result) => result.slug))],
  disclosureFailures: [...new Set(results.filter((result) => result.disclosureCount !== (result.units ? 1 : 0)).map((result) => result.slug))]
};
await writeFile(new URL('visual-qa-results.json', outputDirectory), JSON.stringify({ summary, results }, null, 2) + '\n');
console.log(JSON.stringify(summary));
if (failed) process.exitCode = 1;
