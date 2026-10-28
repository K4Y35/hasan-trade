import { Reveal } from '@/components/reveal';

export function LogoStrip({ title, logos }: { title: string; logos: string[] }) {
  const loop = [...logos, ...logos];
  return (
    <section className="border-y border-slate-100 bg-white py-16">
      <div className="page-wrap">
        <Reveal>
          <p className="section-kicker">Brands we carry</p>
          <h2 className="section-title">{title}</h2>
        </Reveal>
        <div className="mt-8 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
          <div className="logo-marquee flex w-max items-center gap-16">
            {loop.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={`${src}-${i}`}
                src={src}
                alt=""
                className="h-14 w-auto object-contain opacity-80 grayscale transition duration-500 hover:scale-110 hover:opacity-100 hover:grayscale-0"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
