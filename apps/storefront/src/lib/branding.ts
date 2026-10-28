import { publicApi } from './api';
import { SITE, SOCIAL } from './site';
import type { StoreSettings } from './types';

export type Branding = {
  name: string;
  tagline: string | null;
  description: string | null;
  phone: string;
  phoneHref: string;
  whatsappHref: string;
  email: string | null;
  address: string;
  hours: string;
  logoUrl: string;
  logoHeight: number;
  footerText: string | null;
  copyrightText: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  faviconUrl: string | null;
  ogImageUrl: string | null;
  social: { label: string; href: string }[];
};

export function telHref(phone?: string | null) {
  const raw = (phone || SITE.phone).trim();
  const digits = raw.replace(/[^\d+]/g, '');
  return `tel:${digits || SITE.phone}`;
}

export function waHref(whatsapp?: string | null) {
  const raw = (whatsapp || SITE.phone).trim();
  if (/^https?:\/\//i.test(raw)) return raw;
  const digits = raw.replace(/[^\d]/g, '');
  return `https://wa.me/${digits || '8801711166522'}`;
}

export function withBranding(store?: StoreSettings['store'] | null): Branding {
  const phone = store?.phone?.trim() || SITE.phone;
  const social = SOCIAL.map((item) => {
    if (item.label === 'Facebook' && store?.facebookUrl) return { ...item, href: store.facebookUrl };
    if (item.label === 'Instagram' && store?.instagramUrl) return { ...item, href: store.instagramUrl };
    if (item.label === 'YouTube' && store?.youtubeUrl) return { ...item, href: store.youtubeUrl };
    if (item.label === 'WhatsApp') return { ...item, href: waHref(store?.whatsapp) };
    return item;
  });

  return {
    name: store?.name?.trim() || SITE.name,
    tagline: store?.tagline ?? null,
    description: store?.description ?? null,
    phone,
    phoneHref: telHref(phone),
    whatsappHref: waHref(store?.whatsapp),
    email: store?.email ?? SITE.emails[0],
    address: store?.address?.trim() || SITE.address,
    hours: store?.hours?.trim() || SITE.hours,
    logoUrl: store?.logoUrl || '/samples/logo.png',
    logoHeight: store?.logoHeight ?? 56,
    footerText: store?.footerText ?? null,
    copyrightText: store?.copyrightText ?? null,
    metaTitle: store?.metaTitle ?? null,
    metaDescription: store?.metaDescription ?? null,
    faviconUrl: store?.faviconUrl ?? null,
    ogImageUrl: store?.ogImageUrl ?? null,
    social,
  };
}

export async function fetchPublicStore() {
  try {
    const data = await publicApi<StoreSettings>('/v1/settings');
    return data.store;
  } catch {
    return null;
  }
}
