const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse rounded-md bg-primary-100/80 ${className}`} />
);

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-md border border-primary-100 bg-white shadow-sm">
      <Skeleton className="aspect-[3/4] w-full rounded-none" />
      <div className="space-y-4 p-4">
        <Skeleton className="h-6 w-4/5" />
        <Skeleton className="h-5 w-2/5" />
        <Skeleton className="h-4 w-1/3" />
        <div className="flex gap-2">
          <Skeleton className="h-14 w-11" />
          <Skeleton className="h-14 w-11" />
          <Skeleton className="h-14 w-11" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 6 }) {
  return (
    <div
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
      aria-label="Loading products"
      aria-busy="true"
    >
      {Array.from({ length: count }, (_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="container-page py-10" aria-label="Loading product" aria-busy="true">
      <Skeleton className="mb-6 h-4 w-64" />
      <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="grid gap-4 md:grid-cols-[90px_1fr]">
          <div className="order-2 flex gap-3 md:order-1 md:flex-col">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-24 w-20 shrink-0" />
            ))}
          </div>
          <Skeleton className="order-1 aspect-[3/4] w-full md:order-2" />
        </div>
        <div className="rounded-md border border-primary-100 bg-white p-6 shadow-sm">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="mt-5 h-12 w-4/5" />
          <Skeleton className="mt-4 h-8 w-36" />
          <Skeleton className="mt-3 h-4 w-24" />
          <div className="mt-6 space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <Skeleton className="mt-6 h-4 w-28" />
          <div className="mt-3 flex gap-2">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-20 w-16" />
            ))}
          </div>
          <Skeleton className="mt-6 h-4 w-24" />
          <div className="mt-3 flex gap-2">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-9 w-12" />
            ))}
          </div>
          <div className="mt-7 flex gap-3">
            <Skeleton className="h-12 flex-1" />
            <Skeleton className="h-12 flex-1" />
          </div>
        </div>
      </div>
    </div>
  );
}
