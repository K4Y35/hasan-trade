import type { ThemeDefinition } from './types';

export const classic: ThemeDefinition = {
  id: 'CLASSIC',
  name: 'Classic',
  description: 'Clean storefront with navy and gold. Default theme.',
  tokens: {
    colorPrimary: '#0F172A',
    colorSecondary: '#F59E0B',
    colorAccent: '#0EA5E9',
    colorBackground: '#FFFFFF',
    colorForeground: '#0F172A',
    colorMuted: '#F1F5F9',
    fontSans: 'Inter',
    fontHeading: 'Inter',
    radius: '0.5rem',
    buttonStyle: 'SOLID',
    cardStyle: 'ELEVATED',
  },
};
