import { RefreshCw } from 'lucide-react';

export default function ErrorState({ title = 'Something went wrong', message, onRetry }) {
  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-xl rounded-md border border-primary-100 bg-white p-8 text-center shadow-soft">
        <h2 className="text-3xl font-semibold text-store-dark">{title}</h2>
        <p className="mt-3 text-sm leading-6 text-store-dark/70">
          {message || 'We could not load this section. Please check the data URL and try again.'}
        </p>
        {onRetry && (
          <button type="button" onClick={onRetry} className="btn-primary mt-6">
            <RefreshCw size={18} />
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
