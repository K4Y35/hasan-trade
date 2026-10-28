import { prisma, type Prisma } from '@shopstack/db';
import { cmsMenuWriteSchema, homepageWriteSchema } from '@shopstack/shared';
import { Router } from 'express';
import { requireStaff } from '../lib/auth';
import { loadMenus, replaceMenuItems } from '../lib/cms';
import { asyncHandler, HttpError } from '../lib/http';

export const cmsAdminRouter = Router();

const MENU_NAMES: Record<string, string> = {
  HEADER: 'Header',
  FOOTER: 'Footer',
  MOBILE: 'Mobile',
  ACCOUNT: 'Account',
};

async function ensureMenu(location: 'HEADER' | 'FOOTER' | 'MOBILE' | 'ACCOUNT') {
  return prisma.menu.upsert({
    where: { location },
    update: {},
    create: { location, name: MENU_NAMES[location] ?? location },
  });
}

cmsAdminRouter.get(
  '/menus',
  requireStaff('settings.read', 'catalog.read'),
  asyncHandler(async (_req, res) => {
    await Promise.all([ensureMenu('HEADER'), ensureMenu('FOOTER')]);
    res.json({ menus: await loadMenus() });
  }),
);

cmsAdminRouter.put(
  '/menus/:location',
  requireStaff('settings.write', 'catalog.write'),
  asyncHandler(async (req, res) => {
    const location = String(req.params.location).toUpperCase();
    if (!['HEADER', 'FOOTER', 'MOBILE', 'ACCOUNT'].includes(location)) {
      throw new HttpError(400, 'Unknown menu');
    }
    const body = cmsMenuWriteSchema.parse(req.body);
    const menu = await ensureMenu(location as 'HEADER' | 'FOOTER' | 'MOBILE' | 'ACCOUNT');
    await replaceMenuItems(menu.id, body.items);
    res.json({ menus: await loadMenus() });
  }),
);

cmsAdminRouter.get(
  '/homepage',
  requireStaff('settings.read', 'catalog.read'),
  asyncHandler(async (_req, res) => {
    const sections = await prisma.homepageSection.findMany({ orderBy: { sortOrder: 'asc' } });
    res.json({
      sections: sections.map((section) => ({
        ...section,
        payload: section.payload && typeof section.payload === 'object' ? section.payload : {},
      })),
    });
  }),
);

cmsAdminRouter.put(
  '/homepage',
  requireStaff('settings.write', 'catalog.write'),
  asyncHandler(async (req, res) => {
    const body = homepageWriteSchema.parse(req.body);
    await prisma.$transaction(async (tx) => {
      await tx.homepageSection.deleteMany();
      if (!body.sections.length) return;
      await tx.homepageSection.createMany({
        data: body.sections.map((section, index) => ({
          type: section.type,
          title: section.title ?? null,
          isVisible: section.isVisible ?? true,
          sortOrder: index,
          payload: (section.payload ?? {}) as Prisma.InputJsonValue,
        })),
      });
    });
    const sections = await prisma.homepageSection.findMany({ orderBy: { sortOrder: 'asc' } });
    res.json({
      sections: sections.map((section) => ({
        ...section,
        payload: section.payload && typeof section.payload === 'object' ? section.payload : {},
      })),
    });
  }),
);
