import {
  Language,
  Prisma,
  PrismaClient,
  ProductStatus,
  ProductType,
  ThemeId,
  UserKind,
} from '@prisma/client';
import bcrypt from 'bcryptjs';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEFAULT_FOOTER_MENU, DEFAULT_HEADER_MENU, DEFAULT_PRODUCT_ROWS, defaultHomepageSections } from './cms-defaults';

type DemoProduct = {
  wooId?: number;
  name: string;
  slug: string;
  sku: string;
  price: number;
  compareAtPrice: number | null;
  inStock: boolean;
  shortDescription: string | null;
  description?: string | null;
  category: string;
  categorySlug?: string;
  categories?: { name: string; slug: string }[];
  brand: string | null;
  image: string;
  images?: string[];
  warrantyMonths: number;
};

type LiveCategory = {
  name: string;
  slug: string;
  parentSlug: string | null;
};

const here = dirname(fileURLToPath(import.meta.url));
const demoCatalog = JSON.parse(readFileSync(join(here, 'demo-catalog.json'), 'utf8')) as DemoProduct[];
const liveCategories = JSON.parse(readFileSync(join(here, 'live-categories.json'), 'utf8')) as LiveCategory[];

if (process.env.DATABASE_URL) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.replace('@localhost:', '@127.0.0.1:');
}

const prisma = new PrismaClient();

const PERMISSIONS: { slug: string; name: string; group: string }[] = [
  { slug: 'settings.read', name: 'View settings', group: 'settings' },
  { slug: 'settings.write', name: 'Edit settings', group: 'settings' },
  { slug: 'catalog.read', name: 'View catalog', group: 'catalog' },
  { slug: 'catalog.write', name: 'Edit catalog', group: 'catalog' },
  { slug: 'media.write', name: 'Upload media', group: 'catalog' },
  { slug: 'orders.read', name: 'View orders', group: 'orders' },
  { slug: 'orders.write', name: 'Manage orders', group: 'orders' },
  { slug: 'customers.read', name: 'View customers', group: 'customers' },
  { slug: 'customers.write', name: 'Manage customers', group: 'customers' },
  { slug: 'inventory.read', name: 'View inventory', group: 'inventory' },
  { slug: 'inventory.write', name: 'Adjust inventory', group: 'inventory' },
  { slug: 'purchases.write', name: 'Manage purchases', group: 'inventory' },
  { slug: 'pos.sell', name: 'Sell at POS', group: 'pos' },
  { slug: 'pos.return', name: 'Process POS returns', group: 'pos' },
  { slug: 'pos.session', name: 'Open and close POS sessions', group: 'pos' },
  { slug: 'reports.read', name: 'View reports', group: 'reports' },
  { slug: 'users.read', name: 'View staff', group: 'users' },
  { slug: 'users.write', name: 'Manage staff and roles', group: 'users' },
  { slug: 'coupons.read', name: 'View coupons', group: 'coupons' },
  { slug: 'coupons.write', name: 'Manage coupons', group: 'coupons' },
  { slug: 'warranties.read', name: 'View warranties', group: 'warranties' },
  { slug: 'warranties.write', name: 'Manage warranty claims', group: 'warranties' },
];

const ROLES: { slug: string; name: string; permissions: string[] | '*' }[] = [
  { slug: 'owner', name: 'Owner', permissions: '*' },
  {
    slug: 'admin',
    name: 'Admin',
    permissions: '*',
  },
  {
    slug: 'manager',
    name: 'Manager',
    permissions: [
      'catalog.read',
      'catalog.write',
      'orders.read',
      'orders.write',
      'customers.read',
      'customers.write',
      'inventory.read',
      'inventory.write',
      'pos.sell',
      'pos.return',
      'pos.session',
      'reports.read',
      'coupons.read',
      'coupons.write',
      'warranties.read',
      'warranties.write',
    ],
  },
  {
    slug: 'cashier',
    name: 'Cashier',
    permissions: ['pos.sell', 'pos.return', 'pos.session', 'catalog.read', 'customers.read'],
  },
  {
    slug: 'inventory',
    name: 'Inventory',
    permissions: [
      'catalog.read',
      'inventory.read',
      'inventory.write',
      'purchases.write',
      'warranties.read',
    ],
  },
  {
    slug: 'support',
    name: 'Support',
    permissions: [
      'orders.read',
      'orders.write',
      'customers.read',
      'customers.write',
      'warranties.read',
      'warranties.write',
      'catalog.read',
    ],
  },
];

