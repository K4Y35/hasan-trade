import { prisma } from '@shopstack/db';
import {
  brandWriteSchema,
  categoryWriteSchema,
  paginationSchema,
  productWriteSchema,
  slugify,
} from '@shopstack/shared';
import { Router } from 'express';
import { requireStaff } from '../lib/auth';
import { asyncHandler, HttpError } from '../lib/http';
import { loadNav, productRowFromSection, serializeSectionPayload } from '../lib/cms';
import { publicMediaUrl, serializeProduct, withPublicMedia } from '../lib/serialize';

export const catalogPublicRouter = Router();
export const catalogAdminRouter = Router();

const productInclude = {
  brand: { select: { id: true, name: true, slug: true } },
  categories: { include: { category: { select: { id: true, name: true, slug: true } } } },
  variants: {
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' as const },
    include: { stockBalances: { select: { onHand: true, reserved: true } } },
  },
  images: { orderBy: { sortOrder: 'asc' as const } },
  specs: { include: { field: true } },
};

const adminProductInclude = {
  ...productInclude,
  variants: {
    orderBy: { sortOrder: 'asc' as const },
    include: { stockBalances: { select: { onHand: true, reserved: true } } },
  },
};

function catalogTake(limit: number) {
  return limit > 0 ? limit : undefined;
}

catalogPublicRouter.get(
  '/nav',
  asyncHandler(async (_req, res) => {
    res.json(await loadNav());
  }),
);

catalogPublicRouter.get(
  '/home',
  asyncHandler(async (_req, res) => {
    const [settings, rawSections, categories, brands] = await Promise.all([
      prisma.storeSettings.findUnique({ where: { id: 'default' } }),
      prisma.homepageSection.findMany({ where: { isVisible: true }, orderBy: { sortOrder: 'asc' } }),
      prisma.category.findMany({ where: { isActive: true, parentId: null }, orderBy: { sortOrder: 'asc' } }),
      prisma.brand.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
    ]);
    const sections = rawSections.map((section) => ({
      ...section,
      payload: serializeSectionPayload(section.payload),
    }));
    const productRows =
      sections.map((section) => productRowFromSection(section)).filter((row): row is NonNullable<typeof row> => Boolean(row));
    const rows = productRows.length
      ? productRows
      : categories
          .filter((category) => category.slug !== 'ac-servicing')
          .map((category) => ({ slug: category.slug, title: category.name, limit: 0 }));
    const featuredLimit = Number(
      sections.find((section) => section.type === 'FEATURED_PRODUCTS' && !section.payload.categorySlug)?.payload.limit,
    );
    const featuredTake =
      Number.isFinite(featuredLimit) && featuredLimit > 0 ? Math.min(500, featuredLimit) : 48;

    const [featured, nav, rowResults] = await Promise.all([
      prisma.product.findMany({
        where: { status: 'ACTIVE' },
        include: productInclude,
        take: featuredTake,
        orderBy: { publishedAt: 'desc' },
      }),
      loadNav(),
      Promise.all(
        rows.map((row) =>
          prisma.product.findMany({
            where: { status: 'ACTIVE', categories: { some: { category: { slug: row.slug } } } },
            include: productInclude,
            take: catalogTake(row.limit),
            orderBy: { publishedAt: 'desc' },
          }),
        ),
      ),
    ]);
    res.json({
      settings,
      sections,
      categories: categories.map(withPublicMedia),
      brands: brands.map(withPublicMedia),
      featured: featured.map(serializeProduct),
      nav,
      categoryRows: rows.map((row, index) => ({
        slug: row.slug,
        title: row.title,
        products: (rowResults[index] ?? []).map(serializeProduct),
      })),
    });
  }),
);

