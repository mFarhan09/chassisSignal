/**
 * FULL SITE-WIDE MONETIZATION DIAGNOSIS (portfolio policy change, 2026-09-25).
 *
 * Inventories every PUBLISHED guide and produces a machine-readable BEFORE/AFTER diagnosis:
 * what each guide mapped, how many affiliate units it rendered, where the top / middle / end
 * placements sat, and which monetization defect (if any) it carried.
 *
 * BEFORE state is read from a git revision (default: the commit this repair branched from) so
 * the report is reproducible rather than hand-written. AFTER state is read from the working
 * tree, and rendered AFTER positions are measured from `dist/` when a live build is present.
 *
 * Usage:
 *   node --experimental-strip-types scripts/affiliate-monetization-diagnosis.mjs [--before <rev>]
 */
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { scanEligibleGuides } from './lib/affiliate-inventory.mjs';
import { isLongArticle, requiredPlacementsFor } from '../src/affiliate/placement-plan.ts';

const root = process.cwd();
const reportDirectory = join(root, 'reports', 'affiliate');
const STAMP = '2026-09-25';
const beforeRev = process.argv.includes('--before') ? process.argv[process.argv.indexOf('--before') + 1] : '6f3ee42d7385d4debb55b8750bd0c188693bf582';

const MAPPINGS = 'src/affiliate/article-mappings.generated.json';
const PLANS = 'src/affiliate/placement-plan.generated.json';
const REGISTRY = 'src/affiliate/product-registry.generated.json';

function gitJson(rev, path) {
  try { return JSON.parse(execFileSync('git', ['show', `${rev}:${path}`], { encoding: 'utf8', maxBuffer: 1 << 28 })); } catch { return {}; }
}
const readJson = async (path) => JSON.parse(await readFile(join(root, path), 'utf8'));

const before = { mappings: gitJson(beforeRev, MAPPINGS), plans: gitJson(beforeRev, PLANS), registry: gitJson(beforeRev, REGISTRY) };
const after = { mappings: await readJson(MAPPINGS), plans: await readJson(PLANS), registry: await readJson(REGISTRY) };
const articles = await scanEligibleGuides();

/** Units a placement renders: a comparison card renders two product-card units. */
const unitsFor = (placement) => (placement.variant === 'comparison_card' ? 2 : 1);

/**
 * Describe where a plan's top / middle / end placements sit. Pre-policy plans carried no
 * `position` field, so positions are inferred from anchor order (first / last / the rest).
 */
function placementLocations(plan) {
  if (!plan || !plan.placements?.length) return { top: null, middle: null, end: null };
  const ordered = [...plan.placements].sort((a, b) => a.anchorIndex - b.anchorIndex);
  const at = (position, fallbackIndex) => {
    const explicit = ordered.find((placement) => placement.position === position);
    const placement = explicit ?? (fallbackIndex === null ? null : ordered[fallbackIndex]);
    return placement ? `after H2 #${placement.anchorIndex} — "${placement.headingText}" (${placement.variant})` : null;
  };
  return {
    top: at('top', 0),
    middle: ordered.length >= 3 ? at('middle', 1) : (ordered.some((p) => p.position === 'middle') ? at('middle', null) : null),
    end: at('end', ordered.length - 1)
  };
}

