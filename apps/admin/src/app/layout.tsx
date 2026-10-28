import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Hasan Trade Admin',
  description: 'Catalog, orders, inventory and POS for Hasan Trade Electronics.',
  icons: [{ url: '/samples/logo.png' }],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={sans.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
