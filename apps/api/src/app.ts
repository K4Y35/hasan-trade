import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import path from 'node:path';
import { env } from './env';
import { errorHandler } from './lib/http';
import { authRouter } from './routes/auth';
import { catalogAdminRouter, catalogPublicRouter } from './routes/catalog';
import { checkoutRouter, ordersRouter } from './routes/checkout';
import { checkoutCouponRouter, couponsRouter } from './routes/coupons';
import { warrantiesAdminRouter, warrantiesPublicRouter } from './routes/warranties';
import { customersRouter } from './routes/customers';
import { healthRouter } from './routes/health';
import { inventoryRouter } from './routes/inventory';
import { mediaRouter } from './routes/media';
import { posRouter } from './routes/pos';
import { reportsRouter } from './routes/reports';
import { cmsAdminRouter } from './routes/cms';
import { settingsRouter } from './routes/settings';
import { accountRouter } from './routes/wishlist';

export function createApp() {
  const app = express();
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(
    cors({
      origin: [env.storefrontUrl, env.adminUrl],
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '2mb' }));
  app.use('/uploads', express.static(path.resolve(env.uploadsDir)));
  app.use('/health', healthRouter);
  app.use('/v1/auth', authRouter);
  app.use('/v1/settings', settingsRouter);
  app.use('/v1/catalog', catalogPublicRouter);
  app.use('/v1/admin/catalog', catalogAdminRouter);
  app.use('/v1/admin/cms', cmsAdminRouter);
  app.use('/v1/checkout', checkoutCouponRouter);
  app.use('/v1/checkout', checkoutRouter);
  app.use('/v1/orders', ordersRouter);
  app.use('/v1/admin/coupons', couponsRouter);
  app.use('/v1/warranties', warrantiesPublicRouter);
  app.use('/v1/admin/warranties', warrantiesAdminRouter);
  app.use('/v1/admin/customers', customersRouter);
  app.use('/v1/pos', posRouter);
  app.use('/v1/inventory', inventoryRouter);
  app.use('/v1/media', mediaRouter);
  app.use('/v1/reports', reportsRouter);
  app.use('/v1/account', accountRouter);
  app.get('/', (_req, res) => {
    res.json({ name: 'shopstack-api', version: '0.1.0' });
  });
  app.use(errorHandler);
  return app;
}
