'use client';

import { useMemo } from 'react';
import { Cluster, PublicKey } from '@solana/web3.js';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useConnection } from '@solana/wallet-adapter-react';
import toast from 'react-hot-toast';

import { useCluster } from '../cluster/cluster-data-access';
import { useTransactionToast } from '../ui/ui-layout';

import { useAnchorProvider } from '@/providers';
import {
  getPresaleProgram,
  getPresaleProgramId,
  toBN,
} from '@luckyland/anchor';
import { BN } from '@coral-xyz/anchor';
import { TokenAccount, useGetToken } from '@/hooks';

export type PresaleSettings = {
  token: TokenAccount;
  start: number;
  end: number;
  min: number;
  max: number;
  prices: number[];
  amounts: number[];
};
export function usePresaleProgram() {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const programId = useMemo(
    () => getPresaleProgramId(cluster.network as Cluster),
    [cluster]
  );
  const program = getPresaleProgram(provider);

  const accounts = useQuery({
    queryKey: ['presale', 'all', { cluster }],
    queryFn: () => program.account.sale.all(),
  });

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  const initialize = useMutation({
    mutationKey: ['presale', 'initialize', { cluster }],
    mutationFn: (settings: PresaleSettings) =>
      program.methods
        .initSale({
          start: new BN(settings.start),
          end: new BN(settings.end),
          min: toBN(settings.min, settings.token.decimals),
          max: toBN(settings.max, settings.token.decimals),
          prices: settings.prices.map((price) => toBN(price, 9)),
          amounts: settings.amounts.map((amount) =>
            toBN(amount, settings.token.decimals)
          ),
        })
        .accounts({
          token: settings.token.mint,
          reserve: settings.token.publicKey,
        })
        .rpc(),
    onSuccess: (signature) => {
      transactionToast(signature);
      return accounts.refetch();
    },
    onError: () => toast.error('Failed to create sale'),
  });

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    initialize,
  };
}

export function usePresaleProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const { program, accounts } = usePresaleProgram();

  const accountQuery = useQuery({
    queryKey: ['presale', 'fetch', { cluster, account }],
    queryFn: () => program.account.sale.fetch(account),
  });
  const tokenQuery = useGetToken({ mint: accountQuery.data?.token });

  const closeMutation = useMutation({
    mutationKey: ['presale', 'close', { cluster, account }],
    mutationFn: (): Promise<string> => {
      throw new Error('Not implemented');
    },
    onSuccess: (tx) => {
      transactionToast(tx);
      return accounts.refetch();
    },
  });

  const purchase = useMutation({
    mutationKey: ['presale', 'set', { cluster, account }],
    mutationFn: (value: number): Promise<string> => {
      if (value < 0) throw new Error('Invalid value');
      if (!tokenQuery.data) throw new Error('Token not found');

      return program.methods
        .purchase(toBN(value, tokenQuery.data.decimals))
        .accounts({ token: tokenQuery.data.mint })
        .rpc();
    },
    onSuccess: (tx) => {
      transactionToast(tx);
      return accountQuery.refetch();
    },
  });

  return {
    accountQuery,
    tokenQuery,
    closeMutation,
    purchase,
  };
}
