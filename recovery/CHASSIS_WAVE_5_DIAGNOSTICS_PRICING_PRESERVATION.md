# Chassis Signal Recovery — Wave 5: Diagnostics and Pricing Evidence Ledger

**Prepared:** October 10, 2026  
**Branch:** `recovery/chassis-wave-5-diagnostics-pricing`  
**Release gate:** Human review; do not merge without explicit next approval.

## Purpose and the original plan
Wave 5 addresses the retained BMW module/diagnostic article family, versioned pricing-and-entitlement evidence, and stronger site navigation. It is not the same as a fresh pairwise comparison campaign. The existing 69 articles, original figures and evidence remain in place; this adds reusable cross-task navigation and updates selected retained pages without diverting independent queries.

## Two new flagship resources
1. `/guides/bmw-module-troubleshooting/`: substantial native Chassis article with a source-led 12-topic symptom directory, evidence ladder, fault-domain graphics, module-inventory and read-only triage tables, 4 technical scenarios, primary source references, safety boundaries, 12 related specialist cards at end.
2. `/tools/bmw-diagnostic-software-price-ledger/`: native Chassis article with a source-versioned pricing model, regional/entitlement caveats, real-price listings where verified, variable Carly quote explicitly unresolved, local three-year estimate calculator requiring user-supplied equipment and renewal inputs, evidence tables, risk and checkout methods, four scenario discussions, eight related guides at end.

**New illustrations:** 8 original SVG files, four conceptual diagrams in desktop and mobile formats:
- diagnostic-evidence-ladder(.svg / -mobile.svg)
- diagnostic-failure-domains(.svg / -mobile.svg)
- ownership-cost-components(.svg / -mobile.svg)
- entitlement-decision(.svg / -mobile.svg)

## Research validation and claim-level sources

| Claim | Primary evidence | Boundary |
|---|---|---|
| BMW ISTA gives diagnostic fault analysis, test plans, repair/wiring information | [BMW North America AOS guide](https://www.bmwtechinfo.com/tisUI/assets/site_information.pdf) | Authorized service context; not a consumer diagnosis guarantee |
| BimmerLink supports fault memories, live data and eligible vehicle functions | [BimmerLink developer](https://bimmerlink.app/) and [US iOS listing](https://apps.apple.com/us/app/bimmerlink/id1065360416) | Functions vary by vehicle and factory equipment; no physical testing |
| BimmerCode US iOS Full Version advertised $49.99 | [US iOS listing](https://apps.apple.com/us/app/bimmercode/id1130787459) | US Apple storefront on 2026-10-10 only, not a cross-platform rate |
| BimmerLink US iOS Full Version $39.99 / CarPlay optional $9.99 | [US iOS listing](https://apps.apple.com/us/app/bimmerlink/id1065360416) | Optional purchase separate, and app-specific functions must be checked |
| ProTool Diagnostic/Coding each $99.99, Master $174.99 | [ProTool publisher](https://www.bimmergeeks.net/protool) | Official USD vendor rate on date reviewed, Android host and adapter extra |
| Carly annual pricing depends on region, package and brand | [Carly pricing selector](https://www.mycarly.com/pricing/) and [Carly Premium support](https://support.mycarly.com/hc/en-us/articles/20084641053586-What-is-Carly-Premium-Package) | No worldwide or guaranteed renewal quote; no hardcoded Carly price |
| BMW North America TIS 1-day $32, 1-month $270, 1-year $2,700 | [BMW TIS portal](https://bmwtechinfo.bmwgroup.com/tisUI/) | North American region and access period only; no workshop hardware included |

## External search/intent-gap reconnaissance (unpaid, not DataForSEO)
Sample free web search results for BMW diagnostic software comparison and scanner-not-connecting queries included a product-centered comparison, generic feature ranking, and symptom-specific gateway troubleshooting. Those are useful context but not a measured top-N search-engine ranking study. This recovery release deliberately adds:
- a documented *cross-module evidence method* linked to original distinct symptom investigations, not another one-off generic fault-code article;
- source-dated **actual license/region/entitlement relationships**, not speculative “best value” scores or recycled retailer snippets;
- an interactive calculator that refuses to fabricate hardware prices or Carly renewal costs;
- preserved specialist articles and their original visual research instead of mass 301s.

No paid SERP or keyword API call was made. We make no claims about search rank, demand or Google recovery.

## Preserved source families
**Twelve diagnostic specialist guides** received contextual backlinks. Four were enhanced with a concise retained-evidence checklist; all their original article text, diagrams, citations and images remain in order:
- bmw-no-communication-with-obd-scanner
- bmw-frm-module-diagnostic-tool
- bmw-battery-drain-diagnostic-tool
- bmw-vanos-diagnostic-tool
- bmw-electric-parking-brake-service-mode-scanner
- bmw-electronic-water-pump-diagnostic-tool
- bmw-wheel-speed-sensor-diagnostic-tool
- bmw-steering-angle-sensor-calibration-tool
- bmw-dpf-regeneration-scan-tool
- bmw-ride-height-calibration-scan-tool
- bmw-parking-sensor-diagnostic-tool
- bmw-transfer-case-adaptation-reset-tool

**Eight pricing/software guides** received a dated pricing-ledger reference, preserving their original time-stamped claims and original graphics:
- bimmercode-pricing
- bimmerlink-pricing
- carly-subscription-cost
- protool-pricing
- bmw-scanner-without-subscription
- bimmercode-vs-protool
- bimmerlink-vs-carly
- protool-vs-ista

**Protection:** 69 existing Markdown sources, exactly 20 approved append-style edits, original SVG asset references retained. No source 301, 410, delete, noindex, canonical change or affiliate changes. Never redirect any of these without a claim-by-claim and visual-preservation review.

## Navigation
The module hub is linked from Guides, Scanners, Battery & Service and Research. The pricing ledger is linked from Software, Comparisons, Battery & Service and Research. Both new pages include first-party sources, contextual links and an end-of-article related-reading section in the *native* Chassis article presentation (title/metadata, centered serif column, TOC, evidence/safety rail).

## Publication and QA
- Astro typecheck and production build; original affiliate tests.
- Both new URLs in autogenerated XML sitemaps and canonical self-reference.
- Eight new desktop/mobile SVGs and all original article diagrams preserved.
- Exactly 20 original guides linked back and 69 retained articles.
- Native article structure, source ledger, no false/unverifiable price claims and no new 301s.
- Chromium checks at 390/768/1280: both pages render without horizontal page overflow, native TOC and SVGs, finder filtering, unquoted Carly remains incomplete, ProTool one-time license and Carly annual math and non-recurring BMW TIS pass.
- Full-site affiliate deterministic/visual regression CI before user approval and merge.

## Search Console indexing backlog
Manual URL inspection submission for Wave 3 remained pending after quota exhaustion, and Wave 4 URLs were not confirmed as manually submitted. Neither status blocks the Wave 5 GitHub PR or normal sitemap discovery. After approved deployment, submit the two new Wave 5 URLs when GSC quota permits. Avoid re-requesting all existing specialist article URLs merely because they now contain additional references.
