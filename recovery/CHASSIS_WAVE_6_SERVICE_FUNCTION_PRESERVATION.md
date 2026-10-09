# Chassis Signal Recovery Wave 6 — BMW Service Function Eligibility and Safety Matrix

**Date:** 10 October 2026  
**Branch:** `recovery/chassis-wave-6-service-function-evidence`  
**Release status:** Do not merge without new human instruction and green CI.

## Why Wave 6 is distinct
The initial five delivery waves built OBD adapter, diagnostic software, scanner, interface and diagnostics/pricing reference resources. Wave 6 addresses the remaining *service-operation taxonomy* and preservation gap. Searches for a CBS reset, injector coding, TPMS sensor programming, hydraulic ABS bleed, Valvetronic teach-in and ECU firmware programming imply different actions, hazards and eligibility checks. The new page is a shared **evidence/eligibility matrix**, not 14 shortened competing articles. It has independent necessity as a cross-system reference.

## New destination

`/tools/bmw-service-function-matrix/` — native Chassis Signal article presentation (breadcrumbs/header, metadata, serif reading column, TOC, evidence/safety rail). More than 3,200 words of static editorial copy, excluding the fourteen dynamically rendered task cards. It provides:

- Fourteen job records with precise operation family and editorial safety classifications.
- Interactive operation-family and risk filters, documented empty state, accessible summary count.
- Research distinguishing read-only diagnosis, maintenance record reset, battery registration, injector coding, teach-in, calibration, active/brake service and authorized ECU programming.
- Evidence-qualification and buyer-eligibility tables, eight-step conservative handoff/checklist, five independent scenarios and FAQs.
- Clear related-article section **at the end** linking the 14 original guides, plus contextual links to earlier recovery resources and official primary sources.
- **Four original SVGs** (two distinct diagrams with desktop/mobile variants) at `/images/tools/bmw-service-function-matrix/`.

## Primary sources — scope and limits

1. BMW Group AOS/ISTA technical guide: https://bmwtechinfo.bmwgroup.com/assets/system_requirements.pdf
    - Documents ISTA diagnosis/test plans, BMW workshop interface and power conditions, and programming versus ordinary fault reading.
    - Document version reflects BMW's published guide; specific current vehicle/software eligibility still requires official manufacturer validation.
2. Autel MaxiCOM MK900-TS user manual: https://www.autel.com/u/cms/www/202405/210403469jvo.pdf
    - Defines manufacturer Active Test and Special Functions categories and explicitly states commands and procedure availability vary by vehicle.
3. Autel MK900 manufacturer comparison: https://www.autel.com/mk2/4171.jhtml
    - Distinguishes base MK900 TPMS diagnostic capability from MK900-TS added sensor activation/programming functions; **do not extrapolate SKU claims**.
4. BimmerLink developer: https://bimmerlink.app/
    - Documents some eligible BMW diagnostic/service capabilities; functions are not universal for all model years or installed equipment.
5. BimmerCode manual: https://bimmercode.app/manual/
    - Coding scope and expert-mode warnings, not a promise of general ECU programming.

These are manufacturer/designer statements. No hardware was installed, vehicle was scanned, active function was operated or high-risk operation was performed during this research. The matrix never certifies exact-model support simply from a retailer category.

## Existing research preservation
The following **14** existing pages remain independent, published and explicitly linked in both directions:

- `bmw-service-reset-tool`
- `bmw-battery-registration-scanner`
- `bmw-injector-coding-tool`
- `ista-valvetronic-relearn`
- `bmw-transfer-case-adaptation-reset-tool`
- `bmw-electric-parking-brake-service-mode-scanner`
- `bmw-brake-bleed-scan-tool`
- `bmw-steering-angle-sensor-calibration-tool`
- `bmw-tpms-diagnostic-tool`
- `bmw-dpf-regeneration-scan-tool`
- `bmw-electronic-water-pump-diagnostic-tool`
- `bmw-ride-height-calibration-scan-tool`
- `bmw-bidirectional-scan-tool-functions`
- `bmw-coding-vs-programming`

The two shorter guides `bmw-service-reset-tool` and `bmw-coding-vs-programming` also receive substantial append-only eligibility comparisons/tables with documented source references. All original source text and all referenced diagrams are preserved verbatim before new content. No `301`, no `410`, no `noindex`, no affiliate link insertions and no source files deleted.

## Navigation
The main Guides, Scanners, Battery & Service and Research hubs link to the Wave 6 resource. Its content links to the existing BMW scanner capability, troubleshooting, pricing and coding distinctions where relevant. No other new URL variants were created.

## Automation and QA
- `scripts/recovery-chassis-wave6-qa.mjs`: 3,200-word minimum, native article presentation, original source files and 14 approved append-only source edits, original SVG refs, 4 new SVGs, primary sources, 14 reciprocal links and output routes, generated sitemap inclusion, self canonical, zero unauthorized redirects or affiliate units, required hubs, related section at end.
- `scripts/recovery-chassis-wave6-browser.mjs`: Chromium at 390/768/1280 px; no full-page overflow, original SVG delivery, TOC, 14 task rows and related articles, operation/risk filters and contradictory empty-state handling.
- Existing release workflow with deterministic affiliate and full-site visual QA remains required.

## Publication and indexing
The Wave 6 PR is a **draft** and must not be merged without separate approval. After merge, verify successful Cloudflare deployment, live HTTP 200, canonical and sitemap. Request indexing of the **new URL only** when GSC quota allows. Older originals stay accessible by their existing permalinks; a backlink addition is not a reason to use manual indexing quota for all fourteen.

No paid SEO API requests were made in Wave 6.
