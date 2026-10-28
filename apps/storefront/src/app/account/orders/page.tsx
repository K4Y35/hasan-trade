'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AccountBar } from '@/components/account-bar';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/money';
import type { StoreOrder } from '@/lib/types';

export default function AccountOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<StoreOrder[] | null>(null);
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api<{ user: { name: string } }>('/v1/auth/me')
      .then((d) => setName(d.user.name))
      .catch(() => undefined);
    api<StoreOrder[]>('/v1/orders/mine')
      .then(setOrders)
      .catch((e) => {
        setError(e.message);
        if (String(e.message).includes('Sign in') || String(e.message).includes('401')) {
          router.replace('/account/login');
        }
      });
  }, [router]);

  if (error && !orders) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 md:px-6">
        <p className="text-slate-600">
          {error}.{' '}
          <Link href="/account/login" className="font-semibold text-[var(--color-primary)]">
            Sign in
          </Link>
        </p>
      </main>
    );
  }
  if (!orders) return <p className="px-6 py-16 text-sm text-slate-500">Loading orders…</p>;

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 md:px-6">
      <AccountBar name={name} />
      <ul className="card mt-8 divide-y divide-slate-100">
        {orders.map((order) => (
          <li key={order.id}>
            <Link href={`/account/orders/${order.id}`} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 hover:bg-slate-50">
              <div>
                <p className="font-semibold">{order.orderNumber}</p>
                <p className="text-sm text-slate-500">{new Date(order.placedAt).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{order.status}</p>
                <p className="font-semibold text-[var(--color-primary)]">{formatPrice(Number(order.total))}</p>
              </div>
            </Link>
          </li>
        ))}
        {orders.length === 0 ? (
          <li className="px-5 py-10 text-center text-slate-500">
            No orders yet.{' '}
            <Link href="/shop" className="font-semibold text-[var(--color-primary)]">
              Browse the shop
            </Link>
          </li>
        ) : null}
      </ul>
    </main>
  );
}
