export type CmsMenuNode = {
  label: string;
  url?: string | null;
  children?: CmsMenuNode[];
};

export type CmsHomeSection = {
  type: 'HERO' | 'FEATURED_CATEGORIES' | 'FEATURED_PRODUCTS' | 'BANNERS' | 'BRANDS' | 'CUSTOM_HTML';
  title?: string | null;
  sortOrder: number;
  payload: Record<string, unknown>;
};

function shop(category?: string, q?: string, brand?: string) {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (brand) params.set('brand', brand);
  if (q) params.set('q', q);
  const qs = params.toString();
  return qs ? `/shop?${qs}` : '/shop';
}

const ac = 'air-conditioner';
const fridge = 'refrigerator-and-freezer';
const camera = 'camera';
const kitchen = 'kitchen-appliances';
const wash = 'washing-machine';
const fan = 'fan-and-cooler';
const small = 'small-appliances';
const gen = 'generator';
const tv = 'television';
const spare = 'ac-spare-parts';

export const DEFAULT_HEADER_MENU: CmsMenuNode[] = [
  {
    label: 'Air Conditioner',
    url: shop(ac),
    children: [
      {
        label: 'Split Wall Mounted',
        url: shop(ac, 'split'),
        children: [
          { label: 'GREE', url: shop(ac, undefined, 'gree') },
          { label: 'HAIKO', url: shop(ac, 'HAIKO') },
          { label: 'GENERAL', url: shop(ac, 'General') },
          { label: 'MIDEA', url: shop(ac, 'Midea') },
          { label: 'ELITE', url: shop(ac, 'Elite') },
          { label: 'Haier', url: shop(ac, undefined, 'haier') },
          { label: 'VIOMI Brand', url: shop(ac, 'VIOMI') },
          { label: 'GREEN AIRE', url: shop(ac, 'GREEN AIRE') },
          { label: 'Safe', url: shop(ac, 'Safe') },
        ],
      },
      {
        label: 'Portable',
        url: shop(ac, 'portable'),
        children: [
          { label: 'Gree Brand Portable Air-Conditioner', url: shop(ac, 'portable gree') },
          { label: 'Midea Brand Portable Air-Conditioner', url: shop(ac, 'portable midea') },
        ],
      },
      {
        label: 'Ceiling',
        url: shop(ac, 'ceiling'),
        children: [
          { label: 'GREE Brand', url: shop(ac, 'ceiling gree') },
          { label: 'MIDEA Brand', url: shop(ac, 'ceiling midea') },
          { label: 'GENERAL Brand', url: shop(ac, 'ceiling general') },
        ],
      },
      {
        label: 'Cassette',
        url: shop(ac, 'cassette'),
        children: [
          { label: 'Gree Brand', url: shop(ac, 'cassette gree') },
          { label: 'Midea Brand', url: shop(ac, 'cassette midea') },
          { label: 'General Brand', url: shop(ac, 'cassette general') },
        ],
      },
      {
        label: 'Floor Standing',
        url: shop(ac, 'floor'),
        children: [
          { label: 'Gree Brand', url: shop(ac, 'floor gree') },
          { label: 'Midea Brand', url: shop(ac, 'floor midea') },
        ],
      },
      {
        label: 'Ducted Split',
        url: shop(ac, 'duct'),
        children: [
          { label: 'Gree brand Duct Type', url: shop(ac, 'duct gree') },
          { label: 'Midea Brand Duct Type', url: shop(ac, 'duct midea') },
        ],
      },
      { label: 'Multi VRF', url: shop(ac, 'VRF') },
      { label: 'Chiller', url: shop(ac, 'chiller') },
    ],
  },
  { label: 'Air-Conditioner Spare Parts', url: shop(spare) },
  {
    label: 'Refrigerator & Freezer',
    url: shop(fridge),
    children: [
      { label: 'KONKA Refrigerator', url: shop(fridge, undefined, 'konka') },
      { label: 'KONKA Chiller Fridge', url: shop(fridge, 'chiller') },
      { label: 'KONKA Chest freezer', url: shop(fridge, 'chest freezer') },
      { label: 'HAIKO Refrigerator', url: shop(fridge, 'HAIKO') },
      { label: 'HAIKO Chest Freezer', url: shop(fridge, 'HAIKO chest') },
      { label: 'Side by Side', url: shop(fridge, 'side by side') },
    ],
  },
  {
    label: 'Camera',
    url: shop(camera),
    children: [
      {
        label: 'HDCVI Camera',
        url: shop(camera, 'HDCVI'),
        children: [
          { label: 'Bullet', url: shop(camera, 'HDCVI bullet') },
          { label: 'Dome', url: shop(camera, 'HDCVI dome') },
          { label: 'Fisheye', url: shop(camera, 'HDCVI fisheye') },
        ],
      },
      {
        label: 'IP Camera',
        url: shop(camera, 'IP Camera'),
        children: [
          { label: 'Bullet', url: shop(camera, 'IP bullet') },
          { label: 'Dome', url: shop(camera, 'IP dome') },
          { label: 'Fisheye', url: shop(camera, 'IP fisheye') },
          { label: 'PTZ', url: shop(camera, 'PTZ') },
        ],
      },
      { label: 'Wifi Camera', url: shop(camera, 'wifi') },
      { label: 'Network Video Recorder(NVR)', url: shop(camera, 'NVR') },
      { label: 'Digital Video Recorder(DVR)', url: shop(camera, 'DVR') },
      { label: 'Camera Accessories', url: shop(camera, 'accessories') },
    ],
  },
  {
    label: 'Fan & Cooler',
    url: shop(fan),
    children: [
      { label: 'Air Circulator Fan', url: shop(fan, 'circulator') },
      { label: 'Ceiling Fan', url: shop(fan, 'ceiling') },
      { label: 'Air Cooler', url: shop(fan, 'cooler') },
      { label: 'Air Curtain', url: shop(fan, 'curtain') },
    ],
  },
  {
    label: 'Kitchen Appliances',
    url: shop(kitchen),
    children: [
      { label: 'Blender and Mixer', url: shop(kitchen, 'blender') },
      { label: 'Electric Kettle', url: shop(kitchen, 'kettle') },
      { label: 'Gas Stove', url: shop(kitchen, 'stove') },
      { label: 'Infrared Cooker', url: shop(kitchen, 'infrared') },
      { label: 'Microwave Oven', url: shop(kitchen, 'microwave') },
      { label: 'Pressure Cooker', url: shop(kitchen, 'pressure') },
      { label: 'Rice Cooker', url: shop(kitchen, 'rice') },
      { label: 'Water Dispenser', url: shop(kitchen, 'dispenser') },
      { label: 'KONKA KITCHEN HOOD', url: shop(kitchen, 'hood') },
    ],
  },
  {
    label: 'Washing Machine',
    url: shop(wash),
    children: [
      { label: 'Front Loading', url: shop(wash, 'front') },
      { label: 'Top Loading', url: shop(wash, 'top') },
      { label: 'Semi Auto', url: shop(wash, 'semi') },
    ],
  },
  {
    label: 'Generator',
    url: shop(gen),
    children: [
      { label: 'Perkins', url: shop(gen, undefined, 'perkins') },
      { label: 'Cummins', url: shop(gen, undefined, 'cummins') },
      { label: 'Ricardo', url: shop(gen, undefined, 'ricardo') },
      { label: 'Green Power', url: shop(gen, 'Green Power') },
    ],
  },
  { label: 'Transformer', url: shop('transformer') },
  { label: 'Accessories', url: shop('accessories') },
  {
    label: 'Small Appliances',
    url: shop(small),
    children: [
      { label: 'Air Purifier', url: shop(small, 'purifier') },
      { label: 'Dehumidifier', url: shop(small, 'dehumidifier') },
      { label: 'Electric Iron', url: shop(small, 'iron') },
      { label: 'Voltage Stabilizer', url: shop(small, 'stabilizer') },
    ],
  },
  {
    label: 'Television',
    url: shop(tv),
    children: [
      {
        label: 'Smart LED TV',
        url: shop(tv, 'smart'),
        children: [
          { label: 'Konka Brand Smart TV', url: shop(tv, undefined, 'konka') },
          { label: 'Xiaomi brand QLED TV', url: shop(tv, undefined, 'xiaomi') },
        ],
      },
      { label: 'Non Smart TV', url: shop(tv, 'led') },
    ],
  },
  {
    label: 'AC Servicing',
    url: '/services',
    children: [
      { label: 'Installation', url: '/services' },
      { label: 'Our Services', url: '/services' },
    ],
  },
  { label: 'About Us', url: '/about' },
  { label: 'Contact', url: '/contact' },
];

