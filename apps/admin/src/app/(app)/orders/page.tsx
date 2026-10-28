'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { ErrorBanner, FilterTabs, LoadingState, SearchField, TableCard, Toolbar } from '@/components/admin-ui';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { ReceiptDownload } from '@/components/receipt-download';
import { statusLabel } from '@/components/status-badge';
import { api } from '@/lib/api';

type Order = {
  id: string;
  orderNumber: string;
  name: string;
  phone: string;
  status: string;
  total: string;
  placedAt: string;
};

const STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;

export default function OrdersPage() {
  const router = useRouter();
  const [items, setItems] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('ALL');
  const [updating, setUpdating] = useState('');

  function load() {
    setError('');
    api<Order[]>('/v1/orders')
      .then(setItems)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load orders'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items.filter((order) => {
      if (status !== 'ALL' && order.status !== status) return false;
      if (!needle) return true;
      return (
        order.orderNumber.toLowerCase().includes(needle) ||
        order.name.toLowerCase().includes(needle) ||
        order.phone.toLowerCase().includes(needle)
      );
    });
  }, [items, q, status]);

  const pending = items.filter((order) => order.status === 'PENDING').length;

  return (
    <div>
      <PageHeader
        kicker="Selling"
        title="Orders"
        lede="Cash-on-delivery orders from the website. Update status as they move from the showroom to delivery."
      />
      <Toolbar>
        <SearchField
          value={q}
          onChange={setQ}
          placeholder="Search number, name or phone"
          label="Search orders"
        />
        <FilterTabs
          label="Filter by status"
          value={status}
          onChange={setStatus}
          options={[
            { id: 'ALL', label: pending ? `All (${items.length})` : 'All' },
            ...STATUSES.map((id) => ({ id, label: statusLabel(id) })),
          ]}
        />
      </Toolbar>
      <ErrorBanner>{error}</ErrorBanner>
      <TableCard className="mt-6">
        <table className="data-table">
          <thead>
            <tr>
              <th>Number</th>
              <th>Customer</th>
              <th>Placed</th>
              <th>Status</th>
              <th>Total</th>
              <th>Receipt</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6}>
                  <LoadingState label="Loading orders…" />
                </td>
              </tr>
            ) : visible.length ? (
              visible.map((o) => (
                <tr
                  key={o.id}
                  className="is-link"
                  onClick={() => router.push(`/orders/${o.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      router.push(`/orders/${o.id}`);
                    }
                  }}
                  tabIndex={0}
                >
                  <td className="whitespace-nowrap font-medium">
                    <Link href={`/orders/${o.id}`} className="hover:text-[var(--color-primary)]" onClick={(e) => e.stopPropagation()}>
                      {o.orderNumber}
                    </Link>
                  </td>
                  <td>
                    <p>{o.name}</p>
                    <p className="text-xs text-slate-500">{o.phone}</p>
                  </td>
                  <td className="whitespace-nowrap text-slate-500">
                    {o.placedAt ? new Date(o.placedAt).toLocaleDateString() : '—'}
                  </td>
                  <td>
                    <select
                      className="w-auto min-w-32"
                      value={o.status}
                      disabled={updating === o.id}
                      aria-label={`Status for ${o.orderNumber}`}
                      onClick={(e) => e.stopPropagation()}
                      onChange={async (e) => {
                        e.stopPropagation();
                        const next = e.target.value;
                        setUpdating(o.id);
                        try {
                          await api(`/v1/orders/${o.id}/status`, {
                            method: 'POST',
                            body: JSON.stringify({ status: next }),
                          });
                          load();
                        } catch (err) {
                          setError(err instanceof Error ? err.message : 'Could not update status');
                        } finally {
                          setUpdating('');
                        }
                      }}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {statusLabel(s)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="whitespace-nowrap font-medium">৳{Number(o.total).toLocaleString()}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <ReceiptDownload orderId={o.id} orderNumber={o.orderNumber} compact />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6}>
                  <EmptyState
                    title={q || status !== 'ALL' ? 'No orders match this filter' : 'No orders yet'}
                    hint={
                      q || status !== 'ALL'
                        ? 'Clear the search or choose All to see every order.'
                        : 'Storefront checkouts will land here for confirmation and delivery.'
                    }
                    action={
                      q || status !== 'ALL' ? (
                        <button
                          type="button"
                          className="ghost"
                          onClick={() => {
                            setQ('');
                            setStatus('ALL');
                          }}
                        >
                          Clear filters
                        </button>
                      ) : null
                    }
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </TableCard>
    </div>
  );
}
