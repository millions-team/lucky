import { useMemo } from 'react';
import { PublicKey } from '@solana/web3.js';
import { getAccount } from '@solana/spl-token';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { BN } from '@coral-xyz/anchor';
import toast from 'react-hot-toast';

import { useCluster } from '@/providers';
import { useTransactionToast } from '@/components/ui/ui-layout';

import { type Bounty, getBountyVaultPDA } from '@luckyland/anchor';
import { useGamesProgram } from '@/hooks';

export function useBountyAccount({ pda }: { pda: PublicKey }) {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const { program, games } = useGamesProgram({});

  const bountyQuery = useQuery({
    queryKey: ['bounty', 'account', { cluster, pda }],
    queryFn: async () => {
      return program.account.bounty.fetch(pda);
    },
  });

  const isOwner = useMemo(() => {
    if (!publicKey || !bountyQuery.data) return false;
    return publicKey?.equals(bountyQuery.data?.owner);
  }, [publicKey, bountyQuery.data]);

  const vaultPDA = useMemo(() => getBountyVaultPDA(pda), [pda]);
  const vaultQuery = useQuery({
    queryKey: ['bounty-vault', 'account', { cluster, pda }],
    queryFn: async () => {
      try {
        return await getAccount(connection, vaultPDA);
      } catch (e: any) {
        if (e.name === 'TokenAccountNotFoundError') return null;
        throw e;
      }
    },
  });

  const fund = useMutation({
    mutationKey: ['bounty', 'fund', { cluster, pda }],
    mutationFn: (amount: BN) => {
      if (!bountyQuery.data) throw new Error('Bounty not found');
      if (!publicKey) throw new Error('Wallet not connected');

      const { gem } = bountyQuery.data;

      return program.methods
        .fundBounty(amount)
        .accounts({ gem, bounty: pda, supplier: publicKey })
        .rpc();
    },
    onSuccess: (tx) => {
      transactionToast(tx);
      return games.refetch();
    },
    onError: (e, a, b) => {
      console.log(e, a, b);
      toast.error('Failed to fund bounty vault.');
    },
  });

  const update = useMutation({
    mutationKey: ['bounty', 'update', { cluster, pda }],
    mutationFn: (bounty: Bounty) => {
      if (!bountyQuery.data) throw new Error('Bounty not found');
      if (!publicKey) throw new Error('Wallet not connected');

      return program.methods
        .renewBounty(bounty)
        .accounts({ bounty: pda, supplier: publicKey })
        .rpc();
    },
    onSuccess: (tx) => {
      transactionToast(tx);
      return games.refetch();
    },
    onError: (e, a, b) => {
      console.log(e, a, b);
      toast.error('Failed to update bounty.');
    },
  });

  return {
    bountyQuery,
    vaultQuery,
    isOwner,
    fund,
    update,
  };
}
