import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildArticleMappings, buildProductRegistry, csv, scanEligibleGuides } from './lib/affiliate-inventory.mjs';
import { buildFinalRolloutReport } from './lib/final-rollout-report.mjs';
import { indexCsvRecords, parseCsvRecords } from './lib/csv.mjs';
import { editorialMappingOverrides } from '../src/affiliate/editorial-mapping-overrides.ts';
import { affiliateConfig } from '../src/affiliate/config.ts';
import { articlePlacementOverrides } from '../src/affiliate/article-placement-overrides.ts';
import { productVerificationOverrides } from '../src/affiliate/product-verification-overrides.ts';
import { relationshipClassifications } from '../src/affiliate/relationship-classification.ts';

const root = process.cwd();
const reportDirectory = join(root, 'reports', 'affiliate');
const registryPath = join(root, 'src', 'affiliate', 'product-registry.generated.json');
const mappingsPath = join(root, 'src', 'affiliate', 'article-mappings.generated.json');
const linkQueuePath = join(reportDirectory, 'link-verification-queue.csv');
const imageQueuePath = join(reportDirectory, 'image-rights-queue.csv');

async function readJson(path) {
  try { return JSON.parse(await readFile(path, 'utf8')); } catch { return {}; }
}

async function readCsvIndex(path) {
  try { return indexCsvRecords(parseCsvRecords(await readFile(path, 'utf8'))); } catch { return {}; }
}
function retainHumanValue(value, fallback, placeholders = []) {
  return value !== undefined && value !== '' && !placeholders.includes(value) ? value : fallback;
}


const articles = await scanEligibleGuides();
const existingMappings = await readJson(mappingsPath);
const detectedMappings = buildArticleMappings(articles);
let mappings = buildArticleMappings(articles, existingMappings, editorialMappingOverrides, articlePlacementOverrides, relationshipClassifications);
const mappedProductKeys = [...new Set(Object.values(mappings).flatMap((mapping) => [
  ...mapping.primaryProductKeys,
  ...mapping.alternativeProductKeys
]))];
const discoveredRegistry = buildProductRegistry(articles, await readJson(registryPath), [...mappedProductKeys, ...Object.keys(productVerificationOverrides)]);
const registry = Object.fromEntries(Object.entries(discoveredRegistry).map(([productKey, product]) => [
  productKey, { ...product, ...(productVerificationOverrides[productKey] ?? {}) }
]));
mappings = Object.fromEntries(Object.entries(mappings).map(([slug, mapping]) => {
  const firstProductKey = mapping.primaryProductKeys[0] ?? mapping.alternativeProductKeys[0];
  return [slug, {
    ...mapping,
    officialEvidenceUrl: firstProductKey ? registry[firstProductKey]?.manufacturerUrl ?? '' : ''
  }];
}));
const products = Object.values(registry);
const existingLinkQueue = await readCsvIndex(linkQueuePath);
const existingImageQueue = await readCsvIndex(imageQueuePath);
const actionableProductKeys = [...new Set(Object.values(mappings)
  .filter((mapping) => mapping.editorialDecision !== 'HOLD')
  .flatMap((mapping) => [...mapping.primaryProductKeys, ...mapping.alternativeProductKeys]))].sort();
const actionableProducts = actionableProductKeys.map((productKey) => registry[productKey]);
const verifiedActionableLinks = actionableProducts.filter((product) => product.linkStatus === 'verified').length;
const renderableActionableImages = actionableProducts.filter((product) =>
  ['verified', 'manufacturer_attributed_editorial', 'site_owned'].includes(product.imageRightsStatus)
  && product.imagePathOrUrl && product.imageRightsSource && product.imageVerifiedAt).length;
const monetizableMappings = Object.values(mappings).filter((mapping) => mapping.editorialDecision !== 'HOLD');
const holdMappings = Object.values(mappings).filter((mapping) => mapping.editorialDecision === 'HOLD');
const decisionCounts = Object.values(mappings).reduce((counts, mapping) => {
  counts[mapping.editorialDecision] = (counts[mapping.editorialDecision] ?? 0) + 1;
  return counts;
}, { APPROVE: 0, CORRECTED: 0, HOLD: 0 });

