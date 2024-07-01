import './global.css';
import { UiLayout } from '@/components/ui/ui-layout';
import { ClusterProvider } from '@/components/cluster/cluster-data-access';
import { SolanaProvider } from '@/components/solana/solana-provider';
import { ReactQueryProvider } from './react-query-provider';
import { Analytics } from '@vercel/analytics/next';

const { NEXT_PUBLIC_VERCEL_ENV = 'development' } = process.env;
export const metadata = {
  title: 'Luckyland',
  description: 'Where Prizes 🎉 and FUN 😃 never stops!',
};

const links: { label: string; path: string; program?: boolean }[] = [
  { label: 'Account', path: '/account' },
  { label: 'Lucky', path: '/lucky', program: true },
  { label: 'TinyAdventure', path: '/tiny-adventure', program: true },
  { label: 'Dealer', path: '/dealer', program: true },
  // { label: 'Roadmap', path: '/roadmap', program: true },
  // { label: 'Tokenomics', path: '/tokenomics', program: true },
  // { label: 'Leaderboard', path: '/leaderboard', program: true },
];

if (NEXT_PUBLIC_VERCEL_ENV !== 'production')
  links.push({ label: 'Clusters', path: '/clusters' });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark">
      <body>
        <ReactQueryProvider>
          <ClusterProvider>
            <SolanaProvider>
              <div className="max-w-md mx-auto">
                <UiLayout links={links} env={NEXT_PUBLIC_VERCEL_ENV}>
                  {children}
                </UiLayout>
              </div>
            </SolanaProvider>
          </ClusterProvider>
        </ReactQueryProvider>
        <Analytics />
      </body>
    </html>
  );
}
