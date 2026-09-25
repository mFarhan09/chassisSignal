import type { MonetizationMode } from './types';

export type EditorialDecision = 'APPROVE' | 'CORRECTED' | 'HOLD';

export interface EditorialMappingOverride {
  editorialDecision: EditorialDecision | null;
  monetizationMode: MonetizationMode;
  primaryProductKeys: string[];
  alternativeProductKeys: string[];
  recommendationRationale: string;
  relatedBuyerGuideSlug: string | null;
}

const approve = (monetizationMode: MonetizationMode, primaryProductKeys: string[], alternativeProductKeys: string[], recommendationRationale: string): EditorialMappingOverride => ({
  editorialDecision: 'APPROVE', monetizationMode, primaryProductKeys, alternativeProductKeys, recommendationRationale, relatedBuyerGuideSlug: null
});

// PORTFOLIO POLICY (2026-09-25): there is no longer any such thing as an intentionally
// unmonetized published guide. Every published guide must map at least one verified product.
// Where the exact product discussed has no verified listing, the strongest relevant verified
// product is mapped instead and labelled for what it ACTUALLY is (never as the exact product).
// The former `unmonetized()` helper and the `no_defensible_product` publication path are
// deliberately gone; `scripts/affiliate-rollout-audit.mjs` fails the release if any published
// guide renders zero affiliate links.

const corrected = (monetizationMode: MonetizationMode, primaryProductKeys: string[], alternativeProductKeys: string[], recommendationRationale: string): EditorialMappingOverride => ({
  editorialDecision: 'CORRECTED', monetizationMode, primaryProductKeys, alternativeProductKeys, recommendationRationale, relatedBuyerGuideSlug: null
});

