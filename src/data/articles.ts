import { getCollection } from 'astro:content';
import {consolidatedRedirects} from './consolidated-redirects.mjs';

const articleSources = import.meta.glob('../content/articles/**/*.{md,mdx}');

export const hasArticleSources = Object.keys(articleSources).length > 0;

export async function getPublishedArticles() {
  if (!hasArticleSources) return [];

  return getCollection('articles', ({ data }) => !data.draft);
}

// Public discovery excludes URLs receiving Cloudflare HTTP 301s.
// Build/affiliate inventories retain originals for preservation and accounting.
export async function getVisibleArticles(){
  return (await getPublishedArticles()).filter(article => !(article.data.slug in consolidatedRedirects));
}

export function articlePath(article: { data: { section: 'guides' | 'research'; slug: string } }) {
  return `/${article.data.section}/${article.data.slug}/`;
}

export function articleCardImage(article: { data: { cardImage?: string; heroImage?: string | { src: string } } }) {
  if (article.data.cardImage) return article.data.cardImage;
  if (typeof article.data.heroImage === 'string') return article.data.heroImage;
  return article.data.heroImage?.src ?? '/images/research-workshop.jpg';
}
