'use client';

import { TicketPercent } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ErrorBanner, FilterTabs, SearchField, TableCard, Toolbar } from '@/components/admin-ui';
import { EmptyState } from '@/components/empty-state';
import { Field } from '@/components/field';
import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
import { api } from '@/lib/api';

type Coupon = {
  id: string;
  code: string;
  type: 'PERCENT' | 'FIXED';
  value: number;
  minSubtotal: number | null;
  maxUses: number | null;
  usedCount: number;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
  orderCount: number;
};

type Draft = {
  code: string;
  type: 'PERCENT' | 'FIXED';
  value: string;
  minSubtotal: string;
  maxUses: string;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
};

const blankDraft = (): Draft => ({
  code: '',
  type: 'PERCENT',
  value: '10',
  minSubtotal: '',
  maxUses: '',
  startsAt: '',
  endsAt: '',
  isActive: true,
});

function dhakaDay(iso: string | null) {
  if (!iso) return '';
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Dhaka',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(iso));
}

function couponStatus(row: Coupon) {
  const now = Date.now();
  if (!row.isActive) return 'VOID';
  if (row.startsAt && new Date(row.startsAt).getTime() > now) return 'PENDING';
  if (row.endsAt && new Date(row.endsAt).getTime() < now) return 'EXPIRED';
  if (row.maxUses != null && row.usedCount >= row.maxUses) return 'EXPIRED';
  return 'ACTIVE';
}

function offerLine(row: Pick<Draft, 'type' | 'value' | 'minSubtotal'>) {
  const amount = Number(row.value);
  if (!Number.isFinite(amount) || amount <= 0) return 'Enter a value to preview this offer.';
  const off = row.type === 'PERCENT' ? `${amount}% off` : `৳${amount.toLocaleString('en-BD')} off`;
  const min = Number(row.minSubtotal);
  if (Number.isFinite(min) && min > 0) return `${off} on orders of ৳${min.toLocaleString('en-BD')} or more.`;
  return `${off} the order subtotal.`;
}

