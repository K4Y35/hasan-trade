'use client';

import { useMemo, useState } from 'react';
import { ProductCard } from '@/components/product-card';
import type { CategoryRow, Product } from '@/lib/types';

export function NewArrivals({ featured, rows }: { featured: Product[]; rows: CategoryRow[] }) {
  const tabs = useMemo(() => {
    const withProducts = rows.filter((row) => row.products.length);
    return [{ slug: 'all', title: 'All', products: featured }, ...withProducts];
  }, [featured, rows]);
  const [active, setActive] = useState(tabs[0]?.slug ?? 'all');
  const current = tabs.find((t) => t.slug === active) ?? tabs[0];

  if (!tabs.length || !(current?.products.length || featured.length)) return null;

  return (
    <section className="bg-slate-50 py-16 md:py-20">
      <div className="page-wrap">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="section-kicker">Just in</p>
            <h2 className="section-title mb-0">New arrivals in store</h2>
          </div>
        </div>
        <div
          className="mt-6 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Filter new arrivals by category"
        >
          {tabs.map((tab) => {
            const selected = active === tab.slug;
            return (
              <button
                key={tab.slug}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActive(tab.slug)}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold transition duration-300 ${
                  selected
                    ? 'bg-[var(--color-primary)] text-white shadow-sm'
                    : 'border border-slate-200 bg-white text-slate-600 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                {tab.title}
              </button>
            );
          })}
        </div>
        <div className="stagger mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {(current?.products ?? []).slice(0, 8).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
