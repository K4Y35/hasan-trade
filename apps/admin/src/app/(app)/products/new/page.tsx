'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ErrorBanner } from '@/components/admin-ui';
import { Field } from '@/components/field';
import { PageHeader } from '@/components/page-header';
import { api } from '@/lib/api';

type Option = { id: string; name: string };

export default function NewProductPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [brands, setBrands] = useState<Option[]>([]);
  const [categories, setCategories] = useState<Option[]>([]);
  const [form, setForm] = useState({
    name: '',
    sku: '',
    price: '0',
    warrantyMonths: '12',
    shortDescription: '',
    status: 'ACTIVE',
    brandId: '',
    categoryId: '',
  });

  useEffect(() => {
    Promise.all([api<Option[]>('/v1/admin/catalog/brands'), api<Option[]>('/v1/admin/catalog/categories')]).then(
      ([brandRows, categoryRows]) => {
        setBrands(brandRows);
        setCategories(categoryRows);
      },
    );
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const created = await api<{ id: string }>('/v1/admin/catalog/products', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name,
          sku: form.sku || undefined,
          status: form.status,
          shortDescription: form.shortDescription || null,
          warrantyMonths: Number(form.warrantyMonths),
          brandId: form.brandId || null,
          categoryIds: form.categoryId ? [form.categoryId] : undefined,
          variants: [{ sku: form.sku || `${form.name}-1`, price: Number(form.price), isDefault: true }],
        }),
      });
      router.push(`/products/${created.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save');
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-xl space-y-4">
      <PageHeader
        kicker="Catalog"
        title="New product"
        lede="Save the basics, then add the same photos customers will see on the storefront."
        action={
          <Link href="/products" className="ghost">
            Back to products
          </Link>
        }
      />
      <div className="card space-y-4 p-6">
        <Field label="Name">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </Field>
        <Field label="SKU">
          <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
        </Field>
        <Field label="Price (BDT)" hint="Use 0 if staff should quote the price.">
          <input type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        </Field>
        <Field label="Warranty (months)">
          <input type="number" min={0} value={form.warrantyMonths} onChange={(e) => setForm({ ...form, warrantyMonths: e.target.value })} />
        </Field>
        <Field label="Short description">
          <textarea rows={3} value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} />
        </Field>
        <Field label="Brand">
          <select value={form.brandId} onChange={(e) => setForm({ ...form, brandId: e.target.value })}>
            <option value="">No brand</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Category" hint="Pick a collection so Shop filters and homepage rows can find it.">
          <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
            <option value="">Uncategorized</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Status">
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="DRAFT">Draft — not on the shop</option>
            <option value="ACTIVE">Active — visible on the shop</option>
            <option value="ARCHIVED">Hidden from the shop</option>
          </select>
        </Field>
        <ErrorBanner>{error}</ErrorBanner>
        <button className="primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save and add photos'}
        </button>
      </div>
    </form>
  );
}
