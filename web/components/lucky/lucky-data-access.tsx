'use client';

import { LuckyIDL, getLuckyProgramId } from '@lucky/anchor';
import { Program } from '@coral-xyz/anchor';
import { useConnection } from '@solana/wallet-adapter-react';
import { Cluster, Keypair, PublicKey } from '@solana/web3.js';
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

  const accounts = useQuery({
    queryKey: ['lucky', 'all', { cluster }],
    queryFn: () => program.account.lucky.all(),
  });

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  const initialize = useMutation({
    mutationKey: ['lucky', 'initialize', { cluster }],
    mutationFn: (keypair: Keypair) =>
      program.methods
        .initialize()
        .accounts({ lucky: keypair.publicKey })
        .signers([keypair])
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

export function useLuckyProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const { program, accounts } = useLuckyProgram();

  const accountQuery = useQuery({
    queryKey: ['lucky', 'fetch', { cluster, account }],
    queryFn: () => program.account.lucky.fetch(account),
  });

  const closeMutation = useMutation({
    mutationKey: ['lucky', 'close', { cluster, account }],
    mutationFn: () =>
      program.methods.close().accounts({ lucky: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx);
      return accounts.refetch();
    },
  });

  const decrementMutation = useMutation({
    mutationKey: ['lucky', 'decrement', { cluster, account }],
    mutationFn: () =>
      program.methods.decrement().accounts({ lucky: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx);
      return accountQuery.refetch();
    },
  });

  const incrementMutation = useMutation({
    mutationKey: ['lucky', 'increment', { cluster, account }],
    mutationFn: () =>
      program.methods.increment().accounts({ lucky: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx);
      return accountQuery.refetch();
    },
  });

  const setMutation = useMutation({
    mutationKey: ['lucky', 'set', { cluster, account }],
    mutationFn: (value: number) =>
      program.methods.set(value).accounts({ lucky: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx);
      return accountQuery.refetch();
    },
  });

  return {
    accountQuery,
    closeMutation,
    decrementMutation,
    incrementMutation,
    setMutation,
  };
}
