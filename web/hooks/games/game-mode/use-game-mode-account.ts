import { useMemo } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { useMutation, useQuery } from '@tanstack/react-query';

import { useGames, useCluster } from '@/providers';
import { useTransactionToast } from '@/components/ui/ui-layout';

import { type GameMode } from '@luckyland/anchor';
import { useGamesProgram } from '..';

export function useGameModeAccount({ pda }: { pda: PublicKey }) {
  const { publicKey } = useWallet();
  const { cluster } = useCluster();
  const { getGame, getMode, deleteMode } = useGames();
  const transactionToast = useTransactionToast();
  const { program, games } = useGamesProgram({});

  const modeQuery = useQuery({
    queryKey: ['game-mode', 'fetch', { cluster, pda }],
    queryFn: async () => {
      if (games.isPending || !games?.data) throw new Error('Games not loaded');

      const mode = await program.account.gameMode.fetch(pda);
      const game = games.data.find((game) => game.publicKey.equals(mode.game));
      if (!game) throw new Error('Game not found');
      const _mode = game.modes.find((mode) => mode.publicKey.equals(pda));
      if (!_mode) throw new Error('Mode not found');
      const { bounties } = _mode;

      return { ...mode, _game: game, bounties };
    },
  });

  const isOwner = useMemo(() => {
    if (!modeQuery.data || !publicKey) return false;

    try {
      const { owner } = getGame(modeQuery.data.game);
      return owner.toString() === publicKey.toString();
    } catch (e) {
      return false;
    }
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
