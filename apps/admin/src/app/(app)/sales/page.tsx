'use client';

import Link from 'next/link';
import { Download, Search } from 'lucide-react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ErrorBanner, FilterTabs, PaginationBar, TableCard } from '@/components/admin-ui';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { ProductThumb } from '@/components/product-thumb';
import { StatusBadge } from '@/components/status-badge';
import { api, downloadFile } from '@/lib/api';

type Source = 'all' | 'website' | 'pos';
type View = 'lines' | 'products';

type Summary = {
  units: number;
  revenue: number;
  websiteUnits: number;
  websiteRevenue: number;
  posUnits: number;
  posRevenue: number;
  lines: number;
};

type SaleLine = {
  id: string;
  source: 'website' | 'pos';
  soldAt: string;
  productId: string;
  productName: string;
  sku: string;
  category: string | null;
  brand: string | null;
  imageUrl: string | null;
  quantity: number;
  unitPrice: number;
  total: number;
  reference: string;
  href: string | null;
  customer: string;
  status: string;
};

type ProductRow = {
  productId: string;
  productName: string;
  sku: string;
  category: string | null;
  brand: string | null;
  imageUrl: string | null;
  websiteQty: number;
  posQty: number;
  quantity: number;
  revenue: number;
};

type Category = { id: string; name: string; slug: string; parentId?: string | null; sortOrder?: number };
type Brand = { id: string; name: string; slug: string };

const SOURCES: { id: Source; label: string }[] = [
  { id: 'all', label: 'All sources' },
  { id: 'website', label: 'Website' },
  { id: 'pos', label: 'Shop POS' },
];

function dhakaDate(iso: string) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Dhaka',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

function dhakaParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Dhaka',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const pick = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
  return { year: pick('year'), month: pick('month'), day: pick('day') };
}

function monthBounds(year: number, month: number) {
  const pad = (n: number) => String(n).padStart(2, '0');
  const from = `${year}-${pad(month)}-01`;
  const last = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return { from, to: `${year}-${pad(month)}-${pad(last)}` };
}

function thisMonthRange() {
  const { year, month } = dhakaParts();
  return monthBounds(Number(year), Number(month));
}

function categoryOptions(categories: Category[]) {
  const sorted = [...categories].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name),
  );
  const parents = sorted.filter((category) => !category.parentId);
  const childrenOf = new Map<string, Category[]>();
  for (const category of sorted) {
    if (!category.parentId) continue;
    const list = childrenOf.get(category.parentId) ?? [];
    list.push(category);
    childrenOf.set(category.parentId, list);
  }
  const rows: { slug: string; label: string }[] = [];
  const seen = new Set<string>();
  for (const parent of parents) {
    rows.push({ slug: parent.slug, label: parent.name });
    seen.add(parent.id);
    for (const child of childrenOf.get(parent.id) ?? []) {
      rows.push({ slug: child.slug, label: `— ${child.name}` });
      seen.add(child.id);
    }
  }
  for (const category of sorted) {
    if (!seen.has(category.id)) rows.push({ slug: category.slug, label: category.name });
  }
  return rows;
}

function money(value: number) {
  return `৳${Math.round(value).toLocaleString()}`;
}

function FilterField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      {children}
    </label>
  );
}

