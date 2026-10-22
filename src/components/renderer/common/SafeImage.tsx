import React, { useState } from 'react';
import { isSafeUrl } from '../../../../server/validator';
import { Image as ImageIcon } from 'lucide-react';

interface SafeImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackIcon?: React.ComponentType<{ className?: string }>;
  aspectRatio?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  className = '',
  fallbackIcon: FallbackIcon = ImageIcon,
  aspectRatio = 'aspect-16/10',
}) => {
  const [hasError, setHasError] = useState(false);
  const isValidUrl = src && typeof src === 'string' && isSafeUrl(src);

  if (!isValidUrl || hasError) {
    return (
      <div
        className={`${aspectRatio} w-full rounded-xl bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200/80 border border-slate-200/80 flex flex-col items-center justify-center p-4 text-center select-none overflow-hidden ${className}`}
        aria-label={alt}
        role="img"
      >
        <div className="w-10 h-10 rounded-full bg-white/80 border border-slate-200 shadow-2xs flex items-center justify-center text-slate-400 mb-2">
          <FallbackIcon className="w-5 h-5" />
        </div>
        <span className="text-xs font-medium text-slate-600 max-w-[80%] truncate">
          {alt || 'Image Preview'}
        </span>
        <span className="text-[10px] text-slate-400 font-mono mt-0.5">Asset Placeholder</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setHasError(true)}
      className={`${aspectRatio} w-full object-cover rounded-xl ${className}`}
    />
  );
};
