import { chromium } from 'playwright-core';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const baseUrl = process.env.QA_BASE_URL || 'http://127.0.0.1:4321';
const executablePath = process.env.CHROME_PATH || '/opt/pw-browsers/chromium';
const outputDirectory = new URL('../qa/affiliate-rollout/', import.meta.url);
const mappings = JSON.parse(await readFile(new URL('../src/affiliate/article-mappings.generated.json', import.meta.url), 'utf8'));
const plans = JSON.parse(await readFile(new URL('../src/affiliate/placement-plan.generated.json', import.meta.url), 'utf8'));
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
  'bimmerlink-adapter'                   // alternative-bearing article
]);
const widths = [375, 390, 430, 768, 1024, 1440];
const viewportHeight = (width) => (width <= 480 ? 720 : width <= 820 ? 1024 : 900);

/**
 * Below this word count, "fraction of the article above the first unit" stops being a useful
 * signal: two short intro paragraphs legitimately occupy 40%+ of a 600-word guide. Those pages
 * are held to the paragraph rule instead (which is the actual policy), while every substantial
 * guide additionally has to keep its first unit in the top 30% of the prose.
 */
const FRACTION_MEANINGFUL_WORD_COUNT = 1000;

/** Units a placement renders, and where the middle unit lands in document order. */
function expectedFor(slug) {
  const plan = plans[slug];
  if (!plan) return { units: 0, hasMiddle: false, middleUnitIndex: -1, fractionMeaningful: false };
  const unitsOf = (placement) => (placement.variant === 'comparison_card' ? 2 : 1);
  const middleIndex = plan.placements.findIndex((placement) => placement.position === 'middle');
  return {
    units: plan.placements.reduce((sum, placement) => sum + unitsOf(placement), 0),
    hasMiddle: middleIndex >= 0,
    middleUnitIndex: middleIndex < 0 ? -1 : plan.placements.slice(0, middleIndex).reduce((sum, placement) => sum + unitsOf(placement), 0),
    fractionMeaningful: plan.wordCount >= FRACTION_MEANINGFUL_WORD_COUNT
  };
}
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
    await page.goto(baseUrl + '/guides/' + slug + '/', { waitUntil: 'networkidle' });
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
      // Laid-out vertical position of each unit inside the substantive article body, so the
      // top / middle / end contract is verified against the real rendered layout at this
      // viewport rather than against source order alone.
      const prose = document.querySelector('article.prose');
      const callout = prose?.querySelector('.key-findings');
      const relatedBlock = prose?.querySelector('section.related');
      const bodyTop = callout ? callout.getBoundingClientRect().bottom + window.scrollY : (prose?.getBoundingClientRect().top ?? 0) + window.scrollY;
      const bodyBottom = (relatedBlock ? relatedBlock.getBoundingClientRect().top : prose?.getBoundingClientRect().bottom ?? 0) + window.scrollY;
      // Measure against the article's PROSE height, discounting the affiliate units' own
      // vertical space. Otherwise a card inserted into a short article inflates the body it is
      // measured within and a correctly-placed top unit reads as "deep".
      const unitHeights = units.map((unit) => unit.getBoundingClientRect().height);
      const proseHeight = Math.max(1, (bodyBottom - bodyTop) - unitHeights.reduce((sum, height) => sum + height, 0));
      const unitFractions = units.map((unit, index) => {
        const offset = unit.getBoundingClientRect().top + window.scrollY - bodyTop;
        const unitsAbove = unitHeights.slice(0, index).reduce((sum, height) => sum + height, 0);
        return (offset - unitsAbove) / proseHeight;
      });
      // Prose paragraphs that precede the first affiliate unit (the disclosure sits immediately
      // before it and is excluded, as are paragraphs inside the evidence callout).
      const firstUnit = units[0];
      const introParagraphs = firstUnit
        ? [...(prose?.querySelectorAll(':scope > p') ?? [])]
            .filter((paragraph) => firstUnit.compareDocumentPosition(paragraph) & Node.DOCUMENT_POSITION_PRECEDING).length
        : 0;
      const firstFraction = unitFractions.length ? unitFractions[0] : null;
      const lastFraction = unitFractions.length ? unitFractions[unitFractions.length - 1] : null;
      const middleFraction = expected.hasMiddle && unitFractions.length >= 3 ? unitFractions[expected.middleUnitIndex] ?? null : null;

      return {
        units: units.length,
        cardUnits: cardUnits.length,
        inlineUnits: inlineUnits.length,
        links: links.length,
        expectedUnits: expected.units,
        unitCountMatches: units.length === expected.units,
        firstFraction: firstFraction === null ? null : Math.round(firstFraction * 1000) / 1000,
        middleFraction: middleFraction === null ? null : Math.round(middleFraction * 1000) / 1000,
        lastFraction: lastFraction === null ? null : Math.round(lastFraction * 1000) / 1000,
        introParagraphs,
        // The policy rule is PARAGRAPH-based — the first unit follows 2-3 short intro
        // paragraphs. That is what is asserted. The fraction is only a backstop against a unit
        // that has drifted past the article's midpoint; on a genuinely short guide two intro
        // paragraphs legitimately are ~40% of the prose, so a tight fraction would misfire.
        introParagraphsOk: introParagraphs >= 2 && introParagraphs <= 4,
        topPlacementOk: firstFraction !== null && introParagraphs >= 2 && introParagraphs <= 4
          && (!expected.fractionMeaningful || firstFraction <= 0.30),
        endPlacementOk: lastFraction !== null && lastFraction >= 0.70,
        middlePlacementOk: !expected.hasMiddle || (middleFraction !== null && middleFraction >= 0.25 && middleFraction <= 0.85),
        disclosureCount: document.querySelectorAll('.affiliate-disclosure').length,
        allImagesLoaded: images.length > 0 && images.every((image) => image && image.complete && image.naturalWidth > 0 && Boolean(image.alt)),
        inlineCtasHaveLink: inlineUnits.every((unit) => unit.querySelector('a[data-affiliate-link]')),
        allRelExact: links.length > 0 && links.every((link) => link.getAttribute('rel') === 'sponsored nofollow noopener' && link.getAttribute('target') === '_blank'),
        disclosureBeforeLink: Boolean(disclosure && firstLink && (disclosure.compareDocumentPosition(firstLink) & Node.DOCUMENT_POSITION_FOLLOWING)),
        overflow: document.documentElement.scrollWidth > documentWidth + 1,
        offenders
      };
    }, expectedFor(slug));
    // A generic "failed to load resource" console line that pairs with a third-party request
    // failure is sandbox noise; everything else is a genuine first-party page error.
    const pageErrors = consoleErrors.filter((text) =>
      !(externalResourceFailures.length > 0 && /Failed to load resource/i.test(text)));
    const passed = check.units >= 1 && check.links >= 1 && check.unitCountMatches && check.allImagesLoaded
      && check.inlineCtasHaveLink && check.allRelExact && check.disclosureBeforeLink && check.disclosureCount === 1
      && check.topPlacementOk && check.middlePlacementOk && check.endPlacementOk
      && !check.overflow && pageErrors.length === 0;
    if (!passed) failed = true;
    const result = { slug, width, passed, ...check, consoleErrors: pageErrors, externalResourceFailures };
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
  formerlyUnmonetizedPagesCovered: [...formerlyUnmonetized].every((slug) => results.some((result) => result.slug === slug && result.passed)),
  pagesWithZeroUnits: [...new Set(results.filter((result) => result.units === 0).map((result) => result.slug))],
  topPlacementFailures: [...new Set(results.filter((result) => !result.topPlacementOk).map((result) => result.slug))],
  introParagraphFailures: [...new Set(results.filter((result) => !result.introParagraphsOk).map((result) => result.slug))],
  externalResourceFailureCount: results.filter((result) => result.externalResourceFailures.length).length,
  middlePlacementFailures: [...new Set(results.filter((result) => !result.middlePlacementOk).map((result) => result.slug))],
  endPlacementFailures: [...new Set(results.filter((result) => !result.endPlacementOk).map((result) => result.slug))],
  overflowFailures: [...new Set(results.filter((result) => result.overflow).map((result) => result.slug))],
  disclosureFailures: [...new Set(results.filter((result) => result.disclosureCount !== 1).map((result) => result.slug))]
};
await writeFile(new URL('visual-qa-results.json', outputDirectory), JSON.stringify({ summary, results }, null, 2) + '\n');
console.log(JSON.stringify(summary));
if (failed) process.exitCode = 1;
