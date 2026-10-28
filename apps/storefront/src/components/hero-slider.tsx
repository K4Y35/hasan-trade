'use client';

import Link from 'next/link';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Fan,
  Monitor,
  Phone,
  Snowflake,
  Video,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useRef, useState, type MouseEvent } from 'react';
import type { HeroProductSlide } from '@/lib/hero';
import { useStoreBranding } from '@/components/store-branding';
import { formatPrice } from '@/lib/money';

type DecorTheme = {
  glow: string;
  wash: string;
  spark: string;
  Icon: LucideIcon;
  Second: LucideIcon;
};

const DECOR: Record<string, DecorTheme> = {
  'air-conditioner': {
    glow: 'rgba(6,182,212,0.42)',
    wash: 'rgba(59,130,246,0.28)',
    spark: '#67e8f9',
    Icon: Snowflake,
    Second: Fan,
  },
  generator: {
    glow: 'rgba(234,88,12,0.4)',
    wash: 'rgba(250,204,21,0.22)',
    spark: '#fdba74',
    Icon: Zap,
    Second: Fan,
  },
  'ac-spare-parts': {
    glow: 'rgba(16,185,129,0.38)',
    wash: 'rgba(6,182,212,0.26)',
    spark: '#6ee7b7',
    Icon: Droplets,
    Second: Snowflake,
  },
  camera: {
    glow: 'rgba(99,102,241,0.4)',
    wash: 'rgba(14,165,233,0.24)',
    spark: '#c4b5fd',
    Icon: Video,
    Second: Monitor,
  },
  'refrigerator-and-freezer': {
    glow: 'rgba(56,189,248,0.4)',
    wash: 'rgba(6,182,212,0.24)',
    spark: '#bae6fd',
    Icon: Snowflake,
    Second: Droplets,
  },
  television: {
    glow: 'rgba(37,99,235,0.4)',
    wash: 'rgba(6,182,212,0.22)',
    spark: '#93c5fd',
    Icon: Monitor,
    Second: Zap,
  },
};

const DEFAULT_DECOR: DecorTheme = DECOR['air-conditioner'];

const SPARKS = [
  { top: '8%', left: '12%', size: 6, delay: '0s' },
  { top: '18%', left: '68%', size: 4, delay: '1.1s' },
  { top: '42%', left: '6%', size: 5, delay: '0.4s' },
  { top: '58%', left: '78%', size: 3, delay: '1.8s' },
  { top: '72%', left: '22%', size: 4, delay: '0.9s' },
  { top: '86%', left: '54%', size: 6, delay: '1.4s' },
  { top: '28%', left: '40%', size: 3, delay: '2.2s' },
];

function shift(x: number, y: number, depth: number) {
  return { transform: `translate3d(${x * depth}px, ${y * depth}px, 0)` };
}

function HeroDecor({
  slug,
  reduceMotion,
  pointer,
}: {
  slug: string;
  reduceMotion: boolean;
  pointer: { x: number; y: number };
}) {
  const theme = DECOR[slug] ?? DEFAULT_DECOR;
  const motion = reduceMotion ? '' : 'hero-motion';
  const px = reduceMotion ? 0 : pointer.x;
  const py = reduceMotion ? 0 : pointer.y;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-full overflow-hidden md:w-[56%]">
      <div className="absolute left-[8%] top-[12%] transition-transform duration-300 ease-out" style={shift(px, py, 28)}>
        <div
          className={`h-72 w-72 rounded-full blur-3xl transition-colors duration-700 ${motion} ${
            reduceMotion ? '' : 'animate-hero-float'
          }`}
          style={{ background: theme.glow }}
        />
      </div>
      <div className="absolute bottom-[8%] left-[28%] transition-transform duration-300 ease-out" style={shift(px, py, -18)}>
        <div
          className={`h-56 w-56 rounded-full blur-3xl transition-colors duration-700 ${motion} ${
            reduceMotion ? '' : 'animate-hero-float-alt'
          }`}
          style={{ background: theme.wash }}
        />
      </div>
      <div className="absolute right-[18%] top-[22%] transition-transform duration-300 ease-out" style={shift(px, py, 22)}>
        <div
          className={`h-40 w-40 rounded-full blur-2xl opacity-80 transition-colors duration-700 ${motion} ${
            reduceMotion ? '' : 'animate-hero-float'
          }`}
          style={{ background: theme.spark, animationDelay: '1.6s' }}
        />
      </div>

      <div className="absolute left-[6%] top-[18%] transition-transform duration-300 ease-out" style={shift(px, py, 12)}>
        <div
          className={`h-56 w-56 rounded-full border border-white/20 ${motion} ${
            reduceMotion ? '' : 'animate-hero-spin-slow'
          }`}
        />
      </div>
      <div className="absolute left-[12%] top-[26%] transition-transform duration-300 ease-out" style={shift(px, py, 8)}>
        <div
          className={`h-40 w-40 rounded-full border border-dashed border-white/25 ${motion} ${
            reduceMotion ? '' : 'animate-hero-spin-rev'
          }`}
        />
      </div>
      <div
        className="absolute bottom-[14%] left-[10%] h-28 w-28 rounded-full border border-white/15 transition-transform duration-300 ease-out"
        style={shift(px, py, 6)}
      />

      <div className="absolute right-[22%] top-[14%] transition-transform duration-300 ease-out" style={shift(px, py, 20)}>
        <theme.Icon
          className={`text-white/35 ${motion} ${reduceMotion ? '' : 'animate-hero-drift'}`}
          size={48}
          strokeWidth={1.2}
        />
      </div>
      <div className="absolute bottom-[18%] left-[14%] transition-transform duration-300 ease-out" style={shift(px, py, 16)}>
        <theme.Second
          className={`text-white/25 ${motion} ${reduceMotion ? '' : 'animate-hero-drift'}`}
          size={38}
          strokeWidth={1.2}
          style={{ animationDelay: '1.3s' }}
        />
      </div>

      {SPARKS.map((spark, i) => (
        <span
          key={i}
          className={`absolute rounded-full transition-transform duration-300 ease-out ${motion} ${
            reduceMotion ? 'opacity-50' : 'animate-hero-drift'
          }`}
          style={{
            top: spark.top,
            left: spark.left,
            width: spark.size,
            height: spark.size,
            background: theme.spark,
            boxShadow: `0 0 16px ${theme.spark}`,
            animationDelay: spark.delay,
            ...shift(px, py, 10 + (i % 3) * 8),
          }}
        />
      ))}
    </div>
  );
}