catalogPublicRouter.get(
  '/products',
  asyncHandler(async (req, res) => {
    const { page, perPage } = paginationSchema.parse(req.query);
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const category = typeof req.query.category === 'string' ? req.query.category : undefined;
    const brand = typeof req.query.brand === 'string' ? req.query.brand : undefined;
    const sort = typeof req.query.sort === 'string' ? req.query.sort : 'name';
    const minPrice = req.query.minPrice ? Number(req.query.minPrice) : undefined;
    const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;
    const where = {
      status: 'ACTIVE' as const,
      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { shortDescription: { contains: q } },
              { sku: { contains: q } },
              { variants: { some: { sku: { contains: q } } } },
            ],
          }
        : {}),
      ...(category ? { categories: { some: { category: { slug: category } } } } : {}),
      ...(brand ? { brand: { slug: brand } } : {}),
      ...(minPrice != null || maxPrice != null
        ? {
            variants: {
              some: {
                price: {
                  ...(minPrice != null && !Number.isNaN(minPrice) ? { gte: minPrice } : {}),
                  ...(maxPrice != null && !Number.isNaN(maxPrice) ? { lte: maxPrice } : {}),
                },
              },
            },
          }
        : {}),
    };
    const orderBy =
      sort === 'latest'
        ? { publishedAt: 'desc' as const }
        : sort === 'price-desc' || sort === 'price-asc'
          ? { name: 'asc' as const }
          : { name: 'asc' as const };
    const rows = await prisma.product.findMany({
      where,
      include: productInclude,
      orderBy,
    });
    const priced = rows.map((row) => {
      const price = Number(row.variants[0]?.price ?? 0);
      return { row, price };
    });
    if (sort === 'price-asc') priced.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') priced.sort((a, b) => b.price - a.price);
    const total = priced.length;
    const items = priced.slice((page - 1) * perPage, page * perPage).map((item) => serializeProduct(item.row));
    res.json({ total, page, perPage, items });
  }),
);

catalogPublicRouter.get(
  '/products/:slug',
  asyncHandler(async (req, res) => {
    const product = await prisma.product.findFirst({
      where: { slug: String(req.params.slug), status: 'ACTIVE' },
      include: productInclude,
    });
    if (!product) throw new HttpError(404, 'Product not found');
    const categoryIds = product.categories.map((c) => c.categoryId);
    const related = categoryIds.length
      ? await prisma.product.findMany({
          where: {
            status: 'ACTIVE',
            id: { not: product.id },
            categories: { some: { categoryId: { in: categoryIds } } },
          },
          include: productInclude,
          take: 8,
          orderBy: { publishedAt: 'desc' },
        })
      : [];
    res.json({ ...serializeProduct(product), related: related.map(serializeProduct) });
  }),
);

catalogPublicRouter.get(
  '/categories',
  asyncHandler(async (_req, res) => {
    res.json(
      (await prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } })).map(withPublicMedia),
    );
  }),
);

catalogPublicRouter.get(
  '/brands',
  asyncHandler(async (_req, res) => {
    res.json(
      (await prisma.brand.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } })).map(withPublicMedia),
    );
  }),
);

async function categoryIdsForFilter(category: string) {
  if (category === '_none') return { none: true as const, ids: [] as string[] };
  const match = await prisma.category.findFirst({
    where: { OR: [{ id: category }, { slug: category }] },
    select: { id: true, children: { select: { id: true } } },
  });
  if (!match) return { none: false as const, ids: [] as string[] };
  return { none: false as const, ids: [match.id, ...match.children.map((child) => child.id)] };
}

catalogAdminRouter.get(
  '/products',
  requireStaff('catalog.read'),
  asyncHandler(async (req, res) => {
    const { page, perPage } = paginationSchema.parse(req.query);
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const category = typeof req.query.category === 'string' ? req.query.category.trim() : '';
    const statusRaw = typeof req.query.status === 'string' ? req.query.status.trim().toUpperCase() : '';
    const status =
      statusRaw === 'ACTIVE' || statusRaw === 'DRAFT' || statusRaw === 'ARCHIVED' ? statusRaw : undefined;
    const categoryFilter = category ? await categoryIdsForFilter(category) : null;
    if (categoryFilter && !categoryFilter.none && categoryFilter.ids.length === 0) {
      res.json({ total: 0, page, perPage, items: [] });
      return;
    }
    const where = {
      ...(q ? { OR: [{ name: { contains: q } }, { sku: { contains: q } }] } : {}),
      ...(status ? { status } : {}),
      ...(categoryFilter?.none
        ? { categories: { none: {} } }
        : categoryFilter
          ? { categories: { some: { categoryId: { in: categoryFilter.ids } } } }
          : {}),
    };
    const [total, rows] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: productInclude,
        skip: (page - 1) * perPage,
        take: perPage,
        orderBy: { updatedAt: 'desc' },
      }),
    ]);
    res.json({ total, page, perPage, items: rows.map(serializeProduct) });
  }),
);

