'use client';

import { type PropsWithChildren, useCallback, useMemo } from 'react';

import { WalletProvider } from '@solana/wallet-adapter-react';
import { WalletError } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';

import { useLuckyBags } from '.';
import { LuckyWalletAdapter } from '@/adapters';

export function LuckyWalletProvider({ children }: PropsWithChildren) {
  const context = useLuckyBags();
  const wallets = useMemo(() => [new LuckyWalletAdapter(context)], [context]);

  const onError = useCallback(
    (error: WalletError) => console.error('LuckyWalletProvider', error),
    []
  );

  return (
    <WalletProvider wallets={wallets} onError={onError} autoConnect={true}>
      <WalletModalProvider>{children}</WalletModalProvider>
    </WalletProvider>
  );
}
