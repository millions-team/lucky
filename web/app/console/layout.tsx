import { PropsWithChildren } from 'react';
import type { Viewport } from 'next';
import '../global.css';

import {
  ReactQueryProvider,
  ClusterProvider,
  LuckyBagsProvider,
  SolanaModalProvider,
  DataFeedProvider,
} from '@/providers';
import { UiLayout } from '@/components/ui/ui-layout';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

const { NEXT_PUBLIC_VERCEL_ENV = 'development' } = process.env;

const links: { label: string; path: string; program?: boolean }[] = [
  { label: 'Account', path: '/account' },
  { label: 'Treasury', path: '/treasure', program: true },
  { label: 'Games', path: '/games', program: true },
  { label: 'Store', path: '/store', program: true },
  { label: 'Sale', path: '/sale', program: true },
].map((link) => ({ ...link, path: `/console${link.path}` }));

if (NEXT_PUBLIC_VERCEL_ENV !== 'production')
  links.push({ label: 'Clusters', path: '/console/clusters' });

export default function Layout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <body>
        <ReactQueryProvider>
          <ClusterProvider>
            <LuckyBagsProvider>
              <SolanaModalProvider>
                <DataFeedProvider>
                  <UiLayout links={links} env={NEXT_PUBLIC_VERCEL_ENV}>
                    {children}
                  </UiLayout>
                </DataFeedProvider>
              </SolanaModalProvider>
            </LuckyBagsProvider>
          </ClusterProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
