# Cloudflare Workers static-assets deployment

This repository builds to a fully static `dist/` directory and deploys through Cloudflare Workers Static Assets. It does not require a Worker script, server runtime or database.

## Production configuration

- Production domain: `https://chassissignal.com`
- Production branch: `main`
- Build command: `pnpm run build:live`
- Deploy command: `pnpm run deploy:live`
- Static asset directory: `./dist`
- Astro output mode: `static`

The root `wrangler.toml` is the only Wrangler configuration. It uses an `[assets]` block and must not contain `pages_build_output_dir` or a fake Worker `main` entry point.

> **Affiliate live-mode is mandatory for production.** `AFFILIATE_MODE` is a
> **build-time** variable that defaults to `draft` (fail-closed): a plain
> `pnpm run build` — and therefore a plain `npx wrangler deploy` of the resulting
> `./dist` — emits **no** Amazon anchors, product units or article disclosures.
> Production must be built with `AFFILIATE_MODE=live`. Use `pnpm run deploy:live`
> (fresh live build → live affiliate audit → `wrangler deploy` of that exact
> `dist/`); it cannot ship a stale or draft artifact. Do **not** use bare
> `pnpm run build` / `npx wrangler deploy` for go-live.
>
> **If production is built by a remote system** (a Cloudflare Workers Builds / Git
> integration that builds on push to `main`), that system's **build command must
> be `pnpm run build:live`** (or its build environment must set
> `AFFILIATE_MODE=live`). This is a Cloudflare-dashboard setting and cannot be
> enforced from this repository. Verify it before relying on a push-to-`main`
> deploy, or production will serve a draft (fail-closed) build.

## Local verification

```bash
pnpm install
pnpm run build:live
npx --no-install wrangler deploy --dry-run
```

The dry-run should report files read from the repository's `dist` directory.
`pnpm run build:live` produces the live-mode `dist/` that `deploy:live` would ship.

## Platform files

- `wrangler.toml` — Worker name, compatibility date and static-assets directory.
- `public/_headers` — security, indexing and cache headers copied into `dist`.
- `public/_redirects` — static redirect rules copied into `dist`.
- `public/robots.txt` — crawler access and the production sitemap declaration.

Cloudflare may add managed crawler directives or its Web Analytics beacon at the edge. Review those settings in the Cloudflare dashboard when their behavior changes.
