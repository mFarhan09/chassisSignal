import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import test from 'node:test';
import { affiliateConfig } from '../src/affiliate/config.ts';
import { editorialMappingOverrides } from '../src/affiliate/editorial-mapping-overrides.ts';
import { productVerificationOverrides } from '../src/affiliate/product-verification-overrides.ts';
import { suppliedSiteStripeInventory } from '../src/affiliate/supplied-sitestripe-inventory.ts';
import { getProductRenderState } from '../src/affiliate/render-policy.ts';
import { validateSpecialLink } from '../src/affiliate/validator.ts';
import { findRawAmazonUrls, scanEligibleGuides } from '../scripts/lib/affiliate-inventory.mjs';
import { parseCsvRecords } from '../scripts/lib/csv.mjs';
import { placementPlans, validatePlacementPlans, planSummary, MAX_PLACEMENTS_PER_ARTICLE } from '../src/affiliate/placement-plan.ts';
import { resolveFirstPlacementOffset } from '../src/affiliate/first-placement.ts';

const root = process.cwd();
const registry = JSON.parse(await readFile(join(root, 'src/affiliate/product-registry.generated.json'), 'utf8'));
const mappings = JSON.parse(await readFile(join(root, 'src/affiliate/article-mappings.generated.json'), 'utf8'));
const articles = await scanEligibleGuides();
const mapped = Object.values(mappings);
// Post-batch (CS-081..087 added): some published guides are intentionally unmonetized (no defensible
// product) or link-verified-but-image-pending (recorded, not yet live). Renderable invariants apply to
// APPROVED mappings only; the verification queues legitimately also list candidate-referenced keys.
const UNMONETIZED_GUIDES = new Set([
  'bmw-parking-sensor-diagnostic-tool',   // CS-087: no defensible product (intentional)
  'icarsoft-bmm-v3-vs-foxwell-nt530',     // CS-081: SiteStripe links verified, product images pending
  'obdlink-cx-vs-unicarscan-ucsi-2100',   // CS-084: SiteStripe links verified, product images pending
  'foxwell-nt710-vs-autel-mk900-bmw',     // no exact BMW-software NT710 or base wired MK900 listing closes
  'autel-mk900-bmw-compatibility'         // no exact base wired MK900 listing closes; MX900 substitution declined
]);
const approvedMapped = mapped.filter((mapping) => mapping.mappingStatus === 'approved');
const actionableKeys = [...new Set(approvedMapped.flatMap((mapping) => [...mapping.primaryProductKeys, ...mapping.alternativeProductKeys]))].sort();

test('67 published guides mapped; 62 approved non-HOLD (5 intentionally unmonetized)', () => {
  assert.equal(articles.length, 67);
  assert.equal(mapped.length, 67);
  assert.equal(Object.keys(editorialMappingOverrides).length, 67);
  assert.equal(approvedMapped.length, 62);
  for (const article of articles) {
    const mapping = mappings[article.slug];
    assert.ok(mapping, article.slug);
    assert.notEqual(mapping.editorialDecision, 'HOLD', article.slug);
    if (UNMONETIZED_GUIDES.has(article.slug)) {
      assert.notEqual(mapping.mappingStatus, 'approved', article.slug);
      continue;
    }
    assert.equal(mapping.mappingStatus, 'approved', article.slug);
    assert.equal(mapping.approvalStatus, 'approved', article.slug);
    assert.ok(mapping.primaryProductKeys.length >= 1 && mapping.primaryProductKeys.length <= 2, article.slug);
    assert.ok(mapping.relationshipLabel && mapping.recommendationRationale && mapping.officialEvidenceUrl, article.slug);
  }
});

test('all approved mappings resolve to live image-bearing affiliate links', () => {
  for (const mapping of approvedMapped) for (const key of mapping.primaryProductKeys) {
    const state = getProductRenderState(registry[key], mapping, 'live', false);
    assert.equal(state.visible && state.clickable && state.showImage, true, mapping.articleSlug + ': ' + key);
  }
});

test('both verification queues exactly match the 20 renderable keys', async () => {
  assert.equal(actionableKeys.length, 20);
  const link = parseCsvRecords(await readFile(join(root, 'reports/affiliate/link-verification-queue.csv'), 'utf8'));
  const image = parseCsvRecords(await readFile(join(root, 'reports/affiliate/image-rights-queue.csv'), 'utf8'));
  assert.deepEqual(link.map((row) => row.productKey).sort(), actionableKeys);
  assert.deepEqual(image.map((row) => row.productKey).sort(), actionableKeys);
});

