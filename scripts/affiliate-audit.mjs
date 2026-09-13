import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { affiliateConfig, resolveAffiliateMode } from '../src/affiliate/config.ts';
import { editorialMappingOverrides } from '../src/affiliate/editorial-mapping-overrides.ts';
import { productVerificationOverrides } from '../src/affiliate/product-verification-overrides.ts';
import { validateSpecialLink } from '../src/affiliate/validator.ts';
import { findRawAmazonUrls, scanEligibleGuides } from './lib/affiliate-inventory.mjs';
import { parseCsvRecords } from './lib/csv.mjs';

const root = process.cwd();
const mode = resolveAffiliateMode(process.env.AFFILIATE_MODE);
const errors = [];
const warnings = [];
const registry = JSON.parse(await readFile(join(root, 'src', 'affiliate', 'product-registry.generated.json'), 'utf8'));
const mappings = JSON.parse(await readFile(join(root, 'src', 'affiliate', 'article-mappings.generated.json'), 'utf8'));
const actionableMappings = Object.values(mappings).filter((mapping) => mapping.editorialDecision !== 'HOLD');
const actionableProductKeys = [...new Set(actionableMappings.flatMap((mapping) => [
  ...mapping.primaryProductKeys,
  ...mapping.alternativeProductKeys
]))].sort();
const linkQueue = parseCsvRecords(await readFile(join(root, 'reports', 'affiliate', 'link-verification-queue.csv'), 'utf8'));
const imageQueue = parseCsvRecords(await readFile(join(root, 'reports', 'affiliate', 'image-rights-queue.csv'), 'utf8'));
const productCandidates = parseCsvRecords(await readFile(join(root, 'reports', 'affiliate', 'product-candidates.csv'), 'utf8'));

const articles = await scanEligibleGuides();
const articleSlugs = new Set(articles.map((article) => article.slug));
const forbiddenPagePattern = /^(about|contact|privacy|methodology|editorial-standards|affiliate-disclosure)$/;
const decisions = new Set(['APPROVE', 'CORRECTED', 'HOLD']);
const restrictedProductKeys = new Set([
  'bmw-enet-cable',
  'k-dcan-cable',
  'bmw-icom-next',
  'bimmergeeks-bluetooth-adapter',
  'bimmergeeks-expert-k-dcan'

]);
function fail(code, message) { errors.push({ code, message }); }
function warn(code, message) { warnings.push({ code, message }); }
function validateQueue(name, records) {
  const keys = records.map((record) => record.productKey).sort();
  if (keys.length !== actionableProductKeys.length || keys.join('\0') !== actionableProductKeys.join('\0')) {
    fail('QUEUE_KEY_MISMATCH', `${name} must exactly match actionableProductKeys.`);
  }
}

if (actionableMappings.length !== 49) fail('MONETIZABLE_COUNT', `Expected 49 non-HOLD mappings, found ${actionableMappings.length}.`);
if (actionableProductKeys.length !== 27) fail('ACTIONABLE_PRODUCT_COUNT', `Expected 27 actionable products, found ${actionableProductKeys.length}.`);
if (productCandidates.length !== 36) fail('DISCOVERED_PRODUCT_COUNT', `Expected 36 discovered candidates, found ${productCandidates.length}.`);
if (mappings['bimmerlink-pricing']?.monetizationMode !== 'recommended_equipment') fail('BIMMERLINK_PRICING_MODE', 'bimmerlink-pricing must use recommended_equipment.');
validateQueue('link-verification-queue.csv', linkQueue);
validateQueue('image-rights-queue.csv', imageQueue);
const pilotProductKey = affiliateConfig.draftPilot.productKey;
const pilotSource = productVerificationOverrides[pilotProductKey];
const pilotProduct = registry[pilotProductKey];
const pilotLinkRecord = linkQueue.find((record) => record.productKey === pilotProductKey);
const pilotImageRecord = imageQueue.find((record) => record.productKey === pilotProductKey);

