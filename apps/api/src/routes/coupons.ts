import { prisma } from '@shopstack/db';
import { couponPatchSchema, couponPreviewSchema, couponWriteSchema } from '@shopstack/shared';
import { Router } from 'express';
import { optionalAuth, requireStaff } from '../lib/auth';
import {
  assertCouponApplies,
  loadCoupon,
  parseCouponDate,
  quoteCart,
  serializeCoupon,
} from '../lib/coupon';
import { asyncHandler, HttpError } from '../lib/http';

export const couponsRouter = Router();
export const checkoutCouponRouter = Router();

checkoutCouponRouter.post(
  '/coupon',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const body = couponPreviewSchema.parse(req.body);
    const { subtotal } = await quoteCart(body.items);
    const coupon = await loadCoupon(body.code);
    const { discount, payable } = assertCouponApplies(coupon, subtotal);
    res.json({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discount,
      subtotal,
      payable,
      minSubtotal: coupon.minSubtotal,
    });
  }),
);

couponsRouter.get(
  '/',
  requireStaff('coupons.read', 'orders.read', 'settings.read'),
  asyncHandler(async (_req, res) => {
    const rows = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { orders: true } } },
    });
    res.json(
      rows.map((row) => ({
        ...serializeCoupon(row),
        orderCount: row._count.orders,
      })),
    );
  }),
);

couponsRouter.post(
  '/',
  requireStaff('coupons.write', 'orders.write', 'settings.write'),
  asyncHandler(async (req, res) => {
    const body = couponWriteSchema.parse(req.body);
    const existing = await prisma.coupon.findUnique({ where: { code: body.code } });
    if (existing) throw new HttpError(409, 'A coupon with that code already exists');
    const row = await prisma.coupon.create({
      data: {
        code: body.code,
        type: body.type,
        value: body.value,
        minSubtotal: body.minSubtotal ?? null,
        maxUses: body.maxUses ?? null,
        startsAt: parseCouponDate(body.startsAt),
        endsAt: parseCouponDate(body.endsAt, true),
        isActive: body.isActive ?? true,
      },
    });
    res.status(201).json(serializeCoupon(row));
  }),
);

couponsRouter.patch(
  '/:id',
  requireStaff('coupons.write', 'orders.write', 'settings.write'),
  asyncHandler(async (req, res) => {
    const body = couponPatchSchema.parse(req.body);
    const current = await prisma.coupon.findUnique({ where: { id: String(req.params.id) } });
    if (!current) throw new HttpError(404, 'Coupon not found');
    if (body.code && body.code !== current.code) {
      const clash = await prisma.coupon.findUnique({ where: { code: body.code } });
      if (clash) throw new HttpError(409, 'A coupon with that code already exists');
    }
    const type = body.type ?? current.type;
    const value = body.value ?? Number(current.value);
    if (type === 'PERCENT' && value > 100) throw new HttpError(400, 'Percent off cannot be more than 100');
    const row = await prisma.coupon.update({
      where: { id: current.id },
      data: {
        ...(body.code ? { code: body.code } : {}),
        ...(body.type ? { type: body.type } : {}),
        ...(body.value != null ? { value: body.value } : {}),
        ...(body.minSubtotal !== undefined ? { minSubtotal: body.minSubtotal } : {}),
        ...(body.maxUses !== undefined ? { maxUses: body.maxUses } : {}),
        ...(body.startsAt !== undefined ? { startsAt: parseCouponDate(body.startsAt) } : {}),
        ...(body.endsAt !== undefined ? { endsAt: parseCouponDate(body.endsAt, true) } : {}),
        ...(body.isActive != null ? { isActive: body.isActive } : {}),
      },
    });
    res.json(serializeCoupon(row));
  }),
);
