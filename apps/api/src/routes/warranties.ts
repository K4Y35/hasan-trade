import { prisma } from '@shopstack/db';
import {
  warrantyClaimCreateSchema,
  warrantyClaimUpdateSchema,
  warrantyLookupSchema,
  warrantyRegisterSchema,
} from '@shopstack/shared';
import { Router } from 'express';
import { requireStaff } from '../lib/auth';
import { asyncHandler, HttpError } from '../lib/http';
import { phoneLookupValues } from '../lib/phone';
import { defaultBranchId } from '../lib/stock';
import {
  addMonths,
  coverageMatchesPhone,
  parseDay,
  refreshExpired,
  serializeWarranty,
  warrantyInclude,
} from '../lib/warranty';

export const warrantiesPublicRouter = Router();
export const warrantiesAdminRouter = Router();

function normalizeSerial(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, '');
}

async function findCustomer(phone: string, name: string) {
  const phones = phoneLookupValues(phone);
  const existing = await prisma.user.findFirst({
    where: { kind: 'CUSTOMER', phone: { in: phones } },
    select: { id: true, name: true, phone: true, email: true },
  });
  if (existing) return existing;
  void name;
  return null;
}

warrantiesPublicRouter.get(
  '/lookup',
  asyncHandler(async (req, res) => {
    const body = warrantyLookupSchema.parse({
      serial: typeof req.query.serial === 'string' ? req.query.serial : '',
      phone: typeof req.query.phone === 'string' ? req.query.phone : '',
    });
    const serial = normalizeSerial(body.serial);
    const row = await prisma.warranty.findFirst({
      where: { serial: { serial } },
      include: warrantyInclude,
    });
    if (!row || !coverageMatchesPhone(row, body.phone)) {
      throw new HttpError(404, 'No warranty found for that serial and phone');
    }
    if (row.status === 'ACTIVE' && row.endDate < new Date()) {
      await prisma.warranty.update({ where: { id: row.id }, data: { status: 'EXPIRED' } });
      row.status = 'EXPIRED';
    }
    res.json(serializeWarranty(row, true));
  }),
);

warrantiesPublicRouter.post(
  '/claims',
  asyncHandler(async (req, res) => {
    const body = warrantyClaimCreateSchema.parse(req.body);
    const serial = normalizeSerial(body.serial);
    const row = await prisma.warranty.findFirst({
      where: { serial: { serial } },
      include: warrantyInclude,
    });
    if (!row || !coverageMatchesPhone(row, body.phone)) {
      throw new HttpError(404, 'No warranty found for that serial and phone');
    }
    if (row.status === 'VOID') throw new HttpError(400, 'This warranty is no longer valid');
    if (row.status === 'EXPIRED' || row.endDate < new Date()) {
      throw new HttpError(400, 'This warranty has expired');
    }
    const open = row.claims.find((claim) => claim.status === 'OPEN' || claim.status === 'IN_PROGRESS');
    if (open) {
      throw new HttpError(409, 'A claim is already open for this product. The shop will call you.');
    }
    const claim = await prisma.$transaction(async (tx) => {
      const created = await tx.warrantyClaim.create({
        data: { warrantyId: row.id, description: body.description },
      });
      await tx.warranty.update({ where: { id: row.id }, data: { status: 'CLAIMED' } });
      return created;
    });
    res.status(201).json({
      id: claim.id,
      status: claim.status,
      createdAt: claim.createdAt.toISOString(),
    });
  }),
);

