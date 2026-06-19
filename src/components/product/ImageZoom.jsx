import { useState } from 'react';
import { optimizeImageUrl } from '../../utils/image';

export default function ImageZoom({ src, alt }) {
  const [position, setPosition] = useState({ x: 50, y: 50 });

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
      className="group aspect-[3/4] overflow-hidden rounded-md bg-primary-50"
    >
      <img
        src={optimizeImageUrl(src)}
        alt={alt}
        loading="lazy"
        className="h-full w-full object-cover transition duration-300 group-hover:scale-150"
        style={{ transformOrigin: `${position.x}% ${position.y}%` }}
      />
    </div>
  );
}