if (mode !== 'draft') fail('PILOT_REQUIRES_DRAFT', 'The OBDLink CX pilot must not run outside draft mode.');
if (Object.values(registry).filter((product) => product.specialLink).length !== 1) fail('PILOT_PRODUCT_COUNT', 'Exactly one registry product may contain a Special Link during the draft pilot.');
for (const field of ['asin', 'specialLink', 'linkSource', 'linkStatus', 'verifiedAt', 'verifiedBy', 'manufacturerUrl', 'imagePathOrUrl', 'imageRightsSource', 'imageRightsStatus']) {
  if (pilotProduct?.[field] !== pilotSource?.[field]) fail('PILOT_SOURCE_MISMATCH', `OBDLink CX field ${field} differs from the verification source.`);
}
if (pilotLinkRecord?.exactSpecialLink !== pilotSource?.specialLink || pilotLinkRecord?.asin !== pilotSource?.asin || pilotLinkRecord?.verifiedBy !== pilotSource?.verifiedBy || pilotLinkRecord?.approvalStatus !== 'verified') fail('PILOT_LINK_QUEUE_MISMATCH', 'The OBDLink CX link queue row is not synchronized.');
if (pilotImageRecord?.proposedImageSource !== pilotSource?.imagePathOrUrl || pilotImageRecord?.evidenceLocation !== pilotSource?.imageRightsSource || pilotImageRecord?.rightsStatus !== 'manufacturer_attributed_editorial') fail('PILOT_IMAGE_QUEUE_MISMATCH', 'The OBDLink CX image queue row is not synchronized.');
if (pilotProduct?.imageRightsStatus === 'verified') fail('PILOT_IMAGE_PERMISSION_OVERCLAIM', 'The manufacturer-attributed image must not be marked permission-approved.');

if (articles.length !== 58) fail('INVENTORY_COUNT', `Expected 58 eligible articles, found ${articles.length}.`);
for (const slug of Object.keys(editorialMappingOverrides)) {
  if (!articleSlugs.has(slug)) fail('STALE_EDITORIAL_OVERRIDE', `${slug} has an override but is not an eligible article.`);
}


for (const article of articles) {
  const source = await readFile(join(root, article.filePath), 'utf8');
  if (findRawAmazonUrls(source).length) fail('RAW_AMAZON_URL', `${article.filePath} contains a raw Amazon URL.`);
  if (!mappings[article.slug]) fail('MISSING_MAPPING', `${article.slug} is absent from the mapping registry.`);
  if (!editorialMappingOverrides[article.slug]) fail('MISSING_EDITORIAL_OVERRIDE', `${article.slug} has not received an editorial decision.`);
}

for (const [slug, mapping] of Object.entries(mappings)) {
  if (!articleSlugs.has(slug)) fail('STALE_MAPPING', `${slug} is not an eligible published guide.`);
  if (forbiddenPagePattern.test(slug)) fail('FORBIDDEN_PAGE', `${slug} must never be selected for monetization.`);
  if (mapping.monetizationMode === 'related_buyer_guide' || mapping.monetizationMode === 'no_defensible_product') warn('NON_PRODUCT_MAPPING', `${slug} uses ${mapping.monetizationMode}.`);
  if (!decisions.has(mapping.editorialDecision)) fail('INVALID_EDITORIAL_DECISION', `${slug} has invalid decision ${mapping.editorialDecision}.`);
  if (mapping.primaryProductKeys.length > 3) fail('TOO_MANY_PRIMARY_PRODUCTS', `${slug} has more than three primary products.`);
  if (mapping.alternativeProductKeys.length > 1) fail('TOO_MANY_ALTERNATIVES', `${slug} has more than one alternative.`);
  if (mapping.editorialDecision === 'HOLD' && (mapping.primaryProductKeys.length || mapping.alternativeProductKeys.length)) fail('HOLD_HAS_PRODUCT', `${slug} is HOLD but still references products.`);
  if (mapping.editorialDecision === 'HOLD' && !['related_buyer_guide', 'no_defensible_product'].includes(mapping.monetizationMode)) fail('INVALID_HOLD_MODE', `${slug} is HOLD but uses ${mapping.monetizationMode}.`);
  if (mapping.editorialDecision !== 'HOLD' && !mapping.primaryProductKeys.length) fail('DECISION_HAS_NO_PRODUCT', `${slug} is ${mapping.editorialDecision} without a primary product.`);
  if (mapping.mappingStatus !== 'reviewed' || mapping.approvalStatus !== 'pending') fail('DRAFT_REVIEW_STATE', `${slug} must remain reviewed/pending during this draft pass.`);

  const productKeys = [...mapping.primaryProductKeys, ...mapping.alternativeProductKeys];
  for (const key of productKeys) {
    if (!registry[key]) fail('UNKNOWN_PRODUCT_KEY', `${slug} references unknown product ${key}.`);
    if (restrictedProductKeys.has(key)) fail('RESTRICTED_PRODUCT_KEY', `${slug} references restricted product ${key}.`);
  }
  if (mode === 'live' && mapping.primaryProductKeys.length && (mapping.mappingStatus !== 'approved' || mapping.approvalStatus !== 'approved')) {
    fail('UNAPPROVED_MAPPING', `${slug} cannot enter live mode without mapping and human approval.`);
  }
}

