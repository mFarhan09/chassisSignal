/**
 * Explicit live-mode production release wrapper.
 *
 * The affiliate engine is fail-closed: `AFFILIATE_MODE` defaults to `draft`, so a
 * plain `pnpm build` (and therefore a plain `wrangler deploy` of ./dist) emits NO
 * Amazon anchors, product units or article disclosures. Production must instead be
 * built with `AFFILIATE_MODE=live`. This wrapper guarantees a production deploy can
 * never ship a stale or draft ./dist:
 *
 *   1. build fresh with AFFILIATE_MODE=live  (reuses `pnpm build` = astro check && astro build)
 *   2. validate that fresh dist            (reuses `pnpm affiliate:audit` in live mode)
 *   3. only with --deploy, deploy that exact freshly-built artifact (`wrangler deploy`)
 *
 * It is portable (pure Node, no shell-specific env syntax, no extra dependency) so
 * the same command works from Windows, macOS and Linux. It does NOT change the
 * default draft/fail-closed behaviour — production activation stays explicit.
 *
 * Usage:
 *   node scripts/release-live.mjs            # fresh live build + live audit (NO deploy)
 *   node scripts/release-live.mjs --deploy   # fresh live build + live audit + wrangler deploy
 */
import { spawnSync } from 'node:child_process';

const deploy = process.argv.includes('--deploy');
const env = { ...process.env, AFFILIATE_MODE: 'live' };
const usePnpm = process.env.npm_execpath?.includes('pnpm') ?? true;
const pm = usePnpm ? 'pnpm' : 'npm';

function run(label, args) {
  console.log(`\n[release-live] ${label}: ${pm} ${args.join(' ')}`);
  const result = spawnSync(pm, args, { stdio: 'inherit', env, shell: process.platform === 'win32' });
  if (result.status !== 0) {
    console.error(`[release-live] FAILED at "${label}" (exit ${result.status ?? 'signal'}). Nothing deployed.`);
    process.exit(result.status ?? 1);
  }
}

run('fresh live build', ['run', 'build']);
run('live affiliate audit', ['run', 'affiliate:audit']);
if (deploy) {
  run('deploy fresh artifact', ['exec', 'wrangler', 'deploy']);
  console.log('\n[release-live] Live build validated and deployed.');
} else {
  console.log('\n[release-live] Live build validated (not deployed). Run with --deploy to publish this exact dist/.');
}
