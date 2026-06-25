import { useEffect, useState } from 'react';
import { optimizeImageUrl } from '../../utils/image';

function VariantImage({ variant }) {
  const [loaded, setLoaded] = useState(false);
  const image = variant.previews?.[0] || variant.images?.[0];

  useEffect(() => {
    setLoaded(false);
  }, [image]);

  if (!image) {
    return (
      <span className="flex h-full items-center justify-center px-1 text-center text-[10px] font-semibold text-store-dark">
        {variant.color}
      </span>
    );
  }

  return (
    <>
      {!loaded && <span className="absolute inset-0 animate-pulse bg-store-dark/10" />}
      <img
        src={image.startsWith('data:') ? image : optimizeImageUrl(image)}
        alt=""
        loading={image.startsWith('data:') ? 'eager' : 'lazy'}
        fetchPriority="low"
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={`h-full w-full object-cover transition-opacity duration-200 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </>
  );
}

export default function ColorSelector({ variants, selectedVariantId, onSelect, compact = false }) {
  if (!Array.isArray(variants) || variants.length <= 1) return null;
  const selectedVariant = variants.find((variant) => variant.id === selectedVariantId) || variants[0];

  return (
    <div className={compact ? 'mt-3' : 'mt-5'}>
      <p className={`${compact ? 'text-xs' : 'text-sm'} font-semibold text-store-dark`}>
        Selected: <span className="text-store-dark/60">{selectedVariant.color}</span>
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {variants.map((variant) => (
          <button
            key={variant.id || variant.color}
            type="button"
            onClick={() => onSelect(variant)}
            title={variant.color}
            aria-label={`Select ${variant.color}`}
            aria-pressed={selectedVariant.id === variant.id}
            className={`relative overflow-hidden rounded-md border-2 bg-white transition ${
              compact ? 'h-14 w-11' : 'h-20 w-16'
            } ${
              selectedVariant.id === variant.id
                ? 'border-store-dark shadow-md ring-2 ring-primary-200'
                : 'border-primary-100 hover:border-store-dark/50'
            }`}
          >
            <VariantImage variant={variant} />
          </button>
        ))}
      </div>
    </div>
  );
}
