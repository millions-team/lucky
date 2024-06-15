'use client';

import {
  type DealerOptions,
  getLuckyProgramId,
  getLuckyBountyPDA,
  getLuckyVaultPDA,
  getLuckyProgram,
} from '@luckyland/anchor';
import { useConnection } from '@solana/wallet-adapter-react';
import { Cluster, PublicKey } from '@solana/web3.js';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import toast from 'react-hot-toast';
import { useCluster } from '../cluster/cluster-data-access';
import { useAnchorProvider } from '../solana/solana-provider';
import { useTransactionToast } from '../ui/ui-layout';

export function useLuckyProgram(cb?: { refetch?: () => void | Promise<void> }) {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const programId = useMemo(
    () => getLuckyProgramId(cluster.network as Cluster),
    [cluster]
  );
  const program = getLuckyProgram(provider);
  const bountyPDA = useMemo(() => getLuckyBountyPDA(), []);
  const vaultPDA = useMemo(() => getLuckyVaultPDA(), []);

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  const initialize = useMutation({
    mutationKey: ['lucky', 'initialize', { cluster }],
    mutationFn: (player: PublicKey) =>
      program.methods.initialize().accounts({}).rpc(),
    onSuccess: (signature) => {
      transactionToast(signature);
      cb?.refetch && cb.refetch();
    },
    onError: () => toast.error('Failed to initialize account'),
  });

  return {
    program,
    programId,
    getProgramAccount,
    initialize,
    bountyPDA,
    vaultPDA,
  };
}

export function useLuckyProgramAccount({
  account: player,
}: {
  account: PublicKey;
}) {
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const cb = { refetch: () => {} };
  const { program, bountyPDA, vaultPDA } = useLuckyProgram(cb);

  const accountQuery = useQuery({
    queryKey: ['lucky', 'fetch', { cluster, player }],
    queryFn: () => program.account.lucky.fetch(player),
  });
  cb.refetch = accountQuery.refetch;

  const closeMutation = useMutation({
    mutationKey: ['lucky', 'close', { cluster, player }],
    mutationFn: () => program.methods.close().accounts({}).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx);
      cb.refetch();
    },
  });

  const playMutation = useMutation({
    mutationKey: ['lucky', 'set', { cluster, player }],
    mutationFn: (options: DealerOptions) =>
      program.methods.play(options).accounts({}).rpc(),
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

function winningProbability(slots: number, choices: number) {
  const P = Array.from({ length: slots }).reduce(
    (acc: number, curr) => acc * (1 / choices),
    1
  );

  return P;
}