test('mapped links have exact tag, product path and matching ASIN', () => {
  for (const key of actionableKeys) {
    const product = registry[key];
    assert.equal(validateSpecialLink(product).valid, true, key);
    const url = new URL(product.specialLink);
    assert.deepEqual(url.searchParams.getAll('tag'), [affiliateConfig.expectedTrackingId], key);
    assert.equal(url.pathname.match(/\/dp\/([A-Z0-9]{10})(?:[/?]|$)/i)?.[1].toUpperCase(), product.asin, key);
  }
});

test('all supplied URLs are byte-identical and OBDLink CX is preserved', async () => {
  assert.equal(Object.keys(suppliedSiteStripeInventory).length, 24);
  for (const [key, supplied] of Object.entries(suppliedSiteStripeInventory)) {
    assert.equal(registry[key].specialLink, supplied.specialLink, key);
    assert.equal(registry[key].asin, supplied.asin, key);
    assert.equal(registry[key].verifiedBy, 'Muhammad Farhan', key);
  }
  const cx = registry['obdlink-cx'];
  assert.equal(cx.specialLink, productVerificationOverrides['obdlink-cx'].specialLink);
  assert.equal(cx.asin, 'B08NFLL3NT');
  assert.equal(cx.verifiedAt, '2026-09-12T11:16:39.927Z');
  const bytes = await readFile(join(root, 'public/images/products/obdlink-cx-official.jpg'));
  assert.equal(createHash('sha256').update(bytes).digest('hex').toUpperCase(), '71D0D17DD3027118E4F5B3FB35CB79A4F45DC04B50B2FE9607D019D2E2FA04D6');
});

