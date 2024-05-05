// Here we export some useful types and functions for interacting with the Anchor program.
import { Cluster, PublicKey } from '@solana/web3.js';
import type { Lucky } from '../target/types/lucky';
import { IDL as LuckyIDL } from '../target/types/lucky';

// Re-export the generated IDL and type
export { Lucky, LuckyIDL };

// After updating your program ID (e.g. after running `anchor keys sync`) update the value below.
export const LUCKY_PROGRAM_ID = new PublicKey(
  '79UvKxp3h9Dci5cHVRagBcxB2GzSUkdqQRFYBAhzA3NY'
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
