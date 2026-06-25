import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import CartItem from './CartItem.jsx';
import CartSummary from './CartSummary.jsx';
import EmptyState from '../ui/EmptyState.jsx';

export default function CartDrawer({ open, onClose }) {
  const { cartItems } = useCart();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-store-dark/45"
          />
          <motion.aside
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 420 }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-store-cream shadow-soft"
          >
            <div className="flex items-center justify-between border-b border-primary-100 bg-white px-5 py-4">
              <h2 className="text-2xl font-semibold">Your Cart</h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full bg-primary-50 p-2 text-store-dark"
                aria-label="Close cart"
              >
                <X size={20} />
              </button>
            </div>

            {cartItems.length === 0 ? (
              <div className="flex flex-1 items-center p-5">
                <EmptyState
                  title="Your cart is empty"
                  message="Browse men's and kids' wear and add your favourites before placing a WhatsApp order."
                />
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-5">
                  {cartItems.map((item) => (
                    <CartItem
                      key={item.key || `${item.id}-${item.size || 'default'}`}
                      item={item}
                      onNavigate={onClose}
                    />
                  ))}
                </div>
                <div className="border-t border-primary-100 bg-white p-5">
                  <CartSummary onOrderClick={onClose} />
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
