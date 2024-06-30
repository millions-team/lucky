import { type Cluster, PublicKey } from '@solana/web3.js';
import { getGamesProgramId, PLAYER_SEED } from '..';

export function getPlayerPDA(owner: PublicKey, cluster?: Cluster) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(PLAYER_SEED, 'utf8'), owner.toBytes()],
    getGamesProgramId(cluster)
  )[0];
}