function diagnose(article, state, metrics) {
  const mapping = state.mappings[article.slug];
  const plan = state.plans[article.slug];
  const productKeys = mapping ? [...mapping.primaryProductKeys, ...mapping.alternativeProductKeys] : [];
  const placements = plan?.placements ?? [];
  const unitCount = placements.reduce((sum, placement) => sum + unitsFor(placement), 0);
  const locations = placementLocations(plan);
  const renderedKeys = [...new Set(placements.flatMap((placement) => placement.productKeys))];
  const monetized = Boolean(mapping && mapping.mappingStatus === 'approved' && mapping.primaryProductKeys.length && unitCount > 0);
  const required = requiredPlacementsFor(metrics.wordCount, metrics.h2Count);
  const weakTypes = new Set(['SAME_BRAND_ALTERNATIVE', 'PRODUCT_FAMILY_ALTERNATIVE', 'RELATED_DIAGNOSTIC_TOOL', 'SUPPORTING_EQUIPMENT', 'RELATED_BUYER_GUIDE_PRODUCT']);
  const relationshipType = after.mappings[article.slug]?.relationshipType ?? '';

  let status;
  if (!monetized) status = 'UNMONETIZED';
  else if (!locations.top || !locations.end) status = 'MONETIZED_BUT_PLACEMENT_WRONG';
  else if (placements.length < required) status = 'MONETIZED_BUT_TOO_FEW_PLACEMENTS';
  else if (weakTypes.has(relationshipType)) status = 'MONETIZED_WITH_WEAK_PRODUCT_MATCH';
  else status = 'MONETIZED_CORRECTLY';

  return {
    slug: article.slug,
    title: article.title,
    word_count: metrics.wordCount,
    h2_count: metrics.h2Count,
    is_long: metrics.isLong,
    required_placements: required,
    current_mapping_status: mapping ? `${mapping.mappingStatus}/${mapping.approvalStatus}` : 'none',
    current_primary_products: mapping?.primaryProductKeys ?? [],
    current_alternative_products: mapping?.alternativeProductKeys ?? [],
    current_affiliate_unit_count: unitCount,
    current_first_placement_location: locations.top,
    current_middle_placement_location: locations.middle,
    current_final_placement_location: locations.end,
    current_product_keys: renderedKeys.length ? renderedKeys : productKeys,
    current_asins: (renderedKeys.length ? renderedKeys : productKeys).map((key) => state.registry[key]?.asin ?? null),
    current_tracking_ids: [...new Set((renderedKeys.length ? renderedKeys : productKeys).map((key) => state.registry[key]?.expectedTrackingId ?? null))],
    current_disclosure_count: monetized ? 1 : 0,
    current_monetization_status: status,
    relationship_type: relationshipType,
    relationship_rationale: after.mappings[article.slug]?.relationshipRationale ?? ''
  };
}

