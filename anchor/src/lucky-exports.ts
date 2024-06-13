// Here we export some useful types and functions for interacting with the Anchor program.
import { Cluster, PublicKey } from '@solana/web3.js';
import type { Lucky } from '../target/types/lucky';
import { IDL as LuckyIDL } from '../target/types/lucky';

// Re-export the generated IDL and type
export { Lucky, LuckyIDL };

// After updating your program ID (e.g. after running `anchor keys sync`) update the value below.
export const LUCKY_PROGRAM_ID = new PublicKey(
  '6VCjdiYiU9rAWo7TptZMa423j44GSnyzWMG2KbCCdUz8'
);

// This is a helper function to get the program ID for the Lucky program depending on the cluster.
export function getLuckyProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
    case 'mainnet-beta':
    default:
      return LUCKY_PROGRAM_ID;
  }
}

export function getLuckyPlayerPDA(key: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('LUCKY_GAME', 'utf8'), key.toBytes()],
    LUCKY_PROGRAM_ID
  )[0];
}

export function getLuckyBountyPDA() {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('LUCKY_BOUNTY', 'utf8')],
    LUCKY_PROGRAM_ID
  )[0];
}

export function getLuckyVaultPDA() {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('LUCKY_VAULT', 'utf8')],
    LUCKY_PROGRAM_ID
  )[0];
}

export type DealerOptions = {
  slots: number;
  choices: number;
  luckyShoot: boolean;
};

export const MIN = 100000;
export const MAX = 1000000;
