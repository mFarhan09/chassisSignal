# Chassis Signal — contextual multi-placement rollout & QA

Draft-only rollout. No live activation, no deploy, no merge to main. AFFILIATE_MODE remains `draft`.

## Baseline

- Baseline SHA: `7e236b78cdc9f514c72251e9d80abaa83870fcc5` (branch `feat/affiliate-monetization-system`)
- Initial article count: 58 published guides
- Initial monetized articles: 58 (0 HOLD)
- Initial product count: 47 registry candidates; 20 actionable (linked) products
- Initial placement count: 58 (exactly one placement per article, appended after article content)
- Initial per-article distribution: 58 × one placement

### Baseline defect found and fixed

The baseline was reported as "audit passed with 0 errors / 10/10 tests." It was not: the
audit failed with **6 `IMAGE_HASH_MISMATCH` errors** and **1 failing test**. Four
`site_owned` category-illustration SVGs had an `imageSha256` in the registry that did not
match the committed file bytes (`autophix-7910p-plus`, `creator-c310-plus`,
`innova-5610-bundle`, `ancel-ds500bt`). The committed SVG bytes were consistent; only the
recorded hashes were wrong. Corrected the four hashes in the source-of-truth
(`src/affiliate/product-rollout-metadata.ts`) to match the actual committed files and
regenerated. No image bytes changed. The other 18 hashed images (including OBDLink CX) were
already correct.

## Final