async function seedRoles() {
  const permissionIds = new Map<string, string>();

  for (const permission of PERMISSIONS) {
    const row = await prisma.permission.upsert({
      where: { slug: permission.slug },
      update: { name: permission.name, group: permission.group },
      create: permission,
    });
    permissionIds.set(permission.slug, row.id);
  }

  for (const role of ROLES) {
    const row = await prisma.role.upsert({
      where: { slug: role.slug },
      update: { name: role.name, isSystem: true },
      create: { slug: role.slug, name: role.name, isSystem: true },
    });

    const slugs = role.permissions === '*' ? PERMISSIONS.map((p) => p.slug) : role.permissions;
    await prisma.rolePermission.deleteMany({ where: { roleId: row.id } });
    await prisma.rolePermission.createMany({
      data: slugs.map((slug) => ({
        roleId: row.id,
        permissionId: permissionIds.get(slug)!,
      })),
    });
  }
}

const STORE = {
  name: 'Hasan Trade Electronics',
  slug: 'hasan-trade',
  legalName: 'Hasan Trade Electronics',
  tagline: 'Air conditioners, refrigerators, cameras and generators',
  description:
    'Authorized dealer for Gree, Haier, Konka, Xiaomi and industrial power equipment. Sample catalog seeded from the live Hasan Trade store for this install.',
  email: 'hasantradeelectronics2014@gmail.com',
  phone: '+8801711166522',
  whatsapp: '+8801711166522',
  address: 'Ali Tower, Tamabil Road, Mirabazar, Sylhet Sadar-3100',
  city: 'Sylhet',
  country: 'BD',
  logoUrl: '/samples/logo.png',
  logoDarkUrl: '/samples/logo.png',
  faviconUrl: '/samples/logo.png',
  invoiceLogoUrl: '/samples/logo.png',
  ogImageUrl: '/samples/banners/slider_1.png',
  logoHeight: 56,
  hours: 'Saturday to Thursday: 9.00am to 10.00pm',
  facebookUrl: 'https://www.facebook.com/mdkamrulhasan145',
  instagramUrl: 'http://instagram.com/mdkamrulhasan8456',
  youtubeUrl: 'https://www.youtube.com/@htesyl',
  colorPrimary: '#1E40AF',
  colorSecondary: '#EA580C',
  colorAccent: '#06B6D4',
  colorBackground: '#F8FAFC',
  colorForeground: '#0F172A',
  colorMuted: '#F1F5F9',
  footerText:
    'Hasan Trade Electronics is dedicated to building a more advanced society by providing air conditioners, spare parts, refrigerators, CCTV, generators, televisions and kitchen appliances.',
  copyrightText: 'Copyright © 2023 Hasan Trade Electronics. All Rights Reserved.',
  metaTitle: 'Hasan Trade Electronics',
  metaDescription: 'Shop air conditioners, refrigerators, CCTV, generators and HVAC spare parts.',
};

async function seedStoreAndBranch() {
  await prisma.storeSettings.upsert({
    where: { id: 'default' },
    update: STORE,
    create: {
      id: 'default',
      ...STORE,
      currency: 'BDT',
      currencySymbol: '৳',
      timezone: 'Asia/Dhaka',
      language: Language.EN,
      themeId: ThemeId.CLASSIC,
      invoicePrefix: 'INV',
      orderPrefix: 'ORD',
      allowCod: true,
      allowGuestCheckout: true,
    },
  });

  const branch = await prisma.branch.upsert({
    where: { code: 'MAIN' },
    update: {
      name: 'Hasan Trade — Main Store',
      phone: STORE.phone,
      city: 'Sylhet',
      district: 'Sylhet',
      division: 'Sylhet',
    },
    create: {
      code: 'MAIN',
      name: 'Hasan Trade — Main Store',
      phone: STORE.phone,
      city: 'Sylhet',
      district: 'Sylhet',
      division: 'Sylhet',
      isDefault: true,
      fulfillsOnline: true,
    },
  });

  await prisma.posTerminal.upsert({
    where: { code: 'POS-01' },
    update: {},
    create: {
      branchId: branch.id,
      code: 'POS-01',
      name: 'Counter 1',
    },
  });

  return branch;
}

