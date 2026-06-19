export const audienceOptions = [
  { value: 'men', label: 'Men', gender: 'Men', forAge: 'Adult' },
  { value: 'kids', label: 'Kids', gender: 'Kids', forAge: 'Kids' },
];

export const productTypeOptions = [
  { value: 'shirts', label: 'Shirts' },
  { value: 't-shirts', label: 'T-Shirts' },
  { value: 'pants', label: 'Pants' },
  { value: 'jeans', label: 'Jeans' },
  { value: 'shorts', label: 'Shorts' },
  { value: 'kurta', label: 'Kurta' },
  { value: 'nightwear', label: 'Nightwear' },
  { value: 'innerwear', label: 'Innerwear' },
  { value: 'traditional', label: 'Traditional Wear' },
  { value: 'accessories', label: 'Accessories' },
  { value: 'other', label: 'Other' },
];

export const defaultCategories = audienceOptions.flatMap((audience) =>
  productTypeOptions
    .filter((type) => type.value !== 'other')
    .map((type) => ({
      id: `${audience.value}-${type.value}`,
      slug: `${audience.value}-${type.value}`,
      name: `${audience.label} ${type.label}`,
    })),
);

export const getAudienceOption = (value) =>
  audienceOptions.find((option) => option.value === value) || audienceOptions[0];

export const getProductTypeOption = (value) =>
  productTypeOptions.find((option) => option.value === value) || productTypeOptions[0];

export const getCategorySlug = ({ audience, productType, customProductType }) => {
  const type = productType === 'other' ? customProductType : productType;
  return `${audience}-${type || 'other'}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
};

export const getProductTypeLabel = ({ productType, customProductType }) => {
  if (productType === 'other') return customProductType || 'Other';
  return getProductTypeOption(productType).label;
};

const sizePresets = {
  men: {
    shirts: 'S, M, L, XL, XXL, XXXL',
    't-shirts': 'S, M, L, XL, XXL, XXXL',
    pants: '28, 30, 32, 34, 36, 38, 40, 42, 44',
    jeans: '28, 30, 32, 34, 36, 38, 40, 42, 44',
    shorts: '28, 30, 32, 34, 36, 38, 40, 42',
    kurta: 'S, M, L, XL, XXL, XXXL',
    nightwear: 'S, M, L, XL, XXL, XXXL',
    innerwear: 'S, M, L, XL, XXL',
    traditional: 'S, M, L, XL, XXL, XXXL',
    accessories: 'Free Size',
    other: 'S, M, L, XL, XXL',
  },
  kids: {
    shirts: '1-2Y, 2-3Y, 4-5Y, 6-7Y, 8-9Y, 10-11Y, 12-13Y, 14-15Y',
    't-shirts': '1-2Y, 2-3Y, 4-5Y, 6-7Y, 8-9Y, 10-11Y, 12-13Y, 14-15Y',
    pants: '2-3Y, 4-5Y, 6-7Y, 8-9Y, 10-11Y, 12-13Y, 14-15Y',
    jeans: '2-3Y, 4-5Y, 6-7Y, 8-9Y, 10-11Y, 12-13Y, 14-15Y',
    shorts: '1-2Y, 2-3Y, 4-5Y, 6-7Y, 8-9Y, 10-11Y, 12-13Y',
    kurta: '1-2Y, 2-3Y, 4-5Y, 6-7Y, 8-9Y, 10-11Y, 12-13Y, 14-15Y',
    nightwear: '1-2Y, 2-3Y, 4-5Y, 6-7Y, 8-9Y, 10-11Y, 12-13Y, 14-15Y',
    innerwear: '1-2Y, 2-3Y, 4-5Y, 6-7Y, 8-9Y, 10-11Y, 12-13Y',
    traditional: '1-2Y, 2-3Y, 4-5Y, 6-7Y, 8-9Y, 10-11Y, 12-13Y, 14-15Y',
    accessories: 'Free Size',
    other: '1-2Y, 2-3Y, 4-5Y, 6-7Y, 8-9Y, 10-11Y, 12-13Y',
  },
};

export const getDefaultSizes = ({ audience = 'men', productType = 'shirts' }) =>
  sizePresets[audience]?.[productType] || sizePresets[audience]?.other || sizePresets.men.shirts;
