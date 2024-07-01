import { Connection, PublicKey } from '@solana/web3.js';
import { getAccount } from '@solana/spl-token';

import {
  type Portal,
  type Cluster,
  confirmAndLogTransaction,
} from '../../utils';

import { getToken } from '@utils/token';
import { getCollectorPDA, getTollkeeperPDA } from '@luckyland/anchor';

async function getCollector(pda: PublicKey, connection: Connection) {
  try {
    return await getAccount(connection, pda);
  } catch (e) {
    return null;
  }
}

export async function LaunchTrader(
  { portal }: Portal,
  trader: PublicKey,
  cluster: Cluster
) {
  console.log('------------------ Escrow ------------------');
  console.log('Retrieving trader details...');

  const market = portal.provider.connection;
  const token = await getToken(trader, market);
  const { name, symbol } = token;

  console.log(
    `Launching collector for ${name} ($${symbol}) trader on ${cluster.name} market`
  );

  const treasurePDA = getTollkeeperPDA(cluster.asCluster());
  const collectorPDA = getCollectorPDA(trader, cluster.asCluster());
  console.log('Tollkeeper: ' + treasurePDA);
  console.log('Collector: ' + collectorPDA);
  console.log('Verifying collector...');
  let collector = await getCollector(collectorPDA, portal.provider.connection);

  if (collector) {
    console.log('Collector already exists.');
    console.log('Collector owner: ' + collector.owner);
    return { pda: collectorPDA, collector, trader: token };
  }

  console.log('Collector not found. Launching trader...');
  const confirmOptions = { skipPreflight: true };
  const txHash = await portal.methods
    .launchEscrow()
    .accounts({ trader })
    .rpc(confirmOptions);
  await confirmAndLogTransaction(txHash, portal.provider.connection, cluster);

  collector = await getCollector(collectorPDA, portal.provider.connection);
  console.log('Collector created.');
  console.log('Collector owner: ' + collector.owner);

  return { pda: collectorPDA, collector, trader: token };
}