warrantiesAdminRouter.get(
  '/claims',
  requireStaff('warranties.read'),
  asyncHandler(async (req, res) => {
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const allowed = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'];
    const rows = await prisma.warrantyClaim.findMany({
      where: status && allowed.includes(status) ? { status: status as never } : {},
      include: {
        warranty: {
          include: {
            serial: { select: { serial: true } },
            product: { select: { id: true, name: true, slug: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    res.json(
      rows.map((row) => ({
        id: row.id,
        description: row.description,
        status: row.status,
        resolution: row.resolution,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
        warranty: {
          id: row.warranty.id,
          serial: row.warranty.serial.serial,
          status: row.warranty.status,
          customerName: row.warranty.customerName,
          phone: row.warranty.phone,
          invoiceRef: row.warranty.invoiceRef,
          endDate: row.warranty.endDate.toISOString(),
          product: row.warranty.product,
        },
      })),
    );
  }),
);

warrantiesAdminRouter.patch(
  '/claims/:id',
  requireStaff('warranties.write'),
  asyncHandler(async (req, res) => {
    const body = warrantyClaimUpdateSchema.parse(req.body);
    const current = await prisma.warrantyClaim.findUnique({
      where: { id: String(req.params.id) },
      include: { warranty: true },
    });
    if (!current) throw new HttpError(404, 'Claim not found');
    if ((body.status === 'RESOLVED' || body.status === 'REJECTED') && !body.resolution?.trim()) {
      throw new HttpError(400, 'Add a short note about what you did or why it was declined');
    }
    const claim = await prisma.$transaction(async (tx) => {
      const updated = await tx.warrantyClaim.update({
        where: { id: current.id },
        data: {
          status: body.status,
          resolution: body.resolution?.trim() || current.resolution,
        },
      });
      let nextWarranty = current.warranty.status;
      if (body.status === 'OPEN' || body.status === 'IN_PROGRESS') nextWarranty = 'CLAIMED';
      if (body.status === 'RESOLVED' || body.status === 'REJECTED') {
        nextWarranty = current.warranty.endDate < new Date() ? 'EXPIRED' : 'ACTIVE';
      }
      if (nextWarranty !== current.warranty.status) {
        await tx.warranty.update({ where: { id: current.warrantyId }, data: { status: nextWarranty } });
      }
      return updated;
    });
    res.json({
      ...claim,
      createdAt: claim.createdAt.toISOString(),
      updatedAt: claim.updatedAt.toISOString(),
    });
  }),
);

warrantiesAdminRouter.get(
  '/',
  requireStaff('warranties.read'),
  asyncHandler(async (req, res) => {
    await refreshExpired();
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const allowed = ['ACTIVE', 'EXPIRED', 'CLAIMED', 'VOID'];
    const rows = await prisma.warranty.findMany({
      where: {
        ...(status && allowed.includes(status) ? { status: status as never } : {}),
        ...(q
          ? {
              OR: [
                { serial: { serial: { contains: q } } },
                { phone: { contains: q } },
                { customerName: { contains: q } },
                { invoiceRef: { contains: q } },
                { product: { name: { contains: q } } },
              ],
            }
          : {}),
      },
      include: warrantyInclude,
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    res.json(rows.map((row) => serializeWarranty(row)));
  }),
);

warrantiesAdminRouter.post(
  '/',
  requireStaff('warranties.write'),
  asyncHandler(async (req, res) => {
    const body = warrantyRegisterSchema.parse(req.body);
    const serial = normalizeSerial(body.serial);
    const product = await prisma.product.findUnique({
      where: { id: body.productId },
      include: { variants: { where: { isActive: true }, orderBy: { isDefault: 'desc' } } },
    });
    if (!product) throw new HttpError(400, 'Choose a product');
    const variant =
      (body.variantId ? product.variants.find((row) => row.id === body.variantId) : null) ?? product.variants[0];
    if (!variant) throw new HttpError(400, 'This product has no sellable variant');
    const months = body.months ?? product.warrantyMonths;
    if (!months) throw new HttpError(400, 'Set how many months of cover apply');
    const startDate = parseDay(body.purchaseDate);
    const endDate = addMonths(startDate, months);
    const customer = await findCustomer(body.phone, body.customerName);
    const branchId = await defaultBranchId();

    const existing = await prisma.serialNumber.findUnique({
      where: { serial },
      include: { warranty: true },
    });
    if (existing?.warranty) throw new HttpError(409, 'That serial already has a warranty');
    if (existing && existing.variantId !== variant.id) {
      throw new HttpError(409, 'That serial is already recorded on a different product');
    }

    const row = await prisma.$transaction(async (tx) => {
      const serialRow = existing
        ? await tx.serialNumber.update({
            where: { id: existing.id },
            data: { status: 'SOLD', soldAt: existing.soldAt ?? startDate, purchasedAt: existing.purchasedAt ?? startDate },
          })
        : await tx.serialNumber.create({
            data: {
              serial,
              variantId: variant.id,
              branchId,
              status: 'SOLD',
              purchasedAt: startDate,
              soldAt: startDate,
            },
          });
      return tx.warranty.create({
        data: {
          serialId: serialRow.id,
          productId: product.id,
          customerId: customer?.id,
          customerName: body.customerName,
          phone: body.phone.trim(),
          invoiceRef: body.invoiceRef ?? null,
          startDate,
          endDate,
          notes: body.notes ?? null,
          status: endDate < new Date() ? 'EXPIRED' : 'ACTIVE',
        },
        include: warrantyInclude,
      });
    });
    res.status(201).json(serializeWarranty(row));
  }),
);

warrantiesAdminRouter.patch(
  '/:id',
  requireStaff('warranties.write'),
  asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    const current = await prisma.warranty.findUnique({ where: { id } });
    if (!current) throw new HttpError(404, 'Warranty not found');
    const status = typeof req.body?.status === 'string' ? req.body.status : undefined;
    const notes = typeof req.body?.notes === 'string' ? req.body.notes : undefined;
    const allowed = ['ACTIVE', 'EXPIRED', 'CLAIMED', 'VOID'];
    if (status && !allowed.includes(status)) throw new HttpError(400, 'Invalid status');
    const row = await prisma.warranty.update({
      where: { id },
      data: {
        ...(status ? { status: status as never } : {}),
        ...(notes !== undefined ? { notes: notes.trim() || null } : {}),
      },
      include: warrantyInclude,
    });
    res.json(serializeWarranty(row));
  }),
);
