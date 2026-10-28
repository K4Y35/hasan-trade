'use client';

import { useState } from 'react';
import { ProductCard } from '@/components/product-card';
import type { Product } from '@/lib/types';

export function ProductRowGrid({ products, preview = 0 }: { products: Product[]; preview?: number }) {
  const [open, setOpen] = useState(true);
  const limit = preview > 0 ? preview : products.length;
  const visible = open || preview <= 0 ? products : products.slice(0, limit);
  const canToggle = preview > 0 && products.length > limit;

  return (
    <>
      <div className="stagger mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {visible.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {canToggle ? (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            className="btn-ghost px-6"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? 'Show less' : 'Show all'}
          </button>
        </div>
      ) : null}
    </>
  );
}
