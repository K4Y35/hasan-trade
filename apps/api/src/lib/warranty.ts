import { prisma, type WarrantyStatus } from '@shopstack/db';
import { phonesMatch } from './phone';

const warrantyInclude = {
  serial: { select: { id: true, serial: true, variantId: true, status: true } },
  product: { select: { id: true, name: true, slug: true, sku: true, warrantyMonths: true } },
  customer: { select: { id: true, name: true, phone: true, email: true } },
  claims: { orderBy: { createdAt: 'desc' as const } },
} as const;

export function addMonths(from: Date, months: number) {
  const next = new Date(from);
  next.setMonth(next.getMonth() + months);
  return next;
}

export function parseDay(value: string | undefined, fallback = new Date()) {
  if (!value) return fallback;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    return new Date(`${value.trim()}T00:00:00+06:00`);
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
}

export function effectiveWarrantyStatus(status: WarrantyStatus, endDate: Date, now = new Date()) {
  if (status === 'ACTIVE' && endDate < now) return 'EXPIRED' as const;
  return status;
}

type WarrantyRow = {
  id: string;
  customerName: string | null;
  phone: string | null;
  invoiceRef: string | null;
  notes: string | null;
  startDate: Date;
  endDate: Date;
  status: WarrantyStatus;
  createdAt: Date;
  serial: { id: string; serial: string; variantId: string; status: string };
  product: { id: string; name: string; slug: string; sku: string | null; warrantyMonths: number };
  customer: { id: string; name: string; phone: string | null; email: string | null } | null;
  claims: {
    id: string;
    description: string;
    status: string;
    resolution: string | null;
    createdAt: Date;
    updatedAt: Date;
  }[];
};

export function serializeWarranty(row: WarrantyRow, publicView = false) {
  const status = effectiveWarrantyStatus(row.status, row.endDate);
  const openClaim = row.claims.find((claim) => claim.status === 'OPEN' || claim.status === 'IN_PROGRESS');
  const latestClaim = row.claims[0] ?? null;
  return {
    id: row.id,
    serial: row.serial.serial,
    product: row.product,
    customerName: row.customerName || row.customer?.name || null,
    phone: publicView ? undefined : row.phone || row.customer?.phone || null,
    invoiceRef: row.invoiceRef,
    notes: publicView ? undefined : row.notes,
    startDate: row.startDate.toISOString(),
    endDate: row.endDate.toISOString(),
    status,
    canClaim: status === 'ACTIVE' && !openClaim,
    openClaim: openClaim
      ? {
          id: openClaim.id,
          status: openClaim.status,
          description: openClaim.description,
          createdAt: openClaim.createdAt.toISOString(),
        }
      : null,
    latestClaim: latestClaim
      ? {
          id: latestClaim.id,
          status: latestClaim.status,
          description: latestClaim.description,
          resolution: latestClaim.resolution,
          createdAt: latestClaim.createdAt.toISOString(),
          updatedAt: latestClaim.updatedAt.toISOString(),
        }
      : null,
    claims: publicView
      ? undefined
      : row.claims.map((claim) => ({
          ...claim,
          createdAt: claim.createdAt.toISOString(),
          updatedAt: claim.updatedAt.toISOString(),
        })),
    createdAt: row.createdAt.toISOString(),
  };
}

export async function refreshExpired(ids?: string[]) {
  await prisma.warranty.updateMany({
    where: {
      status: 'ACTIVE',
      endDate: { lt: new Date() },
      ...(ids ? { id: { in: ids } } : {}),
    },
    data: { status: 'EXPIRED' },
  });
}

export function coverageMatchesPhone(
  row: {
    phone: string | null;
    customer: { phone: string | null } | null;
  },
  phone: string,
) {
  return phonesMatch(row.phone, phone) || phonesMatch(row.customer?.phone, phone);
}

export { warrantyInclude };
