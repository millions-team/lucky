import { useWallet } from '@solana/wallet-adapter-react';

import { useGetBalance } from '@/hooks';

export function usePlayer() {
  const { publicKey } = useWallet();
  if (!publicKey) throw new Error('Wallet not connected');
  const balance = useGetBalance({ address: publicKey });

  return { owner: publicKey, balance };
}
