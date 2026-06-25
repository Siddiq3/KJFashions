const cleanList = (value) => (Array.isArray(value) ? value.filter(Boolean) : []);
const normalizeStockCount = (value) => {
  if (value === '' || value === null || typeof value === 'undefined') return undefined;
  const stockCount = Number(value);
  return Number.isFinite(stockCount) ? Math.max(0, stockCount) : undefined;
};

export const getProductVariants = (product) => {
  const variants = cleanList(product?.variants)
    .map((variant, index) => ({
      id: variant.id || `variant-${index + 1}`,
      color: String(variant.color || '').trim(),
      images: cleanList(variant.images),
      sizes: cleanList(variant.sizes),
      stockCount: normalizeStockCount(variant.stockCount),
    }))
    .filter((variant) => variant.color || variant.images.length > 0);

  if (variants.length > 0) return variants;

  return [{
    id: 'default',
    color: String(product?.color || '').trim(),
    images: cleanList(product?.images),
    sizes: cleanList(product?.sizes),
    stockCount: normalizeStockCount(product?.stockCount),
  }];
};

export const getProductVariant = (product, selection = '') => {
  const variants = getProductVariants(product);
  return variants.find((variant) => variant.id === selection || variant.color === selection) || variants[0];
};

export const isProductAvailable = (product, variant) => {
  if (!product?.inStock) return false;
  const selectedVariant = variant || getProductVariant(product);
  if (typeof selectedVariant?.stockCount === 'number') return selectedVariant.stockCount > 0;
  if (typeof product.stockCount === 'number') return product.stockCount > 0;
  return true;
};

export const getStockLabel = (product, variant) => {
  if (!product?.inStock) return 'Out of stock';
  const selectedVariant = variant || getProductVariant(product);
  const stockCount = typeof selectedVariant?.stockCount === 'number'
    ? selectedVariant.stockCount
    : product?.stockCount;
  if (typeof stockCount !== 'number') return 'In stock';
  if (stockCount <= 0) return 'Out of stock';
  return `${stockCount} in stock`;
};

export const getPublicProductSlug = (product) =>
  String(product?.slug || '').replace(/-p\d+$/i, '');

export const getProductPath = (product) => `/products/${getPublicProductSlug(product)}`;
