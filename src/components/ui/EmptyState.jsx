import { ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmptyState({
  title = 'Nothing here yet',
  message = 'Try changing your filters or continue shopping.',
  actionLabel = 'Continue Shopping',
  actionTo = '/products',
}) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-md border border-dashed border-primary-100 bg-white/70 p-8 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-50 text-primary-600">
        <ShoppingBag size={34} />
      </div>
      <h2 className="mt-5 text-3xl font-semibold text-store-dark">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-store-dark/65">{message}</p>
      <Link to={actionTo} className="btn-primary mt-6">
        {actionLabel}
      </Link>
    </div>
  );
}
