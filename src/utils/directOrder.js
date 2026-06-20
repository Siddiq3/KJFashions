import { getPublicProductSlug } from './product';

const DIRECT_ORDER_KEY = 'khwaja_direct_order';

export const buildOrderItem = (product, qty = 1, { size = '' } = {}) => ({
  key: `${product.id}-${size || 'direct'}-${Date.now()}`,
  id: product.id,
  slug: getPublicProductSlug(product),
  name: product.name,
  price: product.price,
  image: product.images?.[0],
  size,
  qty: Math.max(1, Number(qty) || 1),
});

export const saveDirectOrder = (item) => {
  sessionStorage.setItem(DIRECT_ORDER_KEY, JSON.stringify([item]));
};

export const readDirectOrder = () => {
  try {
    const items = JSON.parse(sessionStorage.getItem(DIRECT_ORDER_KEY)) || [];
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
};

export const clearDirectOrder = () => {
  sessionStorage.removeItem(DIRECT_ORDER_KEY);
};
