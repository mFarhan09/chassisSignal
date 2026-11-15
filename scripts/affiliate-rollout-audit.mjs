import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { resolveAffiliateMode } from '../src/affiliate/config.ts';
import { editorialMappingOverrides } from '../src/affiliate/editorial-mapping-overrides.ts';
import { productVerificationOverrides } from '../src/affiliate/product-verification-overrides.ts';
import { suppliedSiteStripeInventory } from '../src/affiliate/supplied-sitestripe-inventory.ts';
import { getProductRenderState } from '../src/affiliate/render-policy.ts';
import { validateSpecialLink } from '../src/affiliate/validator.ts';
import { placementPlans, getPlacementPlan, selectRenderedPlacements, validatePlacementPlans } from '../src/affiliate/placement-plan.ts';
import { relationshipTypes } from '../src/affiliate/relationship-classification.ts';
import { findRawAmazonUrls, scanEligibleGuides } from './lib/affiliate-inventory.mjs';
import { parseCsvRecords } from './lib/csv.mjs';

const root = process.cwd();
const mode = resolveAffiliateMode(process.env.AFFILIATE_MODE);
const registry = JSON.parse(await readFile(join(root, 'src', 'affiliate', 'product-registry.generated.json'), 'utf8'));
const mappings = JSON.parse(await readFile(join(root, 'src', 'affiliate', 'article-mappings.generated.json'), 'utf8'));
const articles = await scanEligibleGuides();
const errors = [];
const warnings = [];
const fail = (code, message) => errors.push({ code, message });
const warn = (code, message) => warnings.push({ code, message });
const mapped = Object.values(mappings);
const actionableKeys = [...new Set(mapped.flatMap((mapping) => [...mapping.primaryProductKeys, ...mapping.alternativeProductKeys]))].sort();
const linkQueue = parseCsvRecords(await readFile(join(root, 'reports', 'affiliate', 'link-verification-queue.csv'), 'utf8'));
const imageQueue = parseCsvRecords(await readFile(join(root, 'reports', 'affiliate', 'image-rights-queue.csv'), 'utf8'));
const candidateRows = parseCsvRecords(await readFile(join(root, 'reports', 'affiliate', 'product-candidates.csv'), 'utf8'));
const restrictedKeys = new Set(['bmw-enet-cable', 'k-dcan-cable', 'bmw-icom-next', 'bimmergeeks-bluetooth-adapter', 'bimmergeeks-expert-k-dcan']);
const rejectedAsins = new Set(['B0CDGH4WFH', 'B0GX17T6Z2']);
const allowedImageStatuses = new Set(['verified', 'manufacturer_attributed_editorial', 'site_owned']);
const relationshipTypeSet = new Set(relationshipTypes);

if (mapped.length !== articles.length || Object.keys(editorialMappingOverrides).length !== articles.length) fail('MAPPING_COUNT', `Exactly ${articles.length} reviewed mappings are required (one per published guide).`);
if (candidateRows.length !== Object.keys(registry).length) fail('CANDIDATE_COUNT', 'Candidate report must cover the product registry.');

for (const article of articles) {
  const mapping = mappings[article.slug];
  if (!mapping) { fail('MISSING_MAPPING', article.slug); continue; }
  if (!editorialMappingOverrides[article.slug]) fail('MISSING_EDITORIAL_OVERRIDE', article.slug);
  const source = await readFile(join(root, article.filePath), 'utf8');
  if (findRawAmazonUrls(source).length) fail('RAW_AMAZON_URL', article.filePath);
  if (mapping.editorialDecision === 'HOLD') {
    if (mapping.primaryProductKeys.length || mapping.alternativeProductKeys.length || getPlacementPlan(article.slug)) {
      fail('UNMONETIZED_MAPPING_HAS_PRODUCTS', article.slug);
    }
    if (mapping.monetizationMode !== 'no_defensible_product' || !mapping.recommendationRationale?.trim()) {
      fail('INVALID_UNMONETIZED_MAPPING', article.slug);
    }
    continue;
  }
  if (mapping.mappingStatus !== 'approved' || mapping.approvalStatus !== 'approved') fail('UNAPPROVED_MAPPING', article.slug);
  if (!mapping.primaryProductKeys.length || !getPlacementPlan(article.slug)) fail('MISSING_APPROVED_PLACEMENT', article.slug);
  if (mapping.primaryProductKeys.length > 2) fail('PRODUCT_COUNT', `${article.slug} must map one or two primary products.`);
  if (!mapping.relationshipLabel || !mapping.recommendationRationale || !mapping.officialEvidenceUrl) fail('MISSING_CONTEXT', article.slug);
  // Product-relevance QA: a truthful relationship type plus a written rationale for every mapping.
  if (!relationshipTypeSet.has(mapping.relationshipType)) fail('INVALID_RELATIONSHIP_TYPE', `${article.slug}: "${mapping.relationshipType}".`);
  if (!mapping.relationshipRationale || mapping.relationshipRationale.trim().length < 30) fail('MISSING_RELATIONSHIP_RATIONALE', article.slug);
  for (const key of [...mapping.primaryProductKeys, ...mapping.alternativeProductKeys]) {
    const product = registry[key];
    if (!product) { fail('UNKNOWN_PRODUCT', `${article.slug}: ${key}`); continue; }
    if (restrictedKeys.has(key)) fail('RESTRICTED_PRODUCT', `${article.slug}: ${key}`);
    const link = validateSpecialLink(product);
    if (!link.valid) fail('INVALID_LINK', `${key}: ${link.errors.map((error) => error.code).join(',')}`);
    if (!product.imagePathOrUrl?.startsWith('/images/products/')) fail('INVALID_IMAGE_PATH', key);
    if (/amazon\./i.test(product.imageRightsSource ?? '')) fail('AMAZON_IMAGE', key);
    if (!allowedImageStatuses.has(product.imageRightsStatus) || !product.imageAttribution || !product.imageAlt || !product.imageSha256 || !product.imageReviewedBy) fail('INCOMPLETE_IMAGE_EVIDENCE', key);
    try {
      const bytes = await readFile(join(root, 'public', product.imagePathOrUrl));
      const hash = createHash('sha256').update(bytes).digest('hex').toUpperCase();
      if (hash !== product.imageSha256) fail('IMAGE_HASH_MISMATCH', key);
    } catch { fail('MISSING_LOCAL_IMAGE', key); }
    const state = getProductRenderState(product, mapping, mode, false);
    if (mode === 'live' && (!state.visible || !state.clickable || !state.showImage)) fail('NOT_LIVE_RENDERABLE', `${article.slug}: ${key}`);
  }
}

