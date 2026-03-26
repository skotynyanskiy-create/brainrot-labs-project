import { BASE_PRODUCTS_BY_ID } from './baseProducts';
import { CURATED_CATALOG_VARIANTS } from './catalogDefaults';
import type {
  BaseProductId,
  CartItemRecord,
  CatalogVariantRecord,
} from './types';

export function getBaseProduct(baseProductId: BaseProductId) {
  return BASE_PRODUCTS_BY_ID.get(baseProductId);
}

export function getCatalogVariantsForBaseProduct(baseProductId: BaseProductId): CatalogVariantRecord[] {
  return CURATED_CATALOG_VARIANTS
    .filter((variant) => variant.baseProductId === baseProductId && variant.active)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function resolveCatalogVariantBySelection(
  baseProductId: BaseProductId,
  selectedSize?: string,
  selectedColor?: string,
): CatalogVariantRecord | undefined {
  const variants = getCatalogVariantsForBaseProduct(baseProductId);

  if (baseProductId === 'base-tshirt') {
    return variants.find((variant) => variant.size === selectedSize && variant.colorName === selectedColor)
      ?? variants.find((variant) => variant.size === selectedSize)
      ?? variants[0];
  }

  if (baseProductId === 'base-phonecase') {
    return variants.find((variant) => variant.phoneModel === selectedSize && variant.finish === selectedColor)
      ?? variants.find((variant) => variant.phoneModel === selectedSize)
      ?? variants[0];
  }

  if (baseProductId === 'base-poster') {
    return variants.find((variant) => variant.posterSize === selectedSize)
      ?? variants[0];
  }

  return undefined;
}

export function buildCartItemId(input: Pick<CartItemRecord, 'sourceType' | 'productId' | 'designId' | 'communityDesignId' | 'catalogVariantRef'>) {
  const raw = [
    input.sourceType,
    input.productId,
    input.designId ?? 'no-design',
    input.communityDesignId ?? 'no-community',
    input.catalogVariantRef ?? 'no-variant',
  ].join('|');

  return btoa(raw).replace(/=+$/g, '');
}
