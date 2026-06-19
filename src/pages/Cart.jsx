import { Link } from 'react-router-dom';
import CartItem from '../components/cart/CartItem.jsx';
import CartSummary from '../components/cart/CartSummary.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { useCart } from '../hooks/useCart';

export default function Cart() {
  const { cartItems } = useCart();

  return (
    <div className="container-page py-10">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-5xl font-semibold text-store-dark">Cart</h1>
          <p className="mt-2 text-sm text-store-dark/65">Review your selections before placing a WhatsApp order.</p>
        </div>
        <Link to="/products" className="hidden text-sm font-semibold text-primary-700 hover:text-primary-500 sm:block">
          Continue Shopping
        </Link>
      </div>

      {cartItems.length === 0 ? (
        <EmptyState
          title="Your cart is empty"
          message="Add your favourite men's and kids' wear items and come back here to place an order."
        />
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="rounded-md border border-primary-100 bg-white px-5 shadow-sm">
            {cartItems.map((item) => (
              <CartItem key={item.key || `${item.id}-${item.size || 'default'}`} item={item} />
            ))}
          </div>
          <CartSummary />
        </div>
      )}
    </div>
  );
}
