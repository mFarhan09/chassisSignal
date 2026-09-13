import generatedRegistry from './product-registry.generated.json';
import type { ProductRecord } from './types';

export const productRegistry = generatedRegistry as Record<string, ProductRecord>;

export function getProduct(productKey: string): ProductRecord | undefined {
  return productRegistry[productKey];
}
