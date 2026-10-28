export type Tokens = {
  colorPrimary: string;
  colorSecondary: string;
  colorAccent: string;
  colorBackground: string;
  colorForeground: string;
  colorMuted: string;
  fontSans: string;
  fontHeading: string;
  radius: string;
  buttonStyle: string;
  cardStyle: string;
};

export type StoreSettings = {
  store: {
    name: string;
    tagline: string | null;
    description?: string | null;
    logoUrl: string | null;
    faviconUrl?: string | null;
    ogImageUrl?: string | null;
    logoHeight?: number;
    phone: string | null;
    whatsapp?: string | null;
    email: string | null;
    address?: string | null;
    hours?: string | null;
    currencySymbol: string;
    footerText: string | null;
    copyrightText: string | null;
    allowCod: boolean;
    metaTitle?: string | null;
    metaDescription?: string | null;
    facebookUrl?: string | null;
    instagramUrl?: string | null;
    youtubeUrl?: string | null;
    popup?: {
      enabled: boolean;
      title?: string | null;
      body?: string | null;
      imageUrl?: string | null;
      ctaLabel?: string | null;
      ctaUrl?: string | null;
      version?: string;
    };
    tokens: Tokens;
  };
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  sku?: string | null;
  shortDescription: string | null;
  description: string | null;
  warrantyMonths: number;
  brand: { id: string; name: string; slug: string } | null;
  categories: { id: string; name: string; slug: string; isPrimary?: boolean }[];
  variants: { id: string; name: string | null; sku: string; price: number; compareAtPrice: number | null; isDefault: boolean }[];
  images: { id: string; url: string; alt: string | null }[];
  specs: { name: string; slug: string; unit: string | null; value: string }[];
  inStock?: boolean;
  stockQty?: number;
};

export type ProductDetail = Product & { related: Product[] };

export type ProductReview = {
  id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export type CategoryRow = { slug: string; title: string; products: Product[] };

export type Slide = { image: string; href?: string; alt?: string; heading?: string; subheading?: string };

export type NavLink = { label: string; href: string; children?: NavLink[] };

export type FooterColumn = { title: string; href?: string; links: { label: string; href: string }[] };

export type StoreNav = { header: NavLink[]; footer: FooterColumn[] };

export type Home = {
  settings: StoreSettings['store'] & { tagline?: string | null; description?: string | null };
  featured: Product[];
  categories: { id: string; name: string; slug: string; imageUrl?: string | null }[];
  brands: { id: string; name: string; slug: string }[];
  categoryRows?: CategoryRow[];
  nav?: StoreNav;
  sections: {
    id: string;
    type: string;
    title: string | null;
    payload: {
      heading?: string;
      subheading?: string;
      ctaLabel?: string;
      ctaHref?: string;
      limit?: number;
      categorySlug?: string;
      categorySlugs?: string[];
      slideSource?: 'products' | 'images';
      body?: string;
      slides?: Slide[];
      items?: { image: string; href?: string; alt?: string }[];
    };
  }[];
};

export type StoreOrder = {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  subtotal: number;
  tax: number;
  discount?: number;
  coupon?: { id: string; code: string; type: string; value: number } | null;
  placedAt: string;
  name: string;
  phone: string;
  email?: string | null;
  customerNotes?: string | null;
  shippingAddress?: {
    line1?: string;
    line2?: string;
    thana?: string;
    district?: string;
    division?: string;
    postalCode?: string;
  } | null;
  items: { id: string; name: string; sku: string; quantity: number; unitPrice: number; total: number }[];
  payments?: { provider: string; status: string; amount: number }[];
};

export type CartItem = {
  variantId: string;
  productId: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  slug: string;
  imageUrl?: string;
};
