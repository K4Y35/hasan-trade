import { env } from '../env';
import { num } from './http';

function origin(url: string) {
  return url.replace(/\/$/, '');
}

export function publicMediaUrl(url: string | null | undefined) {
  if (!url) return '';
  if (/^https?:\/\//i.test(url) || url.startsWith('data:')) return url;
  if (!url.startsWith('/')) return url;
  if (url.startsWith('/uploads')) {
    const uploadsBase = (process.env.STORAGE_PUBLIC_URL ?? 'http://localhost:4000/uploads').replace(/\/$/, '');
    return `${uploadsBase.replace(/\/uploads$/, '')}${url}`;
  }
  return `${origin(env.storefrontUrl)}${url}`;
}

function serializeVariant(variant: {
  id: string;
  name: string | null;
  sku: string;
  barcode: string | null;
  price: { toString(): string };
  compareAtPrice: { toString(): string } | null;
  isDefault: boolean;
  isActive?: boolean;
}) {
  return {
    id: variant.id,
    name: variant.name,
    sku: variant.sku,
    barcode: variant.barcode,
    price: num(variant.price) ?? 0,
    compareAtPrice: num(variant.compareAtPrice),
    isDefault: variant.isDefault,
    isActive: variant.isActive ?? true,
  };
}

function stockQtyOf(
  variants?: (Parameters<typeof serializeVariant>[0] & {
    stockBalances?: { onHand: number; reserved: number }[];
  })[],
) {
  return (variants ?? []).reduce((sum, variant) => {
    const balances = variant.stockBalances ?? [];
    return (
      sum +
      balances.reduce((inner, row) => inner + Math.max(0, (row.onHand ?? 0) - (row.reserved ?? 0)), 0)
    );
  }, 0);
}

export function serializeProduct(product: {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  status: string;
  shortDescription: string | null;
  description: string | null;
  warrantyMonths: number;
  isSerialized: boolean;
  brand?: { id: string; name: string; slug: string } | null;
  categories?: { isPrimary: boolean; category: { id: string; name: string; slug: string } }[];
  variants?: (Parameters<typeof serializeVariant>[0] & {
    stockBalances?: { onHand: number; reserved: number }[];
  })[];
  images?: { id: string; url: string; alt: string | null; sortOrder: number }[];
  specs?: { value: string; field: { name: string; slug: string; unit: string | null } }[];
}) {
  const stockQty = stockQtyOf(product.variants);
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    status: product.status,
    shortDescription: product.shortDescription,
    description: product.description,
    warrantyMonths: product.warrantyMonths,
    isSerialized: product.isSerialized,
    brand: product.brand ?? null,
    categories: (product.categories ?? []).map((c) => ({ ...c.category, isPrimary: c.isPrimary })),
    variants: (product.variants ?? []).map(serializeVariant),
    images: (product.images ?? []).map((image) => ({ ...image, url: publicMediaUrl(image.url) })),
    specs: (product.specs ?? []).map((s) => ({
      name: s.field.name,
      slug: s.field.slug,
      unit: s.field.unit,
      value: s.value,
    })),
    stockQty,
    inStock: stockQty > 0,
  };
}

export function withPublicMedia<T extends { imageUrl?: string | null; logoUrl?: string | null }>(row: T) {
  return {
    ...row,
    ...(row.imageUrl != null ? { imageUrl: publicMediaUrl(row.imageUrl) } : {}),
    ...(row.logoUrl != null ? { logoUrl: publicMediaUrl(row.logoUrl) } : {}),
  };
}
