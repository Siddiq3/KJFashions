import { createContext, useEffect, useMemo, useState } from 'react';
import { clearStoredCart, readCart, writeCart } from '../utils/cart';

export const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => readCart());

  useEffect(() => {
    writeCart(cartItems);
  }, [cartItems]);

  const addToCart = (product, qty = 1, options = {}) => {
    const size = options.size || '';
    const cartKey = `${product.id}-${size || 'default'}`;

    setCartItems((items) => {
      const existing = items.find((item) => (item.key || `${item.id}-${item.size || 'default'}`) === cartKey);

      if (existing) {
        return items.map((item) =>
          (item.key || `${item.id}-${item.size || 'default'}`) === cartKey
            ? { ...item, key: cartKey, qty: item.qty + qty }
            : item,
        );
      }

      return [
        ...items,
        {
          key: cartKey,
          id: product.id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          image: product.images?.[0],
          size,
          qty,
        },
      ];
    });
  };

  const removeFromCart = (key) => {
    setCartItems((items) => items.filter((item) => (item.key || `${item.id}-${item.size || 'default'}`) !== key));
  };

  const updateQty = (key, qty) => {
    const nextQty = Math.max(1, Number(qty) || 1);
    setCartItems((items) =>
      items.map((item) => ((item.key || `${item.id}-${item.size || 'default'}`) === key ? { ...item, qty: nextQty } : item)),
    );
  };

  const clearCart = () => {
    clearStoredCart();
    setCartItems([]);
  };

  const cartCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.qty, 0),
    [cartItems],
  );

  const cartTotal = useMemo(
    () => cartItems.reduce((total, item) => total + item.price * item.qty, 0),
    [cartItems],
  );

  const value = useMemo(
    () => ({
      cartItems,
      addToCart,
      removeFromCart,
      updateQty,
      clearCart,
      cartCount,
      cartTotal,
    }),
    [cartItems, cartCount, cartTotal],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
