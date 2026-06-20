import { motion } from 'framer-motion';
import {
  CalendarDays,
  ClipboardList,
  ExternalLink,
  Globe2,
  Grid2X2,
  MessageCircle,
  PackageCheck,
  PlusCircle,
  Scissors,
  Share2,
  ShieldCheck,
  Sparkles,
  Store,
  Truck,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '../../assets/kj-logo.svg';
import { optimizeImageUrl } from '../../utils/image';
import { normalizeWhatsAppNumber } from '../../utils/whatsapp';
import WhatsAppIcon from '../ui/WhatsAppIcon.jsx';

const bioText = `Hi, we're Khwaja Textiles & readymades. We help men and kids find comfortable daily wear, neat occasion outfits, and practical ready-made styles at fair prices. Browse the latest collection, check sizes and stock, then place your order directly on WhatsApp with confidence.`;

const workflowItems = [
  { title: 'Browse', text: 'Explore men and kids collections by category.', icon: Grid2X2 },
  { title: 'Confirm', text: 'Ask about size, colour, stock, and delivery.', icon: MessageCircle },
  { title: 'Order', text: 'Share your selected items through WhatsApp.', icon: PackageCheck },
];

const statusItems = [
  { label: 'Ready Stock', value: 'Fast reply', className: 'bg-emerald-500 text-white' },
  { label: 'Men Wear', value: 'Daily & occasion', className: 'bg-sky-500 text-white' },
  { label: 'Kids Wear', value: 'Comfort fits', className: 'bg-rose-500 text-white' },
  { label: 'Delivery', value: 'On request', className: 'bg-amber-400 text-store-dark' },
];

const getCoverImages = ({ products, categories, banners }) => {
  const productImages = products.flatMap((product) => product.images || []);
  const categoryImages = categories.map((category) => category.image).filter(Boolean);
  const bannerImages = banners.map((banner) => banner.image).filter(Boolean);

  return [...bannerImages, ...productImages, ...categoryImages].filter(Boolean).slice(0, 4);
};

export default function ShopProfile({ products = [], categories = [], banners = [] }) {
  const whatsappNumber = normalizeWhatsAppNumber(import.meta.env.VITE_WHATSAPP_NUMBER);
  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hi, I want to know more about your collection.')}`
    : '/contact';
  const coverImages = getCoverImages({ products, categories, banners });
  const displayImages = coverImages.length > 0
    ? Array.from({ length: 4 }, (_, index) => coverImages[index % coverImages.length])
    : [];
  const featuredCount = products.filter((product) => product.featured).length;
  const inStockCount = products.filter((product) => product.inStock).length;

  return (
    <section className="bg-white">
      <div className="border-b border-emerald-100 bg-emerald-50">
        <div className="container-page flex min-h-16 items-center justify-between gap-3 py-3">
          <div className="flex items-center gap-3 text-sm font-semibold text-store-dark">
            <WhatsAppIcon size={24} className="text-emerald-600" />
            <span>WhatsApp ordering available</span>
          </div>
          <a
            href={whatsappHref}
            target={whatsappNumber ? '_blank' : undefined}
            rel={whatsappNumber ? 'noopener noreferrer' : undefined}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-store-dark/20 bg-white px-4 py-2 text-sm font-semibold text-store-dark shadow-sm transition hover:border-emerald-500 hover:text-emerald-700"
          >
            <WhatsAppIcon size={18} className="text-emerald-600" />
            Chat Now
          </a>
        </div>
      </div>

      <div className="container-page py-6">
        <motion.div
          className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="Khwaja Textiles and Readymades" className="h-16 w-16 rounded-full object-contain" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-700">Local clothing store</p>
              <h1 className="text-3xl font-semibold leading-tight text-store-dark md:text-4xl">
                Khwaja Textiles & readymades
              </h1>
            </div>
          </Link>

          <div className="flex flex-wrap gap-2">
            <Link to="/products" className="btn-primary px-4 py-3">
              <PlusCircle size={18} />
              Create Order
            </Link>
            <Link to="/contact" className="btn-secondary px-4 py-3" aria-label="Contact support">
              <MessageCircle size={18} />
              Support
            </Link>
          </div>
        </motion.div>

        <div className="mt-6 grid grid-cols-2 border-b border-primary-100 text-center">
          <Link to="/products" className="border-b-2 border-primary-500 pb-3 text-sm font-semibold text-primary-700">
            <ClipboardList className="mx-auto mb-2" size={23} />
            Workflow
          </Link>
          <Link to="/products" className="pb-3 text-sm font-semibold text-store-dark/75 hover:text-primary-700">
            <Grid2X2 className="mx-auto mb-2" size={23} />
            Portfolio
          </Link>
        </div>

        <motion.div
          className="relative mt-0 overflow-hidden rounded-md bg-store-dark"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08, ease: 'easeOut' }}
        >
          <div className="grid h-56 grid-cols-2 md:h-72 md:grid-cols-4">
            {displayImages.length > 0 ? (
              displayImages.map((image, index) => (
                <img
                  key={`${image}-${index}`}
                  src={optimizeImageUrl(image)}
                  alt=""
                  className={`h-full w-full object-cover ${index === 0 ? 'col-span-2 md:col-span-2' : ''}`}
                />
              ))
            ) : (
              <div className="col-span-2 flex h-full items-center justify-center bg-primary-50 md:col-span-4">
                <img src={logo} alt="" className="h-32 w-32 rounded-full bg-white object-contain p-2" />
              </div>
            )}
          </div>
          <div className="absolute inset-x-0 bottom-4 flex justify-center gap-3">
            <QuickIcon icon={Store} label="Shop" to="/about" />
            <QuickIcon icon={Share2} label="Share" href={whatsappHref} external={Boolean(whatsappNumber)} />
            <QuickIcon icon={Grid2X2} label="Products" to="/products" />
            <QuickIcon icon={ExternalLink} label="Contact" to="/contact" />
          </div>
        </motion.div>

        <div id="shop-bio" className="border-b border-primary-100 py-6">
          <div className="flex items-start gap-4">
            <div className="relative flex-none">
              <img src={logo} alt="Khwaja Textiles & readymades" className="h-20 w-20 rounded-full border border-primary-100 bg-white object-contain p-1 shadow-sm" />
              <span className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-store-dark text-white shadow-sm">
                <Scissors size={16} />
              </span>
            </div>
            <div className="min-w-0">
              <h2 className="text-3xl font-semibold leading-tight text-store-dark">siddiq</h2>
              <p className="text-base text-store-dark/60">Khwaja Textiles & readymades (Owner)</p>
            </div>
          </div>

          <div className="mt-5 flex justify-center gap-8 text-store-dark">
            <Link to="/products" aria-label="Open website" className="rounded-full p-2 transition hover:bg-primary-50 hover:text-primary-700">
              <Globe2 size={27} />
            </Link>
            <a
              href={whatsappHref}
              target={whatsappNumber ? '_blank' : undefined}
              rel={whatsappNumber ? 'noopener noreferrer' : undefined}
              aria-label="Open WhatsApp"
              className="rounded-full p-2 text-emerald-600 transition hover:bg-emerald-50"
            >
              <WhatsAppIcon size={28} />
            </a>
          </div>

          <p className="mt-4 max-w-4xl text-base leading-7 text-store-dark/80">{bioText}</p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <FilterPill active label="Today" />
          <FilterPill label="Weekly" />
          <FilterPill label="All Time" />
          <button type="button" className="flex h-11 w-11 items-center justify-center rounded-full bg-store-dark/5 text-store-dark/70">
            <CalendarDays size={19} />
          </button>
        </div>

        <div className="mt-5 flex gap-3 overflow-x-auto pb-2">
          {statusItems.map((item) => (
            <div key={item.label} className={`min-w-[150px] rounded-md p-4 shadow-sm ${item.className}`}>
              <p className="text-lg font-semibold">{item.label}</p>
              <p className="mt-1 text-sm opacity-90">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {workflowItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-md border border-primary-100 bg-store-cream p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-white text-primary-700 shadow-sm">
                  <Icon size={21} />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-store-dark">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-store-dark/65">{item.text}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-5 grid gap-3 text-sm font-semibold text-store-dark sm:grid-cols-3">
          <Metric icon={Sparkles} label="Featured" value={featuredCount} />
          <Metric icon={ShieldCheck} label="In stock" value={inStockCount} />
          <Metric icon={Truck} label="Categories" value={categories.length} />
        </div>
      </div>
    </section>
  );
}

function QuickIcon({ icon: Icon, label, to, href, external = false }) {
  const className = 'flex h-14 w-14 items-center justify-center rounded-md border border-store-dark/10 bg-white text-store-dark shadow-sm transition hover:-translate-y-1 hover:text-primary-700';
  const content = <Icon size={24} />;

  if (href) {
    return (
      <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined} className={className} aria-label={label}>
        {content}
      </a>
    );
  }

  return (
    <Link to={to} className={className} aria-label={label}>
      {content}
    </Link>
  );
}

function FilterPill({ label, active = false }) {
  return (
    <button
      type="button"
      className={`min-w-[104px] rounded-full px-5 py-2.5 text-sm font-semibold ${
        active ? 'bg-emerald-500 text-white' : 'border border-store-dark/20 bg-white text-store-dark'
      }`}
    >
      {label}
    </button>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-primary-100 bg-white p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-50 text-primary-700">
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xl font-semibold leading-tight">{value}</p>
        <p className="text-xs uppercase tracking-[0.14em] text-store-dark/50">{label}</p>
      </div>
    </div>
  );
}
