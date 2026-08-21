# Cloudflare Workers static-assets deployment

This repository builds to a fully static `dist/` directory and deploys through Cloudflare Workers Static Assets. It does not require a Worker script, server runtime or database.

## Production configuration

- Production domain: `https://chassissignal.com`
- Production branch: `main`
- Build command: `pnpm run build`
- Deploy command: `npx wrangler deploy`
- Static asset directory: `./dist`
- Astro output mode: `static`

The root `wrangler.toml` is the only Wrangler configuration. It uses an `[assets]` block and must not contain `pages_build_output_dir` or a fake Worker `main` entry point.

## Local verification

```bash
pnpm install
pnpm run build
npx --no-install wrangler deploy --dry-run
```

The dry-run should report files read from the repository's `dist` directory.

## Platform files

- `wrangler.toml` — Worker name, compatibility date and static-assets directory.
- `public/_headers` — security, indexing and cache headers copied into `dist`.
- `public/_redirects` — static redirect rules copied into `dist`.
- `public/robots.txt` — crawler access and the production sitemap declaration.

Cloudflare may add managed crawler directives or its Web Analytics beacon at the edge. Review those settings in the Cloudflare dashboard when their behavior changes.
