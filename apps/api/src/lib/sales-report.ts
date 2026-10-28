import { prisma } from '@shopstack/db';
import { num } from './http';
import { publicMediaUrl } from './serialize';

export type SalesSource = 'website' | 'pos';
export type SalesView = 'lines' | 'products';

export type SalesLine = {
  id: string;
  source: SalesSource;
  soldAt: string;
  productId: string;
  productName: string;
  sku: string;
  category: string | null;
  brand: string | null;
  imageUrl: string | null;
  quantity: number;
  unitPrice: number;
  total: number;
  reference: string;
  href: string | null;
  customer: string;
  status: string;
};

export type SalesProductRow = {
  productId: string;
  productName: string;
  sku: string;
  category: string | null;
  brand: string | null;
  imageUrl: string | null;
  websiteQty: number;
  posQty: number;
  quantity: number;
  revenue: number;
};

export type SalesQuery = {
  q?: string;
  source?: 'all' | SalesSource;
  from?: string;
  to?: string;
  category?: string;
  brand?: string;
  includeCancelled?: boolean;
  view?: SalesView;
  page?: number;
  perPage?: number;
};

function dayBound(value: string | undefined, end: boolean) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  return new Date(`${value}T${end ? '23:59:59.999' : '00:00:00'}+06:00`);
}

async function categoryIds(category?: string) {
  if (!category) return null;
  const match = await prisma.category.findFirst({
    where: { OR: [{ id: category }, { slug: category }] },
    select: { id: true, children: { select: { id: true } } },
  });
  if (!match) return [] as string[];
  return [match.id, ...match.children.map((child) => child.id)];
}

function catalogWhere(q: string, categoryIds: string[] | null, brand: string) {
  return {
    ...(q ? { OR: [{ name: { contains: q } }, { sku: { contains: q } }] } : {}),
    ...(categoryIds
      ? { variant: { product: { categories: { some: { categoryId: { in: categoryIds } } } } } }
      : {}),
    ...(brand
      ? { variant: { product: { brand: { OR: [{ id: brand }, { slug: brand }] } } } }
      : {}),
  };
}

function firstImage(images?: { url: string }[]) {
  const url = images?.[0]?.url;
  return url ? publicMediaUrl(url) || url : null;
}

function mapWeb(item: {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: { toString(): string };
  total: { toString(): string };
  productId: string;
  order: { id: string; orderNumber: string; status: string; placedAt: Date; name: string };
  variant: {
    images: { url: string }[];
    product: {
      id: string;
      brand: { name: string } | null;
      categories: { category: { name: string } }[];
      images: { url: string }[];
    };
  };
}): SalesLine {
  return {
    id: item.id,
    source: 'website',
    soldAt: item.order.placedAt.toISOString(),
    productId: item.variant.product.id || item.productId,
    productName: item.name,
    sku: item.sku,
    category: item.variant.product.categories[0]?.category.name ?? null,
    brand: item.variant.product.brand?.name ?? null,
    imageUrl: firstImage(item.variant.images) || firstImage(item.variant.product.images),
    quantity: item.quantity,
    unitPrice: num(item.unitPrice) ?? 0,
    total: num(item.total) ?? 0,
    reference: item.order.orderNumber,
    href: `/orders/${item.order.id}`,
    customer: item.order.name,
    status: item.order.status,
  };
}

function mapPos(item: {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: { toString(): string };
  total: { toString(): string };
  productId: string;
  sale: {
    saleNumber: string;
    status: string;
    soldAt: Date;
    customer: { name: string | null } | null;
  };
  variant: {
    images: { url: string }[];
    product: {
      id: string;
      brand: { name: string } | null;
      categories: { category: { name: string } }[];
      images: { url: string }[];
    };
  };
}): SalesLine {
  return {
    id: item.id,
    source: 'pos',
    soldAt: item.sale.soldAt.toISOString(),
    productId: item.variant.product.id || item.productId,
    productName: item.name,
    sku: item.sku,
    category: item.variant.product.categories[0]?.category.name ?? null,
    brand: item.variant.product.brand?.name ?? null,
    imageUrl: firstImage(item.variant.images) || firstImage(item.variant.product.images),
    quantity: item.quantity,
    unitPrice: num(item.unitPrice) ?? 0,
    total: num(item.total) ?? 0,
    reference: item.sale.saleNumber,
    href: null,
    customer: item.sale.customer?.name?.trim() || 'Walk-in',
    status: item.sale.status,
  };
}

