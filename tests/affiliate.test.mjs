import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import test from 'node:test';
import { affiliateConfig } from '../src/affiliate/config.ts';
import { editorialMappingOverrides } from '../src/affiliate/editorial-mapping-overrides.ts';
import { productVerificationOverrides } from '../src/affiliate/product-verification-overrides.ts';
import { getProductRenderState } from '../src/affiliate/render-policy.ts';
import { validateSpecialLink } from '../src/affiliate/validator.ts';
import { findRawAmazonUrls, scanEligibleGuides } from '../scripts/lib/affiliate-inventory.mjs';
import { placementPlans, isLongArticle, requiredPlacementsFor } from '../src/affiliate/placement-plan.ts';

import { parseCsvRecords } from '../scripts/lib/csv.mjs';
const approvedMapping = {
  articleSlug: 'test-guide', articleIntent: 'Test', monetizationMode: 'exact_product', editorialDecision: 'APPROVE',
  primaryProductKeys: ['test-product'], alternativeProductKeys: [], placementType: 'product_card',
  placementLocation: 'after_evidence_context', recommendationRationale: 'Test rationale.', relatedBuyerGuideSlug: null,
  mappingStatus: 'approved', approvalStatus: 'approved', reviewedAt: '2026-09-12T00:00:00Z', reviewedBy: 'Human reviewer'
};

function product(overrides = {}) {
  return {
    productKey: 'test-product', brand: 'Test', model: 'Model', category: 'Scanner', asin: 'B012345678',
    marketplace: 'amazon.com', specialLink: 'https://www.amazon.com/dp/B012345678?tag=chassissignal-20',
    expectedTrackingId: affiliateConfig.expectedTrackingId, linkSource: 'sitestripe', linkStatus: 'verified',
    verifiedAt: '2026-09-12T00:00:00Z', verifiedBy: 'Human reviewer', manufacturerUrl: null,
    editorialSummary: 'Editorial summary.', compatibilityNotes: 'Verify exact fit.', imageMode: 'none',
    imagePathOrUrl: null, imageRightsSource: null, imageRightsStatus: 'unknown', imageVerifiedAt: null,
    lastProductReviewAt: null, ...overrides
  };
}

test('only an exact-tag, human-verified Special Link is accepted', () => {
  assert.equal(validateSpecialLink(product()).valid, true);
  assert.equal(validateSpecialLink(product({ verifiedAt: null })).valid, false);
  assert.equal(validateSpecialLink(product({ linkStatus: 'pending_verification' })).valid, false);
});

test('wrong, missing and duplicate tags are rejected', () => {
  assert.equal(validateSpecialLink(product({ specialLink: 'https://www.amazon.com/dp/B012345678?tag=fanc093-20' })).valid, false);
  assert.equal(validateSpecialLink(product({ specialLink: 'https://www.amazon.com/dp/B012345678' })).valid, false);
  const duplicate = validateSpecialLink(product({ specialLink: 'https://www.amazon.com/dp/B012345678?tag=chassissignal-20&tag=workstationrelay-20' }));
  assert.ok(duplicate.errors.some((error) => error.code === 'DUPLICATE_TAG'));
});

test('malformed and destination-mismatched ASINs are rejected', () => {
  assert.ok(validateSpecialLink(product({ asin: 'SHORT' })).errors.some((error) => error.code === 'MALFORMED_ASIN'));
  assert.ok(validateSpecialLink(product({ asin: 'B000000000' })).errors.some((error) => error.code === 'ASIN_DESTINATION_MISMATCH'));
});

test('unverified and retired products never render in production', () => {
  assert.equal(getProductRenderState(product({ linkStatus: 'candidate', specialLink: null }), approvedMapping, 'draft', false).visible, false);
  assert.equal(getProductRenderState(product({ linkStatus: 'candidate', specialLink: null }), approvedMapping, 'live', false).clickable, false);
  assert.equal(getProductRenderState(product({ linkStatus: 'retired' }), approvedMapping, 'draft', true).visible, false);
});

test('image provenance gate requires complete rights evidence', () => {
  const missingRights = getProductRenderState(product({ imageMode: 'original', imagePathOrUrl: '/image.jpg' }), approvedMapping, 'live');
  assert.equal(missingRights.showImage, false);
  const approvedRights = getProductRenderState(product({ imageMode: 'original', imagePathOrUrl: '/image.jpg', imageRightsStatus: 'verified', imageRightsSource: 'docs/photo-rights.md', imageVerifiedAt: '2026-09-12T00:00:00Z' }), approvedMapping, 'live');
  assert.equal(approvedRights.showImage, true);
});

