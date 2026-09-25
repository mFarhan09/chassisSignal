import generatedPlans from './placement-plan.generated.json' with { type: 'json' };
import { validateSpecialLink } from './validator.ts';
import type { ArticleProductMapping, ProductRecord } from './types';

/**
 * Contextual placement DENSITY plan.
 *
 * SITE-WIDE PLACEMENT POLICY (portfolio rule, 2026-09-25). Every published guide carries:
 *
 *   PLACEMENT A — `position: 'top'`     mandatory, after ~2-3 short intro paragraphs
 *   PLACEMENT C — `position: 'middle'`  mandatory for LONG articles, ~40-65% through the body
 *   PLACEMENT B — `position: 'end'`     mandatory, at the last substantive section
 *
 * LONG is machine-defined: `wordCount >= 1400 || h2Count >= 6`. Long articles require three
 * placements, shorter articles two, and three is the hard cap. Placements attach at real H2
 * boundaries (the renderer lifts the TOP unit to an early prose boundary) and never rewrite
 * prose. The same verified product may appear at two distinct reader moments provided the
 * variant and contextual copy differ.
 */

export type PlacementVariant = 'product_card' | 'comparison_card' | 'recommended_equipment' | 'compact_cta' | 'final_cta';
export type DecisionMoment = 'product_category' | 'compatibility' | 'comparison' | 'technical' | 'final_recommendation';
export type DensityClassification = 'TWO_PLACEMENTS' | 'THREE_PLACEMENTS' | 'ONE_PLACEMENT_EXCEPTION';
export type PlacementPosition = 'top' | 'middle' | 'end';

export const MAX_PLACEMENTS_PER_ARTICLE = 3;

/** Machine-enforceable LONG-article definition (must stay in sync with the generator). */
export const LONG_ARTICLE_WORD_COUNT = 1400;
export const LONG_ARTICLE_H2_COUNT = 6;

export function isLongArticle(wordCount: number, h2Count: number): boolean {
  return wordCount >= LONG_ARTICLE_WORD_COUNT || h2Count >= LONG_ARTICLE_H2_COUNT;
}

export function requiredPlacementsFor(wordCount: number, h2Count: number): number {
  return isLongArticle(wordCount, h2Count) ? 3 : 2;
}

export interface PlannedPlacement {
  /** Deterministic article-body position this unit fills (top / middle / end). */
  position: PlacementPosition;
  /** Index (into the article's full H2 list) of the section to attach AFTER. */
  anchorIndex: number;
  /** The heading text of that section (for reporting/traceability). */
  headingText: string;
  variant: PlacementVariant;
  productKeys: string[];
  role: string;
  decisionMoment: DecisionMoment;
  /** Article-specific contextual lead for compact/final CTAs (cards use the approved mapping rationale). */
  context?: string;
}

export interface ArticlePlacementPlan {
  classification: DensityClassification;
  articleType: string;
  /** Substantive body word count used for the LONG decision. */
  wordCount: number;
  /** H2 count used for the LONG decision. */
  h2Count: number;
  isLong: boolean;
  /** Minimum placements this article must carry (3 when long, otherwise 2). */
  requiredPlacements: number;
  placements: PlannedPlacement[];
}

export const placementPlans = generatedPlans as Record<string, ArticlePlacementPlan>;

export function getPlacementPlan(slug: string): ArticlePlacementPlan | undefined {
  return placementPlans[slug];
}

