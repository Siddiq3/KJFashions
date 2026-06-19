import { motion } from 'framer-motion';
import { Eye, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { formatPrice, getDiscount } from '../../utils/currency';
import { optimizeImageUrl } from '../../utils/image';
import { getStockLabel, isProductAvailable } from '../../utils/product';
import Badge from '../ui/Badge.jsx';

export default function ProductCard({ product, onQuickView }) {
  const { addToCart } = useCart();
  const discount = getDiscount(product.originalPrice, product.price);
  const image = optimizeImageUrl(product.images?.[0]);
  const available = isProductAvailable(product);

  return (
    <motion.article
      whileHover={{ y: -6, scale: 1.03 }}
      transition={{ duration: 0.22 }}
      className="group overflow-hidden rounded-md border border-primary-100 bg-white shadow-sm transition hover:shadow-soft"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-primary-50">
        {image ? (
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
          />
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
        <Link to={`/products/${product.slug}`} className="block">
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
          {getStockLabel(product)}
        </p>
        <button
          type="button"
          disabled={!available}
          onClick={() => addToCart(product, 1)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-primary-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-store-dark/25"
        >
          <ShoppingBag size={17} />
          {available ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </motion.article>
  );
}