for (const [key, supplied] of Object.entries(suppliedSiteStripeInventory)) {
  const product = registry[key];
  if (!product) { fail('MISSING_SUPPLIED_PRODUCT', key); continue; }
  if (product.specialLink !== supplied.specialLink || product.asin !== supplied.asin) fail('SUPPLIED_LINK_CHANGED', key);
  if (product.verifiedBy !== 'Muhammad Farhan' || product.linkSource !== 'sitestripe' || product.linkStatus !== 'verified') fail('SUPPLIED_VERIFICATION_MISSING', key);
}
const cx = registry['obdlink-cx'];
if (cx.specialLink !== productVerificationOverrides['obdlink-cx'].specialLink || cx.asin !== 'B08NFLL3NT') fail('OBDLINK_CX_CHANGED', 'OBDLink CX link or ASIN changed.');
if (cx.imageSha256 !== '71D0D17DD3027118E4F5B3FB35CB79A4F45DC04B50B2FE9607D019D2E2FA04D6') fail('OBDLINK_CX_HASH_CHANGED', 'OBDLink CX image hash changed.');

for (const error of validatePlacementPlans(placementPlans, mappings, registry)) fail(`PLACEMENT_${error.code}`, error.message);

const queueKeys = (rows) => rows.map((row) => row.productKey).sort().join('\0');
if (queueKeys(linkQueue) !== actionableKeys.join('\0')) fail('LINK_QUEUE_MISMATCH', 'Link queue must exactly match actionable keys.');
if (queueKeys(imageQueue) !== actionableKeys.join('\0')) fail('IMAGE_QUEUE_MISMATCH', 'Image queue must exactly match actionable keys.');
for (const asin of rejectedAsins) if (Object.values(registry).some((product) => product.asin === asin)) fail('REJECTED_ASIN', asin);
if (Object.values(registry).some((product) => product.specialLink?.includes('node=51812349011'))) fail('REJECTED_SEARCH_NODE', 'Rejected Amazon category node is present.');

// Use the editorial body rather than template headings or related article cards.
function articleBodyBounds(html) {
  const proseStart = html.indexOf('<article class="prose">');
  if (proseStart < 0) return null;
  const keyFindings = html.indexOf('class="key-findings"', proseStart);
  const afterCallout = keyFindings >= 0 ? html.indexOf('</div>', keyFindings) : -1;
  const start = afterCallout >= 0 ? afterCallout + '</div>'.length : proseStart;
  let end = html.indexOf('<section class="related"', start);
  if (end < 0) end = html.indexOf('</article>', start);
  return end > start ? { start, end } : null;
}

let zeroLinkGuides = 0;