export const DEFAULT_FOOTER_MENU: CmsMenuNode[] = [
  {
    label: 'Power & Cooling',
    children: [
      { label: 'Air Conditioners', url: shop(ac) },
      { label: 'AC Spare Parts', url: shop(spare) },
      { label: 'Diesel Generators', url: shop(gen) },
      { label: 'Transformers', url: shop('transformer') },
      { label: 'AC Installation', url: '/services' },
    ],
  },
  {
    label: 'Commercial Appliances',
    children: [
      { label: 'Refrigerators & Freezers', url: shop(fridge) },
      { label: 'CCTV Systems', url: shop(camera) },
      { label: 'Industrial Fans', url: shop(fan) },
      { label: 'Washing Machines', url: shop(wash) },
      { label: 'Kitchen Range', url: shop(kitchen) },
    ],
  },
  {
    label: 'Institutional Desk',
    children: [
      { label: 'Request a quote', url: '/contact' },
      { label: 'Warranty & claims', url: '/warranty' },
      { label: 'Showroom visit', url: '/contact' },
      { label: 'Corporate profile', url: '/about' },
      { label: 'Terms of sale', url: '/terms' },
    ],
  },
];

export const DEFAULT_PRODUCT_ROWS = [
  { slug: 'air-conditioner', title: 'Air Conditioner' },
  { slug: 'ac-spare-parts', title: 'AC Spare Parts' },
  { slug: 'accessories', title: 'Accessories' },
  { slug: 'camera', title: 'Camera' },
  { slug: 'fan-and-cooler', title: 'Fan & Cooler' },
  { slug: 'generator', title: 'Generator' },
  { slug: 'kitchen-appliances', title: 'Kitchen Appliances' },
  { slug: 'refrigerator-and-freezer', title: 'Refrigerator & Freezer' },
  { slug: 'small-appliances', title: 'Small Appliances' },
  { slug: 'television', title: 'Television' },
  { slug: 'transformer', title: 'Transformer' },
  { slug: 'washing-machine', title: 'Washing Machine' },
];

