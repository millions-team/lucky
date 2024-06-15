// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { Cluster, PublicKey } from '@solana/web3.js';
import VaultIDL from '../target/idl/vault.json';
import type { Vault } from '../target/types/vault';

// Re-export the generated IDL and type
export { Vault, VaultIDL };

// The programId is imported from the program IDL.
export const VAULT_PROGRAM_ID = new PublicKey(VaultIDL.address);

// This is a helper function to get the Vault Anchor program.
export function getVaultProgram(provider: AnchorProvider) {
  return new Program(VaultIDL as Vault, provider);
}

// This is a helper function to get the program ID for the Vault program depending on the cluster.
export function getVaultProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Vault program on devnet and testnet.
      return new PublicKey('EJkF6ZLAq9WtmeoSnM2BEuVygS7WUjbq1KQP5xWW7Sgb');
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
