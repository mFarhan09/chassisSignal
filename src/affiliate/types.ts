export type AffiliateMode = 'draft' | 'live';
export type LinkSource = 'sitestripe' | 'associates_central' | 'creators_api';
export type LinkStatus = 'candidate' | 'pending_verification' | 'verified' | 'retired';
export type ImageMode = 'none' | 'original' | 'manufacturer_licensed' | 'manufacturer_source' | 'site_owned' | 'amazon_tool' | 'creators_api';
export type ImageRightsStatus = 'unknown' | 'pending' | 'verified' | 'manufacturer_attributed_editorial' | 'site_owned';
export type AffiliateRelationship = 'exact_product' | 'available_alternative' | 'compatible_interface' | 'supporting_equipment' | 'workshop_alternative';
export type MappingStatus = 'candidate' | 'reviewed' | 'approved' | 'rejected';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type MonetizationMode =
  | 'exact_product'
  | 'comparison'
  | 'recommended_equipment'
  | 'compatible_adapter'
  | 'related_buyer_guide'
  | 'no_defensible_product';

export type AffiliateCardVariant =
  | 'product_card'
  | 'comparison_card'
  | 'recommended_equipment'
  | 'inline_cta';

export interface ProductRecord {
  productKey: string;
  brand: string;
  model: string;
  category: string;
  asin: string | null;
  marketplace: 'amazon.com';
  specialLink: string | null;
  expectedTrackingId: string;
  linkSource: LinkSource | null;
  linkStatus: LinkStatus;
  verifiedAt: string | null;
  verifiedBy: string | null;
  manufacturerUrl: string | null;
  editorialSummary: string;
  compatibilityNotes: string;
  imageMode: ImageMode;
  imagePathOrUrl: string | null;
  imageRightsSource: string | null;
  imageRightsStatus: ImageRightsStatus;
  imageVerifiedAt: string | null;
  imageAttribution: string | null;
  imageAlt: string | null;
  imageSha256: string | null;
  imageReviewedBy: string | null;
  lastProductReviewAt: string | null;
}

export interface ArticleProductMapping {
  editorialDecision: 'APPROVE' | 'CORRECTED' | 'HOLD' | null;
  articleSlug: string;
  articleIntent: string;
  monetizationMode: MonetizationMode;
  primaryProductKeys: string[];
  alternativeProductKeys: string[];
  placementType: AffiliateCardVariant | 'related_buyer_guide' | 'none';
  placementLocation: 'after_evidence_context' | 'inline' | 'end_of_article';
  recommendationRationale: string;
  relatedBuyerGuideSlug: string | null;
  mappingStatus: MappingStatus;
  approvalStatus: ApprovalStatus;
  reviewedAt: string | null;
  affiliateRelationship: AffiliateRelationship;
  relationshipLabel: string;
  /**
   * Per-product overrides for the reader-facing relationship eyebrow and the machine-readable
   * relationship attribute, keyed by productKey.
   *
   * `relationshipLabel` / `affiliateRelationship` above are ARTICLE-level. On a two-product
   * comparison card that is a truth-boundary hazard: one label is rendered above BOTH product
   * names, so a card holding the exact product and a card holding a labelled alternative would
   * claim the same relationship. Where a guide mixes an exact product with an alternative, the
   * per-product entry wins and each card states what THAT product actually is. Products absent
   * from the map fall back to the article-level values, so single-product guides are unchanged.
   */
  productRelationshipLabels: Record<string, string>;
  productRelationships: Record<string, AffiliateRelationship>;
  /** Product-relevance QA taxonomy (see `relationship-classification.ts`). */
  relationshipType: string;
  /** Short QA rationale for the relationship type; not rendered to readers. */
  relationshipRationale: string;
  officialEvidenceUrl: string;
  reviewedBy: string | null;
}

export type LinkValidationErrorCode =
  | 'MISSING_LINK'
  | 'INVALID_URL'
  | 'HTTPS_REQUIRED'
  | 'HOST_NOT_ALLOWED'
  | 'FIRST_PARTY_REDIRECT_FORBIDDEN'
  | 'MISSING_TAG'
  | 'DUPLICATE_TAG'
  | 'WRONG_TAG'
  | 'MALFORMED_ASIN'
  | 'ASIN_DESTINATION_MISMATCH'
  | 'MISSING_LINK_SOURCE'
  | 'MISSING_HUMAN_VERIFICATION'
  | 'STATUS_NOT_VERIFIED';

export interface LinkValidationError {
  code: LinkValidationErrorCode;
  field: keyof ProductRecord | 'url';
  message: string;
}

export interface LinkValidationResult {
  valid: boolean;
  exactLink: string | null;
  destinationDomain: string | null;
  errors: LinkValidationError[];
}
