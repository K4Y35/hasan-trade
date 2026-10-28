import type { ThemeDefinition } from './types';

export const bold: ThemeDefinition = {
  id: 'BOLD',
  name: 'Bold',
  description: 'High contrast, sharp corners, promotional layout.',
  tokens: {
    colorPrimary: '#DC2626',
    colorSecondary: '#111827',
    colorAccent: '#FBBF24',
    colorBackground: '#FFFFFF',
    colorForeground: '#111827',
    colorMuted: '#FEE2E2',
    fontSans: 'Inter',
    fontHeading: 'Oswald',
    radius: '0.125rem',
    buttonStyle: 'SOLID',
    cardStyle: 'OUTLINED',
  },
};
