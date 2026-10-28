import Link from 'next/link';
import { ArrowRight, BadgeCheck, Headphones, MapPin, Package, ShieldCheck, Truck, Wrench } from 'lucide-react';
import { CategoryGrid } from '@/components/category-grid';
import { ClientsShowcase } from '@/components/clients-showcase';
import { HomeAtmosphere } from '@/components/home-atmosphere';
import { HeroSlider } from '@/components/hero-slider';
import { buildHeroSlides } from '@/lib/hero';
import { LogoStrip } from '@/components/logo-strip';
import { NewArrivals } from '@/components/new-arrivals';
import { ProductRowGrid } from '@/components/product-row-grid';
import { Reveal } from '@/components/reveal';
import { publicApi } from '@/lib/api';
import { withBranding } from '@/lib/branding';
import { PARTNER_LOGOS, SITE } from '@/lib/site';
import type { Home } from '@/lib/types';

type HomeSection = Home['sections'][number];

const STATS = [
  ['10+', 'Years in Sylhet'],
  ['13', 'Product categories'],
  ['20+', 'Partner brands'],
  ['8+', 'Institutional clients'],
];

const SERVICES = [
  {
    title: 'AC installation',
    copy: 'Split, cassette, ceiling and floor-standing units fitted to manufacturer spec.',
    href: '/services',
    cta: 'Book a fitting',
    Icon: Wrench,
  },
  {
    title: 'Servicing & gas top-up',
    copy: 'Jet wash, gas charging and diagnosis for Gree, Haier, Midea and General.',
    href: '/services',
    cta: 'Schedule a visit',
    Icon: ShieldCheck,
  },
  {
    title: 'Genuine spare parts',
    copy: 'Copper pipe, gauges, capacitors and HVAC tools from the showroom.',
    href: '/shop?category=ac-spare-parts',
    cta: 'Order parts',
    Icon: Package,
  },
];

