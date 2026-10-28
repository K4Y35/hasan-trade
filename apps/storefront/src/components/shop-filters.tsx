'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { SHOP_FILTER_TREE, type NavNode } from '@/lib/site';

type Brand = { id: string; name: string; slug: string };

const PRICE_MIN = 0;
const PRICE_MAX = 699000;
const PRICE_STEP = 10;

function formatTaka(value: number) {
  return `${value.toLocaleString('en-US')}৳`;
}

function hrefWith(base: string, extra: Record<string, string | undefined>) {
  const url = new URL(base, 'http://local.shop');
  for (const [key, value] of Object.entries(extra)) {
    if (value) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
  }
  const qs = url.searchParams.toString();
  return qs ? `/shop?${qs}` : '/shop';
}

function FilterBranch({
  item,
  depth,
  current,
}: {
  item: NavNode;
  depth: number;
  current: { category?: string; q?: string; brand?: string };
}) {
  const url = new URL(item.href, 'http://local.shop');
  const cat = url.searchParams.get('category') ?? undefined;
  const q = url.searchParams.get('q') ?? undefined;
  const brand = url.searchParams.get('brand') ?? undefined;
  const active = cat === current.category && q === current.q && brand === current.brand;
  const childActive = item.children?.some((child) => {
    const childUrl = new URL(child.href, 'http://local.shop');
    return (
      (childUrl.searchParams.get('category') ?? undefined) === current.category &&
      (childUrl.searchParams.get('q') ?? undefined) === current.q &&
      (childUrl.searchParams.get('brand') ?? undefined) === current.brand
    );
  });
  const open =
    depth === 0
      ? Boolean(active || childActive || current.category === cat)
      : depth === 1
        ? Boolean(active || childActive)
        : true;

  return (
    <li>
      <Link
        href={item.href}
        className={`block rounded-md py-1 transition duration-200 hover:translate-x-0.5 hover:text-[var(--color-primary)] ${
          active ? 'font-semibold text-[var(--color-primary)]' : 'text-slate-700'
        }`}
        style={{ paddingLeft: depth * 14 }}
      >
        {item.label}
      </Link>
      {open && item.children?.length ? (
        <ul className="mt-0.5">
          {item.children.map((child) => (
            <FilterBranch key={child.label} item={child} depth={depth + 1} current={current} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function ShopFilters({
  brands,
  params,
}: {
  brands: Brand[];
  params: { category?: string; brand?: string; q?: string; minPrice?: string; maxPrice?: string; sort?: string };
}) {
  const router = useRouter();
  const [minPrice, setMinPrice] = useState(Number(params.minPrice ?? PRICE_MIN));
  const [maxPrice, setMaxPrice] = useState(Number(params.maxPrice ?? PRICE_MAX));

  useEffect(() => {
    setMinPrice(Number(params.minPrice ?? PRICE_MIN));
    setMaxPrice(Number(params.maxPrice ?? PRICE_MAX));
  }, [params.minPrice, params.maxPrice]);
  const tree = useMemo(
    () => [...SHOP_FILTER_TREE].sort((a, b) => a.label.localeCompare(b.label)),
    [],
  );
  const minPct = ((minPrice - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
  const maxPct = ((maxPrice - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;

  function keep() {
    return {
      category: params.category,
      brand: params.brand,
      q: params.q,
      sort: params.sort,
      minPrice: params.minPrice,
      maxPrice: params.maxPrice,
    };
  }

  return (
    <aside className="card h-fit space-y-8 p-6 lg:sticky lg:top-24">
      <div>
        <h2 className="text-sm font-semibold">Filter by price</h2>
        <div className="mt-2 h-px bg-slate-200" />
        <form action="/shop" method="get" className="mt-5">
          {params.category ? <input type="hidden" name="category" value={params.category} /> : null}
          {params.brand ? <input type="hidden" name="brand" value={params.brand} /> : null}
          {params.q ? <input type="hidden" name="q" value={params.q} /> : null}
          {params.sort ? <input type="hidden" name="sort" value={params.sort} /> : null}
          {minPrice > PRICE_MIN ? <input type="hidden" name="minPrice" value={minPrice} /> : null}
          {maxPrice < PRICE_MAX ? <input type="hidden" name="maxPrice" value={maxPrice} /> : null}
          <div className="price-slider">
            <div className="price-slider-rail" />
            <div className="price-slider-fill" style={{ left: `${minPct}%`, width: `${Math.max(0, maxPct - minPct)}%` }} />
            <input
              type="range"
              min={PRICE_MIN}
              max={PRICE_MAX}
              step={PRICE_STEP}
              value={minPrice}
              aria-label="Min price"
              onChange={(e) => {
                const next = Number(e.target.value);
                setMinPrice(Math.min(next, maxPrice - PRICE_STEP));
              }}
            />
            <input
              type="range"
              min={PRICE_MIN}
              max={PRICE_MAX}
              step={PRICE_STEP}
              value={maxPrice}
              aria-label="Max price"
              onChange={(e) => {
                const next = Number(e.target.value);
                setMaxPrice(Math.max(next, minPrice + PRICE_STEP));
              }}
            />
          </div>
          <div className="flex items-center justify-between gap-2">
            <button
              type="submit"
              className="shrink-0 rounded bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
            >
              Filter
            </button>
            <p className="text-right text-[13px] leading-snug text-slate-600">
              Price: {formatTaka(minPrice)} — {formatTaka(maxPrice)}
            </p>
          </div>
        </form>
      </div>

      <div>
        <h2 className="text-sm font-semibold">Product categories</h2>
        <div className="mt-2 h-px bg-slate-200" />
        <ul className="mt-3 space-y-0.5 text-sm">
          <li>
            <Link
              href="/shop"
              className={`block rounded-md py-1 ${!params.category && !params.q ? 'font-semibold text-[var(--color-primary)]' : 'hover:text-[var(--color-primary)]'}`}
            >
              All products
            </Link>
          </li>
          {tree.map((item) => (
            <FilterBranch
              key={item.label}
              item={item}
              depth={0}
              current={{ category: params.category, q: params.q, brand: params.brand }}
            />
          ))}
        </ul>
      </div>

      <div>
        <h2 className="text-sm font-semibold">Brands</h2>
        <div className="mt-2 h-px bg-slate-200" />
        <ul className="mt-3 space-y-1 text-sm">
          {brands.map((b) => (
            <li key={b.id}>
              <Link
                href={hrefWith('/shop', { ...keep(), brand: params.brand === b.slug ? undefined : b.slug })}
                className={`block rounded-md py-1 ${params.brand === b.slug ? 'font-semibold text-[var(--color-primary)]' : 'hover:text-[var(--color-primary)]'}`}
              >
                {b.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

export function ShopSort({
  params,
  total,
}: {
  params: { category?: string; brand?: string; q?: string; minPrice?: string; maxPrice?: string; sort?: string };
  total: number;
}) {
  const router = useRouter();
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-slate-500">
        {total === 0 ? 'No products found' : `Showing ${total} result${total === 1 ? '' : 's'}`}
      </p>
      <select
        className="field w-auto min-w-44 py-2 text-sm"
        value={params.sort ?? 'name'}
        onChange={(e) =>
          router.push(
            hrefWith('/shop', {
              category: params.category,
              brand: params.brand,
              q: params.q,
              minPrice: params.minPrice,
              maxPrice: params.maxPrice,
              sort: e.target.value,
            }),
          )
        }
      >
        <option value="name">Default sorting</option>
        <option value="latest">Sort by latest</option>
        <option value="price-asc">Sort by price: low to high</option>
        <option value="price-desc">Sort by price: high to low</option>
      </select>
    </div>
  );
}
