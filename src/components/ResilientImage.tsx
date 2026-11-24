import React, { memo, useState } from 'react';
import { Layers } from 'lucide-react';

interface ResilientImageProps {
  src: string;
  alt: string;
  aspectClassName?: string;
  className?: string;
  fallbackTitle: string;
  priority?: boolean;
}

export const ResilientImage: React.FC<ResilientImageProps> = memo(function ResilientImage({
  src,
  alt,
  aspectClassName = 'aspect-video',
  className = '',
  fallbackTitle,
  priority = false,
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`${aspectClassName} ${className} theme-surface-muted border flex flex-col items-center justify-center p-6 text-center`}
      >
        <div className="w-11 h-11 rounded-lg theme-surface border flex items-center justify-center text-slate-500 dark:text-slate-300 mb-3">
          <Layers className="w-5 h-5" />
        </div>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200 max-w-xs">
          {fallbackTitle}
        </p>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setFailed(true)}
      className={`${aspectClassName} ${className}`}
    />
  );
});