test('raw Amazon URLs in article source are detected without a network request', () => {
  assert.deepEqual(findRawAmazonUrls('[listing](https://www.amazon.com/dp/B012345678?tag=wrong-20)'), ['https://www.amazon.com/dp/B012345678?tag=wrong-20']);
  assert.deepEqual(findRawAmazonUrls('[manufacturer](https://example.com/product)'), []);
});

test('affiliate anchor is direct, disclosed and carries required attributes', async () => {
  const anchor = await readFile(join(process.cwd(), 'src', 'components', 'AffiliateLink.astro'), 'utf8');
  const article = await readFile(join(process.cwd(), 'src', 'components', 'ArticlePage.astro'), 'utf8');
  const analytics = await readFile(join(process.cwd(), 'public', 'scripts', 'site.js'), 'utf8');
  assert.match(anchor, /href=\{state\.destination!\}/);
  assert.match(anchor, /rel="sponsored nofollow noopener"/);
  // DISCLOSURE_ERRORS = 0: the article-level disclosure must precede the first affiliate unit.
  // Cards are no longer instantiated directly in ArticlePage.astro (they render through
  // <PlacementRenderer>), so this asserts the disclosure precedes the renderer in BOTH paths:
  // the segmented render (disclosure emitted with the first placement) and the fallback render.
  // Segmented render: the disclosure is emitted with the FIRST placement, immediately before it.
  assert.match(article, /\{part\.first && <AffiliateDisclosure compact \/>\}\s*<PlacementRenderer/);
  // Fallback render (no segmented HTML available): disclosure still precedes the placements.
  assert.match(article, /<AffiliateDisclosure compact \/>\s*\{placementPlan\.placements\.map/);
  assert.ok(
    article.indexOf('<AffiliateDisclosure compact />') < article.indexOf('<PlacementRenderer'),
    'the disclosure must be emitted before the first placement renderer'
  );
  assert.doesNotMatch(analytics, /preventDefault|window\.location|location\.href|\/redirect/);
  assert.match(analytics, /affiliate_click/);
});

test('mobile CSS constrains cards and collapses comparison columns', async () => {
  const css = await readFile(join(process.cwd(), 'src', 'styles', 'affiliate.css'), 'utf8');
  assert.match(css, /max-width:\s*100%/);
  assert.match(css, /@media \(max-width: 640px\)/);
  assert.match(css, /grid-template-columns:\s*minmax\(0, 1fr\)/);
});

test('every eligible guide is represented in mappings and coverage output', async () => {
  const articles = await scanEligibleGuides();
  const mappings = JSON.parse(await readFile(join(process.cwd(), 'src', 'affiliate', 'article-mappings.generated.json'), 'utf8'));
  const coverage = await readFile(join(process.cwd(), 'reports', 'affiliate', 'affiliate-coverage-report.md'), 'utf8');
  assert.equal(Object.keys(mappings).length, articles.length);
  for (const article of articles) assert.ok(mappings[article.slug], article.slug);
  assert.match(coverage, new RegExp(`Eligible guides: ${articles.length}`));
});

test('every published guide is editorially reviewed, monetized and obeys product safeguards', async () => {
  const articles = await scanEligibleGuides();
  const mappings = JSON.parse(await readFile(join(process.cwd(), 'src', 'affiliate', 'article-mappings.generated.json'), 'utf8'));
  const registry = JSON.parse(await readFile(join(process.cwd(), 'src', 'affiliate', 'product-registry.generated.json'), 'utf8'));
  const restricted = new Set(['bmw-enet-cable', 'k-dcan-cable', 'bmw-icom-next', 'bimmergeeks-bluetooth-adapter', 'bimmergeeks-expert-k-dcan']);
  const counts = { APPROVE: 0, CORRECTED: 0, HOLD: 0 };

  // Inventory is DERIVED, not assumed: the review set must track published content exactly.
  assert.equal(Object.keys(editorialMappingOverrides).length, articles.length);
  assert.equal(Object.keys(mappings).length, articles.length);

  for (const article of articles) {
    const mapping = mappings[article.slug];
    assert.ok(mapping, article.slug);
    assert.ok(editorialMappingOverrides[article.slug], article.slug);
    counts[mapping.editorialDecision] += 1;
    // PUBLISHED_GUIDES_WITH_ZERO_LINKS = 0 — the unmonetized-guide exception is retired, so
    // every published guide must map at least one product and may never sit in the old
    // no_defensible_product / HOLD publication state.
    assert.ok(mapping.primaryProductKeys.length >= 1, `${article.slug} maps no product`);
    assert.notEqual(mapping.editorialDecision, 'HOLD', article.slug);
    assert.notEqual(mapping.monetizationMode, 'no_defensible_product', article.slug);
    assert.equal(mapping.mappingStatus, 'approved', article.slug);
    assert.equal(mapping.approvalStatus, 'approved', article.slug);
    assert.ok(mapping.primaryProductKeys.length <= 2, article.slug);
    assert.ok(mapping.alternativeProductKeys.length <= 1, article.slug);
    for (const key of [...mapping.primaryProductKeys, ...mapping.alternativeProductKeys]) {
      assert.ok(registry[key], `${article.slug}: ${key}`);
      assert.equal(restricted.has(key), false, `${article.slug}: ${key}`);
    }
  }

  // Decision MIX is derived (it moves whenever a guide is corrected); the retired HOLD state
  // is the only value pinned, because any HOLD reappearing is a policy regression.
  assert.equal(counts.HOLD, 0, 'no published guide may carry an editorial HOLD');
  assert.equal(counts.APPROVE + counts.CORRECTED, articles.length);
});

test('verification queues exactly match actionable product keys', async () => {
  const mappings = JSON.parse(await readFile(join(process.cwd(), 'src', 'affiliate', 'article-mappings.generated.json'), 'utf8'));
  const actionableMappings = Object.values(mappings).filter((mapping) => mapping.editorialDecision !== 'HOLD');
  const actionableProductKeys = [...new Set(actionableMappings.flatMap((mapping) => [
    ...mapping.primaryProductKeys,
    ...mapping.alternativeProductKeys
  ]))].sort();
  const linkQueue = parseCsvRecords(await readFile(join(process.cwd(), 'reports', 'affiliate', 'link-verification-queue.csv'), 'utf8'));
  const imageQueue = parseCsvRecords(await readFile(join(process.cwd(), 'reports', 'affiliate', 'image-rights-queue.csv'), 'utf8'));
  const candidates = parseCsvRecords(await readFile(join(process.cwd(), 'reports', 'affiliate', 'product-candidates.csv'), 'utf8'));
  const coverage = await readFile(join(process.cwd(), 'reports', 'affiliate', 'affiliate-coverage-report.md'), 'utf8');

  const registry = JSON.parse(await readFile(join(process.cwd(), 'src', 'affiliate', 'product-registry.generated.json'), 'utf8'));
  const articles = await scanEligibleGuides();

  // The durable invariant: BOTH queues must be exactly the actionable key set — no drift in
  // either direction. Counts are derived from that set rather than frozen.
  assert.deepEqual(linkQueue.map((record) => record.productKey).sort(), actionableProductKeys);
  assert.deepEqual(imageQueue.map((record) => record.productKey).sort(), actionableProductKeys);
  assert.equal(candidates.length, Object.keys(registry).length);
  // Every published guide is monetized, so no mapping is excluded from the actionable set.
  assert.equal(actionableMappings.length, articles.length);
  assert.ok(actionableProductKeys.length > 0);
  assert.equal(mappings['bimmerlink-pricing'].monetizationMode, 'recommended_equipment');

  // The coverage report must agree with the derived reality it was generated from.
  const reported = (label) => Number(coverage.match(new RegExp(`${label}: (\\d+)`))?.[1]);
  assert.equal(reported('Eligible guides'), articles.length);
  assert.equal(reported('Discovered product candidates'), Object.keys(registry).length);
  assert.equal(reported('Actionable linked products'), actionableProductKeys.length);
  assert.equal(reported('Monetized articles'), articles.length);
  assert.equal(reported('HOLD articles'), 0);
  // Every actionable product is link-verified and image-renderable — that is what makes the
  // "no published guide renders zero links" guarantee reachable.
  assert.equal(reported('Verified actionable Special Links'), actionableProductKeys.length);
  assert.equal(reported('Renderable actionable images'), actionableProductKeys.length);
});

test('research candidates stay unverified until a human verifies them, and inventory covers every guide', async () => {
  const articles = await scanEligibleGuides();
  const registry = JSON.parse(await readFile(join(process.cwd(), 'src', 'affiliate', 'product-registry.generated.json'), 'utf8'));
  const mappings = JSON.parse(await readFile(join(process.cwd(), 'src', 'affiliate', 'article-mappings.generated.json'), 'utf8'));
  const linkQueue = parseCsvRecords(await readFile(join(process.cwd(), 'reports', 'affiliate', 'link-verification-queue.csv'), 'utf8'));
  const imageQueue = parseCsvRecords(await readFile(join(process.cwd(), 'reports', 'affiliate', 'image-rights-queue.csv'), 'utf8'));
  const inventory = parseCsvRecords(await readFile(join(process.cwd(), 'reports', 'affiliate', 'article-inventory.csv'), 'utf8'));
  const approvedMappingFor = Object.values(mappings).find((mapping) => mapping.mappingStatus === 'approved');

  // Originally this froze a five-key research list. Products legitimately graduate to verified
  // as humans work the queues, so the durable invariant is applied to EVERY product instead:
  // nothing may acquire an ASIN, a link, an image or a render without human verification.
  const unverified = Object.values(registry).filter((product) => product.linkStatus !== 'verified');
  assert.ok(unverified.length > 0, 'the registry should still carry unverified research candidates');
  for (const product of unverified) {
    const key = product.productKey;
    assert.equal(product.asin, null, key);
    assert.equal(product.specialLink, null, key);
    assert.equal(product.linkStatus, 'candidate', key);
    assert.equal(product.imagePathOrUrl, null, key);
    assert.equal(product.imageRightsStatus, 'unknown', key);
    assert.equal(validateSpecialLink(product).valid, false, key);
    // An unverified product never renders, even against an approved mapping in live mode.
    const state = getProductRenderState(product, approvedMappingFor, 'live', false);
    assert.equal(state.visible, false, key);
    assert.equal(state.clickable, false, key);
    // It is also not actionable, so it must not appear in either human verification queue.
    assert.equal(linkQueue.some((record) => record.productKey === key), false, key);
    assert.equal(imageQueue.some((record) => record.productKey === key), false, key);
  }

  // Conversely, every verified product must carry complete human verification evidence.
  for (const product of Object.values(registry).filter((record) => record.linkStatus === 'verified')) {
    assert.ok(product.specialLink, product.productKey);
    assert.ok(product.verifiedAt && product.verifiedBy, product.productKey);
    assert.equal(validateSpecialLink(product).valid, true, product.productKey);
  }

  // The regenerated inventory report must cover every published guide, once each.
  assert.deepEqual(inventory.map((row) => row.slug).sort(), articles.map((article) => article.slug).sort());
});

test('published guide count is 69 (tripwire against accidental content deletion)', async () => {
  // This count is INTENTIONALLY fixed, unlike the derived assertions above. Every other test
  // here derives the inventory, so a guide silently disappearing would shrink the set and still
  // pass. This one exists purely to detect accidental deletion or an un-drafted guide. When
  // guides are legitimately published or retired, update this number in the same commit.
  const articles = await scanEligibleGuides();
  assert.equal(articles.length, 69, 'published guide inventory changed — update deliberately, in the same commit');
});

test('every published guide has top and bottom placements, and long guides a middle one', async () => {
  const articles = await scanEligibleGuides();
  for (const article of articles) {
    const plan = placementPlans[article.slug];
    assert.ok(plan, `${article.slug} has no placement plan`);
    const positions = plan.placements.map((placement) => placement.position);
    // EVERY_GUIDE_HAS_TOP_PLACEMENT / EVERY_GUIDE_HAS_BOTTOM_PLACEMENT
    assert.ok(positions.includes('top'), `${article.slug}: missing TOP placement`);
    assert.ok(positions.includes('end'), `${article.slug}: missing BOTTOM placement`);
    // EVERY_LONG_GUIDE_HAS_MIDDLE_PLACEMENT (long := word_count >= 1400 || h2_count >= 6)
    const long = isLongArticle(plan.wordCount, plan.h2Count);
    assert.equal(plan.isLong, long, article.slug);
    if (long) assert.ok(positions.includes('middle'), `${article.slug}: long guide missing MIDDLE placement`);
    assert.ok(plan.placements.length >= requiredPlacementsFor(plan.wordCount, plan.h2Count), article.slug);
    assert.equal(new Set(positions).size, positions.length, `${article.slug}: duplicate placement positions`);
  }
});

test('mapped links carry the exact tag, no rejected ASIN, and no raw Amazon URL in article source', async () => {
  const articles = await scanEligibleGuides();
  const registry = JSON.parse(await readFile(join(process.cwd(), 'src', 'affiliate', 'article-mappings.generated.json'), 'utf8'));
  const products = JSON.parse(await readFile(join(process.cwd(), 'src', 'affiliate', 'product-registry.generated.json'), 'utf8'));
  const rejectedAsins = new Set(['B0CDGH4WFH', 'B0GX17T6Z2']);
  const mappedKeys = [...new Set(Object.values(registry).flatMap((mapping) => [...mapping.primaryProductKeys, ...mapping.alternativeProductKeys]))];

  for (const key of mappedKeys) {
    const product = products[key];
    assert.ok(product, key);
    // WRONG_TRACKING_TAG = 0
    const url = new URL(product.specialLink);
    assert.deepEqual(url.searchParams.getAll('tag'), [affiliateConfig.expectedTrackingId], key);
    // REJECTED_ASIN_USED = 0
    assert.equal(rejectedAsins.has(product.asin), false, key);
    assert.equal(url.pathname.match(/\/dp\/([A-Z0-9]{10})(?:[/?]|$)/i)?.[1].toUpperCase(), product.asin, key);
  }
  // No rejected ASIN anywhere in the registry, not just in mapped products.
  for (const product of Object.values(products)) assert.equal(rejectedAsins.has(product.asin), false, product.productKey);
  // RAW_AMAZON_URL = 0 — links flow through the component system, never article Markdown.
  for (const article of articles) {
    const source = await readFile(join(process.cwd(), article.filePath), 'utf8');
    assert.deepEqual(findRawAmazonUrls(source), [], article.slug);
  }
});

test('OBDLink CX is the only draft pilot and the pilot never leaks to another article', async () => {
  const registry = JSON.parse(await readFile(join(process.cwd(), 'src', 'affiliate', 'product-registry.generated.json'), 'utf8'));
  const mappings = JSON.parse(await readFile(join(process.cwd(), 'src', 'affiliate', 'article-mappings.generated.json'), 'utf8'));
  const product = registry['obdlink-cx'];
  const mapping = mappings[affiliateConfig.draftPilot.articleSlug];
  const source = productVerificationOverrides['obdlink-cx'];
  const state = getProductRenderState(product, mapping, 'draft', false);
  const image = await readFile(join(process.cwd(), 'public', 'images', 'products', 'obdlink-cx-official.jpg'));

  assert.equal(affiliateConfig.draftPilot.productKey, 'obdlink-cx');
  assert.equal(validateSpecialLink(product).valid, true);
  assert.equal(state.visible, true);
  assert.equal(state.clickable, true);
  assert.equal(state.pilot, true);
  assert.equal(state.showImage, true);
  assert.equal(state.destination, source.specialLink);
  assert.equal(product.asin, 'B08NFLL3NT');
  assert.equal(product.imageRightsStatus, 'manufacturer_attributed_editorial');
  assert.equal(product.imageRightsSource, 'https://www.obdlink.com/wp-content/uploads/2020/11/0-main_image-202403.jpg');
  // IMAGE_HASH_MISMATCH = 0: the bytes on disk must match the recorded registry hash.
  const digest = createHash('sha256').update(image).digest('hex');
  assert.equal(digest, '71d0d17dd3027118e4f5b3fb35cb79a4f45dc04b50b2fe9607d019d2e2fa04d6');
  assert.equal(digest.toUpperCase(), product.imageSha256);

  // The DRAFT pilot is scoped to exactly one article/product pair: in draft mode no other
  // article may render the pilot product. (In LIVE mode CX renders wherever its mapping is
  // approved — that is normal production monetization, not pilot leakage, so `pilot` is false.)
  const otherSlug = Object.keys(mappings).find((slug) => slug !== affiliateConfig.draftPilot.articleSlug && mappings[slug].primaryProductKeys.includes('obdlink-cx'));
  assert.ok(otherSlug, 'another approved article should also map OBDLink CX');
  assert.equal(getProductRenderState(product, mappings[otherSlug], 'draft', false).visible, false);
  assert.equal(getProductRenderState(product, mappings[otherSlug], 'live', false).pilot, false);
  assert.equal(getProductRenderState(product, mapping, 'live', false).pilot, false);
  // Exactly one product is designated the pilot, whatever else the registry has since verified.
  assert.equal(Object.values(registry).filter((record) => record.productKey === affiliateConfig.draftPilot.productKey).length, 1);
});
