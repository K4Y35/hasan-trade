export type MenuNode = {
  key: string;
  label: string;
  url: string;
  categoryId: string;
  isActive: boolean;
  children: MenuNode[];
};

export type FooterColumn = {
  key: string;
  title: string;
  links: { key: string; label: string; url: string; isActive: boolean }[];
};

export type BannerItem = { key: string; image: string; href: string; alt: string };
export type HeroSlide = { key: string; image: string; href: string; alt: string; heading: string; subheading: string };

export type HomeSection = {
  key: string;
  type: 'HERO' | 'FEATURED_CATEGORIES' | 'FEATURED_PRODUCTS' | 'BANNERS' | 'BRANDS' | 'CUSTOM_HTML';
  title: string;
  isVisible: boolean;
  payload: {
    heading: string;
    subheading: string;
    ctaLabel: string;
    ctaHref: string;
    limit: string;
    categorySlug: string;
    categorySlugs: string[];
    slideSource: 'products' | 'images';
    body: string;
    slides: HeroSlide[];
    items: BannerItem[];
  };
};

export type CategoryOption = { id: string; name: string; slug: string; parentId?: string | null };

export function uid() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `tmp-${Math.random().toString(36).slice(2, 10)}`;
}

export function blankMenu(partial?: Partial<MenuNode>): MenuNode {
  return {
    key: uid(),
    label: '',
    url: '',
    categoryId: '',
    isActive: true,
    children: [],
    ...partial,
  };
}

export function fromApiMenu(item: {
  id?: string;
  label: string;
  url?: string | null;
  href?: string;
  categoryId?: string | null;
  isActive?: boolean;
  children?: unknown[];
}): MenuNode {
  return {
    key: item.id || uid(),
    label: item.label,
    url: item.url || item.href || '',
    categoryId: item.categoryId || '',
    isActive: item.isActive !== false,
    children: Array.isArray(item.children) ? item.children.map((child) => fromApiMenu(child as Parameters<typeof fromApiMenu>[0])) : [],
  };
}

export function toApiMenu(item: MenuNode): {
  label: string;
  url: string | null;
  categoryId: string | null;
  isActive: boolean;
  children: ReturnType<typeof toApiMenu>[];
} {
  return {
    label: item.label.trim(),
    url: item.url.trim() || null,
    categoryId: item.categoryId.trim() || null,
    isActive: item.isActive,
    children: item.children.filter((child) => child.label.trim()).map(toApiMenu),
  };
}

export function footerFromMenu(items: MenuNode[]): FooterColumn[] {
  return items.map((item) => ({
    key: item.key,
    title: item.label,
    links: (item.children.length
      ? item.children
      : item.url
        ? [{ ...item, children: [] }]
        : []
    ).map((link) => ({
      key: link.key,
      label: link.label,
      url: link.url,
      isActive: link.isActive,
    })),
  }));
}

