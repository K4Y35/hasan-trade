'use client';

import Link from 'next/link';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { formatPrice } from '@/components/product-card';
import { readCart, removeFromCart, setCartQuantity } from '@/lib/cart';
import { useStoreBranding } from '@/components/store-branding';
import type { CartItem } from '@/lib/types';

export default function CartPage() {
  const branding = useStoreBranding();
  const [items, setItems] = useState<CartItem[]>([]);
  useEffect(() => {
    const sync = () => setItems(readCart());
    sync();
    window.addEventListener('shopstack-cart', sync);
    return () => window.removeEventListener('shopstack-cart', sync);
  }, []);

  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <p className="section-kicker">Your bag</p>
      <h1 className="section-title">Cart</h1>
      <p className="section-lede">
        {items.length
          ? `${count} ${count === 1 ? 'item' : 'items'} ready for cash-on-delivery checkout.`
          : 'Add products from the shop and they will show up here with quantity and totals.'}
      </p>

      {items.length === 0 ? (
        <section className="card mt-10 overflow-hidden">
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
              <ShoppingBag size={28} />
            </span>
            <h2 className="mt-5 text-2xl font-semibold tracking-tight">Your cart is empty</h2>
            <p className="mt-2 max-w-md text-slate-600">
              Browse air conditioners, cameras and appliances, then add what you need. You can pay when the order arrives.
            </p>
            <Link href="/shop" className="btn-primary mt-6 inline-flex items-center gap-2">
              Continue shopping <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <ul className="space-y-4">
            {items.map((item) => (
              <li key={item.variantId} className="card lift overflow-hidden">
                <article className="grid gap-4 p-4 sm:grid-cols-[112px_1fr] sm:p-5">
                  <Link
                    href={`/product/${item.slug}`}
                    className="group flex h-28 items-center justify-center rounded-2xl bg-gradient-to-b from-slate-50 to-white p-3"
                  >
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageUrl} alt="" className="max-h-full max-w-full object-contain transition duration-500 motion-safe:group-hover:scale-105" />
                    ) : (
                      <ShoppingBag size={22} className="text-slate-300" />
                    )}
                  </Link>
                  <div className="min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link href={`/product/${item.slug}`} className="font-medium leading-snug hover:text-[var(--color-primary)]">
                          {item.name}
                        </Link>
                        <p className="mt-1 text-xs text-slate-400">SKU {item.sku}</p>
                      </div>
                      <p className="shrink-0 text-base font-semibold text-[var(--color-primary)]">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{formatPrice(item.price)} each</p>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <div className="inline-flex h-10 items-center rounded-full border border-slate-200 bg-white">
                        <button
                          type="button"
                          className="flex h-10 w-10 items-center justify-center text-slate-600 disabled:opacity-40"
                          onClick={() => setItems(setCartQuantity(item.variantId, item.quantity - 1))}
                          disabled={item.quantity <= 1}
                          aria-label={`Decrease quantity of ${item.name}`}
                        >
                          <Minus size={14} />
                        </button>
                        <input
                          className="w-10 bg-transparent text-center text-sm font-semibold"
                          type="number"
                          min={1}
                          value={item.quantity}
                          aria-label={`${item.name} quantity`}
                          onChange={(e) => setItems(setCartQuantity(item.variantId, Number(e.target.value) || 1))}
                        />
                        <button
                          type="button"
                          className="flex h-10 w-10 items-center justify-center text-slate-600"
                          onClick={() => setItems(setCartQuantity(item.variantId, item.quantity + 1))}
                          aria-label={`Increase quantity of ${item.name}`}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-[var(--color-secondary)]"
                        onClick={() => setItems(removeFromCart(item.variantId))}
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    </div>
                  </div>
                </article>
              </li>
            ))}
          </ul>

          <aside className="card sticky top-28 p-6">
            <h2 className="text-lg font-semibold tracking-tight">Order summary</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between text-slate-600">
                <dt>Subtotal</dt>
                <dd className="font-medium text-slate-900">{formatPrice(total)}</dd>
              </div>
              <div className="flex justify-between text-slate-600">
                <dt>Delivery</dt>
                <dd className="font-medium text-emerald-700">Cash on delivery</dd>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-3 text-base">
                <dt className="font-semibold">Total</dt>
                <dd className="font-semibold text-[var(--color-primary)]">{formatPrice(total)}</dd>
              </div>
            </dl>
            <Link href="/checkout" className="btn-primary mt-6 flex w-full items-center justify-center gap-2">
              Checkout <ArrowRight size={16} />
            </Link>
            <Link href="/shop" className="mt-3 flex w-full items-center justify-center rounded-full py-2 text-sm font-medium text-slate-600 hover:text-[var(--color-primary)]">
              Continue shopping
            </Link>
            <p className="mt-4 text-xs leading-relaxed text-slate-500">
              Pay when your order arrives. For installation or a quote, call {branding.phone}.
            </p>
          </aside>
        </div>
      )}
    </main>
  );
}
