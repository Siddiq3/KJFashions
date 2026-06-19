import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/kj-logo.svg';
import { optimizeImageUrl } from '../../utils/image';

export default function HeroBanner({ banners }) {
  const [active, setActive] = useState(0);
  const hasBanners = banners.length > 0;

  useEffect(() => {
    if (banners.length <= 1) return undefined;
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % banners.length);
    }, 4000);

    return () => window.clearInterval(timer);
  }, [banners.length]);

  if (!hasBanners) {
    return (
      <section className="overflow-hidden bg-primary-50">
        <div className="container-page flex min-h-[420px] flex-col items-start justify-center gap-10 py-16 md:flex-row md:items-center md:justify-between">
          <motion.div
            className="max-w-2xl"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
          >
            <motion.h1
              className="text-5xl font-semibold text-store-dark md:text-7xl"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.08, ease: 'easeOut' }}
            >
              Khwaja Texttiles & Radymade
            </motion.h1>
            <motion.p
              className="mt-5 max-w-xl text-base leading-7 text-store-dark/70"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.18, ease: 'easeOut' }}
            >
              Men's and kids' wear curated for daily comfort, smart occasions, and easy WhatsApp ordering.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.28, ease: 'easeOut' }}
            >
              <Link to="/products" className="btn-primary mt-7">Shop Now</Link>
            </motion.div>
          </motion.div>
          <motion.img
            src={logo}
            alt="Khwaja Textiles and Readymades"
            className="h-44 w-44 rounded-full bg-white object-contain p-2 shadow-soft md:h-64 md:w-64"
            initial={{ opacity: 0, scale: 0.86, rotate: -6 }}
            animate={{ opacity: 1, scale: 1, rotate: 0, y: [0, -8, 0] }}
            transition={{
              opacity: { duration: 0.45 },
              scale: { duration: 0.65, ease: 'easeOut' },
              rotate: { duration: 0.65, ease: 'easeOut' },
              y: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
            }}
          />
        </div>
      </section>
    );
  }

  const banner = banners[active];

  return (
    <section className="relative min-h-[520px] overflow-hidden bg-store-dark">
      <AnimatePresence mode="wait">
        <motion.div
          key={banner.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <img
            src={optimizeImageUrl(banner.image)}
            alt={banner.title}
            loading="eager"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-store-dark/75 via-store-dark/35 to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="container-page relative z-10 flex min-h-[520px] items-center pb-16 pt-12">
        <motion.div
          className="max-w-2xl text-white"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        >
          <motion.h1
            key={`${banner.id}-title`}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="text-5xl font-semibold md:text-7xl"
          >
            {banner.title}
          </motion.h1>
          <motion.p
            key={`${banner.id}-subtitle`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
            className="mt-5 max-w-lg text-lg leading-8 text-white/85"
          >
            {banner.subtitle}
          </motion.p>
          <motion.div
            key={`${banner.id}-action`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18, ease: 'easeOut' }}
          >
            <Link to={banner.link || '/products'} className="btn-primary mt-7">
              Shop Now
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {banners.length > 1 && (
        <div className="container-page absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center justify-between">
          <button type="button" onClick={() => setActive((active - 1 + banners.length) % banners.length)} className="rounded-full bg-white/90 p-2 text-store-dark" aria-label="Previous banner">
            <ChevronLeft size={20} />
          </button>
          <div className="flex gap-2">
            {banners.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Show banner ${index + 1}`}
                className={`h-2.5 rounded-full transition-all ${index === active ? 'w-7 bg-white' : 'w-2.5 bg-white/50'}`}
              />
            ))}
          </div>
          <button type="button" onClick={() => setActive((active + 1) % banners.length)} className="rounded-full bg-white/90 p-2 text-store-dark" aria-label="Next banner">
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </section>
  );
}
