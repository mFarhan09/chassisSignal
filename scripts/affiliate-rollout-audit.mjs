import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { resolveAffiliateMode } from '../src/affiliate/config.ts';
import { editorialMappingOverrides } from '../src/affiliate/editorial-mapping-overrides.ts';
import { productVerificationOverrides } from '../src/affiliate/product-verification-overrides.ts';
import { suppliedSiteStripeInventory } from '../src/affiliate/supplied-sitestripe-inventory.ts';
import { getProductRenderState } from '../src/affiliate/render-policy.ts';
import { validateSpecialLink } from '../src/affiliate/validator.ts';
import { placementPlans, getPlacementPlan, validatePlacementPlans, MAX_PLACEMENTS_PER_ARTICLE } from '../src/affiliate/placement-plan.ts';
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

if (articles.length !== 58) fail('INVENTORY_COUNT', `Expected 58 published guides, found ${articles.length}.`);
if (mapped.length !== 58 || Object.keys(editorialMappingOverrides).length !== 58) fail('MAPPING_COUNT', 'Exactly 58 reviewed mappings are required.');
if (candidateRows.length !== 47) fail('CANDIDATE_COUNT', `Expected 47 preserved/discovered candidates, found ${candidateRows.length}.`);
if (actionableKeys.length !== 20) fail('ACTIONABLE_COUNT', `Expected 20 mapped linked products, found ${actionableKeys.length}.`);
if (mapped.some((mapping) => mapping.editorialDecision === 'HOLD')) fail('HOLD_REMAINS', 'No article-level HOLD may remain.');

for (const article of articles) {
  const mapping = mappings[article.slug];
  if (!mapping) { fail('MISSING_MAPPING', article.slug); continue; }
  if (!editorialMappingOverrides[article.slug]) fail('MISSING_EDITORIAL_OVERRIDE', article.slug);
  if (mapping.mappingStatus !== 'approved' || mapping.approvalStatus !== 'approved') fail('UNAPPROVED_MAPPING', article.slug);
  if (!mapping.primaryProductKeys.length || mapping.primaryProductKeys.length > 2) fail('PRODUCT_COUNT', `${article.slug} must map one or two primary products.`);
  if (!mapping.relationshipLabel || !mapping.recommendationRationale || !mapping.officialEvidenceUrl) fail('MISSING_CONTEXT', article.slug);
  const source = await readFile(join(root, article.filePath), 'utf8');
  if (findRawAmazonUrls(source).length) fail('RAW_AMAZON_URL', article.filePath);
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

// Contextual placement-density enforcement: 1-3 placements, distributed, distinct, capped.
for (const error of validatePlacementPlans(placementPlans, mappings, registry)) fail(`PLACEMENT_${error.code}`, error.message);
for (const article of articles) {
  const plan = getPlacementPlan(article.slug);
  if (!plan) fail('PLACEMENT_MISSING_PLAN', article.slug);
  else if (plan.placements.length > MAX_PLACEMENTS_PER_ARTICLE) fail('PLACEMENT_COUNT_EXCEEDED', `${article.slug}: ${plan.placements.length} placements.`);
}

const queueKeys = (rows) => rows.map((row) => row.productKey).sort().join('\0');
if (queueKeys(linkQueue) !== actionableKeys.join('\0')) fail('LINK_QUEUE_MISMATCH', 'Link queue must exactly match actionable keys.');
if (queueKeys(imageQueue) !== actionableKeys.join('\0')) fail('IMAGE_QUEUE_MISMATCH', 'Image queue must exactly match actionable keys.');
for (const asin of rejectedAsins) if (Object.values(registry).some((product) => product.asin === asin)) fail('REJECTED_ASIN', asin);
if (Object.values(registry).some((product) => product.specialLink?.includes('node=51812349011'))) fail('REJECTED_SEARCH_NODE', 'Rejected Amazon category node is present.');

if (mode === 'live') {
  for (const article of articles) {
    const outputPath = join(root, 'dist', 'guides', article.slug, 'index.html');
    try {
      const html = await readFile(outputPath, 'utf8');
      const firstLink = html.indexOf('data-affiliate-link');
      const disclosure = html.indexOf('affiliate-disclosure');
      const firstUnit = html.indexOf('data-affiliate-unit');
      if (firstLink < 0) fail('MISSING_HTML_LINK', article.slug);
      if (disclosure < 0 || disclosure > firstLink) fail('DISCLOSURE_ORDER', article.slug);
      // Exactly one article-level disclosure must render before the first unit
      // (never missing, never duplicated). The footer statement uses a distinct
      // `footer-affiliate-disclosure` class and is not counted here.
      const articleDisclosures = (html.match(/class="affiliate-disclosure/g) ?? []).length;
      if (articleDisclosures !== 1) fail('DISCLOSURE_COUNT', `${article.slug}: ${articleDisclosures} article disclosures (expected 1).`);
      if (disclosure >= 0 && firstUnit >= 0 && disclosure > firstUnit) fail('DISCLOSURE_AFTER_UNIT', article.slug);
      // The FIRST affiliate unit must surface early (after a couple of intro
      // prose paragraphs), not after full sections near the article midpoint.
      const proseStart = html.indexOf('<article class="prose">');
      const proseEnd = html.indexOf('<aside class="article-aside"', proseStart);
      if (proseStart >= 0 && proseEnd > proseStart && firstUnit >= 0) {
        const depth = (firstUnit - proseStart) / (proseEnd - proseStart);
        if (depth > 0.45) fail('FIRST_PLACEMENT_TOO_DEEP', `${article.slug}: first unit at ${Math.round(depth * 100)}% of the article.`);
      }
      if (!html.includes('rel="sponsored nofollow noopener"')) fail('REL_MISSING', article.slug);
      if (!html.includes('data-affiliate-unit') || !html.includes('class="affiliate-product-card__image"')) fail('MISSING_HTML_UNIT_OR_IMAGE', article.slug);
      if (/src="https?:\/\/[^"]*amazon\./i.test(html)) fail('EXTERNAL_AMAZON_IMAGE', article.slug);
      const plan = getPlacementPlan(article.slug);
      if (plan) {
        const unitCount = (html.match(/data-affiliate-unit/g) ?? []).length;
        // Each placement renders one unit; a comparison card renders two product-card units.
        const expectedUnits = plan.placements.reduce((sum, p) => sum + (p.variant === 'comparison_card' ? 2 : 1), 0);
        if (unitCount !== expectedUnits) fail('PLACEMENT_UNIT_COUNT', `${article.slug}: ${unitCount} units, expected ${expectedUnits}.`);
        for (const placement of plan.placements) for (const key of placement.productKeys) {
          if (!html.includes(`data-product-key="${key}"`)) fail('MISSING_PLANNED_PLACEMENT', `${article.slug}: ${key}`);
        }
      }
    } catch { fail('MISSING_BUILT_PAGE', article.slug); }
  }
} else {
  warn('DRAFT_MODE', 'Registry and mapping integrity passed; full HTML coverage is checked by the live audit.');
}

for (const item of warnings) console.warn(`WARN ${item.code}: ${item.message}`);
for (const item of errors) console.error(`ERROR ${item.code}: ${item.message}`);
console.log(`Affiliate audit: mode=${mode}, guides=${articles.length}, candidates=${candidateRows.length}, actionable=${actionableKeys.length}, supplied=${Object.keys(suppliedSiteStripeInventory).length + 1}, HOLD=${mapped.filter((mapping) => mapping.editorialDecision === 'HOLD').length}, warnings=${warnings.length}, errors=${errors.length}`);
if (errors.length) process.exitCode = 1;
