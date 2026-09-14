/**
 * EARLY first-placement resolver.
 *
 * The distributed placement planner attaches every unit at an H2 section
 * boundary (see `placement-plan.ts`). That is the intended behaviour for the
 * second and third units — they stay naturally distributed through the article —
 * but for the FIRST unit it pushes the recommendation (and the affiliate
 * disclosure that renders immediately before it) far down the page, after one
 * or more complete sections.
 *
 * This helper computes an earlier, structurally-safe insertion offset for the
 * FIRST unit only. It walks the rendered article HTML as a sequence of
 * top-level blocks and returns the character offset just after roughly the
 * second genuine prose paragraph. It never rewrites prose, never splits a
 * block, and never inserts directly after a heading (it always lands after a
 * closing `</p>`), so the later section-boundary placements are untouched.
 *
 * Only TOP-LEVEL `<p>` elements are counted: paragraphs nested inside
 * blockquotes, figures, lists, tables, asides or callouts are skipped whole,
 * never counted and never split. Headings, figures, tables and lists that sit
 * between paragraphs are stepped over without being counted.
 *
 * Returns `null` when no safe early prose boundary exists before `sectionOffset`
 * (for example an article that opens straight into a table or list with no
 * leading prose), in which case the caller keeps the original section-boundary
 * position for the first unit. The returned offset is always `< sectionOffset`,
 * so the first unit only ever moves earlier, never later.
 */

const VOID_TAGS = new Set([
  'img', 'hr', 'br', 'source', 'input', 'meta', 'link', 'col', 'area', 'base', 'wbr', 'embed', 'track',
]);

/** Offset just past the matching `</tag>`, honouring nesting of the same tag. */
function matchingCloseEnd(html: string, tag: string, from: number, limit: number): number {
  const re = new RegExp(`<${tag}(?=[\\s/>])[^>]*>|</${tag}\\s*>`, 'gi');
  re.lastIndex = from;
  let depth = 1;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) && match.index < limit) {
    if (match[0].startsWith('</')) {
      if (--depth === 0) return match.index + match[0].length;
    } else if (!match[0].endsWith('/>')) {
      depth++;
    }
  }
  return -1;
}

export function resolveFirstPlacementOffset(
  html: string,
  sectionOffset: number,
  targetParagraphs = 2,
): number | null {
  const limit = Math.min(sectionOffset, html.length);
  const openTag = /<([a-zA-Z][a-zA-Z0-9]*)(?=[\s/>])[^>]*>/g;
  let cursor = 0;
  let paragraphs = 0;
  let lastParagraphEnd = -1;

  while (cursor < limit) {
    // Step over inter-block whitespace.
    while (cursor < limit && /\s/.test(html[cursor]!)) cursor++;
    if (cursor >= limit) break;

    // Step over HTML comments that may sit between blocks.
    if (html.startsWith('<!--', cursor)) {
      const close = html.indexOf('-->', cursor + 4);
      if (close < 0 || close >= limit) break;
      cursor = close + 3;
      continue;
    }

    if (html[cursor] !== '<') break; // top-level text node — stop before it

    openTag.lastIndex = cursor;
    const match = openTag.exec(html);
    if (!match || match.index !== cursor) break;

    const tag = match[1]!.toLowerCase();
    const afterOpen = cursor + match[0].length;
    let blockEnd: number;
    if (VOID_TAGS.has(tag) || match[0].endsWith('/>')) {
      blockEnd = afterOpen;
    } else {
      blockEnd = matchingCloseEnd(html, tag, afterOpen, limit);
      if (blockEnd < 0) break; // unmatched, or the block crosses the limit — stop safely
    }

    if (tag === 'p') {
      paragraphs++;
      lastParagraphEnd = blockEnd;
      if (paragraphs >= targetParagraphs) return blockEnd;
    }

    cursor = blockEnd;
  }

  // Fewer than the target number of paragraphs were available before the
  // section boundary: fall back to the last genuine paragraph boundary found,
  // or null when there was no leading prose at all.
  return lastParagraphEnd >= 0 ? lastParagraphEnd : null;
}
