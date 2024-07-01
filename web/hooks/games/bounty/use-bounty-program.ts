import { useWallet } from '@solana/wallet-adapter-react';
import { useMutation } from '@tanstack/react-query';

import { useCluster } from '@/providers';
import { useTransactionToast } from '@/components/ui/ui-layout';

import { type Bounty } from '@luckyland/anchor';
import { useGamesProgram } from '@/hooks';
import toast from 'react-hot-toast';

export function useBountyProgram({ callback }: { callback?: () => void } = {}) {
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
    onSuccess: async (tx) => {
      transactionToast(tx, 'Bounty created');
      return games.refetch().then(() => callback && callback());
    },
    onError: () => {
      toast.error('Failed to create Bounty');
    },
  });

  return {
    create,
  };
}