if (mode === 'live') {
  for (const article of articles) {
    const outputPath = join(root, 'dist', 'guides', article.slug, 'index.html');
    let html;
    try { html = await readFile(outputPath, 'utf8'); } catch { fail('MISSING_BUILT_PAGE', article.slug); continue; }

    const linkCount = (html.match(/data-affiliate-link/g) ?? []).length;
    const firstLink = html.indexOf('data-affiliate-link');
    const disclosure = html.indexOf('class="affiliate-disclosure');
    const firstUnit = html.indexOf('data-affiliate-unit');
    if (linkCount === 0) zeroLinkGuides++;
    if (mappings[article.slug]?.editorialDecision === 'HOLD') {
      if (linkCount || firstUnit >= 0 || disclosure >= 0) fail('UNMONETIZED_PAGE_HAS_AFFILIATE_MARKUP', article.slug);
      continue;
    }
    if (firstLink < 0) fail('MISSING_HTML_LINK', article.slug);
    if (disclosure < 0 || (firstLink >= 0 && disclosure > firstLink)) fail('DISCLOSURE_ORDER', article.slug);
    // Exactly one article-level disclosure must render before the first unit (never missing,
    // never duplicated). The footer statement uses a distinct `footer-affiliate-disclosure`
    // class and is not counted here.
    const articleDisclosures = (html.match(/class="affiliate-disclosure/g) ?? []).length;
    if (articleDisclosures !== 1) fail('DISCLOSURE_COUNT', `${article.slug}: ${articleDisclosures} article disclosures (expected 1).`);
    if (disclosure >= 0 && firstUnit >= 0 && disclosure > firstUnit) fail('DISCLOSURE_AFTER_UNIT', article.slug);
    if (!html.includes('rel="sponsored nofollow noopener"')) fail('REL_MISSING', article.slug);
    if (!html.includes('data-affiliate-unit') || !html.includes('class="affiliate-product-card__image"')) fail('MISSING_HTML_UNIT_OR_IMAGE', article.slug);
    if (/src="https?:\/\/[^"]*amazon\./i.test(html)) fail('EXTERNAL_AMAZON_IMAGE', article.slug);
    if (findRawAmazonUrls(html.replace(/href="[^"]*"/g, '')).length) fail('RAW_AMAZON_URL_IN_HTML', article.slug);
    // Every rendered anchor must carry exactly the Chassis tracking tag and a registry ASIN.
    for (const href of html.match(/href="https:\/\/www\.amazon\.com[^"]*"/g) ?? []) {
      const url = new URL(href.slice(6, -1).replaceAll('&#38;', '&').replaceAll('&amp;', '&'));
      const tags = url.searchParams.getAll('tag');
      if (tags.length !== 1 || tags[0] !== 'chassissignal-20') fail('WRONG_TRACKING_TAG', `${article.slug}: ${tags.join(',') || '(none)'}`);
      const asin = url.pathname.match(/\/dp\/([A-Z0-9]{10})(?:[/?]|$)/i)?.[1]?.toUpperCase();
      if (!asin) fail('MISSING_HTML_ASIN', `${article.slug}: ${url.pathname}`);
      else if (rejectedAsins.has(asin)) fail('REJECTED_ASIN_RENDERED', `${article.slug}: ${asin}`);
      else if (!Object.values(registry).some((product) => product.asin === asin)) fail('UNKNOWN_HTML_ASIN', `${article.slug}: ${asin}`);
    }

    const placements = selectRenderedPlacements(getPlacementPlan(article.slug));
    const expectedKeys = placements.flatMap((placement) => placement.productKeys).sort();
    const renderedKeys = [...html.matchAll(/<a\b[^>]*data-affiliate-link[^>]*>/g)]
      .map(([link]) => link.match(/\bdata-product-key="([^"]+)"/)?.[1])
      .sort();
    const unitCount = (html.match(/data-affiliate-unit/g) ?? []).length;
    if (unitCount !== expectedKeys.length || JSON.stringify(renderedKeys) !== JSON.stringify(expectedKeys)) {
      fail('RENDERED_PLACEMENT_MISMATCH', `${article.slug}: expected ${expectedKeys.join(', ')}, rendered ${renderedKeys.join(', ')}.`);
    }
    if (new Set(renderedKeys).size !== renderedKeys.length) fail('REPEATED_PRODUCT', article.slug);

    const bounds = articleBodyBounds(html);
    if (!bounds || firstUnit < bounds.start || firstUnit >= bounds.end) {
      fail('UNREADABLE_ARTICLE_BODY', article.slug);
      continue;
    }
    if (!/<h2[\s>]/.test(html.slice(bounds.start, firstUnit))) fail('UNIT_BEFORE_EDITORIAL_SECTION', article.slug);

  }
} else {
  warn('DRAFT_MODE', 'Registry and mapping integrity passed; full HTML coverage is checked by the live audit.');
}

for (const item of warnings) console.warn(`WARN ${item.code}: ${item.message}`);
for (const item of errors) console.error(`ERROR ${item.code}: ${item.message}`);
const planned = Object.values(placementPlans);
console.log(`Affiliate audit: mode=${mode}, guides=${articles.length}, monetized=${mapped.filter((mapping) => mapping.primaryProductKeys.length).length}, zeroLinkGuides=${zeroLinkGuides}, plans=${planned.length}, placements=${planned.reduce((sum, plan) => sum + plan.placements.length, 0)}, long=${planned.filter((plan) => plan.isLong).length}, candidates=${candidateRows.length}, actionable=${actionableKeys.length}, supplied=${Object.keys(suppliedSiteStripeInventory).length + 1}, HOLD=${mapped.filter((mapping) => mapping.editorialDecision === 'HOLD').length}, warnings=${warnings.length}, errors=${errors.length}`);
if (errors.length) process.exitCode = 1;
