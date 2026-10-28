'use client';

import { Package } from 'lucide-react';
import { useState } from 'react';
import { mediaUrl } from '@/lib/media';

export function ProductThumb({
  url,
  alt,
  size = 'md',
}: {
  url?: string | null;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const src = mediaUrl(url);
  const [failed, setFailed] = useState(false);
  const box = size === 'lg' ? 'h-28 w-full' : size === 'sm' ? 'h-10 w-10' : 'h-14 w-14';
  const showImage = Boolean(src) && !failed;
  return (
    <span className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-50 ring-1 ring-slate-100 ${box}`}>
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt ?? ''}
          className="max-h-full max-w-full object-contain p-1"
          onError={() => setFailed(true)}
        />
      ) : (
        <Package size={size === 'lg' ? 22 : 16} className="text-slate-300" aria-hidden="true" />
      )}
    </span>
  );
}
