import generatedPlans from './placement-plan.generated.json' with { type: 'json' };
import { validateSpecialLink } from './validator.ts';
import type { ArticleProductMapping, ProductRecord } from './types';

/**
 * Contextual placement DENSITY plan.
 *
 * Target model: normally TWO placements per article, THREE for comparison /
 * strongly-commercial / alternative-bearing articles, ONE only as a genuine
 * exception. Placements are distributed across the article's real section
 * headings (early decision -> middle -> conclusion) and attach at H2 boundaries;
 * they never rewrite prose. The same verified product may appear at two distinct
 * reader moments provided the variant and contextual copy differ.
 */

export type PlacementVariant = 'product_card' | 'comparison_card' | 'recommended_equipment' | 'compact_cta' | 'final_cta';
export type DecisionMoment = 'product_category' | 'compatibility' | 'comparison' | 'technical' | 'final_recommendation';
export type DensityClassification = 'TWO_PLACEMENTS' | 'THREE_PLACEMENTS' | 'ONE_PLACEMENT_EXCEPTION';

export const MAX_PLACEMENTS_PER_ARTICLE = 3;

export interface PlannedPlacement {
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
    | 'THREE_NOT_JUSTIFIED'
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
    if (count >= 3 && !(isComparison || mapping.alternativeProductKeys.length > 0)) push(slug, 'THREE_NOT_JUSTIFIED', `${slug}: three placements require a comparison or an approved alternative.`);
    if (count === 1 && !exceptionsJustified[slug]) push(slug, 'EXCEPTION_UNJUSTIFIED', `${slug}: a one-placement exception needs a written justification.`);

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
  const summary = { TWO_PLACEMENTS: 0, THREE_PLACEMENTS: 0, ONE_PLACEMENT_EXCEPTION: 0, totalPlacements: 0 };
  for (const plan of Object.values(plans)) {
    summary[plan.classification]++;
    summary.totalPlacements += plan.placements.length;
  }
  return summary;
}
