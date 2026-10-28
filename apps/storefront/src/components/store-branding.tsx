'use client';

import { createContext, useContext } from 'react';
import { withBranding, type Branding } from '@/lib/branding';

const StoreBrandingContext = createContext<Branding>(withBranding(null));

export const StoreBrandingProvider = StoreBrandingContext.Provider;

export function useStoreBranding() {
  return useContext(StoreBrandingContext);
}
