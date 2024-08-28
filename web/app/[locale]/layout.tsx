import { PropsWithChildren } from 'react';
import type { Viewport } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

import '../global.css';
import type { Params } from './locale.d';

import { locales } from '@/i18n';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: [{ media: '(prefers-color-scheme: dark)', color: '#000' }],
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// TODO: Define project metadata
export async function generateMetadata({ params: { locale } }: Params) {
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return {
    title: t('title'),
    description: t('description'),
    manifest: '/manifest.json',
    keywords: [
      'luck',
      'airdrop',
      'solana',
      'web3',
      'token',
      'spl-token',
      'nft',
      'sft',
      'pwa',
      'meme-coins',
      'gamble',
      'casino',
    ],
    icons: [
      { rel: 'apple-touch-icon', url: 'icons/lucky-128.png' },
      { rel: 'icon', url: 'icons/lucky-128.png' },
    ],
  };
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: PropsWithChildren<Params>) {
  unstable_setRequestLocale(locale);

  return (
    <html lang={locale}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