for (const product of Object.values(registry)) {
  const attributedDraftPilotImage = mode === 'draft' && product.productKey === pilotProductKey && product.imageRightsStatus === 'manufacturer_attributed_editorial' && Boolean(product.imageRightsSource && product.imageVerifiedAt);
  if (product.expectedTrackingId !== affiliateConfig.expectedTrackingId) fail('WRONG_TRACKING_ID', `${product.productKey} has the wrong expected tracking ID.`);
  if (product.asin && !/^[A-Z0-9]{10}$/i.test(product.asin)) fail('MALFORMED_ASIN', `${product.productKey} has a malformed ASIN.`);
  if (product.imagePathOrUrl && product.imageRightsStatus !== 'verified' && !attributedDraftPilotImage) fail('UNVERIFIED_IMAGE', `${product.productKey} has an image without verified rights or the scoped manufacturer attribution.`);
  if (product.imageMode === 'creators_api' && product.imagePathOrUrl) fail('CREATORS_API_DISABLED', `${product.productKey} contains API image data during Phase 1.`);
  for (const forbiddenField of ['price', 'discount', 'rating', 'reviewCount', 'prime', 'availability']) {
    if (forbiddenField in product) fail('FORBIDDEN_COMMERCE_FIELD', `${product.productKey} contains forbidden field ${forbiddenField}.`);
  }
  if (product.specialLink || mode === 'live') {
    const result = validateSpecialLink(product);
    if (!result.valid && (product.specialLink || Object.values(mappings).some((mapping) => mapping.primaryProductKeys.includes(product.productKey)))) {
      const detail = result.errors.map((error) => error.code).join(', ');
      if (mode === 'live') fail('INVALID_LIVE_LINK', `${product.productKey}: ${detail}`);
      else warn('LINK_AWAITING_VERIFICATION', `${product.productKey}: ${detail}`);
    }
  }
}
const decisionCounts = Object.values(mappings).reduce((counts, mapping) => {
  counts[mapping.editorialDecision] = (counts[mapping.editorialDecision] ?? 0) + 1;
  return counts;
}, { APPROVE: 0, CORRECTED: 0, HOLD: 0 });

const disclosureFiles = [join(root, 'src', 'components', 'Footer.astro'), join(root, 'src', 'components', 'affiliate', 'AffiliateDisclosure.astro')];
const disclosureSource = (await Promise.all(disclosureFiles.map((path) => readFile(path, 'utf8')))).join('\n');
if (!disclosureSource.includes(affiliateConfig.disclosureText) && !disclosureSource.includes('affiliateConfig.disclosureText')) fail('MISSING_DISCLOSURE', 'The exact required disclosure is not wired into the site and affiliate component.');

const componentFiles = (await readdir(join(root, 'src', 'components', 'affiliate'))).filter((file) => file.endsWith('.astro'));
const componentSource = (await Promise.all(componentFiles.map((file) => readFile(join(root, 'src', 'components', 'affiliate', file), 'utf8')))).join('\n');
if (/\/redirect|window\.location|location\.href/.test(componentSource)) fail('CLOAKED_DESTINATION', 'Affiliate components contain redirect behavior.');
if (/amazon\s*(price|rating|review|prime|availability)/i.test(componentSource)) fail('FORBIDDEN_DISPLAY', 'Affiliate components contain prohibited Amazon commerce claims.');

for (const item of warnings) console.warn(`WARN ${item.code}: ${item.message}`);
for (const item of errors) console.error(`ERROR ${item.code}: ${item.message}`);
console.log(`Affiliate audit: mode=${mode}, guides=${articles.length}, products=${Object.keys(registry).length}, APPROVE=${decisionCounts.APPROVE}, CORRECTED=${decisionCounts.CORRECTED}, HOLD=${decisionCounts.HOLD}, warnings=${warnings.length}, errors=${errors.length}`);
if (errors.length) process.exitCode = 1;
