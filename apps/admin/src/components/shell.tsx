'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Award,
  BarChart3,
  ExternalLink,
  FolderTree,
  LayoutDashboard,
  LayoutTemplate,
  LogOut,
  Megaphone,
  Menu,
  MonitorSmartphone,
  Package,
  Settings,
  ShieldCheck,
  ShoppingBag,
  TicketPercent,
  Users,
  Warehouse,
  X,
} from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { BrandLogo } from '@/components/brand-logo';
import { clearSession, getToken } from '@/lib/api';

const STOREFRONT_URL = process.env.NEXT_PUBLIC_STOREFRONT_URL ?? 'http://localhost:3000';

const groups = [
  {
    label: 'Overview',
    items: [{ href: '/', label: 'Dashboard', Icon: LayoutDashboard }],
  },
  {
    label: 'Catalog',
    items: [
      { href: '/products', label: 'Products', Icon: Package },
      { href: '/categories', label: 'Categories', Icon: FolderTree },
      { href: '/brands', label: 'Brands', Icon: Award },
    ],
  },
  {
    label: 'Selling',
    items: [
      { href: '/orders', label: 'Orders', Icon: ShoppingBag },
      { href: '/coupons', label: 'Coupons', Icon: TicketPercent },
      { href: '/warranties', label: 'Warranties', Icon: ShieldCheck },
      { href: '/sales', label: 'Sales', Icon: BarChart3 },
      { href: '/users', label: 'Customers', Icon: Users },
      { href: '/pos', label: 'POS', Icon: MonitorSmartphone },
    ],
  },
  {
    label: 'Stock',
    items: [{ href: '/inventory', label: 'Inventory', Icon: Warehouse }],
  },
  {
    label: 'Website',
    items: [
      { href: '/settings', label: 'Store', Icon: Settings },
      { href: '/homepage', label: 'Homepage', Icon: LayoutTemplate },
      { href: '/offers', label: 'Offer popup', Icon: Megaphone },
    ],
  },
] as const;

const links = groups.flatMap((group) => group.items);

function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
}

function currentLink(pathname: string) {
  return links.find((link) => isActive(pathname, link.href)) ?? links[0];
}

function currentGroup(pathname: string) {
  return groups.find((group) => group.items.some((item) => isActive(pathname, item.href))) ?? groups[0];
}

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const current = currentLink(pathname);
  const group = currentGroup(pathname);

  useEffect(() => {
    if (!getToken()) router.replace('/login');
  }, [router]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const nav = (
    <>
      <div className="shrink-0 px-4 pb-2 pt-4">
        <Link href="/" className="block">
          <BrandLogo height={42} onDark />
        </Link>
        <p className="mt-3 px-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--color-accent)]">ShopStack</p>
        <p className="px-1 text-sm font-semibold text-white">Hasan Trade Admin</p>
      </div>
      <nav className="mt-2 min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-3" aria-label="Admin">
        {groups.map((section) => (
          <div key={section.label} className="mt-3 first:mt-0">
            <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500">{section.label}</p>
            <div className="flex flex-col gap-0.5">
              {section.items.map((link) => {
                const active = isActive(pathname, link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? 'page' : undefined}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition duration-200 ${
                      active
                        ? 'bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(6,182,212,0.35)]'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <link.Icon size={16} className={active ? 'text-[var(--color-accent)]' : 'opacity-80'} />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="shrink-0 space-y-1 border-t border-white/10 p-3">
        <a
          href={STOREFRONT_URL}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
        >
          <ExternalLink size={16} />
          View storefront
        </a>
        <button
          type="button"
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
          onClick={() => {
            clearSession();
            router.replace('/login');
          }}
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-dvh overflow-hidden bg-[var(--color-background)]">
      <aside className="hidden h-full w-60 shrink-0 flex-col bg-[var(--color-ink)] text-slate-200 md:flex">{nav}</aside>

      {open ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button type="button" className="absolute inset-0 bg-slate-950/50" aria-label="Close menu" onClick={() => setOpen(false)} />
          <aside className="relative flex h-full w-64 flex-col bg-[var(--color-ink)] text-slate-200 shadow-lift">
            <button
              type="button"
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full text-white/80 hover:bg-white/10"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
            {nav}
          </aside>
        </div>
      ) : null}

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="z-20 flex shrink-0 items-center gap-3 border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur-xl md:px-8">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 md:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
          >
            <Menu size={18} />
          </button>
          <Link href="/" className="shrink-0 md:hidden" aria-label="Hasan Trade Admin home">
            <BrandLogo height={28} />
          </Link>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">{group?.label}</p>
            <p className="truncate text-sm font-semibold text-[var(--color-ink)]">{current?.label ?? 'Operations'}</p>
          </div>
          <a
            href={STOREFRONT_URL}
            target="_blank"
            rel="noreferrer"
            className="ml-auto hidden items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-slate-300 hover:text-[var(--color-primary)] sm:inline-flex"
          >
            <ExternalLink size={12} /> Storefront
          </a>
        </header>
        <main className="page-enter min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="mx-auto w-full max-w-[1280px] p-4 md:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
