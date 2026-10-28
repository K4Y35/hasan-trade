'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { ErrorBanner, FilterTabs, PaginationBar, SearchField, TableCard, Toolbar } from '@/components/admin-ui';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { ProductThumb } from '@/components/product-thumb';
import { StatusBadge } from '@/components/status-badge';
import { api } from '@/lib/api';

type Product = {
  id: string;
  name: string;
  slug: string;
  status: string;
  sku: string | null;
  stockQty?: number;
  inStock?: boolean;
  brand: { name: string } | null;
  categories: { name: string }[];
  images: { url: string }[];
  variants: { price: number; sku: string }[];
};

type Category = { id: string; name: string; slug: string; parentId?: string | null; sortOrder?: number };

const FILTERS = ['ALL', 'ACTIVE', 'DRAFT', 'ARCHIVED'] as const;

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

export default function ProductsPage() {
  const router = useRouter();
  const [items, setItems] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('ALL');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const perPage = 20;
  const options = useMemo(() => categoryOptions(categories), [categories]);

  function queryPath({
    query = q,
    nextPage = page,
    nextCategory = category,
    nextStatus = filter,
  }: {
    query?: string;
    nextPage?: number;
    nextCategory?: string;
    nextStatus?: (typeof FILTERS)[number];
  } = {}) {
    const params = new URLSearchParams({
      q: query,
      page: String(nextPage),
      perPage: String(perPage),
    });
    if (nextCategory) params.set('category', nextCategory);
    if (nextStatus !== 'ALL') params.set('status', nextStatus);
    return `/v1/admin/catalog/products?${params}`;
  }

  function load(next?: {
    query?: string;
    nextPage?: number;
    nextCategory?: string;
    nextStatus?: (typeof FILTERS)[number];
  }) {
    setLoading(true);
    setError('');
    api<{ items: Product[]; total: number }>(queryPath(next))
      .then((d) => {
        setItems(d.items);
        setTotal(d.total);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load({ query: '', nextPage: 1 });
    api<Category[]>('/v1/admin/catalog/categories')
      .then(setCategories)
      .catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <PageHeader
        kicker="Catalog"
        title="Products"
        lede="The same models and photos that appear on the storefront. Click a row to edit price, category or gallery."
        action={
          <Link href="/products/new" className="primary inline-flex">
            <Plus size={16} /> New product
          </Link>
        }
      />
      <Toolbar>
        <SearchField
          value={q}
          onChange={setQ}
          placeholder="Search name or SKU"
          label="Search products"
          onSubmit={() => {
            setPage(1);
            load({ query: q, nextPage: 1 });
          }}
        />
        <label className="sm:w-56">
          <span className="sr-only">Filter by category</span>
          <select
            value={category}
            aria-label="Filter by category"
            onChange={(e) => {
              const nextCategory = e.target.value;
              setCategory(nextCategory);
              setPage(1);
              load({ nextCategory, nextPage: 1 });
            }}
          >
            <option value="">All categories</option>
            <option value="_none">Uncategorized</option>
            {options.map((option) => (
              <option key={option.slug} value={option.slug}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <FilterTabs
          label="Filter by status"
          value={filter}
          onChange={(value) => {
            setFilter(value);
            setPage(1);
            load({ nextStatus: value, nextPage: 1 });
          }}
          options={FILTERS.map((value) => ({
            id: value,
            label: value === 'ALL' ? 'All' : value === 'ARCHIVED' ? 'Hidden' : value.charAt(0) + value.slice(1).toLowerCase(),
          }))}
        />
      </Toolbar>
      <ErrorBanner>{error}</ErrorBanner>
      <TableCard className="mt-6">
        <table className="data-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Status</th>
              <th>Stock</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-slate-500">
                  Loading catalog…
                </td>
              </tr>
            ) : items.length ? (
              items.map((p) => {
                const price = p.variants[0]?.price ?? 0;
                const href = `/products/${p.id}`;
                return (
                  <tr
                    key={p.id}
                    className="is-link"
                    onClick={() => router.push(href)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        router.push(href);
                      }
                    }}
                    tabIndex={0}
                  >
                    <td>
                      <div className="flex items-center gap-3">
                        <ProductThumb url={p.images[0]?.url} alt="" />
                        <span className="min-w-0">
                          <Link href={href} className="block font-medium text-slate-900 hover:text-[var(--color-primary)]" onClick={(e) => e.stopPropagation()}>
                            {p.name}
                          </Link>
                          <span className="mt-0.5 block text-xs text-slate-500">
                            {p.sku ?? p.variants[0]?.sku}
                            {p.brand ? ` · ${p.brand.name}` : ''}
                          </span>
                        </span>
                      </div>
                    </td>
                    <td className="text-slate-600">{p.categories[0]?.name ?? 'Uncategorized'}</td>
                    <td>
                      <StatusBadge value={p.status} />
                    </td>
                    <td className={p.inStock === false || (p.stockQty ?? 0) <= 2 ? 'font-semibold text-[var(--color-secondary)]' : ''}>
                      {p.stockQty ?? 0}
                    </td>
                    <td className="font-medium">{price > 0 ? `৳${price.toLocaleString()}` : 'Call'}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5}>
                  <EmptyState
                    title={category ? 'No products in this category' : 'No products match this search'}
                    hint="Create a product or clear filters to see the catalog."
                    action={
                      category || q || filter !== 'ALL' ? (
                        <button
                          type="button"
                          className="ghost"
                          onClick={() => {
                            setQ('');
                            setCategory('');
                            setFilter('ALL');
                            setPage(1);
                            load({ query: '', nextCategory: '', nextStatus: 'ALL', nextPage: 1 });
                          }}
                        >
                          Clear filters
                        </button>
                      ) : (
                        <Link href="/products/new" className="primary">
                          New product
                        </Link>
                      )
                    }
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </TableCard>
      {!loading ? (
        <PaginationBar
          page={page}
          perPage={perPage}
          total={total}
          noun={category && category !== '_none' ? 'products in this category' : 'products'}
          onPage={(next) => {
            setPage(next);
            load({ nextPage: next });
          }}
        />
      ) : null}
    </div>
  );
}
