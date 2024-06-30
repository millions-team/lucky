import { type Cluster, PublicKey } from '@solana/web3.js';
import { getGamesProgramId, ESCROW_SEED, COLLECTOR_SEED } from '..';

export function getEscrowPDA(cluster?: Cluster) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(ESCROW_SEED, 'utf8')],
    getGamesProgramId(cluster)
  )[0];
}

export function getCollectorPDA(trader: PublicKey, cluster?: Cluster) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(COLLECTOR_SEED, 'utf8'), trader.toBytes()],
    getGamesProgramId(cluster)
  )[0];
}
