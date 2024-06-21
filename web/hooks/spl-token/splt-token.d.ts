import { PublicKey } from '@solana/web3.js';

export interface Token {
  mint: PublicKey;
  name: string;
  symbol: string;
  decimals: number;
  supply?: bigint;
  metadata?: any;
}

export interface TokenAccount extends Token {
  address: string;
  amount: number;
}
