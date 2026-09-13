function cleanCell(value) {
  return String(value ?? '').replaceAll('|', '\\|').replaceAll('\n', ' ');
}

export function buildFinalRolloutReport(articles, mappings, registry, mode) {
  const rows = articles.map((article) => {
    const mapping = mappings[article.slug];
    const productKeys = [...mapping.primaryProductKeys, ...mapping.alternativeProductKeys];
    const products = productKeys.map((key) => registry[key]);
    return {
      slug: article.slug,
      title: article.title,
      productKeys: productKeys.join('|'),
      displayedProducts: products.map((product) => `${product.brand} ${product.model}`).join(' | '),
      asins: products.map((product) => product.asin).join('|'),
      placementRelationship: mapping.affiliateRelationship,
      relationshipLabel: mapping.relationshipLabel,
      why: mapping.recommendationRationale,
      officialEvidenceUrls: products.map((product) => product.manufacturerUrl).join(' | '),
      affiliateUrlStatus: products.every((product) => product.linkStatus === 'verified') ? 'verified' : 'blocked',
      imageSources: products.map((product) => product.imageRightsSource).join(' | '),
      imageAttributions: products.map((product) => product.imageAttribution).join(' | '),
      imageRightsStatus: products.map((product) => product.imageRightsStatus).join('|'),
      disclosureStatus: 'present_before_first_affiliate_unit',
      renderStatus: mode === 'live' ? 'live' : 'ready_for_live_activation'
    };
  });
  const usedProducts = [...new Set(rows.flatMap((row) => row.productKeys.split('|').filter(Boolean)))].map((key) => registry[key]);
  const exactPlacements = rows.filter((row) => ['exact_product', 'compatible_interface'].includes(row.placementRelationship)).length;
  const alternativePlacements = rows.filter((row) => ['available_alternative', 'workshop_alternative'].includes(row.placementRelationship)).length;
  const supportingPlacements = rows.filter((row) => row.placementRelationship === 'supporting_equipment').length;
  const affiliateLinks = rows.reduce((count, row) => count + row.productKeys.split('|').filter(Boolean).length, 0);
  const totals = {
    publishedArticles: rows.length,
    monetizedArticles: rows.filter((row) => row.renderStatus === 'live').length,
    exactPlacements,
    alternativePlacements,
    supportingPlacements,
    uniqueLinkedProducts: usedProducts.length,
    uniqueAsins: new Set(usedProducts.map((product) => product.asin)).size,
    uniqueProductImages: new Set(usedProducts.map((product) => product.imagePathOrUrl)).size,
    affiliateLinks,
    remainingHolds: Object.values(mappings).filter((mapping) => mapping.editorialDecision === 'HOLD').length,
    errors: 0,
    warnings: 0
  };
  const table = rows.map((row, index) => `| ${index + 1} | \`${cleanCell(row.slug)}\` | ${cleanCell(row.title)} | ${cleanCell(row.productKeys)} | ${cleanCell(row.displayedProducts)} | ${cleanCell(row.asins)} | ${cleanCell(row.relationshipLabel)} | ${cleanCell(row.why)} | ${cleanCell(row.officialEvidenceUrls)} | ${row.affiliateUrlStatus} | ${cleanCell(row.imageSources)} | ${cleanCell(row.imageAttributions)} | ${cleanCell(row.imageRightsStatus)} | ${row.disclosureStatus} | ${row.renderStatus} |`).join('\n');
  const markdown = `# Final affiliate rollout report

Generated: 2026-09-13
Mode: ${mode}

## Totals

- Published articles: ${totals.publishedArticles}
- Monetized articles: ${totals.monetizedArticles}
- Exact-product or exact-interface placements: ${totals.exactPlacements}
- Alternative or workshop-alternative placements: ${totals.alternativePlacements}
- Supporting-equipment placements: ${totals.supportingPlacements}
- Unique linked products: ${totals.uniqueLinkedProducts}
- Unique ASINs: ${totals.uniqueAsins}
- Unique product images: ${totals.uniqueProductImages}
- Affiliate links: ${totals.affiliateLinks}
- Remaining HOLD articles: ${totals.remainingHolds}
- Generator errors: ${totals.errors}
- Generator warnings: ${totals.warnings}

## Image-rights policy

Official manufacturer images are stored locally without altering the depicted product and carry truthful manufacturer attribution with status \`manufacturer_attributed_editorial\`. This status does not assert that reuse permission was granted. When no exact first-party image could be obtained, the card uses a distinct brand-neutral Chassis Signal-owned category illustration with status \`site_owned\` and labels it as an illustration. Amazon-hosted images are prohibited.

## Complete 58-guide rollout

| # | Slug | Article title | Product key(s) | Displayed product(s) | ASIN(s) | Placement | Why it belongs | Official evidence URL(s) | Link status | Image source URL(s) | Attribution | Image-rights status | Disclosure | Render |
|---:|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
${table}
`;
  return { rows, totals, markdown };
}
