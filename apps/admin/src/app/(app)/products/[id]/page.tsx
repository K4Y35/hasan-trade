'use client';

import Link from 'next/link';
import { ExternalLink, ImagePlus, Trash2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ErrorBanner, LoadingState, StickySaveBar } from '@/components/admin-ui';
import { Field } from '@/components/field';
import { PageHeader } from '@/components/page-header';
import { ProductThumb } from '@/components/product-thumb';
import { api } from '@/lib/api';
import { mediaUrl } from '@/lib/media';

type Option = { id: string; name: string };
type Image = { id: string; url: string; alt: string | null };
type Variant = {
  id: string;
  name: string | null;
  sku: string;
  price: number;
  compareAtPrice: number | null;
  isDefault: boolean;
};
type Product = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  status: string;
  shortDescription: string | null;
  description: string | null;
  warrantyMonths: number;
  stockQty?: number;
  brand: Option | null;
  categories: Option[];
  variants: Variant[];
  images: Image[];
};

const STOREFRONT = process.env.NEXT_PUBLIC_STOREFRONT_URL ?? 'http://localhost:3000';

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [brands, setBrands] = useState<Option[]>([]);
  const [categories, setCategories] = useState<Option[]>([]);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    sku: '',
    price: '0',
    compareAtPrice: '',
    warrantyMonths: '12',
    shortDescription: '',
    description: '',
    status: 'DRAFT',
    brandId: '',
    categoryId: '',
  });

  function hydrate(row: Product) {
    const variant = row.variants.find((v) => v.isDefault) ?? row.variants[0];
    setProduct(row);
    setForm({
      name: row.name,
      slug: row.slug,
      sku: variant?.sku ?? row.sku ?? '',
      price: String(variant?.price ?? 0),
      compareAtPrice: variant?.compareAtPrice != null ? String(variant.compareAtPrice) : '',
      warrantyMonths: String(row.warrantyMonths),
      shortDescription: row.shortDescription ?? '',
      description: row.description ?? '',
      status: row.status,
      brandId: row.brand?.id ?? '',
      categoryId: row.categories[0]?.id ?? '',
    });
  }

  useEffect(() => {
    Promise.all([
      api<Product>(`/v1/admin/catalog/products/${id}`),
      api<Option[]>('/v1/admin/catalog/brands'),
      api<Option[]>('/v1/admin/catalog/categories'),
    ])
      .then(([row, brandRows, categoryRows]) => {
        hydrate(row);
        setBrands(brandRows);
        setCategories(categoryRows);
      })
      .catch((e) => setError(e.message));
  }, [id]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!product) return;
    setError('');
    setSaving(true);
    const variant = product.variants.find((v) => v.isDefault) ?? product.variants[0];
    try {
      const updated = await api<Product>(`/v1/admin/catalog/products/${product.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: form.name,
          slug: form.slug,
          sku: form.sku || undefined,
          status: form.status,
          shortDescription: form.shortDescription || null,
          description: form.description || null,
          warrantyMonths: Number(form.warrantyMonths),
          brandId: form.brandId || null,
          categoryIds: form.categoryId ? [form.categoryId] : [],
          variants: variant
            ? [
                {
                  id: variant.id,
                  sku: form.sku || variant.sku,
                  price: Number(form.price),
                  compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : null,
                  isDefault: true,
                },
              ]
            : undefined,
        }),
      });
      hydrate(updated);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save');
    } finally {
      setSaving(false);
    }
  }

  async function onUpload(file: File) {
    setUploading(true);
    setError('');
    try {
      const data = new FormData();
      data.append('file', file);
      data.append('alt', form.name);
      data.append('folder', 'products');
      const asset = await api<{ id: string; url: string }>('/v1/media', { method: 'POST', body: data });
      await api(`/v1/admin/catalog/products/${id}/images`, {
        method: 'POST',
        body: JSON.stringify({ url: asset.url, mediaId: asset.id, alt: form.name }),
      });
      hydrate(await api<Product>(`/v1/admin/catalog/products/${id}`));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not upload image');
    } finally {
      setUploading(false);
    }
  }

  async function removeImage(imageId: string) {
    await api(`/v1/admin/catalog/products/${id}/images/${imageId}`, { method: 'DELETE' });
    hydrate(await api<Product>(`/v1/admin/catalog/products/${id}`));
  }

  if (error && !product) {
    return (
      <div>
        <PageHeader kicker="Catalog" title="Product" action={<Link href="/products" className="ghost">Back to products</Link>} />
        <ErrorBanner>
          {error}. <Link href="/products" className="font-semibold underline">Back to products</Link>
        </ErrorBanner>
      </div>
    );
  }
  if (!product) return <LoadingState label="Loading product…" />;

  return (
    <form onSubmit={onSubmit} className="space-y-6 pb-28">
      <PageHeader
        kicker="Catalog"
        title={product.name}
        lede="Changes go live on the storefront when status is Active. Photos here are the same files customers see."
        action={
          <>
            <a href={`${STOREFRONT}/product/${product.slug}`} className="ghost" target="_blank" rel="noreferrer">
              <ExternalLink size={14} /> View on storefront
            </a>
            <Link href="/products" className="ghost">
              Back
            </Link>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <aside className="space-y-6 xl:col-start-2 xl:row-start-1 xl:sticky xl:top-4 xl:self-start">
          <div className="card space-y-4 p-5">
            <Field label="Status" hint="Only Active products appear in Shop and search.">
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="DRAFT">Draft — not on the shop</option>
                <option value="ACTIVE">Active — visible on the shop</option>
                <option value="ARCHIVED">Hidden from the shop</option>
              </select>
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
            <Field label="Category" hint="Assign Camera, Air Conditioner, Generator and similar collections to appear on the homepage.">
              <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                <option value="">Uncategorized</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </Field>
            <p className="text-xs text-slate-500">Available stock: {product.stockQty ?? 0}</p>
          </div>

          <div className="card space-y-4 p-5">
            <div>
              <p className="text-sm font-medium text-slate-700">Gallery</p>
              <p className="mt-0.5 text-xs text-slate-500">First image is the storefront card photo.</p>
            </div>
            {product.images.length ? (
              <div className="grid grid-cols-2 gap-3">
                {product.images.map((image, index) => (
                  <figure key={image.id} className="relative overflow-hidden rounded-xl bg-slate-50 ring-1 ring-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={mediaUrl(image.url)} alt={image.alt ?? product.name} className="h-32 w-full object-contain p-3" />
                    {index === 0 ? (
                      <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--color-primary)]">
                        Cover
                      </span>
                    ) : null}
                    <button
                      type="button"
                      className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-red-600 shadow-sm"
                      onClick={() => removeImage(image.id)}
                      aria-label="Remove image"
                    >
                      <Trash2 size={14} />
                    </button>
                  </figure>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
                <span className="inline-flex justify-center">
                  <ProductThumb />
                </span>
                <p className="mt-3 text-sm font-medium text-slate-700">No photos yet</p>
                <p className="mt-1 text-xs text-slate-500">Upload a product shot so the storefront card is not blank.</p>
              </div>
            )}
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 hover:border-[var(--color-accent)] hover:text-[var(--color-primary)]">
              <ImagePlus size={16} />
              {uploading ? 'Uploading…' : 'Upload image'}
              <input
                className="sr-only"
                type="file"
                accept="image/*"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void onUpload(file);
                  e.target.value = '';
                }}
              />
            </label>
          </div>
        </aside>

        <div className="card space-y-5 p-6 xl:col-start-1 xl:row-start-1">
          <Field label="Name">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </Field>
          <Field label="Storefront URL slug" hint="Used in /product/… links. Keep it stable if the product is already indexed.">
            <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="SKU">
              <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
            </Field>
            <Field label="Warranty (months)">
              <input type="number" min={0} value={form.warrantyMonths} onChange={(e) => setForm({ ...form, warrantyMonths: e.target.value })} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Price (BDT)" hint="Use 0 for call-for-price models.">
              <input type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </Field>
            <Field label="Compare-at price">
              <input type="number" min={0} value={form.compareAtPrice} onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })} />
            </Field>
          </div>
          <Field label="Short description">
            <textarea rows={3} value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} />
          </Field>
          <Field label="Full description">
            <textarea rows={8} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
        </div>
      </div>
      <StickySaveBar
        saving={saving}
        saved={saved ? 'Saved — storefront will show the update' : false}
        error={error}
        label="Save product"
        disabled={uploading}
      />
    </form>
  );
}
