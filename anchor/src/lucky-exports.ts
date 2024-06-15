// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { Cluster, PublicKey } from '@solana/web3.js';
import LuckyIDL from '../target/idl/lucky.json';
import type { Lucky } from '../target/types/lucky';

// Re-export the generated IDL and type
export { Lucky, LuckyIDL };

// The programId is imported from the program IDL.
export const LUCKY_PROGRAM_ID = new PublicKey(LuckyIDL.address);

// This is a helper function to get the Lucky Anchor program.
export function getLuckyProgram(provider: AnchorProvider) {
  return new Program(LuckyIDL as Lucky, provider);
}

// This is a helper function to get the program ID for the Lucky program depending on the cluster.
export function getLuckyProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Lucky program on devnet and testnet.
      return new PublicKey('6VCjdiYiU9rAWo7TptZMa423j44GSnyzWMG2KbCCdUz8');
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
