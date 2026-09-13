import generatedMappings from './article-mappings.generated.json';
import type { ArticleProductMapping } from './types';

export const articleProductMappings = generatedMappings as Record<string, ArticleProductMapping>;

export function getArticleProductMapping(slug: string): ArticleProductMapping | undefined {
  return articleProductMappings[slug];
}
