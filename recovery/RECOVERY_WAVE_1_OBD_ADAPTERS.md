# Chassis Signal Recovery — Wave 1: BMW OBD Adapter Comparison Resource

Date: 2026-10-07
Branch: `recovery/obd-adapter-wave-1`
Status: STAGING ONLY — no redirects or production removals authorized yet.

## Objective

Replace the pairwise OBDLink/vLinker/UniCarScan article graph with one maintained, detailed comparison/compatibility resource.

## Planned canonical destination

`/tools/bmw-obd-adapter-comparison/`

This must be a flagship resource, not a thin table.

## Pairwise pages in this wave

- `/guides/obdlink-cx-vs-mx-plus/`
- `/guides/obdlink-mx-plus-vs-lx/`
- `/guides/obdlink-cx-vs-lx/`
- `/guides/obdlink-cx-vs-vlinker-bm-plus/`
- `/guides/obdlink-cx-vs-vlinker-mc-plus/`
- `/guides/obdlink-mx-plus-vs-vlinker-bm-plus/`
- `/guides/vlinker-bm-plus-vs-mc-plus/`
- `/guides/obdlink-cx-vs-unicarscan-ucsi-2100/`

The separate `obdlink-ex-vs-enet-cable` page belongs to the later interface-map wave, not this adapter-product wave.

## Data model

Each adapter should be represented once, with source-dated fields for:

- exact model / variant identity
- manufacturer
- transport type: BLE / classic Bluetooth / USB / Wi-Fi if applicable
- iOS support
- Android support
- Windows support
- BMW app support (BimmerCode / BimmerLink where documented)
- other documented app support
- vehicle / chassis / generation boundaries where the source actually states them
- legislated OBD-II protocol coverage
- manufacturer-specific network claims
- firmware update path
- sleep / idle / battery-management behavior where documented
- authenticity / seller / counterfeit checks where relevant
- documented limitations
- unresolved / unknown fields
- evidence source URL
- evidence checked date

## Required editorial layer

The page must not be only a filterable grid. It must explain:

1. choose the app before the adapter,
2. transport/profile differences,
3. BMW-specific vs mixed-brand garage use,
4. protocol/network coverage boundaries,
5. phone/OS compatibility,
6. firmware and update path,
7. why app support is not the same thing as universal vehicle support,
8. authenticity / exact-model checks,
9. scenarios: BMW-only, mixed-brand, iPhone, Android, Windows, app-first buyer,
10. limitations and unknowns,
11. how to use the comparison without overclaiming capability.

## Decision tools

The flagship should include:
- filterable adapter matrix,
- app → platform → vehicle → adapter decision path,
- mixed-brand garage decision path,
- evidence-status / last-checked indicators,
- unknown/unsupported markers instead of guessed values,
- direct links to primary/manufacturer evidence.

## Material to preserve from the pairwise pages

- CX vs MX+: BMW focus vs broader network/app scope, iOS/BLE and mixed-brand scenarios
- MX+ vs LX: platform and vehicle-network distinction
- CX vs LX: BLE vs classic Bluetooth and host-routing logic
- CX vs BM+: app selector, public-evidence strength, seller/firmware checks
- CX vs MC+: app-first gate sequence and public documentation gaps
- MX+ vs BM+: broad-garage vs BMW-focused decision logic
- BM+ vs MC+: application fit, price-as-snapshot caution
- CX vs UCSI-2100: app support, Bluetooth profile/pairing, series coverage, idle/sleep-current considerations

## Redirect rule

Do not redirect any pairwise URL until:
- the new resource contains its useful unique distinctions,
- primary/source evidence is revalidated,
- the resource is materially more useful than the source set,
- manual review approves source → target mapping,
- build/visual/SEO QA pass,
- internal links point directly to the new resource,
- sitemap treatment is correct,
- server-side 301s are tested.

## Planned redirects after approval

All pairwise pages listed above → `/tools/bmw-obd-adapter-comparison/`

No redirect is authorized by this document alone.