test('every actionable image is local, present, attributed and hash-verified', async () => {
  for (const key of actionableKeys) {
    const product = registry[key];
    assert.match(product.imagePathOrUrl, /^\/images\/products\//, key);
    assert.doesNotMatch(product.imageRightsSource, /amazon\./i, key);
    assert.ok(product.imageAlt && product.imageAttribution && product.imageReviewedBy, key);
    assert.ok(['manufacturer_attributed_editorial', 'site_owned', 'verified'].includes(product.imageRightsStatus), key);
    const bytes = await readFile(join(root, 'public', product.imagePathOrUrl));
    assert.equal(createHash('sha256').update(bytes).digest('hex').toUpperCase(), product.imageSha256, key);
  }
});

test('alternative and supporting-equipment mappings are visibly labelled', () => {
  for (const mapping of mapped) {
    if (['available_alternative', 'workshop_alternative'].includes(mapping.affiliateRelationship)) assert.match(mapping.relationshipLabel, /alternative|available/i, mapping.articleSlug);
    if (mapping.affiliateRelationship === 'supporting_equipment') assert.match(mapping.relationshipLabel, /supporting equipment/i, mapping.articleSlug);
  }
});

test('rejected products and raw article Amazon links are absent', async () => {
  const restricted = new Set(['bmw-enet-cable', 'k-dcan-cable', 'bmw-icom-next', 'bimmergeeks-bluetooth-adapter', 'bimmergeeks-expert-k-dcan']);
  for (const key of actionableKeys) assert.equal(restricted.has(key), false, key);
  for (const product of Object.values(registry)) {
    assert.notEqual(product.asin, 'B0CDGH4WFH');
    assert.notEqual(product.asin, 'B0GX17T6Z2');
    assert.doesNotMatch(product.specialLink ?? '', /node=51812349011/);
  }
  for (const article of articles) {
    const source = await readFile(join(root, article.filePath), 'utf8');
    assert.deepEqual(findRawAmazonUrls(source), [], article.slug);
  }
});

test('card markup binds identity and safe affiliate attributes without commerce claims', async () => {
  const link = await readFile(join(root, 'src/components/AffiliateLink.astro'), 'utf8');
  const card = await readFile(join(root, 'src/components/affiliate/ProductCard.astro'), 'utf8');
  const page = await readFile(join(root, 'src/components/ArticlePage.astro'), 'utf8');
  assert.match(link, /target="_blank"/);
  assert.match(link, /rel="sponsored nofollow noopener"/);
  assert.match(card, /data-product-key=\{product\.productKey\}/);
  assert.match(card, /data-product-asin=\{product\.asin\}/);
  assert.match(card, /src=\{product\.imagePathOrUrl!\}/);
  assert.match(card, /alt=\{product\.imageAlt/);
  assert.doesNotMatch(card, /buy now|star rating|review count|in stock|price:/i);
  // Disclosure is emitted immediately before the first placement in the distributed render.
  assert.match(page, /part\.first && <AffiliateDisclosure compact \/>[\s\S]*<PlacementRenderer/);
});

test('catalog and final reports preserve all candidates and cover 67 guides', async () => {
  assert.equal(Object.keys(registry).length, 49);
  assert.equal(Object.values(registry).filter((product) => product.specialLink).length, 25);
  const report = await readFile(join(root, 'reports/affiliate/final-affiliate-rollout-report.md'), 'utf8');
  const rows = parseCsvRecords(await readFile(join(root, 'reports/affiliate/final-affiliate-coverage.csv'), 'utf8'));
  assert.equal(rows.length, 67);
  for (const article of articles) {
    assert.ok(rows.find((row) => row.slug === article.slug), article.slug);
    assert.ok(report.includes(String.fromCharCode(96) + article.slug + String.fromCharCode(96)), article.slug);
  }
  assert.match(report, /Remaining HOLD articles: 0/);
});

test('placement density plan is valid, distributed and capped', () => {
  assert.deepEqual(validatePlacementPlans(placementPlans, mappings, registry), []);
  let two = 0, three = 0, exc = 0;
  for (const article of articles) {
    if (mappings[article.slug].mappingStatus !== 'approved') { assert.equal(placementPlans[article.slug], undefined, article.slug); continue; }
    const plan = placementPlans[article.slug];
    assert.ok(plan, article.slug);
    assert.ok(plan.placements.length >= 1 && plan.placements.length <= MAX_PLACEMENTS_PER_ARTICLE, article.slug);
    if (plan.classification === 'TWO_PLACEMENTS') two++;
    else if (plan.classification === 'THREE_PLACEMENTS') three++;
    else exc++;
  }
  assert.equal(two + three + exc, 62);
  // Corrected model: TWO is the normal state; THREE for comparison/alternative articles; exceptions rare.
  assert.ok(two >= 40, `expected mostly two-placement articles, got ${two}`);
  assert.ok(three >= 10, `expected several three-placement articles, got ${three}`);
  const s = planSummary(placementPlans);
  assert.equal(s.totalPlacements, two * 2 + three * 3 + exc);
});

test('every planned placement is approved, verified-linkable, distributed and non-repetitive', () => {
  const seenContext = new Set();
  for (const [slug, plan] of Object.entries(placementPlans)) {
    const mapping = mappings[slug];
    const approved = new Set([...mapping.primaryProductKeys, ...mapping.alternativeProductKeys]);
    const anchors = plan.placements.map((p) => p.anchorIndex);
    // distinct section anchors, spread across the article (not all at the end)
    assert.equal(new Set(anchors).size, anchors.length, `${slug}: duplicate anchors`);
    if (anchors.length >= 2) assert.notEqual(Math.min(...anchors), Math.max(...anchors), `${slug}: clustered`);
    for (const placement of plan.placements) {
      assert.equal(placement.variant === 'comparison_card' ? 2 : 1, placement.productKeys.length, `${slug}: ${placement.variant} product count`);
      for (const key of placement.productKeys) {
        assert.ok(approved.has(key), `${slug}: ${key} approved`);
        assert.equal(validateSpecialLink(registry[key]).valid, true, `${slug}: ${key} linkable`);
      }
      if (placement.variant === 'compact_cta' || placement.variant === 'final_cta') {
        assert.ok(placement.context && placement.context.trim().length >= 30, `${slug}: contextual copy`);
        assert.ok(!seenContext.has(placement.context), `${slug}: duplicate contextual copy`);
        seenContext.add(placement.context);
      }
    }
  }
});

test('placement validator actually fails on broken plans (mutation tests)', () => {
  const slug = Object.keys(placementPlans).find((s) => placementPlans[s].classification === 'THREE_PLACEMENTS');
  const base = placementPlans[slug];
  const clone = () => JSON.parse(JSON.stringify(base));
  const codes = (plan) => new Set(validatePlacementPlans({ [slug]: plan }, mappings, registry).map((e) => e.code));
  // 1. all placements clustered at the same section
  const clustered = clone(); clustered.placements.forEach((p) => { p.anchorIndex = 5; });
  assert.ok(codes(clustered).has('ALL_PLACEMENTS_AT_END') || codes(clustered).has('DUPLICATE_ANCHOR'));
  // 2. over the cap (four placements)
  const over = clone(); over.placements.push({ ...over.placements[0], anchorIndex: 99 }); over.classification = 'THREE_PLACEMENTS';
  assert.ok(codes(over).has('PLACEMENT_COUNT_EXCEEDED'));
  // 3. unapproved product
  const bad = clone(); bad.placements[0].productKeys = ['foxwell-nt530']; bad.placements[0].variant = 'product_card';
  assert.ok(codes(bad).has('PRODUCT_NOT_APPROVED') || codes(bad).has('LINK_INVALID'));
  // 4. duplicate contextual copy across two CTAs
  const dup = clone();
  const ctas = dup.placements.filter((p) => p.variant === 'compact_cta' || p.variant === 'final_cta');
  if (ctas.length >= 2) { ctas[1].context = ctas[0].context; assert.ok(codes(dup).has('DUPLICATE_CONTEXT')); }
  // 5. classification/count mismatch
  const mism = clone(); mism.classification = 'TWO_PLACEMENTS';
  assert.ok(codes(mism).has('CLASSIFICATION_MISMATCH'));
});

test('first placement surfaces after ~2 intro prose paragraphs (early, safe, never later)', () => {
  const SECTION = 100000; // an intentionally deep original section boundary
  // Long intro of plain paragraphs: land just after the 2nd paragraph.
  const plain = '<p>One.</p>\n<p>Two.</p>\n<p>Three.</p>\n<h2>S</h2><p>x</p>';
  const plainAt = resolveFirstPlacementOffset(plain, SECTION);
  assert.equal(plain.slice(0, plainAt), '<p>One.</p>\n<p>Two.</p>');
  // Paragraphs nested inside a blockquote/figure/list are skipped, never counted or split.
  const nested = '<blockquote><p>Q1.</p><p>Q2.</p></blockquote>\n<p>Real one.</p>\n<p>Real two.</p>\n<h2>S</h2>';
  const nestedAt = resolveFirstPlacementOffset(nested, SECTION);
  assert.ok(nestedAt > nested.indexOf('</blockquote>'), 'must not split the blockquote');
  assert.equal(nested.slice(0, nestedAt).endsWith('<p>Real two.</p>'), true);
  // Counting crosses a leading heading (intro-less articles) but never counts the heading itself.
  const leadingH2 = '<h2>Direct answer</h2>\n<p>A.</p>\n<p>B.</p>\n<p>C.</p>';
  const leadingAt = resolveFirstPlacementOffset(leadingH2, SECTION);
  assert.equal(leadingH2.slice(0, leadingAt), '<h2>Direct answer</h2>\n<p>A.</p>\n<p>B.</p>');
  // The result is always earlier than the original section boundary (never later).
  assert.ok(plainAt < SECTION && nestedAt < SECTION && leadingAt < SECTION);
});

test('first-placement resolver falls back safely and is bounded (adversarial)', () => {
  // No leading prose at all (opens on a table/list) -> null, caller keeps section position.
  assert.equal(resolveFirstPlacementOffset('<table><tr><td>x</td></tr></table><h2>S</h2>', 100000), null);
  assert.equal(resolveFirstPlacementOffset('<ul><li>a</li></ul>', 100000), null);
  // Only one paragraph available before the section -> after that single paragraph, still early.
  const one = '<p>Solo intro.</p><h2>S</h2><p>later</p>';
  assert.equal(resolveFirstPlacementOffset(one, one.indexOf('<h2')), '<p>Solo intro.</p>'.length);
  // A tiny section budget that precedes the 2nd paragraph must never return past it.
  const budget = '<p>One.</p><p>Two.</p>';
  const tight = resolveFirstPlacementOffset(budget, '<p>One.</p>'.length + 3);
  assert.ok(tight === null || tight <= '<p>One.</p>'.length + 3, 'must respect the section budget');
  // Malformed / unmatched markup must not throw and must not fabricate a boundary past a real paragraph.
  assert.doesNotThrow(() => resolveFirstPlacementOffset('<p>Good.</p><div><span>unclosed', 100000));
});

test('disclosure precedes every affiliate unit in the distributed render', async () => {
  const page = await readFile(join(root, 'src/components/ArticlePage.astro'), 'utf8');
  // In the segmented render, the disclosure is emitted immediately before the first placement.
  assert.match(page, /part\.first && <AffiliateDisclosure compact \/>/);
  assert.match(page, /<PlacementRenderer placement=\{part\.placement\}/);
  // Placements attach inside the content flow (segments), not only after all content.
  assert.match(page, /contentSegments/);
});
