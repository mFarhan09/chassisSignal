# Chassis Signal — Final Forensic Discovery and Recovery Closure

**Research and release date:** 10 October 2026  
**Original evidence:** `recovery/data/chassis-forensic-audit-2026-10-04.json` (125 original audit rows, **65** Chassis Signal rows)  
**Branch:** `recovery/chassis-final-closure-65url-discovery-audit` (base `main` at `c5dc31f3f3a700d97da02650d386467735d4a653`)  
**Companion machine-readable disposition for every original URL:** `recovery/data/chassis-final-65url-discovery-ledger-2026-10-10.json`

## Executive closure inventory — no SEO recovery claim

| Original action | URL count | Work recorded as of this branch | Unresolved conditions |
| --- | ---: | --- | --- |
| 19 redirect after merge + 13 merge | **32** | Wave 7 moved original research into five canonical resources; source Markdown and diagrams preserved; **64** exact slash/no-slash 301 rules already merged into main. | Rerun live HTTP 301/canonical/sitemap checks following deployment. |
| Substantial rebuild | **26** | 23 extensively updated, independent specialist pages on main (Wave 8B four, Wave 8C eleven, Wave 8D eight); three substantial content upgrades remain provisionally distinct. | **Three** specific query-intent gates still require GSC page-by-query joins. |
| Keep + minor improvement | **5** | All five strengthened on this branch using dated BMW/vendor technical references, original diagnostic evidence tables, safety boundaries and direct source citations. | PR checks and post-merge production validation. |
| Convert to database/tool | **2** | Entire Autel and bidirectional guide bodies and all original mobile/desktop SVGs embedded in named, expandable sections of scanner capability database; exact **four** new 301 rules and sitemap exclusion prepared on this branch. Original source Markdown remains byte-identical. | Release checks, merge, and **live HTTP 301** on both slash forms. |
| **Total** | **65** | **62 mechanically addressed/proposed by this closure PR; 3 intent decisions remain evidence-gated** | Do not equate implementation with recovered organic Google traffic. |

The original 32 consolidation dispositions remain separately recorded; the two additional forensic tool conversions are **not silently appended** to the historical Wave 7 cohort. After this PR, expected cumulative HTTP redirect scope is **34 former URLs / 68 explicit variants**; no archived Markdown source is deleted. The expected active discovery inventory is **35** of 69 preserved original Markdown files, not 69 separately indexable article pages.

## Five minor-improvement research decisions

| Original guide | Distinct job, reason to retain | October evidence and work |
| --- | --- | --- |
| `bmw-battery-drain-diagnostic-tool` | Identify parasitic drain vs low battery capacity, charging faults, sleep blocker and wake events. | BMW ST605 E70 energy management and ST811 F01 training examples; five-complaint truth table, sleep-state/supply distinctions, safe meter/wake observation handoff. Do **not** transfer E70 sleep time/current thresholds to other BMWs. |
| `bmw-coding-vs-programming` | Differentiate benign coding, service resets, adaptations, VO configuration, firmware programming and recovery. | BMW AOS technical requirements + BimmerCode publisher; exact operation/authorization matrix and technician escalation boundary. |
| `bmw-frm-module-diagnostic-tool` | FRM versus FEM/REM module-generation identification and original ECU/supply/circuit evidence before expensive or dangerous replacement. | BMW ST1113 F30 explains FEM/REM's replacement of older E90 module functions; BMW ST1002 F10 identifies FRM; **historical** NHTSA-hosted BMW bulletin SI B01 20 16 shows VIN-based, time-limited FRM warranty terms. This does **not** imply any 2026 coverage. |
| `bmw-no-communication-with-obd-scanner` | Locate a no-response fault to tool power, host/driver/VCI, vehicle/gateway/ECU architecture, or actual circuit. | BMW AOS and SAE J2534-1 scope; six-symptom evidence grid, support proof, read-only stop conditions. |
| `bmw-scanner-abs-airbag-codes` | Exact BMW ABS/DSC and SRS/ACSM code-read access versus dangerous bleed, actuation or clearance. | BMW TIS, NHTSA SRS safety, specific Foxwell/Autel hardware documentation; read-only truth table and professional escalation. |

All five articles retain the original published slug, date, hero media and original SVG/figure paths and source research; update date is 2026-10-10. They gained independently useful matrices and purchase/diagnostic worksheets; no affiliate product, target URL or commission inventory was changed. Their *existing approved affiliate positions* have been reflowed only within these five articles to avoid end cards appearing before the new decision material.

## Exact two tool conversions: claim/image migration not deletion

**`autel-scanner-for-bmw` → `/tools/bmw-scanner-capability-database/#autel-scanner-for-bmw`.** Preserve the original MK808S-vs-MK900 wired comparison, DoIP/CAN FD, BT/TS suffix distinctions, software expiry terms, named BMW ECU/function checks, buyer/cart audit, eight original vendor citations and all original desktop/mobile technical SVGs. A new evidence matrix explains precise differences and limits. **Entire Markdown content is rendered in an expandable archive within the canonical page** with `<AutelContent />`. Do not accidentally transfer a Bluetooth, TPMS or coding promise from one model to another.

