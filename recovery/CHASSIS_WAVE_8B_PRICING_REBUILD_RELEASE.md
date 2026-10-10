# Chassis Signal Wave 8B — Pricing and Ownership Rebuild (Review Release)

**Date:** 10 October 2026  
**Base:** Wave 8A on `main` (PR #15; `3ba7b6f3f51013f07882ea7d1f0dadaba95c7cf0`)  
**Review branch:** `recovery/chassis-wave-8b-pricing-rebuild`  
**Scope:** Four P1 `SUBSTANTIAL REBUILD` guides. No URL deletion, redirects, affiliate switch or unapproved paid API calls.

## Why these four remain independently necessary

The existing cross-product [software pricing ledger](/tools/bmw-diagnostic-software-price-ledger/) is the comparison and multi-product calculator canonical. It is **not** a replacement for these distinct first-party purchase tasks:

| Rebuilt guide | Historical export impressions (not current GSC) | Independent reader decision | Wave 8B additions |
| --- | ---: | --- | --- |
| `bimmercode-pricing` | 628 | Which supported coding option, platform unlock and adapter will an owner actually need? | Same-platform restoration, platform switch, option/ECU preflight, hardware risks, reproducible one-/three-year cash cost |
| `bimmerlink-pricing` | 208 | Pay for diagnostics, optional CarPlay, and what compatible interface? | Function-vs-entitlement table, optional CarPlay separation, task eligibility, receipt worksheet, one-/three-year scenarios |
| `carly-subscription-cost` | 204 | What does country/merchant/brand coverage imply for renewals and cancellation? | Dated vendor US/UK examples with limitations, year-one/year-three arithmetic, merchant-specific cancellation table |
| `protool-pricing` | 52 | Which Android Diagnostic/Coding/Master license and required interface make sense for an exact task? | Older-chassis coding limits, entitlement/host matrix, five pricing scenarios, discount discrepancy, interface task checks |

Historical impressions are export-period figures from the original 65-row forensic audit, *not* proof of recent demand or organic recovery. The September 2026 visibility drop mechanism remains an evidence-led hypothesis, not known Google internal classification.

## Preservation ledger

All four original Markdown files remain at their **same slugs and canonical guide URLs**. All original h2 research sections, authored SVG/image links (desktop and mobile), tables, screenshots, source links and prior examples are retained. New fact-checked source references, buyer worksheets, dated evidence limits and substantial text were added **in place**, not as thin companion pages. The repaired contextual and frontmatter links no longer promote Wave 7 retired comparison slugs as standalone guides.

There are **69 article source files and 32 audited redirected guide slugs** after this change; no new content URL is created. The modified files are only:

- `src/content/articles/bimmercode-pricing.md`
- `src/content/articles/bimmerlink-pricing.md`
- `src/content/articles/carly-subscription-cost.md`
- `src/content/articles/protool-pricing.md`

Existing preserved diagrams remain original; no new decorative diagram was added solely to raise figure count. Article presentation still uses the existing centered prose/template, with original inline responsive picture sources and related reading.

After the article expansions changed vertical placement positions, the four corresponding entries in `src/affiliate/placement-plan.generated.json` were re-anchored so top/middle/end units remain appropriately distributed. Product keys, unit variants, count and all **other** article placement plans are unchanged. No affiliate links or product registry entries were replaced.

## Source review and evidence boundaries

- BimmerCode: [US App Store](https://apps.apple.com/us/app/bimmercode/id1130787459), [developer FAQ](https://bimmercode.app/faq/), [supported vehicles](https://bimmercode.app/vehicles/), [supported adapters](https://bimmercode.app/adapters/), [quick-start](https://bimmercode.app/manual/).
- BimmerLink: [US App Store](https://apps.apple.com/us/app/bimmerlink/id1065360416), [official developer website](https://bimmerlink.app/).
- Carly: [vendor US example](https://www.mycarly.com/blog/carly/how-much-is-carly/), [UK 2026 vendor example](https://www.mycarly.com/blog/carly/how-much-is-a-carly-subscription-in-the-uk-complete-2026-pricing-guide/), [official cancellation rules](https://support.mycarly.com/hc/en-us/articles/360010441840-How-do-I-cancel-the-renewal-for-my-Carly-license).
- ProTool: [official license and compatibility scope](https://www.bimmergeeks.net/protool), [official Master license page](https://www.bimmergeeks.net/product-page/master-license), and existing individual storefront records.

The US BimmerCode/BimmerLink figures are **dated US iOS listings**; Android and desktop checkouts cannot be inferred from them. Carly vendor-published regional examples are not authenticated personal checkout quotes. The ProTool hardware interface amounts are historical September seller observations, not newly verified stock. The source/price review was conducted without payment, purchasing, vehicle intervention, live GSC access or proprietary SERP API calls. No hands-on vehicle testing is claimed. Search-engine competitor analysis is limited to public-web intent/context review; fresh GSC page-query joins remain unavailable.

## Release checks and QA acceptance

1. `pnpm test` and `pnpm build`.
2. `node scripts/recovery-chassis-wave7-p0-qa.mjs` to protect redirect and migration mappings.
3. `node scripts/recovery-chassis-wave8a-editorial.mjs` to protect the exact 26-entry original forensic cohort.
4. `node scripts/recovery-chassis-wave8b-pricing-qa.mjs` which checks the four named Markdown modifications, >=1600 body words each, original H2 preservation, original media paths, changed prices with limits, non-promoted retired guide links, 69 source records and 32 redirected slugs.
5. Standard affiliate release checks and actual Chromium visual QA on 320/390/768/1440 widths in the existing PR workflow. Do **not** describe these as passed until the PR checks finish successfully.

The affiliate workflow is permitted to review **only these four specific articles** on the named 8B branch, with the script as an additional preservation gate; it still rejects arbitrary other Markdown modifications and changes to affiliate queues or the OBDLink CX registry.

## Editorial backlog after this PR

- Four of 26 forensic `SUBSTANTIAL REBUILD` candidates addressed here.
- **22 remain:** 19 provisional in-place rebuilds and three intent-decision gates (`bmw-diagnostic-software-windows`, `carly-vs-foxwell-nt530`, `obd-app-vs-handheld-scanner`).
- Five original minor-improvement and two tool-conversion rows still require closure.
- Review the four original source files outside the 65-row audit separately.
- Fresh GSC page x query and indexing exports are necessary for post-release measurement.
- Once reviewed and merged, **request indexing of updated canonical guide URLs selectively**, not the existing Wave 7 retired redirect paths.

**Status:** Awaiting human PR approval. No deployment, GSC indexing, Google canonical acceptance or organic-traffic recovery is claimed here.


## Pre-merge editorial spot-check and correction — October 10

In addition to automated production checks, the final review revisited first-party vendor pages and public search-result samples for the four pricing tasks. It established: BimmerCode's free app/adapter/vehicle-option preflight from the official quick-start guide; BimmerLink's two distinct iOS purchase options from its US App Store listing; Carly's BMW/All Brands examples from its US and UK country-specific vendor articles and its website-vs-app-store cancellation rules; and ProTool's actual Diagnostic/Coding/Master catalog prices, Android-only platform, older-chassis coding caveat and hardware-exclusion note from BimmerGeeks. Numbers are restricted to those documented market, product and observation contexts. **No live buyer checkout, independent hands-on validation, full top-N SERP scrape or fresh GSC query join was available**; none is represented as completed.

The extra editorial pass identified a pre-existing duplicate top-level Markdown heading and repeated image caption in the Carly article; these were removed without losing research. It also found that Carly/ProTool affiliate mapping intentionally promotes OBDLink CX **only as a separate supported-app alternative**, not as an adapter for either article's main software. Their lead placements had incorrectly used the "Recommended equipment" visual treatment. They now use a regular product card with the existing explicitly labeled *Alternative BMW app route/interface* relationship, while preserving the approved product, original affiliate image and link, and all 3 placement positions. The new QA gate refuses to present these alternatives as compatible equipment. The two relevant pieces of first-party compatibility evidence are BimmerCode's official supported-adapter list and the Carly/BimmerGeeks product-specific hardware paths.

These are focused quality repairs, not additional topical URLs or modified original 301s. The evidence check supports cautious editorial publication **without implying Google has approved the content or that it is guaranteed to rank**. Source-currency, checkout, and indexing rechecks remain normal maintenance tasks.

Additional affiliate-copy safeguard: the Carly and ProTool approved mapping records now explain that a **verified affiliate offer for each app's own scanner/interface is absent from this portfolio's registry**. That is not a claim that the manufacturer hardware is out of stock or unavailable to consumers. Only those two mapping descriptions/labels were altered; original affiliate keys, links, approvals, product registry and the other 67 mappings remain untouched, with a gate to detect accidental drift.
