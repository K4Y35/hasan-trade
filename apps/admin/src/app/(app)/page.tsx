'use client';

import {
  AlertTriangle,
  Banknote,
  Package,
  Plus,
  ShoppingBag,
  Store,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ErrorBanner, LoadingState, Notice, TableCard } from '@/components/admin-ui';
import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
import { api } from '@/lib/api';

type Overview = {
  orders: number;
  products: number;
  lowStock: number;
  posSales: number;
  posRevenue: number;
  webRevenue: number;
  recentOrders: { id: string; orderNumber: string; name: string; total: string; status: string }[];
};

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState('');

  function load() {
    setError('');
    api<Overview>('/v1/reports/overview')
      .then(setData)
      .catch((e) => setError(e.message));
  }

  useEffect(() => {
    load();
  }, []);

  if (error && !data) {
    return (
      <div>
        <PageHeader kicker="Overview" title="Dashboard" lede="Live orders, catalog health, and POS totals." />
        <ErrorBanner>
          {error}.{' '}
          <button type="button" className="font-semibold underline" onClick={load}>
            Try again
          </button>
        </ErrorBanner>
      </div>
    );
  }

  if (!data) return <LoadingState label="Loading overview…" />;

  const cards = [
    { label: 'Web orders', value: data.orders, Icon: ShoppingBag, href: '/orders' },
    { label: 'Web revenue', value: `৳${Number(data.webRevenue).toLocaleString()}`, Icon: Banknote, href: '/sales?source=website' },
    { label: 'POS sales', value: data.posSales, Icon: Store, href: '/sales?source=pos' },
    { label: 'POS revenue', value: `৳${Number(data.posRevenue).toLocaleString()}`, Icon: Wallet, href: '/sales?source=pos' },
    { label: 'Active products', value: data.products, Icon: Package, href: '/products' },
    { label: 'Low stock', value: data.lowStock, Icon: AlertTriangle, href: '/inventory', warn: data.lowStock > 0 },
  ];

  return (
    <div>
      <PageHeader
        kicker="Overview"
        title="Dashboard"
        lede="Live orders, catalog health, and POS totals. Open a number to inspect it."
        action={
          <div className="flex flex-wrap gap-2">
            <Link href="/pos" className="ghost">
              Open POS
            </Link>
            <Link href="/products/new" className="primary inline-flex">
              <Plus size={16} /> New product
            </Link>
          </div>
        }
      />

      {data.lowStock > 0 ? (
        <Notice tone="warn">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <p>
            {data.lowStock} {data.lowStock === 1 ? 'item is' : 'items are'} running low.{' '}
            <Link href="/inventory" className="font-semibold underline">
              Check inventory
            </Link>
          </p>
        </Notice>
      ) : null}

      <div className="stagger mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="card lift block p-5">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm text-slate-500">{c.label}</p>
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                  c.warn ? 'bg-orange-50 text-[var(--color-secondary)]' : 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                }`}
              >
                <c.Icon size={16} />
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight text-[var(--color-ink)]">{c.value}</p>
          </Link>
        ))}
      </div>
      <div className="mt-10">
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-lg font-semibold text-[var(--color-ink)]">Recent orders</h2>
          <Link href="/orders" className="text-sm font-semibold text-[var(--color-primary)] hover:underline">
            All orders
          </Link>
        </div>
        <TableCard className="mt-4">
          <table className="data-table">
            <thead>
              <tr>
                <th>Number</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.length ? (
                data.recentOrders.map((o) => {
                  const href = `/orders/${o.id}`;
                  return (
                    <tr
                      key={o.id}
                      className="is-link"
                      tabIndex={0}
                      onClick={() => router.push(href)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          router.push(href);
                        }
                      }}
                    >
                      <td className="font-medium">
                        <Link href={href} className="hover:text-[var(--color-primary)]" onClick={(e) => e.stopPropagation()}>
                          {o.orderNumber}
                        </Link>
                      </td>
                      <td>{o.name}</td>
                      <td>
                        <StatusBadge value={o.status} />
                      </td>
                      <td>৳{Number(o.total).toLocaleString()}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500">
                    No web orders yet. New storefront checkouts appear here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </TableCard>
      </div>
    </div>
  );
}
