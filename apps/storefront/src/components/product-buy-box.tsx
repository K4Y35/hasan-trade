'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, GitCompare, Heart, Minus, Plus, Share2, ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';
import { addToCart, cartItemFromProduct } from '@/lib/cart';
import { formatPrice } from '@/components/product-card';
import { warrantyLabel } from '@/lib/product-copy';
import { isCompared, isWishlisted, toggleCompare, toggleWishlist } from '@/lib/saved';
import { useStoreBranding } from '@/components/store-branding';
import type { Product } from '@/lib/types';

export function ProductBuyBox({
  product,
  price,
  compare,
  onSale,
}: {
  product: Product;
  price: number;
  compare: number | null | undefined;
  onSale: boolean;
}) {
  const branding = useStoreBranding();
  const router = useRouter();
  const variant = product.variants.find((item) => item.isDefault) ?? product.variants[0];
  const inStock = product.inStock !== false && (product.stockQty ?? 1) > 0 && price > 0;
  const maxQty = Math.max(1, Math.min(product.stockQty ?? 12, 20));
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [saved, setSaved] = useState(false);
  const [compared, setCompared] = useState(false);
  const [notice, setNotice] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setSaved(isWishlisted(product.id));
    setCompared(isCompared(product.id));
  }, [product.id]);

  const builtCartItem = cartItemFromProduct(product);
  const cartItem = builtCartItem ? { ...builtCartItem, price } : null;

  function add(quantity = qty) {
    if (!cartItem || !inStock) return;
    addToCart(cartItem, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  }

  const shareUrl = typeof window === 'undefined' ? '' : window.location.href;
  const shareText = encodeURIComponent(`${product.name} — ${branding.name}`);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {inStock ? (
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">In stock</span>
        ) : price <= 0 ? (
          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">Call for price</span>
        ) : (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">Out of stock</span>
        )}
        {product.brand ? (
          <Link href={`/shop?brand=${product.brand.slug}`} className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 hover:text-[var(--color-primary)]">
            {product.brand.name}
          </Link>
        ) : null}
      </div>

      <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">{product.name}</h1>

      <p className="mt-4 flex flex-wrap items-baseline gap-3">
        <span className="text-3xl font-semibold text-[var(--color-primary)]">{price > 0 ? formatPrice(price) : 'Call for price'}</span>
        {onSale && compare ? <span className="text-lg text-slate-400 line-through">{formatPrice(compare)}</span> : null}
        {onSale && compare ? (
          <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-[var(--color-secondary)]">
            Save {formatPrice(compare - price)}
          </span>
        ) : null}
      </p>

      {variant ? (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="inline-flex h-12 items-center rounded-full border border-slate-200 bg-white">
            <button
              type="button"
              className="flex h-12 w-12 items-center justify-center text-slate-600 disabled:opacity-40"
              onClick={() => setQty((n) => Math.max(1, n - 1))}
              disabled={qty <= 1}
              aria-label="Decrease quantity"
            >
              <Minus size={16} />
            </button>
            <input
              className="w-12 bg-transparent text-center text-sm font-semibold"
              type="number"
              min={1}
              max={maxQty}
              value={qty}
              aria-label={`${product.name} quantity`}
              onChange={(e) => setQty(Math.min(maxQty, Math.max(1, Number(e.target.value) || 1)))}
            />
            <button
              type="button"
              className="flex h-12 w-12 items-center justify-center text-slate-600 disabled:opacity-40"
              onClick={() => setQty((n) => Math.min(maxQty, n + 1))}
              disabled={qty >= maxQty}
              aria-label="Increase quantity"
            >
              <Plus size={16} />
            </button>
          </div>
          <button
            type="button"
            disabled={!inStock}
            className={`btn-primary inline-flex h-12 flex-1 items-center justify-center gap-2 ${added ? 'bg-emerald-600' : ''}`}
            onClick={() => add()}
          >
            {added ? (
              <>
                <Check size={16} /> Added
              </>
            ) : (
              <>
                <ShoppingBag size={16} /> {inStock ? 'Add to cart' : price <= 0 ? 'Call for price' : 'Out of stock'}
              </>
            )}
          </button>
          <button
            type="button"
            disabled={!inStock}
            className="btn-secondary inline-flex h-12 items-center justify-center px-5 disabled:opacity-50"
            onClick={() => {
              add();
              router.push('/checkout');
            }}
          >
            Buy now
          </button>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition duration-300 hover:-translate-y-0.5 ${
            saved ? 'border-red-200 bg-red-50 text-[var(--color-secondary)]' : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
          }`}
          onClick={() => setSaved(toggleWishlist(product))}
        >
          <Heart size={16} fill={saved ? 'currentColor' : 'none'} />
          {saved ? 'Wishlisted' : 'Add to wishlist'}
        </button>
        <button
          type="button"
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition duration-300 hover:-translate-y-0.5 ${
            compared ? 'border-blue-200 bg-blue-50 text-[var(--color-primary)]' : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
          }`}
          onClick={() => {
            const result = toggleCompare(product);
            setCompared(isCompared(product.id));
            setNotice(result.full ? 'Compare is limited to 4 products. Remove one first.' : '');
          }}
        >
          <GitCompare size={16} />
          {compared ? 'In compare' : 'Compare'}
        </button>
        {compared ? (
          <Link href="/compare" className="inline-flex items-center rounded-full px-2 py-2 text-sm font-medium text-[var(--color-primary)] hover:underline">
            View compare
          </Link>
        ) : null}
      </div>
      {notice ? <p className="mt-2 text-sm text-[var(--color-secondary)]">{notice}</p> : null}

      <div className="mt-5 flex flex-wrap gap-3">
        <a href={branding.phoneHref} className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)] hover:underline">
          Call {branding.phone}
        </a>
        <a href={branding.whatsappHref} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:underline">
          WhatsApp enquiry
        </a>
      </div>

      <dl className="mt-6 grid gap-2 text-sm text-slate-600">
        <div className="flex gap-2">
          <dt className="w-28 text-slate-400">SKU</dt>
          <dd>{variant?.sku ?? product.sku ?? '—'}</dd>
        </div>
        {product.categories.length ? (
          <div className="flex gap-2">
            <dt className="w-28 text-slate-400">Categories</dt>
            <dd className="flex flex-wrap gap-x-2">
              {product.categories.map((category, index) => (
                <span key={category.id}>
                  <Link href={`/shop?category=${category.slug}`} className="hover:text-[var(--color-primary)] hover:underline">
                    {category.name}
                  </Link>
                  {index < product.categories.length - 1 ? ',' : ''}
                </span>
              ))}
            </dd>
          </div>
        ) : null}
        {product.brand ? (
          <div className="flex gap-2">
            <dt className="w-28 text-slate-400">Brand</dt>
            <dd>
              <Link href={`/shop?brand=${product.brand.slug}`} className="hover:text-[var(--color-primary)] hover:underline">
                {product.brand.name}
              </Link>
            </dd>
          </div>
        ) : null}
        {warrantyLabel(product.warrantyMonths) ? (
          <div className="flex gap-2">
            <dt className="w-28 text-slate-400">Warranty</dt>
            <dd>{warrantyLabel(product.warrantyMonths)}</dd>
          </div>
        ) : null}
      </dl>

      <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-slate-500">
        <Share2 size={14} />
        <span>Share</span>
        <a
          className="rounded-full px-2 py-1 hover:bg-slate-100 hover:text-[var(--color-primary)]"
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
          target="_blank"
          rel="noreferrer"
        >
          Facebook
        </a>
        <a
          className="rounded-full px-2 py-1 hover:bg-slate-100 hover:text-emerald-700"
          href={`https://wa.me/?text=${shareText}%20${encodeURIComponent(shareUrl)}`}
          target="_blank"
          rel="noreferrer"
        >
          WhatsApp
        </a>
        <button
          type="button"
          className="rounded-full px-2 py-1 hover:bg-slate-100"
          onClick={async () => {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1400);
          }}
        >
          {copied ? 'Copied' : 'Copy link'}
        </button>
      </div>

      <div className="mt-6 grid gap-px overflow-hidden rounded-2xl bg-slate-200/80 shadow-lift sm:grid-cols-3">
        <p className="bg-white px-4 py-3 text-sm">
          <span className="font-semibold text-slate-900">Cash on delivery</span>
          <span className="mt-0.5 block text-slate-500">Pay when it arrives</span>
        </p>
        <p className="bg-white px-4 py-3 text-sm">
          <span className="font-semibold text-slate-900">Showroom pickup</span>
          <span className="mt-0.5 block text-slate-500">Mirabazar, Sylhet</span>
        </p>
        <p className="bg-white px-4 py-3 text-sm">
          <span className="font-semibold text-slate-900">After-sales</span>
          <span className="mt-0.5 block text-slate-500">Installation and servicing</span>
        </p>
      </div>

      <div className="fixed inset-x-0 bottom-20 z-40 border-t border-slate-200 bg-white/95 p-3 shadow-[0_-8px_24px_-16px_rgb(15_23_42/0.35)] backdrop-blur md:hidden">
        <div className="flex items-center gap-3">
          <p className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">{product.name}</span>
            <span className="font-semibold text-[var(--color-primary)]">{price > 0 ? formatPrice(price) : 'Call for price'}</span>
          </p>
          <button type="button" disabled={!inStock} className="btn-primary h-11 px-4 text-sm disabled:opacity-50" onClick={() => add()}>
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}
