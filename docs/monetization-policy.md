# Chassis Signal monetization policy (SOP)

**Effective 2026-09-25. This is a hard portfolio rule, not a guideline.**

> **EVERY PUBLISHED CHASSIS SIGNAL GUIDE MUST BE MONETIZED.**
> No published guide may render zero affiliate links.

The previous concept of an "intentionally unmonetized published guide" is retired. There is no
allow-list, no exemption set, and no code path by which a published guide skips affiliate
checks. `scripts/affiliate-rollout-audit.mjs` fails the release gate if any published guide
renders zero affiliate links (`PUBLISHED_GUIDE_ZERO_AFFILIATE_LINKS`).

---

## 1. Placement policy

Every published guide carries:

| Placement | Position | Requirement |
| --- | --- | --- |
| **A — TOP** | after ~2–3 short introductory paragraphs | mandatory on every guide |
| **C — MIDDLE** | ~40–65% through the substantive body | mandatory on **long** guides |
| **B — END** | at the last substantive section, before the closing guidance | mandatory on every guide |

### Long-article definition (machine-enforced)

```
LONG  ⇔  word_count >= 1400  ||  h2_count >= 6
```

- Long article → **minimum 3 placements** (top + middle + end)
- Shorter article → **minimum 2 placements** (top + end)
- **3 is the hard cap.** Never exceed it.

The definition lives in exactly one place — `isLongArticle()` / `requiredPlacementsFor()` in
`src/affiliate/placement-plan.ts` — and both the generator and the audit import it.

### Positional rules

- The TOP unit must appear after **at least two** substantive intro paragraphs
  (`FIRST_PLACEMENT_TOO_EARLY`) and no deeper than 35% of the body
  (`FIRST_PLACEMENT_TOO_DEEP`). It should precede the first major content section unless the
  article's structure makes that impossible.
- The END unit must land in the final quarter of the substantive body
  (`MISSING_END_PLACEMENT`). The reader must meet a buying opportunity near the bottom without
  scrolling back up.
- The MIDDLE unit must land in the 30–80% band (`MIDDLE_PLACEMENT_OUT_OF_BAND`) and must not be
  adjacent to the top or end unit (`PLACEMENTS_ADJACENT`).
- Placements are **component- and data-driven**. They attach at real H2 boundaries and never
  rewrite prose. Article text is not edited to make room for a card.

---

## 2. Product selection

Use the **existing verified Chassis Signal registry first**. Never start ad-hoc Amazon
shopping, never invent ASINs or SiteStripe links, never use a rejected ASIN, never paste a raw
Amazon URL into article Markdown.

Selection hierarchy, closest first:

1. exact product
2. exact sibling variant
3. same-brand alternative
4. same product-family alternative
5. functionally related product
6. supporting diagnostic equipment
7. product already recommended in a closely related guide
8. relevant buyer-guide product

### The truth boundary

This policy **never** authorizes false product identity.

- The card must identify what the product **actually is**.
- Never transfer an unsupported claim from one variant to another.
- Example: article subject `Autel MK900`, verified product `MK900-BT` →
  label it **"Wireless MK900-family option — not the base wired MK900"**, never "Autel MK900".
- If only one side of a comparison has a verified listing, monetize that side with a
  single-product card. Do **not** force a two-product comparison card.

### Relationship-type QA

Every mapping carries a `relationshipType` from a fixed taxonomy plus a written rationale
(`src/affiliate/relationship-classification.ts`), audited by `INVALID_RELATIONSHIP_TYPE` and
`MISSING_RELATIONSHIP_RATIONALE`:

`EXACT_PRODUCT` · `EXACT_VARIANT` · `SAME_BRAND_ALTERNATIVE` · `PRODUCT_FAMILY_ALTERNATIVE` ·
`RELATED_DIAGNOSTIC_TOOL` · `SUPPORTING_EQUIPMENT` · `RELATED_BUYER_GUIDE_PRODUCT`

This is what lets us monetize every page **without** pretending every card is the exact product
discussed.

### Images

A product renders only with a local, hash-verified, rights-cleared image. Where no first-party
image can be obtained, a distinct Chassis Signal-owned brand-neutral **category illustration**
renders with status `site_owned` and is labelled as an illustration. Amazon-hosted images are
prohibited.

---

## 3. Disclosure

Every published guide now contains affiliate links, so every published guide renders **exactly
one** article-level affiliate disclosure, immediately before the first affiliate unit. Never
missing, never duplicated (`DISCLOSURE_COUNT`, `DISCLOSURE_ORDER`, `DISCLOSURE_AFTER_UNIT`).
The footer statement is separate and unaffected.

---

## 4. Gate 2 — publication readiness

**A publication package is NOT ready unless all six hold:**

1. at least one verified relevant affiliate product exists for the guide
2. the TOP placement is defined
3. the END placement is defined
4. the MIDDLE placement is defined if the article is long
5. disclosure validation passes
6. the affiliate audit passes

> **A zero-affiliate published guide is an automatic GATE 2 FAIL.**

### Required production order for all future articles

```
ARTICLE RESEARCH
  → PRODUCT MATCHING
  → EXACT OR RELATED VERIFIED PRODUCT
  → TOP PLACEMENT
  → MIDDLE IF LONG
  → END PLACEMENT
  → AFFILIATE QA
  → GATE 2
  → PUBLISH
```

If the exact product does not exist, reuse the strongest verified related product with
truthful relationship labelling. **Do not publish a zero-link commercial guide.**

---

## 5. Commands

```bash
pnpm affiliate:inventory   # regenerate registry + mappings from content and overrides
pnpm affiliate:plan        # regenerate the top/middle/end placement plan
pnpm affiliate:diagnose    # site-wide before/after monetization diagnosis report
pnpm test:affiliate        # inventory + the affiliate rollout test suite
pnpm affiliate:audit       # affiliate audit (draft by default; AFFILIATE_MODE=live for HTML)
pnpm run build:live        # THE RELEASE GATE: fresh live build + full live audit
```

`pnpm run build:live` must exit 0. It is the only sanctioned pre-deploy check.
