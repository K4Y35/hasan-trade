import { prisma } from '@shopstack/db';
import { Router } from 'express';
import { requireAuth } from '../lib/auth';
import { asyncHandler, HttpError } from '../lib/http';
import { serializeProduct } from '../lib/serialize';

export const accountRouter = Router();

accountRouter.get(
  '/wishlist',
  requireAuth(),
  asyncHandler(async (req, res) => {
    const items = await prisma.wishlistItem.findMany({
      where: { userId: req.user!.sub },
      include: {
        product: {
          include: {
            brand: true,
            variants: { where: { isDefault: true } },
            images: { take: 1, orderBy: { sortOrder: 'asc' } },
            categories: { include: { category: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(items.map((i) => serializeProduct(i.product)));
  }),
);

accountRouter.post(
  '/wishlist',
  requireAuth(),
  asyncHandler(async (req, res) => {
    const productId = String(req.body?.productId ?? '');
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new HttpError(404, 'Product not found');
    await prisma.wishlistItem.upsert({
      where: { userId_productId: { userId: req.user!.sub, productId } },
      update: {},
      create: { userId: req.user!.sub, productId },
    });
    res.json({ ok: true });
  }),
);

accountRouter.delete(
  '/wishlist/:productId',
  requireAuth(),
  asyncHandler(async (req, res) => {
    await prisma.wishlistItem.deleteMany({
      where: { userId: req.user!.sub, productId: String(req.params.productId) },
    });
    res.json({ ok: true });
  }),
);

accountRouter.get(
  '/compare',
  requireAuth(),
  asyncHandler(async (req, res) => {
    const items = await prisma.compareItem.findMany({
      where: { userId: req.user!.sub },
      include: {
        product: {
          include: {
            brand: true,
            variants: { where: { isDefault: true } },
            images: true,
            specs: { include: { field: true } },
            categories: { include: { category: true } },
          },
        },
      },
    });
    res.json(items.map((i) => serializeProduct(i.product)));
  }),
);

accountRouter.post(
  '/compare',
  requireAuth(),
  asyncHandler(async (req, res) => {
    const productId = String(req.body?.productId ?? '');
    const count = await prisma.compareItem.count({ where: { userId: req.user!.sub } });
    if (count >= 4) throw new HttpError(400, 'Compare list is limited to 4 products');
    await prisma.compareItem.upsert({
      where: { userId_productId: { userId: req.user!.sub, productId } },
      update: {},
      create: { userId: req.user!.sub, productId },
    });
    res.json({ ok: true });
  }),
);
