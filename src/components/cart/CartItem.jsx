import { Minus, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../utils/currency';
import { optimizeImageUrl } from '../../utils/image';

export default function CartItem({ item }) {
  const { removeFromCart, updateQty } = useCart();

  return (
    <div className="flex gap-4 border-b border-primary-100 py-4">
      <Link to={`/products/${item.slug}`} className="h-24 w-20 shrink-0 overflow-hidden rounded-md bg-primary-50">
        {item.image ? (
          <img
            src={optimizeImageUrl(item.image)}
            alt={item.name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : null}
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <Link to={`/products/${item.slug}`} className="font-semibold leading-5 text-store-dark hover:text-primary-700">
            {item.name}
          </Link>
          <button
            type="button"
            onClick={() => removeFromCart(item.id)}
            className="rounded-full p-1 text-store-dark/45 transition hover:bg-primary-50 hover:text-primary-700"
            aria-label={`Remove ${item.name}`}
          >
            <Trash2 size={17} />
          </button>
        </div>
        <p className="mt-1 text-sm font-semibold text-primary-700">{formatPrice(item.price)}</p>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center rounded-md border border-primary-100 bg-white">
            <button
              type="button"
              onClick={() => updateQty(item.id, item.qty - 1)}
              className="p-2 text-store-dark/70 transition hover:text-primary-700"
              aria-label="Decrease quantity"
            >
              <Minus size={15} />
            </button>
            <span className="w-9 text-center text-sm font-semibold">{item.qty}</span>
            <button
              type="button"
              onClick={() => updateQty(item.id, item.qty + 1)}
              className="p-2 text-store-dark/70 transition hover:text-primary-700"
              aria-label="Increase quantity"
            >
              <Plus size={15} />
            </button>
          </div>
          <span className="text-sm font-bold text-store-dark">{formatPrice(item.price * item.qty)}</span>
        </div>
      </div>
    </div>
  );
}