**`bmw-bidirectional-scan-tool-functions` → `/tools/bmw-scanner-capability-database/#bmw-bidirectional-scan-tool-functions`.** Preserve code-reading versus live-signal versus active-command versus service routine versus firmware distinctions; all original matrices, risk-safety boundaries, manufacturer links, and the original technical diagrams. A new evidence matrix and full `<ActiveContent />` archive are integrated in the same canonical reference. Actuating DSC, brakes, steering or other safety functions is not authorized by a scanner marketing badge.

**Technical:** `src/components/ScannerConvertedEvidence.astro` contains both full-body source renders; `src/data/consolidated-redirects.mjs` retains the original 32 redirects *unchanged* and records the two additive, separately governed conversions; `public/_redirects` has two slash forms per source, and the sitemap exclusion now covers 34 retired URLs. A narrowly scoped Markdown rehype hyperlink transformer converts **internal hyperlink destinations only**, avoiding sitewide 301 hops; it does **not** rewrite legacy source Markdown or images.

**Do not claim the four new 301 responses are already live until merged and Cloudflare deployment actually serves them.**

## Three evidence-gated independent intent decisions

1. **`bmw-diagnostic-software-windows` (P2):** Keep provisionally for the *actual Windows host/driver/ISTA AOS/VCI/network preflight* rather than generic software-feature comparison. Requires page-query GSC to establish sufficient differentiated organic intent vs `/tools/bmw-diagnostic-software-comparison/`. No 301 proposed.
2. **`carly-vs-foxwell-nt530` (P1):** Keep provisionally for Carly subscription app versus named NT530 device price/renewal/phone dependency. Distinct from single-product Carly pricing and Foxwell model matrix, but overlapping topics need query-page evidence. No 301 proposed.
3. **`obd-app-vs-handheld-scanner` (P2):** Keep provisionally for *operational architecture and data custody*: smartphone/adapter compatibility, staff ownership, offline use, data export and lifetime entitlements. This may overlap general scanner capabilities. No 301 proposed.

**Free public SERP exploratory work (10 October 2026)** shows independent publisher and third-party pages about BMW Windows diagnostics, two-device comparisons and app-versus-handheld workflows. It supports *topic plausibility*, **not search-volume estimates, ranking competitiveness, current user queries or Google query-to-page overlap**. Do not invent top-N numerical metrics or claim a comprehensive paid SERP discovery. Current GSC per-URL/query and indexed-page evidence was not provided. The three pending decisions are deliberately open. See machine-readable ledger for the exact landing URLs and historical cohort-window context.

### GSC export required to finish the last three decisions

For the recent 28–90 day period and a second comparable period, export:
- Page-level impressions, clicks, average position and index/coverage state for each of the three candidate URLs *and* its nearest canonical competitor.
- Query-by-page data for each URL; document which queries uniquely land on a source versus also trigger a canonical tool (avoid merging adjacent topics just because their titles overlap).
- Query clusters with true user-job separation, branded/nonbranded distinctions, commercial versus troubleshooting intent; organic history alone is not a content-quality verdict.
- A source/figure migration checklist for any future approved consolidation, proposed exact destination/anchor, and pre-/post-redirect baseline.

If no useful current page-query data exists, retain provisionally and re-evaluate after indexing/observation. **Do not use fictional competition scores or paid DataForSEO calls** to force closure.

## Technical release and post-merge runbook

1. `node scripts/recovery-chassis-final-closure-qa.mjs` on current PR: verify original 65 disposition counts, exactly five source edits, 32 historical archive byte preservation, full two-source migration and every image, sitemap/redirect rules, 69 markdown originals, three unmapped intent gates and affiliate product equality.
2. `pnpm typecheck && pnpm test && pnpm build`; original `CHASSIS_FINAL_MINOR_REBUILD=1 node scripts/recovery-chassis-wave7-p0-qa.mjs` and Wave8A 26-candidate audit; controlled live affiliate QA; Chromium visual QA across 320/390/768/1440 widths.
3. **Only after PR approval/merge and successful production deployment**, run existing `node scripts/recovery-chassis-wave8a-live.mjs --strict` for historic 64 variants/five targets, and final 65-URL live audit including the *four* new variants, 34 sitemap exclusions and target anchors. Log response status, Location, content and canonical.
4. Verify robots and sitemap-index.xml/child sitemaps; no newly retired article URLs, article source still in repository but out of public discovery, no orphaned canonical research. Reinspect sitewide nav/related article links and broken media at mobile sizes.
5. Use GSC indexing for the retained canonical database URL and five refreshed specialist pages when needed; never request indexing for 301 source paths. Separately monitor 28/60/90 days of GSC page-query performance, indexed pages and search appearance. A merged release is not a ranking-recovery confirmation.

## Risk register: deliberately not claimed

- No current GSC page-query or page-by-date join and no actual post-release rankings. Historical `export_period_impressions` is **not** live traffic.
- No paid DataForSEO/top-N expansion call. No hands-on BMW control-module testing or real buyer checkout. Manufacturer advertised functions require exact chassis/ECU confirmation.
- No current live 301 proof for the two newly converted sources before release. GitHub Actions and Astro build are **pre-release checks**.
- Future Google spam-system reassessment may require time and independent site-quality evaluation; **no algorithmic recovery guarantee**.
