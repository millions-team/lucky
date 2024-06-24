'use client';

import { createContext, useContext } from 'react';
import { PublicKey } from '@solana/web3.js';

import { atomWithStorage } from 'jotai/utils';
import { atom } from 'jotai/index';
import { useAtomValue, useSetAtom } from 'jotai';

type GamePDA = string;
export interface GameModeSeed {
  mode: string;
  pda: PublicKey;
}
export interface GameSeeds {
  owner: PublicKey;
  secret: PublicKey;
  modes: Array<GameModeSeed>;
}

type Games = Record<GamePDA, GameSeeds>;
const defaultGames: Games = {};

const gamesAtom = atomWithStorage<Games>('games-seeds', defaultGames);
const activeGamesAtom = atom<Games>((get) => get(gamesAtom));

export interface GamesProviderContext {
  games: Games;
  getGame: (game: PublicKey) => GameSeeds;
  getMode: (game: PublicKey, mode: PublicKey) => GameModeSeed;
  addGame: (game: PublicKey, seeds: GameSeeds) => void;
  addMode: (game: PublicKey, seed: GameModeSeed) => void;
  deleteGame: (game: PublicKey) => void;
  deleteMode: (game: PublicKey, mode: PublicKey) => void;
}

const Context = createContext<GamesProviderContext>({} as GamesProviderContext);

export function GamesProvider({ children }: { children: React.ReactNode }) {
  const games = useAtomValue(activeGamesAtom);
  const setGames = useSetAtom(gamesAtom);

  const getGame = (game: PublicKey) => {
    const seeds = games[game.toString()];
    if (!seeds) throw new Error('Game does not exist');

    return seeds;
  };

  const value: GamesProviderContext = {
    games,
    getGame,
    getMode: (game: PublicKey, mode: PublicKey) => {
      const seeds = getGame(game);
      if (seeds.modes?.length === 0) throw new Error('No modes exist');

      const modePDA = mode.toString();
      const modeSeed = seeds.modes.find(
        ({ pda }) => pda.toString() === modePDA
      );
      if (!modeSeed) throw new Error('Mode does not exist');

      return modeSeed;
    },
    addGame: (game: PublicKey, seeds: GameSeeds) => {
      const gamePDA = game.toString();
      if (games[gamePDA]) throw new Error('Game already exists');

      setGames((current) => ({ ...current, [gamePDA]: seeds }));
    },
    addMode: (game: PublicKey, { mode, pda }) => {
      const seeds = getGame(game);

      setGames((current) => {
        return {
          ...current,
          [game.toString()]: {
            ...seeds,
            modes: [...seeds.modes, { mode, pda }],
          },
        };
      });
    },
    deleteGame: (game: PublicKey) => {
      const gamePDA = game.toString();
      if (!games[gamePDA]) throw new Error('Game does not exist');

      setGames((current) => {
        const { [gamePDA]: _, ...rest } = current;
        return rest;
      });
    },
    deleteMode: (game: PublicKey, mode: PublicKey) => {
      const seeds = getGame(game);
      const modePDA = mode.toString();

      setGames((current) => {
        return {
          ...current,
          [game.toString()]: {
            ...seeds,
            modes: seeds.modes.filter(({ pda }) => pda.toString() !== modePDA),
          },
        };
      });
    },
  };

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useGames() {
  return useContext(Context);
}
