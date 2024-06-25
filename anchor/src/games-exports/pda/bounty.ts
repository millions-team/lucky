import { type Cluster, PublicKey } from '@solana/web3.js';
import { BOUNTY_SEED, getGamesProgramId } from '..';

export function getBountyPDA(
  gem: PublicKey,
  task: PublicKey,
  cluster?: Cluster
) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(BOUNTY_SEED, 'utf8'), gem.toBytes(), task.toBytes()],
    getGamesProgramId(cluster)
  )[0];
}
