'use client';

import { Expand, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Product } from '@/lib/types';

export function ProductGallery({ product, onSale }: { product: Product; onSale: boolean }) {
  const images = product.images.length ? product.images : [];
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const current = images[active] ?? images[0];

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
      if (event.key === 'ArrowRight') setActive((i) => (i + 1) % images.length);
      if (event.key === 'ArrowLeft') setActive((i) => (i - 1 + images.length) % images.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, images.length]);

  return (
    <div>
      <div className="group shine-hover relative overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-card">
        {onSale ? (
          <span className="absolute left-4 top-4 z-10 rounded-full bg-[var(--color-secondary)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
            Sale
          </span>
        ) : null}
        <button
          type="button"
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm transition duration-300 hover:bg-white motion-safe:hover:scale-110"
          onClick={() => current && setOpen(true)}
          aria-label="Zoom image"
        >
          <Expand size={16} />
        </button>
        <button
          type="button"
          className="flex min-h-[320px] w-full items-center justify-center p-8 md:min-h-[460px]"
          onClick={() => current && setOpen(true)}
          aria-label={current ? `View larger image of ${product.name}` : product.name}
        >
          {current?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={current.url} alt={current.alt ?? product.name} className="max-h-[420px] w-full object-contain transition duration-700 ease-out motion-safe:group-hover:scale-105" />
          ) : (
            <span className="text-slate-500">{product.name}</span>
          )}
        </button>
      </div>
      {images.length > 1 ? (
        <ul className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <li key={image.id}>
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-current={index === active}
                className={`flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border bg-white p-2 transition duration-300 ${
                  index === active ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20' : 'border-slate-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.url} alt={image.alt ?? `${product.name} ${index + 1}`} className="h-full w-full object-contain" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {open && current ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/80 p-4" role="dialog" aria-modal="true" aria-label="Product image">
          <button type="button" className="absolute inset-0 cursor-zoom-out" aria-label="Close zoom" onClick={() => setOpen(false)} />
          <button
            type="button"
            className="absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-800"
            onClick={() => setOpen(false)}
            aria-label="Close"
          >
            <X size={18} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={current.url} alt={current.alt ?? product.name} className="relative z-[1] max-h-[90vh] max-w-[90vw] object-contain" />
        </div>
      ) : null}
    </div>
  );
}
