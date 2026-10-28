'use client';

import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react';
import { NAV, type NavNode } from '@/lib/site';

function hasChildren(item: NavNode) {
  return Boolean(item.children?.length);
}

const MEGA_COPY: Record<string, string> = {
  'Air Conditioner': 'Split, cassette, ceiling, VRF and chiller systems for home and commercial spaces.',
  'Refrigerator & Freezer': 'KONKA and HAIKO refrigerators, chillers, chest freezers and side-by-side units.',
  Camera: 'HDCVI, IP, Wi-Fi cameras plus NVR and DVR kits for homes and businesses.',
  'Fan & Cooler': 'Ceiling, pedestal and evaporative cooling for Sylhet’s climate.',
  'Kitchen Appliances': 'Hoods, cookers and everyday kitchen electronics from trusted brands.',
  'Washing Machine': 'Front-load and top-load washers with local installation support.',
  Generator: 'Perkins, Cummins, Ricardo and Green Power sets for backup power.',
  'Small Appliances': 'Purifiers, irons, dehumidifiers and voltage stabilizers.',
  Television: 'Smart QLED and LED TVs from Konka and Xiaomi.',
  'AC Servicing': 'Installation, gas charging, servicing and after-sales care.',
  'About Us': 'Showroom, story and the team behind Hasan Trade Electronics.',
};

