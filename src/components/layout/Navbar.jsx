import { AnimatePresence } from 'framer-motion';
import { Menu, Search, ShoppingBag, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import logo from '../../assets/kj-logo.svg';
import { normalizeWhatsAppNumber } from '../../utils/whatsapp';
import WhatsAppIcon from '../ui/WhatsAppIcon.jsx';
import MobileNav from './MobileNav.jsx';

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Products', to: '/products' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

export default function Navbar({ onCartOpen }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const whatsappNumber = normalizeWhatsAppNumber(import.meta.env.VITE_WHATSAPP_NUMBER);

  const openWhatsApp = () => {
    if (whatsappNumber) {
      window.open(`https://wa.me/${whatsappNumber}`, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/70 bg-white/80 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex shrink-0 items-center gap-3">
          <img src={logo} alt="Khwaja Textiles and Readymades" className="h-12 w-12 rounded-full object-contain" />
          <span className="hidden text-xl font-bold leading-6 text-primary-700 sm:block md:text-2xl" style={{ fontFamily: 'Playfair Display, serif' }}>
            Khwaja Textiles & readymades
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `text-sm font-semibold transition ${
                  isActive ? 'text-primary-700' : 'text-store-dark/75 hover:text-primary-700'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="rounded-full p-2 text-store-dark/75 transition hover:bg-primary-50 hover:text-primary-700"
            aria-label="Search products"
          >
            <Search size={21} />
          </button>
          <button
            type="button"
            onClick={onCartOpen}
            className="relative rounded-full p-2 text-store-dark/75 transition hover:bg-primary-50 hover:text-primary-700"
            aria-label="Open cart"
          >
            <ShoppingBag size={21} />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-600 px-1 text-[11px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={openWhatsApp}
            className="hidden rounded-full p-2 text-store-dark/75 transition hover:bg-primary-50 hover:text-primary-700 sm:inline-flex"
            aria-label="Open WhatsApp"
          >
            <WhatsAppIcon size={21} />
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            className="rounded-full p-2 text-store-dark/75 transition hover:bg-primary-50 md:hidden"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {mobileOpen && <MobileNav onNavigate={() => setMobileOpen(false)} />}
      </AnimatePresence>
    </header>
  );
}
