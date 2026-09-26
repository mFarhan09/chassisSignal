import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * Deterministic placement-plan generator.
 *
 * SITE-WIDE PLACEMENT POLICY (portfolio rule, 2026-09-25) — every published guide:
 *
 *   PLACEMENT A (top)    mandatory, surfaced after ~2-3 short intro paragraphs
 *   PLACEMENT C (middle) mandatory for LONG articles, ~40-65% through the body
 *   PLACEMENT B (end)    mandatory, at the last substantive section before the close
 *
 * LONG is machine-defined as `wordCount >= 1400 || h2Count >= 6`; long articles require
 * three placements, shorter articles two. Three is the hard cap. Placements attach at
 * real H2 section boundaries (the renderer then lifts the TOP unit to an early prose
 * boundary), are never clustered, and never rewrite prose. No links, ASINs, images,
 * products or prose are invented here.
 */

const root = process.cwd();
const articlesDir = join(root, 'src', 'content', 'articles');
const mappings = JSON.parse(await readFile(join(root, 'src', 'affiliate', 'article-mappings.generated.json'), 'utf8'));
const registry = JSON.parse(await readFile(join(root, 'src', 'affiliate', 'product-registry.generated.json'), 'utf8'));

const brandModel = (key) => (registry[key] ? `${registry[key].brand} ${registry[key].model}` : key);
const lower = (s) => s.charAt(0).toLowerCase() + s.slice(1);
const hash = (s) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

const DECISION_KW = /(choose|choosing|choice|compatib|adapter|which|buy|buyer|purchase|decision|compare|comparison|price|pricing|cost|option|candidate|shortlist|scope|select|fit|route|profile)/i;

// Machine-enforceable LONG-article definition (must stay in sync with `placement-plan.ts`).
const LONG_WORD_COUNT = 1400;
const LONG_H2_COUNT = 6;

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
  'foxwell-nt710-vs-autel-mk900-bmw': 'On the Autel side of this comparison, the MaxiCOM MK900-BT is the variant with a verified listing. It is the wireless MK900-family tablet, not the base wired MK900 this article opens on, and Autel documents no coding capability for either — confirm your VIN and the exact function in writing first.',
};

// Article-specific role label for the middle alternative CTA (defaults to the generic role).
const ALT_ROLE = {
  'foxwell-nt710-vs-autel-mk900-bmw': 'Wireless MK900-family alternative',
};

/**
 * Article-specific copy for a TWO-PRIMARY COMPARISON guide's middle and end CTAs.
 *
 * The generated `compactLead` / `finalLead` templates assert that the featured unit is "the
 * specific unit to price" for the section it lands in. That is safe when both compared
 * products are the article's own subjects. It is NOT safe on a guide where one card is a
 * labelled ALTERNATIVE standing in for a subject with no verified listing: the template would
 * silently promote the alternative into the subject's role, inside a section discussing the
 * subject's capabilities. Where that risk exists, the copy is written explicitly here and
 * states what the product actually is. Slugs absent from these maps keep the generated copy.
 */
const MID_ROLE = {
  'foxwell-nt710-vs-nt809bt-bmw': 'Related Foxwell alternative - not the NT710',
  'launch-x431-pro-elite-vs-foxwell-nt710-bmw': 'Related Foxwell alternative - not the NT710',
};
const MID_CONTEXT = {
  'foxwell-nt710-vs-nt809bt-bmw': 'The NT710 has no verified listing, so this is the Foxwell NT530: the available single-make BMW handheld from the same maker. It carries neither the NT710 coding claim nor its lifetime update term, and it is not a stand-in for the NT809BT. Check the model and serial prefix before buying.',
  'launch-x431-pro-elite-vs-foxwell-nt710-bmw': 'The NT710 has no verified listing, so this is the Foxwell NT530: the available single-make BMW handheld from the same maker. It is not the NT710 and makes none of its coding claims. Check the model and the installed BMW software before buying.',
};
const FINAL_CONTEXT = {
  'foxwell-nt710-vs-nt809bt-bmw': 'If the mixed-fleet, wireless-VCI side fits, the Foxwell NT809BT is the exact tool to check. Confirm your BMW in Foxwell coverage, accept that ECU coding is not on its list, and price the renewal past year three.',
  'launch-x431-pro-elite-vs-foxwell-nt710-bmw': 'If documented CAN FD and DoIP support decides it, the LAUNCH X-431 PRO ELITE is the exact tool to check. Confirm which of the three models on that shared page you are being sold, and get the update period in writing first.',
};

