import { prisma } from '@shopstack/db';
import { posSaleSchema } from '@shopstack/shared';
import { Router } from 'express';
import { requireStaff } from '../lib/auth';
import { asyncHandler, HttpError, num } from '../lib/http';
import { publicMediaUrl } from '../lib/serialize';
import { applyStock, defaultBranchId } from '../lib/stock';

export const posRouter = Router();

function saleNumber() {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `POS-${stamp}-${Math.floor(1000 + Math.random() * 9000)}`;
}

posRouter.get(
  '/session',
  requireStaff('pos.session', 'pos.sell'),
  asyncHandler(async (req, res) => {
    const session = await prisma.posSession.findFirst({
      where: { cashierId: req.user!.sub, status: 'OPEN' },
      include: { terminal: true, branch: true },
      orderBy: { openedAt: 'desc' },
    });
    res.json({ session });
  }),
);

posRouter.post(
  '/session/open',
  requireStaff('pos.session'),
  asyncHandler(async (req, res) => {
    const existing = await prisma.posSession.findFirst({
      where: { cashierId: req.user!.sub, status: 'OPEN' },
    });
    if (existing) {
      res.json({ session: existing });
      return;
    }
    const branchId = await defaultBranchId();
    const terminal =
      (await prisma.posTerminal.findFirst({ where: { branchId, isActive: true } })) ??
      (await prisma.posTerminal.create({
        data: { branchId, code: 'POS-01', name: 'Counter 1' },
      }));
    const session = await prisma.posSession.create({
      data: {
        terminalId: terminal.id,
        branchId,
        cashierId: req.user!.sub,
        openingFloat: Number(req.body?.openingFloat ?? 0),
      },
      include: { terminal: true, branch: true },
    });
    res.status(201).json({ session });
  }),
);

posRouter.post(
  '/session/close',
  requireStaff('pos.session'),
  asyncHandler(async (req, res) => {
    const session = await prisma.posSession.findFirst({
      where: { cashierId: req.user!.sub, status: 'OPEN' },
    });
    if (!session) throw new HttpError(404, 'No open session');
    const closed = await prisma.posSession.update({
      where: { id: session.id },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
        closingCash: Number(req.body?.closingCash ?? 0),
      },
    });
    res.json({ session: closed });
  }),
);

posRouter.get(
  '/lookup',
  requireStaff('pos.sell'),
  asyncHandler(async (req, res) => {
    const q = String(req.query.q ?? '').trim();
    if (!q) throw new HttpError(400, 'q is required');
    const variant = await prisma.productVariant.findFirst({
      where: {
        isActive: true,
        OR: [{ sku: q }, { barcode: q }, { product: { name: { contains: q } } }],
      },
      include: {
        product: { include: { images: { orderBy: { sortOrder: 'asc' as const }, take: 1 } } },
        stockBalances: true,
      },
    });
    if (!variant) throw new HttpError(404, 'No matching product');
    res.json({
      id: variant.id,
      name: variant.product.name,
      variantName: variant.name,
      sku: variant.sku,
      barcode: variant.barcode,
      price: num(variant.price),
      onHand: variant.stockBalances.reduce((sum, b) => sum + b.onHand, 0),
      warrantyMonths: variant.product.warrantyMonths,
      imageUrl: publicMediaUrl(variant.product.images[0]?.url),
    });
  }),
);

posRouter.post(
  '/sales',
  requireStaff('pos.sell'),
  asyncHandler(async (req, res) => {
    const body = posSaleSchema.parse(req.body);
    const session = await prisma.posSession.findFirst({
      where: { cashierId: req.user!.sub, status: 'OPEN' },
    });
    if (!session) throw new HttpError(400, 'Open a POS session first');

    const variants = await prisma.productVariant.findMany({
      where: { id: { in: body.items.map((i) => i.variantId) } },
      include: { product: true },
    });
    if (variants.length !== body.items.length) throw new HttpError(400, 'Unknown variant in sale');

    let subtotal = 0;
    const lines = body.items.map((item) => {
      const variant = variants.find((v) => v.id === item.variantId)!;
      const unit = item.unitPrice ?? Number(variant.price);
      const total = unit * item.quantity;
      subtotal += total;
      return { item, variant, unit, total };
    });
    const discount = body.discount ?? 0;
    const total = Math.max(0, subtotal - discount);
    const paid = body.payments.reduce((s, p) => s + p.amount, 0);
    const due = Math.max(0, Number((total - paid).toFixed(2)));

    let customerId = body.customerId;
    if (!customerId && body.customerPhone) {
      const customer = await prisma.user.upsert({
        where: { phone: body.customerPhone },
        update: { name: body.customerName ?? 'Walk-in' },
        create: {
          kind: 'CUSTOMER',
          name: body.customerName ?? 'Walk-in',
          phone: body.customerPhone,
        },
      });
      customerId = customer.id;
    }

    const sale = await prisma.posSale.create({
      data: {
        saleNumber: saleNumber(),
        sessionId: session.id,
        branchId: session.branchId,
        cashierId: req.user!.sub,
        customerId,
        subtotal,
        discount,
        tax: 0,
        total,
        paid,
        due,
        notes: body.notes,
        items: {
          create: lines.map((line) => ({
            productId: line.variant.productId,
            variantId: line.variant.id,
            name: line.variant.product.name,
            sku: line.variant.sku,
            quantity: line.item.quantity,
            unitPrice: line.unit,
            tax: 0,
            total: line.total,
            warrantyMonths: line.variant.product.warrantyMonths,
          })),
        },
        payments: {
          create: body.payments.map((p) => ({
            provider: p.provider,
            amount: p.amount,
            reference: p.reference,
          })),
        },
      },
      include: { items: true, payments: true },
    });

    for (const line of lines) {
      await applyStock({
        branchId: session.branchId,
        variantId: line.variant.id,
        quantity: -line.item.quantity,
        type: 'POS_SALE',
        referenceType: 'pos_sale',
        referenceId: sale.id,
        createdById: req.user!.sub,
      });
    }

    if (due > 0 && customerId) {
      await prisma.dueLedger.create({
        data: { customerId, posSaleId: sale.id, amount: due, type: 'SALE' },
      });
    }

    res.status(201).json({
      ...sale,
      subtotal: num(sale.subtotal),
      total: num(sale.total),
      paid: num(sale.paid),
      due: num(sale.due),
    });
  }),
);

posRouter.get(
  '/sales',
  requireStaff('pos.sell', 'reports.read'),
  asyncHandler(async (_req, res) => {
    const sales = await prisma.posSale.findMany({
      include: { items: true, payments: true },
      orderBy: { soldAt: 'desc' },
      take: 50,
    });
    res.json(sales);
  }),
);
