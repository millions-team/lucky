'use client';

import { DealerIDL, getDealerPDA, getDealerProgramId } from '@lucky/anchor';
import { Program } from '@coral-xyz/anchor';
import { useConnection } from '@solana/wallet-adapter-react';
import { Cluster, PublicKey } from '@solana/web3.js';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import toast from 'react-hot-toast';
import { useCluster } from '../cluster/cluster-data-access';
import { useAnchorProvider } from '../solana/solana-provider';
import { useTransactionToast } from '../ui/ui-layout';

export function useDealerProgram() {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const programId = useMemo(
    () => getDealerProgramId(cluster.network as Cluster),
    [cluster]
  );
  const program = new Program(DealerIDL, programId, provider);

  const accounts = useQuery({
    queryKey: ['dealer', 'all', { cluster }],
    queryFn: () => program.account.dealer.all(),
  });

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  const initialize = useMutation({
    mutationKey: ['dealer', 'initialize', { cluster }],
    mutationFn: (dealer: PublicKey) =>
      program.methods
        .initialize({ pseudoRandom: {} })
        .accounts({ dealer: getDealerPDA(dealer) })
        .rpc(),
    onSuccess: (signature) => {
      transactionToast(signature);
      return accounts.refetch();
    },
    onError: () => toast.error('Failed to initialize account'),
  });

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    initialize,
  };
}

export function useDealerProgramAccount({
  account: dealer,
}: {
  account: PublicKey;
}) {
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const { program, accounts } = useDealerProgram();

  const accountQuery = useQuery({
    queryKey: ['dealer', 'fetch', { cluster, dealer }],
    queryFn: () => program.account.dealer.fetch(dealer),
  });

  const closeMutation = useMutation({
    mutationKey: ['dealer', 'close', { cluster, dealer }],
    mutationFn: () => program.methods.close().accounts({ dealer }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx);
      return accounts.refetch();
    },
  });

  const getMutation = useMutation({
    mutationKey: ['dealer', 'set', { cluster, dealer }],
    mutationFn: () => program.methods.get().accounts({ dealer }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx);
      return accountQuery.refetch();
    },
  });

  return {
    accountQuery,
    closeMutation,
    getMutation,
  };
}
