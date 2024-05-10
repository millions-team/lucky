// Here we export some useful types and functions for interacting with the Anchor program.
import { Cluster, PublicKey } from '@solana/web3.js';
import type { Dealer } from '../target/types/dealer';
import { IDL as DealerIDL } from '../target/types/dealer';

// Re-export the generated IDL and type
export { Dealer, DealerIDL };

// After updating your program ID (e.g. after running `anchor keys sync`) update the value below.
export const DEALER_PROGRAM_ID = new PublicKey(
  'GM7wCpnL7eqrgTzkce6hn4YG6r4gh5g4mahFkZ3edEJ7'
);

// This is a helper function to get the program ID for the Dealer program depending on the cluster.
export function getDealerProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
    case 'mainnet-beta':
    default:
      return DEALER_PROGRAM_ID;
  }
}

export function getDealerPDA(key: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('DEALER', 'utf8'), key.toBytes()],
    DEALER_PROGRAM_ID
  )[0];
}
