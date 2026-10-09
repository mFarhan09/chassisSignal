# Chassis Recovery Wave 3 — Scanner Capability Database, Evidence and Preservation

Date: October 9, 2026. Branch: `recovery/chassis-wave-3-scanner-capabilities`.

## Problem addressed
The original audit identified repeated adjacent scanner-to-scanner comparison searches. Most buyer decisions depend on the exact vehicle, controller, operation, software entitlement and scanner hardware, not a brand-wide 'best' answer. This wave adds a new canonical resource at `/tools/bmw-scanner-capability-database/`.

## Built
- Five evidenced hardware/family entries: Foxwell NT530, Foxwell NT710, Autel MK808S, Autel MK900, Launch X-431 (explicitly labeled family-level).
- Manufacturer and evidence-row filters, functional differences and a supported empty state.
- Substantial editorial discussion, primary source links, a model-by-operation table, an evidence worksheet and read-only evaluation checklist.
- Four original SVGs: two architecture diagrams with desktop and mobile layouts.
- Twelve original related specialist articles, linked from a distinct related-article section at the end and cross-linked back to the new resource.
- Scanner and compatibility hubs link into the resource.
- No affiliate placements, prices, hands-on claims, unverified programming guarantees or automatic SKU-wide vehicle feature assertions.

## Source evidence
- Autel MK808S: https://www.autel.com/mk2/3990.jhtml
- Autel MK900: https://autel.com/mk3/4171.jhtml
- MK900 user manual: https://www.autel.com/u/cms/www/202604/200157383ity.pdf
- Foxwell brand portal and links to NT530/NT710 models: https://www.foxwelldiag.com/
- Launch manufacturer portal for exact X-431 platform verification: https://www.cnlaunch.com/

The Foxwell and Launch rows are conservative: exact feature claims are **pending model-specific confirmation** before any future enhanced matrix with verified BMW modules and software release dates. The Autel descriptions reflect official maker documentation, not hands-on testing on a specific BMW.

## Source preservation
All 69 previously published article files remain. The following twelve are preserved and linked reciprocally:

- foxwell-nt530-vs-nt710
- foxwell-nt710-vs-autel-mk900-bmw
- foxwell-nt710-vs-nt809bt-bmw
- autel-scanner-for-bmw
- launch-x431-vs-autel-for-bmw
- bmw-bidirectional-scan-tool-functions
- bmw-scanner-abs-airbag-codes
- bmw-battery-registration-scanner
- bmw-scanner-for-used-car-inspection
- bmw-scanner-without-subscription
- bmw-brake-bleed-scan-tool
- bmw-code-reader-vs-scan-tool

No existing SVGs or figures are removed or altered. No old URL is redirected or noindexed. Any later redirect demands an evidence/visual preservation map per source and separate approval.

## Release gates
- Existing affiliate tests, Astro check and production build.
- Fail-closed scanner source count (69), exactly twelve sanctioned article edits, reciprocal links, four original SVGs, two hubs, canonical and no redirects.
- Responsive Chromium 390/768/1280 and filters/empty-state/related guides.
- Existing full-site affiliate deterministic and visual workflow.
- Explicit approval before merging this branch into main. After merge, verify live Cloudflare deployment, canonical/sitemap and request indexing for the one new tool URL.

No paid SEO requests were made.