export default function CouponsPage() {
  const [rows, setRows] = useState<Coupon[]>([]);
  const [q, setQ] = useState('');
  const [view, setView] = useState<'all' | 'active' | 'paused'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Coupon | 'new' | null>(null);

  function load() {
    setError('');
    api<Coupon[]>('/v1/admin/coupons')
      .then(setRows)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load coupons'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((row) => {
      const status = couponStatus(row);
      if (view === 'active' && status !== 'ACTIVE') return false;
      if (view === 'paused' && status === 'ACTIVE') return false;
      if (!needle) return true;
      return row.code.toLowerCase().includes(needle);
    });
  }, [rows, q, view]);

  return (
    <div>
      <PageHeader
        kicker="Selling"
        title="Coupons"
        lede="Codes customers can enter at checkout. Percent or taka off the cart, with an optional minimum spend and use limit."
        action={
          <button type="button" className="primary" onClick={() => setEditing('new')}>
            New coupon
          </button>
        }
      />
      <Toolbar>
        <SearchField value={q} onChange={setQ} placeholder="Search code" label="Search coupons" />
        <FilterTabs
          label="Coupon filter"
          value={view}
          onChange={setView}
          options={[
            { id: 'all', label: `All (${rows.length})` },
            { id: 'active', label: 'Active' },
            { id: 'paused', label: 'Paused or ended' },
          ]}
        />
      </Toolbar>
      <ErrorBanner>{error}</ErrorBanner>
      <TableCard className="mt-6">
        <table className="data-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Offer</th>
              <th>Uses</th>
              <th>Window</th>
              <th>Status</th>
              <th>
                <span className="sr-only">Edit</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-slate-500">
                  Loading coupons…
                </td>
              </tr>
            ) : visible.length ? (
              visible.map((row) => (
                <tr key={row.id}>
                  <td className="font-semibold tracking-wide">{row.code}</td>
                  <td>{offerLine({ type: row.type, value: String(row.value), minSubtotal: row.minSubtotal == null ? '' : String(row.minSubtotal) })}</td>
                  <td>
                    {row.usedCount}
                    {row.maxUses != null ? ` / ${row.maxUses}` : ''}
                  </td>
                  <td className="text-slate-500">
                    {row.startsAt || row.endsAt
                      ? `${row.startsAt ? dhakaDay(row.startsAt) : 'Anytime'} – ${row.endsAt ? dhakaDay(row.endsAt) : 'no end'}`
                      : 'Always'}
                  </td>
                  <td>
                    <StatusBadge value={couponStatus(row)} />
                  </td>
                  <td>
                    <button type="button" className="ghost" onClick={() => setEditing(row)}>
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6}>
                  <EmptyState
                    icon={TicketPercent}
                    title={q || view !== 'all' ? 'No coupons match' : 'No coupons yet'}
                    hint="Create a code like WELCOME10 for 10% off a first web order."
                    action={
                      <button type="button" className="primary" onClick={() => setEditing('new')}>
                        New coupon
                      </button>
                    }
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </TableCard>
      {editing ? (
        <CouponDialog
          coupon={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={(row) => {
            setRows((current) => {
              const rest = current.filter((item) => item.id !== row.id);
              return [{ ...row, orderCount: row.orderCount ?? 0 }, ...rest];
            });
            setEditing(null);
          }}
        />
      ) : null}
    </div>
  );
}

function CouponDialog({
  coupon,
  onClose,
  onSaved,
}: {
  coupon: Coupon | null;
  onClose: () => void;
  onSaved: (row: Coupon) => void;
}) {
  const codeRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<Draft>(
    coupon
      ? {
          code: coupon.code,
          type: coupon.type,
          value: String(coupon.value),
          minSubtotal: coupon.minSubtotal == null ? '' : String(coupon.minSubtotal),
          maxUses: coupon.maxUses == null ? '' : String(coupon.maxUses),
          startsAt: dhakaDay(coupon.startsAt),
          endsAt: dhakaDay(coupon.endsAt),
          isActive: coupon.isActive,
        }
      : blankDraft(),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    codeRef.current?.focus();
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const value = Number(draft.value);
  const blocked = !draft.code.trim() || !Number.isFinite(value) || value <= 0 || (draft.type === 'PERCENT' && value > 100);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (blocked) return;
    setSaving(true);
    setError('');
    const payload = {
      code: draft.code,
      type: draft.type,
      value,
      minSubtotal: draft.minSubtotal.trim() ? Number(draft.minSubtotal) : null,
      maxUses: draft.maxUses.trim() ? Number(draft.maxUses) : null,
      startsAt: draft.startsAt || null,
      endsAt: draft.endsAt || null,
      isActive: draft.isActive,
    };
    try {
      const row = coupon
        ? await api<Coupon>(`/v1/admin/coupons/${coupon.id}`, { method: 'PATCH', body: JSON.stringify(payload) })
        : await api<Coupon>('/v1/admin/coupons', { method: 'POST', body: JSON.stringify(payload) });
      onSaved({ ...row, orderCount: coupon?.orderCount ?? 0 });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save coupon');
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center p-4 sm:items-center">
      <button type="button" className="absolute inset-0 bg-slate-950/40" aria-label="Close coupon editor" onClick={onClose} />
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="coupon-title"
        className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-lift"
        onSubmit={onSubmit}
      >
        <p className="page-kicker">Coupons</p>
        <h2 id="coupon-title" className="mt-1 text-lg font-semibold text-[var(--color-ink)]">
          {coupon ? 'Edit coupon' : 'New coupon'}
        </h2>
        <p className="mt-2 text-sm text-slate-600">Shown at website checkout. POS still uses its own discount field.</p>

        <div className="mt-5 space-y-4">
          <Field label="Code" hint="Letters and numbers. Customers type this at checkout.">
            <input
              ref={codeRef}
              value={draft.code}
              onChange={(e) => setDraft({ ...draft, code: e.target.value.toUpperCase() })}
              required
              maxLength={40}
              autoComplete="off"
              placeholder="WELCOME10"
            />
          </Field>

          <fieldset>
            <legend className="text-sm font-medium text-slate-700">Offer type</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {(
                [
                  ['PERCENT', 'Percent off'],
                  ['FIXED', 'Taka off'],
                ] as const
              ).map(([id, label]) => (
                <label
                  key={id}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-sm ${
                    draft.type === id ? 'border-[var(--color-primary)] bg-blue-50/60' : 'border-slate-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="coupon-type"
                    className="h-4 w-4 accent-[var(--color-primary)]"
                    checked={draft.type === id}
                    onChange={() => setDraft({ ...draft, type: id, value: id === 'PERCENT' && Number(draft.value) > 100 ? '10' : draft.value })}
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>

          <Field label={draft.type === 'PERCENT' ? 'Percent off' : 'Taka off'}>
            <input
              type="number"
              min={draft.type === 'PERCENT' ? 1 : 1}
              max={draft.type === 'PERCENT' ? 100 : undefined}
              step={draft.type === 'PERCENT' ? 1 : 1}
              inputMode="decimal"
              value={draft.value}
              onChange={(e) => setDraft({ ...draft, value: e.target.value })}
              required
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Minimum order (optional)" hint="Leave blank for any size cart.">
              <input
                type="number"
                min={0}
                value={draft.minSubtotal}
                onChange={(e) => setDraft({ ...draft, minSubtotal: e.target.value })}
                placeholder="0"
              />
            </Field>
            <Field label="Max uses (optional)" hint="Leave blank for unlimited.">
              <input
                type="number"
                min={1}
                value={draft.maxUses}
                onChange={(e) => setDraft({ ...draft, maxUses: e.target.value })}
                placeholder="Unlimited"
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Starts">
              <input type="date" value={draft.startsAt} onChange={(e) => setDraft({ ...draft, startsAt: e.target.value })} />
            </Field>
            <Field label="Ends">
              <input type="date" value={draft.endsAt} onChange={(e) => setDraft({ ...draft, endsAt: e.target.value })} />
            </Field>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 accent-[var(--color-primary)]"
              checked={draft.isActive}
              onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })}
            />
            Active — customers can apply this code
          </label>

          <p className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">{offerLine(draft)}</p>
        </div>

        <ErrorBanner>{error}</ErrorBanner>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button type="button" className="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="primary" disabled={saving || blocked}>
            {saving ? 'Saving…' : coupon ? 'Save coupon' : 'Create coupon'}
          </button>
        </div>
      </form>
    </div>
  );
}
