'use client';

import { useEffect, useState } from 'react';
import { mediaUrl } from '@/lib/media';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
const FALLBACK = '/samples/logo.png';

export function BrandLogo({
  height = 40,
  onDark = false,
  className = '',
}: {
  height?: number;
  onDark?: boolean;
  className?: string;
}) {
  const [src, setSrc] = useState(FALLBACK);
  const [name, setName] = useState('Hasan Trade Electronics');

  useEffect(() => {
    fetch(`${API}/v1/settings`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const url = mediaUrl(data?.store?.logoUrl) || FALLBACK;
        setSrc(url);
        if (data?.store?.name) setName(data.store.name);
      })
      .catch(() => undefined);
  }, []);

  return (
    <span className={`inline-flex items-center justify-center ${onDark ? 'w-full rounded-xl bg-white p-2.5' : ''} ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={name} style={{ height }} className="w-auto max-w-full object-contain" />
    </span>
  );
}
