// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { Cluster, PublicKey } from '@solana/web3.js';
import PresaleIDL from '../target/idl/presale.json';
import type { Presale } from '../target/types/presale';

// Re-export the generated IDL and type
export { Presale, PresaleIDL };

// The programId is imported from the program IDL.
export const PRESALE_PROGRAM_ID = new PublicKey(PresaleIDL.address);

// This is a helper function to get the Presale Anchor program.
export function getPresaleProgram(provider: AnchorProvider) {
  return new Program(PresaleIDL as Presale, provider);
}

// This is a helper function to get the program ID for the Presale program depending on the cluster.
export function getPresaleProgramId(cluster?: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
    case 'mainnet-beta':
    default:
      return PRESALE_PROGRAM_ID;
  }
}

const SALE_SEED = 'SALE';
const VAULT_SEED = 'SALE_VAULT';
const KEEPER_SEED = 'SALE_KEEPER';

export function getSalePDA(token: PublicKey, cluster?: Cluster) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(SALE_SEED, 'utf8'), token.toBytes()],
    getPresaleProgramId(cluster)
  )[0];
}

export function getSaleVaultPDA(token: PublicKey, cluster?: Cluster) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(VAULT_SEED, 'utf8'), token.toBytes()],
    getPresaleProgramId(cluster)
  )[0];
}

export function getSaleKeeperPDA(cluster?: Cluster) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(KEEPER_SEED, 'utf8')],
    getPresaleProgramId(cluster)
  )[0];
}

export function getBuyerVaultPDA(
  token: PublicKey,
  buyer: PublicKey,
  cluster?: Cluster
) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(VAULT_SEED, 'utf8'), token.toBytes(), buyer.toBytes()],
    getPresaleProgramId(cluster)
  )[0];
}
