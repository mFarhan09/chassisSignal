import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { existsSync, readdirSync } from 'node:fs';

const articleDirectory = new URL('./content/articles/', import.meta.url);
const hasArticleFiles = existsSync(articleDirectory) && readdirSync(articleDirectory, { recursive: true, withFileTypes: true })
  .some((entry) => entry.isFile() && /\\.mdx?$/.test(entry.name));

const articles = defineCollection({
  loader: hasArticleFiles ? glob({ pattern: '**/*.{md,mdx}', base: './src/content/articles' }) : async () => [],
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    slug: z.string(),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    category: z.string(),
    tags: z.array(z.string()),
    featured: z.boolean().default(false),
    heroImage: z.string().or(image()).optional(),
    heroAlt: z.string(),
    author: z.string().default('Chassis Signal Editorial'),
    readingTime: z.string(),
    safetyLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']),
    evidenceLevel: z.enum(['DOCUMENTED', 'MANUFACTURER CLAIM', 'COMMUNITY REPORTED', 'NEEDS VERIFICATION', 'HANDS-ON VERIFIED']),
    products: z.array(z.string()).default([]),
    chassis: z.array(z.string()).default([]),
    apps: z.array(z.string()).default([]),
    affiliate: z.boolean().default(false),
    draft: z.boolean().default(false)
  })
});

export const collections = { articles };
