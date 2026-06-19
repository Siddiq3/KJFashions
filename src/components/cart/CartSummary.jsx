import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../utils/currency';

export default function CartSummary({ onOrderClick }) {
  const { cartCount, cartTotal } = useCart();

  return (
    <div className="rounded-md border border-primary-100 bg-white p-5 shadow-sm">
      <h2 className="text-2xl font-semibold text-store-dark">Cart Summary</h2>
      <div className="mt-5 space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-store-dark/65">Items</span>
          <span className="font-semibold">{cartCount}</span>
        </div>
        <div className="flex justify-between border-t border-primary-100 pt-3">
          <span className="text-store-dark/65">Subtotal</span>
          <span className="text-lg font-bold text-primary-700">{formatPrice(cartTotal)}</span>
        </div>
      </div>
      <Link to="/order" onClick={onOrderClick} className="btn-primary mt-6 w-full">
        Place Order
      </Link>
      <Link to="/products" className="btn-secondary mt-3 w-full">
        Continue Shopping
      </Link>
    </div>
  );
}
