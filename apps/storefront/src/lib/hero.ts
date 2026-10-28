import { CATEGORY_LEADS } from '@/lib/site';
import type { CategoryRow, Home, Product } from '@/lib/types';

export type HeroProductSlide = {
  slug: string;
  title: string;
  lead: string;
  productName: string;
  brand: string | null;
  image: string;
  href: string;
  productHref: string;
  price: number;
};

const HERO_ORDER = [
  'air-conditioner',
  'generator',
  'ac-spare-parts',
  'camera',
  'refrigerator-and-freezer',
  'television',
];

const HERO_TITLES: Record<string, string> = {
  'air-conditioner': 'Air conditioners',
  generator: 'Diesel generators',
  'ac-spare-parts': 'Gas charging & spare parts',
  camera: 'CCTV & surveillance',
  'refrigerator-and-freezer': 'Refrigerators & freezers',
  television: 'Smart televisions',
  'fan-and-cooler': 'Fans & coolers',
  'kitchen-appliances': 'Kitchen appliances',
};

const PICK_HINTS: Record<string, RegExp> = {
  'ac-spare-parts': /\b(gas|r134|r410|r32|charging|manifold|refrigerant)\b/i,
  generator: /\b(kva|kw|diesel|cummins|generator)\b/i,
  'air-conditioner': /\b(split|inverter|cassette|vrf|fairy|pular)\b/i,
  camera: /\b(ip|xvr|nvr|dome|bullet|cctv)\b/i,
  'refrigerator-and-freezer': /\b(fridge|freezer|refrigerator|chest)\b/i,
  television: /\b(tv|uhd|smart|android|inch)\b/i,
};

function firstImage(product: Product) {
  return product.images[0]?.url ?? null;
}

function pickProduct(row: CategoryRow): Product | undefined {
  const withImage = row.products.filter((item) => firstImage(item));
  const hint = PICK_HINTS[row.slug];
  if (hint) {
    const preferred = withImage.find((item) => hint.test(`${item.name} ${item.shortDescription ?? ''}`));
    if (preferred) return preferred;
  }
  return withImage[0];
}

function defaultPrice(product: Product) {
  return (product.variants.find((item) => item.isDefault) ?? product.variants[0])?.price ?? 0;
}

function slideFromProduct(row: { slug: string; title: string }, product: Product): HeroProductSlide | null {
  const image = firstImage(product);
  if (!image) return null;
  return {
    slug: row.slug,
    title: HERO_TITLES[row.slug] ?? row.title,
    lead: CATEGORY_LEADS[row.slug] ?? product.shortDescription ?? '',
    productName: product.name,
    brand: product.brand?.name ?? null,
    image,
    href: `/shop?category=${row.slug}`,
    productHref: `/product/${product.slug}`,
    price: defaultPrice(product),
  };
}

function customSlides(home: Home | null): HeroProductSlide[] {
  const hero = home?.sections.find((section) => section.type === 'HERO');
  if (hero?.payload.slideSource !== 'images') return [];
  return (hero.payload.slides ?? [])
    .filter((slide) => slide.image)
    .map((slide, index) => ({
      slug: `slide-${index}`,
      title: slide.heading || slide.alt || hero.title || 'Featured',
      lead: slide.subheading || hero.payload.subheading || '',
      productName: slide.alt || slide.heading || '',
      brand: null,
      image: slide.image,
      href: slide.href || hero.payload.ctaHref || '/shop',
      productHref: slide.href || hero.payload.ctaHref || '/shop',
      price: 0,
    }));
}

export function buildHeroSlides(home: Home | null): HeroProductSlide[] {
  const uploaded = customSlides(home);
  if (uploaded.length) return uploaded;

  const hero = home?.sections.find((section) => section.type === 'HERO');
  const preferred = hero?.payload.categorySlugs?.filter(Boolean) ?? [];
  const rows = home?.categoryRows ?? [];
  const rank = (slug: string) => {
    const i = preferred.length ? preferred.indexOf(slug) : HERO_ORDER.indexOf(slug);
    return i === -1 ? 99 : i;
  };
  const fromRows = [...rows]
    .filter((row) => !preferred.length || preferred.includes(row.slug))
    .sort((a, b) => rank(a.slug) - rank(b.slug))
    .flatMap((row: CategoryRow) => {
      const product = pickProduct(row);
      const slide = product ? slideFromProduct(row, product) : null;
      return slide ? [slide] : [];
    });
  if (fromRows.length) return fromRows;

  const grouped = new Map<string, { title: string; product: Product }>();
  for (const product of home?.featured ?? []) {
    const category = product.categories.find((item) => item.isPrimary) ?? product.categories[0];
    if (!category || grouped.has(category.slug) || !firstImage(product)) continue;
    grouped.set(category.slug, { title: category.name, product });
  }
  return [...grouped.entries()]
    .sort((a, b) => rank(a[0]) - rank(b[0]))
    .flatMap(([slug, { title, product }]) => {
      const slide = slideFromProduct({ slug, title }, product);
      return slide ? [slide] : [];
    });
}