function PanelBody({ item }: { item: NavNode }) {
  const columns = item.children ?? [];
  const nested = columns.some((c) => hasChildren(c));

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <div className="relative overflow-hidden rounded-2xl bg-[var(--color-primary)] p-6 text-white shadow-lg">
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[var(--color-accent)]/25" />
        <div className="pointer-events-none absolute -bottom-8 left-8 h-20 w-20 rounded-full bg-white/10" />
        <p className="relative text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-accent)]">Browse</p>
        <p className="relative mt-2 text-lg font-semibold leading-snug">{item.label}</p>
        <p className="relative mt-2 text-sm leading-relaxed text-white/80">
          {MEGA_COPY[item.label] ?? 'Explore this collection and find the right model for your space.'}
        </p>
        <Link
          href={item.href}
          className="relative mt-5 inline-flex rounded-full bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-slate-900 transition hover:brightness-110"
        >
          Shop all
        </Link>
      </div>
      {nested ? (
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[var(--color-primary)]/15 md:p-6">
          <div className="grid grid-cols-2 gap-x-6 gap-y-6 md:grid-cols-3 xl:grid-cols-4">
            {columns.map((col) => (
              <div key={col.label}>
                <Link
                  href={col.href}
                  className="inline-block border-b-2 border-[var(--color-accent)] pb-1 text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-secondary)]"
                >
                  {col.label}
                </Link>
                {col.children?.length ? (
                  <ul className="mt-2 space-y-0.5">
                    {col.children.map((leaf) => (
                      <li key={leaf.label}>
                        <Link
                          href={leaf.href}
                          className="block rounded-lg px-2 py-1.5 text-sm font-medium text-slate-700 transition duration-200 hover:translate-x-0.5 hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)]"
                        >
                          {leaf.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-[var(--color-primary)]/15 md:p-5">
          <ul className="grid grid-cols-2 content-start gap-2 sm:grid-cols-3">
            {columns.map((col) => (
              <li key={col.label}>
                <Link
                  href={col.href}
                  className="block rounded-xl bg-[#eef3fb] px-3 py-2.5 text-sm font-medium text-slate-800 ring-1 ring-[var(--color-primary)]/10 transition duration-200 hover:-translate-y-0.5 hover:bg-[var(--color-primary)] hover:text-white hover:shadow-sm hover:ring-transparent"
                >
                  {col.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function MobileBranch({ item, depth = 0 }: { item: NavNode; depth?: number }) {
  const [open, setOpen] = useState(false);
  const nested = hasChildren(item);

  return (
    <div className={depth === 0 ? 'border-b border-white/10' : 'mt-1'}>
      <div className="flex items-center">
        <Link
          href={item.href}
          className={`flex-1 py-3 ${depth === 0 ? 'font-medium text-white' : 'text-sm text-white/80'}`}
          style={{ paddingLeft: 4 + depth * 12 }}
        >
          {item.label}
        </Link>
        {nested ? (
          <button
            type="button"
            aria-expanded={open}
            aria-label={`${open ? 'Collapse' : 'Expand'} ${item.label}`}
            className="flex h-10 w-10 items-center justify-center text-white/80"
            onClick={() => setOpen((v) => !v)}
          >
            <ChevronDown size={16} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
        ) : null}
      </div>
      {open && item.children?.length ? (
        <div className="pb-2">
          {item.children.map((child) => (
            <MobileBranch key={`${item.label}-${child.label}`} item={child} depth={depth + 1} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function MegaNav({ mobileOpen, items }: { mobileOpen: boolean; items?: Array<NavNode | { label: string; href: string; children?: NavNode[] }> }) {
  const navItems = items?.length ? items : NAV;
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [panelTop, setPanelTop] = useState(0);
  const navRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<Record<string, HTMLLIElement | null>>({});
  const closeTimer = useRef<number | null>(null);
  const openTimer = useRef<number | null>(null);
  const openItem = navItems.find((item) => item.label === openKey && hasChildren(item));

  function clearClose() {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }

  function clearOpen() {
    if (openTimer.current) {
      window.clearTimeout(openTimer.current);
      openTimer.current = null;
    }
  }

  function placePanel(label: string) {
    const nav = navRef.current;
    const trigger = itemRefs.current[label];
    if (!nav || !trigger) return;
    const navRect = nav.getBoundingClientRect();
    const itemRect = trigger.getBoundingClientRect();
    setPanelTop(itemRect.bottom - navRect.top);
  }

  function openMenu(label: string) {
    clearClose();
    clearOpen();
    placePanel(label);
    setOpenKey(label);
  }

  function scheduleOpen(label: string) {
    clearClose();
    clearOpen();
    openTimer.current = window.setTimeout(() => {
      placePanel(label);
      setOpenKey(label);
    }, 160);
  }

  function scheduleClose() {
    clearClose();
    clearOpen();
    closeTimer.current = window.setTimeout(() => setOpenKey(null), 280);
  }

  function onItemClick(event: MouseEvent<HTMLAnchorElement>, item: NavNode) {
    if (!hasChildren(item)) return;
    if (openKey !== item.label) {
      event.preventDefault();
      openMenu(item.label);
    }
  }

  function onNavKey(event: KeyboardEvent<HTMLElement>) {
    if (event.key === 'Escape') setOpenKey(null);
  }

  useEffect(
    () => () => {
      clearClose();
      clearOpen();
    },
    [],
  );

  useEffect(() => {
    if (!openKey) return;
    const sync = () => placePanel(openKey);
    window.addEventListener('resize', sync);
    return () => window.removeEventListener('resize', sync);
  }, [openKey]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  return (
    <>
      <nav
        ref={navRef}
        aria-label="Product categories"
        className="mega-nav relative z-40 hidden bg-[var(--color-primary)] text-white md:block"
        onMouseEnter={clearClose}
        onMouseLeave={scheduleClose}
        onKeyDown={onNavKey}
      >
        <ul className="page-wrap flex flex-wrap items-stretch text-[13px] font-medium">
          {navItems.map((item) => {
            const nested = hasChildren(item);
            const active = openKey === item.label;
            return (
              <li
                key={item.label}
                ref={(node) => {
                  itemRefs.current[item.label] = node;
                }}
                onMouseEnter={() => {
                  if (!nested) return;
                  if (!openKey || openKey === item.label) openMenu(item.label);
                  else scheduleOpen(item.label);
                }}
              >
                <Link
                  href={item.href}
                  aria-expanded={nested ? active : undefined}
                  aria-haspopup={nested ? 'true' : undefined}
                  onClick={(event) => onItemClick(event, item)}
                  onFocus={() => {
                    if (nested) openMenu(item.label);
                  }}
                  className={`flex items-center gap-1 whitespace-nowrap border-b-2 px-3 py-2.5 transition ${
                    active
                      ? 'border-[var(--color-accent)] bg-white/10 text-white'
                      : 'border-transparent text-white/90 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {item.label}
                  {nested ? (
                    <ChevronDown
                      size={13}
                      className={`opacity-80 transition-transform duration-200 ${active ? 'rotate-180' : ''}`}
                    />
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
        {openItem ? (
          <div
            className="mega-bar absolute inset-x-0 z-50 border-t-2 border-[var(--color-accent)] bg-[#dce6f5] text-slate-900 shadow-[0_28px_48px_-16px_rgb(15_23_42/0.45)]"
            style={{ top: panelTop }}
            onMouseEnter={clearClose}
          >
            <div className="pointer-events-auto absolute inset-x-0 -top-2 h-2" aria-hidden />
            <div className="page-wrap py-7">
              <PanelBody item={openItem} />
            </div>
          </div>
        ) : null}
      </nav>
      {mobileOpen ? (
        <div className="max-h-[70vh] overflow-y-auto bg-[var(--color-primary)] px-3 md:hidden">
          {navItems.map((item) => (
            <MobileBranch key={item.label} item={item} />
          ))}
        </div>
      ) : null}
    </>
  );
}
