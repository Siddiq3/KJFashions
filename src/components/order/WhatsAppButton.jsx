import { motion } from 'framer-motion';
import { normalizeWhatsAppNumber } from '../../utils/whatsapp';
import WhatsAppIcon from '../ui/WhatsAppIcon.jsx';

export default function WhatsAppButton() {
  const number = normalizeWhatsAppNumber(import.meta.env.VITE_WHATSAPP_NUMBER);

  if (!number) return null;

  return (
    <motion.a
      href={`https://wa.me/${number}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      initial={{ opacity: 0, scale: 0.82, y: 16 }}
      animate={{
        opacity: 1,
        scale: [1, 1.05, 1],
        y: 0,
        rotate: [0, -5, 5, -3, 0],
      }}
      transition={{
        opacity: { duration: 0.25 },
        y: { duration: 0.25 },
        scale: { duration: 2.3, repeat: Infinity, repeatDelay: 2.2, ease: 'easeInOut' },
        rotate: { duration: 2.3, repeat: Infinity, repeatDelay: 2.2, ease: 'easeInOut' },
      }}
      whileHover={{ scale: 1.12, y: -4 }}
      whileTap={{ scale: 0.94 }}
      className="fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-white shadow-soft transition-colors hover:bg-green-700"
    >
      <motion.span
        aria-hidden="true"
        className="absolute inset-0 rounded-full bg-green-500/35"
        animate={{ scale: [1, 1.45], opacity: [0.5, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
      />
      <WhatsAppIcon size={28} className="relative z-10" />
    </motion.a>
  );
}