export const editorialMappingOverrides: Record<string, EditorialMappingOverride> = {
  // --- 2026-09-25 full-site monetization repair: the five formerly unmonetized guides. ---
  // Each is mapped to the strongest VERIFIED relevant product in the registry and labelled for
  // what that product actually is. No exact-product identity is transferred to a variant.
  'foxwell-nt710-vs-autel-mk900-bmw': corrected('recommended_equipment', ['foxwell-nt530'], ['autel-mk900-bt'], 'Neither exact tool compared here has a verified listing: the BMW-software NT710 could not be resolved to a standalone listing, and no base wired MaxiCOM MK900 listing states the vehicle communication method this comparison turns on. The Foxwell NT530 is the available BMW-focused Foxwell handheld — it is not the NT710 and carries none of the NT710 coding claims. Confirm the exact SKU, installed BMW software and the specific function before buying.'),
  'autel-mk900-bmw-compatibility': corrected('recommended_equipment', ['autel-mk900-bt'], [], 'Check 1 of this guide is variant discipline, and the MaxiCOM MK900-BT is the wireless MK900-family variant Autel names in its own comparison table. It is not the base wired MK900 this page opens on. Run all five checks against the exact variant and your VIN before you pay.'),
  'icarsoft-bmm-v3-vs-foxwell-nt530': corrected('recommended_equipment', ['foxwell-nt530'], [], 'The Foxwell NT530 is the side of this comparison with a verified listing, so only that side is shown; the iCarsoft BMM V3.0 has no listing whose product identity resolves cleanly enough to link. Confirm the exact SKU and the installed BMW software authorization before purchase.'),
  'obdlink-cx-vs-unicarscan-ucsi-2100': corrected('recommended_equipment', ['obdlink-cx'], [], 'OBDLink CX is the exact adapter on one side of this comparison and the side with a verified, rights-cleared listing; the UniCarScan UCSI-2100 is not shown. Confirm current BimmerCode and BimmerLink support for your exact BMW and phone platform before purchase.'),
  'bmw-parking-sensor-diagnostic-tool': corrected('recommended_equipment', ['autel-mk900-bt'], [], 'This guide turns on reaching the PDC/PMA module, reading each sensor live and running the module output tests. The Autel MaxiCOM MK900-BT is the verified bidirectional all-system platform already recommended in the related BMW bidirectional-functions guide. Autel publishes no BMW PDC/PMA sensor-level coverage, so confirm the exact BMW and the specific activation test before buying.'),
  'autel-scanner-for-bmw': corrected('comparison', ['autel-mx808s', 'autel-mk900-bt'], [], 'The guide develops the Autel 808 and 900 tiers; verified MX808S and MK900-BT are accurately named available variants, subject to BMW coverage checks.'),
  'autophix-7910-vs-foxwell-nt530': corrected('recommended_equipment', ['autophix-7910p-plus'], [], 'The supplied 7910P+ is an available successor on the AUTOPHIX side; it is not relabelled as the unavailable 7910 or Foxwell NT530.'),
  'bimmercode-pricing': approve('recommended_equipment', ['obdlink-cx'], ['obdlink-mx-plus'], 'The article prices the BimmerCode working chain and explicitly identifies CX and MX+ as supported hardware paths.'),
  'bimmercode-vs-carly': corrected('compatible_adapter', ['obdlink-cx'], [], 'OBDLink CX is the documented BimmerCode path and is not presented as Carly-compatible hardware.'),
  'bimmercode-vs-foxwell-nt530': corrected('compatible_adapter', ['obdlink-cx'], [], 'OBDLink CX accurately represents the supported BimmerCode side; no unverified Foxwell listing renders.'),
  'bimmercode-vs-protool': corrected('compatible_adapter', ['obdlink-cx'], [], 'OBDLink CX is documented for BimmerCode and is shown only for that side, not as a ProTool adapter.'),
  'bimmerlink-adapter': corrected('recommended_equipment', ['obdlink-cx'], ['obdlink-mx-plus'], 'CX is the focused exact BimmerLink adapter candidate; MX+ is the single broader-network alternative. Generic ENET is excluded.'),
  'bimmerlink-pricing': approve('recommended_equipment', ['obdlink-cx'], [], 'The article explicitly includes OBDLink CX as recommended equipment in the complete BimmerLink cost and compatibility chain.'),
  'bimmerlink-vs-carly': corrected('compatible_adapter', ['obdlink-cx'], [], 'OBDLink documents CX for BimmerLink; the card makes no Carly compatibility claim.'),
  'bimmerlink-vs-foxwell-nt530': corrected('compatible_adapter', ['obdlink-cx'], [], 'OBDLink CX represents the documented BimmerLink route; the unavailable Foxwell side is not mismatched.'),
  'bimmerlink-vs-protool': corrected('compatible_adapter', ['obdlink-cx'], [], 'OBDLink CX is shown only as the documented BimmerLink interface, with no ProTool compatibility claim.'),
  'bmw-battery-drain-diagnostic-tool': corrected('recommended_equipment', ['fluke-88v'], [], 'Fluke documents the exact automotive meter and a parasitic-drain workflow; its current resolution and protected measurement ranges directly support the article evidence process.'),
  'bmw-battery-registration-scanner': corrected('compatible_adapter', ['obdlink-cx'], [], 'The article develops the BimmerLink registration route and OBDLink documents CX as compatible equipment, subject to vehicle support.'),
  'bmw-bidirectional-scan-tool-functions': corrected('recommended_equipment', ['autel-mk900-bt'], [], 'Verified MK900-BT is an accurately named 900-tier bidirectional platform; exact BMW functions require Autel coverage checks.'),
  'bmw-brake-bleed-scan-tool': corrected('exact_product', ['autel-md909-pro'], [], 'Autel names Brake Bleeding as a supported MD909 Pro service function; the article and mapping retain the requirement to confirm the exact BMW in Autel coverage before purchase.'),
  'bmw-code-reader-vs-scan-tool': corrected('comparison', ['obdlink-cx', 'autel-ds808s-bt'], [], 'CX represents the adapter/app route and accurately named DS808S-BT represents the full tablet route.'),
  'bmw-coding-vs-programming': corrected('recommended_equipment', ['schumacher-inc100'], [], 'BMW requires external power support for programming and Schumacher documents INC100 for stable ECU reprogramming and diagnostic power; it supports the workflow without pretending to be a coding interface.'),
  'bmw-diagnostic-software-windows': corrected('recommended_equipment', ['schumacher-inc100'], [], 'The article includes programming infrastructure, BMW requires an external power supply for programming, and Schumacher documents INC100 for ECU reprogramming and diagnostic support.'),
  'bmw-electric-parking-brake-service-mode-scanner': corrected('exact_product', ['autel-md909-pro'], [], 'Autel documents EPB and parking-brake pad relearn on the exact MD909 Pro; buyers must still confirm their BMW, model year and market in the coverage database.'),
  'bmw-electronic-water-pump-diagnostic-tool': corrected('recommended_equipment', ['innova-5610-bundle'], [], 'Innova documents coolant bleeding among 5610 functions and requires vehicle checks; the verified listing is the 5610 plus 3380 bundle.'),
  'bmw-enet-vs-bluetooth-obd': corrected('compatible_adapter', ['obdlink-cx'], [], 'CX is the exact Bluetooth side and is not described as ENET hardware.'),
  'bmw-frm-module-diagnostic-tool': corrected('recommended_equipment', ['fluke-88v'], [], 'The article requires power, ground and circuit evidence; the Fluke kit supports those checks without claiming FRM access.'),
  'bmw-f-series-vs-g-series-obd-adapter': corrected('compatible_adapter', ['obdlink-cx'], [], 'BimmerCode lists CX across supported BMW series; the app and exact vehicle matrix still controls compatibility.'),
  'bmw-icom-vs-enet': corrected('recommended_equipment', ['schumacher-inc100'], [], 'INC100 supports stable power for programming-risk workflows and is not presented as ICOM or ENET hardware.'),
  'bmw-icom-vs-k-dcan': corrected('recommended_equipment', ['schumacher-inc100'], [], 'INC100 is relevant programming support equipment, not ICOM or K+DCAN hardware.'),
  'bmw-injector-coding-tool': corrected('exact_product', ['autel-md909-pro'], [], 'Autel documents an Injector service function on the exact MD909 Pro; the recommendation remains conditional on an exact BMW coverage result for the engine and market.'),
  'bmw-no-communication-with-obd-scanner': corrected('recommended_equipment', ['fluke-88v'], [], 'The diagnostic sequence requires voltage, continuity and resistance evidence at power, ground and network points; Fluke documents those exact automotive measurement capabilities on the 88V.'),
  'bmw-ride-height-calibration-scan-tool': corrected('recommended_equipment', ['autel-maxisys-ultra'], [], 'Autel documents suspension calibration on standard MaxiSYS Ultra; exact BMW coverage remains mandatory.'),
  'bmw-scanner-abs-airbag-codes': corrected('recommended_equipment', ['autel-mx900'], [], 'The body identifies MX900 as the broader all-system route; vehicle-level coverage checks remain.'),
  'bmw-scanner-for-used-car-inspection': corrected('exact_product', ['autel-ds808s-bt'], [], 'Accurately named DS808S-BT supports the all-system scan, live-data and report workflow developed by the guide.'),
  'bmw-scanner-without-subscription': corrected('recommended_equipment', ['innova-5610-bundle'], [], 'Innova documents free updates and no subscription for 5610; the listing is accurately identified as the 5610 plus 3380 bundle.'),
  'bmw-service-reset-tool': corrected('compatible_adapter', ['obdlink-cx'], [], 'CX is documented for the BimmerLink service route; exact BMW and service support must be checked.'),
  'bmw-steering-angle-sensor-calibration-tool': corrected('recommended_equipment', ['autel-mx808s'], [], 'Autel documents SAS service on exact MX808S; this does not extend the function to an unverified BMW.'),
  'bmw-tpms-diagnostic-tool': corrected('comparison', ['autel-mx808s', 'autel-mx808s-ts'], [], 'Accurately named MX808S and MX808S-TS preserve the diagnostic-versus-TPMS programming distinction.'),
  'bmw-transfer-case-adaptation-reset-tool': corrected('recommended_equipment', ['autel-maxisys-ultra'], [], 'MaxiSYS Ultra is a workshop platform for pre/post checks without claiming an unverified BMW VTG reset.'),
  'carly-subscription-cost': corrected('recommended_equipment', ['obdlink-cx'], [], 'With Carly hardware unavailable, CX is shown only as an alternative BMW app route, never as Carly-compatible.'),
  'carly-vs-foxwell-nt530': corrected('recommended_equipment', ['autophix-7910p-plus'], [], 'Neither named side has an approved listing; 7910P+ is a clearly separated BMW-scanner alternative.'),
  'creator-c310-plus-vs-foxwell-nt530': corrected('exact_product', ['creator-c310-plus'], [], 'Creator C310+ is the exact available side; no unverified Foxwell listing is substituted.'),
  'foxwell-nt530-vs-autel-mk808s-bmw': corrected('recommended_equipment', ['autel-mx808s'], [], 'The available Autel listing is accurately named MX808S, not MK808S, with no Foxwell substitution.'),
  'foxwell-nt530-vs-nt710': corrected('recommended_equipment', ['autophix-7910p-plus'], [], 'Rejected GM NT710 and unverified NT530 listings are excluded; 7910P+ is labelled as an available BMW-scanner alternative.'),
  'ista-valvetronic-relearn': corrected('recommended_equipment', ['schumacher-inc100'], [], 'The article requires stable power when the BMW procedure calls for it, and Schumacher documents INC100 as a stable diagnostic and ECU-reprogramming power supply; it is supporting equipment, not a claimed relearn interface.'),
  'ista-vs-bimmerlink': corrected('compatible_adapter', ['obdlink-cx'], [], 'CX is the documented BimmerLink side and is not presented as an ISTA interface or ICOM replacement.'),
  'k-dcan-vs-enet-cable': corrected('recommended_equipment', ['schumacher-inc100'], [], 'Generic cables remain unlinked; INC100 is supporting power for coding/programming, not a cable substitute.'),
  'launch-x431-bmw': corrected('comparison', ['launch-creader-elite-bmw-v2', 'launch-x431-pro3s-plus'], [], 'Accurately named LAUNCH products represent the BMW-focused and professional routes developed in the guide.'),
  'launch-x431-vs-autel-for-bmw': corrected('comparison', ['launch-x431-pro3s-plus', 'autel-maxisys-ultra'], [], 'Verified platforms accurately represent LAUNCH and Autel workshop alternatives without unavailable model names.'),
  'mini-diagnostic-app': corrected('compatible_adapter', ['obdlink-cx'], [], 'CX is documented for BimmerCode and BimmerLink; MINI, app and feature support still require publisher checks.'),
  'obd-app-vs-handheld-scanner': corrected('comparison', ['obdlink-cx', 'autel-mx808s'], [], 'Exact CX and accurately named MX808S represent the app and tablet architectures.'),
  'obdlink-cx-vs-lx': approve('comparison', ['obdlink-cx', 'obdlink-lx'], [], 'The mapping already contains exactly the two named OBDLink products.'),
  'obdlink-cx-vs-mx-plus': corrected('comparison', ['obdlink-cx', 'obdlink-mx-plus'], [], 'Keep the two named products primary and remove incidental adapter alternatives.'),
  'obdlink-cx-vs-vlinker-bm-plus': approve('comparison', ['obdlink-cx', 'vlinker-bm-plus'], [], 'The mapping already contains exactly the two named adapter products.'),
  'obdlink-cx-vs-vlinker-mc-plus': corrected('comparison', ['obdlink-cx', 'vlinker-mc-plus'], [], 'Use the exact two named adapters; vLinker BM+ is only adjacent comparison context.'),
  'obdlink-ex-vs-enet-cable': corrected('exact_product', ['obdlink-ex'], [], 'EX is the exact product discussed, with a warning that it is FORScan/Ford-oriented and not BMW ENET.'),
  'obdlink-mx-plus-vs-lx': corrected('comparison', ['obdlink-mx-plus', 'obdlink-lx'], [], 'Use the exact two named OBDLink models and remove CX/MC+ contextual mentions.'),
  'obdlink-mx-plus-vs-vlinker-bm-plus': approve('comparison', ['obdlink-mx-plus', 'vlinker-bm-plus'], [], 'The mapping already contains exactly the two named adapter products.'),
  'protool-pricing': corrected('recommended_equipment', ['obdlink-cx'], [], 'With ProTool hardware unavailable, CX is only a labelled alternative BMW app interface for a different supported route.'),
  'protool-vs-carly': corrected('recommended_equipment', ['obdlink-cx'], [], 'CX is a distinct alternative BMW app route and is not claimed compatible with ProTool or Carly.'),
  'protool-vs-ista': corrected('recommended_equipment', ['schumacher-inc100'], [], 'INC100 supports coding/programming power needs and is not presented as ProTool hardware or ISTA interface.'),
  'vlinker-bm-plus-vs-mc-plus': corrected('comparison', ['vlinker-bm-plus', 'vlinker-mc-plus'], [], 'Use exactly the two named Vgate adapter models and remove unrelated OBDLink context.'),
  'bimmerlink-vs-bimmer-tool': approve('compatible_adapter', ['obdlink-cx'], [], 'OBDLink CX is named as the supported BimmerLink adapter; the diagnostic apps are not monetized and no bimmer-tool hardware is implied.'),
  'bmw-dpf-regeneration-scan-tool': approve('recommended_equipment', ['obdlink-cx'], [], 'OBDLink CX is the documented BimmerLink adapter for the DPF service-regeneration request workflow; capability remains gated on exact BMW support.'),
  'bmw-vanos-diagnostic-tool': approve('recommended_equipment', ['autel-ds808s-bt'], [], 'Autel DS808S-BT is the recommended full-tablet route, shown only within the VANOS-capability gate; exact BMW coverage must be confirmed.'),
  'bmw-wheel-speed-sensor-diagnostic-tool': approve('recommended_equipment', ['autel-mx900'], [], 'Autel MX900 is the recommended tool within the BMW DSC and live-data capability gate; four-corner wheel-speed access requires confirming the exact BMW.')
};
