import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductBuyBox } from '@/components/product-buy-box';
import { ProductCard } from '@/components/product-card';
import { ProductGallery } from '@/components/product-gallery';
import { ProductTabs } from '@/components/product-tabs';
import { publicApi } from '@/lib/api';
import { fetchPublicStore, withBranding } from '@/lib/branding';
import { formatPrice } from '@/lib/money';
import type { ProductDetail } from '@/lib/types';

async function loadProduct(slug: string) {
  try {
    return await publicApi<ProductDetail>(`/v1/catalog/products/${slug}`);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const [product, store] = await Promise.all([loadProduct(slug), fetchPublicStore()]);
  const branding = withBranding(store);
  if (!product) return { title: branding.metaTitle || branding.name };
  return {
    title: `${product.name} – ${branding.name}`,
    description: product.shortDescription?.slice(0, 160) ?? `Buy ${product.name} from ${branding.name}.`,
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [product, store] = await Promise.all([loadProduct(slug), fetchPublicStore()]);
  if (!product) notFound();
  const branding = withBranding(store);

  const variant = product.variants.find((item) => item.isDefault) ?? product.variants[0];
  const price = variant?.price ?? 0;
  const compare = variant?.compareAtPrice;
  const onSale = Boolean(compare && compare > price && price > 0);
  const category = product.categories.find((item) => item.isPrimary) ?? product.categories[0];

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 pb-24 md:px-6 md:py-12 md:pb-12">
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="hover:text-[var(--color-primary)]">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/shop" className="hover:text-[var(--color-primary)]">
              Shop
            </Link>
          </li>
          {category ? (
            <>
              <li aria-hidden="true">/</li>
              <li>
                <Link href={`/shop?category=${category.slug}`} className="hover:text-[var(--color-primary)]">
                  {category.name}
                </Link>
              </li>
            </>
          ) : null}
          <li aria-hidden="true">/</li>
          <li className="max-w-[18rem] truncate text-slate-800" aria-current="page">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="mt-8 grid items-start gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <ProductGallery product={product} onSale={onSale} />
        <ProductBuyBox product={product} price={price} compare={compare} onSale={onSale} />
      </div>

      <ProductTabs product={product} />

      {product.related?.length ? (
        <section className="mt-16 pb-16">
          <p className="section-kicker">You may also like</p>
          <h2 className="section-title">Related products</h2>
          <div className="stagger mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {product.related.slice(0, 4).map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}

      <aside className="relative mb-8 overflow-hidden rounded-3xl bg-[var(--color-primary)] px-6 py-8 text-white md:px-10">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[var(--color-accent)]/25 blur-3xl motion-safe:animate-hero-float" />
        <div className="pointer-events-none absolute -bottom-12 left-16 h-32 w-32 rounded-full bg-white/10 blur-2xl motion-safe:animate-hero-float-alt" />
        <p className="relative text-xs font-semibold uppercase tracking-[0.16em] text-white/70">Need help choosing?</p>
        <h2 className="relative mt-2 text-2xl font-semibold tracking-tight">Talk to a specialist before you buy</h2>
        <p className="relative mt-2 max-w-2xl text-white/80">
          Confirm tonnage, installation, and spare parts from the Mirabazar showroom. Current price
          {price > 0 ? ` ${formatPrice(price)}` : ' available on call'}.
        </p>
        <div className="relative mt-5 flex flex-wrap gap-3">
          <a href={branding.phoneHref} className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[var(--color-primary)] transition duration-300 hover:-translate-y-0.5 hover:shadow-lg">
            Call {branding.phone}
          </a>
          <a href={branding.whatsappHref} target="_blank" rel="noreferrer" className="rounded-full border border-white/30 px-5 py-2.5 text-sm font-semibold transition duration-300 hover:-translate-y-0.5 hover:bg-white/10">
            WhatsApp
          </a>
        </div>
      </aside>
    </main>
  );
}
