# Chassis Signal Affiliate Monetization — Final Go-Live Readiness Report

_Date: 2026-09-14 · Local release-candidate preparation only · No push / no merge / no deploy performed_

---

## 1. Executive Summary

The Chassis Signal affiliate monetization system is complete and validated. This
release run performed **no product, article, SEO, image, or affiliate-logic
work**. It did exactly four things:

1. **Reconciled** the validated affiliate + repair history into a single clean
   local release candidate descended from canonical `origin/main`, via a **pure
   fast-forward** (no rewrite, no merge commit, no cherry-pick).
2. **Hardened the production deploy path** so a production deployment always
   builds fresh in live affiliate mode and can never ship a stale/draft `dist/`
   — while keeping the safe draft/fail-closed default unchanged.
3. **Verified** both the draft (fail-closed) and live production build artifacts.
4. Produced this canonical handoff report.

**Final verdict: `READY_FOR_LOCAL_HUMAN_REVIEW`.** Everything is local on
`release/chassis-affiliate-go-live-2026-09-14`. The remaining go-live steps are a
human decision (Section 14).

---

## 2. Git / Canonical Source Resolution

### Observed state (verified by git, not assumed)

A `git fetch --all --prune` at the start of this run showed the upstream had
**moved since the previous run**:

| Ref | Previous run | This run |
|---|---|---|
| `origin/main` | `821346e` ("Run 008 BMW guides", **no** affiliate code) | **`5af5277`** (now contains the full affiliate system) |
| `origin/claude/pensive-hamilton-kkwqwq` | present @ `5af5277` | **deleted upstream** (local ref retained) |
| `origin/feat/affiliate-monetization-system` | — | new, at `209c6e3` (already contained in `origin/main`) |
| `origin/claude/gifted-planck-820xz8` | — | new, at `209c6e3` (already contained in `origin/main`) |

Canonical `origin/main` **fast-forwarded** from `821346e` to `5af5277` along the
same commit chain — every SHA is identical, so **no history was rewritten**;
canonical main simply advanced to absorb the affiliate work. This is favourable:
the reconciliation goal (affiliate history on canonical main) had already largely
happened upstream, cleanly.

### Proven ancestry

```
821346e  feat(guides): integrate four Run 008 Batch C BMW guides   (pre-affiliate canonical main)
   │
   │  10 affiliate commits: 7e236b7 … 0d643f4 … bdc83dd … 5af5277
   ▼
5af5277  chore: trigger live affiliate production rebuild            ← origin/main NOW (canonical)
   │
   │  1 positioning/disclosure repair commit
   ▼
dd077a4  fix(affiliate): surface first recommendation early and enforce disclosures
   │
   │  1 deployment-hardening commit (this run)
   ▼
b8d68dc  fix(release): guarantee live affiliate build for Chassis deployment
   │
   ▼
(this report commit)  ← release/chassis-affiliate-go-live-2026-09-14 HEAD
```

Verified invariants:
- `821346e` **is an ancestor of** `origin/main` (5af5277) — clean forward move.
- affiliate baseline `7e236b7` and activation `bdc83dd` **are present in** `origin/main`.
- `origin/main` (5af5277) **is an ancestor of** `dd077a4`; `dd077a4`'s parent is exactly `5af5277`.
- Release candidate `release/chassis-affiliate-go-live-2026-09-14` was created from
  `origin/main` and **fast-forwarded** to `dd077a4` (`Updating 5af5277..dd077a4`,
  `Fast-forward`), then this run's hardening + docs commits were added on top.

### Branches / commits

| Item | Value |
|---|---|
| origin/main before reconciliation | `821346e` (task-stated) → observed `5af5277` |
| affiliate source branch | `claude/pensive-hamilton-kkwqwq` @ `5af5277` (deleted upstream; local ref intact) |
| positioning/disclosure fix branch | `fix/affiliate-positioning-disclosure-2026-09-14` @ `dd077a4` |
| **release candidate** | `release/chassis-affiliate-go-live-2026-09-14` |
| release: reconciled base | `5af5277` (= canonical origin/main) |
| release: repair commit | `dd077a4` |
| release: deployment-hardening commit | `b8d68dc` |
| Fast-forward reconciliation | **PASS** |

