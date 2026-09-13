import { readFile, readdir } from 'node:fs/promises';
import { basename, join, relative } from 'node:path';
import { affiliateConfig } from '../../src/affiliate/config.ts';
import { candidateByKey, detectProductKeys, productCandidateCatalog } from '../../src/affiliate/catalog.ts';

const ARTICLES_DIRECTORY = join(process.cwd(), 'src', 'content', 'articles');

function unquote(value = '') {
  const trimmed = value.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) return trimmed.slice(1, -1);
  return trimmed;
}

function scalar(frontmatter, key, fallback = '') {
  return unquote(frontmatter.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))?.[1] ?? fallback);
}

function array(frontmatter, key) {
  const source = frontmatter.match(new RegExp(`^${key}:\\s*\\[(.*)\\]$`, 'm'))?.[1] ?? '';
  return source.split(',').map(unquote).filter(Boolean);
}

export function parseArticleSource(filePath, source) {
  const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
  const title = scalar(frontmatter, 'title', basename(filePath, '.md'));
  const slug = scalar(frontmatter, 'slug', basename(filePath, '.md'));
  const headings = [...source.matchAll(/^#{1,6}\s+(.+)$/gm)].map((match) => match[1]);
  const productText = [title, slug, ...array(frontmatter, 'products'), ...headings, source].join('\n');
  return {
    slug,
    title,
    section: scalar(frontmatter, 'section', 'research'),
    publishedAt: scalar(frontmatter, 'publishedAt'),
    category: scalar(frontmatter, 'category', 'Uncategorized'),
    filePath: relative(process.cwd(), filePath).replaceAll('\\', '/'),
    draft: scalar(frontmatter, 'draft', 'false') === 'true',
    relatedSlugs: array(frontmatter, 'relatedSlugs'),
    productKeys: detectProductKeys(productText)
  };
}

export async function scanEligibleGuides() {
  const files = (await readdir(ARTICLES_DIRECTORY, { recursive: true, withFileTypes: true }))
    .filter((entry) => entry.isFile() && /\.mdx?$/.test(entry.name))
    .map((entry) => join(entry.parentPath ?? entry.path, entry.name))
    .sort();
  const articles = await Promise.all(files.map(async (filePath) => parseArticleSource(filePath, await readFile(filePath, 'utf8'))));
  return articles.filter((article) => article.section === 'guides' && !article.draft).sort((a, b) => a.slug.localeCompare(b.slug));
}

export function buildProductRegistry(articles, existingRegistry = {}, additionalProductKeys = []) {
  const keys = [...new Set([
    ...Object.keys(existingRegistry),
    ...productCandidateCatalog.map((candidate) => candidate.productKey),
    ...articles.flatMap((article) => article.productKeys),
    ...additionalProductKeys
  ])].sort();
  return Object.fromEntries(keys.map((productKey) => {
    const candidate = candidateByKey(productKey);
    if (!candidate) throw new Error(`Unknown product candidate: ${productKey}`);
    const previous = existingRegistry[productKey] ?? {};
    return [productKey, {
      productKey,
      brand: candidate.brand,
      model: candidate.model,
      category: candidate.category,
      asin: previous.asin ?? null,
      marketplace: affiliateConfig.marketplace,
      specialLink: previous.specialLink ?? null,
      expectedTrackingId: affiliateConfig.expectedTrackingId,
      linkSource: previous.linkSource ?? null,
      linkStatus: previous.linkStatus ?? 'candidate',
      verifiedAt: previous.verifiedAt ?? null,
      verifiedBy: previous.verifiedBy ?? null,
      manufacturerUrl: previous.manufacturerUrl ?? null,
      editorialSummary: previous.editorialSummary ?? `${candidate.brand} ${candidate.model} is a candidate identified in existing Chassis Signal editorial content.`,
      compatibilityNotes: previous.compatibilityNotes ?? 'Verify the exact vehicle, software, function, region and product variant before recommendation.',
      imageMode: previous.imageMode ?? 'none',
      imagePathOrUrl: previous.imagePathOrUrl ?? null,
      imageRightsSource: previous.imageRightsSource ?? null,
      imageRightsStatus: previous.imageRightsStatus ?? 'unknown',
      imageVerifiedAt: previous.imageVerifiedAt ?? null,
      imageAttribution: previous.imageAttribution ?? null,
      imageAlt: previous.imageAlt ?? null,
      imageSha256: previous.imageSha256 ?? null,
      imageReviewedBy: previous.imageReviewedBy ?? null,
      lastProductReviewAt: previous.lastProductReviewAt ?? null
    }];
  }));
}

export function buildArticleMappings(articles, existingMappings = {}, editorialOverrides = {}, placementOverrides = {}) {
  const bySlug = new Map(articles.map((article) => [article.slug, article]));
  return Object.fromEntries(articles.map((article) => {
    const keys = article.productKeys;
    const isComparison = /\bvs\b|\bversus\b/i.test(article.title) && keys.length > 1;
    let monetizationMode = keys.length === 0 ? 'no_defensible_product' : isComparison ? 'comparison' : keys.length === 1 ? 'exact_product' : 'recommended_equipment';
    let relatedBuyerGuideSlug = null;
    if (keys.length === 0) {
      relatedBuyerGuideSlug = article.relatedSlugs.find((slug) => bySlug.get(slug)?.productKeys.length) ?? null;
      if (relatedBuyerGuideSlug) monetizationMode = 'related_buyer_guide';
    }
    const previous = existingMappings[article.slug] ?? {};
    let primaryProductKeys = keys.slice(0, isComparison ? 2 : 1);
    let alternativeProductKeys = keys.slice(isComparison ? 2 : 1);
    let recommendationRationale = keys.length
      ? 'Candidate mapping is based on explicit product references in existing Chassis Signal editorial content and requires human editorial approval.'
      : relatedBuyerGuideSlug
        ? 'No defensible exact product was detected; direct readers to a relevant buyer guide after human approval.'
        : 'No defensible exact Amazon product was detected. Keep this guide unmonetized unless editorial review identifies a relevant product.';
    const editorialOverride = editorialOverrides[article.slug];
    if (editorialOverride) {
      monetizationMode = editorialOverride.monetizationMode;
      primaryProductKeys = editorialOverride.primaryProductKeys;
      alternativeProductKeys = editorialOverride.alternativeProductKeys;
      recommendationRationale = editorialOverride.recommendationRationale;
      relatedBuyerGuideSlug = editorialOverride.relatedBuyerGuideSlug;
    }
    const placementType = monetizationMode === 'comparison'
      ? 'comparison_card'
      : monetizationMode === 'related_buyer_guide'
        ? 'related_buyer_guide'
        : monetizationMode === 'no_defensible_product' ? 'none' : monetizationMode === 'recommended_equipment' ? 'recommended_equipment' : 'product_card';
    const defaultRelationship = monetizationMode === 'recommended_equipment'
      ? 'supporting_equipment'
      : monetizationMode === 'compatible_adapter'
        ? 'compatible_interface'
        : 'exact_product';
    const defaultLabel = defaultRelationship === 'supporting_equipment'
      ? 'Supporting equipment for this procedure'
      : defaultRelationship === 'compatible_interface'
        ? 'Compatible interface'
        : monetizationMode === 'comparison' ? 'Products discussed in this guide' : 'Exact product discussed';
    const placementOverride = placementOverrides[article.slug];
    const approved = editorialOverride?.editorialDecision && editorialOverride.editorialDecision !== 'HOLD';
    return [article.slug, {
      articleSlug: article.slug,
      articleIntent: article.title,
      monetizationMode,
      editorialDecision: editorialOverride?.editorialDecision ?? null,
      primaryProductKeys,
      alternativeProductKeys,
      placementType,
      placementLocation: 'after_evidence_context',
      recommendationRationale,
      affiliateRelationship: placementOverride?.affiliateRelationship ?? defaultRelationship,
      relationshipLabel: placementOverride?.relationshipLabel ?? defaultLabel,
      officialEvidenceUrl: '',
      relatedBuyerGuideSlug,
      mappingStatus: approved ? 'approved' : editorialOverride ? 'reviewed' : (previous.mappingStatus ?? 'candidate'),
      approvalStatus: approved ? 'approved' : (previous.approvalStatus ?? 'pending'),
      reviewedAt: approved ? '2026-09-12T19:42:08.000Z' : (previous.reviewedAt ?? null),
      reviewedBy: approved ? 'Muhammad Farhan' : (previous.reviewedBy ?? null)
    }];
  }));
}

export function findRawAmazonUrls(source) {
  const pattern = /https?:\/\/(?:[^\s)\]"']*\.)?(?:amazon\.com|amzn\.to)(?:[^\s)\]"']*)/gi;
  return source.match(pattern) ?? [];
}

export function csv(rows) {
  const escape = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
  return `${rows.map((row) => row.map(escape).join(',')).join('\n')}\n`;
}
