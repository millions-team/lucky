'use client';

import { useMemo } from 'react';
import { Cluster, PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import {
  getStorePDA,
  getStoreProgram,
  getStoreProgramId,
  getStoreVaultPDA,
} from '@luckyland/anchor';

import { useCluster } from '../cluster/cluster-data-access';
import { useTransactionToast } from '../ui/ui-layout';
import { useGetTokenAccount, useOwnedToken, useStoreBalance } from '@/hooks';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { useAnchorProvider } from '@/providers';

export function useStoreProgram() {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const programId = useMemo(
    () => getStoreProgramId(cluster.network as Cluster),
    [cluster]
  );
  const program = getStoreProgram(provider);

  const stores = useQuery({
    queryKey: ['store', 'all', { cluster }],
    queryFn: () => program.account.store.all(),
  });

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  const initialize = useMutation({
    mutationKey: ['store', 'initialize', { cluster }],
    mutationFn: ({
      tokenMint,
      price,
    }: {
      tokenMint: PublicKey;
      price: bigint;
    }) =>
      program.methods
        .initialize(new BN(price.toString()))
        .accounts({ tokenMint })
        .rpc(),
    onSuccess: (signature) => {
      transactionToast(signature);
      return stores.refetch();
    },
    onError: () => toast.error('Failed to initialize account'),
  });

  return {
    program,
    programId,
    stores,
    getProgramAccount,
    initialize,
  };
}

export function useStoreProgramAccount({
  storePda,
  callback,
}: {
  storePda: PublicKey;
  callback?: () => void;
}) {
  const { publicKey } = useWallet();
  if (!publicKey) throw new Error('Wallet not connected');

  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const { program, stores } = useStoreProgram();
  const vaultPDA = useMemo(
    () => getStoreVaultPDA(storePda, cluster.network as Cluster),
    [storePda, cluster]
  );

  // ------------------- queries ----------------------
  const vaultQuery = useGetTokenAccount({ address: vaultPDA });

  const tokenQuery = useOwnedToken(publicKey, vaultQuery.data?.mint);

  const storeQuery = useQuery({
    queryKey: ['store', 'fetch', { cluster, storePda }],
    queryFn: () => program.account.store.fetch(storePda),
  });

  const balanceQuery = useStoreBalance(storePda);

  // ------------------- computed ---------------------
  const isOwner = useMemo(() => {
    if (!storeQuery.data?.mint || !publicKey) return false;
    return storePda.equals(getStorePDA(publicKey, storeQuery.data.mint));
  }, [publicKey, storeQuery.data?.mint, storePda]);

  // ------------------- mutations -------------------
  const initVault = useMutation({
    mutationKey: ['store', 'initVault', { cluster, storePda }],
    mutationFn: () => {
      if (!storeQuery.data?.mint) throw new Error('Store not initialized');

      const tokenMint = storeQuery.data.mint;
      return program.methods.initializeVault().accounts({ tokenMint }).rpc();
    },
    onSuccess: (tx) => {
      transactionToast(tx);
      return vaultQuery.refetch().then(() => callback?.());
    },
  });

  const deposit = useMutation({
    mutationKey: ['store', 'deposit', { cluster, storePda }],
    mutationFn: async (amount: bigint) => {
      if (!vaultQuery.data) throw new Error('Vault not initialized');
      if (!publicKey) throw new Error('Wallet not connected');

      const targetAccount = await getAssociatedTokenAddress(
        vaultQuery.data.mint,
        publicKey
      );

      return program.methods
        .deposit(new BN(amount.toString()))
        .accounts({ store: storePda, targetAccount })
        .rpc();
    },
    onSuccess: (signature) => {
      callback?.();
      transactionToast(signature);
      return Promise.all([vaultQuery.refetch(), tokenQuery.refresh()]).then(
        () => callback?.()
      );
    },
    onError: () => toast.error('Failed to deposit on vault'),
  });

  const update = useMutation({
    mutationKey: ['store', 'set', { cluster, storePda }],
    mutationFn: (value: number) => {
      if (!storeQuery.data?.mint) throw new Error('Store not initialized');

      const tokenMint = storeQuery.data.mint;
      return program.methods
        .update(new BN(value))
        .accounts({ tokenMint })
        .rpc();
    },
    onSuccess: (tx) => {
      callback?.();
      transactionToast(tx);
      return storeQuery.refetch().then(() => callback?.());
    },
  });

  const sell = useMutation({
    mutationKey: ['store', 'sell', { cluster, storePda }],
    mutationFn: async (amount: bigint) => {
      if (!vaultQuery.data) throw new Error('Vault not initialized');
      if (!publicKey) throw new Error('Wallet not connected');

      const targetAccount = await getAssociatedTokenAddress(
        vaultQuery.data.mint,
        publicKey
      );

      return program.methods
        .sell(new BN(amount.toString()))
        .accounts({ store: storePda, targetAccount })
        .rpc();
    },
    onSuccess: (tx) => {
      callback?.();
      transactionToast(tx);
      return Promise.all([
        vaultQuery.refetch(),
        tokenQuery.refresh(),
        balanceQuery.refetch(),
      ]).then(() => callback?.());
    },
  });

  const withdraw = useMutation({
    mutationKey: ['store', 'withdraw', { cluster, storePda }],
    mutationFn: async (amount: bigint) => {
      if (!storeQuery.data?.mint) throw new Error('Store not initialized');

      const tokenMint = storeQuery.data.mint;
      return program.methods
        .withdraw(new BN(amount.toString()))
        .accounts({ tokenMint })
        .rpc();
    },
    onSuccess: (tx) => {
      callback?.();
      transactionToast(tx);
      return balanceQuery.refetch().then(() => callback?.());
    },
  });

  const close = useMutation({
    mutationKey: ['store', 'close', { cluster, storePda }],
    mutationFn: () => {
      if (!storeQuery.data?.mint) throw new Error('Store not initialized');

      const tokenMint = storeQuery.data.mint;
      return program.methods.close().accounts({ tokenMint }).rpc();
    },
    onSuccess: (tx) => {
      callback?.();
      transactionToast(tx);
      return stores.refetch().then(() => callback?.());
    },
  });

  // ------------------- return ---------------------
  return {
    storeQuery,
    vaultQuery,
    balanceQuery,

    vaultPDA,
    token: tokenQuery.token,
    isOwner,

    initVault,
    deposit,
    update,
    sell,
    withdraw,
    close,
  };
}
