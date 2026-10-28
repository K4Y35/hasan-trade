import { prisma } from '@shopstack/db';
import { checkoutSchema } from '@shopstack/shared';
import { Router } from 'express';
import { optionalAuth, requireAuth, requireStaff } from '../lib/auth';
import { assertCouponApplies, loadCoupon, quoteCart, roundMoney } from '../lib/coupon';
import { asyncHandler, HttpError, num } from '../lib/http';
import { buildReceiptPdf } from '../lib/receipt-pdf';
import { applyStock, defaultBranchId } from '../lib/stock';

export const checkoutRouter = Router();
export const ordersRouter = Router();

function orderNumber(prefix: string) {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${stamp}-${rand}`;
}

function serializeOrder<
  T extends {
    subtotal: { toString(): string };
    tax: { toString(): string };
    total: { toString(): string };
    discount?: { toString(): string };
    shipping?: { toString(): string };
    coupon?: { id: string; code: string; type: string; value: { toString(): string } } | null;
    items?: { unitPrice: { toString(): string }; tax: { toString(): string }; total: { toString(): string } }[];
    payments?: { amount: { toString(): string } }[];
  },
>(order: T) {
  return {
    ...order,
    subtotal: num(order.subtotal) ?? 0,
    tax: num(order.tax) ?? 0,
    total: num(order.total) ?? 0,
    discount: num(order.discount) ?? 0,
    shipping: num(order.shipping) ?? 0,
    coupon: order.coupon
      ? { id: order.coupon.id, code: order.coupon.code, type: order.coupon.type, value: num(order.coupon.value) ?? 0 }
      : null,
    items: order.items?.map((item) => ({
      ...item,
      unitPrice: num(item.unitPrice) ?? 0,
      tax: num(item.tax) ?? 0,
      total: num(item.total) ?? 0,
    })),
    payments: order.payments?.map((payment) => ({
      ...payment,
      amount: num(payment.amount) ?? 0,
    })),
  };
}

const orderInclude = {
  items: true,
  payments: true,
  coupon: { select: { id: true, code: true, type: true, value: true } },
} as const;

checkoutRouter.post(
  '/',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const body = checkoutSchema.parse(req.body);
    const settings = await prisma.storeSettings.findUnique({ where: { id: 'default' } });
    if (!settings) throw new HttpError(500, 'Store is not initialized');
    if (body.payment === 'COD' && !settings.allowCod) {
      throw new HttpError(400, 'Cash on delivery is not enabled');
    }
    if (!req.user && !settings.allowGuestCheckout) {
      throw new HttpError(401, 'Sign in to checkout');
    }

    const { lines, subtotal } = await quoteCart(body.items);
    const coupon = body.couponCode?.trim() ? await loadCoupon(body.couponCode) : null;
    const { discount } = coupon ? assertCouponApplies(coupon, subtotal) : { discount: 0 };
    const branchId = await defaultBranchId();
    const taxable = Math.max(0, roundMoney(subtotal - discount));
    const taxRate = Number(settings.taxRate);
    const tax = settings.taxInclusive ? 0 : roundMoney((taxable * taxRate) / 100);
    const total = roundMoney(taxable + tax);

    const order = await prisma.$transaction(async (tx) => {
      if (coupon) {
        const bumped =
          coupon.maxUses != null
            ? await tx.coupon.updateMany({
                where: { id: coupon.id, usedCount: { lt: coupon.maxUses } },
                data: { usedCount: { increment: 1 } },
              })
            : await tx.coupon.updateMany({
                where: { id: coupon.id },
                data: { usedCount: { increment: 1 } },
              });
        if (bumped.count === 0) throw new HttpError(400, 'This code has been used up');
      }

      return tx.order.create({
        data: {
          orderNumber: orderNumber(settings.orderPrefix),
          channel: 'WEB',
          status: 'PENDING',
          customerId: req.user?.kind === 'CUSTOMER' ? req.user.sub : undefined,
          branchId,
          couponId: coupon?.id,
          email: body.email,
          phone: body.phone,
          name: body.name,
          shippingAddress: body.shippingAddress,
          subtotal,
          discount,
          tax,
          total,
          customerNotes: body.notes,
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
            create: {
              provider: body.payment,
              amount: total,
              status: body.payment === 'COD' ? 'PENDING' : 'PENDING',
            },
          },
          statusLogs: { create: { toStatus: 'PENDING', note: coupon ? `Order placed · ${coupon.code}` : 'Order placed' } },
        },
        include: orderInclude,
      });
    });

    for (const line of lines) {
      await applyStock({
        branchId,
        variantId: line.variant.id,
        quantity: -line.item.quantity,
        type: 'SALE',
        referenceType: 'order',
        referenceId: order.id,
        createdById: req.user?.sub,
      });
    }

    const confirmed =
      body.payment === 'COD'
        ? await prisma.order.update({
            where: { id: order.id },
            data: {
              status: 'CONFIRMED',
              statusLogs: { create: { fromStatus: 'PENDING', toStatus: 'CONFIRMED', note: 'Cash on delivery' } },
            },
            include: { ...orderInclude, statusLogs: { orderBy: { createdAt: 'asc' as const } } },
          })
        : order;

    res.status(201).json(serializeOrder(confirmed));
  }),
);

ordersRouter.get(
  '/mine',
  requireAuth(),
  asyncHandler(async (req, res) => {
    const orders = await prisma.order.findMany({
      where: { customerId: req.user!.sub },
      include: orderInclude,
      orderBy: { placedAt: 'desc' },
    });
    res.json(orders.map(serializeOrder));
  }),
);

ordersRouter.get(
  '/mine/:id',
  requireAuth(),
  asyncHandler(async (req, res) => {
    const order = await prisma.order.findFirst({
      where: { id: String(req.params.id), customerId: req.user!.sub },
      include: { ...orderInclude, statusLogs: { orderBy: { createdAt: 'asc' } } },
    });
    if (!order) throw new HttpError(404, 'Order not found');
    res.json(serializeOrder(order));
  }),
);

ordersRouter.get(
  '/',
  requireStaff('orders.read'),
  asyncHandler(async (req, res) => {
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const orders = await prisma.order.findMany({
      where: status ? { status: status as never } : {},
      include: orderInclude,
      orderBy: { placedAt: 'desc' },
      take: 100,
    });
    res.json(orders.map(serializeOrder));
  }),
);

ordersRouter.get(
  '/:id',
  requireStaff('orders.read'),
  asyncHandler(async (req, res) => {
    const order = await prisma.order.findUnique({
      where: { id: String(req.params.id) },
      include: { ...orderInclude, statusLogs: { orderBy: { createdAt: 'asc' } } },
    });
    if (!order) throw new HttpError(404, 'Order not found');
    res.json(serializeOrder(order));
  }),
);

ordersRouter.get(
  '/:id/receipt',
  requireStaff('orders.read'),
  asyncHandler(async (req, res) => {
    const [order, store] = await Promise.all([
      prisma.order.findUnique({
        where: { id: String(req.params.id) },
        include: { ...orderInclude },
      }),
      prisma.storeSettings.findUnique({ where: { id: 'default' } }),
    ]);
    if (!order) throw new HttpError(404, 'Order not found');
    if (!store) throw new HttpError(500, 'Store is not initialized');

    const pdf = await buildReceiptPdf(order, {
      name: store.name,
      legalName: store.legalName,
      phone: store.phone,
      email: store.email,
      address: store.address,
      logoUrl: store.logoUrl,
      invoiceLogoUrl: store.invoiceLogoUrl,
      invoiceFooter: store.invoiceFooter,
      copyrightText: store.copyrightText,
      currencySymbol: store.currencySymbol,
    });

    const filename = `${order.orderNumber}-receipt.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', String(pdf.length));
    res.send(pdf);
  }),
);

ordersRouter.post(
  '/:id/status',
  requireStaff('orders.write'),
  asyncHandler(async (req, res) => {
    const toStatus = String(req.body?.status ?? '');
    const allowed = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];
    if (!allowed.includes(toStatus)) throw new HttpError(400, 'Invalid status');
    const current = await prisma.order.findUnique({ where: { id: String(req.params.id) } });
    if (!current) throw new HttpError(404, 'Order not found');
    const order = await prisma.order.update({
      where: { id: current.id },
      data: {
        status: toStatus as never,
        statusLogs: { create: { fromStatus: current.status, toStatus: toStatus as never } },
      },
        include: { ...orderInclude, statusLogs: { orderBy: { createdAt: 'asc' } } },
      });
    res.json(serializeOrder(order));
  }),
);
