# Chassis Signal — affiliate release report

## Source

- Source branch: `feat/affiliate-monetization-system`
- Source SHA: `d9baf44a956f86a0559ad2e1b73dfb5e44c42aae` (release candidate; this report commit advances it)
- Base: `main`

## Monetization status

- 58/58 articles monetized
- Placement distribution: 43 × TWO_PLACEMENTS, 15 × THREE_PLACEMENTS, 0 × ONE_PLACEMENT_EXCEPTION
- 131 placement locations, distributed server-side at H2 section boundaries (early decision → middle → conclusion)
- Existing verified affiliate links, ASINs and product images preserved (nothing invented)

## Release checks

| Check | Result | Where |
| --- | --- | --- |
| Typecheck (astro check) | PASS (0/0/0) | local + GitHub CI |
| Production build | PASS (74 pages) | local + GitHub CI |
| Affiliate tests (`test:affiliate`) | PASS (14 subtests, incl. plan validity + mutation tests) | local + GitHub CI |
| Draft affiliate audit | PASS (0 errors) | local + GitHub CI |
| Controlled-live affiliate audit | PASS (0 errors / 0 warnings) | local + GitHub CI |
| `git diff --check` | PASS (clean) | local |
| Article Markdown preservation vs `7e236b78` | PASS (0 lines changed) | local + GitHub CI |
| OBDLink CX protected data preservation | PASS (registry + image byte-identical) | local + GitHub CI |
| Queue preservation (link/image queues) | PASS (0 diff) | local + GitHub CI |

## Visual QA

- Environment: **GitHub Actions** (browser-capable `ubuntu-latest` runner + Chromium via Playwright), workflow `.github/workflows/affiliate-visual-qa.yml`.
- Result: **PASS** — GitHub CI run [#4 (34779754284)](https://github.com/mFarhan09/chassisSignal/actions/runs/34779754284), job "Visual QA (320/390/768/1440)" conclusion `success` (exit 0 = 0 failures).
- Pages/viewports tested: all 58 guides × 4 viewports (320 mobile, 390 mobile, 768 tablet, 1440 desktop) = 232 checks.
- Per-page assertions (all pages): ≥1 affiliate unit, ≥1 affiliate link, all product-card images loaded with alt text, image-free inline CTAs still carry a link, `rel="sponsored nofollow noopener"` + `target="_blank"` on every anchor, affiliate disclosure ordered before the first unit, no horizontal overflow, no console errors.
- Representative screenshots captured (uploaded as the `affiliate-visual-qa` CI artifact): `bimmercode-pricing`, `bimmerlink-adapter`, `obdlink-cx-vs-mx-plus`, `obd-app-vs-handheld-scanner`, `carly-vs-foxwell-nt530`, and the former-HOLD set.
- Failures: 0.
- Fixes applied to reach green (CI harness only — the QA assertions were never weakened):
  1. Windows-only screenshot path (`pathname.slice(1)`) → `fileURLToPath` so it runs on Linux.
  2. Preview bound to `--host 127.0.0.1` (astro's default `localhost` resolved IPv6-only on the runner, so the health check never connected).
  3. Lazy, below-the-fold affiliate-card images force-loaded (set `loading="eager"` + re-assign `src`) then awaited, so the existing `allImagesLoaded` assertion is validated deterministically in a headless viewport.

## History note

The full Playwright sweep could not run inside the Claude Code Web sandbox (Chromium/proxy limits) — that is why it was moved to GitHub Actions, where it now runs and passes on every push and pull request.

## Final verdict

**READY_FOR_MAIN = YES** — all deterministic checks and the GitHub-CI visual QA are green, article Markdown/SEO is unchanged, and OBDLink CX + queues are preserved.

Note: production deployment (Cloudflare Workers Static Assets via `wrangler deploy`) and live-mode activation (`AFFILIATE_MODE=live` at build/deploy time) are controlled by the Cloudflare account and are the remaining human/provider steps after merge — they are not performed from this environment.
