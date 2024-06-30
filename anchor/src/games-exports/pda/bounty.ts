import { type Cluster, PublicKey } from '@solana/web3.js';
import { getGamesProgramId, BOUNTY_SEED, VAULT_SEED } from '..';

export function getBountyPDA(
  task: PublicKey,
  gem: PublicKey,
  trader: PublicKey,
  cluster?: Cluster
) {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(BOUNTY_SEED, 'utf8'),
      task.toBytes(),
      gem.toBytes(),
      trader.toBytes(),
    ],
    getGamesProgramId(cluster)
  )[0];
}

export function getBountyVaultPDA(bounty: PublicKey, cluster?: Cluster) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(VAULT_SEED, 'utf8'), bounty.toBytes()],
    getGamesProgramId(cluster)
  )[0];
}
