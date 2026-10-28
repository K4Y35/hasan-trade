import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
        muted: 'var(--color-muted)',
      },
      boxShadow: {
        lift: '0 12px 24px -4px rgb(30 64 175 / 0.08), 0 4px 8px -2px rgb(15 23 42 / 0.04)',
        card: '0 1px 3px rgb(15 23 42 / 0.04), 0 4px 12px rgb(15 23 42 / 0.02)',
      },
      maxWidth: {
        page: '1360px',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'mega-in': {
          from: { opacity: '0', transform: 'translateY(-10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        kenburns: {
          from: { transform: 'scale(1)' },
          to: { transform: 'scale(1.08)' },
        },
        pulseRing: {
          '0%': { transform: 'scale(1)', opacity: '0.55' },
          '100%': { transform: 'scale(1.55)', opacity: '0' },
        },
        cartPop: {
          '0%': { transform: 'scale(1)' },
          '40%': { transform: 'scale(1.18)' },
          '100%': { transform: 'scale(1)' },
        },
        'hero-progress': {
          from: { transform: 'scaleX(0)' },
          to: { transform: 'scaleX(1)' },
        },
        'hero-float': {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) scale(1)' },
          '50%': { transform: 'translate3d(18px, -22px, 0) scale(1.08)' },
        },
        'hero-float-alt': {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) scale(1)' },
          '50%': { transform: 'translate3d(-16px, 16px, 0) scale(0.94)' },
        },
        'hero-drift': {
          '0%, 100%': { transform: 'translateY(0)', opacity: '0.28' },
          '50%': { transform: 'translateY(-14px)', opacity: '0.7' },
        },
        'hero-spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'hero-spin-rev': {
          from: { transform: 'rotate(360deg)' },
          to: { transform: 'rotate(0deg)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s ease both',
        'mega-in': 'mega-in 0.2s ease-out both',
        kenburns: 'kenburns 8s ease-out forwards',
        pulseRing: 'pulseRing 1.8s ease-out infinite',
        cartPop: 'cartPop 0.35s ease',
        'hero-progress': 'hero-progress 5.6s linear forwards',
        'hero-float': 'hero-float 11s ease-in-out infinite',
        'hero-float-alt': 'hero-float-alt 14s ease-in-out infinite',
        'hero-drift': 'hero-drift 6s ease-in-out infinite',
        'hero-spin-slow': 'hero-spin-slow 28s linear infinite',
        'hero-spin-rev': 'hero-spin-rev 36s linear infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
