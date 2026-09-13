import { validateSpecialLink } from './validator.ts';
import type { ArticleProductMapping, ProductRecord } from './types';

/**
 * Contextual multi-placement classification for Chassis Signal.
 *
 * Editorial rule (enforced, not aspirational):
 *   QUALITY CONTROLS MONETIZATION. A second or third affiliate placement exists
 *   ONLY when the article develops a genuinely DISTINCT reader decision that is
 *   served by a DIFFERENT, already-registered, human-verified, defensibly linkable
 *   product. Additional placements are never added for link count, article length,
 *   uniform counts, or because a heading happens to exist.
 *
 * A placement always attaches to the article's approved mapping; it never rewrites
 * prose. The primary placement is the article's mapped primary card. A secondary
 * placement renders one of the article's already-approved `alternativeProductKeys`
 * as a restrained compact CTA representing a distinct decision moment.
 */

export type PlacementClassification =
  | 'ONE_PLACEMENT_SUFFICIENT'
  | 'TWO_PLACEMENTS_JUSTIFIED'
  | 'THREE_PLACEMENTS_JUSTIFIED';

export const MAX_PLACEMENTS_PER_ARTICLE = 3;

export interface SecondaryPlacement {
  /** Must be one of the article's approved `alternativeProductKeys`. */
  productKey: string;
  /** The distinct decision moment this placement serves. */
  decisionMoment: 'product_category' | 'compatibility' | 'comparison' | 'final_recommendation';
  /** Short eyebrow shown above the compact CTA. */
  role: string;
  /** Article-specific contextual lead. Must explain why THIS product matters at THIS decision point. */
  context: string;
  /** Written justification that this is a distinct decision and not a duplicate of the primary. */
  distinctnessReason: string;
}

/**
 * The ONLY articles that carry a second placement, each justified in writing.
 * Keyed by slug. Every entry's `productKey` must appear in that article's approved
 * `alternativeProductKeys`; the validator enforces this both ways so an approved
 * alternative is never silently dropped and an unapproved product is never surfaced.
 */
export const secondaryPlacements: Record<string, SecondaryPlacement[]> = {
  'bimmercode-pricing': [
    {
      productKey: 'obdlink-mx-plus',
      decisionMoment: 'compatibility',
      role: 'Broader-compatibility hardware path',
      context:
        'The ownership-cost section prices two supported BimmerCode hardware paths. If you also service non-BMW vehicles or want the widest legislated-protocol coverage in the same chain, the MX+ is the broader-network path this guide already budgets — distinct from the focused CX pick above.',
      distinctnessReason:
        'CX answers "the exact focused adapter for the BimmerCode setup described" (compatibility/budget for a BMW-only owner); MX+ answers a separate reader question the article develops explicitly — "do I need wider protocol/vehicle reach in the same chain?". Both are named as supported paths in the article body and both are human-verified, linkable products.',
    },
  ],
  'bimmerlink-adapter': [
    {
      productKey: 'obdlink-mx-plus',
      decisionMoment: 'compatibility',
      role: 'Broader-network alternative adapter',
      context:
        'The "OBDLink CX, MX+, and other listed choices" section names MX+ as the single broader-network alternative to the focused CX pick. For garages that also work outside the BMW/MINI lane, MX+ keeps the same BimmerLink workflow with wider protocol reach.',
      distinctnessReason:
        'The article develops a two-gate adapter decision: CX is the focused exact BimmerLink adapter (first decision), MX+ is the deliberately-scoped broader-network alternative (second, distinct decision). The approved mapping already lists MX+ as the alternative; surfacing it prevents an approved, reader-relevant option from being dropped.',
    },
  ],
};

export interface PlacementSummary {
  slug: string;
  primaryProductKeys: string[];
  secondaryProductKeys: string[];
  placementCount: number;
  classification: PlacementClassification;
}

export function classifyCount(count: number): PlacementClassification {
  if (count >= 3) return 'THREE_PLACEMENTS_JUSTIFIED';
  if (count === 2) return 'TWO_PLACEMENTS_JUSTIFIED';
  return 'ONE_PLACEMENT_SUFFICIENT';
}

/** Number of rendered affiliate units for an article: 1 primary unit + N secondary CTAs. */
export function placementCount(mapping: ArticleProductMapping | undefined, slug: string): number {
  if (!mapping || mapping.editorialDecision === 'HOLD' || mapping.placementType === 'none') return 0;
  return 1 + (secondaryPlacements[slug]?.length ?? 0);
}

