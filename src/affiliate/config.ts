import type { AffiliateMode } from './types';

export const affiliateConfig = Object.freeze({
  marketplace: 'amazon.com' as const,
  siteDomain: 'chassissignal.com',
  expectedTrackingId: 'chassissignal-20',
  mode: 'draft' as AffiliateMode,
  draftPilot: Object.freeze({
    articleSlug: 'bimmerlink-pricing',
    productKey: 'obdlink-cx'
  }),
  permittedAmazonHosts: ['amazon.com', 'www.amazon.com'] as const,
  disclosureText: 'As an Amazon Associate I earn from qualifying purchases.',
  articleDisclosureText: 'This page contains affiliate links. Chassis Signal may earn a commission from qualifying purchases made through them, at no extra cost to you.',
  allowedCtaLabels: [
    'Check availability on Amazon',
    'View the current listing on Amazon'
  ] as const
});

export function resolveAffiliateMode(rawMode?: string): AffiliateMode {
  return rawMode === 'live' || rawMode === 'draft' ? rawMode : affiliateConfig.mode;
}
