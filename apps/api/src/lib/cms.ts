import { prisma, type Prisma } from '@shopstack/db';
import type { cmsMenuItemSchema } from '@shopstack/shared';
import type { z } from 'zod';
import { publicMediaUrl } from './serialize';

type MenuItemInput = z.infer<typeof cmsMenuItemSchema>;

type MenuRow = {
  id: string;
  label: string;
  url: string | null;
  categoryId: string | null;
  sortOrder: number;
  isActive: boolean;
  parentId: string | null;
  category?: { slug: string } | null;
};

export type NavNode = {
  id: string;
  label: string;
  href: string;
  url: string | null;
  categoryId: string | null;
  isActive: boolean;
  children: NavNode[];
};

export function itemHref(item: { url?: string | null; category?: { slug: string } | null }) {
  if (item.url?.trim()) return item.url.trim();
  if (item.category?.slug) return `/shop?category=${item.category.slug}`;
  return '/';
}

export function buildMenuTree(items: MenuRow[]): NavNode[] {
  const byParent = new Map<string | null, MenuRow[]>();
  for (const item of items) {
    const key = item.parentId;
    const list = byParent.get(key) ?? [];
    list.push(item);
    byParent.set(key, list);
  }
  for (const list of byParent.values()) {
    list.sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label));
  }
  const walk = (parentId: string | null): NavNode[] =>
    (byParent.get(parentId) ?? []).map((item) => ({
      id: item.id,
      label: item.label,
      href: itemHref(item),
      url: item.url,
      categoryId: item.categoryId,
      isActive: item.isActive,
      children: walk(item.id),
    }));
  return walk(null);
}

export function serializeSectionPayload(payload: Prisma.JsonValue) {
  const raw = payload && typeof payload === 'object' && !Array.isArray(payload) ? { ...(payload as Record<string, unknown>) } : {};
  const rewrite = (image: unknown) => (typeof image === 'string' ? publicMediaUrl(image) || image : image);
  if (Array.isArray(raw.slides)) {
    raw.slides = raw.slides.map((slide) =>
      slide && typeof slide === 'object'
        ? { ...(slide as Record<string, unknown>), image: rewrite((slide as { image?: unknown }).image) }
        : slide,
    );
  }
  if (Array.isArray(raw.items)) {
    raw.items = raw.items.map((item) =>
      item && typeof item === 'object'
        ? { ...(item as Record<string, unknown>), image: rewrite((item as { image?: unknown }).image) }
        : item,
    );
  }
  return raw;
}

export async function loadMenus() {
  const menus = await prisma.menu.findMany({
    include: {
      items: {
        orderBy: { sortOrder: 'asc' },
        include: { category: { select: { slug: true } } },
      },
    },
  });
  return menus.map((menu) => ({
    id: menu.id,
    location: menu.location,
    name: menu.name,
    items: buildMenuTree(menu.items),
  }));
}

export async function loadNav() {
  const menus = await loadMenus();
  const header = menus.find((menu) => menu.location === 'HEADER');
  const footer = menus.find((menu) => menu.location === 'FOOTER');
  return {
    header: (header?.items ?? []).filter((item) => item.isActive).map(stripInactive),
    footer: (footer?.items ?? [])
      .filter((item) => item.isActive)
      .map((column) => ({
        title: column.label,
        href: column.url ? column.href : undefined,
        links: column.children
          .filter((child) => child.isActive)
          .map((child) => ({ label: child.label, href: child.href })),
      })),
  };
}

function stripInactive(node: NavNode): NavNode {
  return {
    ...node,
    children: node.children.filter((child) => child.isActive).map(stripInactive),
  };
}

export async function replaceMenuItems(menuId: string, items: MenuItemInput[]) {
  await prisma.$transaction(async (tx) => {
    await tx.menuItem.deleteMany({ where: { menuId } });
    await insertItems(tx, menuId, items, null);
  });
}

async function insertItems(
  tx: Prisma.TransactionClient,
  menuId: string,
  items: MenuItemInput[],
  parentId: string | null,
) {
  for (const [index, item] of items.entries()) {
    const created = await tx.menuItem.create({
      data: {
        menuId,
        parentId,
        label: item.label.trim(),
        url: item.url?.trim() || null,
        categoryId: item.categoryId || null,
        isActive: item.isActive ?? true,
        sortOrder: index,
      },
    });
    if (item.children?.length) {
      await insertItems(tx, menuId, item.children as MenuItemInput[], created.id);
    }
  }
}

export function productRowFromSection(section: {
  type: string;
  title: string | null;
  payload: Record<string, unknown>;
}) {
  if (section.type !== 'FEATURED_PRODUCTS') return null;
  const slug = typeof section.payload.categorySlug === 'string' ? section.payload.categorySlug.trim() : '';
  if (!slug) return null;
  const limit = Number(section.payload.limit);
  return {
    slug,
    title: section.title?.trim() || slug,
    limit: Number.isFinite(limit) && limit > 0 ? Math.min(500, Math.floor(limit)) : 0,
  };
}