catalogAdminRouter.post(
  '/products',
  requireStaff('catalog.write'),
  asyncHandler(async (req, res) => {
    const body = productWriteSchema.parse(req.body);
    const slug = body.slug ?? slugify(body.name);
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) throw new HttpError(409, 'A product with that slug already exists');
    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug,
        sku: body.sku,
        brandId: body.brandId ?? undefined,
        status: body.status ?? 'DRAFT',
        shortDescription: body.shortDescription,
        description: body.description,
        warrantyMonths: body.warrantyMonths ?? 0,
        isSerialized: body.isSerialized ?? false,
        publishedAt: body.status === 'ACTIVE' ? new Date() : null,
        categories: body.categoryIds?.length
          ? {
              create: body.categoryIds.map((categoryId, i) => ({
                categoryId,
                isPrimary: i === 0,
              })),
            }
          : undefined,
        variants: {
          create: body.variants.map((v, i) => ({
            name: v.name,
            sku: v.sku,
            barcode: v.barcode,
            price: v.price,
            compareAtPrice: v.compareAtPrice,
            costPrice: v.costPrice,
            isDefault: v.isDefault ?? i === 0,
            sortOrder: i,
          })),
        },
      },
      include: adminProductInclude,
    });
    res.status(201).json(serializeProduct(product));
  }),
);

catalogAdminRouter.get(
  '/products/:id',
  requireStaff('catalog.read'),
  asyncHandler(async (req, res) => {
    const product = await prisma.product.findUnique({
      where: { id: String(req.params.id) },
      include: adminProductInclude,
    });
    if (!product) throw new HttpError(404, 'Product not found');
    res.json(serializeProduct(product));
  }),
);

catalogAdminRouter.patch(
  '/products/:id',
  requireStaff('catalog.write'),
  asyncHandler(async (req, res) => {
    const body = productWriteSchema.partial().parse(req.body);
    const current = await prisma.product.findUnique({ where: { id: String(req.params.id) } });
    if (!current) throw new HttpError(404, 'Product not found');
    if (body.slug && body.slug !== current.slug) {
      const clash = await prisma.product.findUnique({ where: { slug: body.slug } });
      if (clash) throw new HttpError(409, 'A product with that slug already exists');
    }
    if (body.variants?.length) {
      for (const variant of body.variants) {
        if (variant.id) {
          const existing = await prisma.productVariant.findFirst({
            where: { id: variant.id, productId: current.id },
          });
          if (!existing) throw new HttpError(400, 'Variant does not belong to this product');
          await prisma.productVariant.update({
            where: { id: existing.id },
            data: {
              name: variant.name,
              sku: variant.sku,
              barcode: variant.barcode,
              price: variant.price,
              compareAtPrice: variant.compareAtPrice,
              costPrice: variant.costPrice,
              isDefault: variant.isDefault,
            },
          });
        } else {
          const fallback =
            (await prisma.productVariant.findFirst({
              where: { productId: current.id, isDefault: true },
            })) ?? (await prisma.productVariant.findFirst({ where: { productId: current.id } }));
          if (!fallback) throw new HttpError(400, 'Product has no variant to update');
          await prisma.productVariant.update({
            where: { id: fallback.id },
            data: {
              name: variant.name,
              sku: variant.sku,
              barcode: variant.barcode,
              price: variant.price,
              compareAtPrice: variant.compareAtPrice,
              costPrice: variant.costPrice,
            },
          });
        }
      }
    }
    if (body.categoryIds) {
      await prisma.productCategory.deleteMany({ where: { productId: current.id } });
      if (body.categoryIds.length) {
        await prisma.productCategory.createMany({
          data: body.categoryIds.map((categoryId, i) => ({
            productId: current.id,
            categoryId,
            isPrimary: i === 0,
          })),
        });
      }
    }
    const product = await prisma.product.update({
      where: { id: current.id },
      data: {
        name: body.name,
        slug: body.slug,
        sku: body.sku,
        brandId: body.brandId === undefined ? undefined : body.brandId,
        status: body.status,
        shortDescription: body.shortDescription,
        description: body.description,
        warrantyMonths: body.warrantyMonths,
        isSerialized: body.isSerialized,
        publishedAt: body.status === 'ACTIVE' ? (current.publishedAt ?? new Date()) : current.publishedAt,
      },
      include: adminProductInclude,
    });
    res.json(serializeProduct(product));
  }),
);

