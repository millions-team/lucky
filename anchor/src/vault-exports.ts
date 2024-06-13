// Here we export some useful types and functions for interacting with the Anchor program.
import { Cluster, PublicKey } from '@solana/web3.js';
import type { Vault } from '../target/types/vault';
import { IDL as VaultIDL } from '../target/types/vault';
import { metadata } from '../target/idl/vault.json';

// Re-export the generated IDL and type
export { Vault, VaultIDL };

// After updating your program ID (e.g. after running `anchor keys sync`) update the value below.
export const VAULT_PROGRAM_ID = new PublicKey(metadata.address);

// This is a helper function to get the program ID for the Lucky program depending on the cluster.
export function getVaultProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
    case 'mainnet-beta':
    default:
      return VAULT_PROGRAM_ID;
  }
}

export function getVaultAccountOwnerPDA() {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('token_account_owner_pda', 'utf8')],
    VAULT_PROGRAM_ID
  )[0];
}

export function getTokenVaultPDA(mint: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('token_vault', 'utf8'), mint.toBytes()],
    VAULT_PROGRAM_ID
  )[0];
}
