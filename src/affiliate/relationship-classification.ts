/**
 * PRODUCT RELEVANCE QA (portfolio policy, 2026-09-25).
 *
 * Every published guide is now monetized. That makes it MORE important, not less, to be
 * explicit about how close each mapped product actually is to the product the article is
 * about. Each guide therefore carries a `relationshipType` drawn from a fixed taxonomy plus
 * a short rationale, so a monetized page never has to pretend its card is the exact product
 * discussed.
 *
 * The taxonomy is ordered from closest to furthest:
 *
 *   EXACT_PRODUCT               the product the article is about
 *   EXACT_VARIANT               a named sibling variant of that product (e.g. MK900 -> MK900-BT)
 *   SAME_BRAND_ALTERNATIVE      same maker, a different model
 *   PRODUCT_FAMILY_ALTERNATIVE  same product family / platform tier, different unit
 *   RELATED_DIAGNOSTIC_TOOL     a different tool that genuinely performs the article's task
 *   SUPPORTING_EQUIPMENT        equipment the article's procedure needs, not the tool itself
 *   RELATED_BUYER_GUIDE_PRODUCT a verified product reused from a closely related guide
 *
 * The rationale is reader-independent QA copy (it is not rendered); the reader-facing
 * explanation is the mapping's `recommendationRationale` and its `relationshipLabel`.
 */

export type RelationshipType =
  | 'EXACT_PRODUCT'
  | 'EXACT_VARIANT'
  | 'SAME_BRAND_ALTERNATIVE'
  | 'PRODUCT_FAMILY_ALTERNATIVE'
  | 'RELATED_DIAGNOSTIC_TOOL'
  | 'SUPPORTING_EQUIPMENT'
  | 'RELATED_BUYER_GUIDE_PRODUCT';

export const relationshipTypes: readonly RelationshipType[] = [
  'EXACT_PRODUCT',
  'EXACT_VARIANT',
  'SAME_BRAND_ALTERNATIVE',
  'PRODUCT_FAMILY_ALTERNATIVE',
  'RELATED_DIAGNOSTIC_TOOL',
  'SUPPORTING_EQUIPMENT',
  'RELATED_BUYER_GUIDE_PRODUCT'
] as const;

export interface RelationshipClassification {
  relationshipType: RelationshipType;
  relationshipRationale: string;
}

const c = (relationshipType: RelationshipType, relationshipRationale: string): RelationshipClassification => ({ relationshipType, relationshipRationale });