The release branch is safe because it is a strict, non-destructive descendant of
canonical `origin/main`: no reset, rebase, force-push, branch deletion, stash, or
manual reconstruction was used, and its upstream tracking was unset to remove any
accidental push-to-main risk.

**Canonical release candidate contains the complete affiliate history: YES.**

---

## 3. Original Affiliate Monetization System (historical final state)

Verified against the repository (`affiliate:audit`, `test:affiliate`, generated
data):

- **58** monetized guide articles, all with approved, non-HOLD mappings.
- Placement density: **43 articles × 2 placements**, **15 articles × 3 placements**,
  **0 one-placement exceptions** → **131 total placement locations**.
- **20** actionable (mapped + linked) products; **47** products in the registry;
  **22** carry a verified Amazon Special Link.
- Amazon Associates tracking ID: **`chassissignal-20`** (exact tag on every link).
- Affiliate anchors carry `rel="sponsored nofollow noopener"` and `target="_blank"`.
- **22** product images stored locally under `/images/products/`, each SHA-256
  hash-verified with rights/attribution evidence (no Amazon-hosted images).
- OBDLink CX preserved exactly (link, ASIN `B08NFLL3NT`, image SHA-256
  `71D0…04D6`).
- Draft/fail-closed engine with a single intentional **draft pilot**
  (`bimmerlink-pricing` / `obdlink-cx`) that renders a verified link in draft mode.

(See `reports/affiliate/CHASSIS_RELEASE_REPORT.md`,
`reports/affiliate/PLACEMENT_DENSITY_FINAL_REPORT.md`, and
`reports/affiliate/final-affiliate-coverage.csv` for the original rollout detail.)

---

## 4. Positioning / Disclosure Repair (commit `dd077a4`)

**Problem (before):** every planned placement was injected at an H2 section
boundary via `offsetForAnchor(anchorIndex) = h2Offsets[anchorIndex+1]`, so the
first unit — and the disclosure bound to it — landed after one to seven complete
sections (first-anchor distribution `{1:5, 2:23, 3:21, 4:8, 6:1}`, measured
~45–78% down the article body).

**Fix:** `src/affiliate/first-placement.ts` (`resolveFirstPlacementOffset`)
computes an early, structurally-safe insertion offset for the **first unit only**
— just after ~2 genuine top-level prose paragraphs. It skips paragraphs nested in
blockquotes/figures/lists/tables, never splits a block, never lands directly
after a heading, and never later than the original section position; it falls
back to the section boundary when no safe early prose exists.
`src/components/ArticlePage.astro` applies it to the first placement only; the
2nd/3rd placements keep their distributed H2-section positions.

**Result (live build, all 58):** first affiliate unit after **exactly 2 intro
paragraphs on 58/58** articles (body depth 5–30%, median 10%); later placements
remain distributed (unit spread ≥ 25% of the body on every article).

**Disclosures:** the site-level footer statement was already present and
unconditional. The article-level disclosure renders once, immediately before the
first unit; its wording was completed to state all three required points
(affiliate links present, commission earned, no extra cost). See Section 9.

---

## 5. Deployment Activation Root Cause

