const CART_KEY = 'khwaja_cart_items';

export const readCart = () => {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
};

export const writeCart = (items) => {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
};

export const clearStoredCart = () => {
  localStorage.removeItem(CART_KEY);
};
