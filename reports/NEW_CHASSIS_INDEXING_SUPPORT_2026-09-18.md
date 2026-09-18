# New Chassis Indexing Support — 2026-09-18

## Result

**PASS.** CS-081 through CS-087 are technically indexable and correctly represented in production. The seven live canonical URLs return direct HTTP 200 responses, appear in the live XML sitemap, render without horizontal overflow or browser errors, expose unique titles/H1s/slugs, retain valid Article and BreadcrumbList JSON-LD, and have no broken same-site links or assets.

The cohort already had 3–4 meaningful contextual links out per article. It had index/category/related-card discovery but no contextual body links from older articles. Exactly two tightly relevant inbound links were added per new page; no site-wide links, titles, H1s, new articles, new-page body edits, or affiliate placements were changed.

Audit baseline: `7778d14` (`origin/main`)
Production host: `https://chassissignal.com`
Production checks performed: 2026-09-18

## Seven-page production audit

| ID | Canonical production URL | HTTP / index controls / sitemap | Render / uniqueness | Internal graph | Navigation / schema / assets / redirects |
| --- | --- | --- | --- | --- | --- | --- |
| CS-081 | `https://chassissignal.com/guides/icarsoft-bmm-v3-vs-foxwell-nt530/` | PASS — 200; self-canonical; `index, follow`; no X-Robots block; live/local sitemap exact | PASS — mobile/desktop; unique title, H1 and slug | PASS — 3 body links out; 2 contextual links in; not orphaned; no broken links | PASS — Home › Guides › article; Article + BreadcrumbList; 0 broken assets; 0 redirect chains |
| CS-082 | `https://chassissignal.com/guides/bimmerlink-vs-bimmer-tool/` | PASS — 200; self-canonical; `index, follow`; no X-Robots block; live/local sitemap exact | PASS — mobile/desktop; unique title, H1 and slug | PASS — 4 body links out; 2 contextual links in; not orphaned; no broken links | PASS — Home › Guides › article; Article + BreadcrumbList; 0 broken assets; 0 redirect chains |
| CS-083 | `https://chassissignal.com/guides/bmw-dpf-regeneration-scan-tool/` | PASS — 200; self-canonical; `index, follow`; no X-Robots block; live/local sitemap exact | PASS — mobile/desktop; unique title, H1 and slug | PASS — 3 body links out; 2 contextual links in; not orphaned; no broken links | PASS — Home › Guides › article; Article + BreadcrumbList; 0 broken assets; 0 redirect chains |
| CS-084 | `https://chassissignal.com/guides/obdlink-cx-vs-unicarscan-ucsi-2100/` | PASS — 200; self-canonical; `index, follow`; no X-Robots block; live/local sitemap exact | PASS — mobile/desktop; unique title, H1 and slug | PASS — 3 body links out; 2 contextual links in; not orphaned; no broken links | PASS — Home › Guides › article; Article + BreadcrumbList; 0 broken assets; 0 redirect chains |
| CS-085 | `https://chassissignal.com/guides/bmw-vanos-diagnostic-tool/` | PASS — 200; self-canonical; `index, follow`; no X-Robots block; live/local sitemap exact | PASS — mobile/desktop; unique title, H1 and slug | PASS — 3 body links out; 2 contextual links in; not orphaned; no broken links | PASS — Home › Guides › article; Article + BreadcrumbList; 0 broken assets; 0 redirect chains |
| CS-086 | `https://chassissignal.com/guides/bmw-wheel-speed-sensor-diagnostic-tool/` | PASS — 200; self-canonical; `index, follow`; no X-Robots block; live/local sitemap exact | PASS — mobile/desktop; unique title, H1 and slug | PASS — 3 body links out; 2 contextual links in; not orphaned; no broken links | PASS — Home › Guides › article; Article + BreadcrumbList; 0 broken assets; 0 redirect chains |
| CS-087 | `https://chassissignal.com/guides/bmw-parking-sensor-diagnostic-tool/` | PASS — 200; self-canonical; `index, follow`; no X-Robots block; live/local sitemap exact | PASS — mobile/desktop; unique title, H1 and slug | PASS — 3 body links out; 2 contextual links in; not orphaned; no broken links | PASS — Home › Guides › article; Article + BreadcrumbList; 0 broken assets; 0 redirect chains |

Robots is permissive (`User-agent: *`, `Allow: /`) and points to the working sitemap index. The live sitemap index and child sitemap both returned 200. All seven child entries exactly match their self-referencing canonicals.

