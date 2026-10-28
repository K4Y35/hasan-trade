'use client';

import { useEffect, useMemo, useState } from 'react';
import { SearchField, Toolbar } from '@/components/admin-ui';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { ProductThumb } from '@/components/product-thumb';
import { StatusBadge } from '@/components/status-badge';
import { api } from '@/lib/api';

type Brand = { id: string; name: string; slug: string; isActive?: boolean; logoUrl?: string | null };

export default function BrandsPage() {
  const [items, setItems] = useState<Brand[]>([]);
  const [name, setName] = useState('');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  function load() {
    api<Brand[]>('/v1/admin/catalog/brands')
      .then(setItems)
      .finally(() => setLoading(false));
  }
  useEffect(() => {
    load();
  }, []);

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((b) => b.name.toLowerCase().includes(needle) || b.slug.toLowerCase().includes(needle));
  }, [items, q]);

  return (
    <div>
      <PageHeader kicker="Catalog" title="Brands" lede="Authorized brands shown on product cards and the partner strip." />
      <Toolbar>
        <form
          className="flex min-w-0 flex-1 max-w-lg gap-2"
          onSubmit={async (e) => {
            e.preventDefault();
            setSaving(true);
            try {
              await api('/v1/admin/catalog/brands', { method: 'POST', body: JSON.stringify({ name }) });
              setName('');
              load();
            } finally {
              setSaving(false);
            }
          }}
        >
          <input placeholder="New brand name" aria-label="New brand" value={name} onChange={(e) => setName(e.target.value)} required />
          <button className="primary shrink-0" disabled={saving}>
            {saving ? 'Adding…' : 'Add'}
          </button>
        </form>
        <SearchField value={q} onChange={setQ} placeholder="Find a brand" label="Search brands" />
      </Toolbar>
      <p className="mt-3 text-sm text-slate-500">
        {items.length} {items.length === 1 ? 'brand' : 'brands'}
      </p>
      <ul className="card mt-4 divide-y divide-slate-100">
        {loading ? (
          <li className="px-4 py-10 text-center text-sm text-slate-500">Loading brands…</li>
        ) : visible.length ? (
          visible.map((b) => (
            <li key={b.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
              <div className="flex min-w-0 items-center gap-3">
                <ProductThumb url={b.logoUrl} alt="" />
                <div className="min-w-0">
                  <p className="font-medium">{b.name}</p>
                  <p className="text-slate-500">{b.slug}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge value={b.isActive === false ? 'ARCHIVED' : 'ACTIVE'} />
                <button
                  type="button"
                  className="ghost"
                  onClick={async () => {
                    await api(`/v1/admin/catalog/brands/${b.id}`, {
                      method: 'PATCH',
                      body: JSON.stringify({ isActive: !b.isActive }),
                    });
                    load();
                  }}
                >
                  {b.isActive === false ? 'Show' : 'Hide'}
                </button>
              </div>
            </li>
          ))
        ) : (
          <li>
            <EmptyState
              title={q ? 'No matching brands' : 'No brands yet'}
              hint={q ? 'Clear search to see the full list.' : 'Add a brand so product cards can show the authorized line.'}
            />
          </li>
        )}
      </ul>
    </div>
  );
}
