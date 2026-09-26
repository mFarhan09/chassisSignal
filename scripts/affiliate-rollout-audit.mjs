import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { resolveAffiliateMode } from '../src/affiliate/config.ts';
import { editorialMappingOverrides } from '../src/affiliate/editorial-mapping-overrides.ts';
import { productVerificationOverrides } from '../src/affiliate/product-verification-overrides.ts';
import { suppliedSiteStripeInventory } from '../src/affiliate/supplied-sitestripe-inventory.ts';
import { getProductRenderState } from '../src/affiliate/render-policy.ts';
import { validateSpecialLink } from '../src/affiliate/validator.ts';
import { placementPlans, getPlacementPlan, validatePlacementPlans, MAX_PLACEMENTS_PER_ARTICLE, requiredPlacementsFor, isLongArticle } from '../src/affiliate/placement-plan.ts';
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

/**
 * PORTFOLIO POLICY (2026-09-25): there is NO exemption path. Every published guide must be
 * monetized — approved mapping, at least one verified mapped product, a top placement, an end
 * placement, a middle placement when the article is long, and at least the required number of
 * rendered affiliate links. The former `UNMONETIZED_GUIDES` allow-list is deliberately gone.
 */
const EXPECTED_PUBLISHED_GUIDES = 69;
// Rendered-position gates, measured against the substantive article body.
const TOP_MAX_FRACTION = 0.30;
// Below this word count, "fraction of the body above the first unit" stops being a useful
// signal — two short intro paragraphs legitimately occupy 40%+ of a 600-word guide. Those pages
// are held to the paragraph rule alone (which is the actual policy); every substantial guide
// must additionally keep its first unit inside the top TOP_MAX_FRACTION of the body.
const TOP_FRACTION_MIN_WORDS = 1000;
const MIDDLE_MIN_FRACTION = 0.30;
const MIDDLE_MAX_FRACTION = 0.80;
const END_MIN_FRACTION = 0.75;
const MIN_PLACEMENT_GAP = 0.10;
const MIN_INTRO_PARAGRAPHS = 2;
const MAX_INTRO_PARAGRAPHS = 4;

if (articles.length !== EXPECTED_PUBLISHED_GUIDES) fail('INVENTORY_COUNT', `Expected ${EXPECTED_PUBLISHED_GUIDES} published guides, found ${articles.length}.`);
if (mapped.length !== articles.length || Object.keys(editorialMappingOverrides).length !== articles.length) fail('MAPPING_COUNT', `Exactly ${articles.length} reviewed mappings are required (one per published guide).`);
if (candidateRows.length !== 51) fail('CANDIDATE_COUNT', `Expected 51 preserved/discovered candidates, found ${candidateRows.length}.`);
if (actionableKeys.length !== 23) fail('ACTIONABLE_COUNT', `Expected 23 mapped linked products, found ${actionableKeys.length}.`);
if (mapped.some((mapping) => mapping.editorialDecision === 'HOLD')) fail('HOLD_REMAINS', 'No article-level HOLD may remain.');
if (mapped.some((mapping) => mapping.monetizationMode === 'no_defensible_product')) fail('UNMONETIZED_MODE_PRESENT', 'The no_defensible_product publication path is retired; every published guide must map a product.');

