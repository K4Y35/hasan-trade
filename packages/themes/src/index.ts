import type { ThemeId } from '@shopstack/shared';
import { bold } from './bold';
import { classic } from './classic';
import { modern } from './modern';
import type { ThemeDefinition } from './types';

export type { DesignTokens, ThemeDefinition } from './types';
export { classic, modern, bold };

export const themes: Record<ThemeId, ThemeDefinition> = {
  CLASSIC: classic,
  MODERN: modern,
  BOLD: bold,
};

export function getTheme(id: ThemeId): ThemeDefinition {
  return themes[id];
}
