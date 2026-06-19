import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ProductGrid from '../product/ProductGrid.jsx';

export default function FeaturedProducts({ products, onQuickView }) {
  const featured = products.filter((product) => product.featured).slice(0, 6);

  if (featured.length === 0) return null;

  return (
    <motion.section
      className="container-page py-14"
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      viewport={{ once: true, amount: 0.18 }}
    >
      <motion.div
        className="mb-8 flex items-end justify-between gap-4"
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        viewport={{ once: true, amount: 0.35 }}
      >
        <div>
          <h2 className="text-4xl font-semibold text-store-dark">Featured Products</h2>
          <p className="mt-2 text-sm text-store-dark/65">Customer favourites and fresh arrivals for men and kids.</p>
        </div>
        <Link to="/products" className="hidden text-sm font-semibold text-primary-700 hover:text-primary-500 sm:block">
          Shop collection
        </Link>
      </motion.div>
      <ProductGrid products={featured} onQuickView={onQuickView} />
    </motion.section>
  );
}
