# Chassis Signal Recovery Wave 4 — Vehicle and Interface Evidence and Preservation Ledger
Date: October 9, 2026. Branch: `recovery/chassis-wave-4-vehicle-interface`.
Status: publication-ready *only after* all required checks and human release approval.

## Why these resources are separate
Original Chassis audit proposed both a vehicle/interface compatibility lookup and a diagnostic interface map. The lookup serves the job of narrowing an interface category by vehicle generation and operator task; the article explains separate K-line, CAN, Ethernet and authorized workshop architecture. The queries overlap but are not redundant, and one page must not impersonate an exact vehicle compatibility certificate.

## Deliverables
1. `/tools/bmw-vehicle-interface-compatibility/`: native article presentation, filtered evidence table (vehicle generation, task), vehicle-group technical matrix, read-only verification checklist, evidence-qualified scenarios, original desktop/mobile SVGs, primary sources, seven explicit related articles at the end.
2. `/guides/bmw-diagnostic-interface-map/`: full native Chassis Signal guide with article headline, breadcrumb, reading column, TOC, evidence/safety rail, longer technical research, interface comparison and fault-isolation tables, workflow scenarios, two original SVG diagrams with mobile variants, original related research.
3. Article-style regression shared with Waves 2/3; same Chassis article header, center-column reading flow, TOC and evidence rail.
4. Seven related specialist articles updated only with non-destructive contextual links to the two new resources; original content and diagrams untouched.
5. Links from the Compatibility, Coding Adapters and Guides hubs.
6. No older URL redirected or noindexed, zero source media removals, zero paid API calls.

## Preserved source articles
- `bmw-f-series-vs-g-series-obd-adapter`
- `k-dcan-vs-enet-cable`
- `bmw-icom-vs-enet`
- `bmw-icom-vs-k-dcan`
- `bmw-enet-vs-bluetooth-obd`
- `obdlink-ex-vs-enet-cable`
- `bimmerlink-adapter`

Every source keeps its original URL, diagrams, documentation references and evidence distinctions. None is eligible for automatic redirect under this PR. Future consolidation requires a reviewed source-to-destination claim and SVG ledger plus human approval.

## Original visuals
Eight new accessible SVG assets across four technical diagrams and four mobile variants:
- Vehicle lookup: interface-selection.svg, proof-chain.svg; plus mobile versions.
- Interface map: interface-topology.svg, operation-boundaries.svg; plus mobile versions.
- All preexisting site-wide and original guide visuals left unchanged.

## Primary sources and claim boundaries
- BimmerCode supported adapters and specific vehicle selector: https://bimmercode.app/adapters/
- BimmerCode official connection guidance and G-series adapter restriction: https://bimmercode.app/manual/
- BimmerGeeks ProTool double K-line/chassis exceptions: https://www.bimmergeeks.net/faqs
- BimmerGeeks ProTool function/vehicle descriptions: https://www.bimmergeeks.net/protool
- BMW Group authorized AOS/ISTA interface requirements, ICOM and J2534 provisions: https://bmwtechinfo.bmwgroup.com/assets/system_requirements.pdf

Protocol support and a physically successful connection are not proof of a specific app feature, ECU access, safe intervention or programming authorization. Vehicle-specific claims should only be added after first-party model/module/version lookup. No hands-on testing is claimed. The chart does **not** rank sellers or guarantee support for all E/F/G/i/MINI generations.

## QA gate
- Existing affiliate unit tests, Astro typecheck/build, and existing full-site affiliate deterministic/live/visual audit.
- New Wave 4 preservation QA confirms: 2 generated routes; new URLs in XML sitemap; self canonicals; 69 original Markdown files; exactly seven sanctioned backlinks; all 7 original article routes remain; eight new SVGs; required internal links; primary sources; native ArticlePage-like presentation and related section at the end; no 301 changes.
- Browser QA across 390, 768 and 1280 pixel widths: both routes load, visual overflow prevented, TOC exists, related links present and lookup filters/zero-result state work.
- PR stays unmerged until separate user approval and all checks pass.

## Indexing status
Wave 3 manual indexing was not requested on October 9 because Google Search Console daily quota was exceeded. This is a pending manual submission, not a missing sitemap or deployment requirement. After this wave is merged and deployed, request indexing for the two new URLs when quota permits; do not spend manual requests on unchanged specialist articles. Robots/sitemap discovery provides normal crawl paths in the meantime.
