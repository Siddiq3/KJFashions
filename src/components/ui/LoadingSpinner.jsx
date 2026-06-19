export default function LoadingSpinner({ label = 'Loading' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-primary-700">
      <div className="relative h-12 w-12">
        <span className="absolute inset-0 animate-ping rounded-full border-2 border-primary-500 opacity-50" />
        <span className="absolute inset-2 rounded-full border-2 border-primary-600 border-t-transparent animate-spin" />
      </div>
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}
