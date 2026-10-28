import { prisma, type StockMovementType } from '@shopstack/db';
import { HttpError } from './http';

type BalanceRow = { id: string; onHand: number; reserved: number };

export async function applyStock(params: {
  branchId: string;
  variantId: string;
  quantity: number;
  type: StockMovementType;
  reason?: string;
  referenceType?: string;
  referenceId?: string;
  createdById?: string;
  unitCost?: number;
}) {
  return prisma.$transaction(async (tx) => {
    let rows = await tx.$queryRaw<BalanceRow[]>`
      SELECT id, onHand, reserved FROM stock_balances
      WHERE branchId = ${params.branchId} AND variantId = ${params.variantId}
      FOR UPDATE
    `;

    if (!rows[0]) {
      await tx.stockBalance.create({
        data: { branchId: params.branchId, variantId: params.variantId, onHand: 0, reserved: 0 },
      });
      rows = await tx.$queryRaw<BalanceRow[]>`
        SELECT id, onHand, reserved FROM stock_balances
        WHERE branchId = ${params.branchId} AND variantId = ${params.variantId}
        FOR UPDATE
      `;
    }

    const balance = rows[0]!;
    let onHand = balance.onHand;
    let reserved = balance.reserved;

    if (params.type === 'RESERVE') {
      if (onHand - reserved < params.quantity) {
        throw new HttpError(409, 'Insufficient stock');
      }
      reserved += params.quantity;
    } else if (params.type === 'RELEASE') {
      reserved = Math.max(0, reserved - Math.abs(params.quantity));
    } else {
      const next = onHand + params.quantity;
      if (next < 0) throw new HttpError(409, 'Insufficient stock');
      onHand = next;
      if (params.type === 'SALE' || params.type === 'POS_SALE') {
        reserved = Math.max(0, reserved - Math.abs(params.quantity));
      }
    }

    await tx.stockLedger.create({
      data: {
        branchId: params.branchId,
        variantId: params.variantId,
        quantity: params.quantity,
        balanceAfter: onHand,
        type: params.type,
        reason: params.reason,
        unitCost: params.unitCost,
        referenceType: params.referenceType,
        referenceId: params.referenceId,
        createdById: params.createdById,
      },
    });

    await tx.stockBalance.update({
      where: { id: balance.id },
      data: { onHand, reserved },
    });

    return { onHand, reserved };
  });
}

export async function defaultBranchId() {
  const branch =
    (await prisma.branch.findFirst({ where: { isDefault: true, isActive: true } })) ??
    (await prisma.branch.findFirst({ where: { isActive: true } }));
  if (!branch) throw new HttpError(500, 'No active branch configured');
  return branch.id;
}
