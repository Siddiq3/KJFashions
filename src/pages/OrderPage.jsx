import CartItem from '../components/cart/CartItem.jsx';
import OrderForm from '../components/order/OrderForm.jsx';
import { useCart } from '../hooks/useCart';
import { formatPrice } from '../utils/currency';

export default function OrderPage() {
  const { cartItems, cartTotal } = useCart();

  return (
    <div className="container-page py-10">
      <div className="mb-8">
        <h1 className="text-5xl font-semibold text-store-dark">Place Order</h1>
        <p className="mt-2 text-sm text-store-dark/65">Share your delivery details and confirm the order on WhatsApp.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_390px]">
        <OrderForm />
        <aside className="rounded-md border border-primary-100 bg-white p-5 shadow-sm">
          <h2 className="text-2xl font-semibold text-store-dark">Order Items</h2>
          <div className="mt-2">
            {cartItems.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>
          <div className="mt-5 flex justify-between border-t border-primary-100 pt-4">
            <span className="font-semibold text-store-dark">Total</span>
            <span className="text-xl font-bold text-primary-700">{formatPrice(cartTotal)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
