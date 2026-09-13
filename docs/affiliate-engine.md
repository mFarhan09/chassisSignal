# Chassis Signal affiliate engine — Phase 1

The engine is intentionally locked to `draft` mode. Production builds emit no Amazon anchors until both a product and its article mapping have been human-approved and `AFFILIATE_MODE=live` is explicitly supplied at build time.

## Human link-verification workflow

1. Open `reports/affiliate/link-verification-queue.csv` and work through each unique product once.
2. Sign in to the Amazon.com Associates account that owns tracking ID `chassissignal-20`.
3. Find the exact product and exact variant. Confirm model/suffix, seller context and relevance to the mapped Chassis Signal articles.
4. Use SiteStripe or Associates Central to create the full Special Link. Do not use a shortened link.
5. Paste the exact, unchanged HTTPS Amazon.com link into `exactSpecialLink`; enter the exact 10-character ASIN and `sitestripe` or `associates_central` as the source.
6. Check that the URL contains exactly one `tag=chassissignal-20` and no other tracking tag.
7. Record an ISO timestamp and the human reviewer's name. Mark the registry record `verified` only after the product identity, destination and article relevance all match.
8. Review `article-product-review.csv`; approve only defensible product/article pairs, recording reviewer and timestamp.
9. Review `image-rights-queue.csv`. Leave `imageMode` as `none` unless permission evidence is retained and approved. A normal manufacturer product page is not rights evidence.
10. Import the approved values into the typed JSON registries, rerun `pnpm affiliate:audit` in draft mode, and review all diffs before Phase 2.

The live anchor always retains the exact approved destination. Click measurement uses the existing page analytics without redirects, user identifiers or Amazon subtags.

## Creators API boundary

`creatorsApiProvider` is a deliberately nonfunctional stub. A future implementation must run server-side or at build time, keep credentials out of browser code and Git, send no Amazon Program Content to an LLM, store no image bytes, expire API image URLs and product text within 24 hours, and hide stale content on refresh failure. Price display stays disabled until all Amazon timestamp and disclaimer requirements are implemented.

## Phase 2 prompt (use only after queue approval)

```text
Execute Chassis Signal Affiliate Engine Phase 2 in this repository. First confirm that every intended product row in reports/affiliate/link-verification-queue.csv and every intended mapping in reports/affiliate/article-product-review.csv has explicit human approval. Import only exact, unchanged full Amazon.com Special Links created in SiteStripe or Associates Central with tag=chassissignal-20; do not guess, rewrite, shorten, scrape or generate links or ASINs. Keep unapproved products and mappings non-rendering. Validate image-rights evidence and use image-free cards wherever rights are not verified. Then set AFFILIATE_MODE=live only for local verification, run pnpm test, pnpm typecheck, pnpm build, pnpm affiliate:audit, and visual QA at desktop and 320px mobile widths. Inspect every monetized guide, confirm each disclosure precedes its first affiliate unit, every anchor points directly to the approved Amazon destination with rel="sponsored nofollow noopener", analytics does not redirect or include PII, and generated output contains no unverified link. Stop before commit, push or deployment and report all results and remaining blockers.
```
