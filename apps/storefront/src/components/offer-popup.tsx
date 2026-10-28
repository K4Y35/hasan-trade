'use client';

import { X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import type { StoreSettings } from '@/lib/types';

type Popup = NonNullable<StoreSettings['store']['popup']>;

function storageKey(version: string) {
  return `shopstack_offer_${version || 'current'}`;
}

export function safeOfferHref(url?: string | null) {
  const trimmed = url?.trim() ?? '';
  if (!trimmed) return null;
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return null;
}

export function OfferPopup({ store }: { store: StoreSettings['store'] | null }) {
  const pathname = usePathname();
  const popup = store?.popup;
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  const skip = pathname.startsWith('/checkout');
  const hasContent = Boolean(popup?.imageUrl || popup?.title?.trim() || popup?.body?.trim());
  const version = popup?.version ?? '';

  useEffect(() => {
    if (!popup?.enabled || !hasContent || skip) {
      setOpen(false);
      return;
    }
    try {
      if (window.localStorage.getItem(storageKey(version)) === '1') return;
    } catch {
      /* ignore private-mode storage */
    }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = window.setTimeout(() => setOpen(true), reduced ? 0 : 700);
    return () => window.clearTimeout(timer);
  }, [popup?.enabled, hasContent, skip, version]);

  function dismiss() {
    try {
      window.localStorage.setItem(storageKey(version), '1');
    } catch {
      /* ignore */
    }
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') dismiss();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, version]);

  if (!open || !popup?.enabled || !hasContent) return null;

  const href = safeOfferHref(popup.ctaUrl);
  const label = popup.ctaLabel?.trim() || (href ? 'Shop now' : '');
  const heading = popup.title?.trim() || 'Special offer';

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-slate-950/70" aria-label="Dismiss special offer" onClick={dismiss} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-[1] w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl motion-safe:animate-[offer-in_0.28s_ease-out]"
      >
        <button
          ref={closeRef}
          type="button"
          className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-white"
          onClick={dismiss}
          aria-label="Close special offer"
        >
          <X size={18} />
        </button>
        {popup.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={popup.imageUrl}
            alt={popup.title?.trim() || 'Special offer'}
            className="max-h-[70vh] w-full bg-slate-50 object-contain"
          />
        ) : null}
        {popup.title?.trim() || popup.body?.trim() || (href && label) ? (
          <div className="space-y-3 p-6">
            <h2 id={titleId} className="pr-10 text-xl font-semibold text-[var(--color-ink)]">
              {heading}
            </h2>
            {popup.body?.trim() ? (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{popup.body}</p>
            ) : null}
            {href && label ? (
              <a href={href} className="btn-primary w-full" onClick={dismiss}>
                {label}
              </a>
            ) : null}
          </div>
        ) : (
          <h2 id={titleId} className="sr-only">
            {heading}
          </h2>
        )}
      </div>
    </div>
  );
}
