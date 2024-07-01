import { useWallet } from '@solana/wallet-adapter-react';
import { useMutation } from '@tanstack/react-query';

import { useCluster } from '@/providers';
import { useTransactionToast } from '@/components/ui/ui-layout';

import { type Bounty } from '@luckyland/anchor';
import { useGamesProgram } from '@/hooks';
import toast from 'react-hot-toast';

export function useBountyProgram() {
  const { publicKey } = useWallet();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const { program, games } = useGamesProgram();

  const create = useMutation({
    mutationKey: ['bounty', 'create', { cluster }],
    mutationFn: (settings: Bounty) => {
      if (!publicKey) throw new Error('Wallet not connected');
      const { gem, task, trader } = settings;

      return program.methods
        .issueBounty(settings)
        .accounts({ gem, trader, task, supplier: publicKey })
        .rpc();
    },
    onSuccess: (tx) => {
      transactionToast(tx);
      return games.refetch();
    },
    onError: () => {
      toast.error('Failed to create Bounty');
    },
  });

  return {
    create,
  };
}