export const relationshipClassifications: Record<string, RelationshipClassification> = {
  // --- the five guides repaired on 2026-09-25 ---
  'foxwell-nt710-vs-autel-mk900-bmw': c('SAME_BRAND_ALTERNATIVE', 'Article subject is the BMW-software Foxwell NT710; the verified product is the Foxwell NT530, the same maker and a different model. The approved alternative (MK900-BT) is an exact sibling variant of the article\'s Autel side. Neither card carries the other model\'s claims.'),
  'autel-mk900-bmw-compatibility': c('EXACT_VARIANT', 'Article subject is the Autel MaxiCOM MK900; the verified product is the MK900-BT, a variant Autel itself lists in the MK900 comparison table the article reproduces. Labelled as the wireless MK900-family option, never as the base wired MK900.'),
  'icarsoft-bmm-v3-vs-foxwell-nt530': c('EXACT_PRODUCT', 'Foxwell NT530 is named in the article title and is the side of the comparison with a verified listing; the iCarsoft side is deliberately not linked.'),
  'obdlink-cx-vs-unicarscan-ucsi-2100': c('EXACT_PRODUCT', 'OBDLink CX is named in the article title and is the side of the comparison with a verified, rights-cleared listing; the UniCarScan side is deliberately not linked.'),
  'bmw-parking-sensor-diagnostic-tool': c('RELATED_BUYER_GUIDE_PRODUCT', 'No PDC/PMA-specific product exists in the registry. The MK900-BT is the verified bidirectional all-system platform already mapped to the related bmw-bidirectional-scan-tool-functions guide, and module output tests are exactly that capability. No BMW PDC sensor-level claim is transferred.'),

  // --- comparison and exact-product guides ---
  'autel-scanner-for-bmw': c('EXACT_VARIANT', 'The guide shortlists the Autel 808 and 900 tiers; MX808S and MK900-BT are the accurately named available variants of those tiers.'),
  'autophix-7910-vs-foxwell-nt530': c('EXACT_VARIANT', 'The AUTOPHIX 7910 is unavailable; the 7910P+ is its named successor variant in the same family and is labelled as such, not as the 7910.'),
  'bimmerlink-adapter': c('EXACT_PRODUCT', 'The guide is about which adapter to run with BimmerLink; OBDLink documents CX for BimmerLink, with MX+ as the single broader-network alternative.'),
  'bmw-brake-bleed-scan-tool': c('EXACT_PRODUCT', 'Autel names Brake Bleeding as a supported MD909 Pro service function, so the mapped product is the tool the article is about.'),
  'bmw-electric-parking-brake-service-mode-scanner': c('EXACT_PRODUCT', 'Autel documents EPB and parking-brake pad relearn on the exact MD909 Pro.'),
  'bmw-enet-vs-bluetooth-obd': c('EXACT_PRODUCT', 'OBDLink CX is the exact Bluetooth side of the comparison and is never described as ENET hardware.'),
  'bmw-f-series-vs-g-series-obd-adapter': c('EXACT_PRODUCT', 'BimmerCode lists the exact CX across the supported BMW series the article splits on.'),
  'bmw-injector-coding-tool': c('EXACT_PRODUCT', 'Autel documents an Injector service function on the exact MD909 Pro.'),
  'bmw-scanner-abs-airbag-codes': c('EXACT_PRODUCT', 'The article body identifies the MX900 as the all-system route it recommends; the card is the product discussed.'),
  'creator-c310-plus-vs-foxwell-nt530': c('EXACT_PRODUCT', 'Creator C310+ is named in the title and is the available side; no Foxwell listing is substituted.'),
  'obdlink-cx-vs-lx': c('EXACT_PRODUCT', 'Both compared products are named in the title and both have verified listings.'),
  'obdlink-cx-vs-mx-plus': c('EXACT_PRODUCT', 'Both compared products are named in the title and both have verified listings.'),
  'obdlink-cx-vs-vlinker-bm-plus': c('EXACT_PRODUCT', 'Both compared products are named in the title and both have verified listings.'),
  'obdlink-cx-vs-vlinker-mc-plus': c('EXACT_PRODUCT', 'Both compared products are named in the title and both have verified listings.'),
  'obdlink-ex-vs-enet-cable': c('EXACT_PRODUCT', 'OBDLink EX is the exact product discussed; the card retains the warning that it is FORScan/Ford-oriented and not a BMW ENET interface.'),
  'obdlink-mx-plus-vs-lx': c('EXACT_PRODUCT', 'Both compared products are named in the title and both have verified listings.'),
  'obdlink-mx-plus-vs-vlinker-bm-plus': c('EXACT_PRODUCT', 'Both compared products are named in the title and both have verified listings.'),
  'vlinker-bm-plus-vs-mc-plus': c('EXACT_PRODUCT', 'Both compared Vgate products are named in the title and both have verified listings.'),

  // --- same-brand / family alternatives where the exact model has no verified listing ---
  'foxwell-nt530-vs-autel-mk808s-bmw': c('SAME_BRAND_ALTERNATIVE', 'The article names the Autel MK808S; the available Autel listing is the MX808S, a different model from the same maker, and is labelled as such rather than relabelled MK808S.'),
  'launch-x431-bmw': c('PRODUCT_FAMILY_ALTERNATIVE', 'The guide is about LAUNCH X-431 routes for BMW; the verified Creader Elite V2.0 for BMW and X-431 PRO3S+ are accurately named units within that family rather than any unavailable model named in the body.'),
  'launch-x431-vs-autel-for-bmw': c('PRODUCT_FAMILY_ALTERNATIVE', 'Each verified platform represents its own maker\'s workshop tier in the comparison; neither is presented as a specific unavailable model.'),

  // --- related diagnostic tools that genuinely perform the article's task ---
  'bimmercode-pricing': c('RELATED_DIAGNOSTIC_TOOL', 'The subject is app pricing, not hardware; CX and MX+ are the hardware paths the article itself prices, documented by OBDLink for BimmerCode.'),
  'bimmercode-vs-carly': c('RELATED_DIAGNOSTIC_TOOL', 'OBDLink documents CX for BimmerCode; the card makes no Carly-compatibility claim.'),
  'bimmercode-vs-foxwell-nt530': c('RELATED_DIAGNOSTIC_TOOL', 'CX represents the documented BimmerCode side only; no unverified Foxwell listing is substituted.'),
  'bimmercode-vs-protool': c('RELATED_DIAGNOSTIC_TOOL', 'CX is documented for BimmerCode and is shown only for that side, not as ProTool hardware.'),
  'bimmerlink-pricing': c('RELATED_DIAGNOSTIC_TOOL', 'The subject is the BimmerLink cost chain; CX is the documented adapter inside that chain.'),
  'bimmerlink-vs-carly': c('RELATED_DIAGNOSTIC_TOOL', 'OBDLink documents CX for BimmerLink; no Carly-compatibility claim is made.'),
  'bimmerlink-vs-foxwell-nt530': c('RELATED_DIAGNOSTIC_TOOL', 'CX represents the documented BimmerLink route; the unavailable Foxwell side is not mismatched.'),
  'bimmerlink-vs-protool': c('RELATED_DIAGNOSTIC_TOOL', 'CX is shown only as the documented BimmerLink interface, with no ProTool claim.'),
  'bimmerlink-vs-bimmer-tool': c('RELATED_DIAGNOSTIC_TOOL', 'CX is the named supported BimmerLink adapter; the apps themselves are not monetized and no bimmer-tool hardware is implied.'),
  'bmw-battery-drain-diagnostic-tool': c('RELATED_DIAGNOSTIC_TOOL', 'A parasitic-drain measurement is a meter task; Fluke documents the exact automotive meter and the drain workflow the article follows.'),
  'bmw-battery-registration-scanner': c('RELATED_DIAGNOSTIC_TOOL', 'The article develops the BimmerLink registration route and OBDLink documents CX as compatible equipment for it.'),
  'bmw-bidirectional-scan-tool-functions': c('RELATED_DIAGNOSTIC_TOOL', 'MK900-BT is an accurately named 900-tier bidirectional platform; exact BMW functions remain gated on Autel coverage checks.'),
  'bmw-code-reader-vs-scan-tool': c('RELATED_DIAGNOSTIC_TOOL', 'CX and DS808S-BT are representatives of the two architectures the article compares, not two specific named products.'),
  'bmw-dpf-regeneration-scan-tool': c('RELATED_DIAGNOSTIC_TOOL', 'CX is the documented BimmerLink adapter for the DPF service-regeneration request workflow; capability stays gated on exact BMW support.'),
  'bmw-electronic-water-pump-diagnostic-tool': c('RELATED_DIAGNOSTIC_TOOL', 'Innova documents coolant bleeding among 5610 functions; the verified listing is the 5610 plus 3380 bundle and is named as the bundle.'),
  'bmw-no-communication-with-obd-scanner': c('RELATED_DIAGNOSTIC_TOOL', 'The diagnostic sequence is voltage, continuity and resistance evidence; Fluke documents those exact measurements on the 88V.'),
  'bmw-ride-height-calibration-scan-tool': c('RELATED_DIAGNOSTIC_TOOL', 'Autel documents suspension calibration on the standard MaxiSYS Ultra; exact BMW coverage remains mandatory.'),
  'bmw-scanner-for-used-car-inspection': c('RELATED_DIAGNOSTIC_TOOL', 'The subject is an inspection workflow, not a product; DS808S-BT supports the all-system scan, live-data and report steps the guide develops.'),
  'bmw-scanner-without-subscription': c('RELATED_DIAGNOSTIC_TOOL', 'Innova documents free updates and no subscription for the 5610; the listing is named as the 5610 plus 3380 bundle.'),
  'bmw-service-reset-tool': c('RELATED_DIAGNOSTIC_TOOL', 'CX is documented for the BimmerLink service route; exact BMW and service support still require checking.'),
  'bmw-steering-angle-sensor-calibration-tool': c('RELATED_DIAGNOSTIC_TOOL', 'Autel documents SAS service on the exact MX808S; the function is not extended to an unverified BMW.'),
  'bmw-tpms-diagnostic-tool': c('RELATED_DIAGNOSTIC_TOOL', 'MX808S and MX808S-TS are named accurately and preserve the diagnostic-versus-TPMS-programming distinction the guide is built on.'),
  'bmw-transfer-case-adaptation-reset-tool': c('RELATED_DIAGNOSTIC_TOOL', 'MaxiSYS Ultra is a workshop platform for the pre/post checks, with no claimed BMW VTG reset.'),
  'bmw-vanos-diagnostic-tool': c('RELATED_DIAGNOSTIC_TOOL', 'DS808S-BT is the full-tablet route, shown only inside the VANOS-capability gate; exact BMW coverage must be confirmed.'),
  'bmw-wheel-speed-sensor-diagnostic-tool': c('RELATED_DIAGNOSTIC_TOOL', 'MX900 is recommended within the BMW DSC and live-data capability gate; four-corner access requires confirming the exact BMW.'),
  'carly-subscription-cost': c('RELATED_DIAGNOSTIC_TOOL', 'Carly hardware is unavailable; CX is shown only as an alternative BMW app route and never as Carly-compatible.'),
  'carly-vs-foxwell-nt530': c('RELATED_DIAGNOSTIC_TOOL', 'Neither named side has an approved listing; the 7910P+ is a clearly separated BMW-scanner alternative.'),
  'foxwell-nt530-vs-nt710': c('RELATED_DIAGNOSTIC_TOOL', 'The rejected GM NT710 and the unverified NT530 Plus listings are excluded; the 7910P+ is labelled as an available BMW-scanner alternative.'),
  'ista-vs-bimmerlink': c('RELATED_DIAGNOSTIC_TOOL', 'CX is the documented BimmerLink side and is never presented as an ISTA interface or ICOM replacement.'),
  'mini-diagnostic-app': c('RELATED_DIAGNOSTIC_TOOL', 'CX is documented for BimmerCode and BimmerLink; MINI, app and feature support still require publisher checks.'),
  'obd-app-vs-handheld-scanner': c('RELATED_DIAGNOSTIC_TOOL', 'CX and MX808S represent the app and tablet architectures the article compares.'),
  'protool-pricing': c('RELATED_DIAGNOSTIC_TOOL', 'ProTool hardware is unavailable; CX is a labelled alternative BMW app interface for a different supported route.'),
  'protool-vs-carly': c('RELATED_DIAGNOSTIC_TOOL', 'CX is a distinct alternative BMW app route and is not claimed compatible with ProTool or Carly.'),

  // --- supporting equipment: needed by the procedure, not the tool the article is about ---
  'bmw-coding-vs-programming': c('SUPPORTING_EQUIPMENT', 'BMW requires external power support for programming; INC100 supports the workflow without pretending to be a coding interface.'),
  'bmw-diagnostic-software-windows': c('SUPPORTING_EQUIPMENT', 'The article covers programming infrastructure; INC100 is documented for ECU reprogramming power, not as diagnostic software.'),
  'bmw-frm-module-diagnostic-tool': c('SUPPORTING_EQUIPMENT', 'The Fluke kit supports the power, ground and circuit evidence the article requires without claiming FRM module access.'),
  'bmw-icom-vs-enet': c('SUPPORTING_EQUIPMENT', 'INC100 supports stable power for programming-risk workflows and is not presented as ICOM or ENET hardware.'),
  'bmw-icom-vs-k-dcan': c('SUPPORTING_EQUIPMENT', 'INC100 is programming support equipment, not ICOM or K+DCAN hardware.'),
  'ista-valvetronic-relearn': c('SUPPORTING_EQUIPMENT', 'Schumacher documents INC100 as a stable diagnostic and ECU-reprogramming supply; it is not a claimed relearn interface.'),
  'k-dcan-vs-enet-cable': c('SUPPORTING_EQUIPMENT', 'Generic cables remain unlinked; INC100 is supporting power for coding and programming, never a cable substitute.'),
  'protool-vs-ista': c('SUPPORTING_EQUIPMENT', 'INC100 supports coding and programming power needs and is not presented as ProTool hardware or an ISTA interface.')
};

export function getRelationshipClassification(slug: string): RelationshipClassification | undefined {
  return relationshipClassifications[slug];
}
