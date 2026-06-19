import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { optimizeImageUrl } from '../../utils/image';

const section = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: 'easeOut', staggerChildren: 0.08 },
  },
};

const card = {
  hidden: { opacity: 0, y: 22, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: 'easeOut' } },
};

export default function CategoryGrid({ categories }) {
  return (
    <motion.section
      className="container-page py-14"
      variants={section}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.18 }}
    >
      <motion.div variants={card} className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-semibold text-store-dark">Shop by Category</h2>
          <p className="mt-2 text-sm text-store-dark/65">Discover men's wear and kids' wear by category and style.</p>
        </div>
        <Link to="/products" className="hidden text-sm font-semibold text-primary-700 hover:text-primary-500 sm:block">
          View all
        </Link>
      </motion.div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {categories.map((category) => (
          <motion.div key={category.id} variants={card} whileHover={{ y: -8 }} transition={{ duration: 0.22 }}>
          <Link
            key={category.id}
            to={`/products?category=${category.slug || category.id}`}
            className="group block overflow-hidden rounded-md bg-white shadow-sm transition-shadow hover:shadow-soft"
          >
            <div className="aspect-[4/5] overflow-hidden bg-primary-50">
              <img
                src={optimizeImageUrl(category.image)}
                alt={category.name}
                loading="lazy"
                className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
              />
            </div>
            <div className="p-4">
              <h3 className="text-xl font-semibold text-store-dark">{category.name}</h3>
            </div>
          </Link>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
