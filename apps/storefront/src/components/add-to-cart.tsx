'use client';

import { Check, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { addToCart } from '@/lib/cart';
import type { CartItem } from '@/lib/types';

export function AddToCart({
  item,
  compact = false,
  disabled = false,
  quantity = 1,
}: {
  item: Omit<CartItem, 'quantity'>;
  compact?: boolean;
  disabled?: boolean;
  quantity?: number;
}) {
  const [added, setAdded] = useState(false);
  return (
    <button
      type="button"
      disabled={disabled}
      className={`${
        compact
          ? 'btn-primary mt-3 flex w-full items-center justify-center gap-2 py-2.5 text-sm'
          : 'btn-primary mt-6 inline-flex items-center gap-2'
      } ${added ? 'bg-emerald-600' : ''}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (disabled) return;
        addToCart(item, quantity);
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1500);
      }}
    >
      {disabled ? (
        item.price <= 0 ? 'Call for price' : 'Out of stock'
      ) : added ? (
        <>
          <Check size={16} /> Added to cart
        </>
      ) : (
        <>
          <ShoppingBag size={16} /> Add to cart
        </>
      )}
    </button>
  );
}
