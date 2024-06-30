import { useMemo } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { useMutation, useQuery } from '@tanstack/react-query';

import { useGames, useCluster } from '@/providers';
import { useTransactionToast } from '@/components/ui/ui-layout';

import { encodeName, type GameMode } from '@luckyland/anchor';
import { useGamesProgram } from '..';

export function useGameAccount({
  pda,
  callback,
}: {
  pda: PublicKey;
  callback?: () => void;
}) {
  const { publicKey } = useWallet();
  const { cluster } = useCluster();
  const { getGame, deleteGame } = useGames();
  const transactionToast = useTransactionToast();
  const { program, games, createGameMode } = useGamesProgram({ callback });

  const isOwner = useMemo(() => {
    if (!publicKey) return false;

    try {
      const { owner } = getGame(pda);
      return owner.toString() === publicKey.toString();
    } catch (e) {
      return false;
    }
  }, [pda]);

  const gameQuery = useQuery({
    queryKey: ['game', 'fetch', { cluster, pda }],
    queryFn: async () => program.account.game.fetch(pda),
  });

  const update = useMutation({
    mutationKey: ['game', 'update', { cluster, pda }],
    mutationFn: (name: string) => {
      const { secret } = getGame(pda);
      return program.methods
        .updateGame(encodeName(name))
        .accounts({ secret })
        .rpc();
    },
    onSuccess: (tx) => {
      transactionToast(tx);
      return gameQuery.refetch();
    },
  });

  const activate = useMutation({
    mutationKey: ['game', 'activate', { cluster, pda }],
    mutationFn: () => {
      const { secret } = getGame(pda);
      return program.methods.activateGame().accounts({ secret }).rpc();
    },
    onSuccess: (tx) => {
      transactionToast(tx);
      return gameQuery.refetch();
    },
  });

  const pause = useMutation({
    mutationKey: ['game', 'pause', { cluster, pda }],
    mutationFn: () => {
      const { secret } = getGame(pda);
      return program.methods.pauseGame().accounts({ secret }).rpc();
    },
    onSuccess: (tx) => {
      transactionToast(tx);
      return gameQuery.refetch();
    },
  });

  const end = useMutation({
    mutationKey: ['game', 'end', { cluster, pda }],
    mutationFn: () => {
      const { secret } = getGame(pda);
      return program.methods.endGame().accounts({ secret }).rpc();
    },
    onSuccess: (tx) => {
      transactionToast(tx);
      return gameQuery.refetch();
    },
  });

  const close = useMutation({
    mutationKey: ['game', 'close', { cluster, pda }],
    mutationFn: () => {
      const { secret } = getGame(pda);
      return program.methods.closeGame().accounts({ secret }).rpc();
    },
    onSuccess: (tx) => {
      transactionToast(tx);
      deleteGame(pda);
      return games.refetch();
    },
  });

  return {
    isOwner,
    gameQuery,
    createGameMode: (settings: GameMode) =>
      createGameMode.mutateAsync({ gamePDA: pda, settings }),
    activate,
    update,
    pause,
    end,
    close,
  };
}
