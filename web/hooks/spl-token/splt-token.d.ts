import { PublicKey } from '@solana/web3.js';

export interface Token {
  name: string;
  symbol: string;
  address: string;
  mint: PublicKey;
  metadata?: any;
  decimals: number;
  amount?: number;
}