await mkdir(reportDirectory, { recursive: true });
await writeFile(registryPath, `${JSON.stringify(registry, null, 2)}\n`);
await writeFile(mappingsPath, `${JSON.stringify(mappings, null, 2)}\n`);
await writeFile(join(reportDirectory, 'article-inventory.csv'), csv([
  ['slug', 'title', 'category', 'publication_date', 'file_path'],
  ...articles.map((article) => [article.slug, article.title, article.category, article.publishedAt, article.filePath])
]));
await writeFile(join(reportDirectory, 'product-candidates.csv'), csv([
  ['productKey', 'brand', 'model', 'category', 'source_article_count'],
  ...products.map((product) => [product.productKey, product.brand, product.model, product.category, articles.filter((article) => article.productKeys.includes(product.productKey)).length])
]));
await writeFile(linkQueuePath, csv([
  ['productKey', 'brand', 'model', 'exactSpecialLink', 'asin', 'linkSource', 'verifiedAt', 'verifiedBy', 'approvalStatus'],
  ...actionableProducts.map((product) => {
    const existing = existingLinkQueue[product.productKey] ?? {};
    return [product.productKey, product.brand, product.model, retainHumanValue(existing.exactSpecialLink, product.specialLink), retainHumanValue(existing.asin, product.asin), retainHumanValue(existing.linkSource, product.linkSource), retainHumanValue(existing.verifiedAt, product.verifiedAt), retainHumanValue(existing.verifiedBy, product.verifiedBy), retainHumanValue(existing.approvalStatus, product.linkStatus, ['candidate'])];
  })
]));
await writeFile(imageQueuePath, csv([
  ['productKey', 'brand', 'model', 'proposedImageSource', 'imageMode', 'rightsStatus', 'evidenceLocation', 'manufacturerPageUrl', 'attribution', 'verifiedAt', 'imageSha256', 'reviewedBy'],
  ...actionableProducts.map((product) => {
    const existing = existingImageQueue[product.productKey] ?? {};
    return [product.productKey, product.brand, product.model, retainHumanValue(existing.proposedImageSource, product.imagePathOrUrl), retainHumanValue(existing.imageMode, product.imageMode, ['none']), retainHumanValue(existing.rightsStatus, product.imageRightsStatus, ['unknown']), retainHumanValue(existing.evidenceLocation, product.imageRightsSource), retainHumanValue(existing.manufacturerPageUrl, product.manufacturerUrl), retainHumanValue(existing.attribution, product.imageAttribution), retainHumanValue(existing.verifiedAt, product.imageVerifiedAt), retainHumanValue(existing.imageSha256, product.imageSha256), retainHumanValue(existing.reviewedBy, product.imageReviewedBy)];
  })
]));
await writeFile(join(reportDirectory, 'article-product-review.csv'), csv([
  ['slug', 'title', 'editorialDecision', 'detectedProductKeys', 'detectedAlternativeProductKeys', 'detectedMonetizationMode', 'productKeys', 'alternativeProductKeys', 'monetizationMode', 'affiliateRelationship', 'relationshipLabel', 'relationshipType', 'relationshipRationale', 'placementType', 'placementLocation', 'rationale', 'officialEvidenceUrl', 'mappingStatus', 'approvalStatus', 'reviewedAt', 'reviewedBy'],
  ...articles.map((article) => {
    const mapping = mappings[article.slug];
    const detected = detectedMappings[article.slug];
    return [article.slug, article.title, mapping.editorialDecision, detected.primaryProductKeys.join('|'), detected.alternativeProductKeys.join('|'), detected.monetizationMode, mapping.primaryProductKeys.join('|'), mapping.alternativeProductKeys.join('|'), mapping.monetizationMode, mapping.affiliateRelationship, mapping.relationshipLabel, mapping.relationshipType, mapping.relationshipRationale, mapping.placementType, mapping.placementLocation, mapping.recommendationRationale, mapping.officialEvidenceUrl, mapping.mappingStatus, mapping.approvalStatus, mapping.reviewedAt, mapping.reviewedBy];
  })
]));
await writeFile(join(reportDirectory, 'affiliate-coverage-report.md'), `# Affiliate coverage report\n\nGenerated deterministically from local Chassis Signal content and the supplied human-verified SiteStripe inventory.\n\n- Eligible guides: ${articles.length}\n- Discovered product candidates: ${products.length}\n- Actionable linked products: ${actionableProductKeys.length}\n- Verified actionable Special Links: ${verifiedActionableLinks}\n- Renderable actionable images: ${renderableActionableImages}\n- Monetized articles: ${monetizableMappings.length}\n- HOLD articles: ${holdMappings.length}\n- Verified supplied Special Links in registry: ${products.filter((product) => product.specialLink).length}\n- Live mode active: ${affiliateConfig.mode === 'live' ? 'yes' : 'no'}\n\n## HOLD articles\n\n${holdMappings.length ? holdMappings.map((mapping) => `- \`${mapping.articleSlug}\``).join('\n') : '- None'}\n\n## Live image-rights policy\n\n- Exact images obtained from official manufacturer pages or manufacturer-hosted media CDNs render with truthful manufacturer attribution and status \`manufacturer_attributed_editorial\`; this status does not claim permission was granted.\n- Where an exact first-party image could not be obtained, a distinct Chassis Signal-owned brand-neutral category illustration renders with status \`site_owned\` and is labelled as an illustration.\n- Amazon-hosted images are prohibited.\n- Every product remains subject to exact vehicle, market, software and function verification.\n`);