for (const article of articles) {
  const mapping = mappings[article.slug];
  if (!mapping) { fail('MISSING_MAPPING', article.slug); continue; }
  if (!editorialMappingOverrides[article.slug]) fail('MISSING_EDITORIAL_OVERRIDE', article.slug);
  if (mapping.mappingStatus !== 'approved' || mapping.approvalStatus !== 'approved') fail('UNAPPROVED_MAPPING', article.slug);
  if (!mapping.primaryProductKeys.length) fail('PUBLISHED_GUIDE_NOT_MONETIZED', `${article.slug} maps no product; zero-link published guides are not permitted.`);
  if (mapping.primaryProductKeys.length > 2) fail('PRODUCT_COUNT', `${article.slug} must map one or two primary products.`);
  if (!mapping.relationshipLabel || !mapping.recommendationRationale || !mapping.officialEvidenceUrl) fail('MISSING_CONTEXT', article.slug);
  // Product-relevance QA: a truthful relationship type plus a written rationale for every mapping.
  if (!relationshipTypeSet.has(mapping.relationshipType)) fail('INVALID_RELATIONSHIP_TYPE', `${article.slug}: "${mapping.relationshipType}".`);
  if (!mapping.relationshipRationale || mapping.relationshipRationale.trim().length < 30) fail('MISSING_RELATIONSHIP_RATIONALE', article.slug);
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

// Contextual placement enforcement: top/middle/end contract, required counts, distinct, capped.
for (const error of validatePlacementPlans(placementPlans, mappings, registry)) fail(`PLACEMENT_${error.code}`, error.message);
for (const article of articles) {
  const plan = getPlacementPlan(article.slug);
  if (!plan) { fail('PLACEMENT_MISSING_PLAN', article.slug); continue; }
  const required = requiredPlacementsFor(plan.wordCount, plan.h2Count);
  if (plan.placements.length < required) fail('PLACEMENT_BELOW_REQUIRED', `${article.slug}: ${plan.placements.length} planned, ${required} required.`);
  if (plan.placements.length > MAX_PLACEMENTS_PER_ARTICLE) fail('PLACEMENT_COUNT_EXCEEDED', `${article.slug}: ${plan.placements.length} placements.`);
  const positions = new Set(plan.placements.map((placement) => placement.position));
  if (!positions.has('top')) fail('MISSING_TOP_PLACEMENT', article.slug);
  if (!positions.has('end')) fail('MISSING_END_PLACEMENT', article.slug);
  if (isLongArticle(plan.wordCount, plan.h2Count) && !positions.has('middle')) fail('MISSING_MIDDLE_PLACEMENT', `${article.slug}: long article without a middle placement.`);
}

const queueKeys = (rows) => rows.map((row) => row.productKey).sort().join('\0');
if (queueKeys(linkQueue) !== actionableKeys.join('\0')) fail('LINK_QUEUE_MISMATCH', 'Link queue must exactly match actionable keys.');
if (queueKeys(imageQueue) !== actionableKeys.join('\0')) fail('IMAGE_QUEUE_MISMATCH', 'Image queue must exactly match actionable keys.');
for (const asin of rejectedAsins) if (Object.values(registry).some((product) => product.asin === asin)) fail('REJECTED_ASIN', asin);
if (Object.values(registry).some((product) => product.specialLink?.includes('node=51812349011'))) fail('REJECTED_SEARCH_NODE', 'Rejected Amazon category node is present.');

/**
 * Locate the substantive article body in a built page: everything between the end of the
 * evidence/safety callout and the start of the "Related articles" block. Rendered placement
 * positions are measured as fractions of that region, so the top/middle/end gates read the
 * real article structure rather than a raw byte percentage of the whole document.
 */
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

    // --- NO-PAGE-LEFT-BEHIND hard gate ---------------------------------------------------
    const linkCount = (html.match(/data-affiliate-link/g) ?? []).length;
    if (linkCount === 0) { zeroLinkGuides++; fail('PUBLISHED_GUIDE_ZERO_AFFILIATE_LINKS', article.slug); }

    const plan = getPlacementPlan(article.slug);
    const firstLink = html.indexOf('data-affiliate-link');
    const disclosure = html.indexOf('class="affiliate-disclosure');
    const firstUnit = html.indexOf('data-affiliate-unit');
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

    if (!plan) continue;
    const unitOffsets = [...html.matchAll(/data-affiliate-unit/g)].map((match) => match.index);
    // Each placement renders one unit; a comparison card renders two product-card units.
    const expectedUnits = plan.placements.reduce((sum, p) => sum + (p.variant === 'comparison_card' ? 2 : 1), 0);
    if (unitOffsets.length !== expectedUnits) fail('PLACEMENT_UNIT_COUNT', `${article.slug}: ${unitOffsets.length} units, expected ${expectedUnits}.`);
    if (linkCount < plan.requiredPlacements) fail('BELOW_REQUIRED_RENDERED_LINKS', `${article.slug}: ${linkCount} rendered links, ${plan.requiredPlacements} required.`);
    for (const placement of plan.placements) for (const key of placement.productKeys) {
      if (!html.includes(`data-product-key="${key}"`)) fail('MISSING_PLANNED_PLACEMENT', `${article.slug}: ${key}`);
    }

    // --- rendered TOP / MIDDLE / END position audit ---------------------------------------
    const bounds = articleBodyBounds(html);
    if (!bounds || unitOffsets.length === 0) { fail('UNREADABLE_ARTICLE_BODY', article.slug); continue; }
    const span = bounds.end - bounds.start;
    const fractionOf = (offset) => (offset - bounds.start) / span;
    // Unit index at which each planned placement starts, in document order.
    const unitIndexOf = (placementIndex) => plan.placements
      .slice(0, placementIndex)
      .reduce((sum, p) => sum + (p.variant === 'comparison_card' ? 2 : 1), 0);
    const positionFraction = (position) => {
      const index = plan.placements.findIndex((p) => p.position === position);
      if (index < 0) return null;
      const offset = unitOffsets[unitIndexOf(index)];
      return offset === undefined ? null : fractionOf(offset);
    };

    // TOP: after two substantive intro paragraphs, and high on the page.
    const introParagraphs = (html.slice(bounds.start, disclosure >= 0 ? disclosure : unitOffsets[0]).match(/<p[\s>]/g) ?? []).length;
    if (introParagraphs < MIN_INTRO_PARAGRAPHS) fail('FIRST_PLACEMENT_TOO_EARLY', `${article.slug}: only ${introParagraphs} intro paragraph(s) before the first unit.`);
    if (introParagraphs > MAX_INTRO_PARAGRAPHS) fail('FIRST_PLACEMENT_TOO_DEEP', `${article.slug}: ${introParagraphs} paragraphs before the first unit.`);
    const topFraction = positionFraction('top');
    if (topFraction === null) fail('MISSING_TOP_PLACEMENT', `${article.slug}: no rendered top unit.`);
    else if (plan.wordCount >= TOP_FRACTION_MIN_WORDS && topFraction > TOP_MAX_FRACTION) fail('FIRST_PLACEMENT_TOO_DEEP', `${article.slug}: top unit at ${Math.round(topFraction * 100)}% of the body.`);

    // END: a buying opportunity near the bottom, in the final quarter of the body.
    const endFraction = positionFraction('end');
    if (endFraction === null) fail('MISSING_END_PLACEMENT', `${article.slug}: no rendered end unit.`);
    else if (endFraction < END_MIN_FRACTION) fail('MISSING_END_PLACEMENT', `${article.slug}: last planned unit at ${Math.round(endFraction * 100)}%, below the required ${Math.round(END_MIN_FRACTION * 100)}%.`);

    // MIDDLE: required for long articles, in the central portion, not adjacent to top or end.
    const middleFraction = positionFraction('middle');
    if (plan.isLong && middleFraction === null) fail('MISSING_MIDDLE_PLACEMENT', `${article.slug}: long article rendered no middle unit.`);
    if (middleFraction !== null) {
      if (middleFraction < MIDDLE_MIN_FRACTION || middleFraction > MIDDLE_MAX_FRACTION) {
        fail('MIDDLE_PLACEMENT_OUT_OF_BAND', `${article.slug}: middle unit at ${Math.round(middleFraction * 100)}% (band ${Math.round(MIDDLE_MIN_FRACTION * 100)}-${Math.round(MIDDLE_MAX_FRACTION * 100)}%).`);
      }
      if (topFraction !== null && middleFraction - topFraction < MIN_PLACEMENT_GAP) fail('PLACEMENTS_ADJACENT', `${article.slug}: top and middle units are adjacent.`);
      if (endFraction !== null && endFraction - middleFraction < MIN_PLACEMENT_GAP) fail('PLACEMENTS_ADJACENT', `${article.slug}: middle and end units are adjacent.`);
    }
  }
} else {
  warn('DRAFT_MODE', 'Registry and mapping integrity passed; full HTML coverage is checked by the live audit.');
}

for (const item of warnings) console.warn(`WARN ${item.code}: ${item.message}`);
for (const item of errors) console.error(`ERROR ${item.code}: ${item.message}`);
const planned = Object.values(placementPlans);
console.log(`Affiliate audit: mode=${mode}, guides=${articles.length}, monetized=${mapped.filter((mapping) => mapping.primaryProductKeys.length).length}, zeroLinkGuides=${zeroLinkGuides}, plans=${planned.length}, placements=${planned.reduce((sum, plan) => sum + plan.placements.length, 0)}, long=${planned.filter((plan) => plan.isLong).length}, candidates=${candidateRows.length}, actionable=${actionableKeys.length}, supplied=${Object.keys(suppliedSiteStripeInventory).length + 1}, HOLD=${mapped.filter((mapping) => mapping.editorialDecision === 'HOLD').length}, warnings=${warnings.length}, errors=${errors.length}`);
if (errors.length) process.exitCode = 1;
