# Chassis Signal Wave 7 — All 32 audited merger/redirect consolidations

Date: October 10, 2026. Branch: `recovery/chassis-wave-7-p0-actual-301-consolidation`.

## Corrective finding
The October 4 forensic audit had **65 Chassis rows**:
- 19 `REDIRECT AFTER MERGE` (P0 high confidence)
- 13 `MERGE` (mostly P1)
- 26 `SUBSTANTIAL REBUILD`
- 5 `KEEP + MINOR IMPROVEMENT`
- 2 `CONVERT TO DATABASE/TOOL`.

Waves 1–6 added destinations and cross-links, **but did not implement the prescribed 32 source mergers and public 301 redirects**. The old pairwise pages remained reachable, a serious gap given the original page-necessity/query-atomization diagnosis.

## Now implemented on the release branch
**Final scope: 32 original audit MERGE / REDIRECT AFTER MERGE candidates into five flagship destinations.**
- Ten software pair comparisons 301 to `/tools/bmw-diagnostic-software-comparison/#<original-slug>`.
- Nine OBDLink / UniCarScan / vLinker pair comparisons 301 to `/tools/bmw-obd-adapter-comparison/#<original-slug>`.
- Both trailing-slash and no-slash source variants receive exact HTTP 301s in `public/_redirects`. This is 38 added rules, no 302, no chains and no broad wildcard redirect.
- `astro.config.mjs` excludes both variants of all 19 source URLs from the generated XML sitemap; destinations remain in it.
- Home, hubs, and article recommendation cards exclude these 19 old comparison links. Where an older hub's own technical prose referenced a P0 guide, it now links directly to the matching consolidated section anchor.
- `ConsolidatedSoftwareLegacyResearch.astro` and `ConsolidatedAdapterLegacyResearch.astro` contain 19 source-specific evidence summaries and a collapsible gallery of up to two original SVG comparisons per source, including available mobile variants. Their evidence was extracted from the original Markdown, not fabricated from generic product marketing. The original diagrams remain on disk.
- Original raw article files **remain in source control**, unmodified, as an auditable research archive and to avoid unreviewed changes to the site's affiliate/product-approval mapping and historic source rights. Public Cloudflare Workers static asset redirects are evaluated before serving static HTML, so after deployment those source URLs resolve as 301s rather than publicly competing indexable articles. The presence of archival source in the Git repository is not the same as a publicly served 200 article.
- No changes to original affiliate product registry, approved links, queues or image rights.
- Remaining independent pricing, technical service and troubleshooting articles are not redirected in this batch.

## Original 10 software redirects
bimmercode-vs-carly, bimmercode-vs-foxwell-nt530, bimmercode-vs-protool, bimmerlink-vs-bimmer-tool, bimmerlink-vs-carly, bimmerlink-vs-foxwell-nt530, bimmerlink-vs-protool, ista-vs-bimmerlink, protool-vs-carly, protool-vs-ista.

## Original 9 adapter redirects
obdlink-cx-vs-lx, obdlink-cx-vs-mx-plus, obdlink-cx-vs-unicarscan-ucsi-2100, obdlink-cx-vs-vlinker-bm-plus, obdlink-cx-vs-vlinker-mc-plus, obdlink-ex-vs-enet-cable, obdlink-mx-plus-vs-lx, obdlink-mx-plus-vs-vlinker-bm-plus, vlinker-bm-plus-vs-mc-plus.

## Exact validation gates
1. `scripts/recovery-chassis-wave7-p0-qa.mjs` requires the 19 exact audit cases, 38 static rules, both destination URLs in sitemap, all old URLs absent from sitemap, each old slug preserved as an actual evidence section anchor in destination HTML, an original SVG from the source displayed there, old source content unmodified, and no retired guide links promoted by home/hubs.
2. Cloudflare local `wrangler dev --local` test makes **38 HTTP requests** with redirect auto-follow disabled and asserts actual status 301 and exact fragment target. Do not accept a 200, 404, 302, redirect chain, or no fragment.
3. Existing site-wide affiliate deterministic and visual QA must pass on the same branch head before merge.
4. No Google Search Console indexing request is necessary for old 301 sources. After deployment, verify live canonical targets and submit the two targets only if needed and quota permits; ensure server responses really emit 301 after production update.

## What still remains
The other 13 original `MERGE` candidates have now been integrated as source-specific cases with their original diagrams: seven scanner comparison pages into the scanner database, five interface comparison pages into the diagnostic interface map, and the MINI app selection page into the vehicle/interface lookup. The 26 `SUBSTANTIAL REBUILD` candidates still need page-by-page editorial decisions.

## SEO scope and caveats
A correct 301 and consolidation reduce *publicly available overlapping URLs*; they do **not** automatically remove a domain-wide spam classification or guarantee rankings recover. Record baseline and post-deployment GSC query/page/indexation data. Do not mistake retained internal repository source files for retained public indexable pages.

### Developer reference
Cloudflare Workers Static Assets official redirects:
https://developers.cloudflare.com/workers/static-assets/redirects/
It documents `_redirects` support, static 301s, fragments, and that static redirect rules win regardless of an existing matching asset.

## Final audited scope extension
All **32** canonical mappings live in `src/data/consolidated-redirects.mjs`, with **64 exact HTTP 301 rules** plus two existing redirects. After release, 32 redundant public URL variants redirect to anchored case studies; just **37 original guide URLs** remain independently discoverable. The 69 Markdown source files stay in Git for evidence and affiliate rights preservation, but static Cloudflare redirects take precedence over old HTML assets. The additional 13 cases are supported by `ConsolidatedScannerLegacyResearch.astro`, `ConsolidatedInterfaceLegacyResearch.astro`, and `ConsolidatedMiniLegacyResearch.astro`. All five destination pages carry their original source-specific decision summaries and up to two original desktop/mobile diagrams per case.
