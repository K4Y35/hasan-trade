'use client';

import {
  Camera,
  Droplets,
  Fan,
  Gauge,
  Monitor,
  Snowflake,
  Thermometer,
  Video,
  Wind,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';

type Marker = {
  Icon: LucideIcon;
  top: string;
  left: string;
  size: number;
  depth: number;
  opacity: number;
  delay: string;
  spin?: 'slow' | 'rev';
  hideOnMobile?: boolean;
};

const ICONS: Marker[] = [
  { Icon: Snowflake, top: '12%', left: '4%', size: 88, depth: 18, opacity: 0.09, delay: '0s' },
  { Icon: Zap, top: '18%', left: '88%', size: 72, depth: -14, opacity: 0.08, delay: '0.8s', hideOnMobile: true },
  { Icon: Video, top: '28%', left: '12%', size: 64, depth: 22, opacity: 0.07, delay: '1.4s' },
  { Icon: Fan, top: '34%', left: '78%', size: 96, depth: 10, opacity: 0.08, delay: '0.3s', spin: 'slow' },
  { Icon: Droplets, top: '44%', left: '6%', size: 70, depth: -16, opacity: 0.09, delay: '1.1s' },
  { Icon: Monitor, top: '48%', left: '91%', size: 80, depth: 14, opacity: 0.07, delay: '1.8s', hideOnMobile: true },
  { Icon: Wrench, top: '58%', left: '18%', size: 62, depth: 20, opacity: 0.08, delay: '0.6s' },
  { Icon: Camera, top: '62%', left: '72%', size: 76, depth: -12, opacity: 0.08, delay: '2s' },
  { Icon: Gauge, top: '72%', left: '8%', size: 84, depth: 16, opacity: 0.07, delay: '1.5s', hideOnMobile: true },
  { Icon: Thermometer, top: '76%', left: '86%', size: 68, depth: 18, opacity: 0.09, delay: '0.4s' },
  { Icon: Wind, top: '86%', left: '24%', size: 90, depth: -10, opacity: 0.07, delay: '2.2s', spin: 'rev', hideOnMobile: true },
  { Icon: Snowflake, top: '90%', left: '64%', size: 74, depth: 12, opacity: 0.08, delay: '1.2s' },
];

const ORBS = [
  { top: '16%', left: '70%', size: 320, depth: 26, color: 'rgba(30,64,175,0.07)' },
  { top: '38%', left: '8%', size: 260, depth: -18, color: 'rgba(6,182,212,0.08)' },
  { top: '64%', left: '58%', size: 300, depth: 20, color: 'rgba(234,88,12,0.05)' },
  { top: '82%', left: '12%', size: 220, depth: -14, color: 'rgba(14,165,233,0.07)' },
];

const RINGS = [
  { top: '22%', left: '42%', size: 180, depth: 8, dashed: false },
  { top: '52%', left: '82%', size: 140, depth: -10, dashed: true },
  { top: '78%', left: '40%', size: 200, depth: 12, dashed: false },
];

const DOTS = [
  ['10%', '52%'],
  ['26%', '28%'],
  ['41%', '64%'],
  ['67%', '48%'],
  ['84%', '78%'],
] as const;

function shift(x: number, y: number, depth: number) {
  return { transform: `translate3d(${x * depth}px, ${y * depth}px, 0)` };
}

export function HomeAtmosphere() {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [pointer, setPointer] = useState({ x: 0, y: 0, px: 50, py: 40 });

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduceMotion(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    const onMove = (event: PointerEvent) => {
      setPointer({
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: (event.clientY / window.innerHeight) * 2 - 1,
        px: (event.clientX / window.innerWidth) * 100,
        py: (event.clientY / window.innerHeight) * 100,
      });
    };
    const onLeave = () => setPointer({ x: 0, y: 0, px: 50, py: 40 });
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('mouseleave', onLeave);
    };
  }, [reduceMotion]);

  const px = reduceMotion ? 0 : pointer.x;
  const py = reduceMotion ? 0 : pointer.y;

  return (
    <>
      <div aria-hidden className="home-atmosphere pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {ORBS.map((orb, i) => (
          <div
            key={`orb-${i}`}
            className="absolute rounded-full blur-3xl transition-transform duration-300 ease-out"
            style={{
              top: orb.top,
              left: orb.left,
              width: orb.size,
              height: orb.size,
              background: orb.color,
              ...shift(px, py, orb.depth),
            }}
          />
        ))}

        {RINGS.map((ring, i) => (
          <div
            key={`ring-${i}`}
            className="absolute rounded-full border border-[var(--color-primary)]/15 transition-transform duration-300 ease-out"
            style={{
              top: ring.top,
              left: ring.left,
              width: ring.size,
              height: ring.size,
              borderStyle: ring.dashed ? 'dashed' : 'solid',
              ...shift(px, py, ring.depth),
            }}
          />
        ))}

        {ICONS.map((item) => (
          <div
            key={`${item.top}-${item.left}`}
            className={`absolute text-[var(--color-primary)] transition-transform duration-300 ease-out ${
              item.hideOnMobile ? 'hidden md:block' : ''
            }`}
            style={{
              top: item.top,
              left: item.left,
              opacity: item.opacity,
              ...shift(px, py, item.depth),
            }}
          >
            <item.Icon
              size={item.size}
              strokeWidth={1.05}
              className={
                reduceMotion
                  ? undefined
                  : item.spin === 'slow'
                    ? 'animate-hero-spin-slow'
                    : item.spin === 'rev'
                      ? 'animate-hero-spin-rev'
                      : 'animate-hero-drift'
              }
              style={{ animationDelay: item.delay }}
            />
          </div>
        ))}

        {DOTS.map(([top, left], i) => (
          <span
            key={`${top}-${left}`}
            className="absolute transition-transform duration-300 ease-out"
            style={{ top, left, ...shift(px, py, 8 + i * 3) }}
          >
            <span
              className={`block h-1.5 w-1.5 rounded-full bg-[var(--color-accent)] opacity-30 ${
                reduceMotion ? '' : 'animate-hero-drift'
              }`}
              style={{ animationDelay: `${i * 0.4}s` }}
            />
          </span>
        ))}
      </div>

      {reduceMotion ? null : (
        <div
          aria-hidden
          className="home-cursor-glow pointer-events-none"
          style={{ left: `${pointer.px}%`, top: `${pointer.py}%` }}
        />
      )}
    </>
  );
}