const imageSelect = { orderBy: { sortOrder: 'asc' as const }, take: 1, select: { url: true } };

const productInclude = {
  variant: {
    select: {
      images: imageSelect,
      product: {
        select: {
          id: true,
          brand: { select: { name: true } },
          categories: { take: 1, include: { category: { select: { name: true } } } },
          images: imageSelect,
        },
      },
    },
  },
} as const;

export async function loadSalesLines(query: SalesQuery) {
  const q = query.q?.trim() ?? '';
  const source = query.source === 'website' || query.source === 'pos' ? query.source : 'all';
  const from = dayBound(query.from, false);
  const to = dayBound(query.to, true);
  const brand = query.brand?.trim() ?? '';
  const includeCancelled = Boolean(query.includeCancelled);
  const ids = await categoryIds(query.category?.trim());
  if (ids && ids.length === 0) return [] as SalesLine[];

  const dateWeb = from || to ? { placedAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {};
  const datePos = from || to ? { soldAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {};
  const lineWhere = catalogWhere(q, ids, brand);

  const [web, pos] = await Promise.all([
    source === 'pos'
      ? Promise.resolve([])
      : prisma.orderItem.findMany({
          where: {
            ...lineWhere,
            order: {
              ...dateWeb,
              ...(includeCancelled ? {} : { status: { notIn: ['CANCELLED', 'REFUNDED'] } }),
            },
          },
          include: {
            ...productInclude,
            order: { select: { id: true, orderNumber: true, status: true, placedAt: true, name: true } },
          },
          take: 20000,
        }),
    source === 'website'
      ? Promise.resolve([])
      : prisma.posSaleItem.findMany({
          where: {
            ...lineWhere,
            sale: {
              ...datePos,
              ...(includeCancelled ? {} : { status: 'COMPLETED' }),
            },
          },
          include: {
            ...productInclude,
            sale: {
              select: {
                saleNumber: true,
                status: true,
                soldAt: true,
                customer: { select: { name: true } },
              },
            },
          },
          take: 20000,
        }),
  ]);

  return [...web.map(mapWeb), ...pos.map(mapPos)].sort((a, b) => (a.soldAt < b.soldAt ? 1 : -1));
}

export function summarizeSales(lines: SalesLine[]) {
  const summary = {
    units: 0,
    revenue: 0,
    websiteUnits: 0,
    websiteRevenue: 0,
    posUnits: 0,
    posRevenue: 0,
    lines: lines.length,
  };
  for (const line of lines) {
    summary.units += line.quantity;
    summary.revenue += line.total;
    if (line.source === 'website') {
      summary.websiteUnits += line.quantity;
      summary.websiteRevenue += line.total;
    } else {
      summary.posUnits += line.quantity;
      summary.posRevenue += line.total;
    }
  }
  return summary;
}

export function aggregateProducts(lines: SalesLine[]): SalesProductRow[] {
  const map = new Map<string, SalesProductRow>();
  for (const line of lines) {
    const key = line.productId || line.sku;
    const current = map.get(key) ?? {
      productId: line.productId,
      productName: line.productName,
      sku: line.sku,
      category: line.category,
      brand: line.brand,
      imageUrl: line.imageUrl,
      websiteQty: 0,
      posQty: 0,
      quantity: 0,
      revenue: 0,
    };
    if (!current.imageUrl && line.imageUrl) current.imageUrl = line.imageUrl;
    current.quantity += line.quantity;
    current.revenue += line.total;
    if (line.source === 'website') current.websiteQty += line.quantity;
    else current.posQty += line.quantity;
    map.set(key, current);
  }
  return [...map.values()].sort((a, b) => b.revenue - a.revenue || b.quantity - a.quantity);
}

export function salesCsv(lines: SalesLine[]) {
  const header = ['Date', 'Source', 'Product', 'SKU', 'Category', 'Brand', 'Qty', 'Unit price', 'Total', 'Reference', 'Customer', 'Status'];
  const rows = lines.map((line) =>
    [
      line.soldAt,
      line.source === 'website' ? 'Website' : 'Shop POS',
      line.productName,
      line.sku,
      line.category ?? '',
      line.brand ?? '',
      line.quantity,
      line.unitPrice,
      line.total,
      line.reference,
      line.customer,
      line.status,
    ].map(csvCell).join(','),
  );
  return `\uFEFF${[header.join(','), ...rows].join('\n')}`;
}

function csvCell(value: string | number) {
  const text = String(value ?? '');
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}