const finalRollout = buildFinalRolloutReport(articles, mappings, registry, affiliateConfig.mode);
await writeFile(join(reportDirectory, 'final-affiliate-rollout-report.md'), finalRollout.markdown);
await writeFile(join(reportDirectory, 'final-affiliate-coverage.csv'), csv([
  ['slug', 'title', 'productKeys', 'displayedProducts', 'asins', 'placementRelationship', 'relationshipLabel', 'why', 'officialEvidenceUrls', 'affiliateUrlStatus', 'imageSources', 'imageAttributions', 'imageRightsStatus', 'disclosureStatus', 'renderStatus'],
  ...finalRollout.rows.map((row) => [
    row.slug, row.title, row.productKeys, row.displayedProducts, row.asins,
    row.placementRelationship, row.relationshipLabel, row.why, row.officialEvidenceUrls,
    row.affiliateUrlStatus, row.imageSources, row.imageAttributions, row.imageRightsStatus,
    row.disclosureStatus, row.renderStatus
  ])
]));

const changedMappings = articles
  .filter((article) => {
    const before = detectedMappings[article.slug];
    const after = mappings[article.slug];
    return before.primaryProductKeys.join('|') !== after.primaryProductKeys.join('|')
      || before.alternativeProductKeys.join('|') !== after.alternativeProductKeys.join('|')
      || before.monetizationMode !== after.monetizationMode;
  })
  .map((article) => {
    const before = detectedMappings[article.slug];
    const after = mappings[article.slug];
    const format = (mapping) => `primary=[${mapping.primaryProductKeys.join(', ')}]; alternative=[${mapping.alternativeProductKeys.join(', ')}]; mode=${mapping.monetizationMode}`;
    return `- \`${article.slug}\` (${after.editorialDecision})\n  - Before: ${format(before)}\n  - After: ${format(after)}`;
  });

await writeFile(join(reportDirectory, 'editorial-correction-report.md'), `# Affiliate editorial correction report\n\nDraft-only correction pass. No links, ASINs, images, prices or affiliate anchors were added.\n\n- Eligible guides: ${articles.length}\n- APPROVE: ${decisionCounts.APPROVE}\n- CORRECTED: ${decisionCounts.CORRECTED}\n- HOLD: ${decisionCounts.HOLD}\n- Material before/after mapping changes: ${changedMappings.length}\n\n## Changed mappings\n\n${changedMappings.join('\n')}\n`);

console.log(JSON.stringify({ eligibleGuides: articles.length, discoveredProductCandidates: products.length, actionableProducts: actionableProductKeys.length, monetizableArticles: monetizableMappings.length, holdArticles: holdMappings.length, decisions: decisionCounts, reportDirectory: 'reports/affiliate' }));
