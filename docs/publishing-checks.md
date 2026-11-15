# Publishing checks

## Before drafting

1. Write down the owner, vehicle generation and the exact job the guide will help them do. Compare that job with existing guide, tool and research URLs. If one already answers it, improve that page unless the new task needs a different outcome and different evidence.
2. Identify the resource the reader will gain. Examples include a model-specific compatibility table with source anchors, a decision tree with meaningful branches, or a dated total-cost table that distinguishes fees, requirements and missing prices. Build it from evidence before writing the surrounding copy.
3. Record the sources and what each supports. Distinguish manufacturer claims and owner reports from firsthand observations. Retain settings, dates and raw observations for any testing you claim. Link disputed compatibility and coverage claims to the source that actually supports them.
4. Complete the [affiliate review](monetization-policy.md). Assign `HOLD` when verified buying advice does not belong on the page.

## Before release

1. Build with `pnpm run build:live`. Open the final guide at phone and desktop widths. Give the answer and its limits before a purchase card. Check that the internal links include the most useful existing guide, source, or comparison tool.
2. Run the pinned open-source audit on the built site and save the JSON beside the review.

   ```sh
   npx --yes pseolint@0.9.0 ./dist --strict --format json --output ./pseolint-report.json --no-ai-suggest --no-telemetry-prompt
   ```

3. Inspect near-duplicate, entity-swap and thin-content findings against the rendered answer and its linked evidence. Confirm that each flagged URL is in the sitemap and has the same reader task before deciding whether to merge. For local audit runs, confirm canonical and internal-link findings against the HTTPS sitemap and built document. Record vendor citations in the review even if the tool misses them.
4. Verify the sitemap, canonical, product choice and disclosure in the release build. When a page truly replaces another, check the redirect destination solves the same task.

## After release

Record the deploy date, changed URLs and article-specific changes. Save settled Search Console data for page and query pairs for the release batch and an unchanged comparison group. Compare the same weekdays and note any update that overlaps the window. Check impressions, average position and indexing for individual URLs before expanding the batch.
