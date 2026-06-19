export const formatPrice = (price) => `₹${Number(price || 0).toLocaleString('en-IN')}`;

export const getDiscount = (orig, curr) => {
  if (!orig || !curr || orig <= curr) return 0;
  return Math.round(((orig - curr) / orig) * 100);
};
