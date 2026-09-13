import type { ProductRecord } from './types';
import { rolloutProductMetadata } from './product-rollout-metadata.ts';
import { suppliedSiteStripeInventory } from './supplied-sitestripe-inventory.ts';

const rolloutVerifiedAt = '2026-09-12T19:42:08.000Z';
const verified = (record: Partial<ProductRecord>): Partial<ProductRecord> => ({
  linkSource: 'sitestripe',
  linkStatus: 'verified',
  verifiedAt: rolloutVerifiedAt,
  verifiedBy: 'Muhammad Farhan',
  imageVerifiedAt: rolloutVerifiedAt,
  imageReviewedBy: 'Codex (official-source verification)',
  lastProductReviewAt: rolloutVerifiedAt,
  ...record
});

const rolloutOverrides = Object.fromEntries(Object.entries(suppliedSiteStripeInventory).map(([productKey, supplied]) => [
  productKey,
  verified({ ...supplied, ...rolloutProductMetadata[productKey] })
])) as Record<string, Partial<ProductRecord>>;


export const productVerificationOverrides: Record<string, Partial<ProductRecord>> = {
  'obdlink-cx': {
    asin: 'B08NFLL3NT',
    specialLink: 'https://www.amazon.com/OBDLink-Bimmercode-Bluetooth-Adapter-Diagnostic/dp/B08NFLL3NT?crid=566E250D7AQ0&dib=eyJ2IjoiMSJ9.xcM2-TmxqB7vus0dsG3Bv-Fdc20LOh02jK4fdcoL7l8zqKsYoo54oRuImPrq1ANSRvoCSv610xGvceDPlF2f0-fyUeCAobQxnJxViy8z0TXZ99nGt7GTrr1GIUJEoWT3uTNWauoNVoimM4KvaHGXp70LQ05Ecsig8NCcxvUDPK8jphfZb8SlcOBCeRA51L3k.jzOLqhSkrMLxVI4ubHXehKw7ZiPrnvJIv_aUzPa1rZM&dib_tag=se&keywords=OBDLink+CX.&qid=1789209685&sprefix=%2Caps%2C435&sr=8-1&linkCode=ll2&tag=chassissignal-20&linkId=b76b57be049a23a88229433eb8118855&language=en_US&gaOptInStatus=false&optOutTS=1789210215324&ref_=as_li_ss_tl',
    linkSource: 'sitestripe',
    linkStatus: 'verified',
    verifiedAt: '2026-09-12T11:16:39.927Z',
    verifiedBy: 'Muhammad Farhan',
    manufacturerUrl: 'https://www.obdlink.com/products/obdlink-cx/',
    editorialSummary: 'For the BimmerLink setup described here, OBDLink CX is the recommended equipment candidate; verify current vehicle and device compatibility before purchase.',
    compatibilityNotes: 'Confirm the exact BMW or MINI, model year, phone platform and current BimmerLink support before purchase.',
    imageMode: 'manufacturer_source',
    imagePathOrUrl: '/images/products/obdlink-cx-official.jpg',
    imageRightsSource: 'https://www.obdlink.com/wp-content/uploads/2020/11/0-main_image-202403.jpg',
    imageRightsStatus: 'manufacturer_attributed_editorial',
    imageVerifiedAt: '2026-09-12T11:16:39.927Z',
    imageAttribution: 'Product image: OBDLink.',
    imageAlt: 'OBDLink CX Bluetooth diagnostic adapter',
    imageSha256: '71D0D17DD3027118E4F5B3FB35CB79A4F45DC04B50B2FE9607D019D2E2FA04D6',
    imageReviewedBy: 'Muhammad Farhan',
    lastProductReviewAt: '2026-09-12T11:16:39.927Z'
  },
  ...rolloutOverrides
};
