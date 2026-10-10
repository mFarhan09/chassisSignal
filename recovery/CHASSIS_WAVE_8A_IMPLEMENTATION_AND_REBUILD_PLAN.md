# Chassis Signal Recovery Wave 8A — Original 26-Article Audit & Live Redirect Verification

**Original evidence:** User-supplied October 4 forensic CSV (125 rows; 65 Chassis Signal URLs). **Current branch:** `recovery/chassis-wave-8a-live-redirect-and-rebuild-audit`.

## Why this wave exists

Waves 1–6 provided eight detailed resources, and Wave 7 consolidated 32 URLs into five canonical pages with 64 exact HTTP redirect rules. Wave 8A **verifies production** rather than equating a GitHub merge with deployment, and produces action-ready assessments of the **26 exact URLs** classified `SUBSTANTIAL REBUILD` in the original audit. It does **not** publish new articles, change original SVGs or add speculative 301 redirects.

| Original action | URL count | Wave 8A treatment |
|---|---:|---|
| REDIRECT AFTER MERGE | 19 | Validate live HTTP 301 response and destination |
| MERGE | 13 | Validate live HTTP 301 response and destination |
| SUBSTANTIAL REBUILD | 26 | Individual evidence-led rebuild briefs |
| KEEP + MINOR IMPROVEMENT | 5 | Record separate closure gates |
| CONVERT TO DATABASE/TOOL | 2 | Compare existing deployed tools to original recommendation |
| **Total** | **65** | Exact original audit saved in repository |

### Source limitations

The forensic export contains no usable page-by-date / query-by-page joins and records those unavailable fields explicitly. **Impressions and average positions below are historical export-period figures, not current rankings or proof of recovered organic traffic.** Scores and word counts in the generated report are editorial triage signals, not a substitute for Google query-level evidence.

## Twenty original P1 rebuild candidates

| Guide slug | Historical impressions | Historical average position | Provisional action |
|---|---:|---:|---|
| `bimmercode-pricing` | 628 | 9.33 | Rebuild in place |
| `bimmerlink-pricing` | 208 | 8.12 | Rebuild in place |
| `carly-subscription-cost` | 204 | 15.01 | Rebuild in place |
| `bmw-transfer-case-adaptation-reset-tool` | 96 | 7.18 | Rebuild in place |
| `bmw-parking-sensor-diagnostic-tool` | 95 | 5.67 | Rebuild in place |
| `bmw-injector-coding-tool` | 91 | 11.08 | Rebuild in place |
| `bmw-steering-angle-sensor-calibration-tool` | 78 | 7.18 | Rebuild in place |
| `bmw-battery-registration-scanner` | 69 | 8.45 | Rebuild in place |
| `bmw-ride-height-calibration-scan-tool` | 58 | 6.5 | Rebuild in place |
| `protool-pricing` | 52 | 8.15 | Rebuild in place |
| `ista-valvetronic-relearn` | 44 | 6.93 | Rebuild in place |
| `bmw-brake-bleed-scan-tool` | 43 | 7.09 | Rebuild in place |
| `bmw-tpms-diagnostic-tool` | 34 | 7.5 | Rebuild in place |
| `bmw-dpf-regeneration-scan-tool` | 30 | 10.07 | Rebuild in place |
| `launch-x431-bmw` | 30 | 9.37 | Rebuild in place |
| `bmw-vanos-diagnostic-tool` | 29 | 8.28 | Rebuild in place |
| `bmw-service-reset-tool` | 18 | 8.83 | Rebuild in place |
| `bmw-scanner-without-subscription` | 7 | 7.43 | Rebuild in place |
| `carly-vs-foxwell-nt530` | 3 | 8 | Intent/merge gate |
| `bmw-electric-parking-brake-service-mode-scanner` | 0 | N/A | Rebuild in place |

## Six original P2 rebuild candidates

| Guide slug | Historical impressions | Historical average position | Provisional action |
|---|---:|---:|---|
| `bimmerlink-adapter` | 302 | 7.58 | Rebuild in place |
| `bmw-diagnostic-software-windows` | 78 | 16.82 | Intent/merge gate |
| `bmw-electronic-water-pump-diagnostic-tool` | 19 | 6.63 | Rebuild in place |
| `obd-app-vs-handheld-scanner` | 15 | 10.53 | Intent/merge gate |
| `bmw-scanner-for-used-car-inspection` | 10 | 7.1 | Rebuild in place |
| `bmw-wheel-speed-sensor-diagnostic-tool` | 9 | 5.22 | Rebuild in place |

