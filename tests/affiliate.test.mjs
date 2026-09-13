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
  assert.ok(article.indexOf('<AffiliateDisclosure compact />') < article.indexOf('<ProductComparisonCard'));
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

test('editorial correction decisions cover all 58 guides and obey product safeguards', async () => {
  const articles = await scanEligibleGuides();
  const mappings = JSON.parse(await readFile(join(process.cwd(), 'src', 'affiliate', 'article-mappings.generated.json'), 'utf8'));
  const registry = JSON.parse(await readFile(join(process.cwd(), 'src', 'affiliate', 'product-registry.generated.json'), 'utf8'));
  const restricted = new Set(['bmw-enet-cable', 'k-dcan-cable', 'bmw-icom-next', 'bimmergeeks-bluetooth-adapter', 'bimmergeeks-expert-k-dcan']);
  const counts = { APPROVE: 0, CORRECTED: 0, HOLD: 0 };

  assert.equal(articles.length, 58);
  assert.equal(Object.keys(editorialMappingOverrides).length, 58);
  for (const article of articles) {
    const mapping = mappings[article.slug];
    assert.ok(mapping, article.slug);
    assert.ok(editorialMappingOverrides[article.slug], article.slug);
    counts[mapping.editorialDecision] += 1;
    assert.ok(mapping.primaryProductKeys.length <= 3, article.slug);
    assert.ok(mapping.alternativeProductKeys.length <= 1, article.slug);
    for (const key of [...mapping.primaryProductKeys, ...mapping.alternativeProductKeys]) {
      assert.ok(registry[key], `${article.slug}: ${key}`);
      assert.equal(restricted.has(key), false, `${article.slug}: ${key}`);
    }
    if (mapping.editorialDecision === 'HOLD') {
      assert.deepEqual(mapping.primaryProductKeys, [], article.slug);
      assert.deepEqual(mapping.alternativeProductKeys, [], article.slug);
      assert.ok(['related_buyer_guide', 'no_defensible_product'].includes(mapping.monetizationMode), article.slug);
    }
  }

  assert.deepEqual(counts, { APPROVE: 5, CORRECTED: 44, HOLD: 9 });
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

  assert.equal(actionableMappings.length, 49);
  assert.equal(actionableProductKeys.length, 27);
  assert.deepEqual(linkQueue.map((record) => record.productKey).sort(), actionableProductKeys);
  assert.deepEqual(imageQueue.map((record) => record.productKey).sort(), actionableProductKeys);
  assert.equal(candidates.length, 36);
  assert.equal(mappings['bimmerlink-pricing'].monetizationMode, 'recommended_equipment');
  assert.match(coverage, /Discovered product candidates: 36/);
  assert.match(coverage, /Actionable products in each verification queue: 27/);
  assert.match(coverage, /Verified actionable Special Links: 1/);
  assert.match(coverage, /Actionable products awaiting link verification: 26/);
  assert.match(coverage, /Monetizable articles: 49/);
  assert.match(coverage, /HOLD articles: 9/);
});

test('full-coverage research candidates remain unverified and the report covers every guide', async () => {
  const articles = await scanEligibleGuides();
  const registry = JSON.parse(await readFile(join(process.cwd(), 'src', 'affiliate', 'product-registry.generated.json'), 'utf8'));
  const linkQueue = parseCsvRecords(await readFile(join(process.cwd(), 'reports', 'affiliate', 'link-verification-queue.csv'), 'utf8'));
  const imageQueue = parseCsvRecords(await readFile(join(process.cwd(), 'reports', 'affiliate', 'image-rights-queue.csv'), 'utf8'));
  const report = await readFile(join(process.cwd(), 'reports', 'affiliate', 'full-coverage-hold-resolution-report.md'), 'utf8');
  const newProductKeys = [
    'autel-md909-pro',
    'fluke-88v',
    'launch-crp919-max',
    'mhd-universal-wifi-adapter',
    'schumacher-inc100'
  ];

  for (const productKey of newProductKeys) {
    const product = registry[productKey];
    const linkRecord = linkQueue.find((record) => record.productKey === productKey);
    const imageRecord = imageQueue.find((record) => record.productKey === productKey);
    assert.ok(product, productKey);
    assert.equal(product.asin, null, productKey);
    assert.equal(product.specialLink, null, productKey);
    assert.equal(product.linkStatus, 'candidate', productKey);
    assert.equal(product.imagePathOrUrl, null, productKey);
    assert.equal(product.imageRightsStatus, 'unknown', productKey);
    assert.equal(linkRecord.approvalStatus, 'candidate', productKey);
    assert.equal(imageRecord.rightsStatus, 'unknown', productKey);
  }
  for (const article of articles) assert.match(report, new RegExp(`\\|` + ' `' + article.slug + '` ' + '\\|'));
});

test('OBDLink CX is the only complete clickable draft pilot', async () => {
  const registry = JSON.parse(await readFile(join(process.cwd(), 'src', 'affiliate', 'product-registry.generated.json'), 'utf8'));
  const mappings = JSON.parse(await readFile(join(process.cwd(), 'src', 'affiliate', 'article-mappings.generated.json'), 'utf8'));
  const product = registry['obdlink-cx'];
  const mapping = mappings['bimmerlink-pricing'];
  const source = productVerificationOverrides['obdlink-cx'];
  const state = getProductRenderState(product, mapping, 'draft', false);
  const image = await readFile(join(process.cwd(), 'public', 'images', 'products', 'obdlink-cx-official.jpg'));

  assert.equal(validateSpecialLink(product).valid, true);
  assert.equal(state.visible, true);
  assert.equal(state.clickable, true);
  assert.equal(state.pilot, true);
  assert.equal(state.showImage, true);
  assert.equal(state.destination, source.specialLink);
  assert.equal(product.asin, 'B08NFLL3NT');
  assert.equal(product.imageRightsStatus, 'manufacturer_attributed_editorial');
  assert.equal(product.imageRightsSource, 'https://www.obdlink.com/wp-content/uploads/2020/11/0-main_image-202403.jpg');
  assert.equal(createHash('sha256').update(image).digest('hex'), '71d0d17dd3027118e4f5b3fb35cb79a4f45dc04b50b2fe9607d019d2e2fa04d6');
  assert.equal(getProductRenderState(product, mapping, 'live', false).visible, false);
  assert.equal(getProductRenderState(product, { ...mapping, articleSlug: 'bimmercode-pricing' }, 'draft', false).visible, false);
  assert.equal(Object.values(registry).filter((record) => record.specialLink).length, 1);
});