export default function SalesPage() {
  const initial = thisMonthRange();
  const [view, setView] = useState<View>('lines');
  const [source, setSource] = useState<Source>('all');
  const [q, setQ] = useState('');
  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);
  const [month, setMonth] = useState(initial.from.slice(0, 7));
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [includeCancelled, setIncludeCancelled] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [lines, setLines] = useState<SaleLine[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const perPage = 25;
  const options = useMemo(() => categoryOptions(categories), [categories]);

  function queryString(next?: {
    view?: View;
    source?: Source;
    q?: string;
    from?: string;
    to?: string;
    category?: string;
    brand?: string;
    includeCancelled?: boolean;
    page?: number;
  }) {
    const params = new URLSearchParams({
      view: next?.view ?? view,
      source: next?.source ?? source,
      q: next?.q ?? q,
      page: String(next?.page ?? page),
      perPage: String(perPage),
    });
    const nextFrom = next?.from ?? from;
    const nextTo = next?.to ?? to;
    if (nextFrom) params.set('from', nextFrom);
    if (nextTo) params.set('to', nextTo);
    const nextCategory = next?.category ?? category;
    const nextBrand = next?.brand ?? brand;
    if (nextCategory) params.set('category', nextCategory);
    if (nextBrand) params.set('brand', nextBrand);
    if (next?.includeCancelled ?? includeCancelled) params.set('includeCancelled', '1');
    return params.toString();
  }

  function load(next?: Parameters<typeof queryString>[0]) {
    setLoading(true);
    setError('');
    api<{ summary: Summary; total: number; items: SaleLine[] | ProductRow[] }>(`/v1/reports/sales?${queryString(next)}`)
      .then((data) => {
        setSummary(data.summary);
        setTotal(data.total);
        if ((next?.view ?? view) === 'products') setProducts(data.items as ProductRow[]);
        else setLines(data.items as SaleLine[]);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load sales'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get('source');
    const nextSource = requested === 'website' || requested === 'pos' ? requested : 'all';
    setSource(nextSource);
    load({ source: nextSource, page: 1 });
    api<Category[]>('/v1/admin/catalog/categories').then(setCategories).catch(() => undefined);
    api<Brand[]>('/v1/admin/catalog/brands').then(setBrands).catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applyRange(nextFrom: string, nextTo: string, nextMonth = '') {
    setFrom(nextFrom);
    setTo(nextTo);
    setMonth(nextMonth);
    setPage(1);
    load({ from: nextFrom, to: nextTo, page: 1 });
  }

  const { year: currentYear, month: currentMonth, day: currentDay } = dhakaParts();

  const cards = summary
    ? [
        { label: 'Units sold', value: summary.units.toLocaleString() },
        { label: 'Revenue', value: money(summary.revenue) },
        { label: 'Website', value: `${summary.websiteUnits} · ${money(summary.websiteRevenue)}` },
        { label: 'Shop POS', value: `${summary.posUnits} · ${money(summary.posRevenue)}` },
      ]
    : [];

  return (
    <div>
      <PageHeader
        kicker="Reports"
        title="Sales"
        lede="Every product sold on the website and at the showroom counter, with date, month, and source filters."
        action={
          <button
            type="button"
            className="ghost"
            disabled={downloading}
            onClick={async () => {
              setDownloading(true);
              try {
                const stamp = from?.slice(0, 7) || currentYear;
                await downloadFile(`/v1/reports/sales.csv?${queryString()}`, `sales-${stamp}.csv`);
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Could not download');
              } finally {
                setDownloading(false);
              }
            }}
          >
            <Download size={16} /> {downloading ? 'Downloading…' : 'Download CSV'}
          </button>
        }
      />

      <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Date range">
        {[
          {
            label: 'Today',
            run: () => applyRange(`${currentYear}-${currentMonth}-${currentDay}`, `${currentYear}-${currentMonth}-${currentDay}`),
          },
          {
            label: 'This month',
            run: () => {
              const range = thisMonthRange();
              applyRange(range.from, range.to, range.from.slice(0, 7));
            },
          },
          {
            label: 'Last month',
            run: () => {
              const monthNumber = Number(currentMonth);
              const yearNumber = Number(currentYear);
              const prevMonth = monthNumber === 1 ? 12 : monthNumber - 1;
              const prevYear = monthNumber === 1 ? yearNumber - 1 : yearNumber;
              const range = monthBounds(prevYear, prevMonth);
              applyRange(range.from, range.to, range.from.slice(0, 7));
            },
          },
          {
            label: 'This year',
            run: () => applyRange(`${currentYear}-01-01`, `${currentYear}-12-31`, ''),
          },
          { label: 'All time', run: () => applyRange('', '', '') },
        ].map((preset) => (
          <button key={preset.label} type="button" className="ghost" onClick={preset.run}>
            {preset.label}
          </button>
        ))}
      </div>

      <form
        className="card mt-4 grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-4"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          load({ page: 1, q });
        }}
      >
        <FilterField label="Search product">
          <span className="relative block">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name or SKU" aria-label="Search product name or SKU" />
          </span>
        </FilterField>
        <FilterField label="Month">
          <input
            type="month"
            value={month}
            onChange={(e) => {
              const value = e.target.value;
              setMonth(value);
              if (!value) return;
              const [year, monthNumber] = value.split('-').map(Number);
              const range = monthBounds(year, monthNumber);
              setFrom(range.from);
              setTo(range.to);
              setPage(1);
              load({ from: range.from, to: range.to, page: 1 });
            }}
            aria-label="Filter by month"
          />
        </FilterField>
        <FilterField label="From">
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </FilterField>
        <FilterField label="To">
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </FilterField>
        <FilterField label="Category">
          <select
            value={category}
            onChange={(e) => {
              const nextCategory = e.target.value;
              setCategory(nextCategory);
              setPage(1);
              load({ category: nextCategory, page: 1 });
            }}
          >
            <option value="">All categories</option>
            {options.map((option) => (
              <option key={option.slug} value={option.slug}>
                {option.label}
              </option>
            ))}
          </select>
        </FilterField>
        <FilterField label="Brand">
          <select
            value={brand}
            onChange={(e) => {
              const nextBrand = e.target.value;
              setBrand(nextBrand);
              setPage(1);
              load({ brand: nextBrand, page: 1 });
            }}
          >
            <option value="">All brands</option>
            {brands.map((item) => (
              <option key={item.id} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
        </FilterField>
        <div className="flex items-end">
          <label className="flex items-center gap-2 pb-3 text-sm text-slate-700">
            <input
              type="checkbox"
              className="h-4 w-4 shrink-0 accent-[var(--color-primary)]"
              checked={includeCancelled}
              onChange={(e) => {
                const next = e.target.checked;
                setIncludeCancelled(next);
                setPage(1);
                load({ includeCancelled: next, page: 1 });
              }}
            />
            Include cancelled and void
          </label>
        </div>
        <div className="flex items-end">
          <button className="primary w-full">Apply dates</button>
        </div>
      </form>

      <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <FilterTabs
          label="Sales source"
          value={source}
          onChange={(id) => {
            setSource(id);
            setPage(1);
            load({ source: id, page: 1 });
          }}
          options={SOURCES}
        />
        <FilterTabs
          label="Sales view"
          value={view}
          onChange={(id) => {
            setView(id);
            setPage(1);
            load({ view: id, page: 1 });
          }}
          options={[
            { id: 'lines', label: 'Each sale' },
            { id: 'products', label: 'By product' },
          ]}
        />
      </div>

      <ErrorBanner>{error}</ErrorBanner>

      {cards.length ? (
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {cards.map((card) => (
            <div key={card.label} className="card p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{card.label}</p>
              <p className="mt-2 text-lg font-bold text-[var(--color-ink)]">{card.value}</p>
            </div>
          ))}
        </div>
      ) : null}

      <TableCard className="mt-6">
        {view === 'lines' ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Source</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Total</th>
                <th>Reference</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500">
                    Loading sales…
                  </td>
                </tr>
              ) : lines.length ? (
                lines.map((line) => (
                  <tr key={`${line.source}-${line.id}`}>
                    <td className="whitespace-nowrap text-slate-500">{dhakaDate(line.soldAt)}</td>
                    <td>
                      <span className={`badge ${line.source === 'website' ? 'badge-info' : 'badge-ok'}`}>
                        {line.source === 'website' ? 'Website' : 'Shop POS'}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <ProductThumb url={line.imageUrl} alt="" />
                        <span className="min-w-0">
                          <Link href={`/products/${line.productId}`} className="block font-medium text-slate-900 hover:text-[var(--color-primary)]">
                            {line.productName}
                          </Link>
                          <span className="mt-0.5 block text-xs text-slate-500">
                            {line.sku}
                            {line.category ? ` · ${line.category}` : ''}
                            {line.brand ? ` · ${line.brand}` : ''}
                          </span>
                        </span>
                      </div>
                    </td>
                    <td>
                      {line.quantity}
                      <span className="mt-0.5 block text-xs text-slate-500">{money(line.unitPrice)} each</span>
                    </td>
                    <td className="font-medium">{money(line.total)}</td>
                    <td>
                      {line.href ? (
                        <Link href={line.href} className="font-medium hover:text-[var(--color-primary)]">
                          {line.reference}
                        </Link>
                      ) : (
                        <span className="font-medium">{line.reference}</span>
                      )}
                      <span className="mt-0.5 block text-xs text-slate-500">{line.customer}</span>
                      <StatusBadge value={line.status} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      title="No sales in this range"
                      hint="Try another month, clear filters, or include cancelled sales."
                      action={
                        <button type="button" className="ghost" onClick={() => applyRange('', '', '')}>
                          Show all time
                        </button>
                      }
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Website</th>
                <th>Shop POS</th>
                <th>Units</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-500">
                    Loading sales…
                  </td>
                </tr>
              ) : products.length ? (
                products.map((row) => (
                  <tr key={row.productId || row.sku}>
                    <td>
                      <div className="flex items-center gap-3">
                        <ProductThumb url={row.imageUrl} alt="" />
                        <span className="min-w-0">
                          <Link href={`/products/${row.productId}`} className="block font-medium text-slate-900 hover:text-[var(--color-primary)]">
                            {row.productName}
                          </Link>
                          <span className="mt-0.5 block text-xs text-slate-500">
                            {row.sku}
                            {row.category ? ` · ${row.category}` : ''}
                            {row.brand ? ` · ${row.brand}` : ''}
                          </span>
                        </span>
                      </div>
                    </td>
                    <td>{row.websiteQty}</td>
                    <td>{row.posQty}</td>
                    <td className="font-medium">{row.quantity}</td>
                    <td className="font-medium">{money(row.revenue)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5}>
                    <EmptyState title="No product sales in this range" hint="Try another month or clear the filters." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </TableCard>

      {!loading ? (
        <PaginationBar
          page={page}
          perPage={perPage}
          total={total}
          noun={view === 'products' ? 'products' : 'sales'}
          onPage={(next) => {
            setPage(next);
            load({ page: next });
          }}
        />
      ) : null}
    </div>
  );
}
