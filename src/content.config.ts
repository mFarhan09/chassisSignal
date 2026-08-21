import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const articles = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/articles' }),
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
    author: z.string().default('Chassis Index Editorial'),
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
