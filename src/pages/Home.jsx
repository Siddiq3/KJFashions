import { useCallback, useEffect, useState } from 'react';
import { fetchBanners, fetchCategories } from '../api/data';
import CategoryGrid from '../components/home/CategoryGrid.jsx';
import FeaturedProducts from '../components/home/FeaturedProducts.jsx';
import HeroBanner from '../components/home/HeroBanner.jsx';
import Testimonials from '../components/home/Testimonials.jsx';
import WhyChooseUs from '../components/home/WhyChooseUs.jsx';
import ProductModal from '../components/product/ProductModal.jsx';
import { ProductGridSkeleton } from '../components/product/ProductSkeleton.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import { useProducts } from '../hooks/useProducts';

export default function Home() {
  const { products, loading: productsLoading, error: productsError, refetch } = useProducts();
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [metaError, setMetaError] = useState('');
  const [quickView, setQuickView] = useState(null);

  const loadHomeData = useCallback(async () => {
    setLoadingMeta(true);
    setMetaError('');

    try {
      const [categoriesData, bannersData] = await Promise.all([fetchCategories(), fetchBanners()]);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setBanners(Array.isArray(bannersData) ? bannersData : []);
    } catch (error) {
      setMetaError(error.message || 'Unable to load home data.');
    } finally {
      setLoadingMeta(false);
    }
  }, []);

  useEffect(() => {
    loadHomeData();
  }, [loadHomeData]);

  const retryHome = () => {
    refetch();
    loadHomeData();
  };

  if (productsLoading || loadingMeta) {
    return (
      <div aria-label="Loading collection" aria-busy="true">
        <div className="h-[440px] animate-pulse bg-primary-100/80" />
        <div className="container-page py-14">
          <div className="mb-8 h-10 w-64 animate-pulse rounded-md bg-primary-100/80" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="h-48 animate-pulse rounded-md bg-primary-100/80" />
            ))}
          </div>
          <div className="mb-8 mt-14 h-10 w-72 animate-pulse rounded-md bg-primary-100/80" />
          <ProductGridSkeleton count={6} />
        </div>
      </div>
    );
  }

  if (productsError || metaError) {
    return <ErrorState message={productsError || metaError} onRetry={retryHome} />;
  }

  return (
    <>
      <HeroBanner banners={banners} />
      <CategoryGrid categories={categories} />
      <FeaturedProducts products={products} onQuickView={setQuickView} />
      <WhyChooseUs />
      <Testimonials />
      <ProductModal product={quickView} onClose={() => setQuickView(null)} />
    </>
  );
}
