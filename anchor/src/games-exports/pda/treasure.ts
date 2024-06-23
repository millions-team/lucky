import { type Cluster, PublicKey } from '@solana/web3.js';
import { getGamesProgramId, KEEPER_SEED, VAULT_SEED } from '..';

export function getKeeperPDA(cluster?: Cluster) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(KEEPER_SEED, 'utf8')],
    getGamesProgramId(cluster)
  )[0];
}

export function getStrongholdPDA(gem: PublicKey, cluster?: Cluster) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(VAULT_SEED, 'utf8'), gem.toBytes()],
    getGamesProgramId(cluster)
  )[0];
}
