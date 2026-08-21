import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const productionSite = 'https://chassissignal.com';
const noindexPaths = new Set(['/404.html', '/contact/']);

export default defineConfig({
  site: productionSite,
  output: 'static',
  trailingSlash: 'always',
  integrations: [sitemap({ filter: (page) => !noindexPaths.has(new URL(page).pathname) })]
});
