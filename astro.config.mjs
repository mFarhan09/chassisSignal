import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: process.env.SITE_URL || 'https://chassis-signal.pages.dev',
  output: 'static',
  trailingSlash: 'always',
  integrations: [sitemap()]
});