const INTERVAL_MS = 5600;

export function HeroSlider({ slides }: { slides: HeroProductSlide[] }) {
  const branding = useStoreBranding();
  const [index, setIndex] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const swipeX = useRef<number | null>(null);
  const current = slides[index] ?? slides[0];
  const paused = hovering || reduceMotion;
  const theme = DECOR[current?.slug ?? ''] ?? DEFAULT_DECOR;

  const trackPointer = (event: MouseEvent<HTMLElement>) => {
    if (reduceMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    setPointer({
      x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
      y: ((event.clientY - rect.top) / rect.height) * 2 - 1,
    });
  };

  const go = (delta: number) => {
    if (slides.length < 2) return;
    setIndex((currentIndex) => (currentIndex + delta + slides.length) % slides.length);
  };

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduceMotion(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (slides.length < 2 || paused) return;
    const timer = window.setInterval(() => go(1), INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [slides.length, paused, index]);

  useEffect(() => {
    if (index >= slides.length) setIndex(0);
  }, [index, slides.length]);

  if (!current) {
    return (
      <section className="bg-[var(--color-ink)] py-16 text-white">
        <div className="page-wrap">
          <h1 className="text-3xl font-extrabold tracking-tight md:text-5xl">{branding.name}</h1>
        </div>
      </section>
    );
  }

  const pad = String(index + 1).padStart(2, '0');
  const total = String(slides.length).padStart(2, '0');

  return (
    <section
      className="relative overflow-hidden bg-[var(--color-ink)] text-white"
      aria-roledescription="carousel"
      aria-label="Featured product collections"
      onMouseEnter={() => setHovering(true)}
      onMouseMove={trackPointer}
      onMouseLeave={() => {
        setHovering(false);
        setPointer({ x: 0, y: 0 });
      }}
      onFocus={() => setHovering(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setHovering(false);
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(52% 70% at 82% 46%, rgba(6,182,212,0.22), transparent 68%), radial-gradient(40% 50% at 12% 80%, rgba(30,64,175,0.35), transparent 70%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: hovering && !reduceMotion ? 1 : 0,
          background: `radial-gradient(34rem circle at ${50 + pointer.x * 36}% ${46 + pointer.y * 30}%, ${theme.glow}, transparent 58%)`,
        }}
      />
      <HeroDecor slug={current.slug} reduceMotion={reduceMotion} pointer={pointer} />
      <p className="sr-only" aria-live="polite">
        {current.title}: {current.productName}
      </p>
      <div className="page-wrap relative grid items-center gap-8 py-10 pb-14 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] md:gap-12 md:py-12 md:pb-16 lg:min-h-[34rem] lg:py-16 lg:pb-20">
        <div className="relative z-10 order-2 md:order-1">
          <div className="relative [text-shadow:0_10px_28px_rgba(8,20,38,0.45)]">
          <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.16em]">
            <span className="tabular-nums text-[var(--color-accent)]">
              {pad} / {total}
            </span>
            <span className="h-px w-8 bg-white/25" aria-hidden />
            <span className="text-white/55">{current.brand ?? current.title}</span>
          </div>
          <h1 className="mt-4 max-w-xl text-4xl font-extrabold tracking-[-0.04em] md:text-5xl md:leading-[1.08] lg:text-[3.35rem]">
            {current.title}
          </h1>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-white/72">
            {current.lead
              ? `${current.lead} for homes, hotels, and hospitals across Sylhet.`
              : 'Commercial cooling, backup power, and surveillance ready for delivery.'}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href={current.href} className="btn-primary">
              Shop {current.title.toLowerCase()}
              <ArrowRight size={16} />
            </Link>
            <Link href="/contact" className="btn-ghost !border-white/20 !bg-white/10 !text-white hover:!bg-white/20">
              Request a quote
            </Link>
          </div>
          <a
            href={branding.phoneHref}
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white/70 transition hover:text-white"
          >
            <Phone size={15} />
            Call {branding.phone}
          </a>
          {slides.length > 1 && !reduceMotion ? (
            <div className="mt-8 h-[3px] w-40 overflow-hidden rounded-full bg-white/15" aria-hidden>
              <div
                key={`${index}-${paused ? 'paused' : 'play'}`}
                className="hero-progress h-full origin-left rounded-full bg-[var(--color-accent)]"
                style={{
                  animation: paused ? 'none' : 'hero-progress 5.6s linear forwards',
                  transform: paused ? 'scaleX(1)' : undefined,
                }}
              />
            </div>
          ) : null}
          </div>
        </div>

        <div className="relative z-10 order-1 md:order-2 md:pl-4 [perspective:1200px]">
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-8 rounded-[2.5rem] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.16),transparent_64%)] blur-2xl transition-transform duration-300 ease-out"
            style={reduceMotion ? undefined : shift(pointer.x, pointer.y, 10)}
          />
          <Link
            href={current.productHref}
            className="relative block overflow-hidden rounded-2xl bg-white shadow-[0_28px_60px_-18px_rgba(2,8,23,0.55)] ring-1 ring-white/20 transition duration-300 ease-out will-change-transform hover:shadow-[0_36px_70px_-16px_rgba(2,8,23,0.62)]"
            style={
              reduceMotion
                ? undefined
                : {
                    transform: `translate3d(${pointer.x * 8}px, ${pointer.y * 6}px, 0) rotateX(${pointer.y * -5}deg) rotateY(${pointer.x * 6}deg) scale(${hovering ? 1.025 : 1})`,
                  }
            }
            aria-label={`View ${current.productName}`}
            onPointerDown={(event) => {
              swipeX.current = event.clientX;
            }}
            onPointerUp={(event) => {
              if (swipeX.current == null) return;
              const delta = event.clientX - swipeX.current;
              swipeX.current = null;
              if (Math.abs(delta) < 48) return;
              event.preventDefault();
              go(delta < 0 ? 1 : -1);
            }}
          >
            <div className="relative flex aspect-[4/3] items-center justify-center bg-gradient-to-b from-slate-50 to-white">
              {slides.map((item, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={item.slug}
                  src={item.image}
                  alt=""
                  draggable={false}
                  className={`absolute inset-0 m-auto max-h-[86%] max-w-[86%] object-contain transition duration-500 ease-out ${
                    i === index
                      ? hovering && !reduceMotion
                        ? 'scale-105 opacity-100'
                        : 'scale-100 opacity-100'
                      : 'pointer-events-none scale-95 opacity-0'
                  }`}
                />
              ))}
            </div>
            {current.productName || current.price > 0 ? (
            <div className="flex items-end justify-between gap-4 border-t border-slate-100 px-5 py-4 text-[var(--color-ink)]">
              <div className="min-w-0">
                {current.brand ? (
                  <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">{current.brand}</p>
                ) : null}
                <p className="mt-0.5 line-clamp-1 text-sm font-semibold leading-snug">{current.productName}</p>
              </div>
              {current.price > 0 ? (
              <div className="shrink-0 text-right">
                <p className="text-sm font-bold text-[var(--color-primary)]">
                  {formatPrice(current.price)}
                </p>
                <p className="text-xs font-semibold text-slate-400">View product</p>
              </div>
              ) : null}
            </div>
            ) : null}
          </Link>

          {slides.length > 1 ? (
            <>
              <button
                type="button"
                aria-label="Previous slide"
                className="absolute left-3 top-[38%] z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200/80 bg-white/95 text-[var(--color-ink)] shadow-lg transition hover:scale-110 hover:bg-white"
                onClick={() => go(-1)}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                aria-label="Next slide"
                className="absolute right-3 top-[38%] z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200/80 bg-white/95 text-[var(--color-ink)] shadow-lg transition hover:scale-110 hover:bg-white"
                onClick={() => go(1)}
              >
                <ChevronRight size={20} />
              </button>
              <div className="mt-4 flex items-center justify-center gap-1.5">
                {slides.map((item, i) => (
                  <button
                    key={item.slug}
                    type="button"
                    aria-label={`Go to ${item.title}`}
                    aria-current={i === index ? true : undefined}
                    onClick={() => setIndex(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === index ? 'w-7 bg-[var(--color-accent)]' : 'w-1.5 bg-white/30 hover:bg-white/55'
                    }`}
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}
