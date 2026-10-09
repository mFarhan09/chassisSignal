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
- Additional vLinker and UniCarScan brand families intentionally withheld from the validated data table until comparable model-level primary evidence is assembled; existing specialist source URLs remain linked rather than falsely labeled unsupported.
- Independent information gain: single decision flow from vehicle to app to operator platform, protocol and task; filterable manufacturer-backed results; human-readable caveats; conservative zero-result behavior; two original SVG diagrams; official documentation and detailed editorial sections.
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

Each remains available at its own source URL. **No redirects authorized yet.** Next review gate must confirm by exact source paragraph, evidence claim and SVG that any proposed target contains its independently valuable information. Those decisions can change if the exact model differs or source URLs have independent search demand.

## Evidence and cautions
- OBDLink manufacturer's matrix: https://support.obdlink.com/support/solutions/articles/43000713351-which-obdlink-adapter-is-right-for-me-
- OBDLink current app list: https://www.obdlink.com/compatible-apps/
- CX: https://www.obdlink.com/products/obdlink-cx/
- MX+: https://www.obdlink.com/products/obdlink-mxp/
- EX: https://www.obdlink.com/products/obdlink-ex/
- Third-party application validation: https://bimmercode.app/adapters/

Manufacturer-confirmed general protocol capability is not equivalent to exact application/chassis/module support. No universal ECU coding safety guarantee or model capability is claimed. The operator must verify vehicle voltage requirements and the exact supported procedure separately.

## Release gates
1. Astro content/typecheck and build.
2. Production route generated for /tools/bmw-obd-adapter-comparison/.
3. Original nine article source files still exist.
4. No /guides/ redirects added or old source pages retired.
5. Original two SVGs compile and are referenced.
6. No affiliate tags or unsupported purchase claims on new route.
7. Filter usability and responsive rendering should be browser-reviewed if CI runner supports Chromium.
8. Merge only after completed automated checks and user approval.

## Future Wave 1.5 (not included in release)
Cross-link specialists to this destination where useful; review vLinker and UniCarScan first-party sources; prepare explicit claim-by-claim preservation ledger and separate redirect approval. No paid data-provider requests without authorization.
