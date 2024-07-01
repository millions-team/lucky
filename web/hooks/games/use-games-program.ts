import { useMemo } from 'react';
import { Cluster, Keypair, PublicKey } from '@solana/web3.js';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { useGames, useAnchorProvider, useCluster } from '@/providers';
import { useTransactionToast } from '@/hooks';

import {
  type GameMode,
  getGameModePDA,
  getGamePDA,
  getGamesProgram,
  getGamesProgramId,
} from '@luckyland/anchor';

export function useGamesProgram({ callback }: { callback?: () => void } = {}) {
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
  const program = useMemo(() => getGamesProgram(provider), [provider]);

  const games = useQuery({
    queryKey: ['games', 'all', { cluster }],
    queryFn: async () => {
      const games = await program.account.game.all();
      const modes = await program.account.gameMode.all();
      const bounties = await program.account.bounty.all();

      const _modes = modes.map((mode) => {
        const _bounties = bounties.filter(({ account: { task } }) =>
          task.equals(mode.publicKey)
        );
        return { ...mode, bounties: _bounties };
      });

      return games.map((game) => {
        const gameModes = _modes.filter((mode) =>
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
