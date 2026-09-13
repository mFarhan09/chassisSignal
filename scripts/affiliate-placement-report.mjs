import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { csv } from './lib/affiliate-inventory.mjs';
import { secondaryPlacements, summarizePlacement } from '../src/affiliate/placement-classification.ts';

const root = process.cwd();
const reportDirectory = join(root, 'reports', 'affiliate');
const mappings = JSON.parse(await readFile(join(root, 'src', 'affiliate', 'article-mappings.generated.json'), 'utf8'));
const registry = JSON.parse(await readFile(join(root, 'src', 'affiliate', 'product-registry.generated.json'), 'utf8'));

const name = (key) => (registry[key] ? `${registry[key].brand} ${registry[key].model}` : key);
const variantFor = (mode) =>
  mode === 'comparison' ? 'comparison_card'
    : mode === 'recommended_equipment' || mode === 'compatible_adapter' ? 'recommended_equipment'
      : 'product_card';

const slugs = Object.keys(mappings).sort();
const rows = slugs.map((slug) => {
  const mapping = mappings[slug];
  const summary = summarizePlacement(mapping, slug);
  const secondary = secondaryPlacements[slug] ?? [];
  const primaryVariant = variantFor(mapping.monetizationMode);
  const placementTypes = [primaryVariant, ...secondary.map(() => 'inline_cta')];
  const products = [...mapping.primaryProductKeys, ...summary.secondaryProductKeys];
  return {
    slug,
    oldCount: 1,
    newCount: summary.placementCount,
    classification: summary.classification,
    products: products.map(name).join(', '),
    placementTypes: placementTypes.join(' + '),
    addedReason: secondary.map((placement) => `${name(placement.productKey)} — ${placement.role}: ${placement.distinctnessReason}`).join(' || ') || '(none — one placement sufficient)',
    status: 'OK',
  };
});

const counts = rows.reduce((acc, row) => { acc[row.classification] = (acc[row.classification] ?? 0) + 1; return acc; }, {});
const added = rows.reduce((sum, row) => sum + (row.newCount - row.oldCount), 0);

await mkdir(reportDirectory, { recursive: true });
await writeFile(join(reportDirectory, 'placement-classification.csv'), csv([
  ['slug', 'oldPlacementCount', 'newPlacementCount', 'classification', 'products', 'placementTypes', 'reasonForAddedPlacement', 'status'],
  ...rows.map((row) => [row.slug, row.oldCount, row.newCount, row.classification, row.products, row.placementTypes, row.addedReason, row.status]),
]));

const onePlacement = rows.filter((row) => row.newCount === 1);
const twoPlacement = rows.filter((row) => row.newCount === 2);
const threePlacement = rows.filter((row) => row.newCount === 3);

const md = `# Contextual multi-placement classification — all 58 articles

Generated deterministically from the approved article mappings and the contextual
placement classification. QUALITY CONTROLS MONETIZATION: a second/third placement
exists only where the article develops a genuinely distinct reader decision served
by a different, already-approved, human-verified, defensibly linkable product.

- Total articles: ${rows.length}
- ONE_PLACEMENT_SUFFICIENT: ${counts.ONE_PLACEMENT_SUFFICIENT ?? 0}
- TWO_PLACEMENTS_JUSTIFIED: ${counts.TWO_PLACEMENTS_JUSTIFIED ?? 0}
- THREE_PLACEMENTS_JUSTIFIED: ${counts.THREE_PLACEMENTS_JUSTIFIED ?? 0}
- New placements added: ${added}

## Per-article audit

| slug | old | new | classification | products | placement types | reason for added placement |
| --- | --- | --- | --- | --- | --- | --- |
${rows.map((row) => `| \`${row.slug}\` | ${row.oldCount} | ${row.newCount} | ${row.classification} | ${row.products} | ${row.placementTypes} | ${row.addedReason} |`).join('\n')}

## Articles receiving a second placement (all distinct decisions)

${twoPlacement.map((row) => `- \`${row.slug}\`: ${row.addedReason}`).join('\n') || '- None'}

## Articles receiving a third placement

${threePlacement.map((row) => `- \`${row.slug}\``).join('\n') || '- None. No article surfaced three distinct, defensible, linkable product decisions that survived the zero-commission test.'}

## Articles that remain at one placement (and why)

A single placement is the correct outcome for these ${onePlacement.length} articles: comparison
guides already resolve the comparison + final decision in one comparison card; single-product
guides make one exact recommendation; app-compatibility guides deliberately surface the one
documented adapter; and additional products these articles mention (e.g. Foxwell NT530/NT710,
generic ENET/K+DCAN cables, Carly/ANCEL hardware) have no approved, verified affiliate listing,
so no second placement can be defensible without inventing a link.

${onePlacement.map((row) => `- \`${row.slug}\``).join('\n')}
`;
await writeFile(join(reportDirectory, 'placement-classification-report.md'), md);
console.log(JSON.stringify({ articles: rows.length, ...counts, newPlacementsAdded: added }));
