'use client';

import { useMemo } from 'react';
import { Cluster } from '@solana/web3.js';

import { getTollkeeperPDA } from '@luckyland/anchor';

import { useCluster } from '@/providers';
import { useGamesProgram } from '@/hooks';

export function useEscrowProgram(props: { callback?: () => void } = {}) {
  const { cluster } = useCluster();
  const { program, programId, getProgramAccount } = useGamesProgram();

  const tollkeeperPDA = useMemo(
    () => getTollkeeperPDA(cluster.network as Cluster),
    [cluster.network]
  );

  return {
    program,
    programId,
    getProgramAccount,
    tollkeeperPDA,
  };
}
