'use client';

import Link from 'next/link';
import { ArrowRight, Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AddToCart } from '@/components/add-to-cart';
import { formatPrice } from '@/components/product-card';
import { cartItemFromProduct } from '@/lib/cart';
import { clearWishlist, readWishlist, removeWishlist, toggleWishlist } from '@/lib/saved';
import type { Product } from '@/lib/types';

export default function WishlistPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [undo, setUndo] = useState<Product[] | null>(null);

  useEffect(() => {
    const sync = () => setItems(readWishlist());
    sync();
    window.addEventListener('shopstack-saved', sync);
    return () => window.removeEventListener('shopstack-saved', sync);
  }, []);

  useEffect(() => {
    if (!undo) return;
    const timer = window.setTimeout(() => setUndo(null), 6000);
    return () => window.clearTimeout(timer);
  }, [undo]);

  function removeOne(product: Product) {
    removeWishlist(product.id);
    setUndo([product]);
  }

  function clearAll() {
    if (!items.length) return;
    setUndo(items);
    clearWishlist();
  }

  function restore() {
    undo?.forEach((product) => {
      if (!readWishlist().some((item) => item.id === product.id)) toggleWishlist(product);
    });
    setUndo(null);
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 md:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="section-kicker">Saved for later</p>
          <h1 className="section-title">Wishlist</h1>
          <p className="section-lede">
            {items.length
              ? `${items.length} ${items.length === 1 ? 'product' : 'products'} waiting when you are ready to buy.`
              : 'Keep the models you like here, then add them to your cart in one tap.'}
          </p>
        </div>
        {items.length ? (
          <button type="button" className="text-sm font-medium text-slate-500 hover:text-[var(--color-secondary)]" onClick={clearAll}>
            Clear wishlist
          </button>
        ) : null}
      </div>

      {items.length === 0 ? (
        <section className="card mt-10 overflow-hidden">
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-[var(--color-secondary)]">
              <Heart size={28} />
            </span>
            <h2 className="mt-5 text-2xl font-semibold tracking-tight">Your wishlist is empty</h2>
            <p className="mt-2 max-w-md text-slate-600">
              Tap the heart on any product to save it here. It is a handy way to compare air conditioners, cameras and appliances before you buy.
            </p>
            <Link href="/shop" className="btn-primary mt-6 inline-flex items-center gap-2">
              Browse products <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      ) : (
        <ul className="mt-8 space-y-4">
          {items.map((product) => {
            const variant = product.variants.find((item) => item.isDefault) ?? product.variants[0];
            const price = variant?.price ?? 0;
            const compare = variant?.compareAtPrice;
            const onSale = Boolean(compare && compare > price && price > 0);
            const inStock = product.inStock !== false && (product.stockQty ?? 1) > 0 && price > 0;
            const cartItem = cartItemFromProduct(product);
            return (
              <li key={product.id} className="card lift overflow-hidden">
                <article className="grid gap-4 p-4 sm:grid-cols-[140px_1fr_auto] sm:items-center sm:p-5">
                  <Link
                    href={`/product/${product.slug}`}
                    className="group flex h-32 items-center justify-center rounded-2xl bg-gradient-to-b from-slate-50 to-white p-3 sm:h-28"
                  >
                    {product.images[0]?.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.images[0].url} alt="" className="max-h-full max-w-full object-contain transition duration-500 motion-safe:group-hover:scale-105" />
                    ) : (
                      <Heart size={20} className="text-slate-300" />
                    )}
                  </Link>
                  <div className="min-w-0">
                    {product.brand?.name ? (
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{product.brand.name}</p>
                    ) : null}
                    <Link href={`/product/${product.slug}`} className="mt-1 block font-medium leading-snug hover:text-[var(--color-primary)]">
                      {product.name}
                    </Link>
                    <p className="mt-2 flex flex-wrap items-baseline gap-2">
                      {price > 0 ? (
                        <>
                          <span className="text-lg font-semibold text-[var(--color-primary)]">{formatPrice(price)}</span>
                          {onSale ? <span className="text-sm text-slate-400 line-through">{formatPrice(compare!)}</span> : null}
                        </>
                      ) : (
                        <span className="text-sm font-medium text-[var(--color-secondary)]">Call for price</span>
                      )}
                    </p>
                    <p className={`mt-1 text-xs font-medium ${inStock ? 'text-emerald-700' : 'text-slate-500'}`}>
                      {inStock ? 'In stock · Ready to add to cart' : price <= 0 ? 'Call the showroom for pricing' : 'Currently out of stock'}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 sm:w-44">
                    {cartItem ? <AddToCart compact disabled={!inStock} item={cartItem} /> : null}
                    <Link
                      href={`/product/${product.slug}`}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      <ShoppingBag size={15} /> View product
                    </Link>
                    <button
                      type="button"
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-full text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-[var(--color-secondary)]"
                      onClick={() => removeOne(product)}
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      )}

      {undo?.length ? (
        <div
          role="status"
          className="fixed bottom-5 left-1/2 z-40 flex w-[min(36rem,calc(100%-2rem))] -translate-x-1/2 items-center justify-between gap-3 rounded-2xl bg-slate-900 px-4 py-3 text-sm text-white shadow-lift"
        >
          <p>{undo.length > 1 ? 'Wishlist cleared.' : `${undo[0].name} removed.`}</p>
          <button type="button" className="shrink-0 font-semibold text-[var(--color-accent)] hover:underline" onClick={restore}>
            Undo
          </button>
        </div>
      ) : null}
    </main>
  );
}
