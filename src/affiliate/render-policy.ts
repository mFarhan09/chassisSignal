import { affiliateConfig } from './config.ts';
import { validateSpecialLink } from './validator.ts';
import type { AffiliateMode, ArticleProductMapping, ProductRecord } from './types';

export interface ProductRenderState {
  visible: boolean;
  clickable: boolean;
  pilot: boolean;
  draftPreview: boolean;
  destination: string | null;
  destinationDomain: string | null;
  showImage: boolean;
}

export function getProductRenderState(
  product: ProductRecord | undefined,
  mapping: ArticleProductMapping | undefined,
  mode: AffiliateMode,
  isDevelopment = false,
): ProductRenderState {
  const hidden = { visible: false, clickable: false, draftPreview: false, pilot: false, destination: null, destinationDomain: null, showImage: false };
  if (!product || product.linkStatus === 'retired' || mapping?.mappingStatus === 'rejected' || mapping?.approvalStatus === 'rejected') return hidden;

  const isDraftPilot = mode === 'draft'
    && mapping?.articleSlug === affiliateConfig.draftPilot.articleSlug
    && product.productKey === affiliateConfig.draftPilot.productKey
    && mapping.primaryProductKeys.length === 1
    && mapping.primaryProductKeys[0] === product.productKey;
  const imageHasEvidence = Boolean(product.imagePathOrUrl && product.imageRightsSource && product.imageVerifiedAt);
  const imagePermissionApproved = product.imageMode !== 'none' && product.imageRightsStatus === 'verified' && imageHasEvidence;
  const manufacturerAttributedEditorial = product.imageMode === 'manufacturer_source' && product.imageRightsStatus === 'manufacturer_attributed_editorial' && imageHasEvidence;
  const siteOwnedIllustration = product.imageMode === 'site_owned' && product.imageRightsStatus === 'site_owned' && imageHasEvidence;
  const imageAllowed = imagePermissionApproved || manufacturerAttributedEditorial || siteOwnedIllustration;
  const link = validateSpecialLink(product);
  const approvedMapping = mapping?.mappingStatus === 'approved' && mapping.approvalStatus === 'approved';
  const clickable = mode === 'live' && approvedMapping && link.valid;

  if (clickable) {
    return { visible: true, clickable: true, draftPreview: false, pilot: false, destination: link.exactLink, destinationDomain: link.destinationDomain, showImage: imageAllowed };
  }
  if (isDraftPilot && link.valid) {
    return { visible: true, clickable: true, draftPreview: false, pilot: true, destination: link.exactLink, destinationDomain: link.destinationDomain, showImage: imageAllowed };
  }
  if (mode === 'draft' && isDevelopment) {
    return { visible: true, clickable: false, draftPreview: true, pilot: false, destination: null, destinationDomain: null, showImage: imageAllowed };
  }
  return hidden;
}

export function mappingHasLiveProducts(mapping: ArticleProductMapping | undefined, products: Record<string, ProductRecord>, mode: AffiliateMode): boolean {
  if (!mapping) return false;
  return mapping.primaryProductKeys.some((key) => getProductRenderState(products[key], mapping, mode, false).clickable);
}
