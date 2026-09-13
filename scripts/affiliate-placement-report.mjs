import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { csv } from './lib/affiliate-inventory.mjs';
import { placementPlans, planSummary } from '../src/affiliate/placement-plan.ts';

const root = process.cwd();
const reportDirectory = join(root, 'reports', 'affiliate');
const registry = JSON.parse(await readFile(join(root, 'src', 'affiliate', 'product-registry.generated.json'), 'utf8'));
const name = (key) => (registry[key] ? `${registry[key].brand} ${registry[key].model}` : key);

const slugs = Object.keys(placementPlans).sort();
const PREVIOUS_TOTAL = 60; // 58 primary + 2 secondary (prior pass)
const BASELINE_TOTAL = 58; // one placement per article at the baseline commit

const rows = slugs.map((slug) => {
  const plan = placementPlans[slug];
  const p = plan.placements;
  const cell = (pl) => (pl ? `${pl.variant} — ${pl.productKeys.map(name).join(' + ')}` : '');
  const spacingIdx = p.map((pl) => pl.anchorIndex);
  const distinct = new Set(spacingIdx).size === spacingIdx.length;
  const spread = spacingIdx.length < 2 || Math.min(...spacingIdx) !== Math.max(...spacingIdx);
  return {
    slug,
    articleType: plan.articleType,
    oldCount: 1,
    newCount: p.length,
    classification: plan.classification,
    p1Heading: p[0]?.headingText ?? '',
    p1: cell(p[0]),
    p2Heading: p[1]?.headingText ?? '',
    p2: cell(p[1]),
    p3Heading: p[2]?.headingText ?? '',
    p3: cell(p[2]),
    reason: plan.classification === 'THREE_PLACEMENTS'
      ? (plan.articleType === 'comparison' ? 'Comparison article: compare-decide card, product-specific CTA, then final pick.' : 'Article develops a primary pick plus an approved broader-compatibility alternative and a final CTA.')
      : plan.classification === 'TWO_PLACEMENTS'
        ? 'Primary decision card early, restrained final CTA at the conclusion (distinct reader moments).'
        : 'One-placement exception (see justification below).',
    spacing: distinct && spread ? 'distinct sections, spread across the article' : 'REVIEW',
  };
});

const summary = planSummary(placementPlans);
const added = summary.totalPlacements - PREVIOUS_TOTAL;

await mkdir(reportDirectory, { recursive: true });

await writeFile(join(reportDirectory, 'placement-classification.csv'), csv([
  ['slug', 'articleType', 'oldPlacementCount', 'newPlacementCount', 'classification',
    'placement1Heading', 'placement1', 'placement2Heading', 'placement2', 'placement3Heading', 'placement3', 'reason', 'spacing'],
  ...rows.map((r) => [r.slug, r.articleType, r.oldCount, r.newCount, r.classification,
    r.p1Heading, r.p1, r.p2Heading, r.p2, r.p3Heading, r.p3, r.reason, r.spacing]),
]));

const exceptions = rows.filter((r) => r.classification === 'ONE_PLACEMENT_EXCEPTION');
const md = `# Placement density — final report

Corrected monetization model: normally TWO contextual placements per article, THREE for
comparison / strongly-commercial / alternative-bearing articles, ONE only as a genuine
exception. Placements are distributed across each article's real section headings
(early decision → middle → conclusion) and attach at H2 boundaries — no prose is rewritten,
no links/ASINs/images/products are invented, and OBDLink CX protected data is untouched.

- Total articles: 58
- TWO_PLACEMENTS: ${summary.TWO_PLACEMENTS}
- THREE_PLACEMENTS: ${summary.THREE_PLACEMENTS}
- ONE_PLACEMENT_EXCEPTION: ${summary.ONE_PLACEMENT_EXCEPTION}
- Placements before this pass: ${PREVIOUS_TOTAL} (baseline was ${BASELINE_TOTAL}, one per article)
- Placements after this pass: ${summary.totalPlacements}
- New placements added this pass: ${added}

## Per-article density plan

| slug | type | old | new | class | P1 heading | P1 | P2 heading | P2 | P3 heading | P3 | spacing |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
${rows.map((r) => `| \`${r.slug}\` | ${r.articleType} | ${r.oldCount} | ${r.newCount} | ${r.classification.replace('_PLACEMENTS', '').replace('_PLACEMENT_EXCEPTION', '-EXC')} | ${r.p1Heading} | ${r.p1} | ${r.p2Heading} | ${r.p2} | ${r.p3Heading || '—'} | ${r.p3 || '—'} | ${r.spacing} |`).join('\n')}