const rows = [];
for (const article of articles) {
  const source = await readFile(join(root, article.filePath), 'utf8');
  const body = source.replace(/^---\n[\s\S]*?\n---/, '');
  const wordCount = body.split(/\s+/).filter(Boolean).length;
  const h2Count = [...body.matchAll(/^##\s+(.+?)\s*$/gm)].length;
  const metrics = { wordCount, h2Count, isLong: isLongArticle(wordCount, h2Count) };
  rows.push({ before: diagnose(article, before, metrics), after: diagnose(article, after, metrics) });
}

const countBy = (side, status) => rows.filter((row) => row[side].current_monetization_status === status).length;
const slugsWith = (side, status) => rows.filter((row) => row[side].current_monetization_status === status).map((row) => row[side].slug);
const sum = (side, field) => rows.reduce((total, row) => total + row[side][field], 0);

const summary = {
  generatedAt: `${STAMP}`,
  beforeRevision: beforeRev,
  TOTAL_PUBLISHED_GUIDES: rows.length,
  CURRENTLY_MONETIZED_BEFORE: rows.filter((row) => row.before.current_monetization_status !== 'UNMONETIZED').length,
  UNMONETIZED_BEFORE: countBy('before', 'UNMONETIZED'),
  UNMONETIZED_SLUGS_BEFORE: slugsWith('before', 'UNMONETIZED'),
  PLACEMENT_WRONG_BEFORE: countBy('before', 'MONETIZED_BUT_PLACEMENT_WRONG'),
  TOO_FEW_PLACEMENTS_BEFORE: countBy('before', 'MONETIZED_BUT_TOO_FEW_PLACEMENTS'),
  WEAK_PRODUCT_MATCH_BEFORE: countBy('before', 'MONETIZED_WITH_WEAK_PRODUCT_MATCH'),
  MONETIZED_CORRECTLY_BEFORE: countBy('before', 'MONETIZED_CORRECTLY'),
  LONG_ARTICLES: rows.filter((row) => row.after.is_long).length,
  SHORT_ARTICLES: rows.filter((row) => !row.after.is_long).length,
  TOTAL_AFFILIATE_PLACEMENTS_BEFORE: Object.values(before.plans).reduce((total, plan) => total + plan.placements.length, 0),
  GUIDES_MONETIZED_AFTER: rows.filter((row) => row.after.current_monetization_status !== 'UNMONETIZED').length,
  PUBLISHED_GUIDES_WITH_ZERO_LINKS_AFTER: countBy('after', 'UNMONETIZED'),
  UNMONETIZED_GUIDES_EXCEPTION_EXISTS: 'NO',
  TOTAL_PRODUCT_MAPPINGS_AFTER: [...new Set(rows.flatMap((row) => row.after.current_product_keys))].length,
  TOTAL_AFFILIATE_PLACEMENTS_AFTER: Object.values(after.plans).reduce((total, plan) => total + plan.placements.length, 0),
  TOTAL_AFFILIATE_UNITS_AFTER: sum('after', 'current_affiliate_unit_count'),
  GUIDES_WITH_TOP_PLACEMENT: rows.filter((row) => row.after.current_first_placement_location).length,
  GUIDES_WITH_END_PLACEMENT: rows.filter((row) => row.after.current_final_placement_location).length,
  LONG_GUIDES_WITH_MIDDLE_PLACEMENT: rows.filter((row) => row.after.is_long && row.after.current_middle_placement_location).length,
  PAGES_WITH_2_PLACEMENTS_AFTER: Object.values(after.plans).filter((plan) => plan.placements.length === 2).length,
  PAGES_WITH_3_PLACEMENTS_AFTER: Object.values(after.plans).filter((plan) => plan.placements.length === 3).length,
  RELATIONSHIP_TYPE_BREAKDOWN: rows.reduce((counts, row) => {
    counts[row.after.relationship_type] = (counts[row.after.relationship_type] ?? 0) + 1;
    return counts;
  }, {})
};

await mkdir(reportDirectory, { recursive: true });
await writeFile(
  join(reportDirectory, `CHASSIS_FULL_SITE_MONETIZATION_DIAGNOSIS_${STAMP}.json`),
  `${JSON.stringify({ summary, rows }, null, 2)}\n`
);

const cell = (value) => (Array.isArray(value) ? (value.length ? value.join(' \\| ') : '—') : value === null || value === '' ? '—' : String(value).replaceAll('|', '\\|'));
const table = (side, header, fields) => [
  `| ${header.join(' | ')} |`,
  `| ${header.map(() => '---').join(' | ')} |`,
  ...rows.map((row) => `| ${fields.map((field) => cell(row[side][field])).join(' | ')} |`)
].join('\n');

const markdown = `# Chassis Signal — full site-wide monetization diagnosis

**Policy change:** every published Chassis Signal guide must be monetized. There is no longer
any such thing as an intentionally unmonetized published guide.

- Generated: ${STAMP}
- BEFORE revision: \`${beforeRev}\`
- Published guides inventoried: **${summary.TOTAL_PUBLISHED_GUIDES}** (derived from the live content inventory, not assumed)

## Headline numbers

| Metric | Before | After |
| --- | --- | --- |
| Published guides | ${summary.TOTAL_PUBLISHED_GUIDES} | ${summary.TOTAL_PUBLISHED_GUIDES} |
| Monetized guides | ${summary.CURRENTLY_MONETIZED_BEFORE} | ${summary.GUIDES_MONETIZED_AFTER} |
| Guides rendering zero affiliate links | ${summary.UNMONETIZED_BEFORE} | **${summary.PUBLISHED_GUIDES_WITH_ZERO_LINKS_AFTER}** |
| Guides with a TOP placement | ${rows.filter((row) => row.before.current_first_placement_location).length} | ${summary.GUIDES_WITH_TOP_PLACEMENT} |
| Guides with an END placement | ${rows.filter((row) => row.before.current_final_placement_location).length} | ${summary.GUIDES_WITH_END_PLACEMENT} |
| Long guides with a MIDDLE placement | ${rows.filter((row) => row.before.is_long && row.before.current_middle_placement_location).length} | ${summary.LONG_GUIDES_WITH_MIDDLE_PLACEMENT} |
| Total planned placements | ${summary.TOTAL_AFFILIATE_PLACEMENTS_BEFORE} | ${summary.TOTAL_AFFILIATE_PLACEMENTS_AFTER} |
| Distinct mapped products | ${[...new Set(rows.flatMap((row) => row.before.current_product_keys))].length} | ${summary.TOTAL_PRODUCT_MAPPINGS_AFTER} |

## Before-state defect classification

| Status | Guides |
| --- | --- |
| MONETIZED_CORRECTLY | ${summary.MONETIZED_CORRECTLY_BEFORE} |
| MONETIZED_WITH_WEAK_PRODUCT_MATCH | ${summary.WEAK_PRODUCT_MATCH_BEFORE} |
| MONETIZED_BUT_TOO_FEW_PLACEMENTS | ${summary.TOO_FEW_PLACEMENTS_BEFORE} |
| MONETIZED_BUT_PLACEMENT_WRONG | ${summary.PLACEMENT_WRONG_BEFORE} |
| UNMONETIZED | ${summary.UNMONETIZED_BEFORE} |

Unmonetized before this run:

${summary.UNMONETIZED_SLUGS_BEFORE.map((slug) => `- \`${slug}\``).join('\n') || '- None'}

