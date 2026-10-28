'use client';

import { ShieldCheck } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ErrorBanner, FilterTabs, SearchField, TableCard, Toolbar } from '@/components/admin-ui';
import { EmptyState } from '@/components/empty-state';
import { Field } from '@/components/field';
import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
import { api } from '@/lib/api';

type ProductHit = {
  id: string;
  name: string;
  sku: string | null;
  warrantyMonths: number;
  variants: { id: string; sku: string; isDefault: boolean }[];
};

type Warranty = {
  id: string;
  serial: string;
  status: string;
  customerName: string | null;
  phone: string | null;
  invoiceRef: string | null;
  startDate: string;
  endDate: string;
  canClaim: boolean;
  notes: string | null;
  product: { id: string; name: string; slug: string };
  openClaim: { id: string; status: string; description: string; createdAt: string } | null;
};

type Claim = {
  id: string;
  description: string;
  status: string;
  resolution: string | null;
  createdAt: string;
  updatedAt: string;
  warranty: {
    id: string;
    serial: string;
    status: string;
    customerName: string | null;
    phone: string | null;
    invoiceRef: string | null;
    endDate: string;
    product: { id: string; name: string };
  };
};

function dhakaDay(iso: string) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Dhaka',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(iso));
}

export default function WarrantiesPage() {
  const [tab, setTab] = useState<'coverage' | 'claims'>('coverage');
  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<'all' | 'ACTIVE' | 'CLAIMED' | 'EXPIRED' | 'VOID'>('all');
  const [claimStatus, setClaimStatus] = useState<'all' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [registering, setRegistering] = useState(false);
  const [inspecting, setInspecting] = useState<Claim | null>(null);

  function load() {
    setError('');
    Promise.all([api<Warranty[]>('/v1/admin/warranties'), api<Claim[]>('/v1/admin/warranties/claims')])
      .then(([coverage, claimRows]) => {
        setWarranties(coverage);
        setClaims(claimRows);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load warranties'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  const openClaims = claims.filter((row) => row.status === 'OPEN' || row.status === 'IN_PROGRESS').length;
  const coverage = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return warranties.filter((row) => {
      if (status !== 'all' && row.status !== status) return false;
      if (!needle) return true;
      return (
        row.serial.toLowerCase().includes(needle) ||
        row.product.name.toLowerCase().includes(needle) ||
        (row.customerName ?? '').toLowerCase().includes(needle) ||
        (row.phone ?? '').toLowerCase().includes(needle) ||
        (row.invoiceRef ?? '').toLowerCase().includes(needle)
      );
    });
  }, [warranties, q, status]);

  const claimRows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return claims.filter((row) => {
      if (claimStatus !== 'all' && row.status !== claimStatus) return false;
      if (!needle) return true;
      return (
        row.warranty.serial.toLowerCase().includes(needle) ||
        row.warranty.product.name.toLowerCase().includes(needle) ||
        (row.warranty.customerName ?? '').toLowerCase().includes(needle) ||
        (row.warranty.phone ?? '').toLowerCase().includes(needle) ||
        row.description.toLowerCase().includes(needle)
      );
    });
  }, [claims, q, claimStatus]);

  return (
    <div>
      <PageHeader
        kicker="Selling"
        title="Warranties"
        lede="Register a serial after a sale, then handle claims from the website or when a customer walks in."
        action={
          <button type="button" className="primary" onClick={() => setRegistering(true)}>
            Register coverage
          </button>
        }
      />
      <Toolbar>
        <SearchField
          value={q}
          onChange={setQ}
          placeholder={tab === 'coverage' ? 'Serial, product, phone or invoice' : 'Serial, product, phone or problem'}
          label="Search warranties"
        />
        <FilterTabs
          label="Warranty section"
          value={tab}
          onChange={setTab}
          options={[
            { id: 'coverage', label: `Coverage (${warranties.length})` },
            { id: 'claims', label: `Claims${openClaims ? ` (${openClaims} open)` : ''}` },
          ]}
        />
        {tab === 'coverage' ? (
          <FilterTabs
            label="Coverage status"
            value={status}
            onChange={setStatus}
            options={[
              { id: 'all', label: 'All' },
              { id: 'ACTIVE', label: 'Active' },
              { id: 'CLAIMED', label: 'Claim open' },
              { id: 'EXPIRED', label: 'Expired' },
            ]}
          />
        ) : (
          <FilterTabs
            label="Claim status"
            value={claimStatus}
            onChange={setClaimStatus}
            options={[
              { id: 'all', label: 'All' },
              { id: 'OPEN', label: 'Open' },
              { id: 'IN_PROGRESS', label: 'In progress' },
              { id: 'RESOLVED', label: 'Resolved' },
            ]}
          />
        )}
      </Toolbar>
      <ErrorBanner>{error}</ErrorBanner>

      {tab === 'coverage' ? (
        <TableCard className="mt-6">
          <table className="data-table">
            <thead>
              <tr>
                <th>Serial</th>
                <th>Product</th>
                <th>Customer</th>
                <th>Covered until</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-500">
                    Loading coverage…
                  </td>
                </tr>
              ) : coverage.length ? (
                coverage.map((row) => (
                  <tr key={row.id}>
                    <td className="whitespace-nowrap font-semibold tracking-wide">{row.serial}</td>
                    <td>
                      <span className="block font-medium">{row.product.name}</span>
                      {row.invoiceRef ? <span className="text-xs text-slate-500">Invoice {row.invoiceRef}</span> : null}
                    </td>
                    <td>
                      <span className="block">{row.customerName || '—'}</span>
                      {row.phone ? (
                        <a className="text-xs text-[var(--color-primary)] hover:underline" href={`tel:${row.phone}`}>
                          {row.phone}
                        </a>
                      ) : null}
                    </td>
                    <td className="whitespace-nowrap text-slate-500">{dhakaDay(row.endDate)}</td>
                    <td>
                      <StatusBadge value={row.status} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5}>
                    <EmptyState
                      icon={ShieldCheck}
                      title={q || status !== 'all' ? 'No coverage matches' : 'No warranties registered'}
                      hint="After a web or showroom sale, register the unit serial here so the customer can claim later."
                      action={
                        <button type="button" className="primary" onClick={() => setRegistering(true)}>
                          Register coverage
                        </button>
                      }
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </TableCard>
      ) : (
        <TableCard className="mt-6">
          <table className="data-table">
            <thead>
              <tr>
                <th>Opened</th>
                <th>Serial</th>
                <th>Customer</th>
                <th>Problem</th>
                <th>Status</th>
                <th>
                  <span className="sr-only">Review</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500">
                    Loading claims…
                  </td>
                </tr>
              ) : claimRows.length ? (
                claimRows.map((row) => (
                  <tr key={row.id}>
                    <td className="whitespace-nowrap text-slate-500">{dhakaDay(row.createdAt)}</td>
                    <td>
                      <span className="block font-semibold tracking-wide">{row.warranty.serial}</span>
                      <span className="text-xs text-slate-500">{row.warranty.product.name}</span>
                    </td>
                    <td>
                      <span className="block">{row.warranty.customerName || '—'}</span>
                      {row.warranty.phone ? (
                        <a className="text-xs text-[var(--color-primary)] hover:underline" href={`tel:${row.warranty.phone}`}>
                          {row.warranty.phone}
                        </a>
                      ) : null}
                    </td>
                    <td className="max-w-xs truncate">{row.description}</td>
                    <td>
                      <StatusBadge value={row.status} />
                    </td>
                    <td>
                      <button type="button" className="ghost" onClick={() => setInspecting(row)}>
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={ShieldCheck}
                      title={q || claimStatus !== 'all' ? 'No claims match' : 'No claims yet'}
                      hint="Customers file claims at /warranty with their serial and the phone on the coverage."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </TableCard>
      )}

      {registering ? (
        <RegisterDialog
          onClose={() => setRegistering(false)}
          onSaved={(row) => {
            setWarranties((current) => [row, ...current.filter((item) => item.id !== row.id)]);
            setRegistering(false);
            setTab('coverage');
          }}
        />
      ) : null}
      {inspecting ? (
        <ClaimDialog
          claim={inspecting}
          onClose={() => setInspecting(null)}
          onSaved={(row) => {
            setClaims((current) => current.map((item) => (item.id === row.id ? { ...item, ...row } : item)));
            load();
            setInspecting(null);
          }}
        />
      ) : null}
    </div>
  );
}

function RegisterDialog({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: (row: Warranty) => void;
}) {
  const serialRef = useRef<HTMLInputElement>(null);
  const [serial, setSerial] = useState('');
  const [productQ, setProductQ] = useState('');
  const [hits, setHits] = useState<ProductHit[]>([]);
  const [product, setProduct] = useState<ProductHit | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(
    new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dhaka' }).format(new Date()),
  );
  const [months, setMonths] = useState('12');
  const [invoiceRef, setInvoiceRef] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    serialRef.current?.focus();
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    if (product || productQ.trim().length < 2) {
      setHits([]);
      return;
    }
    const handle = window.setTimeout(() => {
      api<{ items: ProductHit[] }>(`/v1/admin/catalog/products?q=${encodeURIComponent(productQ.trim())}&perPage=8`)
        .then((data) => setHits(data.items))
        .catch(() => setHits([]));
    }, 250);
    return () => window.clearTimeout(handle);
  }, [productQ, product]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!product) {
      setError('Search and choose the product this serial belongs to.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const row = await api<Warranty>('/v1/admin/warranties', {
        method: 'POST',
        body: JSON.stringify({
          serial,
          productId: product.id,
          customerName,
          phone,
          purchaseDate,
          months: Number(months),
          invoiceRef: invoiceRef.trim() || null,
        }),
      });
      onSaved(row);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not register warranty');
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center p-4 sm:items-center">
      <button type="button" className="absolute inset-0 bg-slate-950/40" aria-label="Close register coverage" onClick={onClose} />
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="register-title"
        className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-lift"
        onSubmit={onSubmit}
      >
        <p className="page-kicker">Warranties</p>
        <h2 id="register-title" className="mt-1 text-lg font-semibold text-[var(--color-ink)]">
          Register coverage
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Use the serial on the unit and the customer’s phone. They will need both to claim on the website.
        </p>
        <div className="mt-5 space-y-4">
          <Field label="Serial number">
            <input
              ref={serialRef}
              value={serial}
              onChange={(e) => setSerial(e.target.value.toUpperCase())}
              required
              minLength={3}
              autoComplete="off"
              placeholder="e.g. GREE-8821"
            />
          </Field>
          <Field label="Product" hint="Type a name or SKU, then pick from the list.">
            {product ? (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2">
                <span>
                  <span className="block font-medium">{product.name}</span>
                  <span className="text-xs text-slate-500">{product.sku ?? product.variants[0]?.sku}</span>
                </span>
                <button
                  type="button"
                  className="ghost"
                  onClick={() => {
                    setProduct(null);
                    setProductQ('');
                  }}
                >
                  Change
                </button>
              </div>
            ) : (
              <>
                <input
                  value={productQ}
                  onChange={(e) => setProductQ(e.target.value)}
                  placeholder="Search catalog"
                  autoComplete="off"
                />
                {hits.length ? (
                  <ul className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-slate-200">
                    {hits.map((hit) => (
                      <li key={hit.id}>
                        <button
                          type="button"
                          className="flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-slate-50"
                          onClick={() => {
                            setProduct(hit);
                            setMonths(String(hit.warrantyMonths || 12));
                            setHits([]);
                          }}
                        >
                          <span className="font-medium">{hit.name}</span>
                          <span className="text-xs text-slate-500">{hit.sku ?? hit.variants[0]?.sku}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </>
            )}
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Customer name">
              <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
            </Field>
            <Field label="Phone" hint="Must match when they claim online.">
              <input value={phone} onChange={(e) => setPhone(e.target.value)} required inputMode="tel" />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Purchase date">
              <input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} required />
            </Field>
            <Field label="Cover months">
              <input type="number" min={1} max={120} value={months} onChange={(e) => setMonths(e.target.value)} required />
            </Field>
          </div>
          <Field label="Invoice or order no. (optional)">
            <input value={invoiceRef} onChange={(e) => setInvoiceRef(e.target.value)} placeholder="HT-2026-1234" />
          </Field>
        </div>
        <ErrorBanner>{error}</ErrorBanner>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button type="button" className="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save coverage'}
          </button>
        </div>
      </form>
    </div>
  );
}

function ClaimDialog({
  claim,
  onClose,
  onSaved,
}: {
  claim: Claim;
  onClose: () => void;
  onSaved: (row: Claim) => void;
}) {
  const [status, setStatus] = useState(claim.status);
  const [resolution, setResolution] = useState(claim.resolution ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const needsNote = status === 'RESOLVED' || status === 'REJECTED';
  const blocked = needsNote && !resolution.trim();

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (blocked) return;
    setSaving(true);
    setError('');
    try {
      const row = await api<Claim>(`/v1/admin/warranties/claims/${claim.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, resolution: resolution.trim() || undefined }),
      });
      onSaved({ ...claim, ...row });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update claim');
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center p-4 sm:items-center">
      <button type="button" className="absolute inset-0 bg-slate-950/40" aria-label="Close claim" onClick={onClose} />
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="claim-title"
        className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-lift"
        onSubmit={onSubmit}
      >
        <p className="page-kicker">Claim</p>
        <h2 id="claim-title" className="mt-1 text-lg font-semibold text-[var(--color-ink)]">
          {claim.warranty.serial}
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          {claim.warranty.product.name}
          {claim.warranty.customerName ? ` · ${claim.warranty.customerName}` : ''}
        </p>
        {claim.warranty.phone ? (
          <a className="mt-1 inline-block text-sm font-medium text-[var(--color-primary)] hover:underline" href={`tel:${claim.warranty.phone}`}>
            Call {claim.warranty.phone}
          </a>
        ) : null}
        <p className="mt-4 rounded-xl bg-slate-50 px-3 py-2 text-sm leading-relaxed text-slate-700">{claim.description}</p>
        <div className="mt-5 space-y-4">
          <Field label="Status">
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="REJECTED">Declined</option>
            </select>
          </Field>
          <Field
            label={needsNote ? 'What you did' : 'Internal note (optional)'}
            hint={needsNote ? 'The customer does not see this yet; it stays on the claim record.' : 'Visible to staff on this claim.'}
          >
            <textarea rows={3} value={resolution} onChange={(e) => setResolution(e.target.value)} required={needsNote} />
          </Field>
        </div>
        <ErrorBanner>{error}</ErrorBanner>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button type="button" className="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="primary" disabled={saving || blocked}>
            {saving ? 'Saving…' : 'Update claim'}
          </button>
        </div>
      </form>
    </div>
  );
}
