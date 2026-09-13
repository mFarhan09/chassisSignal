import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * Deterministic placement-plan generator.
 *
 * Target monetization model (corrected): normally TWO contextual placements per
 * article, THREE for comparison / strongly-commercial / alternative-bearing
 * articles, ONE only as a genuine exception. Placements are distributed across
 * the article's real section headings (early decision -> middle -> conclusion),
 * never all clustered at the bottom, and never inside prose (they attach at H2
 * section boundaries). No links, ASINs, images, products or prose are invented.
 */

const root = process.cwd();
const articlesDir = join(root, 'src', 'content', 'articles');
const mappings = JSON.parse(await readFile(join(root, 'src', 'affiliate', 'article-mappings.generated.json'), 'utf8'));
const registry = JSON.parse(await readFile(join(root, 'src', 'affiliate', 'product-registry.generated.json'), 'utf8'));

const brandModel = (key) => (registry[key] ? `${registry[key].brand} ${registry[key].model}` : key);
const lower = (s) => s.charAt(0).toLowerCase() + s.slice(1);
const hash = (s) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

const DECISION_KW = /(choose|choosing|choice|compatib|adapter|which|buy|buyer|purchase|decision|compare|comparison|price|pricing|cost|option|candidate|shortlist|scope|select|fit|route|profile)/i;

// Short, unique per-article topic (drawn from the article title) so contextual copy never
// collides across articles that recommend the same product.
function topicOf(mapping) {
  const raw = (mapping.articleIntent || '').split(':')[0].replace(/[.?!]+$/, '').trim();
  return lower(raw);
}

// Contextual lead pools — parameterized by product + section heading + article topic.
function compactLead(key, heading, topic, i) {
  const p = brandModel(key);
  const h = lower(heading.replace(/[.:]+$/, ''));
  const pool = [
    `For ${h} in ${topic}, ${p} is the specific unit to price and check against your exact BMW, app and function.`,
    `This is where ${p} earns its place in ${topic}: confirm ${h} maps to your vehicle and software before you commit.`,
    `On ${h}, ${p} is the option to weigh for ${topic} — verify current vehicle and app support on its listing.`,
  ];
  return pool[i % pool.length];
}
function finalLead(key, heading, topic, i) {
  const p = brandModel(key);
  const h = lower(heading.replace(/[.:]+$/, ''));
  const pool = [
    `Having worked through ${h}, ${p} is the listing to confirm for ${topic} — match your exact vehicle, market and software before buying.`,
    `That makes ${p} the unit to check last for ${topic}: confirm your BMW or MINI, platform and required function on the current listing.`,
    `If ${topic} points you here, ${p} is the defensible pick to verify and buy once your exact configuration checks out.`,
  ];
  return pool[i % pool.length];
}

// Article-specific broader-compatibility alternative context (approved alternatives only).
const ALT_CONTEXT = {
  'bimmercode-pricing': 'If you also service non-BMW vehicles or want the widest legislated-protocol coverage in the same chain, the MX+ is the broader-network hardware path this guide already prices — distinct from the focused CX pick.',
  'bimmerlink-adapter': 'For garages that also work outside the BMW/MINI lane, MX+ is the single broader-network alternative to the focused CX pick — same BimmerLink workflow, wider protocol reach.',
};

