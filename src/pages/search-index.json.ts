import { getCollection } from 'astro:content';

export async function GET() {
  const articles = await getCollection('articles', ({ data }) => !data.draft);
  const index = articles.map(({ data }) => ({
    title: data.title,
    description: data.description,
    category: data.category,
    evidence: data.evidenceLevel,
    url: `/research/${data.slug}/`,
    search: [data.title, data.description, data.category, ...data.tags, ...data.products, ...data.chassis, ...data.apps].join(' ').toLowerCase()
  }));
  return new Response(JSON.stringify(index), { headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
}
