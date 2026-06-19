import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Products', to: '/products' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

export default function MobileNav({ onNavigate }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.22 }}
      className="border-t border-primary-100 bg-white/95 px-4 py-4 shadow-soft md:hidden"
    >
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `rounded-md px-3 py-3 text-sm font-semibold ${
                isActive ? 'bg-primary-50 text-primary-700' : 'text-store-dark/80'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </motion.div>
  );
}
