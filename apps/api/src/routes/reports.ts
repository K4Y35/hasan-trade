import { prisma } from '@shopstack/db';
import { paginationSchema } from '@shopstack/shared';
import { Router, type Request } from 'express';
import { requireStaff } from '../lib/auth';
import { asyncHandler, num } from '../lib/http';
import { aggregateProducts, loadSalesLines, salesCsv, summarizeSales } from '../lib/sales-report';

export const reportsRouter = Router();

function queryString(value: unknown) {
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
  return '';
}

function salesQueryFrom(req: Request) {
  const sourceRaw = queryString(req.query.source).trim();
  return {
    q: queryString(req.query.q),
    source: sourceRaw === 'website' || sourceRaw === 'pos' ? sourceRaw : ('all' as const),
    from: queryString(req.query.from) || undefined,
    to: queryString(req.query.to) || undefined,
    category: queryString(req.query.category) || undefined,
    brand: queryString(req.query.brand) || undefined,
    includeCancelled: queryString(req.query.includeCancelled) === '1' || queryString(req.query.includeCancelled) === 'true',
  };
}

reportsRouter.get(
  '/overview',
  requireStaff('reports.read', 'orders.read'),
  asyncHandler(async (_req, res) => {
    const [orders, sales, products, lowStock, recentOrders] = await Promise.all([
      prisma.order.count(),
      prisma.posSale.aggregate({ _sum: { total: true }, _count: true }),
      prisma.product.count({ where: { status: 'ACTIVE' } }),
      prisma.stockBalance.count({ where: { onHand: { lte: 5 } } }),
      prisma.order.findMany({ orderBy: { placedAt: 'desc' }, take: 5, include: { items: true } }),
    ]);
    const webRevenue = await prisma.order.aggregate({
      where: { status: { notIn: ['CANCELLED', 'REFUNDED'] } },
      _sum: { total: true },
    });
    res.json({
      orders,
      products,
      lowStock,
      posSales: sales._count,
      posRevenue: num(sales._sum.total) ?? 0,
      webRevenue: num(webRevenue._sum.total) ?? 0,
      recentOrders,
    });
  }),
);

reportsRouter.get(
  '/sales.csv',
  requireStaff('reports.read', 'orders.read'),
  asyncHandler(async (req, res) => {
    const lines = await loadSalesLines(salesQueryFrom(req));
    const stamp = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="hasan-trade-sales-${stamp}.csv"`);
    res.send(salesCsv(lines));
  }),
);

reportsRouter.get(
  '/sales',
  requireStaff('reports.read', 'orders.read'),
  asyncHandler(async (req, res) => {
    const { page, perPage } = paginationSchema.parse(req.query);
    const view = req.query.view === 'products' ? 'products' : 'lines';
    const filters = salesQueryFrom(req);
    const lines = await loadSalesLines(filters);
    const summary = summarizeSales(lines);
    if (view === 'products') {
      const products = aggregateProducts(lines);
      res.json({
        view,
        summary,
        total: products.length,
        page,
        perPage,
        items: products.slice((page - 1) * perPage, page * perPage),
      });
      return;
    }
    res.json({
      view,
      summary,
      total: lines.length,
      page,
      perPage,
      items: lines.slice((page - 1) * perPage, page * perPage),
    });
  }),
);
