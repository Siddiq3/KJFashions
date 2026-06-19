import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../utils/currency';
import { optimizeImageUrl } from '../../utils/image';
import { getStockLabel, isProductAvailable } from '../../utils/product';
import Badge from '../ui/Badge.jsx';

export default function ProductModal({ product, onClose }) {
  const { addToCart } = useCart();
  const available = product ? isProductAvailable(product) : false;
  const [selectedSize, setSelectedSize] = useState('');
  const [sizeError, setSizeError] = useState('');
  const sizes = Array.isArray(product?.sizes) ? product.sizes.filter(Boolean) : [];
  const requiresSize = sizes.length > 0;

  useEffect(() => {
    setSelectedSize('');
    setSizeError('');
  }, [product?.id]);

  const handleAddToCart = () => {
    if (!product) return;

    if (requiresSize && !selectedSize) {
      setSizeError('Please select a size.');
      return;
    }

    addToCart(product, 1, { size: selectedSize });
    setSizeError('');
  };

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-store-dark/60 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            className="grid max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-md bg-white shadow-soft md:grid-cols-2"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="aspect-[3/4] bg-primary-50 md:aspect-auto">
              <img
                src={optimizeImageUrl(product.images?.[0])}
                alt={product.name}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="relative overflow-y-auto p-6">
              <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 rounded-full bg-primary-50 p-2 text-store-dark"
                aria-label="Close quick view"
              >
                <X size={20} />
              </button>
              {product.badge && <Badge tone="gold">{product.badge}</Badge>}
              <h2 className="mt-4 text-3xl font-semibold text-store-dark">{product.name}</h2>
              <p className="mt-3 text-2xl font-bold text-primary-700">{formatPrice(product.price)}</p>
              <p className={`mt-2 text-xs font-semibold ${available ? 'text-green-700' : 'text-store-dark/45'}`}>
                {getStockLabel(product)}
              </p>
              <p className="mt-4 text-sm leading-7 text-store-dark/70">{product.description}</p>
              {requiresSize && (
                <div className="mt-5">
                  <h3 className="text-sm font-semibold text-store-dark">Select Size</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => {
                          setSelectedSize(size);
                          setSizeError('');
                        }}
                        className={`rounded-md border px-3 py-1.5 text-sm font-semibold transition ${
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
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  disabled={!available}
                  onClick={handleAddToCart}
                  className="btn-primary disabled:cursor-not-allowed disabled:bg-store-dark/25"
                >
                  Add to Cart
                </button>
                <Link to={`/products/${product.slug}`} onClick={onClose} className="btn-secondary">
                  View Details
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
