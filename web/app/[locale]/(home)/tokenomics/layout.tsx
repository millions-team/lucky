import { type PropsWithChildren } from 'react';
import { unstable_setRequestLocale } from 'next-intl/server';

import type { Params } from '../../locale';
import { TokenomicsChat } from './_ui';
import { MessagesProvider } from '@/providers';

export default async function Layout({
  params: { locale },
  children,
}: PropsWithChildren<Params>) {
  unstable_setRequestLocale(locale);

  const bg = "bg-[url('/assets/images/pages/tokenomics.png')]";
  const className = [
    'hero min-h-screen w-full mx-auto',
    bg,
    'bg-cover bg-center bg-no-repeat',
  ].join(' ');

  return (
    <>
      <div className="w-full min-h-screen overflow-hidden relative">
        <div className={className}>{children}</div>
      </div>

      <MessagesProvider namespace="Tokenomics">
        <TokenomicsChat />
      </MessagesProvider>
    </>
  );
}