// Second reader-moment copy for LONG articles whose approved mapping has a single product.
// The same verified unit appears at a distinct decision moment with distinct copy — never a
// second identical card, and never a second product identity.
function midSoloLead(key, heading, topic) {
  const p = brandModel(key);
  const h = lower(heading.replace(/[.:]+$/, ''));
  return `By the time ${h} matters for ${topic}, the practical question is whether ${p} actually covers your exact BMW and the one function you are buying it for — check that on the current listing before you go further.`;
}

function extractHeadings(body) {
  return [...body.matchAll(/^##\s+(.+?)\s*$/gm)].map((m, index) => ({ index, text: m[1].trim(), pos: m.index }));
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

/**
 * Approximate RENDERED vertical bulk of the body, as a prefix-sum over source characters.
 *
 * Raw markdown character offsets badly under-weight blocks that are visually tall for their
 * character count — table rows, figures and images especially — which pushes the middle
 * placement far past its target once the page is laid out. Each source line therefore
 * contributes its character length plus a weight for the kind of block it belongs to. The
 * weights are coarse on purpose: the goal is a deterministic estimate of where the reader
 * actually is, not a layout engine.
 */
const LINE_WEIGHTS = [
  [/^\s*\|/, 44],                                   // table row — tall relative to its text
  [/^\s*<(figure|img|picture|source|figcaption)/, 220], // media block
  [/^\s*<\/?(table|thead|tbody|tr|td|th)/, 40],     // raw HTML table markup
  [/^\s*(?:[-*+]|\d+\.)\s+/, 26],                   // list item
  [/^\s*#{2,6}\s+/, 90]                             // heading (margins + type size)
];

function weightedOffsets(body) {
  const lines = body.split('\n');
  const prefix = new Map();
  let sourcePos = 0;
  let weighted = 0;
  for (const line of lines) {
    prefix.set(sourcePos, weighted);
    const extra = LINE_WEIGHTS.find(([pattern]) => pattern.test(line))?.[1] ?? 0;
    weighted += line.length + 1 + extra;
    sourcePos += line.length + 1;
  }
  const marks = [...prefix.entries()].sort((a, b) => a[0] - b[0]);
  /** Weighted position for a source character offset (nearest preceding line start). */
  const at = (position) => {
    let low = 0;
    let high = marks.length - 1;
    let best = 0;
    while (low <= high) {
      const mid = (low + high) >> 1;
      if (marks[mid][0] <= position) { best = marks[mid][1]; low = mid + 1; } else high = mid - 1;
    }
    return best;
  };
  return { at, total: weighted };
}

/**
 * Weighted offset at which a placement anchored after section `anchorIndex` actually lands:
 * the start of the FOLLOWING heading (mirrors the renderer, which splits at the next `<h2>`).
 */
function insertionOffset(headings, anchorIndex, weights, bodyLength) {
  const next = headings[anchorIndex + 1];
  return next ? weights.at(next.pos) : weights.at(bodyLength);
}

/**
 * Pick the MIDDLE anchor by real position in the body rather than by section ordinal, so the
 * unit genuinely lands ~40-65% through the article regardless of how unevenly long the
 * sections are. Prefers a decision-relevant heading when one sits within the target band.
 */
function pickMiddleAnchor(headings, useful, min, max, weights, bodyLength, kw) {
  const target = weights.total * 0.5;
  const band = weights.total * 0.1;
  let best = min;
  let bestDelta = Infinity;
  let bestKeyword = null;
  for (let i = min; i <= max; i++) {
    const delta = Math.abs(insertionOffset(headings, useful[i].index, weights, bodyLength) - target);
    if (delta < bestDelta) { bestDelta = delta; best = i; }
    if (delta <= band && kw.test(useful[i].text) && (bestKeyword === null || delta < bestKeyword.delta)) bestKeyword = { i, delta };
  }
  return bestKeyword ? bestKeyword.i : best;
}

const files = (await readdir(articlesDir)).filter((f) => f.endsWith('.md')).sort();
const plans = {};
let counts = { TWO_PLACEMENTS: 0, THREE_PLACEMENTS: 0, ONE_PLACEMENT_EXCEPTION: 0 };
let totalPlacements = 0;
let planned = 0;
let skipped = [];

for (const file of files) {
  const slug = file.replace(/\.md$/, '');
  const mapping = mappings[slug];
  // Under the 2026-09-25 policy every PUBLISHED guide carries an approved mapping, so this only
  // skips drafts and research pages. A published guide that lands here is a release-gate failure
  // and the affiliate audit reports it as PUBLISHED_GUIDE_NOT_MONETIZED.
  if (!mapping || mapping.mappingStatus !== 'approved' || !mapping.primaryProductKeys?.length) { skipped.push(slug); continue; }
  const body = (await readFile(join(articlesDir, file), 'utf8')).replace(/^---\n[\s\S]*?\n---/, '');
  const headings = extractHeadings(body);
  const useful = headings.filter((h) => !/^sources consulted/i.test(h.text));
  const U = useful.length;
  const wordCount = body.split(/\s+/).filter(Boolean).length;
  const h2Count = headings.length;
  const weights = weightedOffsets(body);
  const isComparison = mapping.monetizationMode === 'comparison';
  const primary = mapping.primaryProductKeys;
  const alt = mapping.alternativeProductKeys;
  const topic = topicOf(mapping);
  const placements = [];

  // Anchor indices (into the full heading list) at distinct, spread section boundaries.
  // The TOP unit is lifted to an early prose boundary by the renderer (see `first-placement.ts`),
  // so its anchor only needs to be EARLY — keeping it shallow also stops it from squeezing the
  // middle anchor's search range into the tail of the article.
  const firstIdx = pickAnchor(useful, U * 0.18, 1, Math.max(1, U - 4), DECISION_KW);
  const finalIdx = useful[U - 1].index; // attach after the last useful section (before Sources consulted / at end)
  const finalHeadingText = useful[U - 1].text;

  // LONG article => three placements (top, middle, end). Needs at least four useful sections
  // to seat three distinct, non-clustered anchors; below that the article gets the two-placement
  // shape instead.
  const isLong = wordCount >= LONG_WORD_COUNT || h2Count >= LONG_H2_COUNT;
  const wantThree = isLong && U >= 4;
  const requiredPlacements = wantThree ? 3 : 2;

  if (wantThree) {
    let midIdx = pickMiddleAnchor(headings, useful, firstIdx + 1, U - 2, weights, body.length, /(compar|scope|capabilit|function|coverage|platform|technical|cost|price|matrix|differen)/i);
    if (midIdx <= firstIdx) midIdx = Math.min(firstIdx + 1, U - 2);
    // Placement A (top) — early primary decision.
    if (isComparison && primary.length === 2) {
      placements.push({ position: 'top', anchorIndex: useful[firstIdx].index, headingText: useful[firstIdx].text, variant: 'comparison_card', productKeys: primary, role: 'Compare the two options', decisionMoment: 'comparison' });
      // Placement C (middle) — feature the second compared product individually.
      placements.push({ position: 'middle', anchorIndex: useful[midIdx].index, headingText: useful[midIdx].text, variant: 'compact_cta', productKeys: [primary[1]], role: MID_ROLE[slug] || 'Option in focus', decisionMoment: 'technical', context: MID_CONTEXT[slug] || compactLead(primary[1], useful[midIdx].text, topic, hash(slug)) });
    } else if (alt.length > 0) {
      // Alternative-bearing single-primary article (e.g. CX primary + MX+ approved alternative).
      const primaryVariant = mapping.monetizationMode === 'exact_product' ? 'product_card' : 'recommended_equipment';
      placements.push({ position: 'top', anchorIndex: useful[firstIdx].index, headingText: useful[firstIdx].text, variant: primaryVariant, productKeys: [primary[0]], role: 'Relevant equipment', decisionMoment: 'compatibility' });
      placements.push({ position: 'middle', anchorIndex: useful[midIdx].index, headingText: useful[midIdx].text, variant: 'compact_cta', productKeys: [alt[0]], role: ALT_ROLE[slug] || 'Broader-compatibility alternative', decisionMoment: 'compatibility', context: ALT_CONTEXT[slug] || compactLead(alt[0], useful[midIdx].text, topic, hash(slug)) });
    } else {
      // LONG single-product article: the same verified unit at a second, distinct reader moment
      // with distinct copy and a distinct variant. No second product identity is invented.
      const primaryVariant = mapping.monetizationMode === 'exact_product' ? 'product_card' : 'recommended_equipment';
      placements.push({ position: 'top', anchorIndex: useful[firstIdx].index, headingText: useful[firstIdx].text, variant: primaryVariant, productKeys: [primary[0]], role: 'Relevant equipment', decisionMoment: 'compatibility' });
      placements.push({ position: 'middle', anchorIndex: useful[midIdx].index, headingText: useful[midIdx].text, variant: 'compact_cta', productKeys: [primary[0]], role: 'Coverage check before you commit', decisionMoment: 'technical', context: midSoloLead(primary[0], useful[midIdx].text, topic) });
    }
    // Placement B (end) — final pick.
    placements.push({ position: 'end', anchorIndex: finalIdx, headingText: finalHeadingText, variant: 'final_cta', productKeys: [primary[0]], role: 'Final pick to verify', decisionMoment: 'final_recommendation', context: FINAL_CONTEXT[slug] || finalLead(primary[0], finalHeadingText, topic, hash(slug) + 1) });
    counts.THREE_PLACEMENTS++;
  } else {
    // SHORT article: TWO placements — primary decision card early + restrained final CTA.
    if (isComparison && primary.length === 2) {
      placements.push({ position: 'top', anchorIndex: useful[firstIdx].index, headingText: useful[firstIdx].text, variant: 'comparison_card', productKeys: primary, role: 'Compare the two options', decisionMoment: 'comparison' });
    } else {
      const primaryVariant = mapping.monetizationMode === 'exact_product' ? 'product_card' : 'recommended_equipment';
      placements.push({ position: 'top', anchorIndex: useful[firstIdx].index, headingText: useful[firstIdx].text, variant: primaryVariant, productKeys: [primary[0]], role: 'Relevant equipment', decisionMoment: 'compatibility' });
    }
    placements.push({ position: 'end', anchorIndex: finalIdx, headingText: finalHeadingText, variant: 'final_cta', productKeys: [primary[0]], role: 'Final pick to verify', decisionMoment: 'final_recommendation', context: FINAL_CONTEXT[slug] || finalLead(primary[0], finalHeadingText, topic, hash(slug)) });
    counts.TWO_PLACEMENTS++;
  }

  plans[slug] = {
    classification: placements.length === 3 ? 'THREE_PLACEMENTS' : placements.length === 2 ? 'TWO_PLACEMENTS' : 'ONE_PLACEMENT_EXCEPTION',
    articleType: mapping.monetizationMode,
    wordCount,
    h2Count,
    isLong,
    requiredPlacements,
    placements
  };
  totalPlacements += placements.length;
  planned++;
}

await mkdir(join(root, 'src', 'affiliate'), { recursive: true });
await writeFile(join(root, 'src', 'affiliate', 'placement-plan.generated.json'), `${JSON.stringify(plans, null, 2)}\n`);
console.log(JSON.stringify({ articles: files.length, planned, skipped: skipped.length, ...counts, totalPlacements }));
