import { getTreasurePDA } from '@luckyland/anchor';
import {
  type Portal,
  type Cluster,
  confirmAndLogTransaction,
} from '../../utils';

export async function CreateTreasure({ portal }: Portal, cluster: Cluster) {
  console.log('------------------ Treasure ------------------');
  const treasurePDA = getTreasurePDA(cluster.asCluster());
  console.log('Treasure: ' + treasurePDA);
  console.log('Verifying treasure...');
  let treasure = await portal.account.treasure.fetchNullable(treasurePDA);

  if (treasure) {
    console.log('Treasure already exists.');
    console.log('Treasure owner: ' + treasure.authority.toBase58());
    return { pda: treasurePDA, treasure };
  }

  console.log('Treasure not found. Creating treasure...');
  const confirmOptions = { skipPreflight: true };
  const txHash = await portal.methods.createTreasure().rpc(confirmOptions);
  await confirmAndLogTransaction(txHash, portal.provider.connection, cluster);

  treasure = await portal.account.treasure.fetch(treasurePDA);
  console.log('Treasure created.');
  console.log('Treasure owner: ' + treasure.authority.toBase58());

  return { pda: treasurePDA, treasure };
}