export interface PlacementPlanError {
  slug: string;
  code:
    | 'UNKNOWN_ARTICLE'
    | 'CLASSIFICATION_MISMATCH'
    | 'PLACEMENT_COUNT_EXCEEDED'
    | 'BELOW_REQUIRED_PLACEMENTS'
    | 'REQUIRED_COUNT_MISMATCH'
    | 'MISSING_TOP_PLACEMENT'
    | 'MISSING_MIDDLE_PLACEMENT'
    | 'MISSING_END_PLACEMENT'
    | 'UNEXPECTED_MIDDLE_PLACEMENT'
    | 'DUPLICATE_POSITION'
    | 'POSITION_ORDER'
    | 'PRODUCT_MISSING'
    | 'PRODUCT_NOT_APPROVED'
    | 'LINK_INVALID'
    | 'COMPARISON_NEEDS_TWO'
    | 'NON_COMPARISON_SINGLE_PRODUCT'
    | 'DUPLICATE_ANCHOR'
    | 'ALL_PLACEMENTS_AT_END'
    | 'CONTEXT_MISSING'
    | 'DUPLICATE_CONTEXT'
    | 'EXCEPTION_UNJUSTIFIED';
  message: string;
}

function classify(count: number): DensityClassification {
  return count >= 3 ? 'THREE_PLACEMENTS' : count === 2 ? 'TWO_PLACEMENTS' : 'ONE_PLACEMENT_EXCEPTION';
}

/**
 * Pure validator (tests feed mutated inputs to prove it fails). Enforces the
 * density model, product/link integrity and the spacing safeguards.
 */
