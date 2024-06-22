'use client';

import { useMemo } from 'react';
import { Cluster, Keypair, PublicKey } from '@solana/web3.js';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { useAnchorProvider } from '@/providers';
import {
  type GameSettings,
  getGamePDA,
  getGamesProgram,
  getGamesProgramId,
} from '@luckyland/anchor';

import { useCluster } from '../cluster/cluster-data-access';
import { useTransactionToast } from '../ui/ui-layout';
import { useGames } from '@/app/games/_provider/games-provider';

export function useGamesProgram({ callback }: { callback?: () => void }) {
  const { publicKey: owner } = useWallet();
  const { addGame } = useGames();
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const programId = useMemo(
    () => getGamesProgramId(cluster.network as Cluster),
    [cluster]
  );
  const program = getGamesProgram(provider);

  const games = useQuery({
    queryKey: ['games', 'all', { cluster }],
    queryFn: () => program.account.game.all(),
  });

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster, programId }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  const createGame = useMutation({
    mutationKey: ['games', 'create-game', { cluster }],
    mutationFn: async (settings: GameSettings) => {
      const secret = Keypair.generate();
      return {
        signature: await program.methods
          .createGame(settings)
          .accounts({ secret: secret.publicKey })
          .rpc(),
        secret: secret.publicKey,
      };
    },
    onSuccess: ({ signature, secret }) => {
      transactionToast(signature);

      if (!owner) throw new Error('Wallet not connected');
      const gamePDA = getGamePDA(owner, secret, cluster.network as Cluster);
      addGame(gamePDA, { owner, secret });

      return games.refetch().then(() => callback?.());
    },
    onError: (error, variables, context) => {
      console.log('Failed to createGame account', error, variables, context);
      toast.error('Failed to createGame account');
    },
  });

  return {
    program,
    programId,
    games,
    getProgramAccount,
    createGame,
  };
}

export function useGamesProgramAccount({ game }: { game: PublicKey }) {
  const { cluster } = useCluster();
  const { getGame, deleteGame } = useGames();
  const transactionToast = useTransactionToast();
  const { program, games } = useGamesProgram({});

  const gameQuery = useQuery({
    queryKey: ['games', 'fetch', { cluster, game }],
    queryFn: () => program.account.game.fetch(game),
  });

  const update = useMutation({
    mutationKey: ['games', 'update', { cluster, game }],
    mutationFn: (settings: GameSettings) => {
      const { secret } = getGame(game);
      return program.methods.updateGame(settings).accounts({ secret }).rpc();
    },
    onSuccess: (tx) => {
      transactionToast(tx);
      return gameQuery.refetch();
    },
  });

  const close = useMutation({
    mutationKey: ['games', 'close', { cluster, game }],
    mutationFn: () => {
      const { secret } = getGame(game);
      return program.methods.closeGame().accounts({ secret }).rpc();
    },
    onSuccess: (tx) => {
      transactionToast(tx);
      deleteGame(game);
      return games.refetch();
    },
  });

  return {
    gameQuery,
    close,
    update,
  };
}
