import type { ThemeDefinition } from './types';

export const modern: ThemeDefinition = {
  id: 'MODERN',
  name: 'Modern',
  description: 'Minimal, large type, lots of whitespace.',
  tokens: {
    colorPrimary: '#111111',
    colorSecondary: '#2563EB',
    colorAccent: '#111111',
    colorBackground: '#FAFAFA',
    colorForeground: '#111111',
    colorMuted: '#F4F4F5',
    fontSans: 'Inter',
    fontHeading: 'Manrope',
    radius: '1rem',
    buttonStyle: 'SOFT',
    cardStyle: 'FLAT',
  },
};
