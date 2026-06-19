import CartItem from '../components/cart/CartItem.jsx';
import OrderForm from '../components/order/OrderForm.jsx';
import { useCart } from '../hooks/useCart';
import { formatPrice } from '../utils/currency';
import { clearDirectOrder, readDirectOrder } from '../utils/directOrder';
import { useSearchParams } from 'react-router-dom';

export default function OrderPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const [searchParams] = useSearchParams();
  const directItems = readDirectOrder();
  const isBuyNow = searchParams.get('buyNow') === '1';
  const orderItems = isBuyNow ? directItems : cartItems;
  const orderTotal = isBuyNow
    ? directItems.reduce((total, item) => total + item.price * item.qty, 0)
    : cartTotal;
  const emptyMessage = isBuyNow
    ? 'Choose Buy Now from a product page to place a direct order.'
    : 'Add men\'s or kids\' wear items to your cart before placing an order.';

  const handleOrderComplete = () => {
    if (isBuyNow) {
      clearDirectOrder();
      return;
    }

    clearCart();
  };

  return (
    <div className="container-page py-10">
      <div className="mb-8">
        <h1 className="text-5xl font-semibold text-store-dark">Place Order</h1>
        <p className="mt-2 text-sm text-store-dark/65">Share your delivery details and confirm the order on WhatsApp.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_390px]">
        <OrderForm
          orderItems={orderItems}
          orderTotal={orderTotal}
          onOrderComplete={handleOrderComplete}
          emptyMessage={emptyMessage}
        />
        <aside className="rounded-md border border-primary-100 bg-white p-5 shadow-sm">
          <h2 className="text-2xl font-semibold text-store-dark">{isBuyNow ? 'Buy Now Item' : 'Order Items'}</h2>
          <div className="mt-2">
            {orderItems.map((item) => (
              <CartItem key={item.key || `${item.id}-${item.size || 'default'}`} item={item} readOnly />
            ))}
          </div>
          <div className="mt-5 flex justify-between border-t border-primary-100 pt-4">
            <span className="font-semibold text-store-dark">Total</span>
            <span className="text-xl font-bold text-primary-700">{formatPrice(orderTotal)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
