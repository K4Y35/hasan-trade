'use client';

import { useEffect, useMemo, useState } from 'react';
import { SearchField, Toolbar } from '@/components/admin-ui';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { ProductThumb } from '@/components/product-thumb';
import { StatusBadge } from '@/components/status-badge';
import { api } from '@/lib/api';

type Category = { id: string; name: string; slug: string; isActive: boolean; imageUrl?: string | null };

export default function CategoriesPage() {
  const [items, setItems] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  function load() {
    api<Category[]>('/v1/admin/catalog/categories')
      .then(setItems)
      .finally(() => setLoading(false));
  }
  useEffect(() => {
    load();
  }, []);

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((c) => c.name.toLowerCase().includes(needle) || c.slug.toLowerCase().includes(needle));
  }, [items, q]);

  return (
    <div>
      <PageHeader
        kicker="Catalog"
        title="Categories"
        lede="These collections power Shop filters and homepage rows. Hidden categories stay off the storefront menu."
      />
      <Toolbar>
        <form
          className="flex min-w-0 flex-1 max-w-lg gap-2"
          onSubmit={async (e) => {
            e.preventDefault();
            setSaving(true);
            try {
              await api('/v1/admin/catalog/categories', { method: 'POST', body: JSON.stringify({ name }) });
              setName('');
              load();
            } finally {
              setSaving(false);
            }
          }}
        >
          <input placeholder="New category name" aria-label="New category" value={name} onChange={(e) => setName(e.target.value)} required />
          <button className="primary shrink-0" disabled={saving}>
            {saving ? 'Adding…' : 'Add'}
          </button>
        </form>
        <SearchField value={q} onChange={setQ} placeholder="Find a category" label="Search categories" />
      </Toolbar>
      <p className="mt-3 text-sm text-slate-500">
        {items.length} {items.length === 1 ? 'category' : 'categories'}
      </p>
      <ul className="card mt-4 divide-y divide-slate-100">
        {loading ? (
          <li className="px-4 py-10 text-center text-sm text-slate-500">Loading categories…</li>
        ) : visible.length ? (
          visible.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
              <div className="flex min-w-0 items-center gap-3">
                <ProductThumb url={c.imageUrl} alt="" />
                <div className="min-w-0">
                  <p className="font-medium">{c.name}</p>
                  <p className="text-slate-500">{c.slug}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge value={c.isActive ? 'ACTIVE' : 'ARCHIVED'} />
                <button
                  type="button"
                  className="ghost"
                  onClick={async () => {
                    await api(`/v1/admin/catalog/categories/${c.id}`, {
                      method: 'PATCH',
                      body: JSON.stringify({ isActive: !c.isActive }),
                    });
                    load();
                  }}
                >
                  {c.isActive ? 'Hide' : 'Show'}
                </button>
              </div>
            </li>
          ))
        ) : (
          <li>
            <EmptyState
              title={q ? 'No matching categories' : 'No categories yet'}
              hint={q ? 'Clear search to see the full list.' : 'Add a collection so Shop filters and homepage rows have somewhere to live.'}
            />
          </li>
        )}
      </ul>
    </div>
  );
}
