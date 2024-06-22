'use client';

import { createContext, useContext } from 'react';
import { PublicKey } from '@solana/web3.js';

import { atomWithStorage } from 'jotai/utils';
import { atom } from 'jotai/index';
import { useAtomValue, useSetAtom } from 'jotai';

type GamePDA = string;
export interface GameSeeds {
  owner: PublicKey;
  secret: PublicKey;
}

type Games = Record<GamePDA, GameSeeds>;
const defaultGames: Games = {};

const gamesAtom = atomWithStorage<Games>('games-seeds', defaultGames);
const activeGamesAtom = atom<Games>((get) => get(gamesAtom));

export interface GamesProviderContext {
  games: Games;
  getGame: (game: PublicKey) => GameSeeds;
  addGame: (game: PublicKey, seeds: GameSeeds) => void;
  deleteGame: (game: PublicKey) => void;
}

const Context = createContext<GamesProviderContext>({} as GamesProviderContext);

export function GamesProvider({ children }: { children: React.ReactNode }) {
  const games = useAtomValue(activeGamesAtom);
  const setGames = useSetAtom(gamesAtom);

  const value: GamesProviderContext = {
    games,
    getGame: (game: PublicKey) => games[game.toString()],
    addGame: (game: PublicKey, seeds: GameSeeds) => {
      const gamePDA = game.toString();
      if (games[gamePDA]) throw new Error('Game already exists');

      setGames((current) => ({ ...current, [gamePDA]: seeds }));
    },
    deleteGame: (game: PublicKey) => {
      const gamePDA = game.toString();
      if (!games[gamePDA]) throw new Error('Game does not exist');

      setGames((current) => {
        const { [gamePDA]: _, ...rest } = current;
        return rest;
      });
    },
  };

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useGames() {
  return useContext(Context);
}
