import { prisma } from '@shopstack/db';
import { Router } from 'express';

export const healthRouter = Router();

healthRouter.get('/', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, db: 'up' });
  } catch {
    res.status(503).json({ ok: false, db: 'down' });
  }
});
