# Cloudflare Pages deployment

This repository builds to a fully static `dist/` directory and does not require a server runtime or database.

## Git-connected deployment

Use these Cloudflare Pages settings:

- Framework preset: **Astro**
- Production branch: **main**
- Build command: `pnpm build` (or `npm run build`)
- Build output directory: `dist`
- Root directory: `/`
- Node.js version: `22`

Set `SITE_URL` to the final production origin, for example `https://chassisindex.com`. This controls canonical URLs, structured data and the sitemap. Update the absolute sitemap origin in `public/robots.txt` at the same time if the final domain differs from the default Pages subdomain.

## Direct upload

1. Run `pnpm install`.
2. Run `pnpm build`.
3. Authenticate Wrangler with `pnpm wrangler login`.
4. Run `pnpm deploy`.

`wrangler.toml` already points Pages at `./dist`. The deployment script uses the Pages project name `chassis-index`; change that value if the Cloudflare project uses another name.

## Platform files

- `wrangler.toml` — Pages output and compatibility configuration.
- `public/_headers` — security and cache headers copied into the deployment.
- `public/_redirects` — static redirect rules copied into the deployment.
- `.node-version` — build runtime selection.
- `.env.example` — canonical-site and optional analytics variables.

The contact form is deliberately non-delivering until a verified Cloudflare Pages Function, Turnstile and email provider are configured. Do not enable the button without adding abuse protection and updating the privacy policy.