export function summarizePlacement(mapping: ArticleProductMapping | undefined, slug: string): PlacementSummary {
  const secondary = secondaryPlacements[slug] ?? [];
  const count = placementCount(mapping, slug);
  return {
    slug,
    primaryProductKeys: mapping?.primaryProductKeys ?? [],
    secondaryProductKeys: secondary.map((placement) => placement.productKey),
    placementCount: count,
    classification: classifyCount(count),
  };
}

export interface PlacementValidationError {
  slug: string;
  code:
    | 'UNKNOWN_SECONDARY_ARTICLE'
    | 'SECONDARY_NOT_APPROVED_ALTERNATIVE'
    | 'APPROVED_ALTERNATIVE_NOT_SURFACED'
    | 'SECONDARY_DUPLICATES_PRIMARY'
    | 'DUPLICATE_SECONDARY_PRODUCT'
    | 'SECONDARY_PRODUCT_MISSING'
    | 'SECONDARY_LINK_INVALID'
    | 'SECONDARY_CONTEXT_MISSING'
    | 'PLACEMENT_COUNT_EXCEEDED';
  message: string;
}

/**
 * Pure validator so tests can feed mutated inputs and prove it fails.
 * Enforces every editorial guardrail for multi-placement rollout.
 */
export function validatePlacements(
  mappings: Record<string, ArticleProductMapping>,
  registry: Record<string, ProductRecord>,
  placements: Record<string, SecondaryPlacement[]> = secondaryPlacements,
): PlacementValidationError[] {
  const errors: PlacementValidationError[] = [];
  const push = (slug: string, code: PlacementValidationError['code'], message: string) =>
    errors.push({ slug, code, message });

  // Every article with a secondary placement must exist and cap at MAX_PLACEMENTS_PER_ARTICLE.
  for (const [slug, entries] of Object.entries(placements)) {
    const mapping = mappings[slug];
    if (!mapping) {
      push(slug, 'UNKNOWN_SECONDARY_ARTICLE', `No approved mapping for ${slug}.`);
      continue;
    }
    const approvedAlternatives = new Set(mapping.alternativeProductKeys);
    const primaries = new Set(mapping.primaryProductKeys);
    const seen = new Set<string>();
    // Count from the passed map (not the module default) so mutated inputs are validated correctly.
    const primaryUnits = mapping.editorialDecision === 'HOLD' || mapping.placementType === 'none' ? 0 : 1;
    const total = primaryUnits + entries.length;
    if (total > MAX_PLACEMENTS_PER_ARTICLE) {
      push(slug, 'PLACEMENT_COUNT_EXCEEDED', `${slug} would render ${total} placements (max ${MAX_PLACEMENTS_PER_ARTICLE}).`);
    }
    for (const placement of entries) {
      const { productKey } = placement;
      if (!approvedAlternatives.has(productKey)) {
        push(slug, 'SECONDARY_NOT_APPROVED_ALTERNATIVE', `${slug}: ${productKey} is not in the approved alternativeProductKeys.`);
      }
      if (primaries.has(productKey)) {
        push(slug, 'SECONDARY_DUPLICATES_PRIMARY', `${slug}: secondary ${productKey} duplicates the primary placement.`);
      }
      if (seen.has(productKey)) {
        push(slug, 'DUPLICATE_SECONDARY_PRODUCT', `${slug}: ${productKey} placed more than once.`);
      }
      seen.add(productKey);
      const product = registry[productKey];
      if (!product) {
        push(slug, 'SECONDARY_PRODUCT_MISSING', `${slug}: ${productKey} not in registry.`);
      } else if (!validateSpecialLink(product).valid) {
        push(slug, 'SECONDARY_LINK_INVALID', `${slug}: ${productKey} has no defensible, verified Special Link.`);
      }
      if (!placement.role.trim() || !placement.context.trim() || !placement.distinctnessReason.trim()) {
        push(slug, 'SECONDARY_CONTEXT_MISSING', `${slug}: ${productKey} is missing role/context/distinctness rationale.`);
      }
    }
  }

  // Every approved alternative in a mapping must be surfaced as a secondary placement,
  // so an editorially-approved, reader-relevant option is never silently dropped.
  for (const [slug, mapping] of Object.entries(mappings)) {
    if (mapping.editorialDecision === 'HOLD') continue;
    const surfaced = new Set((placements[slug] ?? []).map((placement) => placement.productKey));
    for (const alt of mapping.alternativeProductKeys) {
      if (!surfaced.has(alt)) {
        push(slug, 'APPROVED_ALTERNATIVE_NOT_SURFACED', `${slug}: approved alternative ${alt} is not surfaced as a placement.`);
      }
    }
  }

  return errors;
}
