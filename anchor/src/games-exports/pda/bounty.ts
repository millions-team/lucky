import { type Cluster, PublicKey } from '@solana/web3.js';
import { BOUNTY_SEED, getGamesProgramId } from '..';

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
