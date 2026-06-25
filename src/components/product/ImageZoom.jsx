import { useEffect, useState } from 'react';
import { optimizeImageUrl } from '../../utils/image';

export default function ImageZoom({ src, alt }) {
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [src]);

  const handleMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setPosition({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <div
      onMouseMove={handleMove}
      className="group relative aspect-[3/4] overflow-hidden rounded-md bg-primary-50"
    >
      {!loaded && <div className="absolute inset-0 animate-pulse bg-primary-100/80" aria-hidden="true" />}
      <img
        src={optimizeImageUrl(src)}
        alt={alt}
        loading="eager"
        fetchPriority="high"
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={`h-full w-full object-cover transition duration-300 group-hover:scale-150 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ transformOrigin: `${position.x}% ${position.y}%` }}
      />
    </div>
  );
}
