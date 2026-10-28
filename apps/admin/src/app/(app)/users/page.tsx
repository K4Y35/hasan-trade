'use client';

import { Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ErrorBanner, PaginationBar, SearchField, TableCard, Toolbar } from '@/components/admin-ui';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
import { api } from '@/lib/api';

type Customer = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: string;
  createdAt: string;
  lastLoginAt: string | null;
  orderCount: number;
  lastOrder: { orderNumber: string; placedAt: string; total: number } | null;
};

export default function UsersPage() {
  const [items, setItems] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const perPage = 20;

  function load(query = q, nextPage = page) {
    setLoading(true);
    setError('');
    api<{ items: Customer[]; total: number }>(
      `/v1/admin/customers?q=${encodeURIComponent(query)}&page=${nextPage}&perPage=${perPage}`,
    )
      .then((data) => {
        setItems(data.items);
        setTotal(data.total);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load customers'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <PageHeader
        kicker="Selling"
        title="Customers"
        lede="People who created an account on the website. Guest checkouts are not listed here."
      />
      <Toolbar>
        <SearchField
          value={q}
          onChange={setQ}
          placeholder="Search name, email or phone"
          label="Search registered customers"
          onSubmit={() => {
            setPage(1);
            load(q, 1);
          }}
        />
      </Toolbar>
      <ErrorBanner>{error}</ErrorBanner>
      <TableCard className="mt-6">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact</th>
              <th>Registered</th>
              <th>Last sign-in</th>
              <th>Orders</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-slate-500">
                  Loading customers…
                </td>
              </tr>
            ) : items.length ? (
              items.map((user) => (
                <tr key={user.id}>
                  <td className="font-medium">{user.name}</td>
                  <td>
                    <p>{user.email ?? '—'}</p>
                    <p className="text-slate-500">{user.phone ?? '—'}</p>
                  </td>
                  <td className="whitespace-nowrap text-slate-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="whitespace-nowrap text-slate-500">
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}
                  </td>
                  <td>
                    <p>{user.orderCount}</p>
                    {user.lastOrder ? (
                      <p className="text-xs text-slate-500">
                        {user.lastOrder.orderNumber} · ৳{Number(user.lastOrder.total).toLocaleString()}
                      </p>
                    ) : null}
                  </td>
                  <td>
                    <StatusBadge value={user.status} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6}>
                  <EmptyState
                    icon={Users}
                    title="No registered customers yet"
                    hint="Accounts created from the storefront sign-up page will appear here."
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
          noun="customers"
          onPage={(next) => {
            setPage(next);
            load(q, next);
          }}
        />
      ) : null}
    </div>
  );
}