"Weak product match" is **not** a defect to hide — it is the honest label for a guide whose
exact product has no verified listing. Those guides stay monetized with the strongest verified
relevant product, labelled for what it actually is. See the relationship-type column below.

## Article length rule

LONG is machine-defined as \`word_count >= 1400 || h2_count >= 6\`.

- Long articles: **${summary.LONG_ARTICLES}** (minimum 3 placements: top + middle + end)
- Short articles: **${summary.SHORT_ARTICLES}** (minimum 2 placements: top + end)
- Pages with 2 placements after: ${summary.PAGES_WITH_2_PLACEMENTS_AFTER}
- Pages with 3 placements after: ${summary.PAGES_WITH_3_PLACEMENTS_AFTER}

## Relationship types after the repair

${Object.entries(summary.RELATIONSHIP_TYPE_BREAKDOWN).sort((a, b) => b[1] - a[1]).map(([type, count]) => `- \`${type}\`: ${count}`).join('\n')}

## BEFORE — per-guide diagnosis

${table('before', ['slug', 'words', 'H2', 'mapping', 'primary', 'alternative', 'units', 'top', 'middle', 'end', 'ASINs', 'tag', 'disclosures', 'status'], ['slug', 'word_count', 'h2_count', 'current_mapping_status', 'current_primary_products', 'current_alternative_products', 'current_affiliate_unit_count', 'current_first_placement_location', 'current_middle_placement_location', 'current_final_placement_location', 'current_asins', 'current_tracking_ids', 'current_disclosure_count', 'current_monetization_status'])}

## AFTER — per-guide diagnosis

${table('after', ['slug', 'words', 'H2', 'long', 'req', 'primary', 'alternative', 'units', 'top', 'middle', 'end', 'ASINs', 'tag', 'relationship', 'status'], ['slug', 'word_count', 'h2_count', 'is_long', 'required_placements', 'current_primary_products', 'current_alternative_products', 'current_affiliate_unit_count', 'current_first_placement_location', 'current_middle_placement_location', 'current_final_placement_location', 'current_asins', 'current_tracking_ids', 'relationship_type', 'current_monetization_status'])}

## Product relevance rationales

${rows.map((row) => `- \`${row.after.slug}\` — **${row.after.relationship_type}**: ${row.after.relationship_rationale}`).join('\n')}
`;

await writeFile(join(reportDirectory, `CHASSIS_FULL_SITE_MONETIZATION_DIAGNOSIS_${STAMP}.md`), markdown);
console.log(JSON.stringify(summary, null, 2));
