import { getPublishedArticles } from '../data/articles';

const escape = (value: string) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

export async function GET({ site }: { site: URL }) {
  const articles = (await getPublishedArticles()).sort((a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf());
  const items = articles.map(({ data }) => `<item><title>${escape(data.title)}</title><link>${new URL(`/research/${data.slug}/`, site)}</link><guid>${new URL(`/research/${data.slug}/`, site)}</guid><description>${escape(data.description)}</description><pubDate>${data.publishedAt.toUTCString()}</pubDate></item>`).join('');
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Chassis Signal</title><link>${site}</link><description>Independent BMW &amp; MINI diagnostic tool research.</description>${items}</channel></rss>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
