import { type Cluster, PublicKey } from '@solana/web3.js';
import { GAME_MODE_SEED, getGamesProgramId } from '..';

export function getGameModePDA(
  game: PublicKey,
  modeSeed: string,
  cluster?: Cluster
) {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(GAME_MODE_SEED, 'utf8'),
      game.toBuffer(),
      Buffer.from(modeSeed, 'utf8'),
    ],
    getGamesProgramId(cluster)
  )[0];
}
