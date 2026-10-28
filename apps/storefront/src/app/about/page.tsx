import Link from 'next/link';
import { fetchPublicStore, withBranding } from '@/lib/branding';
import { SITE } from '@/lib/site';

export default async function AboutPage() {
  const branding = withBranding(await fetchPublicStore());
  const paragraphs = branding.description ? [branding.description] : SITE.about;

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <p className="section-kicker">About us</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">{branding.name}</h1>
      <div className="mt-8 space-y-5 text-lg leading-relaxed text-slate-600">
        {paragraphs.map((p) => (
          <p key={p.slice(0, 24)}>{p}</p>
        ))}
      </div>
      <div className="stagger mt-10 grid gap-4 sm:grid-cols-2">
        <div className="card lift p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Showroom</p>
          <p className="mt-2 font-medium">{branding.address}</p>
        </div>
        <div className="card lift p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Hours</p>
          <p className="mt-2 font-medium">{branding.hours}</p>
        </div>
      </div>
      <div className="mt-8 flex gap-3">
        <Link href="/shop" className="btn-primary">
          Shop products
        </Link>
        <Link href="/contact" className="rounded-full border border-slate-200 bg-white px-4 py-2.5 font-semibold shadow-sm transition hover:-translate-y-0.5">
          Contact
        </Link>
      </div>
    </main>
  );
}
