# Chassis Signal Recovery — Wave 1 Preservation Ledger and Publication Gate

Date: 2026-10-09
Branch: `recovery/chassis-wave-1-obd-adapters`
Scope: The adapter pairwise-comparison cluster; non-destructive addition of a canonical architecture-level comparison database.

## Baseline
- Production repository initially held 69 Markdown article sources (count from production directory, not the original 65-item forensic export).
- The original forensic attachment dated October 4 contained 65 Chassis Signal rows.
- Original source files and assets are protected. No source has been deleted, redirected, or noindexed by this branch.
- Existing public redirects remain `/home / 301` and `/articles /research/ 301`.

## Destination
- `/tools/bmw-obd-adapter-comparison/`
- Static Astro page with interactive host platform, transport and protocol/coverage filters.
- Four model rows: OBDLink CX, MX+, LX, EX. These have comparable official manufacturer evidence.
- UniCarScan UCSI-2100, vLinker BM+ and vLinker MC+ appear in a clearly separate, **app-developer-listed** evidence table based on the BimmerCode adapter selector and quick-start guide. Their unverified platform, protocol, firmware or non-BimmerCode features are not inferred from the OBDLink manufacturer matrix.
- Independent information gain: single decision flow from vehicle to app to operator platform, protocol and task; filterable manufacturer-backed results; human-readable caveats; conservative zero-result behavior; four original SVG assets (two desktop plus two mobile); official documentation and detailed editorial sections.
- No affiliate units, unsupported pricing, or hands-on claims.

## Source preservation: nine special comparison pages
1. `obdlink-cx-vs-lx` — BLE/Classic and iOS constraint
2. `obdlink-cx-vs-mx-plus` — BMW specialization vs general fleet/protocol breadth
3. `obdlink-cx-vs-unicarscan-ucsi-2100` — separate brand and app-supported model caveats
4. `obdlink-cx-vs-vlinker-bm-plus` — app/vehicle fit
5. `obdlink-cx-vs-vlinker-mc-plus` — alternate app-specific connectivity
6. `obdlink-ex-vs-enet-cable` — USB adapter versus dedicated Ethernet-interface design
7. `obdlink-mx-plus-vs-lx` — platform and protocol distinctions
8. `obdlink-mx-plus-vs-vlinker-bm-plus` — mixed fleet versus BMW-specific functions
9. `vlinker-bm-plus-vs-mc-plus` — firmware/hardware/app distinctions

Each remains available at its own source URL, with a backlink to the new database. The new database links back to all nine, and the coding-adapters and compatibility hubs link to the database. **No redirects authorized yet.** Next review gate must confirm by exact source paragraph, evidence claim and SVG that any proposed target contains its independently valuable information. Those decisions can change if the exact model differs or source URLs have independent search demand.

## Evidence and cautions
- OBDLink manufacturer's matrix: https://support.obdlink.com/support/solutions/articles/43000713351-which-obdlink-adapter-is-right-for-me-
- OBDLink current app list: https://www.obdlink.com/compatible-apps/
- CX: https://www.obdlink.com/products/obdlink-cx/
- MX+: https://www.obdlink.com/products/obdlink-mxp/
- EX: https://www.obdlink.com/products/obdlink-ex/
- Third-party application validation: https://bimmercode.app/adapters/
- BimmerCode official connection guide: https://bimmercode.app/manual/

Manufacturer-confirmed general protocol capability is not equivalent to exact application/chassis/module support. No universal ECU coding safety guarantee or model capability is claimed. The operator must verify vehicle voltage requirements and the exact supported procedure separately.

## Release gates
1. Astro content/typecheck and build.
2. Production route generated for /tools/bmw-obd-adapter-comparison/.
3. Original nine article source files still exist.
4. No /guides/ redirects added or old source pages retired.
5. Original two SVGs compile and are referenced.
6. No affiliate tags or unsupported purchase claims on new route.
7. Filter usability, mobile horizontal overflow and conflicting-filter empty state are covered by Chromium CI across three widths once the runner completes successfully.
8. Run the source-preservation validator, existing affiliate tests, Astro typecheck/build and browser interaction checks.
9. Merge only after all automated checks pass and explicit user approval.

## Future Wave 1.5 (not included in release)
Review any additional protocol/OS first-party claims for vLinker and UniCarScan; prepare exact claim-by-claim source/diagram preservation records and a separate redirect approval. This Wave 1 release keeps all nine original pages and only adds reciprocal navigation. No paid data-provider requests without authorization.