## Contextual inbound links added

| New page | Existing indexed source page | Descriptive anchor / context |
| --- | --- | --- |
| CS-081 | `/guides/foxwell-nt530-vs-nt710/` | `iCarsoft BMM V3.0 with Foxwell NT530` in the cross-brand handheld decision |
| CS-081 | `/guides/autophix-7910-vs-foxwell-nt530/` | `iCarsoft BMM V3.0 versus Foxwell NT530 comparison` in the Foxwell strengths section |
| CS-082 | `/guides/bimmerlink-vs-carly/` | `BimmerLink versus bimmer-tool guide` for narrower diagnostic/service app selection |
| CS-082 | `/guides/bimmerlink-vs-protool/` | `BimmerLink with bimmer-tool` for Android platform, engine and job fit |
| CS-083 | `/guides/bimmerlink-vs-carly/` | `diesel particulate-filter functions` in BimmerLink capability context |
| CS-083 | `/guides/bimmerlink-vs-protool/` | `DPF regeneration` in the exact service-function qualification section |
| CS-084 | `/guides/bimmerlink-adapter/` | `OBDLink CX with UniCarScan UCSI-2100` in the BLE candidate decision |
| CS-084 | `/guides/bmw-battery-registration-scanner/` | `OBDLink CX versus UniCarScan UCSI-2100 comparison` beside the supported-adapter list |
| CS-085 | `/guides/bmw-bidirectional-scan-tool-functions/` | `BMW VANOS diagnostic-tool guide` in active-test interpretation context |
| CS-085 | `/guides/bmw-diagnostic-software-windows/` | `BMW VANOS diagnostic-tool guide` beside ISTA test-plan scope |
| CS-086 | `/guides/bmw-scanner-abs-airbag-codes/` | `intermittent wheel-speed concern` in the ABS/DSC live-data decision table |
| CS-086 | `/guides/bmw-steering-angle-sensor-calibration-tool/` | `wheel-speed faults` in the DSC symptom triage section |
| CS-087 | `/guides/bmw-bidirectional-scan-tool-functions/` | `BMW parking-sensor diagnostic guide` in output-test interpretation context |
| CS-087 | `/guides/bmw-code-reader-vs-scan-tool/` | `BMW parking-sensor diagnostic guide` in manufacturer-specific module access context |

No repository GSC performance import was available for page-level impression ranking. Selection therefore used the strongest verifiable substitute: older pages already visible/crawled in public search, exact entity/intent overlap, and a natural pre-existing paragraph or decision boundary. No unrelated page was used to satisfy a count.

## Validation evidence

- Live page audit: 7/7 direct 200; 7/7 exact self-canonicals; 7/7 `index, follow`; 0 X-Robots blocks.
- Live and post-build sitemap audit: 7/7 exact canonical URLs present; sitemap endpoints 200.
- Live browser QA at 390 px and 1440 px: 7/7 pages loaded with one H1, non-empty article content, no horizontal overflow, no console errors, and no failed same-site responses. Lazy assets were separately fetched/force-loaded; broken assets: 0.
- Live same-site link audit: broken links 0; redirecting internal links 0.
- Corpus audit: 65 article files; duplicate slugs 0; duplicate H1/title values 0; duplicate SEO titles 0.
- Post-build graph audit: each new page has exactly two contextual inbound source pages; all changed internal routes resolve in `dist`; broken changed links 0.
- Structured data: all seven pages parse as `WebSite`, `Article`, and `BreadcrumbList`; every Article `mainEntityOfPage` equals the canonical; every breadcrumb has three items.
- `pnpm check`: PASS — 57 files, 0 errors, 0 warnings, 0 hints.
- `pnpm build` (draft and controlled live): PASS — 81 pages; sitemap generated.
- `pnpm test:affiliate`: PASS — 16/16 tests.
- `pnpm affiliate:audit` draft: PASS — 0 errors; expected draft-mode warning only.
- `AFFILIATE_MODE=live pnpm affiliate:audit`: PASS — 0 warnings, 0 errors, 0 HOLD.
- `git diff --check`: PASS.

The affiliate suite initially exposed four stale SHA-256 values for unchanged site-owned category SVGs. The authoritative rollout metadata and generated registry were synchronized to the already committed files and existing rights records. No product, ASIN, URL, image, placement, relationship, or affiliate decision changed.

CHASSIS_NEW_COHORT_READY
