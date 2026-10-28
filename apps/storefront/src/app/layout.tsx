import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { StoreShell } from '@/components/store-shell';
import { fetchPublicStore, withBranding } from '@/lib/branding';
import './globals.css';

const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const branding = withBranding(await fetchPublicStore());
  return {
    title: branding.metaTitle || branding.name,
    description:
      branding.metaDescription ||
      branding.tagline ||
      `Air conditioners, refrigerators, CCTV cameras, generators and kitchen appliances from ${branding.name}.`,
    icons: branding.faviconUrl ? [{ url: branding.faviconUrl }] : undefined,
    openGraph: {
      title: branding.metaTitle || branding.name,
      description: branding.metaDescription || branding.tagline || undefined,
      images: branding.ogImageUrl ? [branding.ogImageUrl] : undefined,
    },
  };
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={sans.variable}>
      <body className="font-sans antialiased">
        <StoreShell>{children}</StoreShell>
      </body>
    </html>
  );
}
