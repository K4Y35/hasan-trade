'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AddToCart } from '@/components/add-to-cart';
import { cartItemFromProduct } from '@/lib/cart';
import { formatPrice } from '@/lib/money';
import { isWishlisted, toggleWishlist } from '@/lib/saved';
import type { Product } from '@/lib/types';

export { formatPrice };

export function ProductCard({ product }: { product: Product }) {
  const variant = product.variants.find((item) => item.isDefault) ?? product.variants[0];
  const price = variant?.price ?? 0;
  const compare = variant?.compareAtPrice;
  const onSale = Boolean(compare && compare > price && price > 0);
  const savePct = onSale && compare ? Math.round(((compare - price) / compare) * 100) : 0;
  const inStock = product.inStock !== false && (product.stockQty ?? 1) > 0 && price > 0;
  const cartItem = cartItemFromProduct(product);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const sync = () => setSaved(isWishlisted(product.id));
    sync();
    window.addEventListener('shopstack-saved', sync);
    return () => window.removeEventListener('shopstack-saved', sync);
  }, [product.id]);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-card ring-1 ring-slate-200/80 transition duration-300 hover:shadow-lift hover:ring-sky-300 motion-safe:hover:-translate-y-1.5">
      <div className="shine-hover relative overflow-hidden bg-gradient-to-b from-slate-50 to-white px-5 pb-2 pt-5">
        <div className="absolute left-4 top-4 z-10 flex flex-col gap-1.5">
          {onSale ? (
            <span className="inline-flex w-fit rounded-full bg-[var(--color-secondary)] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white shadow-sm">
              {savePct > 0 ? `-${savePct}%` : 'Sale'}
            </span>
          ) : null}
          {!inStock && price > 0 ? (
            <span className="inline-flex w-fit rounded-full bg-slate-900/80 px-2.5 py-0.5 text-[11px] font-semibold text-white">
              Out of stock
            </span>
          ) : null}
        </div>
        <button
          type="button"
          aria-pressed={saved}
          aria-label={saved ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          className={`icon-pop absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full shadow-sm ring-1 transition duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] motion-safe:hover:scale-110 ${
            saved
              ? 'bg-red-50 text-[var(--color-secondary)] ring-red-100'
              : 'bg-white/95 text-slate-500 ring-slate-200 hover:text-[var(--color-secondary)]'
          }`}
          onClick={() => setSaved(toggleWishlist(product))}
        >
          <Heart size={17} fill={saved ? 'currentColor' : 'none'} />
        </button>
        <Link href={`/product/${product.slug}`} className="relative block">
          <div className="flex h-44 items-center justify-center">
            {product.images[0]?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.images[0].url}
                alt=""
                className={`max-h-full max-w-full object-contain transition duration-700 ease-out motion-safe:group-hover:scale-110 ${
                  inStock ? '' : 'opacity-70'
                }`}
              />
            ) : (
              <span className="text-sm text-slate-400">{product.name}</span>
            )}
          </div>
        </Link>
      </div>
      <div className="flex flex-1 flex-col px-5 pb-5 pt-1">
        {product.brand?.name ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{product.brand.name}</p>
        ) : null}
        <Link
          href={`/product/${product.slug}`}
          className="mt-1 line-clamp-2 min-h-12 text-[15px] font-medium leading-snug text-slate-900 transition hover:text-[var(--color-primary)]"
        >
          {product.name}
        </Link>
        <div className="mt-auto pt-4">
          {price > 0 ? (
            <p className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="text-lg font-semibold tracking-tight text-[var(--color-primary)]">{formatPrice(price)}</span>
              {onSale ? <span className="text-sm text-slate-400 line-through">{formatPrice(compare!)}</span> : null}
            </p>
          ) : (
            <p className="text-sm font-medium text-[var(--color-secondary)]">Call for price</p>
          )}
          {inStock ? <p className="mt-1 text-xs font-medium text-emerald-700">In stock</p> : null}
          {cartItem ? (
            <AddToCart compact disabled={!inStock} item={cartItem} />
          ) : null}
        </div>
      </div>
    </article>
  );
}
