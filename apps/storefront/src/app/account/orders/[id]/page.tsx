'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AccountBar } from '@/components/account-bar';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/money';
import type { StoreOrder } from '@/lib/types';

export default function AccountOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<StoreOrder | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api<StoreOrder>(`/v1/orders/mine/${id}`)
      .then(setOrder)
      .catch((e) => {
        setError(e.message);
        if (String(e.message).includes('Sign in')) router.replace('/account/login');
      });
  }, [id, router]);

  if (error && !order) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 md:px-6">
        <p className="text-slate-600">
          {error}.{' '}
          <Link href="/account/orders" className="font-semibold text-[var(--color-primary)]">
            Back to orders
          </Link>
        </p>
      </main>
    );
  }
  if (!order) return <p className="px-6 py-16 text-sm text-slate-500">Loading order…</p>;

  const address = order.shippingAddress;

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 md:px-6">
      <AccountBar />
      <div className="mt-2">
        <Link href="/account/orders" className="text-sm font-medium text-slate-500 hover:text-[var(--color-primary)]">
          ← All orders
        </Link>
      </div>
      <div className="card mt-6 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">{order.orderNumber}</h2>
            <p className="mt-1 text-sm text-slate-500">{new Date(order.placedAt).toLocaleString()}</p>
          </div>
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-primary)]">{order.status}</p>
        </div>
        <ul className="mt-6 divide-y divide-slate-100">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-3 py-3 text-sm">
              <span>
                {item.name} × {item.quantity}
                <span className="mt-0.5 block text-xs text-slate-400">SKU {item.sku}</span>
              </span>
              <span className="font-medium">{formatPrice(Number(item.total))}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span>{formatPrice(Number(order.subtotal))}</span>
          </div>
          {Number(order.discount) > 0 ? (
            <div className="flex justify-between text-emerald-700">
              <span>{order.coupon?.code ? order.coupon.code : 'Discount'}</span>
              <span>−{formatPrice(Number(order.discount))}</span>
            </div>
          ) : null}
          <div className="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span className="text-[var(--color-primary)]">{formatPrice(Number(order.total))}</span>
          </div>
        </div>
        {address ? (
          <p className="mt-4 text-sm text-slate-600">
            Deliver to {order.name}, {[address.line1, address.district, address.division].filter(Boolean).join(', ')}
          </p>
        ) : null}
        <p className="mt-2 text-sm text-slate-500">Pay with cash on delivery · {order.phone}</p>
      </div>
    </main>
  );
}
