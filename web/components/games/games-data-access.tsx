'use client';

import { useMemo } from 'react';
import { Cluster, Keypair, PublicKey } from '@solana/web3.js';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { useAnchorProvider } from '@/providers';
import {
  encodeName,
  type GameMode,
  getGameModePDA,
  getGamePDA,
  getGamesProgram,
  getGamesProgramId,
} from '@luckyland/anchor';

import { useCluster } from '../cluster/cluster-data-access';
import { useTransactionToast } from '../ui/ui-layout';
import { useGames } from '@/app/games/_provider/games-provider';

export function useGamesProgram({ callback }: { callback?: () => void }) {
  const { publicKey: owner } = useWallet();
  const { addGame, getGame, addMode } = useGames();
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
    queryFn: async () => {
      const games = await program.account.game.all();
      const modes = await program.account.gameMode.all();

      return games.map((game) => {
        const gameModes = modes.filter((mode) =>
          mode.account.game.equals(game.publicKey)
        );
        return { ...game, modes: gameModes };
      });
    },
  });

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster, programId }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  const createGame = useMutation({
    mutationKey: ['games', 'create-game', { cluster }],
    mutationFn: async ({
      name,
      seed,
    }: {
      name: Array<number>;
      seed?: string;
    }) => {
      const secret = seed ? new PublicKey(seed) : Keypair.generate().publicKey;

      if (!owner) throw new Error('Wallet not connected');
      const gamePDA = getGamePDA(owner, secret, cluster.network as Cluster);

      return {
        signature: await program.methods
          .createGame(name)
          .accounts({ secret })
          .rpc(),
        secret,
        gamePDA,
      };
    },
    onSuccess: ({ signature, gamePDA, secret }) => {
      transactionToast(signature);

      if (!owner) throw new Error('Wallet not connected');
      addGame(gamePDA, { owner, secret, modes: [] });

      return games.refetch().then(() => callback?.());
    },
    onError: (error, variables, context) => {
      console.log('Failed to create Game account', error, variables, context);
      toast.error('Failed to create Game account');
    },
  });

  const createGameMode = useMutation({
    mutationKey: ['games', 'create-game-mode', { cluster }],
    mutationFn: async ({
      gamePDA,
      settings,
    }: {
      gamePDA: PublicKey;
      settings: GameMode;
    }) => {
      const { secret, modes } = getGame(gamePDA);
      const seed = (modes.length + 1).toString();

      return {
        signature: await program.methods
          .addGameMode(seed, settings)
          .accounts({ secret })
          .rpc(),
        seed,
        gamePDA,
      };
    },
    onSuccess: ({ signature, seed, gamePDA }) => {
      transactionToast(signature);

      const pda = getGameModePDA(gamePDA, seed, cluster.network as Cluster);
      addMode(gamePDA, { mode: seed, pda });

      return games.refetch().then(() => callback?.());
    },
    onError: (error, variables, context) => {
      console.log(
        'Failed to create Game Mode account',
        error,
        variables,
        context
      );
      toast.error('Failed to create Game Mode account');
    },
  });

  return {
    program,
    programId,
    games,
    getProgramAccount,
    createGame,
    createGameMode,
  };
}

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

    const { owner } = getGame(pda);
    return owner.toString() === publicKey.toString();
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

export function useGameModeAccount({ pda }: { pda: PublicKey }) {
  const { publicKey } = useWallet();
  const { cluster } = useCluster();
  const { getGame, getMode, deleteMode } = useGames();
  const transactionToast = useTransactionToast();
  const { program, games } = useGamesProgram({});

  const modeQuery = useQuery({
    queryKey: ['game-mode', 'fetch', { cluster, pda }],
    queryFn: async () => program.account.gameMode.fetch(pda),
  });

  const isOwner = useMemo(() => {
    if (!modeQuery.data || !publicKey) return false;

    const { owner } = getGame(modeQuery.data.game);
    return owner.toString() === publicKey.toString();
  }, [modeQuery.data]);

  const update = useMutation({
    mutationKey: ['game-mode', 'update', { cluster, pda }],
    mutationFn: (settings: GameMode) => {
      if (!modeQuery.data) throw new Error('Game not found');

      const { secret } = getGame(modeQuery.data.game);
      const { mode: seed } = getMode(modeQuery.data.game, pda);

      return program.methods
        .updateGameMode(seed, settings)
        .accounts({ secret })
        .rpc();
    },
    onSuccess: (tx) => {
      transactionToast(tx);
      return modeQuery.refetch();
    },
  });

  const close = useMutation({
    mutationKey: ['game-mode', 'close', { cluster, pda }],
    mutationFn: () => {
      if (!modeQuery.data) throw new Error('Game not found');

      const { secret } = getGame(modeQuery.data.game);
      const { mode: seed } = getMode(modeQuery.data.game, pda);

      return program.methods.closeGameMode(seed).accounts({ secret }).rpc();
    },
    onSuccess: (tx) => {
      transactionToast(tx);
      if (!modeQuery.data) throw new Error('Game not found');

      deleteMode(modeQuery.data.game, pda);
      return games.refetch();
    },
  });

  return {
    isOwner,
    modeQuery,
    update,
    close,
  };
}
