import Link from 'next/link';
import { ProductCard } from '@/components/product-card';
import { ShopFilters, ShopSort } from '@/components/shop-filters';
import { publicApi } from '@/lib/api';
import { NAV } from '@/lib/site';
import type { Product } from '@/lib/types';

function titleFromNav(category?: string, q?: string) {
  if (!category && !q) return undefined;
  const walk = (nodes: typeof NAV): string | undefined => {
    for (const node of nodes) {
      const url = new URL(node.href, 'http://local.shop');
      if (url.searchParams.get('category') === (category ?? null) && (url.searchParams.get('q') ?? undefined) === q) {
        return node.label;
      }
      if (node.children) {
        const found = walk(node.children);
        if (found) return found;
      }
    }
    return undefined;
  };
  return walk(NAV);
}

type Props = {
  searchParams: Promise<{
    category?: string;
    brand?: string;
    q?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    page?: string;
  }>;
};

export default async function ShopPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Number(params.page || 1);
  const query = new URLSearchParams();
  if (params.category) query.set('category', params.category);
  if (params.brand) query.set('brand', params.brand);
  if (params.q) query.set('q', params.q);
  if (params.minPrice) query.set('minPrice', params.minPrice);
  if (params.maxPrice) query.set('maxPrice', params.maxPrice);
  if (params.sort) query.set('sort', params.sort);
  query.set('page', String(page));
  query.set('perPage', '12');

  const [catalog, brands] = await Promise.all([
    publicApi<{ items: Product[]; total: number; page: number; perPage: number }>(`/v1/catalog/products?${query}`),
    publicApi<{ id: string; name: string; slug: string }[]>('/v1/catalog/brands'),
  ]);

  const title =
    titleFromNav(params.category, params.q) ??
    brands.find((b) => b.slug === params.brand)?.name ??
    (params.q ? `Search: ${params.q}` : 'Shop');

  const pages = Math.max(1, Math.ceil(catalog.total / catalog.perPage));
  const pageHref = (next: number) => {
    const qs = new URLSearchParams(query);
    qs.set('page', String(next));
    qs.delete('perPage');
    return `/shop?${qs}`;
  };

  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-6 py-12 lg:grid-cols-[270px_1fr]">
      <ShopFilters brands={brands} params={params} />
      <section>
        <p className="section-kicker">Catalog</p>
        <h1 className="text-3xl font-semibold capitalize tracking-tight">{title}</h1>
        <div className="mt-4">
          <ShopSort params={params} total={catalog.total} />
        </div>
        <div className="stagger mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {catalog.items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        {catalog.items.length === 0 ? <p className="mt-8 text-slate-500">No products found in this collection yet.</p> : null}
        {pages > 1 ? (
          <nav className="mt-10 flex flex-wrap gap-2">
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
              <Link
                key={n}
                href={pageHref(n)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition duration-300 ${
                  n === catalog.page ? 'bg-[var(--color-primary)] text-white' : 'bg-white shadow-sm hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md'
                }`}
              >
                {n}
              </Link>
            ))}
          </nav>
        ) : null}
      </section>
    </main>
  );
}
