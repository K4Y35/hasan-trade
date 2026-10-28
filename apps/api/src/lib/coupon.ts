import { prisma } from '@shopstack/db';
import { HttpError, num } from './http';

export type CouponRecord = {
  id: string;
  code: string;
  type: 'PERCENT' | 'FIXED';
  value: number;
  minSubtotal: number | null;
  maxUses: number | null;
  usedCount: number;
  startsAt: Date | null;
  endsAt: Date | null;
  isActive: boolean;
};

export function roundMoney(amount: number) {
  return Math.round(amount * 100) / 100;
}

export function normalizeCouponCode(code: string) {
  return code.trim().toUpperCase().replace(/\s+/g, '');
}

export function serializeCoupon<
  T extends {
    value: { toString(): string };
    minSubtotal: { toString(): string } | null;
    startsAt: Date | null;
    endsAt: Date | null;
  },
>(coupon: T) {
  return {
    ...coupon,
    value: num(coupon.value) ?? 0,
    minSubtotal: num(coupon.minSubtotal),
    startsAt: coupon.startsAt?.toISOString() ?? null,
    endsAt: coupon.endsAt?.toISOString() ?? null,
  };
}

export function parseCouponDate(value: string | null | undefined, endOfDay = false) {
  if (!value) return null;
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return new Date(`${trimmed}T${endOfDay ? '23:59:59.999' : '00:00:00'}+06:00`);
  }
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) throw new HttpError(400, 'Enter a valid date');
  return parsed;
}

export function couponDiscount(coupon: Pick<CouponRecord, 'type' | 'value'>, subtotal: number) {
  if (coupon.type === 'PERCENT') {
    return roundMoney(Math.min(subtotal, (subtotal * coupon.value) / 100));
  }
  return roundMoney(Math.min(subtotal, coupon.value));
}

export function assertCouponApplies(coupon: CouponRecord, subtotal: number, now = new Date()) {
  if (!coupon.isActive) throw new HttpError(400, 'This code is no longer active');
  if (coupon.startsAt && now < coupon.startsAt) throw new HttpError(400, 'This code is not valid yet');
  if (coupon.endsAt && now > coupon.endsAt) throw new HttpError(400, 'This code has expired');
  if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) {
    throw new HttpError(400, 'This code has been used up');
  }
  if (coupon.minSubtotal != null && subtotal < coupon.minSubtotal) {
    const needed = roundMoney(coupon.minSubtotal - subtotal);
    throw new HttpError(400, `Spend ৳${needed.toLocaleString('en-BD')} more to use this code`);
  }
  const discount = couponDiscount(coupon, subtotal);
  if (discount <= 0) throw new HttpError(400, 'This code does not apply to this order');
  return { discount, payable: roundMoney(subtotal - discount) };
}

function toCouponRecord(row: {
  id: string;
  code: string;
  type: 'PERCENT' | 'FIXED';
  value: { toString(): string };
  minSubtotal: { toString(): string } | null;
  maxUses: number | null;
  usedCount: number;
  startsAt: Date | null;
  endsAt: Date | null;
  isActive: boolean;
}): CouponRecord {
  return {
    id: row.id,
    code: row.code,
    type: row.type,
    value: num(row.value) ?? 0,
    minSubtotal: num(row.minSubtotal),
    maxUses: row.maxUses,
    usedCount: row.usedCount,
    startsAt: row.startsAt,
    endsAt: row.endsAt,
    isActive: row.isActive,
  };
}

export async function loadCoupon(code: string) {
  const normalized = normalizeCouponCode(code);
  if (!normalized) throw new HttpError(400, 'Enter a coupon code');
  const row = await prisma.coupon.findUnique({ where: { code: normalized } });
  if (!row) throw new HttpError(400, 'That code is not valid');
  return toCouponRecord(row);
}

export async function quoteCart(items: { variantId: string; quantity: number }[]) {
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: items.map((item) => item.variantId) }, isActive: true },
    include: { product: true },
  });
  if (variants.length !== items.length) throw new HttpError(400, 'One or more items are unavailable');
  let subtotal = 0;
  const lines = items.map((item) => {
    const variant = variants.find((row) => row.id === item.variantId)!;
    const unit = Number(variant.price);
    const total = unit * item.quantity;
    subtotal += total;
    return { item, variant, unit, total };
  });
  return { variants, lines, subtotal: roundMoney(subtotal) };
}
