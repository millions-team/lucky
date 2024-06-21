// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { Cluster, PublicKey } from '@solana/web3.js';
import StoreIDL from '../target/idl/store.json';
import type { Store } from '../target/types/store';

// Re-export the generated IDL and type
export { Store, StoreIDL };

// The programId is imported from the program IDL.
export const STORE_PROGRAM_ID = new PublicKey(StoreIDL.address);

// This is a helper function to get the Store Anchor program.
export function getStoreProgram(provider: AnchorProvider) {
  return new Program(StoreIDL as Store, provider);
}

// This is a helper function to get the program ID for the Store program depending on the cluster.
export function getStoreProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
    case 'mainnet-beta':
    default:
      return STORE_PROGRAM_ID;
  }
}

export function getMintAuthorityPDA(cluster?: Cluster) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(MINT_SEED, 'utf8')],
    getStoreProgramId(cluster)
  )[0];
}

export function getStoreVaultPDA(store: PublicKey, cluster?: Cluster) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(VAULT_SEED, 'utf8'), store.toBytes()],
    getStoreProgramId(cluster)
  )[0];
}

export function getStorePDA(
  owner: PublicKey,
  mint: PublicKey,
  cluster?: Cluster
) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(STORE_SEED, 'utf8'), owner.toBytes(), mint.toBytes()],
    getStoreProgramId(cluster)
  )[0];
}

const MINT_SEED = 'LUCKY_STORE_MINT_AUTHORITY';
const VAULT_SEED = 'LUCKY_STORE_VAULT';
const STORE_SEED = 'LUCKY_STORE';
