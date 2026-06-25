import { AnimatePresence, motion } from 'framer-motion';
import { SlidersHorizontal, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchCategories } from '../api/data';
import ProductGrid from '../components/product/ProductGrid.jsx';
import ProductModal from '../components/product/ProductModal.jsx';
import { ProductGridSkeleton } from '../components/product/ProductSkeleton.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import { defaultCategories } from '../data/productOptions';
import { useProducts } from '../hooks/useProducts';

const PAGE_SIZE = 9;

export default function Products() {
  const { products, loading, error, refetch } = useProducts();
  const [categories, setCategories] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [quickView, setQuickView] = useState(null);
  const sentinelRef = useRef(null);

  const selectedCategory = searchParams.get('category') || 'all';
  const sort = searchParams.get('sort') || 'newest';
  const search = searchParams.get('search') || '';
  const inStock = searchParams.get('stock') === 'true';
  const maxProductPrice = useMemo(
    () => Math.max(1000, ...products.map((product) => Number(product.price) || 0)),
    [products],
  );
  const price = Number(searchParams.get('price') || maxProductPrice);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(Array.isArray(data) && data.length > 0 ? data : defaultCategories);
      } catch (err) {
        setCategories(defaultCategories);
      }
    };

    loadCategories();
  }, []);

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);

    if (!value || value === 'all' || value === 'newest' || value === String(maxProductPrice)) {
      next.delete(key);
    } else {
      next.set(key, value);
    }

    setSearchParams(next);
  };

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const nextProducts = products
      .filter((product) => selectedCategory === 'all' || product.category === selectedCategory)
      .filter((product) => !inStock || product.inStock)
      .filter((product) => product.price <= price)
      .filter((product) => {
        if (!normalizedSearch) return true;
        return [product.name, product.description, ...(product.tags || [])]
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch);
      });

    if (sort === 'price_asc') return [...nextProducts].sort((a, b) => a.price - b.price);
    if (sort === 'price_desc') return [...nextProducts].sort((a, b) => b.price - a.price);
    return [...nextProducts].sort((a, b) => String(b.id).localeCompare(String(a.id)));
  }, [products, selectedCategory, inStock, price, search, sort]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [selectedCategory, sort, search, inStock, price]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return undefined;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setVisibleCount((count) => Math.min(count + PAGE_SIZE, filteredProducts.length));
      }
    });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [filteredProducts.length]);

  if (loading) {
    return (
      <div className="container-page py-10">
        <div className="mb-8">
          <div className="h-12 w-72 animate-pulse rounded-md bg-primary-100/80" />
          <div className="mt-3 h-4 w-80 max-w-full animate-pulse rounded-md bg-primary-100/80" />
        </div>
        <div className="grid gap-8 md:grid-cols-[260px_1fr]">
          <div className="hidden h-80 animate-pulse rounded-md bg-primary-100/80 md:block" />
          <ProductGridSkeleton count={9} />
        </div>
      </div>
    );
  }
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="container-page py-10">
      <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-5xl font-semibold text-store-dark">Men's & Kids' Wear</h1>
          <p className="mt-2 text-sm text-store-dark/65">Filter by category, budget, and availability.</p>
        </div>
        <div className="flex gap-3">
          <input
            value={search}
            onChange={(event) => updateFilter('search', event.target.value)}
            placeholder="Search shirts, pants, kids wear"
            className="form-input min-w-0 md:w-80"
          />
          <button type="button" onClick={() => setFiltersOpen(true)} className="btn-secondary md:hidden">
            <SlidersHorizontal size={18} />
            Filters
          </button>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-[260px_1fr]">
        <aside className="hidden md:block">
          <FilterPanel
            categories={categories}
            selectedCategory={selectedCategory}
            sort={sort}
            inStock={inStock}
            price={price}
            maxPrice={maxProductPrice}
            updateFilter={updateFilter}
          />
        </aside>

        <section>
          {visibleProducts.length === 0 ? (
            <EmptyState title="No products found" message="Try clearing filters or search for a different style or size." />
          ) : (
            <>
              <ProductGrid products={visibleProducts} onQuickView={setQuickView} />
              {visibleProducts.length < filteredProducts.length && (
                <div ref={sentinelRef} className="py-10">
                  <LoadingSpinner label="Loading more" />
                </div>
              )}
            </>
          )}
        </section>
      </div>

      <AnimatePresence>
        {filtersOpen && (
          <motion.div className="fixed inset-0 z-50 md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-store-dark/45"
              onClick={() => setFiltersOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
              className="absolute bottom-0 left-0 right-0 max-h-[82vh] overflow-y-auto rounded-t-md bg-store-cream p-5"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Filters</h2>
                <button type="button" onClick={() => setFiltersOpen(false)} className="rounded-full bg-white p-2">
                  <X size={20} />
                </button>
              </div>
              <FilterPanel
                categories={categories}
                selectedCategory={selectedCategory}
                sort={sort}
                inStock={inStock}
                price={price}
                maxPrice={maxProductPrice}
                updateFilter={updateFilter}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <ProductModal product={quickView} onClose={() => setQuickView(null)} />
    </div>
  );
}

function FilterPanel({ categories, selectedCategory, sort, inStock, price, maxPrice, updateFilter }) {
  return (
    <div className="rounded-md border border-primary-100 bg-white p-5 shadow-sm">
      <div className="space-y-6">
        <div>
          <label className="text-sm font-semibold text-store-dark">Category</label>
          <select value={selectedCategory} onChange={(event) => updateFilter('category', event.target.value)} className="form-input mt-2">
            <option value="all">All Products</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug || category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-store-dark">Max Price</label>
            <span className="text-sm font-bold text-primary-700">₹{price.toLocaleString('en-IN')}</span>
          </div>
          <input
            type="range"
            min="500"
            max={maxPrice}
            step="100"
            value={price}
            onChange={(event) => updateFilter('price', event.target.value)}
            className="mt-3 w-full accent-primary-600"
          />
        </div>

        <label className="flex items-center justify-between rounded-md bg-primary-50 px-3 py-3 text-sm font-semibold text-store-dark">
          In stock only
          <input
            type="checkbox"
            checked={inStock}
            onChange={(event) => updateFilter('stock', event.target.checked ? 'true' : '')}
            className="h-5 w-5 accent-primary-600"
          />
        </label>

        <div>
          <label className="text-sm font-semibold text-store-dark">Sort</label>
          <select value={sort} onChange={(event) => updateFilter('sort', event.target.value)} className="form-input mt-2">
            <option value="newest">Newest</option>
            <option value="price_asc">Price Low-High</option>
            <option value="price_desc">Price High-Low</option>
          </select>
        </div>
      </div>
    </div>
  );
}
