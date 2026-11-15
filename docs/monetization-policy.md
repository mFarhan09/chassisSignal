# Chassis Signal affiliate publishing policy

A guide is ready when it answers the reader's question with evidence. Record an affiliate decision for each guide as part of review. Use `HOLD` with a short reason and empty product keys when a purchase would add no value or the exact compatibility or listing cannot be verified. A guide with this decision may be published.

## Approve a product when it helps the reader decide

- Use an existing verified registry entry. Check the exact model, SKU, market, vehicle, software and function against primary documentation and the current listing.
- Name a sibling or alternative for what it is and describe the capability the reader must verify. On an exact-model comparison, show just the verified side if it helps the decision. Withhold purchase cards when the models being compared cannot be sourced.
- Record the product relationship and rationale. A document covering generic scanner functions cannot establish that a product supports a particular vehicle module, live data item or active test.
- Use local image assets with truthful provenance, rights status, attribution and a verified hash. Label site-owned category illustrations. Use the approved SiteStripe destination and tracking tag from the registry.

## Placement and disclosure

Show a product after the editorial section that makes the choice relevant. Each product appears once per guide. An approved comparison can show both products together. The generated placement plan retains candidate section anchors for approved mappings. The renderer selects the earliest relevant appearance of each product.

When links are present, place exactly one article-level disclosure ahead of the first product. Zero-link guides render without that article-level disclosure. Keep sponsored-link attributes and attribution on every published affiliate anchor.

## Build and review

- Add the reviewed decision to `src/affiliate/editorial-mapping-overrides.ts`. For an approved product, add the verified relationship details and any approved registry data.
- Run `pnpm affiliate:inventory` and `pnpm affiliate:plan` when decisions or headings change. Review the generated mappings and candidate anchors.
- Run `pnpm run build:live` for the live-mode HTML and affiliate release checks. The command builds and checks locally.
- Run `pnpm test:affiliate`. The source-inventory count check guards against accidental guide deletion. Update the expected count in the same PR when publishing or retiring a source guide.

See the [publishing checks](publishing-checks.md) for the evidence and overlap review.
