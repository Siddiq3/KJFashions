export const isProductAvailable = (product) => {
  if (!product?.inStock) return false;
  if (typeof product.stockCount === 'number') return product.stockCount > 0;
  return true;
};

export const getStockLabel = (product) => {
  if (typeof product?.stockCount !== 'number') return product?.inStock ? 'In stock' : 'Out of stock';
  if (product.stockCount <= 0) return 'Out of stock';
  return `${product.stockCount} in stock`;
};
