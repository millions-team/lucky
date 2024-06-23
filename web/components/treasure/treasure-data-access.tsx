'use client';

import { useMemo } from 'react';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { BN } from '@coral-xyz/anchor';
import { useConnection } from '@solana/wallet-adapter-react';
import { Cluster, PublicKey } from '@solana/web3.js';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { getGamesProgramId, getGamesProgram } from '@luckyland/anchor';

import { useCluster } from '../cluster/cluster-data-access';
import { useAnchorProvider } from '@/providers';
import { useTransactionToast } from '../ui/ui-layout';

export function useTreasureProgram({
  callback,
}: { callback?: () => void } = {}) {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const programId = useMemo(
    () => getGamesProgramId(cluster.network as Cluster),
    [cluster.network]
  );
  const program = getGamesProgram(provider);

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  const initialize = useMutation({
    mutationKey: ['vault', 'initialize', { cluster }],
    mutationFn: (mint: PublicKey) =>
      program.methods.forgeStronghold().accounts({ gem: mint }).rpc(),
    onSuccess: (signature) => {
      transactionToast(signature);
      callback && callback();
    },
    onError: () => toast.error('Failed to run program'),
  });

  const deposit = useMutation({
    mutationKey: ['vault', 'deposit', { cluster }],
    mutationFn: async ({
      mint,
      amount,
      sender,
    }: {
      mint: PublicKey;
      amount: bigint;
      sender: PublicKey;
    }) => {
      const reserve = await getAssociatedTokenAddress(mint, sender);

      return program.methods
        .stockpileGems(new BN(amount.toString()))
        .accounts({ gem: mint, reserve })
        .rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      callback && callback();
    },
    onError: () => toast.error('Failed to deposit on vault'),
  });

  const withdraw = useMutation({
    mutationKey: ['vault', 'withdraw', { cluster }],
    mutationFn: async ({
      mint,
      amount,
      sender,
    }: {
      mint: PublicKey;
      amount: bigint;
      sender: PublicKey;
    }) => {
      const reserve = await getAssociatedTokenAddress(mint, sender);

      return program.methods
        .retrieveGems(new BN(amount.toString()))
        .accounts({ gem: mint, reserve })
        .rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      callback && callback();
    },
    onError: () => toast.error('Failed to withdraw from vault'),
  });

  return {
    program,
    programId,
    getProgramAccount,
    initialize,
    deposit,
    withdraw,
  };
}