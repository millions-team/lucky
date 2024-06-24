import { PublicKey } from '@solana/web3.js';

export type GameMode = {
  game: PublicKey;
  slots: number;
  digits: number;
  choices: number;
  winnerChoice: number;
  pickWinner: boolean;
};
