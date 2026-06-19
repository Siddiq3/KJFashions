import { motion } from 'framer-motion';
import { Share2, ShoppingBag } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ImageZoom from '../components/product/ImageZoom.jsx';
import ProductGrid from '../components/product/ProductGrid.jsx';
import ProductModal from '../components/product/ProductModal.jsx';
import Badge from '../components/ui/Badge.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import { useCart } from '../hooks/useCart';
import { useProducts } from '../hooks/useProducts';
import { formatPrice, getDiscount } from '../utils/currency';
import { optimizeImageUrl } from '../utils/image';
import { getStockLabel, isProductAvailable } from '../utils/product';

export default function ProductDetail() {
  const { slug } = useParams();
  const { products, loading, error, refetch } = useProducts();
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const [quickView, setQuickView] = useState(null);

  const product = products.find((item) => item.slug === slug);
  const [selectedImage, setSelectedImage] = useState('');
  const currentImage = selectedImage || product?.images?.[0];

  useEffect(() => {
    setSelectedImage('');
  }, [slug]);

  const related = useMemo(() => {
    if (!product) return [];
    return products.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 3);
  }, [product, products]);

  if (loading) return <LoadingSpinner label="Loading product" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!product) return <div className="container-page py-10"><EmptyState title="Product not found" /></div>;

  const discount = getDiscount(product.originalPrice, product.price);
  const available = isProductAvailable(product);
  const detailRows = [
    ['Fabric', product.fabric],
    ['Occasion', product.occasion],
    ['Color', product.color],
    ['For Age', product.forAge],
    ['Gender', product.gender],
    ['Care', product.careInstructions],
    ['Created', product.createdAt],
  ].filter(([, value]) => value);

  const shareProduct = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: product.name, text: product.description, url });
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="container-page py-10">
      <nav className="mb-6 text-sm text-store-dark/60">
        <Link to="/" className="hover:text-primary-700">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/products" className="hover:text-primary-700">Products</Link>
        <span className="mx-2">/</span>
        <span className="text-store-dark">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="grid gap-4 md:grid-cols-[90px_1fr]">
          <div className="order-2 flex gap-3 overflow-x-auto md:order-1 md:flex-col">
            {product.images?.map((image) => (
              <button
                key={image}
                type="button"
                onClick={() => setSelectedImage(image)}
                className={`h-24 w-20 shrink-0 overflow-hidden rounded-md border bg-primary-50 ${
                  currentImage === image ? 'border-primary-600' : 'border-primary-100'
                }`}
              >
                <img src={optimizeImageUrl(image)} alt={product.name} loading="lazy" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
          <div className="order-1 md:order-2">
            <ImageZoom src={currentImage} alt={product.name} />
          </div>
        </div>

        <div className="rounded-md border border-primary-100 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {product.badge && <Badge tone="gold">{product.badge}</Badge>}
            {discount > 0 && <Badge>{discount}% Off</Badge>}
            {!available && <Badge tone="dark">Sold Out</Badge>}
          </div>
          <h1 className="mt-5 text-5xl font-semibold text-store-dark">{product.name}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="text-3xl font-bold text-primary-700">{formatPrice(product.price)}</span>
            {product.originalPrice && <span className="text-lg text-store-dark/45 line-through">{formatPrice(product.originalPrice)}</span>}
          </div>
          <p className={`mt-2 text-sm font-semibold ${available ? 'text-green-700' : 'text-store-dark/45'}`}>
            {getStockLabel(product)}
          </p>
          <p className="mt-5 text-sm leading-7 text-store-dark/70">{product.description}</p>
          {Array.isArray(product.sizes) && product.sizes.length > 0 && (
            <div className="mt-5">
              <h2 className="text-sm font-semibold text-store-dark">Available Sizes</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <span key={size} className="rounded-md border border-primary-100 bg-primary-50 px-3 py-1 text-sm font-semibold text-store-dark">
                    {size}
                  </span>
                ))}
              </div>
            </div>
          )}
          {detailRows.length > 0 && (
            <dl className="mt-6 grid gap-3 rounded-md bg-primary-50 p-4 text-sm sm:grid-cols-2">
              {detailRows.map(([label, value]) => (
                <div key={label}>
                  <dt className="font-semibold text-store-dark">{label}</dt>
                  <dd className="mt-1 text-store-dark/65">{value}</dd>
                </div>
              ))}
            </dl>
          )}
          <div className="mt-6 flex items-center gap-3">
            <label className="text-sm font-semibold">Quantity</label>
            <input
              type="number"
              min="1"
              value={qty}
              onChange={(event) => setQty(Math.max(1, Number(event.target.value)))}
              className="form-input w-24"
            />
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              disabled={!available}
              onClick={() => addToCart(product, qty)}
              className="btn-primary disabled:cursor-not-allowed disabled:bg-store-dark/25"
            >
              <ShoppingBag size={18} />
              Add to Cart
            </button>
            <button type="button" onClick={shareProduct} className="btn-secondary">
              <Share2 size={18} />
              Share
            </button>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-7 text-4xl font-semibold text-store-dark">Related Products</h2>
          <ProductGrid products={related} onQuickView={setQuickView} />
        </section>
      )}
      <ProductModal product={quickView} onClose={() => setQuickView(null)} />
    </motion.div>
  );
}
