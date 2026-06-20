import { Facebook, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '../../assets/kj-logo.svg';
import { normalizeWhatsAppNumber } from '../../utils/whatsapp';
import WhatsAppIcon from '../ui/WhatsAppIcon.jsx';

export default function Footer() {
  const year = new Date().getFullYear();
  const whatsappNumber = normalizeWhatsAppNumber(import.meta.env.VITE_WHATSAPP_NUMBER);
  const developerInstagram = 'siddiqkolimi';
  const developerInstagramUrl = `https://www.instagram.com/${developerInstagram}`;

  return (
    <footer className="mt-16 bg-store-dark text-white">
      <div className="container-page grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-4">
            <img src={logo} alt=" Khwaja Textiles and Readymades" className="h-16 w-16 rounded-full bg-white object-contain p-1" />
            <h2 className="text-3xl font-semibold"> Khwaja Textiles & Readymades</h2>
          </div>
          <p className="mt-3 max-w-sm text-sm leading-6 text-white/70">
            Men's and kids' readymade clothing with quick ordering over WhatsApp.
          </p>
          <p className="mt-5 text-sm text-white/70">Made with ❤️ in India</p>
        </div>

        <div>
          <h3 className="text-base font-semibold">Shop</h3>
          <div className="mt-4 flex flex-col gap-3 text-sm text-white/70">
            <Link to="/products" className="hover:text-white">Products</Link>
            <Link to="/about" className="hover:text-white">About</Link>
            <Link to="/contact" className="hover:text-white">Contact</Link>
            <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link to="/admin" className="hover:text-white">Admin Panel</Link>
          </div>
        </div>

        <div>
          <h3 className="text-base font-semibold">Follow</h3>
          <div className="mt-4 flex gap-3">
            <a href={developerInstagramUrl} target="_blank" rel="noopener noreferrer" className="rounded-full bg-white/10 p-2 transition hover:bg-white/20" aria-label="Instagram">
              <Instagram size={19} />
            </a>
            <button
              type="button"
              onClick={() => whatsappNumber && window.open(`https://wa.me/${whatsappNumber}`, '_blank', 'noopener,noreferrer')}
              className="rounded-full bg-white/10 p-2 transition hover:bg-white/20"
              aria-label="WhatsApp"
            >
              <WhatsAppIcon size={19} />
            </button>
            <a href="https://facebook.com" className="rounded-full bg-white/10 p-2 transition hover:bg-white/20" aria-label="Facebook">
              <Facebook size={19} />
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs leading-6 text-white/55">
        <p>Copyright © {year}  Khwaja Textiles & Readymades. All rights reserved.</p>
        <p>
          Developed by{' '}
          <a href={developerInstagramUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-white/75 transition hover:text-white">
            Siddiq Kolimi
          </a>
        </p>
      </div>
    </footer>
  );
}