export function validatePlacementPlans(
  plans: Record<string, ArticlePlacementPlan>,
  mappings: Record<string, ArticleProductMapping>,
  registry: Record<string, ProductRecord>,
  exceptionsJustified: Record<string, string> = {},
): PlacementPlanError[] {
  const errors: PlacementPlanError[] = [];
  const push = (slug: string, code: PlacementPlanError['code'], message: string) => errors.push({ slug, code, message });
  const seenContext = new Map<string, string>();

  for (const [slug, plan] of Object.entries(plans)) {
    const mapping = mappings[slug];
    if (!mapping) { push(slug, 'UNKNOWN_ARTICLE', `No approved mapping for ${slug}.`); continue; }
    const approved = new Set([...mapping.primaryProductKeys, ...mapping.alternativeProductKeys]);
    const isComparison = mapping.monetizationMode === 'comparison';
    const count = plan.placements.length;

    if (count > MAX_PLACEMENTS_PER_ARTICLE) push(slug, 'PLACEMENT_COUNT_EXCEEDED', `${slug}: ${count} placements (max ${MAX_PLACEMENTS_PER_ARTICLE}).`);
    if (plan.classification !== classify(count)) push(slug, 'CLASSIFICATION_MISMATCH', `${slug}: ${plan.classification} but ${count} placements.`);
    if (count === 1 && !exceptionsJustified[slug]) push(slug, 'EXCEPTION_UNJUSTIFIED', `${slug}: a one-placement exception needs a written justification.`);

    // --- site-wide placement policy: required count, and the top/middle/end contract ---
    const expected = requiredPlacementsFor(plan.wordCount, plan.h2Count);
    if (plan.requiredPlacements !== expected) push(slug, 'REQUIRED_COUNT_MISMATCH', `${slug}: requiredPlacements=${plan.requiredPlacements} but ${plan.wordCount} words / ${plan.h2Count} H2s requires ${expected}.`);
    if (plan.isLong !== isLongArticle(plan.wordCount, plan.h2Count)) push(slug, 'REQUIRED_COUNT_MISMATCH', `${slug}: isLong=${plan.isLong} contradicts ${plan.wordCount} words / ${plan.h2Count} H2s.`);
    if (count < expected) push(slug, 'BELOW_REQUIRED_PLACEMENTS', `${slug}: ${count} placements but ${expected} required (${plan.wordCount} words, ${plan.h2Count} H2s).`);

    const byPosition = new Map<PlacementPosition, PlannedPlacement>();
    for (const placement of plan.placements) {
      if (byPosition.has(placement.position)) push(slug, 'DUPLICATE_POSITION', `${slug}: two placements claim position "${placement.position}".`);
      else byPosition.set(placement.position, placement);
    }
    const top = byPosition.get('top');
    const middle = byPosition.get('middle');
    const end = byPosition.get('end');
    if (!top) push(slug, 'MISSING_TOP_PLACEMENT', `${slug}: every published guide needs a top placement.`);
    if (!end) push(slug, 'MISSING_END_PLACEMENT', `${slug}: every published guide needs an end placement.`);
    if (plan.isLong && !middle) push(slug, 'MISSING_MIDDLE_PLACEMENT', `${slug}: long articles (${plan.wordCount} words, ${plan.h2Count} H2s) need a middle placement.`);
    if (!plan.isLong && middle) push(slug, 'UNEXPECTED_MIDDLE_PLACEMENT', `${slug}: a short article must not carry a middle placement.`);
    if (top && end && top.anchorIndex >= end.anchorIndex) push(slug, 'POSITION_ORDER', `${slug}: the top placement must anchor before the end placement.`);
    if (top && middle && top.anchorIndex >= middle.anchorIndex) push(slug, 'POSITION_ORDER', `${slug}: the middle placement must anchor after the top placement.`);
    if (middle && end && middle.anchorIndex >= end.anchorIndex) push(slug, 'POSITION_ORDER', `${slug}: the middle placement must anchor before the end placement.`);

    const anchors = new Set();
    for (const placement of plan.placements) {
      if (anchors.has(placement.anchorIndex)) push(slug, 'DUPLICATE_ANCHOR', `${slug}: two placements attach to section ${placement.anchorIndex}.`);
      anchors.add(placement.anchorIndex);

      if (placement.variant === 'comparison_card' && placement.productKeys.length !== 2) push(slug, 'COMPARISON_NEEDS_TWO', `${slug}: comparison card needs exactly two products.`);
      if (placement.variant !== 'comparison_card' && placement.productKeys.length !== 1) push(slug, 'NON_COMPARISON_SINGLE_PRODUCT', `${slug}: ${placement.variant} needs exactly one product.`);

      for (const key of placement.productKeys) {
        const product = registry[key];
        if (!product) { push(slug, 'PRODUCT_MISSING', `${slug}: ${key} not in registry.`); continue; }
        if (!approved.has(key)) push(slug, 'PRODUCT_NOT_APPROVED', `${slug}: ${key} is not an approved product for this article.`);
        if (!validateSpecialLink(product).valid) push(slug, 'LINK_INVALID', `${slug}: ${key} has no verified Special Link.`);
      }

      if (placement.variant === 'compact_cta' || placement.variant === 'final_cta') {
        if (!placement.context || placement.context.trim().length < 30) push(slug, 'CONTEXT_MISSING', `${slug}: ${placement.variant} needs article-specific context.`);
        else {
          const prior = seenContext.get(placement.context);
          if (prior) push(slug, 'DUPLICATE_CONTEXT', `${slug}: context duplicates ${prior}.`);
          else seenContext.set(placement.context, slug);
        }
      }
    }

    // Spacing: placements must span the article, not all sit at the final section.
    if (count >= 2 && anchors.size >= 1) {
      const idxs = plan.placements.map((p) => p.anchorIndex);
      if (Math.min(...idxs) === Math.max(...idxs)) push(slug, 'ALL_PLACEMENTS_AT_END', `${slug}: every placement attaches to the same section.`);
    }
  }
  return errors;
}

export function planSummary(plans: Record<string, ArticlePlacementPlan>) {
  const summary = {
    TWO_PLACEMENTS: 0,
    THREE_PLACEMENTS: 0,
    ONE_PLACEMENT_EXCEPTION: 0,
    totalPlacements: 0,
    longArticles: 0,
    shortArticles: 0,
    withTopPlacement: 0,
    withMiddlePlacement: 0,
    withEndPlacement: 0
  };
  for (const plan of Object.values(plans)) {
    summary[plan.classification]++;
    summary.totalPlacements += plan.placements.length;
    if (plan.isLong) summary.longArticles++; else summary.shortArticles++;
    const positions = new Set(plan.placements.map((placement) => placement.position));
    if (positions.has('top')) summary.withTopPlacement++;
    if (positions.has('middle')) summary.withMiddlePlacement++;
    if (positions.has('end')) summary.withEndPlacement++;
  }
  return summary;
}
