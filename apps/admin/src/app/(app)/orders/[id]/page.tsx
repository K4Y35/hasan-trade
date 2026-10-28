'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ErrorBanner, LoadingState } from '@/components/admin-ui';
import { PageHeader } from '@/components/page-header';
import { ReceiptDownload } from '@/components/receipt-download';
import { StatusBadge, statusLabel } from '@/components/status-badge';
import { api } from '@/lib/api';

type Address = {
  line1?: string;
  line2?: string;
  thana?: string;
  district?: string;
  division?: string;
  postalCode?: string;
};

type Order = {
  id: string;
  orderNumber: string;
  name: string;
  phone: string;
  email: string | null;
  status: string;
  channel: string;
  subtotal: number;
  discount?: number;
  tax: number;
  total: number;
  coupon?: { id: string; code: string; type: string; value: number } | null;
  customerNotes: string | null;
  placedAt: string;
  shippingAddress: Address | null;
  items: { id: string; name: string; sku: string; quantity: number; unitPrice: number; total: number }[];
  payments: { id: string; provider: string; status: string; amount: number }[];
  statusLogs: { id: string; fromStatus: string | null; toStatus: string; note: string | null; createdAt: string }[];
};

const statuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  function load() {
    api<Order>(`/v1/orders/${id}`)
      .then(setOrder)
      .catch((e) => setError(e.message));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (error && !order) {
    return (
      <div>
        <PageHeader kicker="Selling" title="Order" action={<Link href="/orders" className="ghost">Back to orders</Link>} />
        <ErrorBanner>
          {error}. <Link href="/orders" className="font-semibold underline">Back to orders</Link>
        </ErrorBanner>
      </div>
    );
  }
  if (!order) return <LoadingState label="Loading order…" />;

  const address = order.shippingAddress;

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Selling"
        title={order.orderNumber}
        lede={`${order.name} · ${order.phone} · ${new Date(order.placedAt).toLocaleString()}`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <ReceiptDownload orderId={order.id} orderNumber={order.orderNumber} variant="primary" />
            <Link href="/orders" className="ghost">
              Back to orders
            </Link>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="card overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>SKU</th>
                <th>Qty</th>
                <th>Unit</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className="font-medium">{item.name}</td>
                  <td className="text-slate-500">{item.sku}</td>
                  <td>{item.quantity}</td>
                  <td>৳{Number(item.unitPrice).toLocaleString()}</td>
                  <td>৳{Number(item.total).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <aside className="space-y-6">
          <div className="card space-y-3 p-5">
            <div className="flex items-center justify-between gap-2">
              <StatusBadge value={order.status} />
              <span className="text-xs uppercase tracking-wide text-slate-400">{order.channel}</span>
            </div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="order-status">
              Update status
            </label>
            <select
              id="order-status"
              value={order.status}
              disabled={updating}
              onChange={async (e) => {
                setUpdating(true);
                setError('');
                try {
                  await api(`/v1/orders/${order.id}/status`, {
                    method: 'POST',
                    body: JSON.stringify({ status: e.target.value }),
                  });
                  load();
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'Could not update status');
                } finally {
                  setUpdating(false);
                }
              }}
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {statusLabel(status)}
                </option>
              ))}
            </select>
            <ErrorBanner>{error}</ErrorBanner>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Subtotal</dt>
                <dd>৳{Number(order.subtotal).toLocaleString()}</dd>
              </div>
              {Number(order.discount) > 0 ? (
                <div className="flex justify-between text-emerald-700">
                  <dt>{order.coupon?.code ? order.coupon.code : 'Discount'}</dt>
                  <dd>−৳{Number(order.discount).toLocaleString()}</dd>
                </div>
              ) : null}
              <div className="flex justify-between">
                <dt className="text-slate-500">Tax</dt>
                <dd>৳{Number(order.tax).toLocaleString()}</dd>
              </div>
              <div className="flex justify-between font-semibold">
                <dt>Total</dt>
                <dd>৳{Number(order.total).toLocaleString()}</dd>
              </div>
            </dl>
            {order.payments.map((payment) => (
              <p key={payment.id} className="text-xs text-slate-500">
                {payment.provider} · {statusLabel(payment.status)} · ৳{Number(payment.amount).toLocaleString()}
              </p>
            ))}
          </div>

          <div className="card space-y-2 p-5 text-sm">
            <p className="font-medium">Customer</p>
            <p>{order.name}</p>
            <p>
              <a className="text-[var(--color-primary)] hover:underline" href={`tel:${order.phone}`}>
                {order.phone}
              </a>
            </p>
            {order.email ? (
              <p>
                <a className="text-slate-500 hover:underline" href={`mailto:${order.email}`}>
                  {order.email}
                </a>
              </p>
            ) : null}
            {address ? (
              <p className="pt-2 text-slate-600">
                {[address.line1, address.line2, address.thana, address.district, address.division, address.postalCode]
                  .filter(Boolean)
                  .join(', ')}
              </p>
            ) : null}
            {order.customerNotes ? <p className="pt-2 text-slate-600">{order.customerNotes}</p> : null}
          </div>
        </aside>
      </div>

      {order.statusLogs?.length ? (
        <div className="card p-5">
          <p className="text-sm font-medium">Status history</p>
          <ol className="mt-3 space-y-2 text-sm">
            {order.statusLogs.map((log) => (
              <li key={log.id} className="flex flex-wrap justify-between gap-2 text-slate-600">
                <span>
                  {log.fromStatus ? `${statusLabel(log.fromStatus)} → ` : ''}
                  {statusLabel(log.toStatus)}
                  {log.note ? ` · ${log.note}` : ''}
                </span>
                <span className="text-slate-400">{new Date(log.createdAt).toLocaleString()}</span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </div>
  );
}
