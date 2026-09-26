import type { AffiliateRelationship } from './types';

export interface ArticlePlacementOverride {
  affiliateRelationship: AffiliateRelationship;
  relationshipLabel: string;
  /**
   * Per-product relationship eyebrow, keyed by productKey. Set this on any guide whose card
   * set mixes an exact product with a labelled alternative: the article-level
   * `relationshipLabel` is rendered above every product name, so without a per-product entry
   * an alternative would inherit the exact product's claim. Omitted products fall back to the
   * article-level label.
   */
  productRelationshipLabels?: Record<string, string>;
  /** Per-product machine-readable relationship, keyed by productKey. Same fallback rule. */
  productRelationships?: Record<string, AffiliateRelationship>;
}

export const articlePlacementOverrides: Record<string, ArticlePlacementOverride> = {
  // 2026-09-25 monetization repair: the five formerly unmonetized guides. Each label names what
  // the verified product IS, never the exact product the article is about.
  'autel-mk900-bmw-compatibility': { affiliateRelationship: 'available_alternative', relationshipLabel: 'Available wireless MK900-family option - not the base wired MK900' },
  'bmw-parking-sensor-diagnostic-tool': { affiliateRelationship: 'available_alternative', relationshipLabel: 'Available bidirectional all-system scanner alternative' },
  'foxwell-nt710-vs-autel-mk900-bmw': { affiliateRelationship: 'available_alternative', relationshipLabel: 'Available BMW-focused Foxwell alternative - not the NT710' },
  'icarsoft-bmm-v3-vs-foxwell-nt530': { affiliateRelationship: 'available_alternative', relationshipLabel: 'Available Foxwell side of this comparison' },
  'obdlink-cx-vs-unicarscan-ucsi-2100': { affiliateRelationship: 'exact_product', relationshipLabel: 'Exact OBDLink CX side of this comparison' },

  // 2026-09-26 second pass: the exact NT809BT and the exact X-431 PRO ELITE are now in the
  // catalog, so each of these guides carries one EXACT product plus the NT530 as a labelled
  // related alternative for the NT710 side, which still has no verified listing. Each card
  // therefore needs its OWN label; the article-level pair below is only the fallback.
  'foxwell-nt710-vs-nt809bt-bmw': {
    affiliateRelationship: 'exact_product',
    relationshipLabel: 'One exact product and one labelled alternative - neither card is the NT710',
    productRelationshipLabels: {
      'foxwell-nt809bt': 'Exact product - the Foxwell NT809BT compared here',
      'foxwell-nt530': 'Related Foxwell single-make alternative - NOT the NT710 and not its coding claim'
    },
    productRelationships: {
      'foxwell-nt809bt': 'exact_product',
      'foxwell-nt530': 'available_alternative'
    }
  },
  'launch-x431-pro-elite-vs-foxwell-nt710-bmw': {
    affiliateRelationship: 'exact_product',
    relationshipLabel: 'One exact product and one labelled alternative - neither card is the NT710',
    productRelationshipLabels: {
      'launch-x431-pro-elite': 'Exact product - the LAUNCH X-431 PRO ELITE compared here',
      'foxwell-nt530': 'Related Foxwell single-make alternative - NOT the NT710 and not its coding claim'
    },
    productRelationships: {
      'launch-x431-pro-elite': 'exact_product',
      'foxwell-nt530': 'available_alternative'
    }
  },

  'autel-scanner-for-bmw': { affiliateRelationship: 'available_alternative', relationshipLabel: 'Available Autel scanner alternatives' },
  'autophix-7910-vs-foxwell-nt530': { affiliateRelationship: 'available_alternative', relationshipLabel: 'Available AUTOPHIX-side alternative' },
  'bmw-bidirectional-scan-tool-functions': { affiliateRelationship: 'workshop_alternative', relationshipLabel: 'Available bidirectional workshop alternative' },
  'bmw-electronic-water-pump-diagnostic-tool': { affiliateRelationship: 'available_alternative', relationshipLabel: 'Available scanner with documented coolant-bleed support' },
  'bmw-ride-height-calibration-scan-tool': { affiliateRelationship: 'workshop_alternative', relationshipLabel: 'Available workshop calibration platform' },
  'bmw-scanner-abs-airbag-codes': { affiliateRelationship: 'exact_product', relationshipLabel: 'Available all-system scanner discussed' },
  'bmw-scanner-without-subscription': { affiliateRelationship: 'available_alternative', relationshipLabel: 'Available no-subscription scanner alternative' },
  'bmw-steering-angle-sensor-calibration-tool': { affiliateRelationship: 'available_alternative', relationshipLabel: 'Available SAS-capable scanner alternative' },
  'bmw-transfer-case-adaptation-reset-tool': { affiliateRelationship: 'workshop_alternative', relationshipLabel: 'Available workshop diagnostic alternative' },
  'carly-subscription-cost': { affiliateRelationship: 'available_alternative', relationshipLabel: 'Alternative BMW app route' },
  'carly-vs-foxwell-nt530': { affiliateRelationship: 'available_alternative', relationshipLabel: 'Available BMW scanner alternative' },
  'foxwell-nt530-vs-autel-mk808s-bmw': { affiliateRelationship: 'available_alternative', relationshipLabel: 'Available Autel-side alternative' },
  'foxwell-nt530-vs-nt710': { affiliateRelationship: 'available_alternative', relationshipLabel: 'Available BMW scanner alternative' },
  'launch-x431-bmw': { affiliateRelationship: 'available_alternative', relationshipLabel: 'Available LAUNCH diagnostic routes' },
  'launch-x431-vs-autel-for-bmw': { affiliateRelationship: 'workshop_alternative', relationshipLabel: 'Available workshop alternatives' },
  'obdlink-ex-vs-enet-cable': { affiliateRelationship: 'exact_product', relationshipLabel: 'Exact OBDLink EX product discussed - not a BMW ENET interface' },
  'protool-pricing': { affiliateRelationship: 'available_alternative', relationshipLabel: 'Alternative BMW app interface' },
  'protool-vs-carly': { affiliateRelationship: 'available_alternative', relationshipLabel: 'Alternative BMW app route' }
};
