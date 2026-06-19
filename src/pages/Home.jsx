import { useCallback, useEffect, useState } from 'react';
import { fetchBanners, fetchCategories } from '../api/data';
import CategoryGrid from '../components/home/CategoryGrid.jsx';
import FeaturedProducts from '../components/home/FeaturedProducts.jsx';
import HeroBanner from '../components/home/HeroBanner.jsx';
import Testimonials from '../components/home/Testimonials.jsx';
import WhyChooseUs from '../components/home/WhyChooseUs.jsx';
import ProductModal from '../components/product/ProductModal.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
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
    return <LoadingSpinner label="Loading collection" />;
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
