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
        ink: 'var(--color-ink)',
      },
      boxShadow: {
        lift: '0 12px 24px -4px rgb(30 64 175 / 0.08), 0 4px 8px -2px rgb(15 23 42 / 0.04)',
        card: '0 1px 3px rgb(15 23 42 / 0.04), 0 4px 12px rgb(15 23 42 / 0.02)',
      },
    },
  },
  plugins: [],
} satisfies Config;