catalogAdminRouter.post(
  '/products/:id/images',
  requireStaff('catalog.write'),
  asyncHandler(async (req, res) => {
    const productId = String(req.params.id);
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new HttpError(404, 'Product not found');
    const url = typeof req.body?.url === 'string' ? req.body.url.trim() : '';
    if (!url) throw new HttpError(400, 'Image URL is required');
    const alt = typeof req.body?.alt === 'string' ? req.body.alt.trim() : null;
    const mediaId = typeof req.body?.mediaId === 'string' ? req.body.mediaId : null;
    const last = await prisma.productImage.findFirst({
      where: { productId },
      orderBy: { sortOrder: 'desc' },
    });
    const image = await prisma.productImage.create({
      data: {
        productId,
        url,
        alt,
        mediaId,
        sortOrder: (last?.sortOrder ?? -1) + 1,
      },
    });
    res.status(201).json({ ...image, url: publicMediaUrl(image.url) });
  }),
);

catalogAdminRouter.delete(
  '/products/:id/images/:imageId',
  requireStaff('catalog.write'),
  asyncHandler(async (req, res) => {
    const productId = String(req.params.id);
    const imageId = String(req.params.imageId);
    const image = await prisma.productImage.findFirst({ where: { id: imageId, productId } });
    if (!image) throw new HttpError(404, 'Image not found');
    await prisma.productImage.delete({ where: { id: image.id } });
    res.json({ ok: true });
  }),
);

catalogAdminRouter.get(
  '/categories',
  requireStaff('catalog.read'),
  asyncHandler(async (_req, res) => {
    res.json((await prisma.category.findMany({ orderBy: { sortOrder: 'asc' } })).map(withPublicMedia));
  }),
);

catalogAdminRouter.post(
  '/categories',
  requireStaff('catalog.write'),
  asyncHandler(async (req, res) => {
    const body = categoryWriteSchema.parse(req.body);
    const slug = body.slug ?? slugify(body.name);
    res.status(201).json(
      await prisma.category.create({
        data: { ...body, slug, path: slug },
      }),
    );
  }),
);

catalogAdminRouter.patch(
  '/categories/:id',
  requireStaff('catalog.write'),
  asyncHandler(async (req, res) => {
    const body = categoryWriteSchema.partial().parse(req.body);
    const current = await prisma.category.findUnique({ where: { id: String(req.params.id) } });
    if (!current) throw new HttpError(404, 'Category not found');
    const slug = body.slug ?? (body.name ? slugify(body.name) : undefined);
    res.json(
      await prisma.category.update({
        where: { id: current.id },
        data: {
          name: body.name,
          slug,
          path: slug ?? undefined,
          description: body.description,
          sortOrder: body.sortOrder,
          isActive: body.isActive,
          parentId: body.parentId,
        },
      }),
    );
  }),
);

catalogAdminRouter.get(
  '/brands',
  requireStaff('catalog.read'),
  asyncHandler(async (_req, res) => {
    res.json((await prisma.brand.findMany({ orderBy: { sortOrder: 'asc' } })).map(withPublicMedia));
  }),
);

catalogAdminRouter.post(
  '/brands',
  requireStaff('catalog.write'),
  asyncHandler(async (req, res) => {
    const body = brandWriteSchema.parse(req.body);
    const slug = body.slug ?? slugify(body.name);
    res.status(201).json(await prisma.brand.create({ data: { ...body, slug } }));
  }),
);

catalogAdminRouter.patch(
  '/brands/:id',
  requireStaff('catalog.write'),
  asyncHandler(async (req, res) => {
    const body = brandWriteSchema.partial().parse(req.body);
    const current = await prisma.brand.findUnique({ where: { id: String(req.params.id) } });
    if (!current) throw new HttpError(404, 'Brand not found');
    res.json(
      await prisma.brand.update({
        where: { id: current.id },
        data: {
          name: body.name,
          slug: body.slug ?? (body.name ? slugify(body.name) : undefined),
          description: body.description,
          website: body.website,
          isActive: body.isActive,
        },
      }),
    );
  }),
);
