'use client';

import dynamic from 'next/dynamic';
import { AnchorProvider } from '@coral-xyz/anchor';
import {
  AnchorWallet,
  useConnection,
  useWallet,
  ConnectionProvider,
} from '@solana/wallet-adapter-react';
import { ReactNode, useMemo } from 'react';
import { useCluster, LuckyWalletProvider } from '.';

require('@solana/wallet-adapter-react-ui/styles.css');

export const WalletButton = dynamic(
  async () =>
    (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

export function SolanaProvider({ children }: { children: ReactNode }) {
  const { cluster } = useCluster();
  const endpoint = useMemo(() => cluster.endpoint, [cluster]);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <LuckyWalletProvider>{children}</LuckyWalletProvider>
    </ConnectionProvider>
  );
}

export function useAnchorProvider() {
  const { connection } = useConnection();
  const wallet = useWallet();

  return new AnchorProvider(connection, wallet as AnchorWallet, {
    commitment: 'confirmed',
  });
}
