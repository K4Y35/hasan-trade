import type { ThemeId } from '@shopstack/shared';

export type DesignTokens = {
  colorPrimary: string;
  colorSecondary: string;
  colorAccent: string;
  colorBackground: string;
  colorForeground: string;
  colorMuted: string;
  fontSans: string;
  fontHeading: string;
  radius: string;
  buttonStyle: 'SOLID' | 'OUTLINE' | 'SOFT';
  cardStyle: 'FLAT' | 'ELEVATED' | 'OUTLINED';
};

export type ThemeDefinition = {
  id: ThemeId;
  name: string;
  description: string;
  tokens: DesignTokens;
};
