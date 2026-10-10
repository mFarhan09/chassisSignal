# Chassis Signal Recovery — Wave 8D, Batch 3 (Final 11 Candidates)

**As of:** October 10, 2026  
**Source of truth:** Original October 4 forensic 65-URL audit; Wave 8A 26-candidate editorial scorecard; `main` after PR #17 (merge `b6642412c0550c109a852aba7c37a85f9a485dbc`).  
**Branch:** `recovery/chassis-wave-8d-batch3-final-eleven`  
**Scope:** Eight original REBUILD_IN_PLACE decisions and three original INTENT_DECISION_GATE decisions. No new content slugs, no changed 301s, no deleted archived guide sources, no paid SEO requests.

## Eight independently differentiated specialist article rebuilds

| Existing guide | Unique reader job added or deepened | Date-qualified first-party foundation |
| --- | --- | --- |
| `bimmerlink-adapter` | Exact BMW/MINI + OS + BLE/VCI + BimmerLink feature/adapter selection | BimmerLink developer; OBDLink connection-model and supported-app policies |
| `bmw-electronic-water-pump-diagnostic-tool` | DME pump-command-versus-feedback diagnostic evidence before physical/cooling service | BMW AOS/ISTA platform and approved engine repair instructions |
| `bmw-scanner-for-used-car-inspection` | Evidence-preserving used-car inspection packet, readiness/module completeness, mechanical limitations | EPA inspection/readiness guidance; BMW ISTA/module-level context |
| `bmw-scanner-without-subscription` | Foxwell vs Autel software/brand/renewal entitlement and one-/three-year calculator | Official Foxwell NT530 Plus and updater terms; Autel update/expiry FAQ |
| `bmw-service-reset-tool` | Maintenance-completed CBS item vs cluster reset vs tool plus refusal/safety record | BimmerLink service reset publisher; BMW TIS |
| `bmw-vanos-diagnostic-tool` | DME cam target-versus-actual evidence and hydraulic/mechanical/electrical boundaries | BMW technical information; Autel coverage |
| `bmw-wheel-speed-sensor-diagnostic-tool` | Four-corner DSC data, encoder/bearing/wiring fault pattern and no risky test driving | BMW technical information; Autel vehicle coverage |
| `launch-x431-bmw` | Precisely identified LAUNCH X-431 tiers, connected VCI, BMW function entitlement and three-year cost | LAUNCH Throttle V, Torque Link; BMW AOS interface requirements |

## Three separate intent gates — not falsely marked resolved

1. **`bmw-diagnostic-software-windows`** — original action `INTENT_DECISION_GATE`. Updated with a concrete Windows AOS host, supported edition, storage/VCI/driver/network and security preflight that differs materially from a product-features-only software matrix. **Provisional retain; intent closure pending fresh GSC page-to-query exports**. No unsupported installer/bundle endorsement.
2. **`carly-vs-foxwell-nt530`** — original action `INTENT_DECISION_GATE`. Deepened exact two-platform buyer cost, edition/brand entitlement, phone dependency, three-year cost formula and feature proof. **Provisional retain; no redirect until GSC intent evidence and claim/image migration plan**, because this comparison partially overlaps Carly subscription pricing and scanner capability resources.
3. **`obd-app-vs-handheld-scanner`** — original action `INTENT_DECISION_GATE`. Deepened operational architecture, offline/data-export/user-account dependency, two buyer scenarios and device entitlement decision matrix. **Provisional retain; require actual GSC query-to-page data to decide if this survives beside the scanner/software matrices**.

The three have real content improvements, but their *site-level independent organic search intent* is **not proven** without current GSC page/query joins and fresh SERP comparisons. No claim of 26/26 unconditional editorial closure should be made until those gates are resolved.

## Editorial integrity

- Updated the eleven **existing** URLs in place, retaining all original H2 headings, long-form research, examples, first-party sources and **original desktop/mobile SVG and media paths**. Removed an existing redundant body H1 in BimmerLink adapter.
- Added dated source-led tables, contextual buyer workbooks, manufacturer-vs-exact-vehicle capability limits, cancellation/renewal or maintenance evidence, and high-risk safety stop conditions. Where the first-party page describes a general product feature, never state that a particular BMW ECU has independently passed.
- Preserved the original 32 retired guide files and 64 slash/no-slash HTTP redirect rules. Contextual hyperlinks to retired pages now point to existing canonical comparison pages with preserved `#original-slug` anchors; literal `/images/guides/` media paths remain unchanged.
- The eleven previously approved monetization plans were re-anchored within the new article lengths. Exact product keys, affiliate variants/positions, link inventory, image rights, and every other guide's product mapping and placement remain untouched.
- No new generic boilerplate research pages. Body lengths are approximately **1,700–2,400 substantive words**, retaining previously published content; word counts alone do not establish quality.

## Evidence limitations, explicit as of 2026-10-10

No actual BMW, diagnostic scanner, radio adapter, brake/steering/coolant system or authorized AOS instance was hands-on tested. No current personal regional purchase checkout was placed, no current GSC page-by-query or page-by-day export was available and no paid top-N SERP call was made. Pricing values are buyer-entered scenario variables unless backed by an explicitly date-/market-scoped vendor snapshot. No Google indexing, ranking, recovery or guaranteed technical compatibility is claimed.

Source review used primary first-party references to BMW AOS, BimmerLink and OBDLink, official Foxwell NT530/Plus update/brand terms, Autel update policy, LAUNCH X-431 hardware, EPA inspection resources and Microsoft Windows lifecycle. Source URLs/limitations are embedded beside individual article claims.

## CI and acceptance gates

- `node scripts/recovery-chassis-wave8d-batch3-qa.mjs`: exactly eleven changed article Markdown files; original historical frontmatter/section hierarchy and media; no obsolete direct internal guide links; original external source references retained; all eleven articles at least 1600 content words and two distinct new H2s; product keys/cards/placements unchanged; source count 69 and redirected sources count 32.
- `pnpm test`, `pnpm build`, `pnpm typecheck`, controlled `AFFILIATE_MODE=live` audit and multi-viewport Chromium visual testing.
- `CHASSIS_WAVE8D_BATCH3_REBUILD=1 node scripts/recovery-chassis-wave7-p0-qa.mjs`: exact scoped allowance; no weakening of archived Wave 7 merge-source research rules.
- `node scripts/recovery-chassis-wave8a-editorial.mjs`: preserves original 65 audit entries and all 26 editorial decisions.
- PR remains separate from `main` until reviewed and explicitly approved for merge.

## Recovery status and final site-wide audit

Completed in-place content improvements: four Wave 8B pricing guides, eleven Wave 8C specialist guides, eight Wave 8D specialist guides. **Three Wave 8D intent gates have improved content but remain provisional** and require independent GSC/page-query intent assessment to decide retain vs consolidation. This completes the scheduled two groups of eleven candidate review tasks after Wave 8B, **not** proof of organic recovery.

After Batch 3 is approved/merged, run the final **site-wide** audit: canonical and 301 HTTP responses; live sitemap and indexability; body/media sources and quality; all 65 original audit dispositions including five KEEP + MINOR IMPROVEMENT and two CONVERT TO TOOL/DATABASE cases; affiliate truthfulness, mobile accessibility; and GSC query/page indexing/ranking evidence gaps. Do not automatically label the three gates closed.
