import { productRegistry } from './registry';
import type { ProductRecord } from './types';

export interface ProductDataProvider {
  readonly name: 'manualRegistry' | 'creatorsApi';
  getProduct(productKey: string): Promise<ProductRecord | null>;
}

export const manualRegistryProvider: ProductDataProvider = {
  name: 'manualRegistry',
  async getProduct(productKey) {
    return productRegistry[productKey] ?? null;
  }
};

export const creatorsApiProvider: ProductDataProvider = {
  name: 'creatorsApi',
  async getProduct() {
    throw new Error('Creators API is disabled in Phase 1. Do not add credentials or API calls yet.');
  }
};