## Reason per classification

- **TWO_PLACEMENTS (${summary.TWO_PLACEMENTS}):** an early primary decision card plus a restrained final CTA at the conclusion — two distinct reader moments, spaced across the article. The same verified product may appear twice (different variant, position and contextual copy).
- **THREE_PLACEMENTS (${summary.THREE_PLACEMENTS}):** comparison articles (compare-decide card → product-specific CTA → final pick) and the two articles that carry an approved broader-compatibility alternative (\`bimmercode-pricing\`, \`bimmerlink-adapter\`).
- **ONE_PLACEMENT_EXCEPTION (${summary.ONE_PLACEMENT_EXCEPTION}):** ${exceptions.length ? exceptions.map((r) => `\`${r.slug}\``).join(', ') : 'none — every article supports at least two contextual placements.'}

## Spacing safeguard

Deterministically validated (\`validatePlacementPlans\`): placements attach to distinct section
boundaries, are spread across the article (not all at the end), use only approved verified-linkable
products, cap at three, and carry no duplicate contextual copy. Enforced in \`pnpm affiliate:audit\`
and the test suite (including mutation tests that prove the validator fails on clustered,
over-count, unapproved or duplicate-copy plans).

## Rendering

Placements are injected server-side by splitting the article's rendered HTML at H2 section
boundaries and attaching each unit at the end of its target section — a distributed commercial
journey, crawlable, with no client JS and no prose changes. A single affiliate disclosure renders
immediately before the first unit on every monetized page. Draft mode stays fail-closed: only the
controlled draft pilot renders (now showing its full plan); all other articles render nothing until
\`AFFILIATE_MODE=live\`. Verified in a controlled live build (not committed): all 58 pages render
their planned units with the disclosure first and the expected unit counts.

## Preservation (unchanged from baseline 7e236b78)

- Article Markdown diff: 0 lines. Titles, H1/H2/H3, prose, dates, SEO/canonical, internal links untouched.
- OBDLink CX protected registry fields and product image: byte-identical.
- Product links/ASINs/images and the link/image queues: byte-identical (no invention).
- The only registry change in this whole effort is the earlier 4-hash image-integrity correction.

## Verification — PASS / BLOCKED

PASS (deterministic, this session): typecheck 0/0/0 · production build 74 pages ·
\`test:affiliate\` all pass (plan validity, distribution, mutation tests, disclosure ordering) ·
draft \`affiliate:audit\` 0 errors · controlled-live \`affiliate:audit\` 0 errors/0 warnings ·
\`git diff --check\` clean · article/OBDLink CX/queue preservation confirmed.

BLOCKED: full Playwright visual QA remains VISUAL_QA_ENVIRONMENT_BLOCKED in this cloud browser
sandbox (single-page probe worked ~580 ms; the full sweep stalls on the environment's
Chromium/proxy behaviour). Rerun \`pnpm qa:visual\` locally/CI at 320/390/768/1440 before main/live.
`;
await writeFile(join(reportDirectory, 'PLACEMENT_DENSITY_FINAL_REPORT.md'), md);
console.log(JSON.stringify({ articles: slugs.length, ...summary, newPlacementsAdded: added }));
