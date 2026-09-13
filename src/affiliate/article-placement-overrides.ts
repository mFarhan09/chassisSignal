import type { AffiliateRelationship } from './types';

export interface ArticlePlacementOverride {
  affiliateRelationship: AffiliateRelationship;
  relationshipLabel: string;
}

export const articlePlacementOverrides: Record<string, ArticlePlacementOverride> = {
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
