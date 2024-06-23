import './global.css';

import {
  ReactQueryProvider,
  ClusterProvider,
  SolanaProvider,
  DataFeedProvider,
} from '@/providers';
import { UiLayout } from '@/components/ui/ui-layout';
import { Analytics } from '@vercel/analytics/next';

const { NEXT_PUBLIC_VERCEL_ENV = 'development' } = process.env;
export const metadata = {
  title: 'Luckyland',
  description: 'Where Prizes 🎉 and FUN 😃 never stops!',
};

const links: { label: string; path: string; program?: boolean }[] = [
  { label: 'Account', path: '/account' },
  { label: 'Treasury', path: '/treasure', program: true },
  { label: 'Games', path: '/games', program: true },
  { label: 'Lucky', path: '/lucky', program: true },
  { label: 'Store', path: '/store', program: true },
];

if (NEXT_PUBLIC_VERCEL_ENV !== 'production')
  links.push({ label: 'Clusters', path: '/clusters' });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ReactQueryProvider>
          <ClusterProvider>
            <SolanaProvider>
              <DataFeedProvider>
                <UiLayout links={links} env={NEXT_PUBLIC_VERCEL_ENV}>
                  {children}
                </UiLayout>
              </DataFeedProvider>
            </SolanaProvider>
          </ClusterProvider>
        </ReactQueryProvider>
        <Analytics />
      </body>
    </html>
  );
}
