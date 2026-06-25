import { motion } from 'framer-motion';
import { Eye, ShoppingBag } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { formatPrice, getDiscount } from '../../utils/currency';
import { buildOrderItem, saveDirectOrder } from '../../utils/directOrder';
import { optimizeImageUrl } from '../../utils/image';
import {
  getProductPath,
  getProductVariant,
  getProductVariants,
  getStockLabel,
  isProductAvailable,
} from '../../utils/product';
import Badge from '../ui/Badge.jsx';
import ColorSelector from './ColorSelector.jsx';

export default function ProductCard({ product, onQuickView, priority = false }) {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [sizeError, setSizeError] = useState('');
  const discount = getDiscount(product.originalPrice, product.price);
  const variants = useMemo(() => getProductVariants(product), [product]);
  const selectedVariant = getProductVariant(product, selectedVariantId);
  const images = selectedVariant?.images || [];
  const [activeImage, setActiveImage] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const image = optimizeImageUrl(images[activeImage] || images[0]);
  const preview = selectedVariant?.previews?.[activeImage] || selectedVariant?.previews?.[0];
  const available = isProductAvailable(product, selectedVariant);
  const sizes = selectedVariant?.sizes || [];
  const requiresSize = sizes.length > 0;

  useEffect(() => {
    setActiveImage(0);
    setSelectedVariantId(variants[0]?.id || '');
    setSelectedSize('');
  }, [product.id]);

  useEffect(() => {
    setImageLoaded(false);
  }, [image]);

  const handleAddToCart = () => {
    if (requiresSize && !selectedSize) {
      setSizeError('Please select a size.');
      return;
    }

    addToCart(product, 1, { size: selectedSize, variant: selectedVariant, image: images[activeImage] });
    setSizeError('');
  };

  const handleBuyNow = () => {
    if (requiresSize && !selectedSize) {
      setSizeError('Please select a size.');
      return;
    }

    saveDirectOrder(buildOrderItem(product, 1, {
      size: selectedSize,
      variant: selectedVariant,
      image: images[activeImage],
    }));
    setSizeError('');
    navigate('/order?buyNow=1');
  };

  return (
    <motion.article
      whileHover={{ y: -6, scale: 1.03 }}
      transition={{ duration: 0.22 }}
      className="group overflow-hidden rounded-md border border-primary-100 bg-white shadow-sm transition hover:shadow-soft"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-primary-50">
        {image ? (
          <>
            {!imageLoaded && preview && (
              <img
                src={preview}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full scale-105 object-cover blur-sm"
              />
            )}
            {!imageLoaded && !preview && (
              <div className="absolute inset-0 animate-pulse bg-primary-100/80" aria-hidden="true" />
            )}
            <motion.img
              key={image}
              src={image}
              alt={product.name}
              loading={priority ? 'eager' : 'lazy'}
              fetchPriority={priority ? 'high' : 'auto'}
              decoding="async"
              onLoad={() => setImageLoaded(true)}
              initial={{ opacity: 0 }}
              animate={{ opacity: imageLoaded ? 1 : 0 }}
              transition={{ duration: 0.35 }}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
            />
            {images.length > 1 && (
              <div className="absolute bottom-3 right-3 flex gap-1.5">
                {images.map((item, index) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    className={`h-2 rounded-full transition ${
                      activeImage === index ? 'w-5 bg-white' : 'w-2 bg-white/60'
                    }`}
                    aria-label={`Show image ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-store-dark/50">No image</div>
        )}
        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {product.badge && <Badge tone="gold">{product.badge}</Badge>}
          {!available && <Badge tone="dark">Sold Out</Badge>}
        </div>
        <button
          type="button"
          onClick={() => onQuickView(product)}
          className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-xs font-semibold text-store-dark opacity-0 shadow transition group-hover:opacity-100"
        >
          <Eye size={15} />
          Quick view
        </button>
      </div>

      <div className="p-4">
        <Link to={getProductPath(product)} className="block">
          <h3 className="line-clamp-2 min-h-[56px] text-xl font-semibold text-store-dark transition hover:text-primary-700">
            {product.name}
          </h3>
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-lg font-bold text-primary-700">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <span className="text-sm text-store-dark/45 line-through">{formatPrice(product.originalPrice)}</span>
          )}
          {discount > 0 && <span className="text-xs font-semibold text-green-700">{discount}% off</span>}
        </div>
        <p className={`mt-2 text-xs font-semibold ${available ? 'text-green-700' : 'text-store-dark/45'}`}>
          {getStockLabel(product, selectedVariant)}
        </p>
        <ColorSelector
          variants={variants}
          selectedVariantId={selectedVariant?.id}
          compact
          onSelect={(variant) => {
            setSelectedVariantId(variant.id);
            setSelectedSize('');
            setActiveImage(0);
            setSizeError('');
          }}
        />
        {requiresSize && (
          <div className="mt-3">
            <p className="text-xs font-semibold text-store-dark/60">Select Size</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => {
                    setSelectedSize(size);
                    setSizeError('');
                  }}
                  className={`rounded-md border px-2.5 py-1 text-xs font-semibold transition ${
                    selectedSize === size
                      ? 'border-primary-600 bg-primary-600 text-white'
                      : 'border-primary-100 bg-primary-50 text-store-dark hover:border-primary-500'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            {sizeError && <p className="mt-2 text-xs font-semibold text-red-600">{sizeError}</p>}
          </div>
        )}
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            disabled={!available}
            onClick={handleAddToCart}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-primary-500 px-3 py-3 text-sm font-semibold text-white transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-store-dark/25"
          >
            <ShoppingBag size={17} />
            {available ? 'Add to Cart' : 'Out of Stock'}
          </button>
          <button
            type="button"
            disabled={!available}
            onClick={handleBuyNow}
            className="flex w-full items-center justify-center rounded-md border border-primary-500 bg-white px-3 py-3 text-sm font-semibold text-primary-700 transition hover:bg-primary-50 disabled:cursor-not-allowed disabled:border-store-dark/20 disabled:text-store-dark/35"
          >
            Buy Now
          </button>
        </div>
      </div>
    </motion.article>
  );
}
