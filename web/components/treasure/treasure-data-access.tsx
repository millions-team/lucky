'use client';

import { useMemo } from 'react';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { BN } from '@coral-xyz/anchor';
import { Cluster, PublicKey } from '@solana/web3.js';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { getKeeperPDA } from '@luckyland/anchor';

import { useCluster } from '../cluster/cluster-data-access';
import { useTransactionToast } from '../ui/ui-layout';
import { useGamesProgram } from '@/hooks';

export function useTreasureProgram({
  callback,
}: { callback?: () => void } = {}) {
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const { program, programId, getProgramAccount } = useGamesProgram();

  const keeperPDA = useMemo(
    () => getKeeperPDA(cluster.network as Cluster),
    [cluster.network]
  );

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
    keeperPDA,
    initialize,
    deposit,
    withdraw,
  };
}
