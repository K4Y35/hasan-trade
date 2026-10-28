'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CATEGORY_LEADS } from '@/lib/site';

type Category = { id: string; name: string; slug: string; imageUrl?: string | null };

export function CategoryGrid({ categories, preview = 0 }: { categories: Category[]; preview?: number }) {
  const [open, setOpen] = useState(true);
  const limit = preview > 0 ? preview : categories.length;
  const visible = open || preview <= 0 ? categories : categories.slice(0, limit);
  const canToggle = preview > 0 && categories.length > limit;

  return (
    <>
      <div className="stagger mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {visible.map((c) => (
          <Link
            key={c.id}
            href={c.slug === 'ac-servicing' ? '/services' : `/shop?category=${c.slug}`}
            className="group card lift flex flex-col overflow-hidden p-4 text-center"
          >
            <div className="shine-hover flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg bg-slate-50">
              {c.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={c.imageUrl}
                  alt=""
                  className="h-full w-full object-contain p-3 transition duration-700 ease-out motion-safe:group-hover:scale-110"
                />
              ) : (
                <div className="h-full w-full bg-[var(--color-muted)]" />
              )}
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-900 group-hover:text-[var(--color-primary)]">{c.name}</p>
            {CATEGORY_LEADS[c.slug] ? (
              <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400">
                {CATEGORY_LEADS[c.slug]}
              </p>
            ) : null}
          </Link>
        ))}
      </div>
      {canToggle ? (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            className="btn-ghost px-6"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? 'Show less' : 'Show all'}
          </button>
        </div>
      ) : null}
    </>
  );
}
