import { motion } from 'framer-motion';
import { Share2, ShoppingBag } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import ImageZoom from '../components/product/ImageZoom.jsx';
import ColorSelector from '../components/product/ColorSelector.jsx';
import ProductGrid from '../components/product/ProductGrid.jsx';
import ProductModal from '../components/product/ProductModal.jsx';
import { ProductDetailSkeleton } from '../components/product/ProductSkeleton.jsx';
import Badge from '../components/ui/Badge.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import { useCart } from '../hooks/useCart';
import { useProducts } from '../hooks/useProducts';
import { formatPrice, getDiscount } from '../utils/currency';
import { buildOrderItem, saveDirectOrder } from '../utils/directOrder';
import { optimizeImageUrl } from '../utils/image';
import {
  getProductVariant,
  getProductVariants,
  getPublicProductSlug,
  getStockLabel,
  isProductAvailable,
} from '../utils/product';

export default function ProductDetail() {
  const { slug } = useParams();
  const { products, loading, error, refetch } = useProducts();
  const { addToCart, cartItems, updateCartItem } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [qty, setQty] = useState(1);
  const [quickView, setQuickView] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [sizeError, setSizeError] = useState('');

  const product = products.find((item) => item.slug === slug || getPublicProductSlug(item) === slug);
  const variants = useMemo(() => getProductVariants(product), [product]);
  const selectedVariant = getProductVariant(product, selectedVariantId);
  const [selectedImage, setSelectedImage] = useState('');
  const currentImage = selectedImage || selectedVariant?.images?.[0];
  const cartItemKey = searchParams.get('cartItem') || '';
  const editingCartItem = cartItems.find((item) => item.key === cartItemKey);

  useEffect(() => {
    setSelectedImage('');
    setSelectedSize('');
    setSelectedVariantId('');
    setSizeError('');
  }, [slug, searchParams]);

  useEffect(() => {
    if (!product || variants.length === 0) return;

    const requestedVariantId = searchParams.get('variant') || editingCartItem?.variantId || '';
    const requestedVariant = variants.find((variant) => variant.id === requestedVariantId) || variants[0];
    const requestedSize = searchParams.get('size') || editingCartItem?.size || '';
    const requestedImageIndex = Number(searchParams.get('image') ?? editingCartItem?.imageIndex ?? 0);
    const requestedImage = requestedVariant.images?.[requestedImageIndex] || requestedVariant.images?.[0] || '';

    setSelectedVariantId(requestedVariant.id);
    setSelectedSize(requestedVariant.sizes.includes(requestedSize) ? requestedSize : '');
    setSelectedImage(requestedImage);
    setQty(editingCartItem?.qty || 1);
  }, [editingCartItem, product, searchParams, variants]);

  useEffect(() => {
    if (!product) return;

    const publicSlug = getPublicProductSlug(product);
    if (publicSlug && slug !== publicSlug) {
      const query = searchParams.toString();
      navigate(`/products/${publicSlug}${query ? `?${query}` : ''}`, { replace: true });
    }
  }, [navigate, product, searchParams, slug]);

  const related = useMemo(() => {
    if (!product) return [];
    return products.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 3);
  }, [product, products]);

  if (loading) return <ProductDetailSkeleton />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!product) return <div className="container-page py-10"><EmptyState title="Product not found" /></div>;

  const discount = getDiscount(product.originalPrice, product.price);
  const available = isProductAvailable(product, selectedVariant);
  const sizes = selectedVariant?.sizes || [];
  const requiresSize = sizes.length > 0;
  const detailRows = [
    ['Fabric', product.fabric],
    ['Occasion', product.occasion],
    ['Color', selectedVariant?.color || product.color],
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

  const handleAddToCart = () => {
    if (requiresSize && !selectedSize) {
      setSizeError('Please select a size.');
      return;
    }

    const options = { size: selectedSize, variant: selectedVariant, image: currentImage };
    if (editingCartItem) {
      updateCartItem(editingCartItem.key, product, qty, options);
      navigate(`/products/${getPublicProductSlug(product)}`, { replace: true });
    } else {
      addToCart(product, qty, options);
    }
    setSizeError('');
  };

  const handleBuyNow = () => {
    if (requiresSize && !selectedSize) {
      setSizeError('Please select a size.');
      return;
    }

    saveDirectOrder(buildOrderItem(product, qty, {
      size: selectedSize,
      variant: selectedVariant,
      image: currentImage,
    }));
    setSizeError('');
    navigate('/order?buyNow=1');
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
            {selectedVariant?.images?.map((image) => (
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
            {getStockLabel(product, selectedVariant)}
          </p>
          <p className="mt-5 text-sm leading-7 text-store-dark/70">{product.description}</p>
          <ColorSelector
            variants={variants}
            selectedVariantId={selectedVariant?.id}
            onSelect={(variant) => {
              setSelectedVariantId(variant.id);
              setSelectedImage('');
              setSelectedSize('');
              setSizeError('');
            }}
          />
          {requiresSize && (
            <div className="mt-5">
              <h2 className="text-sm font-semibold text-store-dark">Select Size</h2>
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
              onClick={handleAddToCart}
              className="btn-primary disabled:cursor-not-allowed disabled:bg-store-dark/25"
            >
              <ShoppingBag size={18} />
              {editingCartItem ? 'Update Cart' : 'Add to Cart'}
            </button>
            <button
              type="button"
              disabled={!available}
              onClick={handleBuyNow}
              className="btn-secondary disabled:cursor-not-allowed disabled:opacity-60"
            >
              Buy Now
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
