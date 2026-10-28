'use client';

import { Minus, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ErrorBanner, Notice } from '@/components/admin-ui';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { ProductThumb } from '@/components/product-thumb';
import { api } from '@/lib/api';

type Line = { variantId: string; name: string; sku: string; price: number; quantity: number; onHand: number; imageUrl?: string | null };
type Session = { id: string; terminal: { name: string }; branch: { name: string } } | null;

export default function PosPage() {
  const [session, setSession] = useState<Session>(null);
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState<Line[]>([]);
  const [cash, setCash] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function refreshSession() {
    const data = await api<{ session: Session }>('/v1/pos/session');
    setSession(data.session);
  }

  useEffect(() => {
    refreshSession().catch((e) => setError(e.message));
  }, []);

  const total = cart.reduce((s, l) => s + l.price * l.quantity, 0);
  const tendered = cash === '' ? total : Number(cash);
  const change = Number.isFinite(tendered) ? tendered - total : 0;

  function setQty(id: string, quantity: number) {
    setCart((prev) => {
      if (quantity < 1) return prev.filter((line) => line.variantId !== id);
      return prev.map((line) => (line.variantId === id ? { ...line, quantity } : line));
    });
  }

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const item = await api<{
        id: string;
        name: string;
        sku: string;
        price: number;
        onHand: number;
        imageUrl?: string | null;
      }>(`/v1/pos/lookup?q=${encodeURIComponent(query)}`);
      setCart((prev) => {
        const existing = prev.find((l) => l.variantId === item.id);
        if (existing) {
          return prev.map((l) => (l.variantId === item.id ? { ...l, quantity: l.quantity + 1 } : l));
        }
        return [
          ...prev,
          {
            variantId: item.id,
            name: item.name,
            sku: item.sku,
            price: item.price,
            quantity: 1,
            onHand: item.onHand,
            imageUrl: item.imageUrl,
          },
        ];
      });
      setQuery('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No product matched that SKU.');
    }
  }

  async function checkout() {
    setMessage('');
    setError('');
    const paid = Number(cash || total);
    setBusy(true);
    try {
      const sale = await api<{ saleNumber: string; total: number }>('/v1/pos/sales', {
        method: 'POST',
        body: JSON.stringify({
          customerPhone: phone || undefined,
          items: cart.map((l) => ({ variantId: l.variantId, quantity: l.quantity, unitPrice: l.price })),
          payments:
            paid <= 0
              ? [{ provider: 'DUE', amount: total }]
              : paid >= total
                ? [{ provider: 'CASH', amount: total }]
                : [
                    { provider: 'CASH', amount: paid },
                    { provider: 'DUE', amount: Number((total - paid).toFixed(2)) },
                  ],
        }),
      });
      setMessage(`Sale ${sale.saleNumber} recorded — ৳${Number(sale.total).toLocaleString()}. A receipt is printing.`);
      setCart([]);
      setCash('');
      window.print();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sale failed');
    } finally {
      setBusy(false);
    }
  }

  if (!session) {
    return (
      <div>
        <PageHeader kicker="Showroom till" title="POS" lede="Open a cash session to start selling from the counter." />
        <div className="card mt-6 max-w-lg p-6">
          <p className="text-slate-600">No session is open on this terminal yet. Open one before scanning items.</p>
          <button
            className="primary mt-4"
            onClick={async () => {
              setError('');
              await api('/v1/pos/session/open', { method: 'POST', body: JSON.stringify({ openingFloat: 0 }) });
              refreshSession();
            }}
          >
            Open session
          </button>
          <ErrorBanner>{error}</ErrorBanner>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div>
        <PageHeader
          kicker={session.branch.name}
          title={session.terminal.name}
          lede="Scan a SKU to add it to the ticket. Quantity can be changed before you take payment."
          action={
            <button
              className="ghost"
              onClick={async () => {
                if (!window.confirm('Close this till session? Unsold items in the cart will be cleared.')) return;
                await api('/v1/pos/session/close', { method: 'POST', body: JSON.stringify({ closingCash: total }) });
                setCart([]);
                setSession(null);
              }}
            >
              Close session
            </button>
          }
        />
        <form onSubmit={lookup} className="mt-6 flex gap-2">
          <input
            placeholder="Scan SKU or barcode"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            aria-label="Scan SKU or barcode"
          />
          <button className="primary shrink-0">Add</button>
        </form>
        <ErrorBanner>{error}</ErrorBanner>
        {message ? <Notice tone="ok">{message}</Notice> : null}
        <div className="card mt-4 overflow-x-auto">
          {cart.length ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>
                    <span className="sr-only">Remove</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {cart.map((l) => (
                  <tr key={l.variantId}>
                    <td>
                      <div className="flex items-center gap-3">
                        <ProductThumb url={l.imageUrl} alt="" size="sm" />
                        <span>
                          {l.name}
                          <div className="text-xs text-slate-500">{l.sku}</div>
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button type="button" className="qty-btn" aria-label={`Decrease ${l.name}`} onClick={() => setQty(l.variantId, l.quantity - 1)}>
                          <Minus size={12} />
                        </button>
                        <input
                          className="w-14 text-center"
                          type="number"
                          min={1}
                          value={l.quantity}
                          aria-label={`Quantity for ${l.name}`}
                          onChange={(e) => setQty(l.variantId, Number(e.target.value))}
                        />
                        <button type="button" className="qty-btn" aria-label={`Increase ${l.name}`} onClick={() => setQty(l.variantId, l.quantity + 1)}>
                          <Plus size={12} />
                        </button>
                      </div>
                    </td>
                    <td className="font-medium">৳{(l.price * l.quantity).toLocaleString()}</td>
                    <td>
                      <button type="button" className="ghost text-red-600" aria-label={`Remove ${l.name}`} onClick={() => setQty(l.variantId, 0)}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <EmptyState title="Cart is empty" hint="Scan a SKU or type a barcode, then press Add." />
          )}
        </div>
      </div>
      <div className="card h-fit p-6">
        <p className="page-kicker">Ticket total</p>
        <p className="mt-2 text-4xl font-bold tracking-tight text-[var(--color-ink)]">৳{total.toLocaleString()}</p>
        <p className="mt-1 text-sm text-slate-500">
          {cart.length} {cart.length === 1 ? 'line' : 'lines'}
        </p>
        <label className="mt-6 block text-sm font-medium" htmlFor="pos-phone">
          Customer phone <span className="font-normal text-slate-400">(optional, for dues)</span>
        </label>
        <input id="pos-phone" className="mt-1" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <label className="mt-4 block text-sm font-medium" htmlFor="pos-cash">
          Cash tendered
        </label>
        <input
          id="pos-cash"
          className="mt-1"
          type="number"
          min={0}
          value={cash}
          onChange={(e) => setCash(e.target.value)}
          placeholder={String(total)}
        />
        {cart.length && cash !== '' && change >= 0 ? (
          <p className="mt-3 text-sm text-slate-600">
            Change due: <span className="font-semibold text-[var(--color-ink)]">৳{change.toLocaleString()}</span>
          </p>
        ) : cart.length && cash !== '' && change < 0 ? (
          <p className="mt-3 text-sm text-[var(--color-secondary)]">
            Due: ৳{Math.abs(change).toLocaleString()}
          </p>
        ) : null}
        <button className="primary mt-6 w-full" disabled={!cart.length || busy} onClick={checkout}>
          {busy ? 'Recording…' : 'Complete sale'}
        </button>
      </div>
    </div>
  );
}
