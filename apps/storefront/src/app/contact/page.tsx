import { ExternalLink, MapPin } from 'lucide-react';
import { fetchPublicStore, withBranding } from '@/lib/branding';
import { SITE } from '@/lib/site';

function PlaceLabel({
  compact = false,
  name,
  address,
}: {
  compact?: boolean;
  name: string;
  address: string;
}) {
  return (
    <a
      href={SITE.maps.href}
      target="_blank"
      rel="noreferrer"
      className={`flex items-center gap-3 rounded-2xl bg-white text-left shadow-lift ring-1 ring-slate-200/80 transition duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:ring-[var(--color-primary)]/30 ${
        compact ? 'p-2 pr-4' : 'p-2.5 pr-5'
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={SITE.maps.photo}
        alt={`${name} showroom`}
        className={`shrink-0 rounded-xl object-cover ${compact ? 'h-16 w-[4.5rem]' : 'h-20 w-28 md:h-24 md:w-32'}`}
      />
      <span className="min-w-0">
        <span className="flex items-start gap-1.5 font-semibold leading-snug text-slate-900">
          <MapPin size={16} className="mt-0.5 shrink-0 text-[var(--color-secondary)]" />
          <span className="uppercase tracking-wide">{name}</span>
        </span>
        <span className="mt-1 block text-sm leading-snug text-slate-500">{address}</span>
      </span>
    </a>
  );
}

export default async function ContactPage() {
  const branding = withBranding(await fetchPublicStore());
  const emails = branding.email ? [branding.email, ...SITE.emails.filter((item) => item !== branding.email)] : SITE.emails;

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16">
      <div className="grid gap-10 md:grid-cols-2">
        <div>
          <p className="section-kicker">Get in touch</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">Contact</h1>
          <p className="mt-4 text-slate-600">
            Visit the Sylhet showroom or call our specialists for installation, spare parts, and wholesale pricing.
          </p>
          <dl className="mt-8 space-y-5 text-sm">
            <div>
              <dt className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Location</dt>
              <dd>
                <PlaceLabel compact name={branding.name} address={branding.address} />
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Call / WhatsApp</dt>
              <dd className="mt-1 text-base font-medium">
                <a href={branding.phoneHref}>{branding.phone}</a>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Email</dt>
              {emails.map((email) => (
                <dd key={email} className="mt-1">
                  <a href={`mailto:${email}`}>{email}</a>
                </dd>
              ))}
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Hours</dt>
              <dd className="mt-1 text-base font-medium">{branding.hours}</dd>
            </div>
          </dl>
        </div>
        <form action={`mailto:${emails[0]}`} method="get" className="card space-y-4 p-7 shadow-lift">
          <h2 className="text-xl font-semibold">Send a message</h2>
          <input name="subject" className="field" placeholder="Your name / company" required />
          <input name="body" className="field" placeholder="Phone number" required />
          <textarea name="body" className="field h-32" placeholder="How can we help?" />
          <button className="btn-primary w-full">Email us</button>
          <a href={branding.whatsappHref} className="block text-center text-sm font-semibold text-emerald-700">
            Or chat on WhatsApp
          </a>
        </form>
      </div>

      <section className="mt-12">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="section-kicker">Find us</p>
            <h2 className="section-title">Showroom map</h2>
          </div>
          <a
            href={SITE.maps.href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)] hover:underline"
          >
            Open in Google Maps
            <ExternalLink size={14} />
          </a>
        </div>
        <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-slate-100 shadow-card">
          <iframe
            title={`${branding.name} on Google Maps`}
            src={SITE.maps.embed}
            className="h-[320px] w-full border-0 md:h-[460px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
          <div className="pointer-events-none absolute left-[54%] top-[38%] z-10 -translate-x-1/2 -translate-y-full">
            <a href={SITE.maps.href} target="_blank" rel="noreferrer" className="pointer-events-auto relative block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={SITE.maps.photo}
                alt={`${branding.name} showroom`}
                className="h-20 w-[6.5rem] rounded-xl object-cover shadow-lift ring-2 ring-white transition duration-300 hover:scale-105 md:h-24 md:w-32"
              />
              <span
                aria-hidden
                className="absolute -bottom-1.5 left-1/2 h-0 w-0 -translate-x-1/2 border-x-[7px] border-t-[7px] border-x-transparent border-t-white"
              />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
