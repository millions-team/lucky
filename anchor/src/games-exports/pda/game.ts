import { type Cluster, PublicKey } from '@solana/web3.js';
import { GAME_SEED, getGamesProgramId } from '..';

export function getGamePDA(
  owner: PublicKey,
  secret: PublicKey,
  cluster?: Cluster
) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(GAME_SEED, 'utf8'), owner.toBuffer(), secret.toBuffer()],
    getGamesProgramId(cluster)
  )[0];
}