async function seedProviders() {
  const providers = [
    { provider: 'COD' as const, displayName: 'Cash on delivery', enabled: true, sortOrder: 1 },
    { provider: 'BKASH' as const, displayName: 'bKash', enabled: false, sortOrder: 2 },
    { provider: 'NAGAD' as const, displayName: 'Nagad', enabled: false, sortOrder: 3 },
    { provider: 'CASH' as const, displayName: 'Cash', enabled: true, sortOrder: 4 },
    { provider: 'BANK_TRANSFER' as const, displayName: 'Bank transfer', enabled: false, sortOrder: 5 },
    { provider: 'DUE' as const, displayName: 'Due / credit', enabled: true, sortOrder: 6 },
  ];

  for (const provider of providers) {
    await prisma.paymentProvider.upsert({
      where: { provider: provider.provider },
      update: { displayName: provider.displayName },
      create: provider,
    });
  }

  await prisma.notificationProvider.upsert({
    where: { channel_name: { channel: 'EMAIL', name: 'smtp' } },
    update: {},
    create: { channel: 'EMAIL', name: 'smtp', enabled: false },
  });

  await prisma.notificationProvider.upsert({
    where: { channel_name: { channel: 'SMS', name: 'generic' } },
    update: {},
    create: { channel: 'SMS', name: 'generic', enabled: false },
  });
}

async function seedOwner() {
  const email = process.env.SEED_OWNER_EMAIL ?? 'owner@example.com';
  const password = process.env.SEED_OWNER_PASSWORD ?? 'ChangeMe!123';
  const passwordHash = await bcrypt.hash(password, 12);
  const ownerRole = await prisma.role.findUniqueOrThrow({ where: { slug: 'owner' } });

  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, name: 'Store Owner', kind: UserKind.STAFF },
    create: {
      kind: UserKind.STAFF,
      email,
      name: 'Store Owner',
      passwordHash,
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: user.id, roleId: ownerRole.id } },
    update: {},
    create: { userId: user.id, roleId: ownerRole.id },
  });
}

async function seedMenuTree(
  menuId: string,
  items: { label: string; url?: string | null; children?: unknown[] }[],
  parentId: string | null = null,
) {
  for (const [sortOrder, item] of items.entries()) {
    const created = await prisma.menuItem.create({
      data: {
        menuId,
        parentId,
        label: item.label,
        url: item.url ?? null,
        sortOrder,
        isActive: true,
      },
    });
    const children = Array.isArray(item.children) ? (item.children as typeof items) : [];
    if (children.length) await seedMenuTree(menuId, children, created.id);
  }
}

async function seedMenusAndHomepage(force = false) {
  const header = await prisma.menu.upsert({
    where: { location: 'HEADER' },
    update: {},
    create: { location: 'HEADER', name: 'Header' },
  });
  const footer = await prisma.menu.upsert({
    where: { location: 'FOOTER' },
    update: {},
    create: { location: 'FOOTER', name: 'Footer' },
  });

  const headerCount = await prisma.menuItem.count({ where: { menuId: header.id } });
  const footerCount = await prisma.menuItem.count({ where: { menuId: footer.id } });
  const sectionCount = await prisma.homepageSection.count();

  if (force || headerCount === 0) {
    console.log(`Seeding header menu (${headerCount} existing items)`);
    await prisma.menuItem.deleteMany({ where: { menuId: header.id } });
    await seedMenuTree(header.id, DEFAULT_HEADER_MENU);
  }
  if (force || footerCount === 0) {
    console.log(`Seeding footer menu (${footerCount} existing items)`);
    await prisma.menuItem.deleteMany({ where: { menuId: footer.id } });
    await seedMenuTree(footer.id, DEFAULT_FOOTER_MENU);
  }
  if (force || sectionCount === 0) {
    await seedHomepage(true);
  }
}

async function catalogProductRows() {
  const parents = await prisma.category.findMany({
    where: { isActive: true, parentId: null, slug: { not: 'ac-servicing' } },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    select: {
      name: true,
      slug: true,
      _count: { select: { products: true } },
    },
  });
  const live = parents
    .filter((row) => row._count.products > 0)
    .map((row) => ({ slug: row.slug, title: row.name }));
  return live.length ? live : DEFAULT_PRODUCT_ROWS;
}

async function seedHomepage(force = false) {
  const sectionCount = await prisma.homepageSection.count();
  if (!force && sectionCount > 0) return;
  const productRows = await catalogProductRows();
  const hero = await prisma.homepageSection.findFirst({ where: { type: 'HERO' } });
  const banners = await prisma.homepageSection.findFirst({ where: { type: 'BANNERS' } });
  console.log(`Seeding homepage sections with ${productRows.length} catalog rows (${sectionCount} existing)`);
  await prisma.homepageSection.deleteMany();
  await prisma.homepageSection.createMany({
    data: defaultHomepageSections(productRows, {
      heroTitle: hero?.title,
      heroPayload: hero?.payload && typeof hero.payload === 'object' && !Array.isArray(hero.payload)
        ? (hero.payload as Record<string, unknown>)
        : null,
      bannersPayload: banners?.payload && typeof banners.payload === 'object' && !Array.isArray(banners.payload)
        ? (banners.payload as Record<string, unknown>)
        : null,
    }).map((section) => ({
      type: section.type,
      title: section.title ?? null,
      sortOrder: section.sortOrder,
      payload: section.payload as Prisma.InputJsonValue,
      isVisible: true,
    })),
  });
}

