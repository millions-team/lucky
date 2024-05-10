'use client';

import {
  LuckyIDL,
  getLuckyProgramId,
  getLuckyPlayerPDA,
  DealerOptions,
} from '@lucky/anchor';
import { Program } from '@coral-xyz/anchor';
import { useConnection } from '@solana/wallet-adapter-react';
import { Cluster, PublicKey } from '@solana/web3.js';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import toast from 'react-hot-toast';
import { useCluster } from '../cluster/cluster-data-access';
import { useAnchorProvider } from '../solana/solana-provider';
import { useTransactionToast } from '../ui/ui-layout';

export function useLuckyProgram() {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const programId = useMemo(
    () => getLuckyProgramId(cluster.network as Cluster),
    [cluster]
  );
  const program = new Program(LuckyIDL, programId, provider);

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  const initialize = useMutation({
    mutationKey: ['lucky', 'initialize', { cluster }],
    mutationFn: (player: PublicKey) =>
      program.methods
        .initialize()
        .accounts({ player: getLuckyPlayerPDA(player) })
        .rpc(),
    onSuccess: (signature) => {
      transactionToast(signature);
    },
    onError: () => toast.error('Failed to initialize account'),
  });

  return {
    program,
    programId,
    getProgramAccount,
    initialize,
  };
}

export function useLuckyProgramAccount({
  account: player,
}: {
  account: PublicKey;
}) {
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const { program } = useLuckyProgram();

  const accountQuery = useQuery({
    queryKey: ['lucky', 'fetch', { cluster, player }],
    queryFn: () => program.account.lucky.fetch(player),
  });

  const closeMutation = useMutation({
    mutationKey: ['lucky', 'close', { cluster, player }],
    mutationFn: () => program.methods.close().accounts({ player }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx);
    },
  });

  const playMutation = useMutation({
    mutationKey: ['lucky', 'set', { cluster, player }],
    mutationFn: (options: DealerOptions) =>
      program.methods.play(options).accounts({ player }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx);
      return accountQuery.refetch();
    },
  });

  return {
    accountQuery,
    closeMutation,
    playMutation,
  };
}
