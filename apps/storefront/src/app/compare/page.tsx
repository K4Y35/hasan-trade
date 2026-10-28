'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AddToCart } from '@/components/add-to-cart';
import { formatPrice } from '@/components/product-card';
import { cartItemFromProduct } from '@/lib/cart';
import { clearCompare, readCompare, removeCompared } from '@/lib/saved';
import { warrantyLabel } from '@/lib/product-copy';
import type { Product } from '@/lib/types';

export default function ComparePage() {
  const [items, setItems] = useState<Product[]>([]);
  useEffect(() => {
    const sync = () => setItems(readCompare());
    sync();
    window.addEventListener('shopstack-saved', sync);
    return () => window.removeEventListener('shopstack-saved', sync);
  }, []);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <p className="section-kicker">Side by side</p>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="section-title">Compare products</h1>
        {items.length ? (
          <button type="button" className="text-sm text-slate-500 hover:text-[var(--color-secondary)]" onClick={clearCompare}>
            Clear all
          </button>
        ) : null}
      </div>
      {items.length === 0 ? (
        <p className="mt-6 text-slate-600">
          No products in compare yet. Open a product and choose Compare.{' '}
          <Link href="/shop" className="font-semibold text-[var(--color-primary)]">
            Browse the shop
          </Link>
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="min-w-[720px] w-full border-separate border-spacing-0 overflow-hidden rounded-3xl bg-white text-sm shadow-card">
            <thead>
              <tr>
                <th className="w-36 border-b border-slate-100 px-4 py-4 text-left text-slate-400"> </th>
                {items.map((item) => {
                  const variant = item.variants[0];
                  const price = variant?.price ?? 0;
                  return (
                    <th key={item.id} className="border-b border-l border-slate-100 px-4 py-4 text-left align-top font-medium">
                      <Link href={`/product/${item.slug}`} className="block">
                        <div className="flex h-28 items-center justify-center rounded-2xl bg-slate-50 p-3">
                          {item.images[0]?.url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.images[0].url} alt={item.name} className="max-h-24 object-contain" />
                          ) : null}
                        </div>
                        <span className="mt-3 block hover:text-[var(--color-primary)]">{item.name}</span>
                      </Link>
                      <p className="mt-2 font-semibold text-[var(--color-primary)]">{price > 0 ? formatPrice(price) : 'Call for price'}</p>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {[
                ['Brand', (item: Product) => item.brand?.name ?? '—'],
                ['SKU', (item: Product) => item.variants[0]?.sku ?? item.sku ?? '—'],
                ['Stock', (item: Product) => (item.inStock === false ? 'Out of stock' : 'In stock')],
                ['Warranty', (item: Product) => warrantyLabel(item.warrantyMonths) ?? '—'],
                ['Category', (item: Product) => item.categories.map((c) => c.name).join(', ') || '—'],
              ].map(([label, value]) => (
                <tr key={String(label)}>
                  <th className="border-b border-slate-100 bg-slate-50 px-4 py-3 text-left font-medium text-slate-500">{label as string}</th>
                  {items.map((item) => (
                    <td key={item.id} className="border-b border-l border-slate-100 px-4 py-3">
                      {(value as (item: Product) => string)(item)}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <th className="bg-slate-50 px-4 py-4 text-left font-medium text-slate-500">Actions</th>
                {items.map((item) => {
                  const payload = cartItemFromProduct(item);
                  const price = payload?.price ?? 0;
                  return (
                    <td key={item.id} className="border-l border-slate-100 px-4 py-4 align-top">
                      {payload ? (
                        <AddToCart
                          compact
                          disabled={price <= 0 || item.inStock === false}
                          item={payload}
                        />
                      ) : null}
                      <button
                        type="button"
                        className="mt-2 text-sm text-slate-500 hover:text-[var(--color-secondary)]"
                        onClick={() => removeCompared(item.id)}
                      >
                        Remove
                      </button>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
