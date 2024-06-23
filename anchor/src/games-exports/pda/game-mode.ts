import { type Cluster, PublicKey } from '@solana/web3.js';
import { GAME_MODE_SEED, getGamesProgramId } from '..';

export function getGameModePDA(
  owner: PublicKey,
  secret: PublicKey,
  cluster?: Cluster
) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(GAME_MODE_SEED, 'utf8'), owner.toBuffer(), secret.toBuffer()],
    getGamesProgramId(cluster)
  )[0];
}