function extractHeadings(body) {
  return [...body.matchAll(/^##\s+(.+?)\s*$/gm)].map((m, index) => ({ index, text: m[1].trim() }));
}

function pickAnchor(useful, approx, min, max, kw) {
  const target = Math.min(Math.max(Math.round(approx), min), max);
  // Snap to a keyword-matching heading within +/-1 of the target when possible.
  for (const delta of [0, 1, -1]) {
    const cand = target + delta;
    if (cand >= min && cand <= max && kw.test(useful[cand].text)) return cand;
  }
  return target;
}

const files = (await readdir(articlesDir)).filter((f) => f.endsWith('.md')).sort();
const plans = {};
let counts = { TWO_PLACEMENTS: 0, THREE_PLACEMENTS: 0, ONE_PLACEMENT_EXCEPTION: 0 };
let totalPlacements = 0;

for (const file of files) {
  const slug = file.replace(/\.md$/, '');
  const mapping = mappings[slug];
  const body = (await readFile(join(articlesDir, file), 'utf8')).replace(/^---\n[\s\S]*?\n---/, '');
  const headings = extractHeadings(body);
  const useful = headings.filter((h) => !/^sources consulted/i.test(h.text));
  const U = useful.length;
  const isComparison = mapping.monetizationMode === 'comparison';
  const primary = mapping.primaryProductKeys;
  const alt = mapping.alternativeProductKeys;
  const topic = topicOf(mapping);
  const placements = [];

  // Anchor indices (into the full heading list) at distinct, spread section boundaries.
  const firstIdx = pickAnchor(useful, U * 0.33, 1, Math.max(1, U - 3), DECISION_KW);
  const finalIdx = useful[U - 1].index; // attach after the last useful section (before Sources consulted / at end)
  const finalHeadingText = useful[U - 1].text;

  const wantThree = (isComparison || alt.length > 0) && U >= 6;

  if (wantThree) {
    let midIdx = pickAnchor(useful, U * 0.62, firstIdx + 1, U - 2, /(compar|scope|capabilit|function|coverage|platform|technical|cost|price|matrix|differen)/i);
    if (midIdx <= firstIdx) midIdx = Math.min(firstIdx + 1, U - 2);
    // Placement 1 — early primary decision.
    if (isComparison && primary.length === 2) {
      placements.push({ anchorIndex: useful[firstIdx].index, headingText: useful[firstIdx].text, variant: 'comparison_card', productKeys: primary, role: 'Compare the two options', decisionMoment: 'comparison' });
      // Placement 2 — middle, feature the second compared product individually.
      placements.push({ anchorIndex: useful[midIdx].index, headingText: useful[midIdx].text, variant: 'compact_cta', productKeys: [primary[1]], role: 'Option in focus', decisionMoment: 'technical', context: compactLead(primary[1], useful[midIdx].text, topic, hash(slug)) });
      // Placement 3 — final pick.
      placements.push({ anchorIndex: finalIdx, headingText: finalHeadingText, variant: 'final_cta', productKeys: [primary[0]], role: 'Final pick to verify', decisionMoment: 'final_recommendation', context: finalLead(primary[0], finalHeadingText, topic, hash(slug) + 1) });
    } else {
      // Alternative-bearing single-primary article (CX primary + MX+ approved alternative).
      const primaryVariant = mapping.monetizationMode === 'exact_product' ? 'product_card' : 'recommended_equipment';
      placements.push({ anchorIndex: useful[firstIdx].index, headingText: useful[firstIdx].text, variant: primaryVariant, productKeys: [primary[0]], role: 'Relevant equipment', decisionMoment: 'compatibility' });
      placements.push({ anchorIndex: useful[midIdx].index, headingText: useful[midIdx].text, variant: 'compact_cta', productKeys: [alt[0]], role: 'Broader-compatibility alternative', decisionMoment: 'compatibility', context: ALT_CONTEXT[slug] || compactLead(alt[0], useful[midIdx].text, topic, hash(slug)) });
      placements.push({ anchorIndex: finalIdx, headingText: finalHeadingText, variant: 'final_cta', productKeys: [primary[0]], role: 'Final pick to verify', decisionMoment: 'final_recommendation', context: finalLead(primary[0], finalHeadingText, topic, hash(slug) + 1) });
    }
    counts.THREE_PLACEMENTS++;
  } else {
    // TWO placements: primary decision card early + restrained final CTA at the conclusion.
    if (isComparison && primary.length === 2) {
      placements.push({ anchorIndex: useful[firstIdx].index, headingText: useful[firstIdx].text, variant: 'comparison_card', productKeys: primary, role: 'Compare the two options', decisionMoment: 'comparison' });
      placements.push({ anchorIndex: finalIdx, headingText: finalHeadingText, variant: 'final_cta', productKeys: [primary[0]], role: 'Final pick to verify', decisionMoment: 'final_recommendation', context: finalLead(primary[0], finalHeadingText, topic, hash(slug)) });
    } else {
      const primaryVariant = mapping.monetizationMode === 'exact_product' ? 'product_card' : 'recommended_equipment';
      placements.push({ anchorIndex: useful[firstIdx].index, headingText: useful[firstIdx].text, variant: primaryVariant, productKeys: [primary[0]], role: 'Relevant equipment', decisionMoment: 'compatibility' });
      placements.push({ anchorIndex: finalIdx, headingText: finalHeadingText, variant: 'final_cta', productKeys: [primary[0]], role: 'Final pick to verify', decisionMoment: 'final_recommendation', context: finalLead(primary[0], finalHeadingText, topic, hash(slug)) });
    }
    counts.TWO_PLACEMENTS++;
  }

  plans[slug] = { classification: placements.length === 3 ? 'THREE_PLACEMENTS' : placements.length === 2 ? 'TWO_PLACEMENTS' : 'ONE_PLACEMENT_EXCEPTION', articleType: mapping.monetizationMode, placements };
  totalPlacements += placements.length;
}

await mkdir(join(root, 'src', 'affiliate'), { recursive: true });
await writeFile(join(root, 'src', 'affiliate', 'placement-plan.generated.json'), `${JSON.stringify(plans, null, 2)}\n`);
console.log(JSON.stringify({ articles: files.length, ...counts, totalPlacements }));
