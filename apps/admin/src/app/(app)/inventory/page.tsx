'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ErrorBanner, FilterTabs, SearchField, TableCard, Toolbar } from '@/components/admin-ui';
import { EmptyState } from '@/components/empty-state';
import { Field } from '@/components/field';
import { PageHeader } from '@/components/page-header';
import { ProductThumb } from '@/components/product-thumb';
import { api } from '@/lib/api';

type Row = {
  id: string;
  branchId: string;
  variantId: string;
  onHand: number;
  reserved: number;
  available: number;
  sku: string;
  variantName: string | null;
  branch: { id: string; name: string; code: string };
  product: { id: string; name: string; slug: string; imageUrl?: string | null };
};

type Mode = 'received' | 'removed' | 'counted';

const REASONS: Record<Mode, string> = {
  received: 'Received from supplier',
  removed: 'Damaged or unsellable',
  counted: 'Showroom count',
};

export default function InventoryPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState('');
  const [view, setView] = useState<'all' | 'low'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Row | null>(null);
  const [savedId, setSavedId] = useState('');

  function load() {
    setError('');
    api<Row[]>('/v1/inventory')
      .then(setRows)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load inventory'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (view === 'low' && r.available > 2) return false;
      if (!needle) return true;
      return (
        r.product.name.toLowerCase().includes(needle) ||
        r.sku.toLowerCase().includes(needle) ||
        r.branch.name.toLowerCase().includes(needle)
      );
    });
  }, [rows, q, view]);

  const lowCount = rows.filter((r) => r.available <= 2).length;

  return (
    <div>
      <PageHeader
        kicker="Stock"
        title="Inventory"
        lede="Change on-hand when stock arrives, is counted, or is written off. Each change is recorded. Rows with 2 or fewer available are highlighted."
      />
      <Toolbar>
        <SearchField value={q} onChange={setQ} placeholder="Search product, SKU or branch" label="Search inventory" />
        <FilterTabs
          label="Stock filter"
          value={view}
          onChange={setView}
          options={[
            { id: 'all', label: `All (${rows.length})` },
            { id: 'low', label: `Low stock (${lowCount})` },
          ]}
        />
      </Toolbar>
      <ErrorBanner>{error}</ErrorBanner>
      <TableCard className="mt-6">
        <table className="data-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Branch</th>
              <th>On hand</th>
              <th>Reserved</th>
              <th>Available</th>
              <th>
                <span className="sr-only">Adjust</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-slate-500">
                  Loading inventory…
                </td>
              </tr>
            ) : visible.length ? (
              visible.map((r) => (
                <tr key={r.id} className={savedId === r.id ? 'bg-emerald-50/60' : undefined}>
                  <td>
                    <Link href={`/products/${r.product.id}`} className="flex items-center gap-3 hover:text-[var(--color-primary)]">
                      <ProductThumb url={r.product.imageUrl} alt="" size="sm" />
                      <span className="min-w-0">
                        <span className="block font-medium">{r.product.name}</span>
                        {r.variantName ? <span className="text-xs text-slate-500">{r.variantName}</span> : null}
                      </span>
                    </Link>
                  </td>
                  <td className="text-slate-500">{r.sku}</td>
                  <td>{r.branch.name}</td>
                  <td>{r.onHand}</td>
                  <td>{r.reserved}</td>
                  <td className={r.available <= 2 ? 'font-semibold text-[var(--color-secondary)]' : ''}>{r.available}</td>
                  <td>
                    <button type="button" className="ghost" onClick={() => setEditing(r)}>
                      Adjust
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7}>
                  <EmptyState
                    title={q || view === 'low' ? 'No matching stock rows' : 'No inventory rows yet'}
                    hint={
                      q || view === 'low'
                        ? 'Clear search or show all rows.'
                        : 'Stock appears here after products are received or sold.'
                    }
                    action={
                      q || view === 'low' ? (
                        <button
                          type="button"
                          className="ghost"
                          onClick={() => {
                            setQ('');
                            setView('all');
                          }}
                        >
                          Show all
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
      {editing ? (
        <AdjustDialog
          row={editing}
          onClose={() => setEditing(null)}
          onSaved={(next) => {
            setRows((current) =>
              current.map((row) =>
                row.id === editing.id
                  ? { ...row, onHand: next.onHand, reserved: next.reserved, available: next.onHand - next.reserved }
                  : row,
              ),
            );
            setSavedId(editing.id);
            window.setTimeout(() => setSavedId(''), 2400);
            setEditing(null);
          }}
        />
      ) : null}
    </div>
  );
}

function AdjustDialog({
  row,
  onClose,
  onSaved,
}: {
  row: Row;
  onClose: () => void;
  onSaved: (next: { onHand: number; reserved: number }) => void;
}) {
  const amountRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<Mode>('received');
  const [amount, setAmount] = useState('1');
  const [reason, setReason] = useState(REASONS.received);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    amountRef.current?.focus();
    amountRef.current?.select();
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const units = Number(amount);
  const validUnits = Number.isInteger(units) && units >= 0;
  const nextOnHand =
    mode === 'received' ? row.onHand + units : mode === 'removed' ? row.onHand - units : units;
  const quantity = mode === 'received' ? units : mode === 'removed' ? -units : units - row.onHand;
  const blocked =
    !validUnits ||
    (mode !== 'counted' && units < 1) ||
    quantity === 0 ||
    nextOnHand < 0;

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (blocked) return;
    setSaving(true);
    setError('');
    try {
      const next = await api<{ onHand: number; reserved: number }>('/v1/inventory/adjust', {
        method: 'POST',
        body: JSON.stringify({
          branchId: row.branchId,
          variantId: row.variantId,
          quantity,
          reason: reason.trim() || REASONS[mode],
        }),
      });
      onSaved(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not adjust stock');
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center p-4 sm:items-center">
      <button type="button" className="absolute inset-0 bg-slate-950/40" aria-label="Close adjust stock" onClick={onClose} />
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="adjust-title"
        className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-lift"
        onSubmit={onSubmit}
      >
        <p className="page-kicker">Inventory</p>
        <h2 id="adjust-title" className="mt-1 text-lg font-semibold text-[var(--color-ink)]">
          Adjust stock
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          {row.product.name}
          {row.variantName ? ` · ${row.variantName}` : ''}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {row.sku} · {row.branch.name} · on hand {row.onHand}
          {row.reserved ? ` · reserved ${row.reserved}` : ''}
        </p>

        <fieldset className="mt-5">
          <legend className="text-sm font-medium text-slate-700">What happened</legend>
          <div className="mt-2 grid gap-2">
            {(
              [
                ['received', 'Stock arrived'],
                ['removed', 'Stock left or was written off'],
                ['counted', 'I counted what is here'],
              ] as const
            ).map(([id, label]) => (
              <label
                key={id}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 text-sm ${
                  mode === id ? 'border-[var(--color-primary)] bg-blue-50/60' : 'border-slate-200'
                }`}
              >
                <input
                  type="radio"
                  name="adjust-mode"
                  className="mt-0.5 h-4 w-4 accent-[var(--color-primary)]"
                  checked={mode === id}
                  onChange={() => {
                    setMode(id);
                    setReason(REASONS[id]);
                    setAmount(id === 'counted' ? String(row.onHand) : '1');
                    setError('');
                  }}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-4">
          <Field
            label={mode === 'counted' ? 'Counted on-hand' : 'How many units'}
            hint={
              mode === 'counted'
                ? 'Enter the number on the shelf now. The ledger records the difference.'
                : mode === 'removed'
                  ? `Cannot remove more than the ${row.onHand} currently on hand.`
                  : 'Added to the current on-hand quantity.'
            }
          >
            <input
              ref={amountRef}
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </Field>
        </div>

        <div className="mt-4">
          <Field label="Reason" hint="Shown on the stock ledger.">
            <input value={reason} onChange={(e) => setReason(e.target.value)} maxLength={120} />
          </Field>
        </div>

        <p className="mt-4 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
          {blocked && mode === 'removed' && validUnits && nextOnHand < 0
            ? `Cannot go below zero. On hand is ${row.onHand}.`
            : blocked && quantity === 0
              ? 'No change to save. Enter a different number.'
              : `On hand will be ${Number.isFinite(nextOnHand) ? nextOnHand : '—'} (now ${row.onHand}).`}
        </p>

        <ErrorBanner>{error}</ErrorBanner>

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button type="button" className="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="primary" disabled={saving || blocked}>
            {saving ? 'Saving…' : 'Save adjustment'}
          </button>
        </div>
      </form>
    </div>
  );
}
