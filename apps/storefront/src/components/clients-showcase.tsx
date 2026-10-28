import { Reveal } from '@/components/reveal';
import { CLIENTS } from '@/lib/site';

export function ClientsShowcase() {
  return (
    <section className="relative overflow-hidden bg-[var(--color-ink)] py-16 text-white md:py-20">
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-[var(--color-accent)]/20 blur-3xl motion-safe:animate-hero-float" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-[var(--color-secondary)]/15 blur-3xl motion-safe:animate-hero-float-alt" />
      <div className="relative mx-auto max-w-page px-4 md:px-8">
        <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto]">
          <Reveal>
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--color-accent)]">Social proof</p>
            <h2 className="mt-2 max-w-xl text-3xl font-bold tracking-tight md:text-4xl">Our esteemed institutional clients</h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/75">
              Hospitals, hotels and campuses across greater Sylhet trust this showroom for HVAC cooling, backup
              generators, and certified maintenance.
            </p>
          </Reveal>
          <div className="flex flex-wrap gap-8 text-sm">
            <div>
              <p className="text-3xl font-extrabold">{CLIENTS.length}+</p>
              <p className="text-white/70">featured institutions</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold">Healthcare</p>
              <p className="text-white/70">hotels &amp; campus sites</p>
            </div>
          </div>
        </div>
        <div className="stagger mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {CLIENTS.map((client) => (
            <article
              key={client.name}
              className="group lift flex flex-col items-center rounded-xl bg-white px-5 py-6 text-center shadow-card"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={client.src} alt="" className="h-20 w-auto object-contain transition duration-500 grayscale-[0.2] motion-safe:group-hover:scale-105 group-hover:grayscale-0" />
              <p className="mt-4 text-sm font-semibold leading-snug text-slate-900">{client.name}</p>
              <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.06em] text-slate-400">{client.kind}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
