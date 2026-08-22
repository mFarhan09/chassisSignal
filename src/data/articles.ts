import { getCollection } from 'astro:content';

const articleSources = import.meta.glob('../content/articles/**/*.{md,mdx}');

export const hasArticleSources = Object.keys(articleSources).length > 0;

export async function getPublishedArticles() {
  if (!hasArticleSources) return [];

  return getCollection('articles', ({ data }) => !data.draft);
}

export function articlePath(article: { data: { section: 'guides' | 'research'; slug: string } }) {
  return `/${article.data.section}/${article.data.slug}/`;
}
