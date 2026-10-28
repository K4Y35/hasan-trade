'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { GitCompare, Heart, Menu, Phone, Search, ShoppingBag, User, X } from 'lucide-react';
import { useEffect, useMemo, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react';
import { getCustomerToken, publicApi } from '@/lib/api';
import { cartCount, cartTotal } from '@/lib/cart';
import { compareCount, wishlistCount } from '@/lib/saved';
import { MegaNav } from '@/components/mega-nav';
import { OfferPopup } from '@/components/offer-popup';
import { StoreBrandingProvider } from '@/components/store-branding';
import { withBranding } from '@/lib/branding';
import { FOOTER_COLUMNS, NAV, PAYMENT_LOGOS } from '@/lib/site';
import type { StoreNav, StoreSettings } from '@/lib/types';

export function StoreShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [store, setStore] = useState<StoreSettings['store'] | null>(null);
  const [nav, setNav] = useState<StoreNav | null>(null);
  const [count, setCount] = useState(0);
  const [wishCount, setWishCount] = useState(0);
  const [cmpCount, setCmpCount] = useState(0);
  const [signedIn, setSignedIn] = useState(false);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pop, setPop] = useState(false);

  useEffect(() => {
    publicApi<StoreSettings>('/v1/settings').then((d) => setStore(d.store)).catch(() => undefined);
    publicApi<StoreNav>('/v1/catalog/nav')
      .then(setNav)
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const sync = () => {
      setCount((prev) => {
        const next = cartCount();
        if (prev && next > prev) {
          setPop(true);
          window.setTimeout(() => setPop(false), 350);
        }
        return next;
      });
      setTotal(cartTotal());
    };
    sync();
    window.addEventListener('shopstack-cart', sync);
    return () => window.removeEventListener('shopstack-cart', sync);
  }, [pathname]);

  useEffect(() => {
    const sync = () => {
      setWishCount(wishlistCount());
      setCmpCount(compareCount());
    };
    sync();
    window.addEventListener('shopstack-saved', sync);
    return () => window.removeEventListener('shopstack-saved', sync);
  }, [pathname]);

  useEffect(() => {
    setSignedIn(Boolean(getCustomerToken()));
  }, [pathname]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const style = useMemo(() => {
    if (!store) return undefined;
    const t = store.tokens;
    return {
      '--color-primary': t.colorPrimary,
      '--color-secondary': t.colorSecondary,
      '--color-accent': t.colorAccent,
      '--color-background': t.colorBackground,
      '--color-foreground': t.colorForeground,
      '--color-muted': t.colorMuted,
      '--radius': t.radius,
    } as CSSProperties;
  }, [store]);

  const branding = useMemo(() => withBranding(store), [store]);
  const footerColumns = nav?.footer?.some((column) => column.links.length) ? nav.footer : FOOTER_COLUMNS;
  const { name, phone, phoneHref, whatsappHref, logoUrl, logoHeight, address, footerText, copyrightText, social } = branding;

  function onSearch(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/shop?q=${encodeURIComponent(q)}` : '/shop');
  }

  return (
    <StoreBrandingProvider value={branding}>
    <div style={style} className="min-h-screen bg-[var(--color-background)]">
      <div className="bg-[var(--color-ink)] text-white">
        <div className="page-wrap flex items-center justify-between gap-4 py-2 text-xs">
          <p className="hidden tracking-wide sm:block">Official 100% genuine brands · Nationwide delivery · Cash on delivery</p>
          <div className="ml-auto flex flex-wrap items-center gap-4">
            <a href={phoneHref} className="font-semibold hover:underline">
              {phone}
            </a>
            {social.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="opacity-80 transition hover:opacity-100 hover:underline">
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <header
        className={`sticky top-0 z-50 overflow-visible border-b transition-all duration-300 ${
          scrolled ? 'border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-xl' : 'border-transparent bg-white'
        }`}
      >
        <div className="page-wrap flex items-center gap-4 py-3 md:py-4">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 transition duration-300 hover:border-slate-300 hover:bg-slate-50 motion-safe:hover:scale-105 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
          <Link href="/" className="shrink-0 transition duration-300 hover:opacity-90 motion-safe:hover:scale-[1.02]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoUrl} alt={name} style={{ height: logoHeight }} className="w-auto max-h-24 object-contain" />
          </Link>
          <form onSubmit={onSearch} className="hidden min-w-0 flex-1 md:flex">
            <div className="flex w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-50 transition focus-within:border-[var(--color-accent)] focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgb(6_182_212/0.16)]">
              <span className="flex items-center pl-4 text-slate-400">
                <Search size={16} />
              </span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search air conditioners, cameras, spare parts…"
                className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm"
                aria-label="Search products"
              />
              <button className="btn-primary m-1 shrink-0 px-5 py-2 text-sm">Search</button>
            </div>
          </form>
          <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
            <a href={phoneHref} className="group hidden items-center gap-2 rounded-lg px-2 py-1 transition hover:bg-slate-50 lg:flex">
              <span className="icon-pop flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-[var(--color-secondary)]">
                <Phone size={16} />
              </span>
              <span className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-slate-400">24/7 priority desk</p>
                <p className="text-sm font-semibold text-[var(--color-primary)]">{phone}</p>
              </span>
            </a>
            <Link
              href="/compare"
              className="relative hidden h-10 w-10 items-center justify-center rounded-full text-slate-600 transition duration-300 hover:bg-slate-100 motion-safe:hover:scale-105 xl:flex"
              aria-label={cmpCount ? `Compare, ${cmpCount} products` : 'Compare products'}
            >
              <GitCompare size={18} />
              {cmpCount > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-primary)] px-1 text-[10px] font-bold text-white">
                  {cmpCount}
                </span>
              ) : null}
            </Link>
            <Link
              href="/wishlist"
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition duration-300 hover:bg-slate-100 motion-safe:hover:scale-105"
              aria-label={wishCount ? `Wishlist, ${wishCount} saved` : 'Wishlist'}
            >
              <Heart size={18} fill={wishCount ? 'currentColor' : 'none'} className={wishCount ? 'text-[var(--color-secondary)]' : undefined} />
              {wishCount > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-secondary)] px-1 text-[10px] font-bold text-white">
                  {wishCount}
                </span>
              ) : null}
            </Link>
            <Link
              href={signedIn ? '/account/orders' : '/account/login'}
              className="hidden h-10 w-10 items-center justify-center rounded-full text-slate-600 transition duration-300 hover:bg-slate-100 motion-safe:hover:scale-105 xl:flex"
              aria-label={signedIn ? 'Your orders' : 'Sign in'}
            >
              <User size={18} />
            </Link>
            <Link
              href="/cart"
              className={`relative flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${pop ? 'animate-cartPop' : ''}`}
            >
              <ShoppingBag size={16} />
              <span className="hidden sm:inline">Cart</span>
              {count > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-secondary)] px-1 text-[10px] font-bold text-white">
                  {count}
                </span>
              ) : null}
              <span className="hidden text-slate-500 lg:inline">৳{total.toLocaleString()}</span>
            </Link>
          </div>
        </div>
        <form onSubmit={onSearch} className="flex gap-2 px-4 pb-3 md:hidden">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products"
            className="field"
          />
          <button className="btn-primary">Go</button>
        </form>
        <MegaNav mobileOpen={open} items={nav?.header?.length ? nav.header : NAV} />
      </header>

      <div className="page-enter min-h-[55vh]">{children}</div>

      <section className="relative overflow-hidden bg-[var(--color-primary)] text-white">
        <div className="pointer-events-none absolute -right-20 -top-16 h-56 w-56 rounded-full bg-[var(--color-accent)]/25 blur-3xl motion-safe:animate-hero-float" />
        <div className="pointer-events-none absolute -bottom-20 left-10 h-40 w-40 rounded-full bg-white/10 blur-2xl motion-safe:animate-hero-float-alt" />
        <div className="page-wrap relative flex flex-col items-start justify-between gap-6 py-10 md:flex-row md:items-center">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-sky-200">Institutional desk</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">Need a commercial quotation or tender sheet?</h2>
            <p className="mt-2 text-sm text-white/75">Cash on delivery · Genuine brands · Dhaka &amp; Sylhet warehouse delivery</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/contact" className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-[var(--color-primary)] transition duration-300 hover:-translate-y-0.5 hover:shadow-lg">
              Request a quote
            </Link>
            <a href={phoneHref} className="rounded-lg border border-white/25 px-5 py-2.5 text-sm font-semibold transition duration-300 hover:-translate-y-0.5 hover:bg-white/10">
              Call {phone}
            </a>
          </div>
        </div>
      </section>

      <footer className="bg-[#e8edf8] text-slate-700">
        <div className="page-wrap grid gap-10 py-16 md:grid-cols-4">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoUrl} alt={name} style={{ height: Math.round(logoHeight * 0.85) }} className="w-auto rounded-lg bg-white p-1 object-contain" />
            <p className="mt-4 text-sm leading-relaxed text-slate-600">{footerText ?? 'Authorized dealer for air conditioners, spare parts, refrigerators, CCTV, generators, televisions and kitchen appliances.'}</p>
            <p className="mt-4 text-sm font-medium">{address}</p>
            <a href={phoneHref} className="mt-2 block text-sm font-semibold text-[var(--color-primary)]">
              {phone}
            </a>
          </div>
          {footerColumns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-bold tracking-tight text-[var(--color-ink)]">{col.title}</h3>
              <ul className="mt-4 space-y-2 text-sm">
                {col.links.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="link-nudge inline-block transition hover:text-[var(--color-primary)]">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-200/80">
          <div className="page-wrap flex flex-col gap-4 py-5 md:flex-row md:items-center md:justify-between">
            <ul className="flex flex-wrap gap-2 text-sm">
              {social.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex rounded-lg border border-slate-200 bg-white px-3 py-1.5 transition duration-300 hover:-translate-y-0.5 hover:border-[var(--color-primary)]/40 hover:text-[var(--color-primary)] hover:shadow-sm"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap items-center gap-3">
              {PAYMENT_LOGOS.map((p) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={p.alt} src={p.src} alt={p.alt} className="h-8 w-auto rounded bg-white px-2 py-1 ring-1 ring-slate-200" />
              ))}
            </div>
          </div>
          <div className="page-wrap flex flex-col gap-2 pb-5 text-xs text-slate-500 md:flex-row md:justify-between">
            <p>{copyrightText ?? `Copyright © ${new Date().getFullYear()} ${name}. All Rights Reserved.`}</p>
            <p>Cash on delivery available nationwide.</p>
          </div>
        </div>
      </footer>

      <OfferPopup store={store} />

      <a
        href={whatsappHref}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat on WhatsApp"
        title="WhatsApp"
        className="wa-pulse fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg transition duration-300 hover:-translate-y-1 hover:scale-105 hover:bg-emerald-400"
      >
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor" aria-hidden>
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
    </div>
    </StoreBrandingProvider>
  );
}
