# Chassis Signal Recovery — Wave 8C / Batch 1 of 2

**Editorial review date:** 10 October 2026  
**Base:** `main` after Wave 8B / PR #16 (`af1ed012d93e2922a8ae9b1ff5f59c0789723ed6`)  
**Branch:** `recovery/chassis-wave-8c-batch1-eleven-specialist-guides`  
**Scope:** Eleven original `SUBSTANTIAL REBUILD` candidates, all marked provisional `REBUILD_IN_PLACE` in the original Wave 8A scorecard. **No merges, new URLs, deletions or redirects. No paid SERP calls.**

## Distinct-reader-task editorial inventory

| Rebuilt guide slug | Reader's decision / unique evidence | New specialist evidence |
| --- | --- | --- |
| `bmw-battery-registration-scanner` | Same-spec replacement registration vs configuration/coding | battery-event matrix, registration versus capacity/chemistry, receipts and failure evidence |
| `bmw-brake-bleed-scan-tool` | Is DSC/ABS actuation required for a particular hydraulic repair? | five repair scenarios, VIN/DSC/tool-function proof and technician handoff |
| `bmw-dpf-regeneration-scan-tool` | DPF diagnosis/status vs qualified regeneration vs replacement reset | blocking-fault matrix, observed versus requested result and strict heat/safety boundaries |
| `bmw-electric-parking-brake-service-mode-scanner` | EMF service position vs commissioning vs DSC bleed | five parking-related functions, approved state/repair evidence, unsafe-actuation stop conditions |
| `bmw-injector-coding-tool` | Engine-specific cylinder-coded replacement vs fault diagnosis | injector/cylinder identity traceability, strategy check and software write boundary |
| `bmw-parking-sensor-diagnostic-tool` | PDC/PMA reachability and evidence before replacing a sensor | symptom-to-module ladder, ECU-data limits and shared harness fault branches |
| `bmw-ride-height-calibration-scan-tool` | EHC/height actual measurement vs approved calibration after a repair | loading/measuring worksheet and component-versus-module eligibility |
| `bmw-steering-angle-sensor-calibration-tool` | DSC/SAS diagnosis after work vs physically necessary wheel alignment | trigger matrix, live-data record, physical-versus-software state |
| `bmw-tpms-diagnostic-tool` | Basic MX900 TPMS diagnosis vs MX900-TS RF/programming/relearn | exact-model Autel comparison, direct-RDC distinctions, safe sensor evidence |
| `bmw-transfer-case-adaptation-reset-tool` | VTG mechanical diagnosis vs repair-triggered adaptation | five-field proof and tyre/fluid/component/commissioning distinctions |
| `ista-valvetronic-relearn` | ISTA/DME guided Valvetronic diagnosis vs eligible teach-in | fault-branch and technician report, no repeat-loop or unsupported actuator steps |

All original body research and h2 sections, photo/webp and mobile/desktop SVG references, citations, tables and publishing slugs are preserved. Additional dated first-party vendor claims and useful original decision tables were added. These pages are original **specialist job-level resources** and do not claim to replace the cross-site [service eligibility matrix](/tools/bmw-service-function-matrix/).

## First-party evidence and limits

The current primary sources are [BMW Technical Information/AOS](https://bmwtechinfo.bmwgroup.com/assets/site_information.pdf) and BMW's [Advanced Vehicle Diagnosis training](https://bmwtechinfo.bmwgroup.com/tech_training_manual/ST1102%20Advanced%20Vehicle%20Diagnosis.pdf); [BimmerLink function descriptions](https://bimmerlink.app/); [Autel MX900-TS product features](https://store.autel.com/products/maxicheck-mx900-ts); [Autel MX900-TS/MX900 feature differences](https://www.autel.com/mk2/4106.jhtml); [the 2026 MX900-TS instruction manual](https://autel.com/u/cms/www/202603/190159109qfc.pdf); and [Autel vehicle coverage](https://www.autel.com/vehicle-coverage/coverage2). Sources are identified inside individual articles, with explicit limitations. The official BMW repair procedure depends on vehicle/VIN/engine/ECU and may require authorized access.

**Not performed:** No live VIN-specific BMW repair/ISTA session, hands-on controller actuation, scanner purchase, active brake, suspension, DPF, injector or motor test, licensed paid SEO call, full fresh top-N SERP gap crawl, or current GSC page-query join. Neither quoted capability listings nor word counts are independent performance/compatibility guarantees. High-risk procedures are deliberately not presented as generic DIY command sequences.

## Link consolidation and affiliate preservation

Original Wave 7 redirect destinations, underlying 32 redirected source articles and 64 slash/no-slash rules remain unchanged. Old contextual links directly to former retired guide URLs were re-pointed to the matching **canonical tool page plus preserved slug anchor** (`#original-slug`), instead of advertising a redirected source page.

Exactly eleven existing affiliate plans were re-anchored to more appropriate article positions: an early unit, an evidence-stage middle unit and a verification-stage end unit. The original product keys, verified links, image rights and card variants are retained. Every other article's placement plan, all product registry records, mapped approvals and sales-copy overrides remain unchanged. All original responsive SVG paths remain on the same published URLs; no low-value stand-in media is created.

## Release quality gates

1. `node scripts/recovery-chassis-wave8c-batch1-qa.mjs`: only the exact 11 files modified; no other Markdown changes; no historical frontmatter drift; original headings/assets/sources preserved; 1600+ counted content words; two or more new topic-specific h2s; at least two external evidence references; non-retired internal links; dated evidence; original affiliate identities retained; positions audited.
2. `pnpm test` and `pnpm build` plus standard `pnpm typecheck` and affiliate draft/live audit.
3. `CHASSIS_WAVE8C_BATCH1_REBUILD=1 node scripts/recovery-chassis-wave7-p0-qa.mjs` to prove all 32 merged-source archives, 64 redirects, and five landing pages remain intact, using a specifically scoped exception for the 11 **independent** guides.
4. `node scripts/recovery-chassis-wave8a-editorial.mjs` must maintain all 65 original audit rows, original 26 candidate intentions and preservation inventory.
5. Existing all-guides Chromium visual QA, including multiple screen widths, disclosure/rendered affiliate units, spacing and responsive accessibility checks.

**Status:** Pending completed PR CI and human review. No automatic merge to `main`; no Cloudflare deployment or Google indexing request claimed.

## Batch 2 (remaining 11) — reserved for separate recovery release

The remaining original 22 candidates after Wave 8B, minus these eleven, are:

**Eight provisional rebuilds:**
`bimmerlink-adapter`, `bmw-electronic-water-pump-diagnostic-tool`, `bmw-scanner-for-used-car-inspection`, `bmw-scanner-without-subscription`, `bmw-service-reset-tool`, `bmw-vanos-diagnostic-tool`, `bmw-wheel-speed-sensor-diagnostic-tool`, `launch-x431-bmw`.

**Three intent-review gates:**
`bmw-diagnostic-software-windows`, `carly-vs-foxwell-nt530`, `obd-app-vs-handheld-scanner`.

For the three intent-gate pages, no speculative 301 or deletion is approved without evidence of independent user task and complete claim/asset disposition. Their former visibility must not be treated as current without Google Search Console query-by-page data.

**After both batches:** perform the user's requested independent **final site-wide audit**, including the remaining 5 minor and 2 tool-conversion original audit items, article-to-canonical link/indexability structure, live redirects, and GSC performance/coverage limitations.