- Total articles: 58
- Total monetized articles: 58
- ONE_PLACEMENT_SUFFICIENT: 56
- TWO_PLACEMENTS_JUSTIFIED: 2 (`bimmercode-pricing`, `bimmerlink-adapter`)
- THREE_PLACEMENTS_JUSTIFIED: 0
- Final total placement count: 60 (58 primary + 2 secondary)
- Placement count delta: **+2**
- Products used: 20 actionable / 47 registry (27 unused candidates, unchanged from baseline)
- New products introduced: 0 (both new placements reuse `obdlink-mx-plus`, already an approved,
  human-verified actionable product in the two articles' `alternativeProductKeys`)

### Why only two new placements — QUALITY CONTROLS MONETIZATION

Every one of the 58 articles was audited individually (see
`placement-classification-report.md` for the per-article table). A second/third placement was
added only where the article develops a genuinely **distinct reader decision** served by a
**different, already-approved, human-verified, defensibly linkable** product, and only where
that placement passes the zero-commission test ("would we keep it if the link paid nothing?").

- **13 comparison guides** already resolve the comparison decision **and** the final pick in a
  single comparison card — a second card would be repetition.
- **6 exact-product guides** make one exact recommendation.
- **12 app-compatibility guides** deliberately surface the one documented adapter (OBDLink CX);
  the editorial pass intentionally shows only that side.
- **27 recommended/supporting-equipment guides** name one defensible supporting tool.
- Additional products these articles *mention* are overwhelmingly the ones the editorial pass
  **deliberately excluded** because they have no approved listing: Foxwell NT530/NT710, generic
  ENET/K+DCAN cables, and Carly/ANCEL hardware. A second placement there would require inventing
  a link/ASIN, which is forbidden. Data-driven detection (`detectProductKeys`) confirmed no
  article has three distinct, defensible, actionable product decisions.

The two two-placement articles both already carried `obdlink-mx-plus` as an **approved
alternative** in the mapping, but the previous renderer **silently dropped** all
`alternativeProductKeys`. Surfacing them as a restrained compact CTA fixes a real reader-facing
gap while honouring the article's own two-path structure (focused CX vs broader-network MX+).

## QA results

- Product-image QA: 18/18 manufacturer images hash-verified; 4 site-owned SVG hashes corrected; 25 image-free cards. 0 mismatches after fix.
- Link QA: all 20 actionable products pass `validateSpecialLink` (exact `tag=chassissignal-20`, single tag, HTTPS amazon.com host, ASIN matches destination path, human-verified). No links invented; unlinked candidates (Foxwell, Carly, ANCEL, generic cables) correctly remain non-actionable.
- Factual / compatibility QA: no compatibility claims changed. Secondary placements reuse an existing, verified product; contextual copy is article-specific and makes no unsupported superlative or ownership/testing claim. Compatibility remains conditional ("confirm exact vehicle/app/platform").
- Disclosure QA: single affiliate disclosure renders before the first affiliate unit on every monetized page, including before any secondary CTA (enforced by test + live audit `DISCLOSURE_ORDER`).
- Link-attribute QA: every affiliate anchor renders `rel="sponsored nofollow noopener"` `target="_blank"` with product/article/placement/tracking data attributes (existing analytics, no redirect, no PII).
- Visual QA: **VISUAL_QA_ENVIRONMENT_BLOCKED** — see below.
- Queue-preservation: `link-verification-queue.csv` and `image-rights-queue.csv` byte-identical to baseline (0 diff). Entire `reports/` tree regenerates identically.
- OBDLink CX protection: registry entry and image byte-identical to baseline; audit `OBDLINK_CX_CHANGED` / `OBDLINK_CX_HASH_CHANGED` pass.
- Article-Markdown diff vs baseline: **0 lines** — zero prose/frontmatter changes.

### Visual QA — VISUAL_QA_ENVIRONMENT_BLOCKED

The browser (Playwright + Chromium) screenshot sweep could **not** complete in this Claude
Code Web session. The failure is an **environment-specific blocker**, not evidence of a broken
affiliate implementation:

- A single-page probe (Playwright → Chromium → the local live preview) rendered the target
  page and captured a screenshot in **~580 ms**, confirming the render/screenshot mechanism
  itself works and the two-placement page reports the expected **2 affiliate units**.
- The full 58-page × 4-breakpoint sweep stalled in the Claude Code Web Chromium/proxy sandbox
  (localhost traffic being routed through the ambient HTTPS proxy and headless-sandbox startup
  behaviour). This is a cloud-environment quirk unrelated to the site code.
- The visual-QA script itself was improved in cross-environment-valid ways only (breakpoints
  now 320 / 390 / 768 / 1440, image-free inline-CTA support so the restrained text CTA is not
  falsely failed, representative screenshots extended to the two multi-placement pages). No
  environment-specific workarounds (proxy/sandbox flags, debug logging) were committed.

**REQUIRED BEFORE MAIN / LIVE:** rerun `pnpm qa:visual` against a live preview in the normal
local or CI browser-capable environment (`AFFILIATE_MODE=live pnpm build && pnpm preview`, then
`CHROME_PATH=<chrome> QA_BASE_URL=<preview-url> pnpm qa:visual`) and confirm 0 failures across
all four breakpoints before enabling live mode or merging to main.

What was validated **without** a browser (deterministic, and standing in for the visual checks
that could run headless): the live-mode HTML audit parses every one of the 58 built pages and
confirms — on each — a single affiliate disclosure ordered before the first affiliate unit,
`rel="sponsored nofollow noopener"` on every anchor, a present product-card image, no external
Amazon image `src`, and the expected secondary placement on the two two-placement pages. The
responsive CSS uses `minmax(0, 1fr)` grids that stack to one column at `max-width: 640px`
(comparison grid, image card, and inline CTA), so narrow-width overflow is structurally avoided.

### Draft / live gating

- Draft production build: exactly **1** Amazon href (the intentional `bimmerlink-pricing` +
  `obdlink-cx` draft pilot shipped in the baseline). **0** non-pilot Amazon hrefs. The
  multi-placement change did not alter draft output — only `bimmerlink-pricing` renders a unit.
- Controlled live build (local validation only, never committed): all 58 pages render; the two
  two-placement articles render exactly 2 units each (primary card + one compact secondary CTA);
  live audit passes with 0 errors / 0 warnings.

## Verification — PASS / BLOCKED / REQUIRED BEFORE MAIN

### PASS (deterministic, ran clean in this session)

- `pnpm typecheck` (Astro check) → 0 errors, 0 warnings, 0 hints
- `pnpm build` → 74 pages
- `pnpm test:affiliate` → 14/14 tests pass (4 new: classification cap, distinct/approved/linkable, mutation tests, disclosure ordering)
- `pnpm affiliate:inventory` → 58 guides, 20 actionable, 0 HOLD
- `pnpm affiliate:audit` (draft) → 0 errors
- `AFFILIATE_MODE=live pnpm affiliate:audit` (controlled, local only) → 0 errors, 0 warnings
- `pnpm affiliate:placements` → 56 / 2 / 0, +2 placements
- `git diff --check` → clean
- Article-Markdown scope check vs baseline → 0 changed lines
- OBDLink CX protected-field + image byte-preservation → identical
- Queue-preservation (link/image queues) vs baseline → 0 diff

### BLOCKED (environment)

- Full visual QA (`pnpm qa:visual`, Playwright + Chromium screenshot sweep) →
  **VISUAL_QA_ENVIRONMENT_BLOCKED** in Claude Code Web. Single-page probe worked (~580 ms);
  full sweep stalled in the cloud Chromium/proxy sandbox. Render correctness independently
  confirmed by the deterministic live-mode HTML audit.

### REQUIRED BEFORE MAIN / LIVE

- Rerun `pnpm qa:visual` in the normal local/CI browser-capable environment and confirm 0
  failures at 320 / 390 / 768 / 1440 before enabling live mode or merging to main.
- Human SiteStripe re-verification of any link/ASIN and first-party compatibility remain the
  standing gates from `docs/affiliate-engine.md` (unchanged by this pass).

## Outstanding items / honest limitations

- This is **not** independently certified "production ready." First-party compatibility
  re-verification and Amazon SiteStripe link/ASIN verification are, by design, human-gated
  (`docs/affiliate-engine.md`); this pass invented no links, ASINs, images, prices or
  compatibility facts and changed none of the human-verified data.
- Live activation, deploy, and merge to main are intentionally **not** performed.
- 27 registry candidates remain unused/unlinked by editorial decision; that is unchanged.
