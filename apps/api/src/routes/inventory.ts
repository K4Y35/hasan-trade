import { prisma } from '@shopstack/db';
import { Router } from 'express';
import { requireStaff } from '../lib/auth';
import { asyncHandler, HttpError } from '../lib/http';
import { publicMediaUrl } from '../lib/serialize';
import { applyStock } from '../lib/stock';

export const inventoryRouter = Router();

inventoryRouter.get(
  '/',
  requireStaff('inventory.read'),
  asyncHandler(async (_req, res) => {
    const rows = await prisma.stockBalance.findMany({
      include: {
        branch: { select: { id: true, name: true, code: true } },
        variant: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: { orderBy: { sortOrder: 'asc' as const }, take: 1, select: { url: true } },
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
    res.json(
      rows.map((r) => ({
        id: r.id,
        branchId: r.branchId,
        variantId: r.variantId,
        onHand: r.onHand,
        reserved: r.reserved,
        available: r.onHand - r.reserved,
        branch: r.branch,
        sku: r.variant.sku,
        product: {
          id: r.variant.product.id,
          name: r.variant.product.name,
          slug: r.variant.product.slug,
          imageUrl: publicMediaUrl(r.variant.product.images[0]?.url),
        },
        variantName: r.variant.name,
      })),
    );
  }),
);

inventoryRouter.post(
  '/adjust',
  requireStaff('inventory.write'),
  asyncHandler(async (req, res) => {
    const branchId = String(req.body?.branchId ?? '');
    const variantId = String(req.body?.variantId ?? '');
    const quantity = Number(req.body?.quantity);
    const reason = String(req.body?.reason ?? 'Manual adjustment');
    if (!branchId || !variantId || !Number.isFinite(quantity) || quantity === 0) {
      throw new HttpError(400, 'branchId, variantId and non-zero quantity are required');
    }
    const result = await applyStock({
      branchId,
      variantId,
      quantity,
      type: 'ADJUSTMENT',
      reason,
      createdById: req.user!.sub,
    });
    res.json(result);
  }),
);

inventoryRouter.get(
  '/ledger',
  requireStaff('inventory.read'),
  asyncHandler(async (req, res) => {
    const variantId = typeof req.query.variantId === 'string' ? req.query.variantId : undefined;
    const rows = await prisma.stockLedger.findMany({
      where: variantId ? { variantId } : {},
      include: {
        branch: { select: { name: true, code: true } },
        variant: { include: { product: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    res.json(rows);
  }),
);
