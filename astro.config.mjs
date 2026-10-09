import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import {retiredGuidePaths} from './src/data/consolidated-redirects.mjs';

const productionSite = 'https://chassissignal.com';
const noindexPaths = new Set(['/404.html', '/contact/']);

export default defineConfig({
  site: productionSite,
  output: 'static',
  trailingSlash: 'always',
  integrations: [sitemap({ filter: (page) => !noindexPaths.has(new URL(page).pathname) && !retiredGuidePaths.has(new URL(page).pathname) })]
});