export function footerToMenu(columns: FooterColumn[]): MenuNode[] {
  return columns
    .filter((column) => column.title.trim() || column.links.some((link) => link.label.trim()))
    .map((column) =>
      blankMenu({
        key: column.key,
        label: column.title.trim() || 'Links',
        url: '',
        children: column.links
          .filter((link) => link.label.trim())
          .map((link) =>
            blankMenu({
              key: link.key,
              label: link.label,
              url: link.url,
              isActive: link.isActive,
            }),
          ),
      }),
    );
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function str(value: unknown) {
  return value == null ? '' : String(value);
}

export function blankSection(
  type: HomeSection['type'],
  extras?: Partial<HomeSection>,
): HomeSection {
  const isRow = type === 'FEATURED_PRODUCTS' && Boolean(extras?.payload?.categorySlug || extras?.title === 'Product row');
  return {
    key: uid(),
    type,
    title:
      extras?.title ??
      (type === 'HERO'
        ? 'Hero'
        : type === 'FEATURED_CATEGORIES'
          ? 'Shop by category'
          : type === 'BANNERS'
            ? 'Promotions'
            : type === 'BRANDS'
              ? 'Authorized partner brands'
              : type === 'CUSTOM_HTML'
                ? 'Text block'
                : isRow
                  ? 'Product row'
                  : 'New arrivals'),
    isVisible: extras?.isVisible ?? true,
    payload: {
      heading: '',
      subheading: '',
      ctaLabel: type === 'HERO' ? 'Shop now' : '',
      ctaHref: type === 'HERO' ? '/shop' : '',
      limit: '',
      categorySlug: '',
      categorySlugs: [],
      slideSource: 'products',
      body: '',
      slides: [],
      items: [],
      ...extras?.payload,
    },
  };
}

export function fromApiSection(section: {
  id?: string;
  type: string;
  title?: string | null;
  isVisible?: boolean;
  payload?: unknown;
}): HomeSection {
  const payload = asRecord(section.payload);
  const type = (['HERO', 'FEATURED_CATEGORIES', 'FEATURED_PRODUCTS', 'BANNERS', 'BRANDS', 'CUSTOM_HTML'].includes(section.type)
    ? section.type
    : 'CUSTOM_HTML') as HomeSection['type'];
  const slides = Array.isArray(payload.slides)
    ? payload.slides.map((slide) => {
        const row = asRecord(slide);
        return {
          key: uid(),
          image: str(row.image),
          href: str(row.href),
          alt: str(row.alt),
          heading: str(row.heading),
          subheading: str(row.subheading),
        };
      })
    : [];
  const items = Array.isArray(payload.items)
    ? payload.items.map((item) => {
        const row = asRecord(item);
        return { key: uid(), image: str(row.image), href: str(row.href), alt: str(row.alt) };
      })
    : [];
  const next = blankSection(type, {
    title: str(section.title),
    isVisible: section.isVisible !== false,
    payload: {
      heading: str(payload.heading),
      subheading: str(payload.subheading),
      ctaLabel: str(payload.ctaLabel),
      ctaHref: str(payload.ctaHref),
      limit: payload.limit == null ? '' : String(payload.limit),
      categorySlug: str(payload.categorySlug),
      categorySlugs: Array.isArray(payload.categorySlugs) ? payload.categorySlugs.map(str).filter(Boolean) : [],
      slideSource: payload.slideSource === 'images' ? 'images' : 'products',
      body: str(payload.body),
      slides,
      items,
    },
  });
  return { ...next, key: section.id || next.key };
}

export function toApiSection(section: HomeSection) {
  const limit = Number(section.payload.limit);
  const payload: Record<string, unknown> = {};
  if (section.type === 'HERO') {
    if (section.payload.heading.trim()) payload.heading = section.payload.heading.trim();
    if (section.payload.subheading.trim()) payload.subheading = section.payload.subheading.trim();
    if (section.payload.ctaLabel.trim()) payload.ctaLabel = section.payload.ctaLabel.trim();
    if (section.payload.ctaHref.trim()) payload.ctaHref = section.payload.ctaHref.trim();
    payload.slideSource = section.payload.slideSource;
    payload.categorySlugs = section.payload.categorySlugs;
    if (section.payload.slideSource === 'images') {
      payload.slides = section.payload.slides
        .filter((slide) => slide.image.trim())
        .map(({ image, href, alt, heading, subheading }) => ({
          image,
          href: href.trim() || undefined,
          alt: alt.trim() || undefined,
          heading: heading.trim() || undefined,
          subheading: subheading.trim() || undefined,
        }));
    }
  }
  if (section.type === 'FEATURED_CATEGORIES' || section.type === 'FEATURED_PRODUCTS') {
    if (Number.isFinite(limit) && limit > 0) payload.limit = Math.min(500, Math.floor(limit));
  }
  if (section.type === 'FEATURED_PRODUCTS' && section.payload.categorySlug.trim()) {
    payload.categorySlug = section.payload.categorySlug.trim();
  }
  if (section.type === 'BANNERS') {
    payload.items = section.payload.items
      .filter((item) => item.image.trim())
      .map(({ image, href, alt }) => ({
        image,
        href: href.trim() || undefined,
        alt: alt.trim() || undefined,
      }));
  }
  if (section.type === 'CUSTOM_HTML' && section.payload.body.trim()) {
    payload.body = section.payload.body.trim();
  }
  return {
    type: section.type,
    title: section.title.trim() || null,
    isVisible: section.isVisible,
    payload,
  };
}

export function isProductRow(section: HomeSection) {
  return section.type === 'FEATURED_PRODUCTS' && Boolean(section.payload.categorySlug);
}

export function sectionLabel(section: HomeSection) {
  if (section.type === 'HERO') return 'Hero slider';
  if (section.type === 'FEATURED_CATEGORIES') return 'Category grid';
  if (section.type === 'BANNERS') return 'Promo banners';
  if (section.type === 'BRANDS') return 'Brand logos';
  if (section.type === 'CUSTOM_HTML') return 'Text block';
  if (isProductRow(section)) return 'Product row';
  return 'New arrivals';
}

export function moveItem<T>(list: T[], index: number, delta: number) {
  const next = index + delta;
  if (next < 0 || next >= list.length) return list;
  const copy = [...list];
  const row = copy[index];
  if (row === undefined) return list;
  copy.splice(index, 1);
  copy.splice(next, 0, row);
  return copy;
}
