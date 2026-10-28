import { prisma } from '@shopstack/db';
import { paginationSchema } from '@shopstack/shared';
import { Router } from 'express';
import { requireStaff } from '../lib/auth';
import { asyncHandler } from '../lib/http';

export const customersRouter = Router();

customersRouter.get(
  '/',
  requireStaff('customers.read'),
  asyncHandler(async (req, res) => {
    const { page, perPage } = paginationSchema.parse(req.query);
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const where = {
      kind: 'CUSTOMER' as const,
      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { email: { contains: q } },
              { phone: { contains: q } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          status: true,
          createdAt: true,
          lastLoginAt: true,
          _count: { select: { orders: true } },
          orders: {
            take: 1,
            orderBy: { placedAt: 'desc' },
            select: { orderNumber: true, placedAt: true, total: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      items: items.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        status: user.status,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        orderCount: user._count.orders,
        lastOrder: user.orders[0]
          ? {
              orderNumber: user.orders[0].orderNumber,
              placedAt: user.orders[0].placedAt,
              total: Number(user.orders[0].total),
            }
          : null,
      })),
      total,
      page,
      perPage,
    });
  }),
);
