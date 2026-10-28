import Link from 'next/link';
import { fetchPublicStore, withBranding } from '@/lib/branding';

const SERVICES = [
  {
    title: 'AC installation',
    copy: 'Split, cassette, ceiling and floor-standing installation with copper pipe, insulation and drainage done to manufacturer spec.',
  },
  {
    title: 'AC servicing',
    copy: 'Gas charging, jet wash, indoor/outdoor cleaning, PCB and compressor diagnosis for Gree, Haier, Midea, General and Safe units.',
  },
  {
    title: 'Spare parts',
    copy: 'Manifold gauges, copper pipe, capacitors, contactors, refrigerant and genuine-quality HVAC tools from the showroom.',
  },
  {
    title: 'CCTV & generators',
    copy: 'Camera, DVR and generator commissioning for homes, shops and industrial sites across Sylhet.',
  },
];

export default async function ServicesPage() {
  const branding = withBranding(await fetchPublicStore());

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <p className="section-kicker">Support</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">AC servicing & installation</h1>
      <p className="mt-4 max-w-2xl text-slate-600">
        Book installation or after-sales service from the {branding.name} team. Call {branding.phone} or WhatsApp for a same-day estimate.
      </p>
      <div className="stagger mt-10 grid gap-5 md:grid-cols-2">
        {SERVICES.map((item) => (
          <article key={item.title} className="card lift p-6">
            <h2 className="text-xl font-semibold">{item.title}</h2>
            <p className="mt-2 text-slate-600">{item.copy}</p>
          </article>
        ))}
      </div>
      <div className="mt-10 flex flex-wrap gap-3">
        <a href={branding.phoneHref} className="btn-primary">
          Call {branding.phone}
        </a>
        <a href={branding.whatsappHref} className="btn-secondary">
          WhatsApp
        </a>
        <Link href="/shop?category=ac-spare-parts" className="rounded-full border border-slate-200 bg-white px-4 py-2.5 font-semibold shadow-sm">
          Browse spare parts
        </Link>
      </div>
    </main>
  );
}
