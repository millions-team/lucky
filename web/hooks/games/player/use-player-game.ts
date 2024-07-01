import { PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { useCluster } from '@/providers';
import {
  useBountyAccount,
  useGamesProgram,
  useOwnedToken,
  useTransactionToast,
} from '@/hooks';

export function usePlayerGame({
  bounty,
  onSucceed,
}: {
  bounty: PublicKey;
  onSucceed?: () => void;
}) {
  const { publicKey } = useWallet();
  if (!publicKey) throw new Error('Wallet not connected');

  const { cluster } = useCluster();
  const { gem, trader, price } = useBountyAccount({ pda: bounty });
  const { program } = useGamesProgram();
  const transactionToast = useTransactionToast();

  const bag = useOwnedToken(publicKey, gem?.mint);
  const ammo = useOwnedToken(publicKey, trader?.mint);

  const playRound = useMutation({
    mutationKey: ['player', 'playRound', { cluster, bounty }],
    mutationFn: async () => {
      if (!bag.token) throw new Error('Bag not found');
      if (!ammo.token || ammo.token.amount < price)
        throw new Error('Not enough ammo for this game');

      return program.methods
        .playRound()
        .accounts({
          owner: publicKey,
          bounty,
          bag: bag.token.address,
          ammo: ammo.token.address,
        })
        .rpc();
    },
    onSuccess: (tx) => {
      transactionToast(tx, 'Game played');
      if (onSucceed) onSucceed();
      return Promise.all([bag.refresh(), ammo.refresh()]);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  return { bag, ammo, playRound };
}