export default async function HomePage() {
  let home: Home | null = null;
  try {
    home = await publicApi<Home>('/v1/catalog/home');
  } catch {
    home = null;
  }

  const merch = (home?.sections ?? []).filter((section) => section.type !== 'HERO' && section.type !== 'BRANDS');
  const brandSection = home?.sections.find((section) => section.type === 'BRANDS');
  const showBrands = !home || Boolean(brandSection);
  const categories = home?.categories ?? [];
  const branding = withBranding(home?.settings ?? null);
  const trust = [
    { title: 'Cash on delivery', copy: 'Pay when your order arrives', Icon: Truck },
    { title: '100% genuine brands', copy: 'Authorized OEM equipment', Icon: BadgeCheck },
    { title: 'Warranty & service', copy: 'Installation and after-sales care', Icon: ShieldCheck },
    { title: 'Call specialists', copy: branding.phone, Icon: Headphones },
  ];
  return (
    <main className="relative isolate">
      <HomeAtmosphere />
      <HeroSlider slides={buildHeroSlides(home)} />

      <section className="relative z-10 -mt-6 pb-6">
        <div className="page-wrap">
          <div className="stagger grid overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-card sm:grid-cols-2 lg:grid-cols-4">
            {trust.map(({ title, copy, Icon }, i) => (
              <div
                key={title}
                className={`group flex items-start gap-3 px-5 py-5 transition duration-300 hover:bg-slate-50 ${i > 0 ? 'border-t border-slate-100 sm:border-t-0 sm:border-l' : ''}`}
              >
                <span className="icon-pop flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                  <Icon size={20} />
                </span>
                <div>
                  <p className="font-semibold text-slate-900">{title}</p>
                  <p className="mt-0.5 text-sm text-slate-500">{copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {merch.map((section) => (
        <HomeMerchBlock
          key={section.id}
          section={section}
          home={home}
          categories={categories}
        />
      ))}

      <section className="bg-white py-16 md:py-20">
        <div className="page-wrap grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <Reveal>
            <p className="section-kicker">Institutional credibility</p>
            <h2 className="section-title">Electronics for homes, hotels, and hospitals</h2>
            <p className="section-lede">
              A trusted showroom and online shop in Mirabazar, Sylhet for air conditioners, spare parts, refrigeration,
              CCTV, generators and kitchen appliances — with installation and after-sales care.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/about" className="btn-ghost">
                Our story
              </Link>
              <Link href="/contact" className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-primary)]">
                Contact the director <ArrowRight size={14} className="link-nudge" />
              </Link>
            </div>
          </Reveal>
          <div className="stagger grid grid-cols-2 gap-3">
            {STATS.map(([value, label]) => (
              <div key={label} className="lift rounded-xl border border-slate-100 bg-slate-50 px-5 py-6">
                <p className="text-3xl font-extrabold tracking-tight text-[var(--color-primary)]">{value}</p>
                <p className="mt-1 text-sm text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ClientsShowcase />

      <section className="py-16 md:py-20">
        <div className="page-wrap">
          <Reveal>
            <p className="section-kicker">After-sales</p>
            <h2 className="section-title">Installation & technical servicing</h2>
            <p className="section-lede">Book a technician, pick up parts, or get a same-day estimate from the showroom team.</p>
          </Reveal>
          <div className="stagger mt-10 grid gap-4 md:grid-cols-3">
            {SERVICES.map((item) => (
              <Link key={item.title} href={item.href} className="card lift group p-6">
                <span className="icon-pop flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                  <item.Icon size={18} />
                </span>
                <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{item.copy}</p>
                <p className="mt-4 text-sm font-semibold text-[var(--color-primary)]">
                  {item.cta} <span className="link-nudge inline-block">→</span>
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {showBrands ? <LogoStrip title={brandSection?.title || 'Authorized partner brands'} logos={PARTNER_LOGOS} /> : null}

      <section className="bg-slate-50 py-16 md:py-20">
        <div className="page-wrap relative grid overflow-hidden rounded-xl bg-[var(--color-ink)] text-white lg:grid-cols-[0.9fr_1.1fr]">
          <div className="pointer-events-none absolute -left-16 top-0 h-56 w-56 rounded-full bg-[var(--color-accent)]/20 blur-3xl motion-safe:animate-hero-float" />
          <div className="pointer-events-none absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-[var(--color-secondary)]/15 blur-2xl motion-safe:animate-hero-float-alt" />
          <div className="relative p-8 md:p-12">
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--color-accent)]">Showroom</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">Visit us in Mirabazar, Sylhet</h2>
            <p className="mt-4 max-w-lg text-white/75">
              See demonstration units in person, talk to a specialist, and arrange installation the same week.
            </p>
            <p className="mt-6 flex items-start gap-2 text-sm text-white/90">
              <MapPin size={16} className="mt-0.5 shrink-0 text-[var(--color-accent)]" />
              {branding.address}
            </p>
            <p className="mt-2 text-sm text-white/70">{branding.hours}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={branding.phoneHref} className="btn-primary text-sm">
                Call {branding.phone}
              </a>
              <a href={branding.whatsappHref} className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition duration-300 hover:-translate-y-0.5 hover:shadow-lg">
                WhatsApp
              </a>
              <a
                href={SITE.maps.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-white/20 px-5 py-2.5 text-sm font-semibold transition duration-300 hover:-translate-y-0.5 hover:bg-white/10"
              >
                Get directions
              </a>
            </div>
          </div>
          <div className="relative min-h-64 bg-slate-200">
            <iframe
              title={`${branding.name} showroom map`}
              src={SITE.maps.embed}
              className="absolute inset-0 h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <a
              href={SITE.maps.href}
              target="_blank"
              rel="noreferrer"
              className="absolute left-1/2 top-[38%] z-10 -translate-x-1/2 -translate-y-full"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={SITE.maps.photo}
                alt={`${branding.name} showroom`}
                className="h-16 w-[5.5rem] rounded-lg object-cover shadow-lift ring-2 ring-white transition duration-300 hover:scale-105 md:h-20 md:w-28"
              />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

function HomeMerchBlock({
  section,
  home,
  categories,
}: {
  section: HomeSection;
  home: Home | null;
  categories: NonNullable<Home['categories']>;
}) {
  if (section.type === 'FEATURED_CATEGORIES' && categories.length) {
    return (
      <section className="py-16 md:py-20">
        <div className="page-wrap">
          <Reveal>
            <div>
              <p className="section-kicker">Catalog</p>
              <h2 className="section-title">{section.title || 'Shop by category'}</h2>
              <p className="section-lede">
                Air conditioning, refrigeration, cameras, generators and more — organised the way you shop in the
                showroom.
              </p>
            </div>
          </Reveal>
          <CategoryGrid categories={categories} preview={section.payload.limit ?? 0} />
        </div>
      </section>
    );
  }

  if (section.type === 'BANNERS' && section.payload.items?.length) {
    return (
      <section className="bg-slate-50 py-6 md:py-8">
        <div className="page-wrap grid gap-4 md:grid-cols-2">
          {section.payload.items.map((item, i) => (
            <Link
              key={`${item.image}-${i}`}
              href={item.href ?? '/shop'}
              className="group shine-hover relative overflow-hidden rounded-xl bg-[var(--color-ink)] shadow-card transition duration-500 hover:shadow-lift"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image}
                alt={item.alt ?? 'Promotion'}
                className="h-56 w-full object-cover opacity-90 transition duration-700 ease-out motion-safe:group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-ink)]/80 via-transparent to-transparent" />
              <span className="absolute bottom-5 left-5 inline-flex items-center gap-1 text-sm font-semibold text-white">
                {item.alt ?? (i === 0 ? 'Explore the lineup' : 'Get a security quote')}
                <ArrowRight size={14} className="link-nudge" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    );
  }

  if (section.type === 'FEATURED_PRODUCTS' && section.payload.categorySlug) {
    const row = (home?.categoryRows ?? []).find((item) => item.slug === section.payload.categorySlug);
    if (!row?.products.length) return null;
    return (
      <section className="py-16">
        <div className="page-wrap">
          <Reveal>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="section-kicker">Collection</p>
                <h2 className="section-title mb-0">{section.title || row.title}</h2>
              </div>
              <Link
                href={`/shop?category=${row.slug}`}
                className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-primary)]"
              >
                View all <ArrowRight size={14} className="link-nudge" />
              </Link>
            </div>
          </Reveal>
          <ProductRowGrid products={row.products} preview={section.payload.limit ?? 0} />
        </div>
      </section>
    );
  }

  if (section.type === 'FEATURED_PRODUCTS') {
    return <NewArrivals featured={home?.featured ?? []} rows={home?.categoryRows ?? []} />;
  }

  if (section.type === 'CUSTOM_HTML' && section.payload.body?.trim()) {
    return (
      <section className="py-16">
        <div className="page-wrap">
          {section.title ? <h2 className="section-title">{section.title}</h2> : null}
          <p className="section-lede whitespace-pre-wrap">{section.payload.body}</p>
        </div>
      </section>
    );
  }

  return null;
}