**Finding (evidence-based):** `AFFILIATE_MODE` is a **build-time** variable read
via `import.meta.env.AFFILIATE_MODE`; its default is `draft`
(`src/affiliate/config.ts`; `docs/affiliate-engine.md`: _"The engine is
intentionally locked to `draft` mode… Production builds emit no Amazon anchors
until… `AFFILIATE_MODE=live` is explicitly supplied at build time"_).

The `deploy` script was `wrangler deploy`, and `wrangler.toml` declares
`[assets] directory = "./dist"`. `wrangler deploy` **uploads whatever `./dist`
already exists and does not build**. Therefore a plain `pnpm build` (draft) followed
by `pnpm deploy` would publish a draft artifact to production: **no Amazon
anchors, no product units, and no per-article disclosures** — only the
unconditional footer "As an Amazon Associate…" line. This is the most likely
explanation for the operator's observation that affiliate cards/disclosures were
missing on the live site. (No speculation beyond this: the exact contents of the
last artifact actually uploaded to Cloudflare cannot be inspected from here.)

This run addresses that failure mode at the build/deploy path (Section 6) without
touching Cloudflare or performing any deployment.

---

## 6. Final Production Build Architecture (commit `b8d68dc`)

| Command | Behaviour |
|---|---|
| `pnpm build` | **Default, unchanged.** `astro check && astro build` → **draft / fail-closed** artifact (no live Amazon anchors except the intentional draft pilot). |
| `pnpm build:live` | **New.** Fresh live build + live audit, **no deploy** — for verifying the exact artifact. |
| `pnpm deploy:live` | **New.** Fresh live build + live audit **then** `wrangler deploy` of that exact freshly-built `dist/`. |
| `pnpm deploy` | **Legacy low-level primitive, unchanged.** `wrangler deploy` of the current `dist/`. Not to be used for go-live (can ship stale/draft dist). |

Both new scripts call `scripts/release-live.mjs`, a small pure-Node wrapper (no
new dependency; Windows/macOS/Linux portable — it uses no shell-specific env
syntax). It sets `AFFILIATE_MODE=live`, runs `pnpm build` then `pnpm
affiliate:audit`, aborting on any non-zero exit, and only runs `wrangler deploy`
when invoked with `--deploy`.

**Why this is fail-safe:**
- The **safe default is unchanged**: `pnpm build`/`pnpm deploy` and the `draft`
  fail-closed engine default are untouched. Live mode is **not** made global.
- Production activation is **explicit** (`deploy:live`).
- The production command **always builds fresh** and validates before deploying,
  so it cannot ship a stale or draft `dist/`.

- Default build mode: **draft (fail-closed)**
- Production live-build command: **`pnpm build:live`**
- Production deploy command: **`pnpm deploy:live`**
- Can the production deploy command accidentally use a stale draft dist: **NO**
  (it rebuilds live and re-audits first). The legacy `pnpm deploy` primitive
  still can and must not be used for go-live.
- `AFFILIATE_MODE=live` guaranteed for the production build: **YES**.

---

## 7. Affiliate Product / Link State (unchanged this run)

- Products: 47 in registry, 22 with verified Special Links, 20 actionable.
- ASINs, Amazon URLs, tracking ID (`chassissignal-20`), product selections, specs,
  compatibility notes, HOLD decisions: **unchanged (0 changes)**.
- Link attributes `rel="sponsored nofollow noopener"` + `target="_blank"`: preserved.
- Verified by `git diff origin/main`: `product-registry.generated.json`,
  `article-mappings.generated.json`, `placement-plan.generated.json`,
  `supplied-sitestripe-inventory.ts`, `product-verification-overrides.ts` → **0 bytes changed**.

---

## 8. Final Placement State

- **58** articles · **43 × 2** · **15 × 3** · **131** total placements (unchanged).
- First placement: **after paragraph 2 on 58/58** (body depth 5–30%, median 10%).
- Later placements remain distributed across the article (unit spread ≥ 25% of body on all 58).
- Live built-HTML audit: per-page unit count == expected on every article
  (2/2 for two-placement, 4/4 for comparison-based three-placement).

---

## 9. Disclosure State

**Site-level (unconditional, footer, every page — unchanged):**

> As an Amazon Associate I earn from qualifying purchases.

**Article-level (compact, immediately before the first unit — wording completed in `dd077a4`):**

> This page contains affiliate links. Chassis Signal may earn a commission from qualifying purchases made through them, at no extra cost to you.

- Article disclosures rendered (live build): **58/58**, exactly **one** per page.
- Disclosure before the first affiliate unit: **58/58**.
- Disclosure before the first Amazon affiliate anchor (`data-affiliate-link`): **58/58**.
- Visibility: rendered in normal flow (no `display:none`/`hidden`/`opacity:0`/offscreen);
  confirmed visually at desktop (1440px) and mobile (390px).

---

## 10. Image State (unchanged this run)

- **22** product images, all local under `public/images/products/`, referenced as
  `/images/products/...`.
- Each has SHA-256 (`imageSha256`), attribution, alt text, reviewer, and an
  allowed rights status (`verified` / `manufacturer_attributed_editorial` /
  `site_owned`). No Amazon-hosted product images.
- OBDLink CX image SHA-256 `71D0…04D6` preserved.
- `public/` diff vs `origin/main`: **0 bytes**. No image bytes, hashes, paths,
  provenance, or alt text were altered.

---

## 11. Validation Results

| Check | Result |
|---|---|
| typecheck (`astro check`) | **PASS** (0 errors/warnings/hints) |
| draft build (`pnpm build`) | **PASS** — fail-closed: 0 live anchors on 57 articles; only the intentional draft pilot `bimmerlink-pricing` renders (2 units / 1 disclosure) |
| live production build (`pnpm build:live`) | **PASS** (fresh live build + live audit, not deployed) |
| affiliate tests (`pnpm test:affiliate`) | **PASS** (16/16) |
| draft affiliate audit (`pnpm affiliate:audit`) | **PASS** (0 errors) |
| live affiliate audit (`AFFILIATE_MODE=live pnpm affiliate:audit`) | **PASS** (58 guides, 0 errors) |
| built-HTML audit (all 58 live pages) | **PASS** — 58/58 first unit after 2 paragraphs; disclosure count == 1; disclosure before first unit and first Amazon anchor; unit counts == expected |
| placement-count / disclosure-order / early-position validation | **PASS** (incl. this project's `DISCLOSURE_COUNT`, `DISCLOSURE_AFTER_UNIT`, `FIRST_PLACEMENT_TOO_DEEP` guards) |
| visual QA (320/390/768/1440) | **VISUAL_QA_ENVIRONMENT_BLOCKED** — see below |
| `git diff --check` | **PASS** (clean) |
| article Markdown diff | **EMPTY** |

**Visual QA note:** the harness ran (pre-installed Chromium, 58 pages × 4
viewports = 232 checks). **All layout/affiliate assertions passed** — units,
links, `allImagesLoaded`, inline-CTA links, exact `rel`, disclosure-before-link,
and no horizontal overflow (including 320px). The only failing gate was
`consoleErrors === 0`, tripped identically on all 232 by
`ERR_CERT_AUTHORITY_INVALID` when the sandbox browser fetched **Google Fonts**
(`fonts.googleapis.com`, imported in the pre-existing `global.css`) through the
agent proxy, whose CA the browser does not trust. This is an environment artifact,
not a site defect; per policy no font/global-CSS change was made to work around it.
- affiliate / layout assertions: **PASS**
- external sandbox certificate: **BLOCKED**

---

## 12. Content / SEO Preservation (explicit zeros, verified vs `origin/main`)

| Item | Changed |
|---|---|
| Article Markdown files (`src/content/articles/`) | **0** (diff = 0 bytes) |
| Article prose / introductions / conclusions | **0** |
| Titles / H1 / H2 / H3 | **0** |
| Meta descriptions | **0** |
| Canonical URLs | **0** |
| Internal links | **0** |
| Slugs | **0** |
| Publication dates | **0** |
| Structured data / schema | **0** |
| Sitemap content / routes | **0** (config unchanged) |
| Robots content | **0** |
| Homepage / navigation / categories | **0** |
| General site CSS / JS | **0** (`src/styles/`, `src/data/` diff = 0 bytes) |
| Analytics | **0** |
| Dependencies (`package.json` deps / `pnpm-lock.yaml`) | **0** (only `scripts` section of package.json changed) |

---

## 13. Deployment-Hardening Changes (new in this run)

| File | Change | Classification |
|---|---|---|
| `scripts/release-live.mjs` | New pure-Node live release wrapper (build → audit → optional deploy) | DEPLOYMENT_LIVE_MODE |
| `package.json` | Added `build:live` and `deploy:live` scripts (no dependency change) | DEPLOYMENT_LIVE_MODE |
| `reports/affiliate/CHASSIS_AFFILIATE_FINAL_GO_LIVE_READINESS_2026-09-14.md` | This canonical report | FINAL_REPORT |

(The positioning/disclosure repair files — `first-placement.ts`,
`ArticlePage.astro`, `config.ts`, `affiliate-rollout-audit.mjs`,
`affiliate-rollout.test.mjs` — arrived via the reconciled repair commit `dd077a4`
and were classified in that prior run: EARLY_FIRST_PLACEMENT /
DISCLOSURE_VISIBILITY / AFFILIATE_VALIDATION.)

---

## 14. Exact Human Go-Live Procedure (run AFTER approval)

From a clean checkout of `release/chassis-affiliate-go-live-2026-09-14`
(Windows/macOS/Linux — all commands are portable):

```
pnpm install
pnpm typecheck
pnpm test:affiliate
pnpm build:live        # fresh AFFILIATE_MODE=live build + live audit; inspect ./dist and `pnpm preview`
# (optional) authenticate Wrangler to the Chassis Cloudflare account: wrangler login / whoami
pnpm deploy:live       # rebuilds fresh in live mode, re-audits, then deploys that exact dist/
```

`pnpm deploy:live` guarantees: a fresh live-mode build succeeds → the live audit
passes → only then the freshly-built `dist/` is deployed. Do **not** use bare
`pnpm deploy` for go-live (it can ship whatever stale/draft `dist/` exists). No
destructive Git operation is part of this procedure.

---

## 15. Rollback Reference (do not perform — reference only)

| Purpose | Commit |
|---|---|
| Pre-affiliate canonical main | `821346e` — "feat(guides): integrate four Run 008 Batch C BMW guides" |
| Current canonical main (pre-repair, contains affiliate system) | `5af5277` — "chore: trigger live affiliate production rebuild" (= `origin/main`) |
| Positioning/disclosure repair | `dd077a4` |
| Release-candidate hardening | `b8d68dc` |
| Release-candidate tip | this report commit on `release/chassis-affiliate-go-live-2026-09-14` |

To abandon the release candidate, simply return to `origin/main` (`5af5277`); no
history rewrite is required because the candidate is a linear descendant.

---

## 16. Remaining Known Observations (reported, NOT modified)

1. **Cloudflare build-source configuration is external.** This run hardens the
   local/CLI deploy path. If production is ever built by a remote system (e.g. a
   Cloudflare Pages/CI build) rather than `pnpm deploy:live`, that system must
   also set `AFFILIATE_MODE=live` at build time. Deployment/Cloudflare settings
   are out of scope and were not inspected or changed remotely.
2. **`src/components/test.txt`** — a stray 24-byte file ("this is the test file,")
   in the components directory. Left untouched.
3. The pre-existing live-audit `DISCLOSURE_ORDER` check uses a loose substring
   (`indexOf('affiliate-disclosure')`); harmless today (the header has no such
   reference). The guards added in `dd077a4` use the precise `class="affiliate-disclosure`
   match. Left as-is.
4. Local `main` is stale at `821346e` (behind `origin/main`); not touched.

None of the above were changed.

---

## 17. Final Verdict

**`READY_FOR_LOCAL_HUMAN_REVIEW`**

The complete, validated affiliate system plus the positioning/disclosure repair
is reconciled onto a canonical-main-descended local release candidate
(`release/chassis-affiliate-go-live-2026-09-14`), the production deploy path now
guarantees a fresh live-mode build, and no push, merge, deployment, or Cloudflare
change was performed.

---

## 18. Production Release Attempt & Blocker (2026-09-14)

A production release (push release branch → fast-forward + push `main` → deploy
→ verify live) was authorized and attempted. **It is `BLOCKED_BEFORE_RELEASE`.**
No remote action was taken: nothing was pushed, `main` was not moved, and nothing
was deployed. The pre-release gates that passed and the gate that blocked:

**Passed (local):**
- Ancestry: `origin/main` (`5af5277`, unchanged) is an ancestor of the release
  candidate; release-only commits are exactly `dd077a4`, `b8d68dc`, `280df0c`
  (+ this run's deploy-doc/report commit). No unexpected commits.
- Diff safety: `git diff --check` clean; article Markdown diff **empty**;
  product/registry/mappings/plan/images/SEO/config all **0 bytes** changed.
- Local validation (re-run): typecheck 0 errors; tests 16/16; `pnpm build:live`
  (fresh live build + live audit) 0 errors; built-HTML audit 58/58 first unit
  after 2 intro paragraphs, exactly one disclosure each, disclosure before first
  unit and first Amazon anchor; placement totals 43×2 + 15×3 = 131.
- Visual QA: layout/affiliate assertions PASS; only the Google-Fonts TLS
  (`ERR_CERT_AUTHORITY_INVALID`) sandbox artifact fails → `VISUAL_QA_ENVIRONMENT_BLOCKED`.

**Blocking gate — production deployment environment (Phase 4):**
1. **No Cloudflare deployment credentials** are present in this environment
   (no `CLOUDFLARE_*` / `CF_*` / `WRANGLER_*` env vars; no wrangler auth on disk).
   The authoritative deploy is manual `wrangler deploy` (see this doc / Section 6),
   which requires authentication that is unavailable here — so `pnpm deploy:live`
   cannot run.
2. **Live-mode cannot be verified for the production build.** `CLOUDFLARE-WORKERS.md`
   documented the production build command as `pnpm run build` — the **draft /
   fail-closed** default. `AFFILIATE_MODE` is a build-time variable and cannot be
   confirmed as `live` for any Cloudflare-side / push-to-`main` build from within
   this repository. Per the release rule, pushing `main` while a remote build
   could publish a **draft** artifact is not permitted → **`BLOCKED_PRODUCTION_BUILD_ENV`**.

**Safety correction made this run (local commit, no deploy):** `CLOUDFLARE-WORKERS.md`
now documents the production build command as `pnpm run build:live` and the deploy
command as `pnpm run deploy:live`, with an explicit warning that bare
`pnpm run build` / `npx wrangler deploy` produce a draft artifact and that a remote
(Cloudflare Workers Builds / Git-integration) production build must set its build
command to `pnpm run build:live` (or `AFFILIATE_MODE=live`). This makes the
*documented* production command safe; the actual Cloudflare-side setting is a
human/dashboard step this environment cannot perform.

**Exact human steps to unblock and complete go-live:**
1. Decide the authoritative production mechanism:
   - **Manual Wrangler:** authenticate Wrangler to the Chassis Cloudflare account
     (`wrangler login`, or set `CLOUDFLARE_API_TOKEN`), then from the release
     branch run `pnpm install && pnpm deploy:live` (fresh live build → live audit
     → deploy of that exact `dist/`).
   - **Cloudflare Git integration (auto-deploy on `main`):** in the Cloudflare
     dashboard set the project **build command to `pnpm run build:live`** (or add
     `AFFILIATE_MODE=live` to the build environment) **before** pushing `main`.
2. Only after (1): push the release branch, fast-forward and push `main`
   (fast-forward only; no force), let the authoritative path deploy, then verify
   the live public site (`https://chassissignal.com`): 58/58 articles rendering
   affiliate units, one visible disclosure each before the first Amazon anchor,
   correct `tag=chassissignal-20`, images resolving, no draft suppression.

**Production release status: `BLOCKED_BEFORE_RELEASE` (`BLOCKED_PRODUCTION_BUILD_ENV` + no deploy credentials).**
Local main untouched (`821346e`); release candidate remains local and ready.
