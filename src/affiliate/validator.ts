import { affiliateConfig } from './config.ts';
import type { LinkValidationError, LinkValidationResult, ProductRecord } from './types';

const ASIN_PATTERN = /^[A-Z0-9]{10}$/i;
const PRODUCT_PATH_ASIN_PATTERN = /\/(?:dp|gp\/product)\/([A-Z0-9]{10})(?:[/?]|$)/i;

export function isValidAsin(asin: string | null): boolean {
  return asin === null || ASIN_PATTERN.test(asin);
}

export function validateSpecialLink(
  record: Pick<ProductRecord, 'asin' | 'specialLink' | 'expectedTrackingId' | 'linkSource' | 'linkStatus' | 'verifiedAt' | 'verifiedBy'>,
): LinkValidationResult {
  const errors: LinkValidationError[] = [];
  const exactLink = record.specialLink;

  if (!exactLink) {
    errors.push({ code: 'MISSING_LINK', field: 'specialLink', message: 'An exact full Amazon Special Link is required.' });
    return { valid: false, exactLink: null, destinationDomain: null, errors };
  }

  let url: URL;
  try {
    url = new URL(exactLink);
  } catch {
    errors.push({ code: 'INVALID_URL', field: 'specialLink', message: 'The Special Link is not a valid absolute URL.' });
    return { valid: false, exactLink, destinationDomain: null, errors };
  }

  const hostname = url.hostname.toLowerCase();
  if (url.protocol !== 'https:') {
    errors.push({ code: 'HTTPS_REQUIRED', field: 'specialLink', message: 'The Special Link must use HTTPS.' });
  }
  if (hostname === affiliateConfig.siteDomain || hostname.endsWith(`.${affiliateConfig.siteDomain}`)) {
    errors.push({ code: 'FIRST_PARTY_REDIRECT_FORBIDDEN', field: 'specialLink', message: 'First-party redirects and cloaked destinations are forbidden.' });
  } else if (!(affiliateConfig.permittedAmazonHosts as readonly string[]).includes(hostname)) {
    errors.push({ code: 'HOST_NOT_ALLOWED', field: 'specialLink', message: `Amazon hostname ${hostname || '(empty)'} is not approved.` });
  }

  const tags = url.searchParams.getAll('tag');
  if (tags.length === 0) {
    errors.push({ code: 'MISSING_TAG', field: 'expectedTrackingId', message: `The link must contain tag=${affiliateConfig.expectedTrackingId}.` });
  } else if (tags.length > 1) {
    errors.push({ code: 'DUPLICATE_TAG', field: 'expectedTrackingId', message: 'The link must contain exactly one tracking tag.' });
  }
  if (tags.some((tag) => tag !== affiliateConfig.expectedTrackingId) || record.expectedTrackingId !== affiliateConfig.expectedTrackingId) {
    errors.push({ code: 'WRONG_TAG', field: 'expectedTrackingId', message: `Only ${affiliateConfig.expectedTrackingId} is accepted for Chassis Signal.` });
  }

  if (!isValidAsin(record.asin)) {
    errors.push({ code: 'MALFORMED_ASIN', field: 'asin', message: 'ASIN must contain exactly 10 letters or digits.' });
  }
  const destinationAsin = url.pathname.match(PRODUCT_PATH_ASIN_PATTERN)?.[1];
  if (record.asin && destinationAsin && destinationAsin.toUpperCase() !== record.asin.toUpperCase()) {
    errors.push({ code: 'ASIN_DESTINATION_MISMATCH', field: 'asin', message: 'The registry ASIN does not match the ASIN visible in the approved destination path.' });
  }
  if (!record.linkSource) {
    errors.push({ code: 'MISSING_LINK_SOURCE', field: 'linkSource', message: 'Record whether SiteStripe or Associates Central supplied the link.' });
  }
  if (record.linkStatus !== 'verified') {
    errors.push({ code: 'STATUS_NOT_VERIFIED', field: 'linkStatus', message: 'A human must explicitly mark the record verified.' });
  }
  if (!record.verifiedAt || !record.verifiedBy) {
    errors.push({ code: 'MISSING_HUMAN_VERIFICATION', field: 'verifiedAt', message: 'verifiedAt and verifiedBy are required for a live link.' });
  }

  return { valid: errors.length === 0, exactLink, destinationDomain: hostname || null, errors };
}
