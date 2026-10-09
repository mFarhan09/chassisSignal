# Chassis Signal Wave 2 — BMW Diagnostic Software Recovery and Preservation Ledger

Date: 2026-10-09  
PR target: `main`; release branch: `recovery/chassis-wave-2-software-matrix`.  
State: **human review required; no merge or deployment authorized in this wave implementation**.

## Recovery rationale
The forensic audit found repeated pairwise permutations among BimmerCode, BimmerLink, Carly, ProTool and ISTA. Readers benefit from a common comparison of *tasks*, but particular pairwise articles retain important separate distinctions. This release therefore builds the canonical software decision resource **first**, without destructive changes.

## New destination
`/tools/bmw-diagnostic-software-comparison/`

A detailed matrix with five primary software categories, interactive job and product filters, structured task-by-task comparison, an evidence worksheet, conservative read-only acceptance checklist, licensing discussion, and architecture/safety analysis. The illustrated resource contains two original diagrams, each with desktop and mobile SVG variants. The five products occupy four distinct task families: feature coding, diagnosis, service operations and professional workshop programming.

**Evidence review:** 2026-10-09, manufacturer/application-developer documentation. Product marketing is not independent hands-on testing, and broad platform compatibility does not guarantee control-unit coverage.

## Primary sources
1. BimmerCode official function, option and Expert Mode guidance: https://bimmercode.app/manual/
2. BimmerCode vehicle lookup and coding options: https://bimmercode.app/vehicles/
3. BimmerLink manufacturer function list with conditions: https://bimmerlink.app/
4. Carly verified feature coverage restrictions: https://support.mycarly.com/hc/en-us/articles/360011226299-What-features-does-Carly-support-for-my-car
5. Carly feature and package offering: https://www.mycarly.com/
6. BimmerGeeks ProTool feature, platform, licensing and older chassis restrictions: https://www.bimmergeeks.net/protool
7. BMW Authorized Technical Information/AOS workshop portal: https://bmwtechinfo.bmwgroup.com/tisUI/

**Warning:** ISTA's workshop programming prerequisites are not comparable to simple code reading. We do not recommend unsupported downloads or programming shortcuts. Prices are deliberately not represented as current static facts.

## Ten source comparisons preserved
| Original article | Specific independent reason to retain |
| --- | --- |
| `bimmercode-vs-carly` | Feature-coding product experience and subscription choices |
| `bimmercode-vs-foxwell-nt530` | Smartphone coding vs dedicated diagnostic handheld |
| `bimmercode-vs-protool` | Focused coding vs Android-based coding/diagnostic toolset |
| `bimmerlink-vs-bimmer-tool` | Distinct app platform and service-function differences |
| `bimmerlink-vs-carly` | Diagnostics/service workflows vs multi-brand entitlement |
| `bimmerlink-vs-foxwell-nt530` | Mobile diagnostic app vs handheld scanner |
| `bimmerlink-vs-protool` | Focused owner diagnostics vs broader Android toolset |
| `ista-vs-bimmerlink` | Official workshop test plans vs consumer diagnostic app |
| `protool-vs-carly` | Android entitlement and coding vs subscription multi-brand coverage |
| `protool-vs-ista` | Independent consumer toolset vs authorized workshop system |

All ten original article files remain in place. They link to the new matrix, which links back to all ten. Two existing hubs also link to the matrix. The rest of the existing 69 article sources remain untouched.

**URL disposition:** 0 redirects added, 0 articles deleted, 0 articles noindexed, 0 affiliate mappings altered, 0 external paid SEO requests made. The existing audit's proposed consolidation actions are *not* blanket approval to remove or redirect these pages.

## Build and production gates
- Astro check and build and the existing affiliate test suite.
- Wave 2 source-preservation checks: all ten existing sources retained, link reciprocity, five software categories, four SVGs, two hub routes, canonical, 69 published articles, no new redirects.
- Playwright Chromium responsive/layout/filter behavior at 390, 768 and 1280 pixels, including two conflicting filters and empty state.
- Existing site-wide affiliate release workflow: draft and live audits, visual checks and protected queues/registry; branch-specific allowlist for exactly ten append-only article edits.
- Check the exact final head SHA before release and verify all required checks completed successfully.

## After explicit merge approval
1. Merge to `main` only after green CI.
2. Confirm Cloudflare deployment, live HTTP 200, canonical and sitemap.
3. Request GSC indexing for `https://chassissignal.com/tools/bmw-diagnostic-software-comparison/` after deployment.
4. Only after evidence review, prepare any later **source-by-source** potential redirect proposals with content/diagram conservation ledger, and request new explicit human approval.
5. Continue Wave 3 with BMW scanner capability database and the same original research and QA discipline.
