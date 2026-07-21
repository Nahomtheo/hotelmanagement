import { Analytics } from '@vercel/analytics/next';
import type { Metadata } from 'next';
import Providers from './provider'; // Note: Adjusted relative path because this file is now nested inside [locale]
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css'; // Adjusted path for the CSS file import
import ModernNavbar from '@/components/ui/navbar';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const locales = ['en', 'am'];

export const metadata: Metadata = {
  title: 'MW Hotel',
  description: 'MW Hotel booking and management system',
  generator: 'MW Hotel App',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  // 1. Await the dynamic locale route parameter
  const { locale } = await params;

  // 2. Fallback to a 404 page if a user manually inputs an unsupported locale route
  if (!locales.includes(locale)) {
    notFound();
  }

  // 3. Load translation strings corresponding to the current active locale
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased bg-zinc-950 text-zinc-100 selection:bg-amber-500/30">
        {/* 4. Provide locale translation context to client components */}
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <ModernNavbar />
            {children}
          </Providers>
        </NextIntlClientProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  );
}