function categorySlug(name: string) {
  return name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function brandSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function seedDemoCatalog(branchId: string) {
  if (process.env.SEED_DEMO_DATA === 'false') return;

  const coverByCategory = new Map<string, string>();
  for (const item of demoCatalog) {
    const cover = (item.images ?? (item.image ? [item.image] : [])).find(Boolean);
    if (cover && item.categorySlug && !coverByCategory.has(item.categorySlug)) {
      coverByCategory.set(item.categorySlug, cover);
    }
  }

  const categories = new Map<string, string>();
  const pending = [...liveCategories];
  let sortOrder = 0;
  let guard = 0;
  while (pending.length && guard++ < 12) {
    const deferred: LiveCategory[] = [];
    for (const meta of pending) {
      const parentSlug = meta.parentSlug && meta.parentSlug !== meta.slug ? meta.parentSlug : null;
      if (parentSlug && !categories.has(parentSlug)) {
        deferred.push(meta);
        continue;
      }
      const parentId = parentSlug ? categories.get(parentSlug) : undefined;
      const imageUrl = coverByCategory.get(meta.slug) ?? null;
      const row = await prisma.category.upsert({
        where: { slug: meta.slug },
        update: {
          name: meta.name,
          parentId: parentId ?? null,
          imageUrl,
          sortOrder,
          isActive: true,
          path: parentId ? `${parentSlug}/${meta.slug}` : meta.slug,
        },
        create: {
          name: meta.name,
          slug: meta.slug,
          parentId: parentId ?? null,
          imageUrl,
          sortOrder,
          path: parentId ? `${parentSlug}/${meta.slug}` : meta.slug,
        },
      });
      sortOrder += 1;
      categories.set(meta.slug, row.id);
      categories.set(meta.name, row.id);
    }
    pending.splice(0, pending.length, ...deferred);
  }

  const brands = new Map<string, string>();
  const uniqueBrands = [...new Set(demoCatalog.map((p) => p.brand).filter(Boolean))] as string[];
  for (const [index, name] of uniqueBrands.entries()) {
    const slug = brandSlug(name);
    const row = await prisma.brand.upsert({
      where: { slug },
      update: { name, sortOrder: index, isActive: true },
      create: { name, slug, sortOrder: index },
    });
    brands.set(name, row.id);
  }

  const rank: Record<string, number> = {
    'Air Conditioner': 0,
    Television: 1,
    'Refrigerator & Freezer': 2,
    Camera: 3,
    Generator: 4,
    'AC Spare Parts': 5,
    Accessories: 6,
  };
  const sorted = [...demoCatalog].sort(
    (a, b) => (rank[a.category] ?? 9) - (rank[b.category] ?? 9) || a.name.localeCompare(b.name),
  );
  const keepSlugs = sorted.map((item) => item.slug);
  const stale = await prisma.product.findMany({
    where: { slug: { notIn: keepSlugs } },
    include: { variants: true },
  });
  for (const row of stale) {
    await prisma.product.update({
      where: { id: row.id },
      data: { status: ProductStatus.ARCHIVED, sku: `OLD-${row.id.slice(-10)}` },
    });
    for (const variant of row.variants) {
      await prisma.productVariant.update({
        where: { id: variant.id },
        data: { sku: `OLD-${variant.id.slice(-12)}`, barcode: `OLD${variant.id.slice(-12)}` },
      });
    }
  }

  for (const [index, item] of sorted.entries()) {
    const primarySlug = item.categorySlug ?? categorySlug(item.category);
    const brandId = item.brand ? brands.get(item.brand) : undefined;
    const publishedAt = new Date(Date.now() - index * 60_000);
    const price = item.price ?? 0;
    const costPrice = price > 0 ? Math.round(price * 0.82) : null;
    const photos = [...new Set((item.images?.length ? item.images : item.image ? [item.image] : []).filter(Boolean))];

    const name = item.name.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
    const skuClash = await prisma.product.findFirst({
      where: { sku: item.sku, NOT: { slug: item.slug } },
    });
    if (skuClash) {
      await prisma.product.update({
        where: { id: skuClash.id },
        data: { sku: `OLD-${skuClash.id.slice(-10)}` },
      });
    }

    const product = await prisma.product.upsert({
      where: { slug: item.slug },
      update: {
        name,
        sku: item.sku,
        brandId: brandId ?? null,
        status: ProductStatus.ACTIVE,
        shortDescription: item.shortDescription,
        description: item.description ?? item.shortDescription,
        warrantyMonths: item.warrantyMonths,
        publishedAt,
      },
      create: {
        name,
        slug: item.slug,
        sku: item.sku,
        brandId: brandId ?? null,
        type: ProductType.SIMPLE,
        status: ProductStatus.ACTIVE,
        shortDescription: item.shortDescription,
        description: item.description ?? item.shortDescription,
        warrantyMonths: item.warrantyMonths,
        isSerialized: item.category === 'Air Conditioner' || item.category === 'Generator',
        publishedAt,
      },
      include: { variants: true, categories: true, images: true },
    });

    const wantedCategoryIds = [
      ...new Set(
        [primarySlug, ...(item.categories ?? []).map((c) => c.slug)]
          .map((slug) => categories.get(slug))
          .filter(Boolean) as string[],
      ),
    ];
    const primaryId = categories.get(primarySlug) ?? wantedCategoryIds[0];
    await prisma.productCategory.deleteMany({ where: { productId: product.id } });
    if (wantedCategoryIds.length) {
      await prisma.productCategory.createMany({
        data: wantedCategoryIds.map((categoryId) => ({
          productId: product.id,
          categoryId,
          isPrimary: categoryId === primaryId,
        })),
      });
    }

    let variant = product.variants[0];
    if (!variant) {
      const variantSku = `${item.sku}-DEF`;
      const barcode = `8${String(item.wooId ?? index + 1).padStart(12, '0')}`;
      const variantClash = await prisma.productVariant.findFirst({
        where: { OR: [{ sku: variantSku }, { barcode }], NOT: { productId: product.id } },
      });
      if (variantClash) {
        await prisma.productVariant.update({
          where: { id: variantClash.id },
          data: { sku: `OLD-${variantClash.id.slice(-12)}`, barcode: `OLD${variantClash.id.slice(-12)}` },
        });
      }
      variant = await prisma.productVariant.create({
        data: {
          productId: product.id,
          sku: variantSku,
          barcode,
          name: 'Default',
          price,
          compareAtPrice: item.compareAtPrice,
          costPrice,
          isDefault: true,
        },
      });
    } else {
      variant = await prisma.productVariant.update({
        where: { id: variant.id },
        data: { price, compareAtPrice: item.compareAtPrice, costPrice, isActive: true },
      });
    }

    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    if (photos.length) {
      await prisma.productImage.createMany({
        data: photos.slice(0, 6).map((url, sortOrder) => ({
          productId: product.id,
          variantId: variant.id,
          url,
          alt: item.name.slice(0, 180),
          sortOrder,
        })),
      });
    }

    const onHand = item.inStock ? (item.category === 'Generator' ? 3 : 8) : 0;
    await prisma.stockBalance.upsert({
      where: { branchId_variantId: { branchId, variantId: variant.id } },
      update: { onHand },
      create: { branchId, variantId: variant.id, onHand, reserved: 0 },
    });
  }

  await prisma.brand.updateMany({
    where: { slug: { in: ['nimbus', 'apex'] } },
    data: { isActive: false },
  });
}

async function pointFooterToWarranty() {
  await prisma.menuItem.updateMany({
    where: { url: '/returns', label: { contains: 'Warranty' } },
    data: { url: '/warranty' },
  });
}

async function main() {
  const cmsOnly = process.argv.includes('--cms');
  const homepageOnly = process.argv.includes('--homepage');
  const rolesOnly = process.argv.includes('--roles');
  const forceCms = cmsOnly || process.argv.includes('--force-cms');
  if (homepageOnly) {
    await seedHomepage(true);
    return;
  }
  if (cmsOnly) {
    await seedMenusAndHomepage(true);
    return;
  }
  if (rolesOnly) {
    await seedRoles();
    await pointFooterToWarranty();
    return;
  }
  await seedRoles();
  const branch = await seedStoreAndBranch();
  await seedProviders();
  await seedOwner();
  await seedMenusAndHomepage(forceCms);
  await seedDemoCatalog(branch.id);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