**Decision outcomes:** 23 provisional rebuild-in-place candidates; three `INTENT_DECISION_GATE` cases: `bmw-diagnostic-software-windows`, `carly-vs-foxwell-nt530`, `obd-app-vs-handheld-scanner`. The latter may be independent or overlap the existing software/scanner matrix. **Do not redirect them based on title similarity alone.** Obtain current GSC page-to-query evidence and preserve every distinctive source claim, table and SVG before proposing any 301.

## First rebuilding cohorts after this audit

**A. Pricing and entitlements:** BimmerCode/BimmerLink/Carly/ProTool pricing, subscription-free scanner ownership and Launch X-431 product tiers. Build versioned, market-specific evidence and true one-/three-year total costs. Protect existing independent price intent.

**B. Safety- and system-specific diagnostics:** BMW battery registration, EPB service, DSC brake bleeding, diesel DPF, coding injectors, Valvetronic, TPMS, steering angle, VTG, ride height. Verify the installed module, exact manufacturer task, app/VCI eligibility, operator safety and source-specific limitations before writing.

**C. General diagnostic differentiation:** BimmerLink adapter, Windows software setup, used-car inspection, water pump, VANOS, parking/wheel speed and general app-vs-handheld choice. Distinguish truly separate problems from overlapping selection pages. Build usable worksheets, fault trees and compatibility evidence—not word-count padding.

### Per-page acceptance criteria

Each individual decision is in `recovery/data/chassis-wave8a-editorial-decisions.json`; the generated full report includes historical URL/priority/competitor and live Markdown inventory metrics for all 26.

1. A reader task meaningfully different from an existing canonical or another guide.
2. Primary, dated source references for software versions, prices, compatible BMW chassis, systems and claimed functions.
3. A useful task-specific original evidence asset (verified table, fault tree, checklist or controlled worked example) and full preservation of useful SVG research.
4. Technical/safety limitations around high-risk active tests, steering, brakes, programming, battery and diesel service; no unsupported steps.
5. Standard Chassis article presentation (centered prose, TOC, evidence rail, readable mobile SVGs, related articles at end); exact source/canonical and internal link QA.
6. Full affiliate/rights/placement, browser, accessibility and build tests; no paid keyword/SERP calls without approval.
7. Approved explicit 301 and claim/asset ledger **only** if a page genuinely lacks independent search intent.

## Automated independent production checks

Run `node scripts/recovery-chassis-wave8a-live.mjs --strict` to test:

- **64 actual HTTP 301 responses** for 32 old source URLs (slash/no slash), with expected canonical destination and `#original-slug` anchor;
- all **five canonical destination pages** return HTTP 200 with canonical HTML;
- `robots.txt` references the sitemap and sitemap-index.xml plus child sitemaps exclude old URLs and contain the five destinations;
- network issues, 302/308, incorrect fragments, redirect loops, unexpected 200/404/5xx and sitemap leakage are reported as failures, never silently accepted.

The report records checked time, actual status, redirect Location and any failed URL. **Even 64/64 HTTP success does not establish Google has crawled, indexed or ranked the destination.** GSC coverage, query and page exports are required for that.

## Required release checks and data gaps

- `pnpm test`, `pnpm build` and Wave 7 32-URL preservation/sitemap audit remain green.
- Exactly 65 original forensic rows and 26 rebuild rows; exactly 69 original Markdown sources retained with no content changes by 8A.
- The GitHub workflow generates and uploads **a 26-page evidence inventory report** and **a production HTTP status report** as artifacts.
- Next: reconcile GSC page/query/indexing data, complete the three intent gates, then rebuild the first priority cohort.
- Five minor-improvement and two tool-conversion audit items need closure against delivered features; do not automatically mark them finished because hubs exist.

### Wave 8A repository files

- `recovery/data/chassis-forensic-audit-2026-10-04.json` — exact 65 user-provided audit rows.
- `recovery/data/chassis-wave8a-editorial-decisions.json` — all 26 individualized rebuild/intent decisions and source requirements.
- `scripts/recovery-chassis-wave8a-editorial.mjs` — creates machine-checked Markdown and JSON page-by-page audits.
- `scripts/recovery-chassis-wave8a-live.mjs` — checks deployed public URLs, canonical/robots/sitemap and renders failure report.
- `.github/workflows/chassis-wave-8a-audit.yml` — checks content integrity and independently observes production responses.

**Wave 8A is an audit/verification release, not a claim that the 26 articles are already rebuilt or that search visibility has recovered.**