export const DEFAULT_HERO_CATEGORIES = DEFAULT_PRODUCT_ROWS.map((row) => row.slug);

type HomepageExtras = {
  heroTitle?: string | null;
  heroPayload?: Record<string, unknown> | null;
  bannersPayload?: Record<string, unknown> | null;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

export function defaultHomepageSections(
  productRows: { slug: string; title: string }[] = DEFAULT_PRODUCT_ROWS,
  extras: HomepageExtras = {},
): CmsHomeSection[] {
  const collections = productRows.length ? productRows : DEFAULT_PRODUCT_ROWS;
  const heroPayload = asRecord(extras.heroPayload);
  const bannerPayload = asRecord(extras.bannersPayload);
  const rows: CmsHomeSection[] = [
    {
      type: 'HERO',
      title: extras.heroTitle?.trim() || 'Hasan Trade Electronics',
      sortOrder: 0,
      payload: {
        heading: 'Cooling, refrigeration and power equipment',
        subheading: 'Gree, Haier, Konka, Xiaomi and industrial generators — ready for delivery.',
        ctaLabel: 'Shop now',
        ctaHref: '/shop',
        slideSource: 'products',
        ...heroPayload,
        categorySlugs: collections.map((row) => row.slug),
      },
    },
    {
      type: 'FEATURED_CATEGORIES',
      title: 'Shop by category',
      sortOrder: 1,
      payload: {},
    },
    {
      type: 'BANNERS',
      title: 'Promotions',
      sortOrder: 2,
      payload: bannerPayload.items
        ? bannerPayload
        : {
            items: [
              {
                image: '/samples/banners/banner-1.jpg',
                href: '/shop?category=air-conditioner',
                alt: 'Air conditioner promotion',
              },
              {
                image: '/samples/banners/banner-2.jpg',
                href: '/shop?category=refrigerator-and-freezer',
                alt: 'Refrigerator promotion',
              },
            ],
          },
    },
  ];

  collections.forEach((row, index) => {
    rows.push({
      type: 'FEATURED_PRODUCTS',
      title: row.title,
      sortOrder: 3 + index,
      payload: { categorySlug: row.slug },
    });
  });

  rows.push(
    {
      type: 'FEATURED_PRODUCTS',
      title: 'New arrivals',
      sortOrder: 3 + collections.length,
      payload: {},
    },
    {
      type: 'BRANDS',
      title: 'Authorized partner brands',
      sortOrder: 4 + collections.length,
      payload: {},
    },
  );

  return rows;
}
