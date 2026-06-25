import { createContext, useEffect, useMemo, useState } from 'react';
import { clearStoredCart, readCart, writeCart } from '../utils/cart';
import { getPublicProductSlug } from '../utils/product';

export const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => readCart());

  useEffect(() => {
    writeCart(cartItems);
  }, [cartItems]);

  const addToCart = (product, qty = 1, options = {}) => {
    const size = options.size || '';
    const variant = options.variant || {};
    const color = variant.color || product.color || '';
    const variantId = variant.id || color || 'default';
    const selectedImage = options.image || variant.images?.[0] || product.images?.[0];
    const selectedImageIndex = Math.max(0, (variant.images || []).indexOf(selectedImage));
    const cartKey = `${product.id}-${variantId}-${size || 'default'}`;

    setCartItems((items) => {
      const existing = items.find((item) => item.key === cartKey);

      if (existing) {
        return items.map((item) =>
          item.key === cartKey
            ? {
                ...item,
                key: cartKey,
                image: selectedImage,
                imageIndex: selectedImageIndex,
                color,
                variantId,
                qty: item.qty + qty,
              }
            : item,
        );
      }

      return [
        ...items,
        {
          key: cartKey,
          id: product.id,
          slug: getPublicProductSlug(product),
          name: product.name,
          price: product.price,
          image: selectedImage,
          imageIndex: selectedImageIndex,
          variantId,
          color,
          size,
          qty,
        },
      ];
    });
  };

  const updateCartItem = (currentKey, product, qty = 1, options = {}) => {
    const size = options.size || '';
    const variant = options.variant || {};
    const color = variant.color || product.color || '';
    const variantId = variant.id || color || 'default';
    const selectedImage = options.image || variant.images?.[0] || product.images?.[0];
    const selectedImageIndex = Math.max(0, (variant.images || []).indexOf(selectedImage));
    const nextKey = `${product.id}-${variantId}-${size || 'default'}`;
    const nextItem = {
      key: nextKey,
      id: product.id,
      slug: getPublicProductSlug(product),
      name: product.name,
      price: product.price,
      image: selectedImage,
      imageIndex: selectedImageIndex,
      variantId,
      color,
      size,
      qty: Math.max(1, Number(qty) || 1),
    };

    setCartItems((items) => {
      const remaining = items.filter((item) => item.key !== currentKey && item.key !== nextKey);
      const matchingTarget = items.find((item) => item.key === nextKey && item.key !== currentKey);

      return [
        ...remaining,
        matchingTarget
          ? { ...nextItem, qty: matchingTarget.qty + nextItem.qty }
          : nextItem,
      ];
    });
  };

  const removeFromCart = (key) => {
    setCartItems((items) => items.filter((item) => item.key !== key));
  };

  const updateQty = (key, qty) => {
    const nextQty = Math.max(1, Number(qty) || 1);
    setCartItems((items) =>
      items.map((item) => (item.key === key ? { ...item, qty: nextQty } : item)),
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
      updateCartItem,
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
